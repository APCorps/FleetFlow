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
import {useDrivers, useVehicles} from '../../store';

const AddDriverScreen = () => {
  const navigation = useNavigation();

  const {addDriver} = useDrivers();
  const {vehicles} = useVehicles();

  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [licenseNumber, setLicenseNumber] =
    useState('');
  const [licenseExpiry, setLicenseExpiry] =
    useState('');
  const [status, setStatus] =
    useState<'Active' | 'Inactive' | 'On Leave'>(
      'Active',
    );
  const [assignedVehicleId, setAssignedVehicleId] =
    useState<string | undefined>(undefined);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter the driver name.',
      );
      return;
    }

    if (!employeeId.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter the employee ID.',
      );
      return;
    }

    if (!phone.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter the phone number.',
      );
      return;
    }

    if (!email.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter the email address.',
      );
      return;
    }

    if (!licenseNumber.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter the license number.',
      );
      return;
    }

    if (!licenseExpiry.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter the license expiry date.',
      );
      return;
    }

    const newDriver = {
      id: `driver-${Date.now()}`,
      name: name.trim(),
      employeeId: employeeId.trim(),
      phone: phone.trim(),
      email: email.trim(),
      licenseNumber: licenseNumber.trim(),
      licenseExpiry: licenseExpiry.trim(),
      status,
      assignedVehicleId,
      createdAt: new Date().toISOString(),
    };

    addDriver(newDriver);

    Alert.alert(
      'Driver Added',
      `${name.trim()} has been added successfully.`,
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
            Add Driver
          </Text>

          <Text style={styles.subtitle}>
            Complete driver information
          </Text>
        </View>

        <Card>
          <Text style={styles.sectionTitle}>
            Personal Information
          </Text>

          <Text style={styles.label}>
            Full Name
          </Text>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter full name"
            placeholderTextColor="#94A3B8"
            autoCapitalize="words"
          />

          <Text style={styles.label}>
            Employee ID
          </Text>

          <TextInput
            style={styles.input}
            value={employeeId}
            onChangeText={setEmployeeId}
            placeholder="e.g. DRV-004"
            placeholderTextColor="#94A3B8"
            autoCapitalize="characters"
          />

          <Text style={styles.label}>
            Phone
          </Text>

          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone number"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>
            Email
          </Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email address"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>
            License Information
          </Text>

          <Text style={styles.label}>
            License Number
          </Text>

          <TextInput
            style={styles.input}
            value={licenseNumber}
            onChangeText={setLicenseNumber}
            placeholder="Enter license number"
            placeholderTextColor="#94A3B8"
            autoCapitalize="characters"
          />

          <Text style={styles.label}>
            License Expiry
          </Text>

          <TextInput
            style={styles.input}
            value={licenseExpiry}
            onChangeText={setLicenseExpiry}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94A3B8"
            keyboardType="numbers-and-punctuation"
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>
            Driver Status
          </Text>

          <View style={styles.statusOptions}>
            {(
              ['Active', 'Inactive', 'On Leave'] as const
            ).map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.statusOption,
                  status === option &&
                    (option === 'Active'
                      ? styles.activeStatusSelected
                      : option === 'Inactive'
                      ? styles.inactiveStatusSelected
                      : styles.leaveStatusSelected),
                ]}
                onPress={() => setStatus(option)}>
                <Text
                  style={[
                    styles.statusOptionText,
                    status === option &&
                      (option === 'Active'
                        ? styles.activeStatusText
                        : option === 'Inactive'
                        ? styles.inactiveStatusText
                        : styles.leaveStatusText),
                  ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>
            Assigned Vehicle
          </Text>

          <TouchableOpacity
            style={[
              styles.vehicleOption,
              assignedVehicleId === undefined &&
                styles.vehicleOptionSelected,
            ]}
            onPress={() =>
              setAssignedVehicleId(undefined)
            }>
            <Text
              style={[
                styles.vehicleOptionTitle,
                assignedVehicleId === undefined &&
                  styles.vehicleOptionTitleSelected,
              ]}>
              No vehicle assigned
            </Text>
          </TouchableOpacity>

          {vehicles.map(vehicle => (
            <TouchableOpacity
              key={vehicle.id}
              style={[
                styles.vehicleOption,
                assignedVehicleId === vehicle.id &&
                  styles.vehicleOptionSelected,
              ]}
              onPress={() =>
                setAssignedVehicleId(vehicle.id)
              }>
              <Text
                style={[
                  styles.vehicleOptionTitle,
                  assignedVehicleId === vehicle.id &&
                    styles.vehicleOptionTitleSelected,
                ]}>
                {vehicle.registrationNumber}
              </Text>

              <Text style={styles.vehicleOptionSubtitle}>
                {vehicle.make} {vehicle.model}
              </Text>
            </TouchableOpacity>
          ))}
        </Card>

        <View style={styles.actions}>
          <View style={styles.actionButton}>
            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
            />
          </View>

          <View style={styles.actionButton}>
            <Button
              title="Save Driver"
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

  statusOptions: {
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

  activeStatusSelected: {
    borderColor: '#86EFAC',
    backgroundColor: '#DCFCE7',
  },

  inactiveStatusSelected: {
    borderColor: '#FDE68A',
    backgroundColor: '#FEF3C7',
  },

  leaveStatusSelected: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEE2E2',
  },

  statusOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },

  activeStatusText: {
    color: '#166534',
  },

  inactiveStatusText: {
    color: '#92400E',
  },

  leaveStatusText: {
    color: '#991B1B',
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

  vehicleOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },

  vehicleOptionTitleSelected: {
    color: '#2563EB',
  },

  vehicleOptionSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#64748B',
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

export default AddDriverScreen;