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
  useNavigation,
} from '@react-navigation/native';

import type {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {
  MaterialDesignIcons,
} from '@react-native-vector-icons/material-design-icons/static';

import {Button, Card} from '../../components';
import {useDrivers, useVehicles} from '../../store';

import type {
  Driver,
} from '../../types';

import type {
  RootStackParamList,
} from '../../navigation/AppNavigator';

type AddDriverNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;

type DriverStatus =
  | 'Active'
  | 'Inactive'
  | 'On Leave';

const DRIVER_TEAL = '#00D6C9';

const STATUS_COLORS = {
  Active: '#00D6C9',
  Inactive: '#F59E0B',
  'On Leave': '#EF4444',
} as const;

const AddDriverScreen = () => {
  const insets = useSafeAreaInsets();

  const navigation =
    useNavigation<AddDriverNavigationProp>();

  const {addDriver} = useDrivers();
  const {vehicles} = useVehicles();

  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] =
    useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [licenseNumber, setLicenseNumber] =
    useState('');
  const [licenseExpiry, setLicenseExpiry] =
    useState('');

  const [status, setStatus] =
    useState<DriverStatus>('Active');

  const [
    assignedVehicleId,
    setAssignedVehicleId,
  ] = useState<string | undefined>(
    undefined,
  );

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

    const newDriver: Driver = {
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
          onPress: () =>
            navigation.goBack(),
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
            onPress={() =>
              navigation.goBack()
            }
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
                  name="account-hard-hat-outline"
                  size={18}
                  color={DRIVER_TEAL}
                />
              </View>

              <Text style={styles.eyebrow}>
                FLEET SETUP
              </Text>
            </View>

            <Text style={styles.title}>
              Add Driver
            </Text>

            <Text style={styles.subtitle}>
              Complete driver information
            </Text>
          </View>
        </View>

        {/* PERSONAL INFORMATION */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Personal Information
          </Text>

          <Text style={styles.sectionSubtitle}>
            Add the driver's identity and primary contact details.
          </Text>
        </View>

        <Card>
          <Text style={styles.label}>
            Full Name
          </Text>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter full name"
            placeholderTextColor="#6F7892"
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
            placeholderTextColor="#6F7892"
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
            placeholderTextColor="#6F7892"
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
            placeholderTextColor="#6F7892"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </Card>

        {/* LICENSE INFORMATION */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            License Information
          </Text>

          <Text style={styles.sectionSubtitle}>
            Store the driver's licensing details used for fleet records.
          </Text>
        </View>

        <Card>
          <Text style={styles.label}>
            License Number
          </Text>

          <TextInput
            style={styles.input}
            value={licenseNumber}
            onChangeText={setLicenseNumber}
            placeholder="Enter license number"
            placeholderTextColor="#6F7892"
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
            placeholderTextColor="#6F7892"
            keyboardType="numbers-and-punctuation"
          />
        </Card>

        {/* DRIVER STATUS */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Driver Status
          </Text>

          <Text style={styles.sectionSubtitle}>
            Set the current operational status for this driver.
          </Text>
        </View>

        <Card>
          <View style={styles.statusOptions}>
            {(
              [
                'Active',
                'Inactive',
                'On Leave',
              ] as DriverStatus[]
            ).map(option => {
              const selected =
                status === option;

              const statusColor =
                STATUS_COLORS[option];

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
                    {
                      borderColor: selected
                        ? `${statusColor}45`
                        : '#1B2A40',
                      backgroundColor:
                        selected
                          ? `${statusColor}12`
                          : '#0D1526',
                    },
                    pressed &&
                      styles.pressed,
                  ]}>

                  <View
                    style={[
                      styles.optionDot,
                      {
                        backgroundColor:
                          statusColor,
                      },
                    ]}
                  />

                  <Text
                    style={[
                      styles.statusOptionText,
                      {
                        color: selected
                          ? statusColor
                          : '#9AA4BF',
                      },
                    ]}>
                    {option}
                  </Text>

                  {selected && (
                    <MaterialDesignIcons
                      name="check"
                      size={16}
                      color={statusColor}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* ASSIGNED VEHICLE */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Assigned Vehicle
          </Text>

          <Text style={styles.sectionSubtitle}>
            Link the driver to a vehicle or leave the assignment empty.
          </Text>
        </View>

        <Card>
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{
              selected:
                assignedVehicleId ===
                undefined,
            }}
            onPress={() =>
              setAssignedVehicleId(
                undefined,
              )
            }
            style={({pressed}) => [
              styles.vehicleOption,
              assignedVehicleId ===
                undefined &&
                styles.vehicleOptionSelected,
              pressed && styles.pressed,
            ]}>

            <View
              style={[
                styles.vehicleOptionIcon,
                {
                  backgroundColor:
                    assignedVehicleId ===
                    undefined
                      ? 'rgba(0, 214, 201, 0.10)'
                      : '#10182B',
                },
              ]}>
              <MaterialDesignIcons
                name="link-variant-off"
                size={19}
                color={
                  assignedVehicleId ===
                  undefined
                    ? DRIVER_TEAL
                    : '#6F7892'
                }
              />
            </View>

            <View style={styles.vehicleOptionText}>
              <Text
                style={[
                  styles.vehicleOptionTitle,
                  assignedVehicleId ===
                    undefined &&
                    styles.vehicleOptionTitleSelected,
                ]}>
                No vehicle assigned
              </Text>

              <Text style={styles.vehicleOptionSubtitle}>
                Driver is not currently linked to a vehicle.
              </Text>
            </View>

            {assignedVehicleId ===
              undefined && (
              <MaterialDesignIcons
                name="check-circle"
                size={19}
                color={DRIVER_TEAL}
              />
            )}
          </Pressable>

          {vehicles.length === 0 && (
            <View style={styles.emptyVehicleNote}>
              <MaterialDesignIcons
                name="truck-outline"
                size={17}
                color="#6F7892"
              />

              <Text style={styles.emptyVehicleText}>
                No vehicles are currently available for assignment.
              </Text>
            </View>
          )}

          {vehicles.map(vehicle => {
            const selected =
              assignedVehicleId ===
              vehicle.id;

            return (
              <Pressable
                key={vehicle.id}
                accessibilityRole="radio"
                accessibilityState={{
                  selected,
                }}
                onPress={() =>
                  setAssignedVehicleId(
                    vehicle.id,
                  )
                }
                style={({pressed}) => [
                  styles.vehicleOption,
                  selected &&
                    styles.vehicleOptionSelected,
                  pressed &&
                    styles.pressed,
                ]}>

                <View
                  style={[
                    styles.vehicleOptionIcon,
                    {
                      backgroundColor:
                        selected
                          ? 'rgba(22, 136, 255, 0.10)'
                          : '#10182B',
                    },
                  ]}>
                  <MaterialDesignIcons
                    name="truck-outline"
                    size={19}
                    color={
                      selected
                        ? '#1688FF'
                        : '#6F7892'
                    }
                  />
                </View>

                <View style={styles.vehicleOptionText}>
                  <Text
                    style={[
                      styles.vehicleOptionTitle,
                      selected &&
                        styles.vehicleOptionTitleSelected,
                    ]}
                    numberOfLines={1}>
                    {vehicle.registrationNumber}
                  </Text>

                  <Text
                    style={
                      styles.vehicleOptionSubtitle
                    }
                    numberOfLines={1}>
                    {vehicle.make}{' '}
                    {vehicle.model}
                  </Text>
                </View>

                {selected && (
                  <MaterialDesignIcons
                    name="check-circle"
                    size={19}
                    color="#1688FF"
                  />
                )}
              </Pressable>
            );
          })}
        </Card>

        {/* ACTIONS */}

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              navigation.goBack()
            }
            style={({pressed}) => [
              styles.secondaryAction,
              pressed && styles.pressed,
            ]}>
            <Text style={styles.secondaryActionText}>
              Cancel
            </Text>
          </Pressable>

          <View style={styles.primaryAction}>
            <Button
              title="Save Driver"
              onPress={handleSave}
            />
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

  pressed: {
    opacity: 0.78,
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
    borderColor:
      'rgba(255, 255, 255, 0.08)',
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
    backgroundColor:
      'rgba(0, 214, 201, 0.10)',
    borderWidth: 1,
    borderColor:
      'rgba(0, 214, 201, 0.18)',
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

  label: {
    marginBottom: 6,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    color: '#9AA4BF',
  },

  input: {
    minHeight: 46,
    marginBottom: 14,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#1B2A40',
    borderRadius: 11,
    backgroundColor: '#0D1526',
    fontSize: 14,
    lineHeight: 19,
    color: '#F5F7FF',
  },

  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  statusOption: {
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 11,
    borderWidth: 1,
  },

  optionDot: {
    width: 7,
    height: 7,
    marginRight: 7,
    borderRadius: 4,
  },

  statusOptionText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
  },

  vehicleOption: {
    minHeight: 62,
    marginBottom: 8,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1B2A40',
    backgroundColor: '#0D1526',
  },

  vehicleOptionSelected: {
    borderColor:
      'rgba(0, 214, 201, 0.24)',
    backgroundColor:
      'rgba(0, 214, 201, 0.06)',
  },

  vehicleOptionIcon: {
    width: 38,
    height: 38,
    marginRight: 10,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.05)',
  },

  vehicleOptionText: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },

  vehicleOptionTitle: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
    color: '#CBD3E6',
  },

  vehicleOptionTitleSelected: {
    color: '#F5F7FF',
  },

  vehicleOptionSubtitle: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '600',
    color: '#6F7892',
  },

  emptyVehicleNote: {
    minHeight: 38,
    paddingHorizontal: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#10182B',
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.05)',
  },

  emptyVehicleText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 10,
    lineHeight: 15,
    color: '#6F7892',
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginHorizontal: -4,
    marginBottom: 4,
  },

  secondaryAction: {
    flex: 0.82,
    minHeight: 48,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10182B',
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.08)',
  },

  secondaryActionText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: '#CBD3E6',
  },

  primaryAction: {
    flex: 1.18,
    marginHorizontal: 4,
  },
});

export default AddDriverScreen;
