import React, {useMemo, useState} from 'react';

import {
  Alert,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import {
  MaterialDesignIcons,
} from '@react-native-vector-icons/material-design-icons/static';

import {useNavigation} from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import {
  colors,
  radius,
  spacing,
} from '../../theme';

import {
  useMaintenance,
  useVehicles,
} from '../../store';

import type {
  RootStackParamList,
} from '../../navigation/AppNavigator';

type MaintenanceNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

type IconName = React.ComponentProps<
  typeof MaterialDesignIcons
>['name'];

type StatusFilter =
  | 'All'
  | 'Scheduled'
  | 'In Progress'
  | 'Completed'
  | 'Overdue';

type PriorityFilter =
  | 'All'
  | 'High'
  | 'Medium'
  | 'Low';

type DateFilter =
  | 'all'
  | '1m'
  | '3m'
  | '6m'
  | '1y';

type FilterState = {
  status: StatusFilter;
  priority: PriorityFilter;
  vehicleId: string;
  date: DateFilter;
};

const ACCENT = colors.categories.maintenance;

const STATUS = {
  scheduled: '#F59E0B',
  inProgress: '#5B8CFF',
  completed: '#39E6C4',
  overdue: '#FF6685',
  fallback: '#6F7892',
} as const;

const PRIORITY = {
  high: '#FF6685',
  medium: '#FFC857',
  low: '#39E6C4',
} as const;

const SURFACES = {
  surface: 'rgba(18, 24, 46, 0.92)',
  elevated: 'rgba(20, 26, 49, 0.96)',
  stronger: '#10182B',
  border: colors.border,
  borderStrong: colors.borderStrong,
} as const;

const DATE_FILTERS: Array<{
  id: DateFilter;
  label: string;
  days: number | null;
}> = [
  {id: 'all', label: 'All time', days: null},
  {id: '1m', label: '1 month', days: 30},
  {id: '3m', label: '3 months', days: 90},
  {id: '6m', label: '6 months', days: 182},
  {id: '1y', label: '1 year', days: 365},
];

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const alpha = (
  hex: string,
  value: string,
) => `${hex}${value}`;

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Scheduled':
      return STATUS.scheduled;
    case 'In Progress':
      return STATUS.inProgress;
    case 'Completed':
      return STATUS.completed;
    default:
      return STATUS.fallback;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High':
      return PRIORITY.high;
    case 'Medium':
      return PRIORITY.medium;
    default:
      return PRIORITY.low;
  }
};

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getStartOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const isOverdueRecord = (
  record: {
    status: string;
    scheduledDate: string;
  },
  now = new Date(),
) => {
  if (record.status === 'Completed') {
    return false;
  }

  const scheduled = new Date(record.scheduledDate);

  if (Number.isNaN(scheduled.getTime())) {
    return false;
  }

  return (
    getStartOfDay(scheduled).getTime() <
    getStartOfDay(now).getTime()
  );
};

const getDateWindowDays = (
  date: DateFilter,
) => {
  return (
    DATE_FILTERS.find(item => item.id === date)
      ?.days ?? null
  );
};

type MaintenanceScreenProps = {
  onNavigateToDashboard?: () => void;
};

