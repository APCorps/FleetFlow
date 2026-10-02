import React, {useState} from 'react';

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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

const VEHICLE_BLUE = '#1688FF';

const EditVehicleScreen = ({
  route,
  navigation,
}: EditVehicleScreenProps) => {
  const insets = useSafeAreaInsets();

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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
            style={({pressed}) => [
              styles.backButton,
              pressed &&
                styles.backButtonPressed,
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
                  name="truck-outline"
                  size={18}
                  color={VEHICLE_BLUE}
                />
              </View>

              <Text style={styles.eyebrow}>
                VEHICLE
              </Text>
            </View>

            <Text style={styles.title}>
              Edit Vehicle
            </Text>

            <Text style={styles.subtitle}>
              Update vehicle information
            </Text>
          </View>
        </View>

        {/* VEHICLE CONTEXT */}

        <View style={styles.contextCard}>
          <View style={styles.contextIcon}>
            <MaterialDesignIcons
              name="card-text-outline"
              size={20}
              color={VEHICLE_BLUE}
            />
          </View>

          <View style={styles.contextText}>
            <Text style={styles.contextRegistration}>
              {vehicle.registrationNumber}
            </Text>

            <Text
              style={styles.contextName}
              numberOfLines={1}>
              {vehicle.make} {vehicle.model}
            </Text>
          </View>

          <View style={styles.contextStatus}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    vehicle.status === 'Active'
                      ? '#00D6A3'
                      : vehicle.status ===
                        'Maintenance'
                      ? '#F59E0B'
                      : '#94A3B8',
                },
              ]}
            />

            <Text style={styles.contextStatusText}>
              {vehicle.status}
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
              Keep the fleet record accurate and current.
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

          <View style={styles.actionGroup}>
            <Button
              title="Save Changes"
              onPress={handleSave}
            />

            <View style={styles.cancelButton}>
              <Button
                title="Cancel"
                onPress={() => navigation.goBack()}
              />
            </View>
          </View>
        </Card>

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

  backButton: {
    width: 42,
    height: 42,
    marginRight: 12,
    marginTop: 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10182B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },

  backButtonPressed: {
    opacity: 0.78,
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  headerIcon: {
    width: 30,
    height: 30,
    marginRight: 8,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(22, 136, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(22, 136, 255, 0.20)',
  },

  eyebrow: {
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

  contextCard: {
    minHeight: 74,
    marginBottom: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(18, 24, 46, 0.84)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },

  contextIcon: {
    width: 42,
    height: 42,
    marginRight: 11,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(22, 136, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(22, 136, 255, 0.18)',
  },

  contextText: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },

  contextRegistration: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: '#F5F7FF',
  },

  contextName: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    color: '#9AA4BF',
  },

  contextStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#10182B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },

  statusDot: {
    width: 6,
    height: 6,
    marginRight: 6,
    borderRadius: 3,
  },

  contextStatusText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
    color: '#CBD3E6',
  },

  sectionHeader: {
    marginBottom: 8,
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

  actionGroup: {
    marginTop: 6,
  },

  cancelButton: {
    marginTop: 10,
  },
});

export default EditVehicleScreen;
