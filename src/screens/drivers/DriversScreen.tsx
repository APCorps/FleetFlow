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

import {
  MaterialDesignIcons,
} from '@react-native-vector-icons/material-design-icons/static';

import type {
  RootStackParamList,
} from '../../navigation/AppNavigator';

import {useDrivers} from '../../store';

type DriversScreenNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;

const DriversScreen = () => {
  const navigation =
    useNavigation<DriversScreenNavigationProp>();

  const {
    drivers,
    deleteDriver,
  } = useDrivers();

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
        return '#00D6C9';

      case 'On Leave':
        return '#EF4444';

      case 'Inactive':
        return '#F59E0B';

      default:
        return '#94A3B8';
    }
  };

  /*
   * ─────────────────────────────────────
   * DELETE DRIVER
   * ─────────────────────────────────────
   */

  const handleDeleteDriver = (
    driverId: string,
    driverName: string,
  ) => {
    Alert.alert(
      'Delete Driver',
      `Are you sure you want to delete ${driverName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Delete',
          style: 'destructive',

          onPress: () => {
            deleteDriver(driverId);
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
              name="account-hard-hat-outline"
              size={24}
              color="#00D6C9"
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
              Drivers
            </Text>

            <Text
              style={
                styles.subtitle
              }>
              Manage your fleet drivers
            </Text>
          </View>

        </View>

        {/* SUMMARY + ADD DRIVER */}

        <View
          style={
            styles.summaryActionsRow
          }>

          {/* TOTAL DRIVERS */}

          <View
            style={
              styles.summaryRow
            }>

            <View>
              <Text
                style={
                  styles.summaryValue
                }>
                {drivers.length}
              </Text>

              <Text
                style={
                  styles.summaryLabel
                }>
                Total Drivers
              </Text>
            </View>

            <View
              style={
                styles.summaryAccent
              }>
              <MaterialDesignIcons
                name="account-group-outline"
                size={21}
                color="#00D6C9"
              />
            </View>

          </View>

          {/* ADD DRIVER */}

          <TouchableOpacity
            style={
              styles.addDriverButton
            }
            activeOpacity={
              0.8
            }
            accessibilityRole="button"
            accessibilityLabel="Add Driver"
            onPress={() =>
              navigation.navigate(
                'AddDriver',
              )
            }>

            <MaterialDesignIcons
              name="plus"
              size={19}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.addDriverText
              }>
              Add Driver
            </Text>

          </TouchableOpacity>

        </View>

        {/* DRIVERS */}

        {drivers.map(driver => {
          const statusColor =
            getStatusColor(
              driver.status,
            );

          return (
            <View
              key={driver.id}
              style={
                styles.driverCard
              }>

              {/* DRIVER HEADER */}

              <View
                style={
                  styles.driverHeader
                }>

                <View
                  style={
                    styles.driverIdentity
                  }>

                  <View
                    style={
                      styles.identityRow
                    }>

                    <View
                      style={[
                        styles.driverIconChip,
                        {
                          backgroundColor:
                            `${statusColor}14`,
                          borderColor:
                            `${statusColor}30`,
                        },
                      ]}>

                      <MaterialDesignIcons
                        name="account-outline"
                        size={18}
                        color={
                          statusColor
                        }
                      />

                    </View>

                    <View
                      style={
                        styles.identityText
                      }>

                      <Text
                        style={
                          styles.driverName
                        }>
                        {
                          driver.name
                        }
                      </Text>

                      <Text
                        style={
                          styles.employeeId
                        }>
                        {
                          driver.employeeId
                        }
                      </Text>

                    </View>

                  </View>

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
                      driver.status
                    }
                  </Text>

                </View>

              </View>

              {/* DRIVER DETAILS */}

              <View
                style={
                  styles.details
                }>

                <View
                  style={
                    styles.detailRow
                  }>

                  <MaterialDesignIcons
                    name="phone-outline"
                    size={16}
                    color="#64748B"
                  />

                  <Text
                    style={
                      styles.detailText
                    }>
                    {
                      driver.phone
                    }
                  </Text>

                </View>

                <View
                  style={
                    styles.detailRow
                  }>

                  <MaterialDesignIcons
                    name="card-account-details-outline"
                    size={16}
                    color="#64748B"
                  />

                  <Text
                    style={
                      styles.detailText
                    }>
                    {
                      driver.licenseNumber
                    }
                  </Text>

                </View>

                <View
                  style={
                    styles.detailRow
                  }>

                  <MaterialDesignIcons
                    name="calendar-clock-outline"
                    size={16}
                    color="#64748B"
                  />

                  <Text
                    style={
                      styles.detailText
                    }>
                    License expiry:{' '}
                    {new Date(
                      driver.licenseExpiry,
                    ).toLocaleDateString()}
                  </Text>

                </View>

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
                  accessibilityLabel={`View ${driver.name}`}
                  onPress={() =>
                    navigation.navigate(
                      'DriverDetails',
                      {
                        driver,
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
                  accessibilityLabel={`Edit ${driver.name}`}
                  onPress={() =>
                    navigation.navigate(
                      'EditDriver',
                      {
                        driver,
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
                  accessibilityLabel={`Delete ${driver.name}`}
                  onPress={() =>
                    handleDeleteDriver(
                      driver.id,
                      driver.name,
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

        {drivers.length === 0 && (
          <View
            style={
              styles.emptyCard
            }>

            <View
              style={
                styles.emptyIcon
              }>

              <MaterialDesignIcons
                name="account-group-outline"
                size={32}
                color="#00D6C9"
              />

            </View>

            <Text
              style={
                styles.emptyTitle
              }>
              No drivers
            </Text>

            <Text
              style={
                styles.emptyText
              }>
              Your fleet currently has
              no drivers.
            </Text>

          </View>
        )}

      </ScrollView>

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
     * Extra space reserved for the
     * future universal bottom navigation.
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
      'rgba(0, 214, 201, 0.10)',

    borderWidth: 1,

    borderColor:
      'rgba(0, 214, 201, 0.20)',

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
   * SUMMARY + ADD ACTION
   * ─────────────────────────────────────
   */

  summaryActionsRow: {
    flexDirection:
      'row',

    alignItems:
      'stretch',

    marginBottom:
      16,

    gap: 10,
  },

  summaryRow: {
    flex: 1,

    minHeight:
      70,

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
      12,
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
      'rgba(0, 214, 201, 0.10)',

    borderWidth: 1,

    borderColor:
      'rgba(0, 214, 201, 0.18)',
  },

  addDriverButton: {
    minHeight:
      70,

    paddingHorizontal:
      16,

    borderRadius:
      18,

    flexDirection:
      'row',

    alignItems:
      'center',

    justifyContent:
      'center',

    backgroundColor:
      '#00BFB3',

    borderWidth: 1,

    borderColor:
      'rgba(255, 255, 255, 0.12)',

    shadowColor:
      '#000000',

    shadowOffset: {
      width: 0,

      height: 4,
    },

    shadowOpacity:
      0.18,

    shadowRadius:
      8,

    elevation:
      5,
  },

  addDriverText: {
    marginLeft:
      7,

    fontSize: 12,

    fontWeight: '800',

    color:
      '#FFFFFF',
  },

  /*
   * ─────────────────────────────────────
   * DRIVER CARD
   * ─────────────────────────────────────
   */

  driverCard: {
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

  driverHeader: {
    flexDirection:
      'row',

    justifyContent:
      'space-between',

    alignItems:
      'flex-start',
  },

  driverIdentity: {
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

  driverIconChip: {
    width: 38,

    height: 38,

    borderRadius: 12,

    alignItems:
      'center',

    justifyContent:
      'center',

    borderWidth: 1,

    marginRight: 10,
  },

  identityText: {
    flex: 1,
  },

  driverName: {
    fontSize: 16,

    lineHeight: 20,

    fontWeight: '800',

    color:
      '#F8FAFC',
  },

  employeeId: {
    marginTop: 4,

    fontSize: 12,

    lineHeight: 16,

    fontWeight: '600',

    color:
      '#00D6C9',
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
   * DRIVER DETAILS
   * ─────────────────────────────────────
   */

  details: {
    marginTop:
      15,
  },

  detailRow: {
    flexDirection:
      'row',

    alignItems:
      'center',

    marginBottom:
      8,
  },

  detailText: {
    marginLeft:
      9,

    fontSize: 12,

    lineHeight: 17,

    fontWeight: '600',

    color:
      '#A8B5C7',
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
      6,
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
      'rgba(0, 214, 201, 0.10)',

    borderWidth: 1,

    borderColor:
      'rgba(0, 214, 201, 0.18)',
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
});

export default DriversScreen;