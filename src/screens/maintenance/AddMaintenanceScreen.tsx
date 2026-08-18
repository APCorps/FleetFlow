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

import {Button, Card} from '../../components';
import {useMaintenance, useVehicles} from '../../store';

const AddMaintenanceScreen = () => {
  const navigation = useNavigation();

  const {addMaintenance} = useMaintenance();
  const {vehicles} = useVehicles();

  const [vehicleId, setVehicleId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] =
    useState('');

  const [status, setStatus] =
    useState<
      'Scheduled' | 'In Progress' | 'Completed'
    >('Scheduled');

  const [priority, setPriority] =
    useState<'Low' | 'Medium' | 'High'>('Medium');

  const [scheduledDate, setScheduledDate] =
    useState('');

  const [completedDate, setCompletedDate] =
    useState('');

  const [mileage, setMileage] = useState('');
  const [cost, setCost] = useState('');

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

    addMaintenance({
      id: `maintenance-${Date.now()}`,
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
      createdAt: new Date().toISOString(),
    });

    Alert.alert(
      'Maintenance Added',
      `${title.trim()} has been added successfully.`,
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
        <View style={styles.header}>
          <Text style={styles.title}>
            Add Maintenance
          </Text>

          <Text style={styles.subtitle}>
            Create a vehicle maintenance record
          </Text>
        </View>

        <Card>
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
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>
            Maintenance Information
          </Text>

          <Text style={styles.label}>
            Title
          </Text>

          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Engine Service"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>
            Description
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.descriptionInput,
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the maintenance work"
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>
            Status
          </Text>

          <View style={styles.optionsRow}>
            {(
              [
                'Scheduled',
                'In Progress',
                'Completed',
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
                      : styles.completedSelected),
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
                        : styles.completedText),
                  ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>
            Priority
          </Text>

          <View style={styles.optionsRow}>
            {(
              ['Low', 'Medium', 'High'] as const
            ).map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.priorityOption,
                  priority === option &&
                    (option === 'Low'
                      ? styles.lowPrioritySelected
                      : option === 'Medium'
                      ? styles.mediumPrioritySelected
                      : styles.highPrioritySelected),
                ]}
                onPress={() =>
                  setPriority(option)
                }>
                <Text
                  style={[
                    styles.optionText,
                    priority === option &&
                      (option === 'Low'
                        ? styles.lowPriorityText
                        : option === 'Medium'
                        ? styles.mediumPriorityText
                        : styles.highPriorityText),
                  ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>
            Schedule & Cost
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

          {status === 'Completed' && (
            <>
              <Text style={styles.label}>
                Completed Date
              </Text>

              <TextInput
                style={styles.input}
                value={completedDate}
                onChangeText={setCompletedDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94A3B8"
                keyboardType="numbers-and-punctuation"
              />
            </>
          )}

          <Text style={styles.label}>
            Mileage
          </Text>

          <TextInput
            style={styles.input}
            value={mileage}
            onChangeText={setMileage}
            placeholder="e.g. 50000"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
          />

          <Text style={styles.label}>
            Cost
          </Text>

          <TextInput
            style={styles.input}
            value={cost}
            onChangeText={setCost}
            placeholder="e.g. 5000"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
          />
        </Card>

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
              title="Save Maintenance"
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
    backgroundColor: '#F8FAFC',
  },

  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 16,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0F172A',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: '#64748B',
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
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    fontSize: 15,
    color: '#0F172A',
  },

  descriptionInput: {
    minHeight: 100,
  },

  vehicleOption: {
    marginBottom: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
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

  emptyText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 10,
  },

  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  statusOption: {
    paddingHorizontal: 14,
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

  priorityOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },

  lowPrioritySelected: {
    borderColor: '#86EFAC',
    backgroundColor: '#DCFCE7',
  },

  mediumPrioritySelected: {
    borderColor: '#FDE68A',
    backgroundColor: '#FEF3C7',
  },

  highPrioritySelected: {
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

  lowPriorityText: {
    color: '#166534',
  },

  mediumPriorityText: {
    color: '#92400E',
  },

  highPriorityText: {
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

export default AddMaintenanceScreen;