const MaintenanceScreen = ({
  onNavigateToDashboard,
}: MaintenanceScreenProps) => {
  const navigation =
    useNavigation<MaintenanceNavigationProp>();

  const {
    maintenanceRecords,
    deleteMaintenance,
  } = useMaintenance();

  const {vehicles} = useVehicles();

  const [searchQuery, setSearchQuery] =
    useState('');

  const [filters, setFilters] = useState<FilterState>({
    status: 'All',
    priority: 'All',
    vehicleId: 'All',
    date: 'all',
  });

  const [filtersExpanded, setFiltersExpanded] =
    useState(false);

  const now = new Date();

  const scheduledCount =
    maintenanceRecords.filter(
      record => record.status === 'Scheduled',
    ).length;

  const inProgressCount =
    maintenanceRecords.filter(
      record => record.status === 'In Progress',
    ).length;

  const completedCount =
    maintenanceRecords.filter(
      record => record.status === 'Completed',
    ).length;

  const overdueCount =
    maintenanceRecords.filter(record =>
      isOverdueRecord(record, now),
    ).length;

  const highPriorityCount =
    maintenanceRecords.filter(
      record => record.priority === 'High',
    ).length;

  const totalCost =
    maintenanceRecords.reduce(
      (total, record) =>
        total +
        (typeof record.cost === 'number'
          ? record.cost
          : 0),
      0,
    );

  const getVehicleRegistration = (
    vehicleId: string,
  ) => {
    const vehicle = vehicles.find(
      item => item.id === vehicleId,
    );

    return (
      vehicle?.registrationNumber ??
      'Unknown vehicle'
    );
  };

  const activeFilterCount =
    (filters.status !== 'All' ? 1 : 0) +
    (filters.priority !== 'All' ? 1 : 0) +
    (filters.vehicleId !== 'All' ? 1 : 0) +
    (filters.date !== 'all' ? 1 : 0);

  const filteredRecords = useMemo(() => {
    const normalizedSearch =
      searchQuery.trim().toLowerCase();

    const dateWindowDays =
      getDateWindowDays(filters.date);

    return maintenanceRecords.filter(record => {
      const registration = getVehicleRegistration(
        record.vehicleId,
      );

      const recordIsOverdue = isOverdueRecord(
        record,
        now,
      );

      const searchText = [
        record.title,
        record.description,
        registration,
        record.status,
        record.priority,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        normalizedSearch.length === 0 ||
        searchText.includes(normalizedSearch);

      const matchesStatus =
        filters.status === 'All' ||
        (filters.status === 'Overdue'
          ? recordIsOverdue
          : record.status === filters.status);

      const matchesPriority =
        filters.priority === 'All' ||
        record.priority === filters.priority;

      const matchesVehicle =
        filters.vehicleId === 'All' ||
        record.vehicleId === filters.vehicleId;

      const scheduledDate = new Date(
        record.scheduledDate,
      );

      const matchesDate =
        dateWindowDays === null ||
        (Number.isNaN(scheduledDate.getTime())
          ? false
          : Math.abs(
              getStartOfDay(scheduledDate).getTime() -
                getStartOfDay(now).getTime(),
            ) <=
            dateWindowDays * 24 * 60 * 60 * 1000);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesVehicle &&
        matchesDate
      );
    });
  }, [
    filters,
    maintenanceRecords,
    searchQuery,
    vehicles,
  ]);

  const clearFilters = () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.Presets.easeInEaseOut,
    );

    setFilters({
      status: 'All',
      priority: 'All',
      vehicleId: 'All',
      date: 'all',
    });
  };

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) => {
    LayoutAnimation.configureNext(
      LayoutAnimation.Presets.easeInEaseOut,
    );

    setFilters(current => ({
      ...current,
      [key]: value,
    }));
  };

  const toggleFilters = () => {
    LayoutAnimation.configureNext({
      duration: 240,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });

    setFiltersExpanded(value => !value);
  };

  const handleDelete = (
    maintenanceId: string,
    title: string,
  ) => {
    Alert.alert(
      'Delete Maintenance',
      `Are you sure you want to delete "${title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteMaintenance(maintenanceId);
          },
        },
      ],
    );
  };

  const formatCost = (value: number) =>
    `₹${Math.abs(value).toLocaleString('en-IN')}`;

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() =>
                onNavigateToDashboard?.()
              }
              style={({pressed}) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}>
              <MaterialDesignIcons
                name="arrow-left"
                size={20}
                color={colors.textPrimary}
              />
            </Pressable>

            <View style={styles.headerIcon}>
              <MaterialDesignIcons
                name="wrench-outline"
                size={21}
                color={ACCENT}
              />
            </View>

            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>
                FLEET CARE
              </Text>
              <Text style={styles.title}>
                Maintenance
              </Text>
              <Text style={styles.subtitle}>
                Service readiness across the fleet
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add maintenance"
            onPress={() =>
              navigation.navigate('AddMaintenance')
            }
            style={({pressed}) => [
              styles.addHeaderButton,
              pressed && styles.pressed,
            ]}>
            <MaterialDesignIcons
              name="plus"
              size={18}
              color={colors.black}
            />
            <Text style={styles.addHeaderText}>
              Add
            </Text>
          </Pressable>
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard
            icon="wrench-outline"
            label="Records"
            value={maintenanceRecords.length}
            color={ACCENT}
          />
          <MetricCard
            icon="calendar-outline"
            label="Scheduled"
            value={scheduledCount}
            color={STATUS.scheduled}
          />
          <MetricCard
            icon="progress-clock"
            label="In progress"
            value={inProgressCount}
            color={STATUS.inProgress}
          />
          <MetricCard
            icon="alert-circle-outline"
            label="Overdue"
            value={overdueCount}
            color={STATUS.overdue}
          />
          <MetricCard
            icon="check-circle-outline"
            label="Completed"
            value={completedCount}
            color={STATUS.completed}
          />
          <MetricCard
            icon="cash-outline"
            label="Total cost"
            value={formatCost(totalCost)}
            color={colors.electricCyan}
          />
        </View>

        <View style={styles.controlsHeader}>
          <View style={styles.serviceCopy}>
            <Text style={styles.sectionEyebrow}>
              SERVICE LOG
            </Text>
            <Text style={styles.sectionTitle}>
              Maintenance records
            </Text>
          </View>

          <Text style={styles.resultCount}>
            {filteredRecords.length} shown
          </Text>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchField}>
            <MaterialDesignIcons
              name="magnify"
              size={19}
              color={colors.textMuted}
            />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search maintenance, vehicle…"
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              accessibilityLabel="Search maintenance records"
            />
            {searchQuery.length > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                onPress={() => setSearchQuery('')}
                style={styles.searchClearButton}>
                <MaterialDesignIcons
                  name="close"
                  size={16}
                  color={colors.textMuted}
                />
              </Pressable>
            )}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Toggle maintenance filters"
            onPress={toggleFilters}
            style={({pressed}) => [
              styles.filterToggle,
              filtersExpanded &&
                styles.filterToggleActive,
              pressed && styles.pressed,
            ]}>
            <MaterialDesignIcons
              name="tune-variant"
              size={18}
              color={
                filtersExpanded || activeFilterCount > 0
                  ? ACCENT
                  : colors.textSecondary
              }
            />
            <Text
              style={[
                styles.filterToggleText,
                (filtersExpanded ||
                  activeFilterCount > 0) &&
                  styles.filterToggleTextActive,
              ]}>
              Filters
            </Text>
            {activeFilterCount > 0 && (
              <View style={styles.filterCountBadge}>
                <Text style={styles.filterCountText}>
                  {activeFilterCount}
                </Text>
              </View>
            )}
            <MaterialDesignIcons
              name={
                filtersExpanded
                  ? 'chevron-up'
                  : 'chevron-down'
              }
              size={18}
              color={colors.textMuted}
            />
          </Pressable>
        </View>

        {filtersExpanded && (
          <View style={styles.filtersPanel}>
            <FilterSection
              title="Status"
              options={[
                'All',
                'Scheduled',
                'In Progress',
                'Completed',
                'Overdue',
              ]}
              selected={filters.status}
              onSelect={value =>
                updateFilter('status', value as StatusFilter)
              }
              getColor={value =>
                value === 'Overdue'
                  ? STATUS.overdue
                  : value === 'All'
                  ? colors.textSecondary
                  : getStatusColor(value)
              }
            />

            <FilterSection
              title="Priority"
              options={[
                'All',
                'High',
                'Medium',
                'Low',
              ]}
              selected={filters.priority}
              onSelect={value =>
                updateFilter(
                  'priority',
                  value as PriorityFilter,
                )
              }
              getColor={value =>
                value === 'All'
                  ? colors.textSecondary
                  : getPriorityColor(value)
              }
            />

            <FilterSection
              title="Window"
              options={DATE_FILTERS.map(item => item.label)}
              selected={
                DATE_FILTERS.find(
                  item => item.id === filters.date,
                )?.label ?? 'All time'
              }
              onSelect={label => {
                const selected = DATE_FILTERS.find(
                  item => item.label === label,
                );
                if (selected) {
                  updateFilter('date', selected.id);
                }
              }}
              getColor={() => ACCENT}
              horizontal
            />

            <View style={styles.vehicleFilterBlock}>
              <View style={styles.filterSectionHeader}>
                <Text style={styles.filterSectionTitle}>
                  Vehicle
                </Text>
                {filters.vehicleId !== 'All' && (
                  <Pressable
                    onPress={() =>
                      updateFilter('vehicleId', 'All')
                    }>
                    <Text style={styles.clearSmallText}>
                      Reset
                    </Text>
                  </Pressable>
                )}
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipScrollContent}>
                <FilterChip
                  label="All"
                  selected={filters.vehicleId === 'All'}
                  onPress={() =>
                    updateFilter('vehicleId', 'All')
                  }
                  color={colors.textSecondary}
                />
                {vehicles.map(vehicle => (
                  <FilterChip
                    key={vehicle.id}
                    label={vehicle.registrationNumber}
                    selected={
                      filters.vehicleId === vehicle.id
                    }
                    onPress={() =>
                      updateFilter(
                        'vehicleId',
                        vehicle.id,
                      )
                    }
                    color={ACCENT}
                  />
                ))}
              </ScrollView>
            </View>

            <View style={styles.filterFooter}>
              <Text style={styles.filterSummaryText}>
                {activeFilterCount === 0
                  ? 'All maintenance records'
                  : `${activeFilterCount} active filter${
                      activeFilterCount > 1 ? 's' : ''
                    }`}
              </Text>
              {activeFilterCount > 0 && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear maintenance filters"
                  onPress={clearFilters}
                  style={({pressed}) => [
                    styles.clearButton,
                    pressed && styles.pressed,
                  ]}>
                  <MaterialDesignIcons
                    name="filter-remove-outline"
                    size={16}
                    color={ACCENT}
                  />
                  <Text style={styles.clearButtonText}>
                    Clear
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

        {filteredRecords.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <MaterialDesignIcons
                name="wrench-outline"
                size={27}
                color={ACCENT}
              />
            </View>
            <Text style={styles.emptyTitle}>
              No matching maintenance
            </Text>
            <Text style={styles.emptyText}>
              Try a different search or clear your filters.
            </Text>
            {maintenanceRecords.length === 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add maintenance"
                onPress={() =>
                  navigation.navigate('AddMaintenance')
                }
                style={({pressed}) => [
                  styles.emptyAddButton,
                  pressed && styles.pressed,
                ]}>
                <MaterialDesignIcons
                  name="plus"
                  size={17}
                  color={colors.black}
                />
                <Text style={styles.emptyAddText}>
                  Add Maintenance
                </Text>
              </Pressable>
            ) : activeFilterCount > 0 ? (
              <Pressable
                onPress={clearFilters}
                style={({pressed}) => [
                  styles.emptySecondaryButton,
                  pressed && styles.pressed,
                ]}>
                <Text style={styles.emptySecondaryText}>
                  Clear filters
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          filteredRecords.map(record => {
            const recordOverdue = isOverdueRecord(
              record,
              now,
            );
            const statusColor = recordOverdue
              ? STATUS.overdue
              : getStatusColor(record.status);
            const priorityColor = getPriorityColor(
              record.priority,
            );
            const registration =
              getVehicleRegistration(record.vehicleId);

            return (
              <View
                key={record.id}
                style={styles.recordCard}>
                <View
                  style={[
                    styles.recordAccent,
                    {backgroundColor: statusColor},
                  ]}
                />

                <View style={styles.recordTopRow}>
                  <View style={styles.recordIdentity}>
                    <View style={styles.recordIcon}>
                      <MaterialDesignIcons
                        name="wrench-outline"
                        size={18}
                        color={ACCENT}
                      />
                    </View>

                    <View style={styles.recordTextBlock}>
                      <Text
                        style={styles.recordTitle}
                        numberOfLines={1}>
                        {record.title}
                      </Text>

                      <View style={styles.vehicleRow}>
                        <MaterialDesignIcons
                          name="truck-outline"
                          size={14}
                          color={colors.textMuted}
                        />
                        <Text
                          style={styles.vehicleText}
                          numberOfLines={1}>
                          {registration}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.badgeColumn}>
                    <StatusBadge
                      label={
                        recordOverdue
                          ? 'Overdue'
                          : record.status
                      }
                      color={statusColor}
                    />
                    <View
                      style={[
                        styles.priorityBadge,
                        {
                          backgroundColor: alpha(
                            priorityColor,
                            '12',
                          ),
                          borderColor: alpha(
                            priorityColor,
                            '26',
                          ),
                        },
                      ]}>
                      <View
                        style={[
                          styles.priorityDot,
                          {
                            backgroundColor:
                              priorityColor,
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.priorityText,
                          {color: priorityColor},
                        ]}>
                        {record.priority}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text
                  style={styles.description}
                  numberOfLines={3}>
                  {record.description}
                </Text>

                <View style={styles.detailGrid}>
                  <RecordDetail
                    icon="calendar-outline"
                    label="Scheduled"
                    value={formatDate(
                      record.scheduledDate,
                    )}
                  />
                  <RecordDetail
                    icon="counter"
                    label="Mileage"
                    value={
                      record.mileage !== undefined
                        ? `${record.mileage.toLocaleString('en-IN')} km`
                        : '—'
                    }
                  />
                  <RecordDetail
                    icon="cash-outline"
                    label="Cost"
                    value={
                      record.cost !== undefined
                        ? formatCost(record.cost)
                        : '—'
                    }
                    color={
                      record.cost !== undefined
                        ? ACCENT
                        : undefined
                    }
                  />
                </View>

                <View style={styles.actionsRow}>
                  <ActionButton
                    icon="eye-outline"
                    label="View"
                    onPress={() =>
                      navigation.navigate(
                        'MaintenanceDetails',
                        {maintenance: record},
                      )
                    }
                  />
                  <ActionButton
                    icon="pencil-outline"
                    label="Edit"
                    onPress={() =>
                      navigation.navigate(
                        'EditMaintenance',
                        {maintenance: record},
                      )
                    }
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${record.title}`}
                    onPress={() =>
                      handleDelete(
                        record.id,
                        record.title,
                      )
                    }
                    style={({pressed}) => [
                      styles.deleteAction,
                      pressed && styles.pressed,
                    ]}>
                    <MaterialDesignIcons
                      name="delete-outline"
                      size={18}
                      color={PRIORITY.high}
                    />
                  </Pressable>
                </View>
              </View>
            );
          })
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

