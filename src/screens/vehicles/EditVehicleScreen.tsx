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
import {useVehicles} from '../../store';
import {Vehicle, VehicleType} from '../../types';

interface EditVehicleScreenProps {
  route: {
    params: {
      vehicle: Vehicle;
    };
  };
  navigation: {
    goBack: () => void;
  };
}

const EditVehicleScreen = ({
  route,
  navigation,
}: EditVehicleScreenProps) => {
  const {vehicle} = route.params;
  const {updateVehicle} = useVehicles();

  const [registrationNumber, setRegistrationNumber] = useState(
    vehicle.registrationNumber,
  );
  const [make, setMake] = useState(vehicle.make);
  const [model, setModel] = useState(vehicle.model);
  const [year, setYear] = useState(String(vehicle.year));
  const [type, setType] = useState<VehicleType>(vehicle.type);
  const [mileage, setMileage] = useState(String(vehicle.mileage));

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

    const updatedVehicle: Vehicle = {
      ...vehicle,
      registrationNumber: registrationNumber.trim().toUpperCase(),
      make: make.trim(),
      model: model.trim(),
      year: numericYear,
      type,
      mileage: numericMileage,
    };

    updateVehicle(updatedVehicle);

    Alert.alert(
      'Vehicle Updated',
      `${updatedVehicle.registrationNumber} has been updated successfully.`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ],
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
          <Text style={styles.title}>Edit Vehicle</Text>

          <Text style={styles.subtitle}>
            Update vehicle information
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
              title="Save Changes"
              onPress={handleSave}
            />
          </View>

          <View style={styles.cancelButton}>
            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
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

  cancelButton: {
    marginTop: 12,
  },
});

export default EditVehicleScreen;