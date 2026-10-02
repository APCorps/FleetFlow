import React from 'react';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {useNavigation, useRoute} from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  MaterialDesignIcons,
} from '@react-native-vector-icons/material-design-icons/static';

import {useVehicles} from '../../store';
import {Maintenance} from '../../types';
import type {RootStackParamList} from '../../navigation/AppNavigator';
import {
  colors,
  radius,
  spacing,
  typography,
} from '../../theme';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList
>;

type IconName = React.ComponentProps<
  typeof MaterialDesignIcons
>['name'];

const ACCENT = colors.categories.maintenance;

const STATUS_COLORS = {
  completed: colors.success,
  inProgress: colors.primary,
  scheduled: colors.warning,
  fallback: colors.textMuted,
} as const;

const PRIORITY_COLORS = {
  high: colors.danger,
  medium: colors.warning,
  low: colors.success,
} as const;

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return STATUS_COLORS.completed;
    case 'In Progress':
      return STATUS_COLORS.inProgress;
    case 'Scheduled':
      return STATUS_COLORS.scheduled;
    default:
      return STATUS_COLORS.fallback;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High':
      return PRIORITY_COLORS.high;
    case 'Medium':
      return PRIORITY_COLORS.medium;
    default:
      return PRIORITY_COLORS.low;
  }
};

const alpha = (hex: string, value: string) => `${hex}${value}`;

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatCurrency = (amount: number) => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

const MaintenanceDetailsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();

  const {vehicles} = useVehicles();

  const {maintenance} = route.params as {
    maintenance: Maintenance;
  };

  const vehicle = vehicles.find(
    item => item.id === maintenance.vehicleId,
  );

  const statusColor = getStatusColor(maintenance.status);
  const priorityColor = getPriorityColor(maintenance.priority);

  const isOverdue =
    maintenance.status !== 'Completed' &&
    new Date(maintenance.scheduledDate).getTime() < Date.now();

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
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

          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>SERVICE RECORD</Text>
            <Text style={styles.title}>Maintenance Details</Text>
            <Text style={styles.subtitle}>
              Complete service history for this record
            </Text>
          </View>

          <View
            style={[
              styles.headerIcon,
              {
                backgroundColor: alpha(ACCENT, '16'),
                borderColor: alpha(ACCENT, '38'),
              },
            ]}>
            <MaterialDesignIcons
              name="wrench-outline"
              size={20}
              color={ACCENT}
            />
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroTitleBlock}>
              <Text style={styles.heroTitle} numberOfLines={3}>
                {maintenance.title}
              </Text>

              <View style={styles.vehicleIdentityRow}>
                <View style={styles.smallIconBox}>
                  <MaterialDesignIcons
                    name="truck-outline"
                    size={15}
                    color={colors.textSecondary}
                  />
                </View>

                <Text style={styles.vehicleRegistration} numberOfLines={1}>
                  {vehicle?.registrationNumber ?? 'Unknown Vehicle'}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: alpha(statusColor, '16'),
                  borderColor: alpha(statusColor, '35'),
                },
              ]}>
              <View
                style={[
                  styles.statusDot,
                  {backgroundColor: statusColor},
                ]}
              />
              <Text style={[styles.statusText, {color: statusColor}]}>
                {maintenance.status}
              </Text>
            </View>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroBottomRow}>
            <View style={styles.heroMetric}>
              <Text style={styles.metricLabel}>PRIORITY</Text>
              <View
                style={[
                  styles.priorityPill,
                  {
                    backgroundColor: alpha(priorityColor, '14'),
                    borderColor: alpha(priorityColor, '30'),
                  },
                ]}>
                <View
                  style={[
                    styles.priorityDot,
                    {backgroundColor: priorityColor},
                  ]}
                />
                <Text
                  style={[
                    styles.priorityText,
                    {color: priorityColor},
                  ]}>
                  {maintenance.priority}
                </Text>
              </View>
            </View>

            <View style={styles.heroMetric}>
              <Text style={styles.metricLabel}>SCHEDULED</Text>
              <Text style={styles.metricValue}>
                {formatDate(maintenance.scheduledDate)}
              </Text>
            </View>

            {isOverdue && (
              <View style={styles.overduePill}>
                <MaterialDesignIcons
                  name="alert-circle-outline"
                  size={14}
                  color={colors.danger}
                />
                <Text style={styles.overdueText}>OVERDUE</Text>
              </View>
            )}
          </View>
        </View>

        <SectionHeader
          eyebrow="SERVICE"
          title="Maintenance information"
        />

        <View style={styles.card}>
          <DetailRow
            icon="truck-outline"
            label="Vehicle"
            value={
              vehicle
                ? `${vehicle.registrationNumber} · ${vehicle.make} ${vehicle.model}`
                : 'Unknown Vehicle'
            }
          />
          <Divider />
          <DetailRow
            icon="text-box-outline"
            label="Description"
            value={maintenance.description}
            multiline
          />
        </View>

        <SectionHeader
          eyebrow="SCHEDULE"
          title="Timeline"
        />

        <View style={styles.card}>
          <TimelineRow
            icon="calendar-clock"
            label="Scheduled date"
            value={formatDate(maintenance.scheduledDate)}
            color={ACCENT}
          />

          {maintenance.completedDate && (
            <>
              <Divider />
              <TimelineRow
                icon="check-circle-outline"
                label="Completed date"
                value={formatDate(maintenance.completedDate)}
                color={colors.success}
              />
            </>
          )}
        </View>

        <SectionHeader
          eyebrow="VEHICLE"
          title="Service metrics"
        />

        <View style={styles.metricsCard}>
          <MetricTile
            icon="counter"
            label="Mileage"
            value={
              maintenance.mileage !== undefined
                ? `${maintenance.mileage.toLocaleString('en-IN')} km`
                : 'Not provided'
            }
            color={colors.primary}
          />

          <View style={styles.metricsDivider} />

          <MetricTile
            icon="cash-outline"
            label="Maintenance cost"
            value={
              maintenance.cost !== undefined
                ? formatCurrency(maintenance.cost)
                : 'Not provided'
            }
            color={ACCENT}
          />
        </View>

        <SectionHeader
          eyebrow="RECORD"
          title="Record information"
        />

        <View style={styles.card}>
          <DetailRow
            icon="identifier"
            label="Record ID"
            value={maintenance.id}
          />
          <Divider />
          <DetailRow
            icon="clock-outline"
            label="Created"
            value={formatDate(maintenance.createdAt)}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
};

const SectionHeader = ({eyebrow, title}: SectionHeaderProps) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

type DetailRowProps = {
  icon: IconName;
  label: string;
  value: string;
  multiline?: boolean;
};

const DetailRow = ({
  icon,
  label,
  value,
  multiline = false,
}: DetailRowProps) => (
  <View style={styles.detailRow}>
    <View style={styles.detailIconBox}>
      <MaterialDesignIcons
        name={icon}
        size={17}
        color={colors.textSecondary}
      />
    </View>

    <View style={styles.detailCopy}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text
        style={styles.detailValue}
        numberOfLines={multiline ? undefined : 3}>
        {value}
      </Text>
    </View>
  </View>
);

type TimelineRowProps = {
  icon: IconName;
  label: string;
  value: string;
  color: string;
};

