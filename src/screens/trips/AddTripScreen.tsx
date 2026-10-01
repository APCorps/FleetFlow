import React, {useState} from 'react';

import {useNavigation} from '@react-navigation/native';

import {
  Alert,
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

import {useDrivers, useTrips, useVehicles} from '../../store';

const TRIP_PURPLE = '#9B5CFF';

const STATUS_COLORS = {
  Scheduled: '#F59E0B',
  'In Progress': '#3B82F6',
  Completed: '#00D6A3',
  Cancelled: '#EF4444',
} as const;

type TripStatus =
  | 'Scheduled'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';

const AddTripScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const {addTrip} = useTrips();
  const {vehicles} = useVehicles();
  const {drivers} = useDrivers();

  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [status, setStatus] = useState<TripStatus>('Scheduled');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [distance, setDistance] = useState('');
  const [notes, setNotes] = useState('');

  const selectedVehicle = vehicles.find(
    vehicle => vehicle.id === vehicleId,
  );

  const selectedDriver = drivers.find(
    driver => driver.id === driverId,
  );

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

    const newTrip = {
      id: `trip-${Date.now()}`,
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
        status === 'Completed' && endTime.trim()
          ? endTime.trim()
          : undefined,
      distance: parsedDistance,
      notes: notes.trim()
        ? notes.trim()
        : undefined,
      createdAt: new Date().toISOString(),
    };

    addTrip(newTrip);

    Alert.alert(
      'Trip Added',
      `${origin.trim()} → ${destination.trim()} has been added successfully.`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ],
    );
  };

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
              Math.max(insets.bottom, 20) + 28,
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

          <View style={styles.headerText}>
            <View style={styles.eyebrowRow}>
              <View style={styles.headerIcon}>
                <MaterialDesignIcons
                  name="map-marker-path"
                  size={18}
                  color={TRIP_PURPLE}
                />
              </View>

              <Text style={styles.eyebrow}>
                FLEET OPERATIONS
              </Text>
            </View>

            <Text style={styles.title}>
              Add Trip
            </Text>

            <Text style={styles.subtitle}>
              Create a new fleet trip
            </Text>
          </View>
        </View>

        {/* TRIP PREVIEW */}
        <View style={styles.previewCard}>
          <View style={styles.previewTopRow}>
            <View style={styles.previewRouteIcon}>
              <MaterialDesignIcons
                name="map-marker-path"
                size={22}
                color={TRIP_PURPLE}
              />
            </View>

            <View style={styles.previewText}>
              <Text style={styles.previewEyebrow}>
                NEW TRIP
              </Text>
              <Text
                style={styles.previewRoute}
                numberOfLines={2}>
                {origin.trim() || 'Origin'}
                <Text style={styles.previewArrow}> → </Text>
                {destination.trim() || 'Destination'}
              </Text>
            </View>

            <View
              style={[
                styles.previewStatus,
                {
                  backgroundColor:
                    `${STATUS_COLORS[status]}16`,
                  borderColor:
                    `${STATUS_COLORS[status]}35`,
                },
              ]}>
              <View
                style={[
                  styles.previewStatusDot,
                  {
                    backgroundColor:
                      STATUS_COLORS[status],
                  },
                ]}
              />
              <Text
                style={[
                  styles.previewStatusText,
                  {
                    color:
                      STATUS_COLORS[status],
                  },
                ]}>
                {status}
              </Text>
            </View>
          </View>

          <View style={styles.previewDivider} />

          <View style={styles.previewMetaRow}>
            <View style={styles.previewMetaItem}>
              <MaterialDesignIcons
                name="calendar-outline"
                size={15}
                color="#7887A1"
              />
              <Text style={styles.previewMetaText}>
                {scheduledDate.trim() || 'Schedule date'}
              </Text>
            </View>

            <View style={styles.previewMetaItem}>
              <MaterialDesignIcons
                name="map-marker-distance"
                size={15}
                color="#7887A1"
              />
              <Text style={styles.previewMetaText}>
                {distance.trim()
                  ? `${distance.trim()} km`
                  : 'Distance'}
              </Text>
            </View>
          </View>
        </View>

        {/* ASSIGNMENT */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIcon}>
              <MaterialDesignIcons
                name="truck-outline"
                size={18}
                color="#55D6FF"
              />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                Assignment
              </Text>
              <Text style={styles.sectionSubtitle}>
                Choose the vehicle and driver for this trip
              </Text>
            </View>
          </View>

          <Text style={styles.label}>
            VEHICLE
          </Text>

          {vehicles.map(vehicle => {
            const selected = vehicleId === vehicle.id;

            return (
              <Pressable
                key={vehicle.id}
                accessibilityRole="radio"
                accessibilityState={{selected}}
                accessibilityLabel={`Select vehicle ${vehicle.registrationNumber}`}
                onPress={() => setVehicleId(vehicle.id)}
                style={({pressed}) => [
                  styles.selectionCard,
                  selected && styles.selectionCardSelected,
                  pressed && styles.pressed,
                ]}>
                <View
                  style={[
                    styles.selectionIcon,
                    selected && styles.selectionIconSelected,
                  ]}>
                  <MaterialDesignIcons
                    name="truck-outline"
                    size={20}
                    color={
                      selected ? '#55D6FF' : '#7887A1'
                    }
                  />
                </View>

                <View style={styles.selectionText}>
                  <Text
                    style={[
                      styles.selectionTitle,
                      selected && styles.selectionTitleSelected,
                    ]}>
                    {vehicle.registrationNumber}
                  </Text>
                  <Text style={styles.selectionSubtitle}>
                    {vehicle.make} {vehicle.model}
                  </Text>
                </View>

                {selected && (
                  <View style={styles.checkCircle}>
                    <MaterialDesignIcons
                      name="check"
                      size={15}
                      color="#08111F"
                    />
                  </View>
                )}
              </Pressable>
            );
          })}

          {vehicles.length === 0 && (
            <View style={styles.emptySelection}>
              <MaterialDesignIcons
                name="truck-alert-outline"
                size={21}
                color="#7887A1"
              />
              <Text style={styles.emptySelectionText}>
                No vehicles available.
              </Text>
            </View>
          )}

          {selectedVehicle && (
            <View style={styles.selectedSummary}>
              <Text style={styles.selectedSummaryLabel}>
                SELECTED VEHICLE
              </Text>
              <Text style={styles.selectedSummaryValue}>
                {selectedVehicle.registrationNumber}
              </Text>
            </View>
          )}

          <Text style={[styles.label, styles.driverLabel]}>
            DRIVER
          </Text>

          {drivers.map(driver => {
            const selected = driverId === driver.id;

            return (
              <Pressable
                key={driver.id}
                accessibilityRole="radio"
                accessibilityState={{selected}}
                accessibilityLabel={`Select driver ${driver.name}`}
                onPress={() => setDriverId(driver.id)}
                style={({pressed}) => [
                  styles.selectionCard,
                  selected && styles.selectionCardSelectedDriver,
                  pressed && styles.pressed,
                ]}>
                <View
                  style={[
                    styles.selectionIcon,
                    selected && styles.selectionIconSelectedDriver,
                  ]}>
                  <MaterialDesignIcons
                    name="account-outline"
                    size={20}
                    color={
                      selected ? '#00D6C9' : '#7887A1'
                    }
                  />
                </View>

                <View style={styles.selectionText}>
                  <Text
                    style={[
                      styles.selectionTitle,
                      selected && styles.selectionTitleSelectedDriver,
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
                      styles.checkCircle,
                      styles.checkCircleDriver,
                    ]}>
                    <MaterialDesignIcons
                      name="check"
                      size={15}
                      color="#06181A"
                    />
                  </View>
                )}
              </Pressable>
            );
          })}

          {drivers.length === 0 && (
            <View style={styles.emptySelection}>
              <MaterialDesignIcons
                name="account-alert-outline"
                size={21}
                color="#7887A1"
              />
              <Text style={styles.emptySelectionText}>
                No drivers available.
              </Text>
            </View>
          )}

          {selectedDriver && (
            <View
              style={[
                styles.selectedSummary,
                styles.selectedSummaryDriver,
              ]}>
              <Text style={styles.selectedSummaryLabel}>
                SELECTED DRIVER
              </Text>
              <Text style={styles.selectedSummaryValue}>
                {selectedDriver.name}
              </Text>
            </View>
          )}
        </View>

        {/* ROUTE */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconPurple}>
              <MaterialDesignIcons
                name="map-marker-distance"
                size={18}
                color={TRIP_PURPLE}
              />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                Route
              </Text>
              <Text style={styles.sectionSubtitle}>
                Define the trip origin and destination
              </Text>
            </View>
          </View>

          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              ORIGIN
            </Text>
            <View style={styles.inputShell}>
              <MaterialDesignIcons
                name="map-marker-outline"
                size={18}
                color="#6F7892"
              />
              <TextInput
                style={styles.input}
                value={origin}
                onChangeText={setOrigin}
                placeholder="e.g. Mumbai"
                placeholderTextColor="#58677F"
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
          </View>

          <View style={styles.routeConnector}>
            <View style={styles.routeConnectorLine} />
            <MaterialDesignIcons
              name="arrow-down"
              size={15}
              color="#59677E"
            />
          </View>

          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              DESTINATION
            </Text>
            <View style={styles.inputShell}>
              <MaterialDesignIcons
                name="flag-outline"
                size={18}
                color="#6F7892"
              />
              <TextInput
                style={styles.input}
                value={destination}
                onChangeText={setDestination}
                placeholder="e.g. Pune"
                placeholderTextColor="#58677F"
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
          </View>
        </View>

        {/* STATUS */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconOrange}>
              <MaterialDesignIcons
                name="swap-horizontal"
                size={19}
                color="#FFC857"
              />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                Trip Status
              </Text>
              <Text style={styles.sectionSubtitle}>
                Set the initial operational state
              </Text>
            </View>
          </View>

          <View style={styles.statusGrid}>
            {(
              [
                'Scheduled',
                'In Progress',
                'Completed',
                'Cancelled',
              ] as TripStatus[]
            ).map(option => {
              const selected = status === option;
              const color = STATUS_COLORS[option];

              return (
                <Pressable
                  key={option}
                  accessibilityRole="radio"
                  accessibilityState={{selected}}
                  accessibilityLabel={`Set trip status to ${option}`}
                  onPress={() => setStatus(option)}
                  style={({pressed}) => [
                    styles.statusOption,
                    selected && {
                      borderColor: `${color}55`,
                      backgroundColor: `${color}12`,
                    },
                    pressed && styles.pressed,
                  ]}>
                  <View
                    style={[
                      styles.statusOptionDot,
                      {backgroundColor: color},
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusOptionText,
                      selected && {color},
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
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconBlue}>
              <MaterialDesignIcons
                name="calendar-clock-outline"
                size={19}
                color="#55D6FF"
              />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                Schedule
              </Text>
              <Text style={styles.sectionSubtitle}>
                Departure timing and completion timing
              </Text>
            </View>
          </View>

          <Text style={styles.label}>
            SCHEDULED DATE
          </Text>
          <View style={styles.inputShell}>
            <MaterialDesignIcons
              name="calendar-outline"
              size={18}
              color="#6F7892"
            />
            <TextInput
              style={styles.input}
              value={scheduledDate}
              onChangeText={setScheduledDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#58677F"
              keyboardType="numbers-and-punctuation"
              returnKeyType="next"
            />
          </View>

          <View style={styles.timeRow}>
            <View style={styles.timeField}>
              <Text style={styles.label}>
                START TIME
              </Text>
              <View style={styles.inputShell}>
                <MaterialDesignIcons
                  name="clock-outline"
                  size={18}
                  color="#6F7892"
                />
                <TextInput
                  style={styles.input}
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="08:30"
                  placeholderTextColor="#58677F"
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </View>

            {status === 'Completed' && (
              <View style={styles.timeField}>
                <Text style={styles.label}>
                  END TIME
                </Text>
                <View style={styles.inputShell}>
                  <MaterialDesignIcons
                    name="clock-check-outline"
                    size={18}
                    color="#00D6A3"
                  />
                  <TextInput
                    style={styles.input}
                    value={endTime}
                    onChangeText={setEndTime}
                    placeholder="16:30"
                    placeholderTextColor="#58677F"
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
              </View>
            )}
          </View>
        </View>

        {/* TRIP METRICS */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconGreen}>
              <MaterialDesignIcons
                name="chart-timeline-variant"
                size={18}
                color="#00D6A3"
              />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                Trip Information
              </Text>
              <Text style={styles.sectionSubtitle}>
                Distance and operational notes
              </Text>
            </View>
          </View>

          <Text style={styles.label}>
            DISTANCE (KM)
          </Text>
          <View style={styles.inputShell}>
            <MaterialDesignIcons
              name="map-marker-distance"
              size={18}
              color="#6F7892"
            />
            <TextInput
              style={styles.input}
              value={distance}
              onChangeText={setDistance}
              placeholder="e.g. 250"
              placeholderTextColor="#58677F"
              keyboardType="numeric"
            />
          </View>

          <Text style={[styles.label, styles.notesLabel]}>
            NOTES
          </Text>
          <View style={[
            styles.inputShell,
            styles.notesShell,
          ]}>
            <MaterialDesignIcons
              name="note-text-outline"
              size={18}
              color="#6F7892"
              style={styles.notesIcon}
            />
            <TextInput
              style={[
                styles.input,
                styles.notesInput,
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Cargo, special instructions, customer reference..."
              placeholderTextColor="#58677F"
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* ACTIONS */}
        <View style={styles.actionsCard}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel adding trip"
            onPress={() => navigation.goBack()}
            style={({pressed}) => [
              styles.cancelButton,
              pressed && styles.pressed,
            ]}>
            <Text style={styles.cancelButtonText}>
              Cancel
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Save trip"
            onPress={handleSave}
            style={({pressed}) => [
              styles.saveButton,
              pressed && styles.saveButtonPressed,
            ]}>
            <MaterialDesignIcons
              name="check"
              size={19}
              color="#FFFFFF"
            />
            <Text style={styles.saveButtonText}>
              Save Trip
            </Text>
          </Pressable>
        </View>
      </ScrollView>
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
    opacity: 0.74,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },

  backButton: {
    width: 42,
    height: 42,
    marginRight: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D1526',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerIcon: {
    width: 28,
    height: 28,
    marginRight: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(155, 92, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.18)',
  },

  eyebrow: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: '#6F7892',
  },

  title: {
    marginTop: 4,
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

  previewCard: {
    marginBottom: 12,
    padding: 15,
    borderRadius: 17,
    backgroundColor: '#0A1120',
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.20)',
  },

  previewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  previewRouteIcon: {
    width: 42,
    height: 42,
    marginRight: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(155, 92, 255, 0.11)',
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.20)',
  },

  previewText: {
    flex: 1,
    minWidth: 0,
    paddingRight: 9,
  },

  previewEyebrow: {
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#6F7892',
  },

  previewRoute: {
    marginTop: 2,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: '#F5F7FF',
  },

  previewArrow: {
    color: TRIP_PURPLE,
  },

  previewStatus: {
    maxWidth: 102,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
  },

  previewStatusDot: {
    width: 6,
    height: 6,
    marginRight: 6,
    borderRadius: 3,
  },

  previewStatusText: {
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '800',
  },

  previewDivider: {
    height: 1,
    marginTop: 13,
    marginBottom: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },

  previewMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  previewMetaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  previewMetaText: {
    marginLeft: 6,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    color: '#8B96B0',
  },

  card: {
    marginBottom: 12,
    padding: 15,
    borderRadius: 17,
    backgroundColor: '#0B1423',
    borderWidth: 1,
    borderColor: '#16263B',
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  sectionIcon: {
    width: 34,
    height: 34,
    marginRight: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(85, 214, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(85, 214, 255, 0.16)',
  },

  sectionIconPurple: {
    width: 34,
    height: 34,
    marginRight: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(155, 92, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.16)',
  },

  sectionIconOrange: {
    width: 34,
    height: 34,
    marginRight: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 200, 87, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 200, 87, 0.16)',
  },

  sectionIconBlue: {
    width: 34,
    height: 34,
    marginRight: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(85, 214, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(85, 214, 255, 0.16)',
  },

  sectionIconGreen: {
    width: 34,
    height: 34,
    marginRight: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 214, 163, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(0, 214, 163, 0.16)',
  },

  sectionHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  sectionTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
    color: '#F5F7FF',
  },

  sectionSubtitle: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    color: '#6F7892',
  },

  label: {
    marginBottom: 7,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#6F7892',
  },

  selectionCard: {
    minHeight: 64,
    marginBottom: 7,
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#0D1526',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },

  selectionCardSelected: {
    backgroundColor: 'rgba(85, 214, 255, 0.07)',
    borderColor: 'rgba(85, 214, 255, 0.28)',
  },

  selectionCardSelectedDriver: {
    backgroundColor: 'rgba(0, 214, 201, 0.07)',
    borderColor: 'rgba(0, 214, 201, 0.28)',
  },

  selectionIcon: {
    width: 36,
    height: 36,
    marginRight: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#101A2C',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },

  selectionIconSelected: {
    backgroundColor: 'rgba(85, 214, 255, 0.10)',
    borderColor: 'rgba(85, 214, 255, 0.18)',
  },

  selectionIconSelectedDriver: {
    backgroundColor: 'rgba(0, 214, 201, 0.10)',
    borderColor: 'rgba(0, 214, 201, 0.18)',
  },

  selectionText: {
    flex: 1,
    minWidth: 0,
  },

  selectionTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: '#D6DEED',
  },

  selectionTitleSelected: {
    color: '#55D6FF',
  },

  selectionTitleSelectedDriver: {
    color: '#00D6C9',
  },

  selectionSubtitle: {
    marginTop: 1,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    color: '#6F7892',
  },

  checkCircle: {
    width: 25,
    height: 25,
    marginLeft: 8,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#55D6FF',
  },

  checkCircleDriver: {
    backgroundColor: '#00D6C9',
  },

  emptySelection: {
    minHeight: 52,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#0D1526',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },

  emptySelectionText: {
    marginLeft: 8,
    fontSize: 12,
    lineHeight: 17,
    color: '#7887A1',
  },

  selectedSummary: {
    marginTop: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(85, 214, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(85, 214, 255, 0.12)',
  },

  selectedSummaryDriver: {
    backgroundColor: 'rgba(0, 214, 201, 0.06)',
    borderColor: 'rgba(0, 214, 201, 0.12)',
  },

  selectedSummaryLabel: {
    fontSize: 8,
    lineHeight: 12,
    fontWeight: '800',
    letterSpacing: 0.9,
    color: '#6F7892',
  },

  selectedSummaryValue: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: '#D7E1F2',
  },

  driverLabel: {
    marginTop: 16,
  },

  inputBlock: {
    width: '100%',
  },

  inputShell: {
    minHeight: 46,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#0D1526',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },

  input: {
    flex: 1,
    minWidth: 0,
    marginLeft: 8,
    paddingVertical: 0,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: '#F5F7FF',
  },

  routeConnector: {
    height: 24,
    marginVertical: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  routeConnectorLine: {
    width: 1,
    height: 14,
    marginRight: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  statusGrid: {
    gap: 7,
  },

  statusOption: {
    minHeight: 46,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: '#0D1526',
  },

  statusOptionDot: {
    width: 7,
    height: 7,
    marginRight: 9,
    borderRadius: 4,
  },

  statusOptionText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
    color: '#A6B1C7',
  },

  timeRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 9,
  },

  timeField: {
    flex: 1,
    minWidth: 0,
  },

  notesLabel: {
    marginTop: 15,
  },

  notesShell: {
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingBottom: 10,
  },

  notesIcon: {
    marginTop: 2,
  },

  notesInput: {
    minHeight: 92,
  },

  actionsCard: {
    marginBottom: 2,
    padding: 10,
    flexDirection: 'row',
    gap: 9,
    borderRadius: 16,
    backgroundColor: '#0A1120',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },

  cancelButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#10182B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },

  cancelButtonText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: '#A9B3C7',
  },

  saveButton: {
    flex: 1.25,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#8B4DE8',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },

  saveButtonPressed: {
    opacity: 0.82,
  },

  saveButtonText: {
    marginLeft: 7,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default AddTripScreen;