type MetricCardProps = {
  icon: IconName;
  label: string;
  value: number | string;
  color: string;
};

const MetricCard = ({
  icon,
  label,
  value,
  color,
}: MetricCardProps) => (
  <View style={styles.metricCard}>
    <View
      style={[
        styles.metricIcon,
        {backgroundColor: alpha(color, '14')},
      ]}>
      <MaterialDesignIcons
        name={icon}
        size={16}
        color={color}
      />
    </View>
    <Text style={[styles.metricValue, {color}]}
      numberOfLines={1}
      adjustsFontSizeToFit>
      {value}
    </Text>
    <Text style={styles.metricLabel}>
      {label}
    </Text>
  </View>
);

type FilterSectionProps = {
  title: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  getColor: (value: string) => string;
  horizontal?: boolean;
};

const FilterSection = ({
  title,
  options,
  selected,
  onSelect,
  getColor,
  horizontal,
}: FilterSectionProps) => {
  const content = options.map(option => (
    <FilterChip
      key={option}
      label={option}
      selected={selected === option}
      onPress={() => onSelect(option)}
      color={getColor(option)}
    />
  ));

  return (
    <View style={styles.filterSectionBlock}>
      <Text style={styles.filterSectionTitle}>
        {title}
      </Text>
      {horizontal ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScrollContent}>
          {content}
        </ScrollView>
      ) : (
        <View style={styles.chipWrap}>
          {content}
        </View>
      )}
    </View>
  );
};

