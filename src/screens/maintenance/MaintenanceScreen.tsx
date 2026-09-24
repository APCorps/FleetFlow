import React from 'react';

import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import {
  MaterialDesignIcons,
} from '@react-native-vector-icons/material-design-icons/static';

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
  NativeStackNavigationProp<
    RootStackParamList
  >;

type IconName = React.ComponentProps<
  typeof MaterialDesignIcons
>['name'];

const ACCENT = '#FF9F1C';

const STATUS = {
  scheduled: '#F59E0B',
  inProgress: '#3B82F6',
  completed: '#00D6A3',
  fallback: '#94A3B8',
} as const;

const PRIORITY = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#00D6A3',
} as const;

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

const alpha = (hex: string, value: string) =>
  `${hex}${value}`;

const MaintenanceScreen = () => {
  const navigation =
    useNavigation<MaintenanceNavigationProp>();

  const {
    maintenanceRecords,
    deleteMaintenance,
  } = useMaintenance();

  const {vehicles} = useVehicles();

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

  const highPriorityCount =
    maintenanceRecords.filter(
      record => record.priority === 'High',
    ).length;

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={8}
              onPress={() => navigation.goBack()}
              style={({pressed}) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}>
              <MaterialDesignIcons
                name="arrow-left"
                size={21}
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
              <Text style={styles.title}>
                Maintenance
              </Text>
              <Text style={styles.subtitle}>
                Keep your fleet service-ready
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryIcon}>
                <MaterialDesignIcons
                  name="wrench-outline"
                  size={21}
                  color={ACCENT}
                />
              </View>

              <View style={styles.summaryCopy}>
                <Text style={styles.summaryLabel}>
                  TOTAL RECORDS
                </Text>
                <Text style={styles.summaryValue}>
                  {maintenanceRecords.length}
                </Text>
              </View>

              {highPriorityCount > 0 && (
                <View style={styles.alertBadge}>
                  <MaterialDesignIcons
                    name="alert-circle-outline"
                    size={14}
                    color={PRIORITY.high}
                  />
                  <Text style={styles.alertBadgeText}>
                    {highPriorityCount}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.metricsRow}>
              <Metric
                icon="calendar-outline"
                label="Scheduled"
                value={scheduledCount}
                color={STATUS.scheduled}
              />

              <Metric
                icon="progress-clock"
                label="In progress"
                value={inProgressCount}
                color={STATUS.inProgress}
              />

              <Metric
                icon="check-circle-outline"
                label="Completed"
                value={completedCount}
                color={STATUS.completed}
              />
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add maintenance"
            onPress={() =>
              navigation.navigate('AddMaintenance')
            }
            style={({pressed}) => [
              styles.addButton,
              pressed && styles.pressed,
            ]}>
            <View style={styles.addIconCircle}>
              <MaterialDesignIcons
                name="plus"
                size={20}
                color={ACCENT}
              />
            </View>
            <Text style={styles.addButtonText}>
              Add Maintenance
            </Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>
              SERVICE LOG
            </Text>
            <Text style={styles.sectionTitle}>
              Maintenance records
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {maintenanceRecords.length}
            </Text>
          </View>
        </View>

        {maintenanceRecords.map(record => {
          const statusColor = getStatusColor(
            record.status,
          );
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
                  {
                    backgroundColor: statusColor,
                  },
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

                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: alpha(
                        statusColor,
                        '18',
                      ),
                      borderColor: alpha(
                        statusColor,
                        '36',
                      ),
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
                      {color: statusColor},
                    ]}>
                    {record.status}
                  </Text>
                </View>
              </View>

              <Text
                style={styles.description}
                numberOfLines={3}>
                {record.description}
              </Text>

              <View style={styles.infoRow}>
                <InfoItem
                  icon="flag-outline"
                  label="Priority"
                  value={record.priority}
                  valueColor={priorityColor}
                />

                <InfoItem
                  icon="calendar-outline"
                  label="Scheduled"
                  value={new Date(
                    record.scheduledDate,
                  ).toLocaleDateString()}
                />
              </View>

              {(record.mileage !== undefined ||
                record.cost !== undefined ||
                record.completedDate) && (
                <View style={styles.detailRow}>
                  {record.mileage !== undefined && (
                    <DetailItem
                      icon="counter"
                      label="Mileage"
                      value={`${record.mileage.toLocaleString()} km`}
                    />
                  )}

                  {record.cost !== undefined && (
                    <DetailItem
                      icon="cash-outline"
                      label="Cost"
                      value={`₹${record.cost.toLocaleString()}`}
                    />
                  )}

                  {record.completedDate && (
                    <DetailItem
                      icon="check-outline"
                      label="Completed"
                      value={new Date(
                        record.completedDate,
                      ).toLocaleDateString()}
                    />
                  )}
                </View>
              )}

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
        })}

        {maintenanceRecords.length === 0 && (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <MaterialDesignIcons
                name="wrench-outline"
                size={28}
                color={ACCENT}
              />
            </View>

            <Text style={styles.emptyTitle}>
              No maintenance records
            </Text>

            <Text style={styles.emptyText}>
              Your fleet currently has no maintenance records.
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add your first maintenance record"
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
                color="#1B1205"
              />
              <Text style={styles.emptyAddText}>
                Add Maintenance
              </Text>
            </Pressable>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

type MetricProps = {
  icon: IconName;
  label: string;
  value: number;
  color: string;
};

const Metric = ({
  icon,
  label,
  value,
  color,
}: MetricProps) => (
  <View style={styles.metric}>
    <View
      style={[
        styles.metricIcon,
        {backgroundColor: alpha(color, '16')},
      ]}>
      <MaterialDesignIcons
        name={icon}
        size={15}
        color={color}
      />
    </View>
    <View style={styles.metricCopy}>
      <Text style={[styles.metricValue, {color}]}>
        {value}
      </Text>
      <Text style={styles.metricLabel}>
        {label}
      </Text>
    </View>
  </View>
);

type InfoItemProps = {
  icon: IconName;
  label: string;
  value: string;
  valueColor?: string;
};

const InfoItem = ({
  icon,
  label,
  value,
  valueColor,
}: InfoItemProps) => (
  <View style={styles.infoItem}>
    <MaterialDesignIcons
      name={icon}
      size={15}
      color={valueColor ?? colors.textMuted}
    />
    <Text style={styles.infoLabel}>
      {label}
    </Text>
    <Text
      style={[
        styles.infoValue,
        valueColor && {color: valueColor},
      ]}>
      {value}
    </Text>
  </View>
);

type DetailItemProps = {
  icon: IconName;
  label: string;
  value: string;
};

const DetailItem = ({
  icon,
  label,
  value,
}: DetailItemProps) => (
  <View style={styles.detailItem}>
    <MaterialDesignIcons
      name={icon}
      size={15}
      color={colors.textMuted}
    />
    <View style={styles.detailCopy}>
      <Text style={styles.detailLabel}>
        {label}
      </Text>
      <Text
        style={styles.detailValue}
        numberOfLines={1}>
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
    backgroundColor: '#070D18',
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 30,
  },

  header: {
    marginBottom: spacing.md,
  },

  headerLeft: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#0B1423',
    borderWidth: 1,
    borderColor: '#1B2A40',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#261A0A',
    borderWidth: 1,
    borderColor: '#4A3211',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  headerCopy: {
    flex: 1,
  },

  title: {
    color: '#F8FAFC',
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  subtitle: {
    marginTop: 3,
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 20,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: '#0B1423',
    borderWidth: 1,
    borderColor: '#1B2A40',
    borderRadius: radius.xl,
    padding: 14,
    minHeight: 148,
  },

  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#261A0A',
    borderWidth: 1,
    borderColor: '#4A3211',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  summaryCopy: {
    flex: 1,
  },

  summaryLabel: {
    color: '#667892',
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },

  summaryValue: {
    marginTop: 2,
    color: '#F8FAFC',
    fontSize: 24,
    lineHeight: 27,
    fontWeight: '800',
  },

  alertBadge: {
    minWidth: 30,
    height: 28,
    paddingHorizontal: 7,
    borderRadius: 9,
    backgroundColor: '#3D1A22',
    borderWidth: 1,
    borderColor: '#5A2631',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  alertBadgeText: {
    marginLeft: 3,
    color: PRIORITY.high,
    fontSize: 11,
    fontWeight: '800',
  },

  summaryDivider: {
    height: 1,
    backgroundColor: '#16263B',
    marginVertical: 13,
  },

  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  metric: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  metricIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },

  metricCopy: {
    flex: 1,
    minWidth: 0,
  },

  metricValue: {
    fontSize: 17,
    lineHeight: 19,
    fontWeight: '800',
  },

  metricLabel: {
    marginTop: 1,
    color: '#667892',
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '700',
  },

  addButton: {
    width: 92,
    marginLeft: 10,
    borderRadius: radius.xl,
    backgroundColor: '#261A0A',
    borderWidth: 1,
    borderColor: '#4A3211',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  addIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#FF9F1C18',
    borderWidth: 1,
    borderColor: '#FF9F1C36',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },

  addButtonText: {
    color: ACCENT,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    textAlign: 'center',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 11,
  },

  sectionEyebrow: {
    color: '#667892',
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '800',
    letterSpacing: 1.05,
  },

  sectionTitle: {
    marginTop: 2,
    color: '#F8FAFC',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
  },

  countBadge: {
    minWidth: 32,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#101B2D',
    borderWidth: 1,
    borderColor: '#1B2A40',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  countBadgeText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
  },

  recordCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#0B1D33',
    borderWidth: 1,
    borderColor: '#1B2A40',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },

  recordAccent: {
    position: 'absolute',
    left: 0,
    top: 16,
    bottom: 16,
    width: 3,
    borderRadius: 2,
  },

  recordTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  recordIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  recordIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#261A0A',
    borderWidth: 1,
    borderColor: '#4A3211',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  recordTextBlock: {
    flex: 1,
    minWidth: 0,
  },

  recordTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    lineHeight: 20,
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
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
  },

  statusBadge: {
    minHeight: 28,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
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

  description: {
    marginTop: 12,
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: '#16263B',
  },

  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  infoLabel: {
    marginLeft: 5,
    color: '#667892',
    fontSize: 10,
    fontWeight: '700',
  },

  infoValue: {
    marginLeft: 4,
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '800',
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#16263B',
  },

  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    paddingRight: 8,
  },

  detailCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 6,
  },

  detailLabel: {
    color: '#667892',
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '700',
  },

  detailValue: {
    marginTop: 1,
    color: '#CBD5E1',
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
  },

  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  actionButton: {
    height: 34,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#101B2D',
    borderWidth: 1,
    borderColor: '#1B2A40',
    marginRight: 7,
  },

  actionText: {
    marginLeft: 5,
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
  },

  deleteAction: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#3D1A22',
    borderWidth: 1,
    borderColor: '#5A2631',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B1D33',
    borderWidth: 1,
    borderColor: '#1B2A40',
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 38,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#261A0A',
    borderWidth: 1,
    borderColor: '#4A3211',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '800',
  },

  emptyText: {
    marginTop: 6,
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },

  emptyAddButton: {
    minHeight: 38,
    marginTop: 16,
    paddingHorizontal: 14,
    borderRadius: 11,
    backgroundColor: ACCENT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyAddText: {
    marginLeft: 5,
    color: '#1B1205',
    fontSize: 11,
    fontWeight: '800',
  },

  bottomSpacer: {
    height: 40,
  },

  pressed: {
    opacity: 0.68,
  },
});

export default MaintenanceScreen;
