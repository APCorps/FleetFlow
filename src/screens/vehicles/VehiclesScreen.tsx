import React from 'react';

import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';

import type {
  RootStackParamList,
} from '../../navigation/AppNavigator';

import {useVehicles} from '../../store';

import {
  colors,
  radius,
  spacing,
  typography,
} from '../../theme';

type VehiclesScreenNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;

const VehiclesScreen = () => {
  const navigation =
    useNavigation<VehiclesScreenNavigationProp>();

  const {
    vehicles,
    deleteVehicle,
  } = useVehicles();

  /*
   * ─────────────────────────────────────
   * VEHICLE TYPE ICON
   * ─────────────────────────────────────
   */

  const getVehicleTypeIcon = (
    type: string,
  ) => {
    switch (type) {
      case 'Truck':
        return 'truck-outline';

      case 'Van':
        return 'van-utility';

      case 'Car':
        return 'car-outline';

      case 'Motorcycle':
        return 'motorbike';

      default:
        return 'car-outline';
    }
  };

  /*
   * ─────────────────────────────────────
   * STATUS COLOR
   * ─────────────────────────────────────
   */

  const getStatusColor = (
    status: string,
  ) => {
    switch (status) {
      case 'Active':
        return '#00D6A3';

      case 'Maintenance':
        return '#F59E0B';

      case 'Inactive':
        return '#94A3B8';

      default:
        return '#94A3B8';
    }
  };

  /*
   * ─────────────────────────────────────
   * DELETE VEHICLE
   * ─────────────────────────────────────
   */

  const handleDeleteVehicle = (
    vehicleId: string,
    registrationNumber: string,
  ) => {
    Alert.alert(
      'Delete Vehicle',
      `Are you sure you want to delete ${registrationNumber}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Delete',
          style: 'destructive',

          onPress: () => {
            deleteVehicle(vehicleId);
          },
        },
      ],
    );
  };

  /*
   * ─────────────────────────────────────
   * RENDER
   * ─────────────────────────────────────
   */

  return (
    <SafeAreaView
      style={styles.container}>

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }>

        {/* HEADER */}

        <View style={styles.header}>

          <View
            style={
              styles.headerIcon
            }>
            <MaterialDesignIcons
              name="truck-outline"
              size={24}
              color="#1688FF"
            />
          </View>

          <View
            style={
              styles.headerText
            }>
            <Text
              style={
                styles.title
              }>
              Vehicles
            </Text>

            <Text
              style={
                styles.subtitle
              }>
              Manage your fleet vehicles
            </Text>
          </View>

        </View>

        {/* SUMMARY */}

        <View
          style={
            styles.summaryRow
          }>

          <View>
            <Text
              style={
                styles.summaryValue
              }>
              {vehicles.length}
            </Text>

            <Text
              style={
                styles.summaryLabel
              }>
              Total Vehicles
            </Text>
          </View>

          <View
            style={
              styles.summaryAccent
            }>
            <MaterialDesignIcons
              name="truck-outline"
              size={20}
              color="#1688FF"
            />
          </View>

        </View>

        {/* VEHICLES */}

        {vehicles.map(vehicle => {
          const statusColor =
            getStatusColor(
              vehicle.status,
            );

          return (
            <View
              key={vehicle.id}
              style={
                styles.vehicleCard
              }>

              {/* VEHICLE HEADER */}

              <View
                style={
                  styles.vehicleHeader
                }>

                <View
                  style={
                    styles.vehicleIdentity
                  }>

                  {/* ID + TYPE CHIP */}

                  <View
                    style={
                      styles.identityRow
                    }>

                    <View
                      style={[
                        styles.vehicleTypeChip,
                        {
                          backgroundColor:
                            `${statusColor}14`,
                          borderColor:
                            `${statusColor}30`,
                        },
                      ]}>

                      <MaterialDesignIcons
                        name={getVehicleTypeIcon(
                          vehicle.type,
                        )}
                        size={17}
                        color={
                          statusColor
                        }
                      />

                    </View>

                    <Text
                      style={
                        styles.registration
                      }>
                      {
                        vehicle.registrationNumber
                      }
                    </Text>

                  </View>

                  {/* VEHICLE NAME */}

                  <Text
                    style={
                      styles.vehicleName
                    }>
                    {vehicle.make}{' '}
                    {vehicle.model}
                  </Text>

                </View>

                {/* STATUS */}

                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        `${statusColor}14`,
                      borderColor:
                        `${statusColor}28`,
                    },
                  ]}>

                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor:
                          statusColor,
                      },
                    ]}
                  />

                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          statusColor,
                      },
                    ]}>
                    {
                      vehicle.status
                    }
                  </Text>

                </View>

              </View>

              {/* SPECIFICATION LINE */}

              <View
                style={
                  styles.specRow
                }>

                <Text
                  style={
                    styles.specText
                  }>
                  {vehicle.type}
                </Text>

                <Text
                  style={
                    styles.specSeparator
                  }>
                  •
                </Text>

                <Text
                  style={
                    styles.specText
                  }>
                  {vehicle.year}
                </Text>

                <Text
                  style={
                    styles.specSeparator
                  }>
                  •
                </Text>

                <Text
                  style={
                    styles.specText
                  }>
                  {vehicle.mileage.toLocaleString()}{' '}
                  km
                </Text>

              </View>

              {/* DIVIDER */}

              <View
                style={
                  styles.divider
                }
              />

              {/* ACTIONS */}

              <View
                style={
                  styles.actionsRow
                }>

                <View
                  style={
                    styles.actionSpacer
                  }
                />

                {/* VIEW */}

                <TouchableOpacity
                  style={
                    styles.iconButton
                  }
                  activeOpacity={
                    0.7
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`View ${vehicle.registrationNumber}`}
                  onPress={() =>
                    navigation.navigate(
                      'VehicleDetails',
                      {
                        vehicle,
                      },
                    )
                  }>

                  <MaterialDesignIcons
                    name="eye-outline"
                    size={18}
                    color="#94A3B8"
                  />

                </TouchableOpacity>

                {/* EDIT */}

                <TouchableOpacity
                  style={
                    styles.iconButton
                  }
                  activeOpacity={
                    0.7
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${vehicle.registrationNumber}`}
                  onPress={() =>
                    navigation.navigate(
                      'EditVehicle',
                      {
                        vehicle,
                      },
                    )
                  }>

                  <MaterialDesignIcons
                    name="pencil-outline"
                    size={18}
                    color="#94A3B8"
                  />

                </TouchableOpacity>

                {/* DELETE */}

                <TouchableOpacity
                  style={
                    styles.iconButton
                  }
                  activeOpacity={
                    0.7
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${vehicle.registrationNumber}`}
                  onPress={() =>
                    handleDeleteVehicle(
                      vehicle.id,
                      vehicle.registrationNumber,
                    )
                  }>

                  <MaterialDesignIcons
                    name="trash-can-outline"
                    size={18}
                    color="#94A3B8"
                  />

                </TouchableOpacity>

              </View>

            </View>
          );
        })}

        {/* EMPTY STATE */}

        {vehicles.length === 0 && (
          <View
            style={
              styles.emptyCard
            }>

            <View
              style={
                styles.emptyIcon
              }>
              <MaterialDesignIcons
                name="truck-outline"
                size={32}
                color="#1688FF"
              />
            </View>

            <Text
              style={
                styles.emptyTitle
              }>
              No vehicles
            </Text>

            <Text
              style={
                styles.emptyText
              }>
              Your fleet currently has
              no vehicles.
            </Text>

          </View>
        )}

      </ScrollView>

      {/* ADD VEHICLE FAB */}

      <TouchableOpacity
        style={
          styles.fab
        }
        activeOpacity={
          0.8
        }
        accessibilityRole="button"
        accessibilityLabel="Add Vehicle"
        onPress={() =>
          navigation.navigate(
            'AddVehicle',
          )
        }>

        <MaterialDesignIcons
          name="plus"
          size={25}
          color="#FFFFFF"
        />

      </TouchableOpacity>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({

  /*
   * ─────────────────────────────────────
   * SCREEN
   * ─────────────────────────────────────
   */

  container: {
    flex: 1,

    backgroundColor:
      '#061426',
  },

  content: {
    paddingHorizontal:
      20,

    paddingTop:
      24,

    /*
     * Extra bottom space keeps
     * the final vehicle card clear
     * of the centered FAB and the
     * future floating navigation.
     */

    paddingBottom:
      150,
  },

  /*
   * ─────────────────────────────────────
   * HEADER
   * ─────────────────────────────────────
   */

  header: {
    flexDirection:
      'row',

    alignItems:
      'center',

    marginBottom:
      24,
  },

  headerIcon: {
    width: 46,

    height: 46,

    borderRadius:
      14,

    alignItems:
      'center',

    justifyContent:
      'center',

    backgroundColor:
      'rgba(22, 136, 255, 0.10)',

    borderWidth: 1,

    borderColor:
      'rgba(22, 136, 255, 0.20)',

    marginRight:
      12,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 28,

    lineHeight: 34,

    fontWeight: '800',

    color:
      '#F8FAFC',
  },

  subtitle: {
    marginTop: 4,

    fontSize: 13,

    lineHeight: 18,

    color:
      '#94A3B8',
  },

  /*
   * ─────────────────────────────────────
   * SUMMARY
   * ─────────────────────────────────────
   */

  summaryRow: {
    flexDirection:
      'row',

    alignItems:
      'center',

    justifyContent:
      'space-between',

    backgroundColor:
      '#0B1D33',

    borderWidth: 1,

    borderColor:
      'rgba(148, 163, 184, 0.12)',

    borderRadius:
      18,

    paddingHorizontal:
      16,

    paddingVertical:
      14,

    marginBottom:
      16,
  },

  summaryValue: {
    fontSize: 22,

    lineHeight: 26,

    fontWeight: '800',

    color:
      '#F8FAFC',
  },

  summaryLabel: {
    marginTop: 2,

    fontSize: 12,

    fontWeight: '600',

    color:
      '#A8B5C7',
  },

  summaryAccent: {
    width: 38,

    height: 38,

    borderRadius: 12,

    alignItems:
      'center',

    justifyContent:
      'center',

    backgroundColor:
      'rgba(22, 136, 255, 0.10)',

    borderWidth: 1,

    borderColor:
      'rgba(22, 136, 255, 0.18)',
  },

  /*
   * ─────────────────────────────────────
   * VEHICLE CARD
   * ─────────────────────────────────────
   */

  vehicleCard: {
    backgroundColor:
      '#0B1D33',

    borderWidth: 1,

    borderColor:
      'rgba(148, 163, 184, 0.12)',

    borderRadius:
      18,

    padding:
      16,

    marginBottom:
      12,
  },

  vehicleHeader: {
    flexDirection:
      'row',

    justifyContent:
      'space-between',

    alignItems:
      'flex-start',
  },

  vehicleIdentity: {
    flex: 1,

    paddingRight:
      10,
  },

  identityRow: {
    flexDirection:
      'row',

    alignItems:
      'center',
  },

  vehicleTypeChip: {
    width: 32,

    height: 32,

    borderRadius: 10,

    alignItems:
      'center',

    justifyContent:
      'center',

    borderWidth: 1,

    marginRight: 9,
  },

  registration: {
    fontSize: 16,

    lineHeight: 20,

    fontWeight: '800',

    color:
      '#F8FAFC',
  },

  vehicleName: {
    marginTop: 5,

    fontSize: 13,

    lineHeight: 18,

    fontWeight: '600',

    color:
      '#A8B5C7',
  },

  /*
   * ─────────────────────────────────────
   * STATUS
   * ─────────────────────────────────────
   */

  statusBadge: {
    flexDirection:
      'row',

    alignItems:
      'center',

    paddingHorizontal:
      9,

    paddingVertical:
      6,

    borderRadius:
      999,

    borderWidth: 1,
  },

  statusDot: {
    width: 6,

    height: 6,

    borderRadius: 3,

    marginRight: 6,
  },

  statusText: {
    fontSize: 10,

    lineHeight: 13,

    fontWeight: '800',
  },

  /*
   * ─────────────────────────────────────
   * INLINE SPECS
   * ─────────────────────────────────────
   */

  specRow: {
    flexDirection:
      'row',

    alignItems:
      'center',

    marginTop:
      14,
  },

  specText: {
    fontSize: 12,

    lineHeight: 16,

    fontWeight: '600',

    color:
      '#A8B5C7',
  },

  specSeparator: {
    marginHorizontal:
      7,

    fontSize: 11,

    color:
      '#52647A',
  },

  /*
   * ─────────────────────────────────────
   * DIVIDER
   * ─────────────────────────────────────
   */

  divider: {
    height: 1,

    backgroundColor:
      'rgba(148, 163, 184, 0.10)',

    marginTop:
      14,
  },

  /*
   * ─────────────────────────────────────
   * ICON ACTIONS
   * ─────────────────────────────────────
   */

  actionsRow: {
    flexDirection:
      'row',

    alignItems:
      'center',

    justifyContent:
      'flex-end',

    marginTop:
      12,
  },

  actionSpacer: {
    flex: 1,
  },

  iconButton: {
    width: 34,

    height: 34,

    alignItems:
      'center',

    justifyContent:
      'center',

    borderRadius:
      10,

    borderWidth: 1,

    borderColor:
      'rgba(148, 163, 184, 0.18)',

    backgroundColor:
      'transparent',

    marginLeft:
      7,
  },

  /*
   * ─────────────────────────────────────
   * EMPTY STATE
   * ─────────────────────────────────────
   */

  emptyCard: {
    alignItems:
      'center',

    justifyContent:
      'center',

    backgroundColor:
      '#0B1D33',

    borderWidth: 1,

    borderColor:
      'rgba(148, 163, 184, 0.12)',

    borderRadius:
      18,

    paddingVertical:
      42,

    paddingHorizontal:
      24,
  },

  emptyIcon: {
    width: 62,

    height: 62,

    borderRadius: 18,

    alignItems:
      'center',

    justifyContent:
      'center',

    backgroundColor:
      'rgba(22, 136, 255, 0.10)',

    borderWidth: 1,

    borderColor:
      'rgba(22, 136, 255, 0.18)',
  },

  emptyTitle: {
    marginTop:
      14,

    fontSize: 18,

    lineHeight: 23,

    fontWeight: '800',

    color:
      '#F8FAFC',
  },

  emptyText: {
    marginTop:
      6,

    fontSize: 13,

    lineHeight: 19,

    color:
      '#A8B5C7',

    textAlign:
      'center',
  },

  /*
   * ─────────────────────────────────────
   * FLOATING ACTION BUTTON
   * ─────────────────────────────────────
   *
   * Centered above the future
   * floating bottom navigation.
   */

  fab: {
    position:
      'absolute',

    alignSelf:
      'center',

    bottom:
      102,

    width:
      56,

    height:
      56,

    borderRadius:
      28,

    alignItems:
      'center',

    justifyContent:
      'center',

    backgroundColor:
      '#1688FF',

    borderWidth:
      1,

    borderColor:
      'rgba(255, 255, 255, 0.16)',

    shadowColor:
      '#000000',

    shadowOffset: {
      width: 0,

      height: 6,
    },

    shadowOpacity:
      0.30,

    shadowRadius:
      10,

    elevation:
      10,
  },
});

export default VehiclesScreen;