const TimelineRow = ({
  icon,
  label,
  value,
  color,
}: TimelineRowProps) => (
  <View style={styles.timelineRow}>
    <View
      style={[
        styles.timelineIcon,
        {
          backgroundColor: alpha(color, '14'),
          borderColor: alpha(color, '2A'),
        },
      ]}>
      <MaterialDesignIcons
        name={icon}
        size={17}
        color={color}
      />
    </View>

    <View style={styles.timelineCopy}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

type MetricTileProps = {
  icon: IconName;
  label: string;
  value: string;
  color: string;
};

const MetricTile = ({
  icon,
  label,
  value,
  color,
}: MetricTileProps) => (
  <View style={styles.metricTile}>
    <View
      style={[
        styles.metricIconBox,
        {
          backgroundColor: alpha(color, '14'),
          borderColor: alpha(color, '28'),
        },
      ]}>
      <MaterialDesignIcons
        name={icon}
        size={18}
        color={color}
      />
    </View>

    <View style={styles.metricTileCopy}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricTileValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  </View>
);

const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  backButton: {
    width: spacing.touch,
    height: spacing.touch,
    borderRadius: radius.button,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
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
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.weight.bold,
    letterSpacing: typography.letterSpacing.wide,
  },

  title: {
    marginTop: 2,
    color: colors.textPrimary,
    fontSize: typography.size.xl,
    lineHeight: typography.lineHeight.xl,
    fontWeight: typography.weight.bold,
    letterSpacing: typography.letterSpacing.tight,
  },

  subtitle: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.medium,
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },

  heroCard: {
    padding: spacing.card,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.section,
  },

  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  heroTitleBlock: {
    flex: 1,
    minWidth: 0,
    paddingRight: spacing.sm,
  },

  heroTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.xl,
    lineHeight: typography.lineHeight.xl,
    fontWeight: typography.weight.bold,
    letterSpacing: typography.letterSpacing.tight,
  },

  vehicleIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    minWidth: 0,
  },

  smallIconBox: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },

  vehicleRegistration: {
    flex: 1,
    minWidth: 0,
    color: colors.textSoft,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.semiBold,
  },

  statusBadge: {
    minHeight: 30,
    maxWidth: 120,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  statusText: {
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.weight.bold,
  },

  heroDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },

  heroBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  heroMetric: {
    flex: 1,
    minWidth: 118,
  },

  metricLabel: {
    color: colors.textMuted,
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.weight.bold,
    letterSpacing: typography.letterSpacing.wide,
  },

  metricValue: {
    marginTop: 3,
    color: colors.textPrimary,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.semiBold,
  },

  priorityPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    minHeight: 28,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: 3,
  },

  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  priorityText: {
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.weight.bold,
  },

  overduePill: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: colors.dangerSoft,
  },

  overdueText: {
    marginLeft: 5,
    color: colors.danger,
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.weight.bold,
    letterSpacing: typography.letterSpacing.wide,
  },

  sectionHeader: {
    marginBottom: spacing.sm,
  },

  sectionEyebrow: {
    color: colors.textMuted,
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.weight.bold,
    letterSpacing: typography.letterSpacing.wide,
  },

  sectionTitle: {
    marginTop: 2,
    color: colors.textPrimary,
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.weight.semiBold,
  },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    paddingHorizontal: spacing.card,
    paddingVertical: spacing.md,
    marginBottom: spacing.section,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minWidth: 0,
  },

  detailIconBox: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },

  detailCopy: {
    flex: 1,
    minWidth: 0,
  },

  detailLabel: {
    color: colors.textMuted,
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.weight.semiBold,
    letterSpacing: typography.letterSpacing.wide,
  },

  detailValue: {
    marginTop: 4,
    color: colors.textSoft,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.medium,
  },

  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },

  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  timelineIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },

  timelineCopy: {
    flex: 1,
    minWidth: 0,
  },

  metricsCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: spacing.card,
    marginBottom: spacing.section,
  },

  metricTile: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  metricIconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },

  metricTileCopy: {
    flex: 1,
    minWidth: 0,
  },

  metricTileValue: {
    marginTop: 3,
    color: colors.textPrimary,
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.weight.semiBold,
  },

  metricsDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },

  bottomSpacer: {
    height: spacing.xxxl,
  },

  pressed: {
    opacity: 0.68,
  },
});

export default MaintenanceDetailsScreen;
