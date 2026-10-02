import React, {useState} from 'react';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import type {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

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

import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {
  MaterialDesignIcons,
} from '@react-native-vector-icons/material-design-icons/static';

import type {
  RootStackParamList,
} from '../../navigation/AppNavigator';

import {
  useDrivers,
  useTrips,
  useVehicles,
} from '../../store';

import type {
  Trip,
} from '../../types';

type EditTripNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;

type EditableTripStatus =
  | 'Scheduled'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';

const TRIP_PURPLE = '#9B5CFF';

const STATUS_COLORS = {
  Scheduled: '#F59E0B',
  'In Progress': '#3B82F6',
  Completed: '#00D6A3',
  Cancelled: '#EF4444',
} as const;

const EditTripScreen = () => {
  const insets = useSafeAreaInsets();

  const navigation =
    useNavigation<EditTripNavigationProp>();

  const route = useRoute();

  const {updateTrip} = useTrips();
  const {vehicles} = useVehicles();
  const {drivers} = useDrivers();

  const {trip} = route.params as {
    trip: Trip;
  };

  const [vehicleId, setVehicleId] =
    useState(trip.vehicleId);

  const [driverId, setDriverId] =
    useState(trip.driverId);

  const [origin, setOrigin] =
    useState(trip.origin);

  const [destination, setDestination] =
    useState(trip.destination);

  const [scheduledDate, setScheduledDate] =
    useState(trip.scheduledDate);

  const [status, setStatus] =
    useState<EditableTripStatus>(trip.status);

  const [startTime, setStartTime] =
    useState(trip.startTime ?? '');

  const [endTime, setEndTime] =
    useState(trip.endTime ?? '');

  const [distance, setDistance] =
    useState(
      trip.distance !== undefined
        ? String(trip.distance)
        : '',
    );

  const [notes, setNotes] =
    useState(trip.notes ?? '');

  const selectedVehicle = vehicles.find(
    vehicle => vehicle.id === vehicleId,
  );

  const selectedDriver = drivers.find(
    driver => driver.id === driverId,
  );

  const getStatusColor = (
    value: EditableTripStatus,
  ) => STATUS_COLORS[value];

  const getTripProgress = (
    value: EditableTripStatus,
  ) => {
    switch (value) {
      case 'Completed':
        return 100;

      case 'In Progress':
        return 62;

      case 'Scheduled':
        return 0;

      case 'Cancelled':
        return 0;

      default:
        return 0;
    }
  };

  const handleSave = () => {
    if (!vehicleId) {
      Alert.alert(
        'Missing Information',
        'Please select a vehicle.',
      );
      return;
    }

    if (!driverId) {
      Alert.alert(
        'Missing Information',
        'Please select a driver.',
      );
      return;
    }

    if (!origin.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter the origin.',
      );
      return;
    }

    if (!destination.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter the destination.',
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
      !endTime.trim()
    ) {
      Alert.alert(
        'Missing Information',
        'Please enter the end time for a completed trip.',
      );
      return;
    }

    const parsedDistance = distance.trim()
      ? Number(distance)
      : undefined;

    if (
      parsedDistance !== undefined &&
      Number.isNaN(parsedDistance)
    ) {
      Alert.alert(
        'Invalid Distance',
        'Please enter a valid distance.',
      );
      return;
    }

    const updatedTrip: Trip = {
      ...trip,
      vehicleId,
      driverId,
      origin: origin.trim(),
      destination: destination.trim(),
      scheduledDate: scheduledDate.trim(),
      status,
      startTime: startTime.trim()
        ? startTime.trim()
        : undefined,
      endTime:
        status === 'Completed' &&
        endTime.trim()
          ? endTime.trim()
          : undefined,
      distance: parsedDistance,
      notes: notes.trim()
        ? notes.trim()
        : undefined,
    };

    updateTrip(updatedTrip);

    Alert.alert(
      'Trip Updated',
      `${origin.trim()} → ${destination.trim()} has been updated successfully.`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ],
    );
  };

  const progress = getTripProgress(status);
  const progressColor = getStatusColor(status);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.safeAreaTop,
          {height: insets.top},
        ]}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom:
                Math.max(insets.bottom, 20) + 24,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* HEADER */}
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
                size={20}
                color="#F5F7FF"
              />
            </Pressable>

            <View style={styles.headerIcon}>
              <MaterialDesignIcons
                name="map-marker-path"
                size={23}
                color={TRIP_PURPLE}
              />
            </View>

            <View style={styles.headerText}>
              <Text style={styles.eyebrow}>
                FLEET OPERATIONS
              </Text>

              <Text style={styles.title}>
                Edit Trip
              </Text>

              <Text style={styles.subtitle}>
                Update trip information
              </Text>
            </View>
          </View>

          {/* TRIP SUMMARY */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRouteBlock}>
              <Text
                style={styles.summaryRoute}
                numberOfLines={2}>
                {origin.trim() || trip.origin}
                {' → '}
                {destination.trim() || trip.destination}
              </Text>

              <Text style={styles.summaryMeta}>
                {trip.id}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    `${progressColor}14`,
                  borderColor:
                    `${progressColor}35`,
                },
              ]}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      progressColor,
                  },
                ]}
              />
              <Text
                style={[
                  styles.statusBadgeText,
                  {color: progressColor},
                ]}>
                {status}
              </Text>
            </View>
          </View>

          {/* PROGRESS */}
          <View style={styles.card}>
            <View style={styles.sectionHeadingRow}>
              <View style={styles.sectionHeadingText}>
                <Text style={styles.sectionEyebrow}>
                  TRIP PROGRESS
                </Text>
                <Text style={styles.sectionTitle}>
                  Operational progress
                </Text>
              </View>

              <Text
                style={[
                  styles.progressValue,
                  {color: progressColor},
                ]}>
                {progress}%
              </Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress}%`,
                    backgroundColor: progressColor,
                  },
                ]}
              />
            </View>

            <View style={styles.progressMetaRow}>
              <Text style={styles.progressMetaText}>
                {status === 'Completed'
                  ? 'Trip completed'
                  : status === 'In Progress'
                  ? 'Trip currently in transit'
                  : status === 'Cancelled'
                  ? 'Tracking paused for cancelled trip'
                  : 'Trip has not started'}
              </Text>

              {status === 'In Progress' && (
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>
                    LIVE
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* VEHICLE */}
          <View style={styles.card}>
            <View style={styles.sectionHeaderWithIcon}>
              <View style={styles.sectionIcon}>
                <MaterialDesignIcons
                  name="truck-outline"
                  size={18}
                  color="#1688FF"
                />
              </View>
              <View>
                <Text style={styles.sectionEyebrow}>
                  ASSIGNMENT
                </Text>
                <Text style={styles.sectionTitleCompact}>
                  Vehicle
                </Text>
              </View>
            </View>

            {vehicles.map(vehicle => {
              const selected =
                vehicleId === vehicle.id;

              return (
                <Pressable
                  key={vehicle.id}
                  accessibilityRole="radio"
                  accessibilityState={{selected}}
                  onPress={() =>
                    setVehicleId(vehicle.id)
                  }
                  style={({pressed}) => [
                    styles.selectionCard,
                    selected &&
                      styles.selectionCardSelected,
                    pressed && styles.pressed,
                  ]}>
                  <View style={styles.selectionIcon}>
                    <MaterialDesignIcons
                      name="truck-outline"
                      size={18}
                      color={
                        selected
                          ? '#1688FF'
                          : '#7E8BA5'
                      }
                    />
                  </View>

                  <View style={styles.selectionTextBlock}>
                    <Text
                      style={[
                        styles.selectionTitle,
                        selected &&
                          styles.selectionTitleSelected,
                      ]}>
                      {vehicle.registrationNumber}
                    </Text>

                    <Text style={styles.selectionSubtitle}>
                      {vehicle.make} {vehicle.model}
                    </Text>
                  </View>

                  {selected && (
                    <View style={styles.selectionCheck}>
                      <MaterialDesignIcons
                        name="check"
                        size={17}
                        color="#FFFFFF"
                      />
                    </View>
                  )}
                </Pressable>
              );
            })}

            {vehicles.length === 0 && (
              <Text style={styles.emptyText}>
                No vehicles available.
              </Text>
            )}

            {selectedVehicle && (
              <View style={styles.selectedInfoRow}>
                <MaterialDesignIcons
                  name="check-circle-outline"
                  size={15}
                  color="#39E6C4"
                />
                <Text style={styles.selectedInfoText}>
                  Selected: {selectedVehicle.registrationNumber}
                </Text>
              </View>
            )}
          </View>

          {/* DRIVER */}
          <View style={styles.card}>
            <View style={styles.sectionHeaderWithIcon}>
              <View
                style={[
                  styles.sectionIcon,
                  styles.driverSectionIcon,
                ]}>
                <MaterialDesignIcons
                  name="account-outline"
                  size={18}
                  color="#00D6C9"
                />
              </View>
              <View>
                <Text style={styles.sectionEyebrow}>
                  ASSIGNMENT
                </Text>
                <Text style={styles.sectionTitleCompact}>
                  Driver
                </Text>
              </View>
            </View>

            {drivers.map(driver => {
              const selected =
                driverId === driver.id;

              return (
                <Pressable
                  key={driver.id}
                  accessibilityRole="radio"
                  accessibilityState={{selected}}
                  onPress={() =>
                    setDriverId(driver.id)
                  }
                  style={({pressed}) => [
                    styles.selectionCard,
                    selected &&
                      styles.driverSelectionSelected,
                    pressed && styles.pressed,
                  ]}>
                  <View
                    style={[
                      styles.selectionIcon,
                      styles.driverSelectionIcon,
                    ]}>
                    <MaterialDesignIcons
                      name="account-outline"
                      size={18}
                      color={
                        selected
                          ? '#00D6C9'
                          : '#7E8BA5'
                      }
                    />
                  </View>

                  <View style={styles.selectionTextBlock}>
                    <Text
                      style={[
                        styles.selectionTitle,
                        selected &&
                          styles.driverSelectionTitle,
                      ]}>
                      {driver.name}
                    </Text>

                    <Text style={styles.selectionSubtitle}>
                      {driver.employeeId}
                    </Text>
                  </View>

                  {selected && (
                    <View
                      style={[
                        styles.selectionCheck,
                        styles.driverSelectionCheck,
                      ]}>
                      <MaterialDesignIcons
                        name="check"
                        size={17}
                        color="#071415"
                      />
                    </View>
                  )}
                </Pressable>
              );
            })}

            {drivers.length === 0 && (
              <Text style={styles.emptyText}>
                No drivers available.
              </Text>
            )}

            {selectedDriver && (
              <View style={styles.selectedInfoRow}>
                <MaterialDesignIcons
                  name="check-circle-outline"
                  size={15}
                  color="#39E6C4"
                />
                <Text style={styles.selectedInfoText}>
                  Selected: {selectedDriver.name}
                </Text>
              </View>
            )}
          </View>

          {/* ROUTE */}
          <View style={styles.card}>
            <View style={styles.sectionHeaderWithIcon}>
              <View
                style={[
                  styles.sectionIcon,
                  styles.routeSectionIcon,
                ]}>
                <MaterialDesignIcons
                  name="map-marker-path"
                  size={18}
                  color={TRIP_PURPLE}
                />
              </View>
              <View>
                <Text style={styles.sectionEyebrow}>
                  ROUTE
                </Text>
                <Text style={styles.sectionTitleCompact}>
                  Trip route
                </Text>
              </View>
            </View>

            <Field
              label="Origin"
              value={origin}
              onChangeText={setOrigin}
              placeholder="e.g. Mumbai"
              icon="map-marker-outline"
            />

            <Field
              label="Destination"
              value={destination}
              onChangeText={setDestination}
              placeholder="e.g. Pune"
              icon="flag-checkered"
            />
          </View>

          {/* STATUS */}
          <View style={styles.card}>
            <View style={styles.sectionHeaderWithIcon}>
              <View
                style={[
                  styles.sectionIcon,
                  {
                    backgroundColor:
                      'rgba(155, 92, 255, 0.10)',
                    borderColor:
                      'rgba(155, 92, 255, 0.20)',
                  },
                ]}>
                <MaterialDesignIcons
                  name="swap-horizontal"
                  size={18}
                  color={TRIP_PURPLE}
                />
              </View>
              <View>
                <Text style={styles.sectionEyebrow}>
                  WORKFLOW
                </Text>
                <Text style={styles.sectionTitleCompact}>
                  Status
                </Text>
              </View>
            </View>

            <Text style={styles.helperText}>
              Set the current operational state of this trip.
            </Text>

            <View style={styles.optionsGrid}>
              {(
                [
                  'Scheduled',
                  'In Progress',
                  'Completed',
                  'Cancelled',
                ] as EditableTripStatus[]
              ).map(option => {
                const selected = status === option;
                const color =
                  getStatusColor(option);

                return (
                  <Pressable
                    key={option}
                    accessibilityRole="radio"
                    accessibilityState={{
                      selected,
                    }}
                    onPress={() =>
                      setStatus(option)
                    }
                    style={({pressed}) => [
                      styles.statusOption,
                      selected && {
                        borderColor: `${color}52`,
                        backgroundColor: `${color}0F`,
                      },
                      pressed && styles.pressed,
                    ]}>
                    <View
                      style={[
                        styles.statusOptionDot,
                        {
                          backgroundColor: color,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusOptionText,
                        selected && {
                          color,
                        },
                      ]}>
                      {option}
                    </Text>

                    {selected && (
                      <MaterialDesignIcons
                        name="check-circle"
                        size={16}
                        color={color}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* SCHEDULE */}
          <View style={styles.card}>
            <View style={styles.sectionHeaderWithIcon}>
              <View
                style={[
                  styles.sectionIcon,
                  styles.scheduleSectionIcon,
                ]}>
                <MaterialDesignIcons
                  name="calendar-clock-outline"
                  size={18}
                  color="#55D6FF"
                />
              </View>
              <View>
                <Text style={styles.sectionEyebrow}>
                  TIMING
                </Text>
                <Text style={styles.sectionTitleCompact}>
                  Schedule
                </Text>
              </View>
            </View>

            <Field
              label="Scheduled Date"
              value={scheduledDate}
              onChangeText={setScheduledDate}
              placeholder="YYYY-MM-DD"
              icon="calendar-outline"
              keyboardType="numbers-and-punctuation"
            />

            <Field
              label="Start Time"
              value={startTime}
              onChangeText={setStartTime}
              placeholder="e.g. 08:30"
              icon="clock-outline"
              keyboardType="numbers-and-punctuation"
            />

            {status === 'Completed' && (
              <Field
                label="End Time"
                value={endTime}
                onChangeText={setEndTime}
                placeholder="e.g. 16:30"
                icon="clock-check-outline"
                keyboardType="numbers-and-punctuation"
              />
            )}
          </View>

          {/* TRIP INFORMATION */}
          <View style={styles.card}>
            <View style={styles.sectionHeaderWithIcon}>
              <View
                style={[
                  styles.sectionIcon,
                  styles.infoSectionIcon,
                ]}>
                <MaterialDesignIcons
                  name="information-outline"
                  size={18}
                  color="#C15CFF"
                />
              </View>
              <View>
                <Text style={styles.sectionEyebrow}>
                  DETAILS
                </Text>
                <Text style={styles.sectionTitleCompact}>
                  Trip information
                </Text>
              </View>
            </View>

            <Field
              label="Distance"
              value={distance}
              onChangeText={setDistance}
              placeholder="e.g. 250"
              icon="map-marker-distance"
              keyboardType="numeric"
            />

            <Field
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional trip information"
              icon="note-text-outline"
              multiline
            />
          </View>

          {/* ACTIONS */}
          <View style={styles.actionsCard}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel editing trip"
              onPress={() => navigation.goBack()}
              style={({pressed}) => [
                styles.secondaryAction,
                pressed && styles.pressed,
              ]}>
              <MaterialDesignIcons
                name="close"
                size={18}
                color="#A6B0C3"
              />
              <Text style={styles.secondaryActionText}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save trip changes"
              onPress={handleSave}
              style={({pressed}) => [
                styles.primaryAction,
                pressed && styles.primaryActionPressed,
              ]}>
              <MaterialDesignIcons
                name="content-save-outline"
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.primaryActionText}>
                Save Changes
              </Text>
            </Pressable>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  icon: string;
  keyboardType?:
    | 'default'
    | 'numeric'
    | 'numbers-and-punctuation';
  multiline?: boolean;
};

const Field = ({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  keyboardType = 'default',
  multiline = false,
}: FieldProps) => {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>
        {label}
      </Text>

      <View
        style={[
          styles.inputShell,
          multiline && styles.inputShellMultiline,
        ]}>
        <MaterialDesignIcons
          name={icon as any}
          size={17}
          color="#66738C"
        />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#58657D"
          style={[
            styles.input,
            multiline && styles.notesInput,
          ]}
          keyboardType={keyboardType}
          multiline={multiline}
          textAlignVertical={
            multiline ? 'top' : 'center'
          }
          autoCapitalize="sentences"
        />
      </View>
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

  keyboardAvoiding: {
    flex: 1,
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

  backButton: {
    width: 42,
    height: 42,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#0B1221',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },

  headerIcon: {
    width: 46,
    height: 46,
    marginRight: 12,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(155, 92, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.20)',
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
    minHeight: 84,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    backgroundColor: 'rgba(18, 24, 46, 0.84)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },

  summaryRouteBlock: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },

  summaryRoute: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
    color: '#F5F7FF',
  },

  summaryMeta: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    color: '#6F7892',
  },

  statusBadge: {
    flexShrink: 0,
    paddingHorizontal: 9,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
  },

  statusDot: {
    width: 6,
    height: 6,
    marginRight: 6,
    borderRadius: 3,
  },

  statusBadgeText: {
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '800',
  },

  card: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#0B1423',
    borderWidth: 1,
    borderColor: '#16263B',
  },

  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionHeadingText: {
    flex: 1,
    minWidth: 0,
  },

  sectionEyebrow: {
    marginBottom: 3,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#68748D',
  },

  sectionTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
    color: '#F5F7FF',
  },

  sectionTitleCompact: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '800',
    color: '#F5F7FF',
  },

  progressValue: {
    marginLeft: 12,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '800',
  },

  progressTrack: {
    height: 8,
    marginTop: 13,
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: '#172238',
  },

  progressFill: {
    height: '100%',
    borderRadius: 999,
  },

  progressMetaRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  progressMetaText: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
    fontSize: 11,
    lineHeight: 16,
    color: '#7F8AA3',
  },

  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  liveDot: {
    width: 6,
    height: 6,
    marginRight: 5,
    borderRadius: 3,
    backgroundColor: '#39E6C4',
  },

  liveText: {
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 0.9,
    color: '#39E6C4',
  },

  sectionHeaderWithIcon: {
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionIcon: {
    width: 36,
    height: 36,
    marginRight: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(22, 136, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(22, 136, 255, 0.18)',
  },

  driverSectionIcon: {
    backgroundColor: 'rgba(0, 214, 201, 0.10)',
    borderColor: 'rgba(0, 214, 201, 0.18)',
  },

  routeSectionIcon: {
    backgroundColor: 'rgba(155, 92, 255, 0.10)',
    borderColor: 'rgba(155, 92, 255, 0.18)',
  },

  scheduleSectionIcon: {
    backgroundColor: 'rgba(85, 214, 255, 0.10)',
    borderColor: 'rgba(85, 214, 255, 0.18)',
  },

  infoSectionIcon: {
    backgroundColor: 'rgba(193, 92, 255, 0.10)',
    borderColor: 'rgba(193, 92, 255, 0.18)',
  },

  selectionCard: {
    minHeight: 62,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: '#0D1728',
  },

  selectionCardSelected: {
    borderColor: 'rgba(22, 136, 255, 0.32)',
    backgroundColor: 'rgba(22, 136, 255, 0.08)',
  },

  driverSelectionSelected: {
    borderColor: 'rgba(0, 214, 201, 0.30)',
    backgroundColor: 'rgba(0, 214, 201, 0.07)',
  },

  selectionIcon: {
    width: 34,
    height: 34,
    marginRight: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111D30',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },

  driverSelectionIcon: {
    backgroundColor: '#0F2224',
    borderColor: 'rgba(0, 214, 201, 0.10)',
  },

  selectionTextBlock: {
    flex: 1,
    minWidth: 0,
  },

  selectionTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: '#CBD3E6',
  },

  selectionTitleSelected: {
    color: '#75AEFF',
  },

  driverSelectionTitle: {
    color: '#62E6DF',
  },

  selectionSubtitle: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    color: '#74819A',
  },

  selectionCheck: {
    width: 24,
    height: 24,
    marginLeft: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1688FF',
  },

  driverSelectionCheck: {
    backgroundColor: '#00D6C9',
  },

  selectedInfoRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectedInfoText: {
    marginLeft: 6,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    color: '#7F8DA8',
  },

  emptyText: {
    paddingVertical: 10,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    color: '#6F7892',
  },

  helperText: {
    marginTop: -5,
    marginBottom: 12,
    fontSize: 11,
    lineHeight: 16,
    color: '#727F98',
  },

  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  statusOption: {
    minHeight: 44,
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: '#0D1728',
  },

  statusOptionDot: {
    width: 7,
    height: 7,
    marginRight: 7,
    borderRadius: 4,
  },

  statusOptionText: {
    marginRight: 6,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#9AA4BF',
  },

  fieldBlock: {
    marginBottom: 12,
  },

  fieldLabel: {
    marginBottom: 6,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    color: '#8995AC',
  },

  inputShell: {
    minHeight: 46,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#081120',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },

  inputShellMultiline: {
    minHeight: 112,
    alignItems: 'flex-start',
    paddingTop: 12,
  },

  input: {
    flex: 1,
    minWidth: 0,
    marginLeft: 9,
    paddingVertical: 0,
    fontSize: 13,
    lineHeight: 18,
    color: '#F5F7FF',
  },

  notesInput: {
    minHeight: 84,
  },

  actionsCard: {
    marginTop: 2,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  secondaryAction: {
    minHeight: 48,
    flex: 0.85,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#0B1221',
  },

  secondaryActionText: {
    marginLeft: 6,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: '#A6B0C3',
  },

  primaryAction: {
    minHeight: 48,
    flex: 1.15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#8B4DE8',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },

  primaryActionPressed: {
    opacity: 0.86,
  },

  primaryActionText: {
    marginLeft: 7,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default EditTripScreen;