type FilterChipProps = {
  label: string;
  selected: boolean;
  color: string;
  onPress: () => void;
};

const FilterChip = ({
  label,
  selected,
  color,
  onPress,
}: FilterChipProps) => (
  <Pressable
    accessibilityRole="button"
    accessibilityState={{selected}}
    onPress={onPress}
    style={({pressed}) => [
      styles.filterChip,
      selected && {
        backgroundColor: alpha(color, '16'),
        borderColor: alpha(color, '48'),
      },
      pressed && styles.pressed,
    ]}>
    {selected && (
      <MaterialDesignIcons
        name="check"
        size={13}
        color={color}
      />
    )}
    <Text
      style={[
        styles.filterChipText,
        selected && {color},
      ]}>
      {label}
    </Text>
  </Pressable>
);

type StatusBadgeProps = {
  label: string;
  color: string;
};

const StatusBadge = ({
  label,
  color,
}: StatusBadgeProps) => (
  <View
    style={[
      styles.statusBadge,
      {
        backgroundColor: alpha(color, '14'),
        borderColor: alpha(color, '30'),
      },
    ]}>
    <View
      style={[
        styles.statusDot,
        {backgroundColor: color},
      ]}
    />
    <Text
      style={[
        styles.statusText,
        {color},
      ]}>
      {label}
    </Text>
  </View>
);

