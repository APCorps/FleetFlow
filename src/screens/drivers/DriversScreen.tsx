import React, {useMemo, useState} from 'react';

import {useNavigation} from '@react-navigation/native';

import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {
  MaterialDesignIcons,
} from '@react-native-vector-icons/material-design-icons/static';

import type {
  RootStackParamList,
} from '../../navigation/AppNavigator';

import {useDrivers} from '../../store';

type DriversScreenNavigationProp =
  import('@react-navigation/native-stack').NativeStackNavigationProp<
    RootStackParamList
  >;

const DRIVER_TEAL = '#00D6C9';

const STATUS_COLORS = {
  Active: '#00D6C9',
  'On Leave': '#EF4444',
  Inactive: '#F59E0B',
} as const;

type StatusFilter =
  | 'All'
  | 'Active'
  | 'On Leave'
  | 'Inactive';

const DriversScreen = () => {
  const insets = useSafeAreaInsets();

  const navigation =
    useNavigation<DriversScreenNavigationProp>();

  const {
    drivers,
    deleteDriver,
  } = useDrivers();

  const [searchQuery, setSearchQuery] =
    useState('');
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('All');
  const [filterVisible, setFilterVisible] =
    useState(false);

  const getStatusColor = (
    status: string,
  ) => {
    switch (status) {
      case 'Active':
        return STATUS_COLORS.Active;

      case 'On Leave':
        return STATUS_COLORS['On Leave'];

      case 'Inactive':
        return STATUS_COLORS.Inactive;

      default:
        return '#94A3B8';
    }
  };

  const handleDeleteDriver = (
    driverId: string,
    driverName: string,
  ) => {
    Alert.alert(
      'Delete Driver',
      `Are you sure you want to delete ${driverName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteDriver(driverId);
          },
        },
      ],
    );
  };

  const filteredDrivers = useMemo(() => {
    const query =
      searchQuery.trim().toLowerCase();

    return drivers.filter(driver => {
      const matchesStatus =
        statusFilter === 'All' ||
        driver.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        driver.name,
        driver.employeeId,
        driver.phone,
        driver.licenseNumber,
      ].some(value =>
        String(value)
          .toLowerCase()
          .includes(query),
      );
    });
  }, [drivers, searchQuery, statusFilter]);

  const activeCount = drivers.filter(
    driver => driver.status === 'Active',
  ).length;

  const leaveCount = drivers.filter(
    driver => driver.status === 'On Leave',
  ).length;

  const inactiveCount = drivers.filter(
    driver => driver.status === 'Inactive',
  ).length;

  const activeFilterCount =
    statusFilter === 'All' ? 0 : 1;

  const hasFilters =
    Boolean(searchQuery.trim()) ||
    statusFilter !== 'All';

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.safeAreaTop,
          {height: insets.top},
        ]}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              Math.max(insets.bottom, 20) + 110,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <MaterialDesignIcons
              name="account-hard-hat-outline"
              size={23}
              color={DRIVER_TEAL}
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>
              FLEET OPERATIONS
            </Text>

            <Text style={styles.title}>
              Drivers
            </Text>

            <Text style={styles.subtitle}>
              Manage your fleet drivers
            </Text>
          </View>
        </View>

        {/* SUMMARY */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryMain}>
            <Text style={styles.summaryValue}>
              {drivers.length}
            </Text>

            <Text style={styles.summaryLabel}>
              Total Drivers
            </Text>
          </View>

          <View style={styles.summaryMetrics}>
            <View style={styles.summaryMetric}>
              <View
                style={[
                  styles.metricDot,
                  {
                    backgroundColor:
                      STATUS_COLORS.Active,
                  },
                ]}
              />
              <Text style={styles.metricValue}>
                {activeCount}
              </Text>
              <Text style={styles.metricLabel}>
                Active
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryMetric}>
              <View
                style={[
                  styles.metricDot,
                  {
                    backgroundColor:
                      STATUS_COLORS['On Leave'],
                  },
                ]}
              />
              <Text style={styles.metricValue}>
                {leaveCount}
              </Text>
              <Text style={styles.metricLabel}>
                Leave
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryMetric}>
              <View
                style={[
                  styles.metricDot,
                  {
                    backgroundColor:
                      STATUS_COLORS.Inactive,
                  },
                ]}
              />
              <Text style={styles.metricValue}>
                {inactiveCount}
              </Text>
              <Text style={styles.metricLabel}>
                Inactive
              </Text>
            </View>
          </View>
        </View>

        {/* SEARCH + FILTER + ADD */}

        <View style={styles.actionRow}>
          <View style={styles.searchBox}>
            <MaterialDesignIcons
              name="magnify"
              size={19}
              color="#6F7892"
            />

            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search drivers"
              placeholderTextColor="#6F7892"
              style={styles.searchInput}
              returnKeyType="search"
              autoCorrect={false}
            />

            {searchQuery.length > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear driver search"
                onPress={() => setSearchQuery('')}
                style={({pressed}) => [
                  styles.clearButton,
                  pressed && styles.pressed,
                ]}>
                <MaterialDesignIcons
                  name="close-circle"
                  size={17}
                  color="#6F7892"
                />
              </Pressable>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilterCount > 0 &&
                styles.filterButtonActive,
            ]}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel="Filter drivers"
            onPress={() => setFilterVisible(true)}>

            <MaterialDesignIcons
              name="tune-variant"
              size={19}
              color={
                activeFilterCount > 0
                  ? '#FFFFFF'
                  : '#CBD3E6'
              }
            />

            {activeFilterCount > 0 && (
              <View style={styles.filterCount}>
                <Text style={styles.filterCountText}>
                  {activeFilterCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel="Add Driver"
            onPress={() =>
              navigation.navigate('AddDriver')
            }>

            <MaterialDesignIcons
              name="plus"
              size={19}
              color="#FFFFFF"
            />

            <Text style={styles.addButtonText}>
              Add
            </Text>
          </TouchableOpacity>
        </View>

        {hasFilters && (
          <View style={styles.filterSummary}>
            <Text style={styles.filterSummaryText}>
              {filteredDrivers.length} result
              {filteredDrivers.length === 1
                ? ''
                : 's'}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear driver filters"
              onPress={() => {
                setSearchQuery('');
                setStatusFilter('All');
              }}
              style={({pressed}) => [
                styles.clearFilters,
                pressed && styles.pressed,
              ]}>
              <Text style={styles.clearFiltersText}>
                Clear
              </Text>
            </Pressable>
          </View>
        )}

        {/* DRIVERS */}

        {filteredDrivers.map(driver => {
          const statusColor =
            getStatusColor(
              driver.status,
            );

          return (
            <View
              key={driver.id}
              style={styles.driverCard}>

              <View style={styles.driverHeader}>
                <View style={styles.driverIdentity}>
                  <View
                    style={[
                      styles.driverIconChip,
                      {
                        backgroundColor:
                          `${statusColor}14`,
                        borderColor:
                          `${statusColor}30`,
                      },
                    ]}>

                    <MaterialDesignIcons
                      name="account-outline"
                      size={19}
                      color={statusColor}
                    />
                  </View>

                  <View style={styles.identityText}>
                    <Text
                      style={styles.driverName}
                      numberOfLines={1}>
                      {driver.name}
                    </Text>

                    <Text style={styles.employeeId}>
                      {driver.employeeId}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        `${statusColor}14`,
                      borderColor:
                        `${statusColor}28`,
                    },
                  ]}>

                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor:
                          statusColor,
                      },
                    ]}
                  />

                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          statusColor,
                      },
                    ]}>
                    {driver.status}
                  </Text>
                </View>
              </View>

              <View style={styles.details}>
                <View style={styles.detailRow}>
                  <MaterialDesignIcons
                    name="phone-outline"
                    size={16}
                    color="#6F7892"
                  />

                  <Text
                    style={styles.detailText}
                    numberOfLines={1}>
                    {driver.phone}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <MaterialDesignIcons
                    name="card-account-details-outline"
                    size={16}
                    color="#6F7892"
                  />

                  <Text
                    style={styles.detailText}
                    numberOfLines={1}>
                    {driver.licenseNumber}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <MaterialDesignIcons
                    name="calendar-clock-outline"
                    size={16}
                    color="#6F7892"
                  />

                  <Text
                    style={styles.detailText}
                    numberOfLines={1}>
                    License expiry:{' '}
                    {new Date(
                      driver.licenseExpiry,
                    ).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.actionsRow}>
                <View style={styles.actionSpacer} />

                <TouchableOpacity
                  style={styles.iconButton}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`View ${driver.name}`}
                  onPress={() =>
                    navigation.navigate(
                      'DriverDetails',
                      {driver},
                    )
                  }>

                  <MaterialDesignIcons
                    name="eye-outline"
                    size={18}
                    color="#94A3B8"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconButton}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${driver.name}`}
                  onPress={() =>
                    navigation.navigate(
                      'EditDriver',
                      {driver},
                    )
                  }>

                  <MaterialDesignIcons
                    name="pencil-outline"
                    size={18}
                    color="#94A3B8"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconButton}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${driver.name}`}
                  onPress={() =>
                    handleDeleteDriver(
                      driver.id,
                      driver.name,
                    )
                  }>

                  <MaterialDesignIcons
                    name="trash-can-outline"
                    size={18}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* EMPTY / NO RESULTS */}

        {filteredDrivers.length === 0 && (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <MaterialDesignIcons
                name={
                  drivers.length === 0
                    ? 'account-group-outline'
                    : 'account-search-outline'
                }
                size={31}
                color={DRIVER_TEAL}
              />
            </View>

            <Text style={styles.emptyTitle}>
              {drivers.length === 0
                ? 'No drivers'
                : 'No matching drivers'}
            </Text>

            <Text style={styles.emptyText}>
              {drivers.length === 0
                ? 'Your fleet currently has no drivers.'
                : 'Try a different search or clear the active filters.'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* FILTER SHEET */}

      <Modal
        visible={filterVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setFilterVisible(false)
        }>

        <Pressable
          style={styles.modalBackdrop}
          onPress={() =>
            setFilterVisible(false)
          }>

          <Pressable
            style={[
              styles.filterSheet,
              {
                paddingBottom:
                  Math.max(insets.bottom, 18) +
                  14,
              },
            ]}
            onPress={() => {}}>

            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetEyebrow}>
                  FILTER
                </Text>

                <Text style={styles.sheetTitle}>
                  Driver status
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close filter"
                onPress={() =>
                  setFilterVisible(false)
                }
                style={({pressed}) => [
                  styles.sheetClose,
                  pressed && styles.pressed,
                ]}>
                <MaterialDesignIcons
                  name="close"
                  size={20}
                  color="#CBD3E6"
                />
              </Pressable>
            </View>

            {(
              [
                'All',
                'Active',
                'On Leave',
                'Inactive',
              ] as StatusFilter[]
            ).map(option => {
              const selected =
                statusFilter === option;

              const optionColor =
                option === 'All'
                  ? DRIVER_TEAL
                  : getStatusColor(option);

              return (
                <Pressable
                  key={option}
                  accessibilityRole="radio"
                  accessibilityState={{
                    selected,
                  }}
                  onPress={() =>
                    setStatusFilter(option)
                  }
                  style={({pressed}) => [
                    styles.filterOption,
                    selected &&
                      styles.filterOptionSelected,
                    pressed &&
                      styles.pressed,
                  ]}>

                  <View
                    style={[
                      styles.optionIcon,
                      {
                        backgroundColor:
                          `${optionColor}14`,
                        borderColor:
                          `${optionColor}30`,
                      },
                    ]}>
                    <View
                      style={[
                        styles.optionDot,
                        {
                          backgroundColor:
                            optionColor,
                        },
                      ]}
                    />
                  </View>

                  <Text style={styles.filterOptionText}>
                    {option}
                  </Text>

                  <View style={styles.optionRight}>
                    <Text style={styles.optionCount}>
                      {option === 'All'
                        ? drivers.length
                        : drivers.filter(
                            driver =>
                              driver.status ===
                              option,
                          ).length}
                    </Text>

                    {selected && (
                      <MaterialDesignIcons
                        name="check"
                        size={19}
                        color={DRIVER_TEAL}
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}

            <TouchableOpacity
              style={styles.applyButton}
              activeOpacity={0.82}
              onPress={() =>
                setFilterVisible(false)
              }>
              <Text style={styles.applyButtonText}>
                Done
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050711',
  },

  safeAreaTop: {
    backgroundColor: '#050711',
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
  },

  pressed: {
    opacity: 0.78,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },

  headerIcon: {
    width: 46,
    height: 46,
    marginRight: 12,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(0, 214, 201, 0.10)',
    borderWidth: 1,
    borderColor:
      'rgba(0, 214, 201, 0.20)',
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  eyebrow: {
    marginBottom: 4,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: '#6F7892',
  },

  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: '#F5F7FF',
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: '#9AA4BF',
  },

  summaryCard: {
    minHeight: 88,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor:
      'rgba(18, 24, 46, 0.84)',
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.08)',
  },

  summaryMain: {
    minWidth: 92,
    paddingRight: 12,
  },

  summaryValue: {
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '800',
    color: '#F5F7FF',
  },

  summaryLabel: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    color: '#6F7892',
  },

  summaryMetrics: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  summaryMetric: {
    alignItems: 'center',
    minWidth: 42,
  },

  metricDot: {
    width: 6,
    height: 6,
    marginBottom: 4,
    borderRadius: 3,
  },

  metricValue: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    color: '#CBD3E6',
  },

  metricLabel: {
    marginTop: 1,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '600',
    color: '#6F7892',
  },

  summaryDivider: {
    width: 1,
    height: 28,
    backgroundColor:
      'rgba(255, 255, 255, 0.06)',
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  searchBox: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#0B1221',
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.08)',
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    marginLeft: 8,
    paddingVertical: 0,
    fontSize: 13,
    lineHeight: 18,
    color: '#F5F7FF',
  },

  clearButton: {
    padding: 4,
  },

  filterButton: {
    width: 44,
    height: 44,
    marginLeft: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10182B',
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.08)',
  },

  filterButtonActive: {
    backgroundColor: '#00AFA5',
    borderColor:
      'rgba(255, 255, 255, 0.12)',
  },

  filterCount: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 14,
    height: 14,
    paddingHorizontal: 3,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  filterCountText: {
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '800',
    color: '#00AFA5',
  },

  addButton: {
    height: 44,
    marginLeft: 8,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#00BFB3',
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.10)',
  },

  addButtonText: {
    marginLeft: 6,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  filterSummary: {
    minHeight: 28,
    marginBottom: 8,
    paddingHorizontal: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  filterSummaryText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    color: '#6F7892',
  },

  clearFilters: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },

  clearFiltersText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    color: DRIVER_TEAL,
  },

  driverCard: {
    marginBottom: 11,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#0B1423',
    borderWidth: 1,
    borderColor: '#16263B',
  },

  driverHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  driverIdentity: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  driverIconChip: {
    width: 38,
    height: 38,
    marginRight: 10,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  identityText: {
    flex: 1,
    minWidth: 0,
  },

  driverName: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    color: '#F5F7FF',
  },

  employeeId: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    color: DRIVER_TEAL,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: 108,
  },

  statusDot: {
    width: 6,
    height: 6,
    marginRight: 5,
    borderRadius: 3,
  },

  statusText: {
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '800',
  },

  details: {
    marginTop: 13,
  },

  detailRow: {
    minHeight: 22,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    color: '#9AA4BF',
  },

  divider: {
    height: 1,
    marginTop: 5,
    backgroundColor:
      'rgba(255, 255, 255, 0.06)',
  },

  actionsRow: {
    marginTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  actionSpacer: {
    flex: 1,
  },

  iconButton: {
    width: 34,
    height: 34,
    marginLeft: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'transparent',
  },

  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 42,
    borderRadius: 16,
    backgroundColor: '#0B1423',
    borderWidth: 1,
    borderColor: '#16263B',
  },

  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(0, 214, 201, 0.10)',
    borderWidth: 1,
    borderColor:
      'rgba(0, 214, 201, 0.18)',
  },

  emptyTitle: {
    marginTop: 14,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '800',
    color: '#F5F7FF',
  },

  emptyText: {
    maxWidth: 280,
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    color: '#8B96B0',
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor:
      'rgba(0, 0, 0, 0.58)',
  },

  filterSheet: {
    paddingHorizontal: 18,
    paddingTop: 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#0A1020',
    borderTopWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.08)',
  },

  sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    marginBottom: 18,
    borderRadius: 2,
    backgroundColor: '#33415B',
  },

  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  sheetEyebrow: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: '#6F7892',
  },

  sheetTitle: {
    marginTop: 3,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '800',
    color: '#F5F7FF',
  },

  sheetClose: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10182B',
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.08)',
  },

  filterOption: {
    minHeight: 54,
    marginBottom: 7,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 13,
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.05)',
    backgroundColor: '#0D1526',
  },

  filterOptionSelected: {
    borderColor:
      'rgba(0, 214, 201, 0.22)',
    backgroundColor:
      'rgba(0, 214, 201, 0.08)',
  },

  optionIcon: {
    width: 32,
    height: 32,
    marginRight: 10,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  optionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  filterOptionText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: '#CBD3E6',
  },

  optionRight: {
    minWidth: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  optionCount: {
    marginRight: 7,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    color: '#6F7892',
  },

  applyButton: {
    minHeight: 48,
    marginTop: 7,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00BFB3',
  },

  applyButtonText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default DriversScreen;
