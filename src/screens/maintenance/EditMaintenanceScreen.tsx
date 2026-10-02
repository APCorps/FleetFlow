import React, {useState} from 'react';

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import {
  MaterialDesignIcons,
} from '@react-native-vector-icons/material-design-icons/static';

import {useMaintenance, useVehicles} from '../../store';
import {Maintenance} from '../../types';
import {colors, radius, spacing, typography} from '../../theme';

type Status =
  | 'Scheduled'
  | 'In Progress'
  | 'Completed';

type Priority =
  | 'Low'
  | 'Medium'
  | 'High';

const ACCENT = colors.categories.maintenance;

const STATUS_META = {
  Scheduled: {
    icon: 'calendar-clock-outline' as const,
    color: colors.warning,
    background: colors.warningSoft,
    border: 'rgba(255, 200, 87, 0.28)',
  },
  'In Progress': {
    icon: 'progress-clock' as const,
    color: colors.primary,
    background: colors.primarySoft,
    border: colors.primaryBorder,
  },
  Completed: {
    icon: 'check-circle-outline' as const,
    color: colors.success,
    background: colors.successSoft,
    border: 'rgba(57, 230, 196, 0.24)',
  },
} as const;

const PRIORITY_META = {
  Low: {
    icon: 'flag-outline' as const,
    color: colors.success,
    background: colors.successSoft,
    border: 'rgba(57, 230, 196, 0.24)',
  },
  Medium: {
    icon: 'flag-triangle-outline' as const,
    color: colors.warning,
    background: colors.warningSoft,
    border: 'rgba(255, 200, 87, 0.28)',
  },
  High: {
    icon: 'alert-outline' as const,
    color: colors.danger,
    background: colors.dangerSoft,
    border: 'rgba(255, 102, 133, 0.28)',
  },
} as const;

type IconName = React.ComponentProps<
  typeof MaterialDesignIcons
>['name'];

const EditMaintenanceScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const {updateMaintenance} = useMaintenance();
  const {vehicles} = useVehicles();

  const {maintenance} = route.params as {
    maintenance: Maintenance;
  };

  const [vehicleId, setVehicleId] = useState(
    maintenance.vehicleId,
  );

  const [title, setTitle] = useState(
    maintenance.title,
  );

  const [description, setDescription] =
    useState(maintenance.description);

  const [status, setStatus] = useState<Status>(
    maintenance.status,
  );

  const [priority, setPriority] =
    useState<Priority>(maintenance.priority);

  const [scheduledDate, setScheduledDate] =
    useState(maintenance.scheduledDate);

  const [completedDate, setCompletedDate] =
    useState(maintenance.completedDate ?? '');

  const [mileage, setMileage] = useState(
    maintenance.mileage !== undefined
      ? String(maintenance.mileage)
      : '',
  );

  const [cost, setCost] = useState(
    maintenance.cost !== undefined
      ? String(maintenance.cost)
      : '',
  );

  const handleSave = () => {
    if (!vehicleId) {
      Alert.alert(
        'Missing Information',
        'Please select a vehicle.',
      );
      return;
    }

    if (!title.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter a maintenance title.',
      );
      return;
    }

    if (!description.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter a description.',
      );
      return;
    }

    if (!scheduledDate.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter the scheduled date.',
      );
      return;
    }

    if (
      status === 'Completed' &&
      !completedDate.trim()
    ) {
      Alert.alert(
        'Missing Information',
        'Please enter the completed date.',
      );
      return;
    }

    const parsedMileage = mileage.trim()
      ? Number(mileage)
      : undefined;

    const parsedCost = cost.trim()
      ? Number(cost)
      : undefined;

    if (
      parsedMileage !== undefined &&
      Number.isNaN(parsedMileage)
    ) {
      Alert.alert(
        'Invalid Mileage',
        'Please enter a valid mileage.',
      );
      return;
    }

    if (
      parsedCost !== undefined &&
      Number.isNaN(parsedCost)
    ) {
      Alert.alert(
        'Invalid Cost',
        'Please enter a valid cost.',
      );
      return;
    }

    const updatedMaintenance: Maintenance = {
      ...maintenance,
      vehicleId,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      scheduledDate: scheduledDate.trim(),
      completedDate:
        status === 'Completed'
          ? completedDate.trim()
          : undefined,
      mileage: parsedMileage,
      cost: parsedCost,
    };

    updateMaintenance(updatedMaintenance);

    Alert.alert(
      'Maintenance Updated',
      `${title.trim()} has been updated successfully.`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ],
    );
  };

  const selectedVehicle = vehicles.find(
    vehicle => vehicle.id === vehicleId,
  );

  const statusMeta = STATUS_META[status];
  const priorityMeta = PRIORITY_META[priority];

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }>
        <ScrollView
          contentContainerStyle={
            styles.content
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
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
              <Text style={styles.eyebrow}>
                SERVICE CONTROL
              </Text>
              <Text style={styles.title}>
                Edit Maintenance
              </Text>
              <Text style={styles.subtitle}>
                Update this service record without losing its history.
              </Text>
            </View>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View style={styles.heroIdentity}>
                <View style={styles.heroIcon}>
                  <MaterialDesignIcons
                    name="wrench-clock-outline"
                    size={23}
                    color={ACCENT}
                  />
                </View>

                <View style={styles.heroCopy}>
                  <Text
                    style={styles.heroTitle}
                    numberOfLines={2}>
                    {maintenance.title}
                  </Text>

                  <View style={styles.heroVehicleRow}>
                    <MaterialDesignIcons
                      name="truck-outline"
                      size={15}
                      color={colors.textMuted}
                    />
                    <Text
                      style={styles.heroVehicleText}
                      numberOfLines={1}>
                      {selectedVehicle?.registrationNumber ??
                        'Unknown vehicle'}
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      statusMeta.background,
                    borderColor:
                      statusMeta.border,
                  },
                ]}>
                <MaterialDesignIcons
                  name={statusMeta.icon}
                  size={14}
                  color={statusMeta.color}
                />
                <Text
                  style={[
                    styles.badgeText,
                    {color: statusMeta.color},
                  ]}>
                  {status}
                </Text>
              </View>
            </View>

            <View style={styles.heroFooter}>
              <View style={styles.heroFooterItem}>
                <Text style={styles.microLabel}>
                  PRIORITY
                </Text>
                <View style={styles.inlineValue}>
                  <View
                    style={[
                      styles.priorityDot,
                      {
                        backgroundColor:
                          priorityMeta.color,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.inlineValueText,
                      {color: priorityMeta.color},
                    ]}>
                    {priority}
                  </Text>
                </View>
              </View>

              <View style={styles.heroFooterDivider} />

              <View style={styles.heroFooterItem}>
                <Text style={styles.microLabel}>
                  RECORD
                </Text>
                <Text
                  style={styles.recordId}
                  numberOfLines={1}>
                  {maintenance.id}
                </Text>
              </View>
            </View>
          </View>

          <SectionHeader
            eyebrow="VEHICLE"
            title="Assignment"
            subtitle="Choose the vehicle this maintenance belongs to."
          />

          <View style={styles.card}>
            {vehicles.map(vehicle => {
              const selected =
                vehicleId === vehicle.id;

              return (
                <Pressable
                  key={vehicle.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${vehicle.registrationNumber}`}
                  onPress={() =>
                    setVehicleId(vehicle.id)
                  }
                  style={({pressed}) => [
                    styles.vehicleOption,
                    selected &&
                      styles.vehicleOptionSelected,
                    pressed && styles.pressed,
                  ]}>
                  <View
                    style={[
                      styles.vehicleIcon,
                      selected &&
                        styles.vehicleIconSelected,
                    ]}>
                    <MaterialDesignIcons
                      name="truck-outline"
                      size={18}
                      color={
                        selected
                          ? ACCENT
                          : colors.textSecondary
                      }
                    />
                  </View>

                  <View style={styles.vehicleCopy}>
                    <Text
                      style={[
                        styles.vehicleTitle,
                        selected &&
                          styles.vehicleTitleSelected,
                      ]}
                      numberOfLines={1}>
                      {vehicle.registrationNumber}
                    </Text>
                    <Text
                      style={styles.vehicleSubtitle}
                      numberOfLines={1}>
                      {vehicle.make} {vehicle.model}
                    </Text>
                  </View>

                  {selected && (
                    <View
                      style={
                        styles.selectedCheck
                      }>
                      <MaterialDesignIcons
                        name="check"
                        size={14}
                        color="#08100D"
                      />
                    </View>
                  )}
                </Pressable>
              );
            })}

            {vehicles.length === 0 && (
              <View style={styles.emptyVehicle}>
                <MaterialDesignIcons
                  name="truck-off-outline"
                  size={20}
                  color={colors.textMuted}
                />
                <Text style={styles.emptyText}>
                  No vehicles available.
                </Text>
              </View>
            )}
          </View>

          <SectionHeader
            eyebrow="DETAILS"
            title="Maintenance information"
            subtitle="Keep the record clear and operationally useful."
          />

          <View style={styles.card}>
            <Field
              label="Maintenance title"
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Engine Service"
              icon="wrench-outline"
            />

            <Field
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the maintenance work"
              icon="text-box-outline"
              multiline
            />
          </View>

          <SectionHeader
            eyebrow="STATE"
            title="Status"
            subtitle="Reflect the current service lifecycle."
          />

          <View style={styles.card}>
            <View style={styles.optionGrid}>
              {(
                [
                  'Scheduled',
                  'In Progress',
                  'Completed',
                ] as const
              ).map(option => {
                const meta =
                  STATUS_META[option];
                const selected =
                  status === option;

                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    accessibilityLabel={`Set status to ${option}`}
                    onPress={() =>
                      setStatus(option)
                    }
                    style={({pressed}) => [
                      styles.statusOption,
                      selected && {
                        backgroundColor:
                          meta.background,
                        borderColor:
                          meta.border,
                      },
                      pressed && styles.pressed,
                    ]}>
                    <MaterialDesignIcons
                      name={meta.icon}
                      size={17}
                      color={
                        selected
                          ? meta.color
                          : colors.textMuted
                      }
                    />
                    <Text
                      style={[
                        styles.optionText,
                        selected && {
                          color:
                            meta.color,
                        },
                      ]}>
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <SectionHeader
            eyebrow="URGENCY"
            title="Priority"
            subtitle="Use priority to highlight work requiring attention."
          />

          <View style={styles.card}>
            <View style={styles.optionGrid}>
              {(
                ['Low', 'Medium', 'High'] as const
              ).map(option => {
                const meta =
                  PRIORITY_META[option];
                const selected =
                  priority === option;

                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    accessibilityLabel={`Set priority to ${option}`}
                    onPress={() =>
                      setPriority(option)
                    }
                    style={({pressed}) => [
                      styles.priorityOption,
                      selected && {
                        backgroundColor:
                          meta.background,
                        borderColor:
                          meta.border,
                      },
                      pressed && styles.pressed,
                    ]}>
                    <MaterialDesignIcons
                      name={meta.icon}
                      size={17}
                      color={
                        selected
                          ? meta.color
                          : colors.textMuted
                      }
                    />
                    <Text
                      style={[
                        styles.optionText,
                        selected && {
                          color:
                            meta.color,
                        },
                      ]}>
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <SectionHeader
            eyebrow="SCHEDULE"
            title="Timing & cost"
            subtitle="Track service timing, mileage and financial impact."
          />

          <View style={styles.card}>
            <Field
              label="Scheduled date"
              value={scheduledDate}
              onChangeText={setScheduledDate}
              placeholder="YYYY-MM-DD"
              icon="calendar-outline"
              keyboardType="numbers-and-punctuation"
            />

            {status === 'Completed' && (
              <Field
                label="Completed date"
                value={completedDate}
                onChangeText={setCompletedDate}
                placeholder="YYYY-MM-DD"
                icon="calendar-check-outline"
                keyboardType="numbers-and-punctuation"
              />
            )}

            <Field
              label="Mileage"
              value={mileage}
              onChangeText={setMileage}
              placeholder="e.g. 50000"
              icon="counter"
              keyboardType="numeric"
              suffix="km"
            />

            <Field
              label="Cost"
              value={cost}
              onChangeText={setCost}
              placeholder="e.g. 5000"
              icon="cash-outline"
              keyboardType="numeric"
              suffix="₹"
              last
            />
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel edit"
              onPress={() =>
                navigation.goBack()
              }
              style={({pressed}) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}>
              <MaterialDesignIcons
                name="close"
                size={18}
                color={colors.textSecondary}
              />
              <Text
                style={styles.secondaryButtonText}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save maintenance changes"
              onPress={handleSave}
              style={({pressed}) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}>
              <MaterialDesignIcons
                name="content-save-outline"
                size={18}
                color={colors.black}
              />
              <Text
                style={styles.primaryButtonText}>
                Save Changes
              </Text>
            </Pressable>
          </View>

          <Text style={styles.footerHint}>
            Changes are saved to the existing maintenance
            record and preserve its original record ID.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const SectionHeader = ({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionEyebrow}>
      {eyebrow}
    </Text>
    <Text style={styles.sectionTitle}>
      {title}
    </Text>
    <Text style={styles.sectionSubtitle}>
      {subtitle}
    </Text>
  </View>
);

const Field = ({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  multiline,
  keyboardType,
  suffix,
  last,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  icon: IconName;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'numbers-and-punctuation';
  suffix?: string;
  last?: boolean;
}) => (
  <View
    style={[
      styles.field,
      last && styles.fieldLast,
    ]}>
    <Text style={styles.label}>
      {label}
    </Text>

    <View
      style={[
        styles.inputShell,
        multiline && styles.inputShellMultiline,
      ]}>
      <MaterialDesignIcons
        name={icon}
        size={18}
        color={colors.textMuted}
        style={
          multiline
            ? styles.inputIconTop
            : undefined
        }
      />

      <TextInput
        style={[
          styles.input,
          multiline && styles.descriptionInput,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        textAlignVertical={
          multiline ? 'top' : 'center'
        }
        keyboardType={keyboardType}
      />

      {suffix && (
        <View style={styles.suffix}>
          <Text style={styles.suffixText}>
            {suffix}
          </Text>
        </View>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  keyboard: {
    flex: 1,
  },

  content: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: 132,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.section,
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

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    backgroundColor: colors.secondarySoft,
    borderWidth: 1,
    borderColor: 'rgba(155, 123, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
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
    letterSpacing: typography.letterSpacing.heading,
  },

  title: {
    marginTop: 2,
    color: colors.textPrimary,
    fontSize: typography.size.xxl,
    lineHeight: typography.lineHeight.xxl,
    fontWeight: typography.weight.extraBold,
    letterSpacing: typography.letterSpacing.tight,
  },

  subtitle: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.medium,
  },

  heroCard: {
    marginBottom: spacing.section,
    padding: spacing.card,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  heroIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.lg,
    backgroundColor: colors.warningSoft,
    borderWidth: 1,
    borderColor: 'rgba(255, 200, 87, 0.24)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },

  heroCopy: {
    flex: 1,
    minWidth: 0,
  },

  heroTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.weight.bold,
  },

  heroVehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },

  heroVehicleText: {
    flex: 1,
    marginLeft: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.semiBold,
  },

  badge: {
    minHeight: 30,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },

  badgeText: {
    marginLeft: spacing.xs,
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.weight.bold,
  },

  heroFooter: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroFooterItem: {
    flex: 1,
    minWidth: 0,
  },

  heroFooterDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },

  microLabel: {
    color: colors.textMuted,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: typography.weight.bold,
    letterSpacing: typography.letterSpacing.wide,
  },

  inlineValue: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },

  priorityDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: spacing.xs,
  },

  inlineValueText: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.bold,
  },

  recordId: {
    marginTop: spacing.xs,
    color: colors.textSoft,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.semiBold,
  },

  sectionHeader: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },

  sectionEyebrow: {
    color: colors.textMuted,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: typography.weight.bold,
    letterSpacing: typography.letterSpacing.wide,
  },

  sectionTitle: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.weight.bold,
  },

  sectionSubtitle: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
  },

  card: {
    marginBottom: spacing.section,
    padding: spacing.card,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  vehicleOption: {
    minHeight: spacing.touch,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    backgroundColor: colors.surfaceStrong,
    flexDirection: 'row',
    alignItems: 'center',
  },

  vehicleOptionSelected: {
    backgroundColor: colors.warningSoft,
    borderColor: 'rgba(255, 200, 87, 0.30)',
  },

  vehicleIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },

  vehicleIconSelected: {
    backgroundColor: colors.warningSoft,
    borderColor: 'rgba(255, 200, 87, 0.25)',
  },

  vehicleCopy: {
    flex: 1,
    minWidth: 0,
  },

  vehicleTitle: {
    color: colors.textSecondary,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.bold,
  },

  vehicleTitleSelected: {
    color: colors.warning,
  },

  vehicleSubtitle: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.weight.medium,
  },

  selectedCheck: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },

  emptyVehicle: {
    minHeight: spacing.touch,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    marginLeft: spacing.sm,
    color: colors.textMuted,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
  },

  field: {
    marginBottom: spacing.lg,
  },

  fieldLast: {
    marginBottom: 0,
  },

  label: {
    marginBottom: spacing.sm,
    color: colors.textSoft,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.semiBold,
  },

  inputShell: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    backgroundColor: colors.surfaceStrong,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },

  inputShellMultiline: {
    alignItems: 'flex-start',
    minHeight: 118,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },

  inputIconTop: {
    marginTop: 2,
  },

  input: {
    flex: 1,
    minWidth: 0,
    marginLeft: spacing.sm,
    paddingVertical: 0,
    color: colors.textPrimary,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.medium,
  },

  descriptionInput: {
    minHeight: 86,
    paddingTop: 0,
  },

  suffix: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },

  suffixText: {
    color: colors.textMuted,
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.weight.bold,
  },

  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },

  statusOption: {
    minHeight: spacing.touch,
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 100,
    margin: 4,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    backgroundColor: colors.surfaceStrong,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  priorityOption: {
    minHeight: spacing.touch,
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 100,
    margin: 4,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    backgroundColor: colors.surfaceStrong,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionText: {
    marginLeft: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
  },

  actions: {
    flexDirection: 'row',
    marginHorizontal: -4,
    marginTop: spacing.xs,
  },

  secondaryButton: {
    flex: 1,
    minHeight: spacing.touch,
    marginHorizontal: 4,
    paddingHorizontal: spacing.md,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryButtonText: {
    marginLeft: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.bold,
  },

  primaryButton: {
    flex: 1.2,
    minHeight: spacing.touch,
    marginHorizontal: 4,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.button,
    backgroundColor: ACCENT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    marginLeft: spacing.sm,
    color: colors.black,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.extraBold,
  },

  footerHint: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    color: colors.textMuted,
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.sm,
    textAlign: 'center',
  },

  pressed: {
    opacity: 0.72,
  },

  buttonPressed: {
    opacity: 0.84,
    transform: [{scale: 0.985}],
  },
});

export default EditMaintenanceScreen;
