import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {Button} from '../../components';
import {useDrivers, useTrips, useVehicles} from '../../store';

const AddTripScreen = () => {
  const navigation = useNavigation();

  const {addTrip} = useTrips();
  const {vehicles} = useVehicles();
  const {drivers} = useDrivers();

  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] =
    useState('');

  const [scheduledDate, setScheduledDate] =
    useState('');

  const [status, setStatus] =
    useState<
      | 'Scheduled'
      | 'In Progress'
      | 'Completed'
      | 'Cancelled'
    >('Scheduled');

  const [startTime, setStartTime] =
    useState('');

  const [endTime, setEndTime] =
    useState('');

  const [distance, setDistance] = useState('');
  const [notes, setNotes] = useState('');

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
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Add Trip
          </Text>

          <Text style={styles.subtitle}>
            Create a new fleet trip
          </Text>
        </View>

        {/* Vehicle */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Vehicle
          </Text>

          <Text style={styles.label}>
            Select Vehicle
          </Text>

          {vehicles.map(vehicle => (
            <TouchableOpacity
              key={vehicle.id}
              style={[
                styles.vehicleOption,
                vehicleId === vehicle.id &&
                  styles.vehicleOptionSelected,
              ]}
              onPress={() =>
                setVehicleId(vehicle.id)
              }>
              <Text
                style={[
                  styles.vehicleTitle,
                  vehicleId === vehicle.id &&
                    styles.vehicleTitleSelected,
                ]}>
                {vehicle.registrationNumber}
              </Text>

              <Text style={styles.vehicleSubtitle}>
                {vehicle.make} {vehicle.model}
              </Text>
            </TouchableOpacity>
          ))}

          {vehicles.length === 0 && (
            <Text style={styles.emptyText}>
              No vehicles available.
            </Text>
          )}
        </View>

        {/* Driver */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Driver
          </Text>

          <Text style={styles.label}>
            Select Driver
          </Text>

          {drivers.map(driver => (
            <TouchableOpacity
              key={driver.id}
              style={[
                styles.driverOption,
                driverId === driver.id &&
                  styles.driverOptionSelected,
              ]}
              onPress={() =>
                setDriverId(driver.id)
              }>
              <Text
                style={[
                  styles.driverName,
                  driverId === driver.id &&
                    styles.driverNameSelected,
                ]}>
                {driver.name}
              </Text>

              <Text style={styles.driverSubtitle}>
                {driver.employeeId}
              </Text>
            </TouchableOpacity>
          ))}

          {drivers.length === 0 && (
            <Text style={styles.emptyText}>
              No drivers available.
            </Text>
          )}
        </View>

        {/* Route */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Route
          </Text>

          <Text style={styles.label}>
            Origin
          </Text>

          <TextInput
            style={styles.input}
            value={origin}
            onChangeText={setOrigin}
            placeholder="e.g. Mumbai"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>
            Destination
          </Text>

          <TextInput
            style={styles.input}
            value={destination}
            onChangeText={setDestination}
            placeholder="e.g. Pune"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Status */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Status
          </Text>

          <View style={styles.optionsRow}>
            {(
              [
                'Scheduled',
                'In Progress',
                'Completed',
                'Cancelled',
              ] as const
            ).map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.statusOption,
                  status === option &&
                    (option === 'Scheduled'
                      ? styles.scheduledSelected
                      : option === 'In Progress'
                      ? styles.inProgressSelected
                      : option === 'Completed'
                      ? styles.completedSelected
                      : styles.cancelledSelected),
                ]}
                onPress={() => setStatus(option)}>
                <Text
                  style={[
                    styles.optionText,
                    status === option &&
                      (option === 'Scheduled'
                        ? styles.scheduledText
                        : option === 'In Progress'
                        ? styles.inProgressText
                        : option === 'Completed'
                        ? styles.completedText
                        : styles.cancelledText),
                  ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Schedule */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Schedule
          </Text>

          <Text style={styles.label}>
            Scheduled Date
          </Text>

          <TextInput
            style={styles.input}
            value={scheduledDate}
            onChangeText={setScheduledDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94A3B8"
            keyboardType="numbers-and-punctuation"
          />

          <Text style={styles.label}>
            Start Time
          </Text>

          <TextInput
            style={styles.input}
            value={startTime}
            onChangeText={setStartTime}
            placeholder="e.g. 08:30"
            placeholderTextColor="#94A3B8"
            keyboardType="numbers-and-punctuation"
          />

          {status === 'Completed' && (
            <>
              <Text style={styles.label}>
                End Time
              </Text>

              <TextInput
                style={styles.input}
                value={endTime}
                onChangeText={setEndTime}
                placeholder="e.g. 16:30"
                placeholderTextColor="#94A3B8"
                keyboardType="numbers-and-punctuation"
              />
            </>
          )}
        </View>

        {/* Trip Metrics */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Trip Information
          </Text>

          <Text style={styles.label}>
            Distance
          </Text>

          <TextInput
            style={styles.input}
            value={distance}
            onChangeText={setDistance}
            placeholder="e.g. 250"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
          />

          <Text style={styles.label}>
            Notes
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.notesInput,
            ]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional trip information"
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <View style={styles.actionButton}>
            <Button
              title="Cancel"
              onPress={() =>
                navigation.goBack()
              }
            />
          </View>

          <View style={styles.actionButton}>
            <Button
              title="Save Trip"
              onPress={handleSave}
            />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF4FA',
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0F172A',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#64748B',
  },

  card: {
    marginBottom: 14,
    padding: 18,
    borderRadius: 18,
    backgroundColor:
      'rgba(255, 255, 255, 0.88)',
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.95)',
    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },

  sectionTitle: {
    marginBottom: 16,
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },

  label: {
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },

  input: {
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    fontSize: 15,
    color: '#0F172A',
  },

  notesInput: {
    minHeight: 100,
  },

  vehicleOption: {
    marginBottom: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },

  vehicleOptionSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },

  vehicleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },

  vehicleTitleSelected: {
    color: '#2563EB',
  },

  vehicleSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#64748B',
  },

  driverOption: {
    marginBottom: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },

  driverOptionSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },

  driverName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },

  driverNameSelected: {
    color: '#2563EB',
  },

  driverSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#64748B',
  },

  emptyText: {
    paddingVertical: 10,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },

  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  statusOption: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },

  scheduledSelected: {
    borderColor: '#FDE68A',
    backgroundColor: '#FEF3C7',
  },

  inProgressSelected: {
    borderColor: '#93C5FD',
    backgroundColor: '#DBEAFE',
  },

  completedSelected: {
    borderColor: '#86EFAC',
    backgroundColor: '#DCFCE7',
  },

  cancelledSelected: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEE2E2',
  },

  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },

  scheduledText: {
    color: '#92400E',
  },

  inProgressText: {
    color: '#1D4ED8',
  },

  completedText: {
    color: '#166534',
  },

  cancelledText: {
    color: '#991B1B',
  },

  actions: {
    flexDirection: 'row',
    marginHorizontal: -4,
    marginTop: 4,
    marginBottom: 20,
  },

  actionButton: {
    flex: 1,
    paddingHorizontal: 4,
  },
});

export default AddTripScreen;