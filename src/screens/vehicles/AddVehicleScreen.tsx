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

import {useSafeAreaInsets} from 'react-native-safe-area-context';

import MaterialDesignIcons from
  '@react-native-vector-icons/material-design-icons/static';

import {Button, Card, Input} from '../../components';
import {useVehicles} from '../../store';
import {VehicleType} from '../../types';

const VEHICLE_BLUE = '#1688FF';

const AddVehicleScreen = () => {
  const insets = useSafeAreaInsets();

  const {addVehicle} = useVehicles();

  const [registrationNumber, setRegistrationNumber] =
    useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [type, setType] =
    useState<VehicleType>('Truck');
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
      registrationNumber:
        registrationNumber.trim().toUpperCase(),
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
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }>

      <View
        style={[
          styles.safeAreaTop,
          {
            height: insets.top,
          },
        ]}
      />

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
          <View style={styles.headerIcon}>
            <MaterialDesignIcons
              name="truck-plus-outline"
              size={22}
              color={VEHICLE_BLUE}
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>
              FLEET SETUP
            </Text>

            <Text style={styles.title}>
              Add Vehicle
            </Text>

            <Text style={styles.subtitle}>
              Enter the vehicle information below
            </Text>
          </View>
        </View>

        {/* FORM */}

        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Vehicle Information
            </Text>

            <Text style={styles.sectionSubtitle}>
              Add the core details used across your fleet records.
            </Text>
          </View>

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
            onChangeText={value =>
              setType(value as VehicleType)
            }
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

        {/* STATUS NOTE */}

        <View style={styles.noteCard}>
          <View style={styles.noteIcon}>
            <MaterialDesignIcons
              name="information-outline"
              size={18}
              color="#55D6FF"
            />
          </View>

          <View style={styles.noteText}>
            <Text style={styles.noteTitle}>
              New vehicles start as Active
            </Text>

            <Text style={styles.noteDescription}>
              The vehicle will be created with Active status and can be updated later.
            </Text>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
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

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },

  headerIcon: {
    width: 44,
    height: 44,
    marginRight: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(22, 136, 255, 0.10)',
    borderWidth: 1,
    borderColor:
      'rgba(22, 136, 255, 0.20)',
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

  sectionHeader: {
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
    color: '#F5F7FF',
  },

  sectionSubtitle: {
    marginTop: 4,
    marginBottom: 8,
    fontSize: 12,
    lineHeight: 17,
    color: '#6F7892',
  },

  saveButton: {
    marginTop: 6,
  },

  noteCard: {
    marginTop: 14,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 14,
    backgroundColor:
      'rgba(18, 24, 46, 0.70)',
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.06)',
  },

  noteIcon: {
    width: 34,
    height: 34,
    marginRight: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(85, 214, 255, 0.10)',
    borderWidth: 1,
    borderColor:
      'rgba(85, 214, 255, 0.16)',
  },

  noteText: {
    flex: 1,
    minWidth: 0,
  },

  noteTitle: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
    color: '#CBD3E6',
  },

  noteDescription: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    color: '#6F7892',
  },
});

export default AddVehicleScreen;
