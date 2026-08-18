import React, {useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {Button, Card, Input} from '../../components';
import {VehicleType} from '../../types';
import {useVehicles} from '../../store';

const AddVehicleScreen = () => {
  const {addVehicle} = useVehicles();
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [type, setType] = useState<VehicleType>('Truck');
  const [mileage, setMileage] = useState('');

  const handleSave = () => {
    if (!registrationNumber.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter the registration number.',
      );
      return;
    }

    if (!make.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter the vehicle make.',
      );
      return;
    }

    if (!model.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter the vehicle model.',
      );
      return;
    }

    if (!year.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter the vehicle year.',
      );
      return;
    }

    if (!mileage.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter the vehicle mileage.',
      );
      return;
    }

    const numericYear = Number(year);
    const numericMileage = Number(mileage);

    if (
      !Number.isInteger(numericYear) ||
      numericYear < 1900 ||
      numericYear > new Date().getFullYear() + 1
    ) {
      Alert.alert(
        'Invalid Year',
        'Please enter a valid vehicle year.',
      );
      return;
    }

    if (
      !Number.isFinite(numericMileage) ||
      numericMileage < 0
    ) {
      Alert.alert(
        'Invalid Mileage',
        'Please enter a valid mileage.',
      );
      return;
    }

    const newVehicle = {
        id: `vehicle-${Date.now()}`,
        registrationNumber: registrationNumber.trim().toUpperCase(),
        make: make.trim(),
        model: model.trim(),
        year: numericYear,
        type,
        status: 'Active' as const,
        mileage: numericMileage,
        createdAt: new Date().toISOString(),
};

addVehicle(newVehicle);

Alert.alert(
  'Vehicle Added',
  `${newVehicle.registrationNumber} has been added successfully.`,
);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Vehicle</Text>

          <Text style={styles.subtitle}>
            Enter the vehicle information below
          </Text>
        </View>

        <Card>
          <Input
            label="Registration Number"
            placeholder="e.g. FL-025"
            value={registrationNumber}
            onChangeText={setRegistrationNumber}
            autoCapitalize="characters"
          />

          <Input
            label="Make"
            placeholder="e.g. Tata"
            value={make}
            onChangeText={setMake}
          />

          <Input
            label="Model"
            placeholder="e.g. Prima"
            value={model}
            onChangeText={setModel}
          />

          <Input
            label="Year"
            placeholder="e.g. 2025"
            value={year}
            onChangeText={setYear}
            keyboardType="number-pad"
          />

          <Input
            label="Vehicle Type"
            placeholder="Truck, Van, Car..."
            value={type}
            onChangeText={value => setType(value as VehicleType)}
            autoCapitalize="words"
          />

          <Input
            label="Mileage"
            placeholder="e.g. 25000"
            value={mileage}
            onChangeText={setMileage}
            keyboardType="number-pad"
          />

          <View style={styles.saveButton}>
            <Button
              title="Save Vehicle"
              onPress={handleSave}
            />
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  header: {
    marginBottom: 24,
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

  saveButton: {
    marginTop: 4,
  },
});

export default AddVehicleScreen;