type RecordDetailProps = {
  icon: IconName;
  label: string;
  value: string;
  color?: string;
};

const RecordDetail = ({
  icon,
  label,
  value,
  color,
}: RecordDetailProps) => (
  <View style={styles.detailItem}>
    <MaterialDesignIcons
      name={icon}
      size={15}
      color={color ?? colors.textMuted}
    />
    <View style={styles.detailCopy}>
      <Text style={styles.detailLabel}>
        {label}
      </Text>
      <Text
        style={[
          styles.detailValue,
          color && {color},
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  </View>
);

type ActionButtonProps = {
  icon: IconName;
  label: string;
  onPress: () => void;
};

const ActionButton = ({
  icon,
  label,
  onPress,
}: ActionButtonProps) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={label}
    onPress={onPress}
    style={({pressed}) => [
      styles.actionButton,
      pressed && styles.pressed,
    ]}>
    <MaterialDesignIcons
      name={icon}
      size={17}
      color={colors.textSecondary}
    />
    <Text style={styles.actionText}>
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.sm,
    paddingBottom: 136,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },

  headerLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: spacing.touch,
    height: spacing.touch,
    borderRadius: radius.md,
    backgroundColor: SURFACES.stronger,
    borderWidth: 1,
    borderColor: SURFACES.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },

  headerIcon: {
    width: spacing.huge,
    height: spacing.huge,
    borderRadius: radius.lg,
    backgroundColor: alpha(ACCENT, '14'),
    borderWidth: 1,
    borderColor: alpha(ACCENT, '30'),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },

  headerCopy: {
    flex: 1,
    minWidth: 0,
  },

  eyebrow: {
    color: colors.textMuted,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
  },

  title: {
    marginTop: 2,
    color: colors.textPrimary,
    fontSize: 23,
    lineHeight: 27,
    fontWeight: '800',
    letterSpacing: -0.25,
  },

  subtitle: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },

  addHeaderButton: {
    minWidth: spacing.huge,
    height: spacing.touch,
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.button,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  addHeaderText: {
    marginLeft: 5,
    color: colors.black,
    fontSize: 11,
    fontWeight: '800',
  },

  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: spacing.section,
  },

  metricCard: {
    width: '30.5%',
    minHeight: 88,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: SURFACES.border,
    backgroundColor: SURFACES.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    marginHorizontal: 4,
  },

  metricIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },

  metricValue: {
    color: colors.textPrimary,
    fontSize: 17,
    lineHeight: 20,
    fontWeight: '800',
  },

  metricLabel: {
    marginTop: 1,
    color: colors.textMuted,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '700',
  },

  controlsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },

  serviceCopy: {
    flex: 1,
    minWidth: 0,
  },

  sectionEyebrow: {
    color: colors.textMuted,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '800',
    letterSpacing: 1.05,
  },

  sectionTitle: {
    marginTop: 2,
    color: colors.textPrimary,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
  },

  resultCount: {
    marginLeft: spacing.sm,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  searchField: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: spacing.md,
    borderRadius: radius.input,
    backgroundColor: SURFACES.surface,
    borderWidth: 1,
    borderColor: SURFACES.border,
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    marginLeft: spacing.sm,
    paddingVertical: 0,
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '500',
  },

  searchClearButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterToggle: {
    minHeight: 46,
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.input,
    backgroundColor: SURFACES.surface,
    borderWidth: 1,
    borderColor: SURFACES.border,
    flexDirection: 'row',
    alignItems: 'center',
  },

  filterToggleActive: {
    backgroundColor: alpha(ACCENT, '10'),
    borderColor: alpha(ACCENT, '38'),
  },

  filterToggleText: {
    marginLeft: 6,
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },

  filterToggleTextActive: {
    color: ACCENT,
  },

  filterCountBadge: {
    minWidth: 20,
    height: 20,
    marginLeft: 6,
    paddingHorizontal: 5,
    borderRadius: radius.pill,
    backgroundColor: alpha(ACCENT, '20'),
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterCountText: {
    color: ACCENT,
    fontSize: 9,
    fontWeight: '800',
  },

  filtersPanel: {
    backgroundColor: SURFACES.elevated,
    borderWidth: 1,
    borderColor: SURFACES.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },

  filterSectionBlock: {
    marginBottom: spacing.md,
  },

  filterSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },

  filterSectionTitle: {
    marginBottom: spacing.sm,
    color: colors.textSoft,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 0.55,
  },

  clearSmallText: {
    color: ACCENT,
    fontSize: 10,
    fontWeight: '800',
  },

  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  chipScrollContent: {
    paddingRight: spacing.sm,
  },

  filterChip: {
    minHeight: 36,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: SURFACES.stronger,
    borderWidth: 1,
    borderColor: SURFACES.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  filterChipText: {
    marginLeft: 0,
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
  },

  vehicleFilterBlock: {
    marginBottom: spacing.md,
  },

  filterFooter: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  filterSummaryText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },

  clearButton: {
    minHeight: 34,
    paddingHorizontal: spacing.md,
    borderRadius: radius.button,
    backgroundColor: alpha(ACCENT, '12'),
    borderWidth: 1,
    borderColor: alpha(ACCENT, '28'),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  clearButtonText: {
    marginLeft: 5,
    color: ACCENT,
    fontSize: 10,
    fontWeight: '800',
  },

  recordCard: {
    position: 'relative',
    overflow: 'hidden',
    marginBottom: spacing.md,
    padding: spacing.card,
    borderRadius: radius.card,
    backgroundColor: SURFACES.surface,
    borderWidth: 1,
    borderColor: SURFACES.border,
  },

  recordAccent: {
    position: 'absolute',
    left: 0,
    top: spacing.md,
    bottom: spacing.md,
    width: 3,
    borderRadius: 2,
  },

  recordTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  recordIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },

  recordIcon: {
    width: 40,
    height: 40,
    marginRight: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: alpha(ACCENT, '12'),
    borderWidth: 1,
    borderColor: alpha(ACCENT, '28'),
    alignItems: 'center',
    justifyContent: 'center',
  },

  recordTextBlock: {
    flex: 1,
    minWidth: 0,
  },

  recordTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '800',
  },

  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  vehicleText: {
    flex: 1,
    marginLeft: 4,
    color: colors.textSecondary,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
  },

  badgeColumn: {
    alignItems: 'flex-end',
    marginLeft: spacing.sm,
  },

  statusBadge: {
    minHeight: 26,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  statusText: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '800',
  },

  priorityBadge: {
    minHeight: 22,
    marginTop: 5,
    paddingHorizontal: 7,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  priorityDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 4,
  },

  priorityText: {
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '800',
  },

  description: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 17,
  },

  detailGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },

  detailItem: {
    flex: 1,
    minWidth: 0,
    paddingRight: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 6,
  },

  detailLabel: {
    color: colors.textMuted,
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '700',
  },

  detailValue: {
    marginTop: 2,
    color: colors.textSoft,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '800',
  },

  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },

  actionButton: {
    flex: 1,
    height: spacing.touch - 10,
    marginRight: 7,
    borderRadius: radius.button,
    backgroundColor: SURFACES.stronger,
    borderWidth: 1,
    borderColor: SURFACES.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  actionText: {
    marginLeft: 5,
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
  },

  deleteAction: {
    width: spacing.touch - 10,
    height: spacing.touch - 10,
    borderRadius: radius.button,
    backgroundColor: alpha(PRIORITY.high, '12'),
    borderWidth: 1,
    borderColor: alpha(PRIORITY.high, '28'),
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.huge,
    borderRadius: radius.card,
    backgroundColor: SURFACES.surface,
    borderWidth: 1,
    borderColor: SURFACES.border,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: radius.xl,
    backgroundColor: alpha(ACCENT, '12'),
    borderWidth: 1,
    borderColor: alpha(ACCENT, '28'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },

  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },

  emptyText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
  },

  emptyAddButton: {
    minHeight: spacing.touch,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.button,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  emptyAddText: {
    marginLeft: 5,
    color: colors.black,
    fontSize: 10,
    fontWeight: '800',
  },

  emptySecondaryButton: {
    minHeight: 38,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.button,
    backgroundColor: SURFACES.stronger,
    borderWidth: 1,
    borderColor: SURFACES.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptySecondaryText: {
    color: ACCENT,
    fontSize: 10,
    fontWeight: '800',
  },

  bottomSpacer: {
    height: 32,
  },

  pressed: {
    opacity: 0.7,
  },
});

export default MaintenanceScreen;
