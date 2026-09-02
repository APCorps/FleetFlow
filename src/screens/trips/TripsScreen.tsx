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

import {
  useDrivers,
  useTrips,
  useVehicles,
} from '../../store';

type TripsScreenNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;

const TripsScreen = () => {
  const navigation =
    useNavigation<TripsScreenNavigationProp>();

  const {
    trips,
    deleteTrip,
  } = useTrips();

  const {vehicles} = useVehicles();
  const {drivers} = useDrivers();

  /*
   * ─────────────────────────────────────
   * VEHICLE LOOKUP
   * ─────────────────────────────────────
   */

  const getVehicleRegistration = (
    vehicleId: string,
  ) => {
    const vehicle = vehicles.find(
      item => item.id === vehicleId,
    );

    return (
      vehicle?.registrationNumber ??
      'Unknown Vehicle'
    );
  };

  /*
   * ─────────────────────────────────────
   * DRIVER LOOKUP
   * ─────────────────────────────────────
   */

  const getDriverName = (
    driverId: string,
  ) => {
    const driver = drivers.find(
      item => item.id === driverId,
    );

    return (
      driver?.name ??
      'Unknown Driver'
    );
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
      case 'Completed':
        return '#00D6A3';

      case 'In Progress':
        return '#3B82F6';

      case 'Scheduled':
        return '#F59E0B';

      case 'Cancelled':
        return '#EF4444';

      default:
        return '#94A3B8';
    }
  };

  /*
   * ─────────────────────────────────────
   * DELETE TRIP
   * ─────────────────────────────────────
   */

  const handleDeleteTrip = (
    tripId: string,
    route: string,
  ) => {
    Alert.alert(
      'Delete Trip',
      `Are you sure you want to delete "${route}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Delete',
          style: 'destructive',

          onPress: () => {
            deleteTrip(tripId);
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
              name="map-marker-path"
              size={24}
              color="#9B5CFF"
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
              Trips
            </Text>

            <Text
              style={
                styles.subtitle
              }>
              Manage your fleet trips
            </Text>
          </View>

        </View>

        {/* SUMMARY + ADD TRIP */}

        <View
          style={
            styles.summaryActionsRow
          }>

          {/* TOTAL TRIPS */}

          <View
            style={
              styles.summaryRow
            }>

            <View>
              <Text
                style={
                  styles.summaryValue
                }>
                {trips.length}
              </Text>

              <Text
                style={
                  styles.summaryLabel
                }>
                Total Trips
              </Text>
            </View>

            <View
              style={
                styles.summaryAccent
              }>
              <MaterialDesignIcons
                name="map-marker-path"
                size={21}
                color="#9B5CFF"
              />
            </View>

          </View>

          {/* ADD TRIP */}

          <TouchableOpacity
            style={
              styles.addTripButton
            }
            activeOpacity={
              0.8
            }
            accessibilityRole="button"
            accessibilityLabel="Add Trip"
            onPress={() =>
              navigation.navigate(
                'AddTrip',
              )
            }>

            <MaterialDesignIcons
              name="plus"
              size={19}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.addTripText
              }>
              Add Trip
            </Text>

          </TouchableOpacity>

        </View>

        {/* TRIPS */}

        {trips.map(trip => {
          const statusColor =
            getStatusColor(
              trip.status,
            );

          return (
            <View
              key={trip.id}
              style={
                styles.tripCard
              }>

              {/* TRIP HEADER */}

              <View
                style={
                  styles.tripHeader
                }>

                <View
                  style={
                    styles.tripIdentity
                  }>

                  <View
                    style={
                      styles.routeRow
                    }>

                    <View
                      style={
                        styles.routeIcon
                      }>
                      <MaterialDesignIcons
                        name="map-marker-outline"
                        size={17}
                        color="#9B5CFF"
                      />
                    </View>

                    <Text
                      style={
                        styles.route
                      }
                      numberOfLines={
                        2
                      }>
                      {trip.origin}
                      {' → '}
                      {trip.destination}
                    </Text>

                  </View>

                  <View
                    style={
                      styles.dateRow
                    }>

                    <MaterialDesignIcons
                      name="calendar-outline"
                      size={15}
                      color="#64748B"
                    />

                    <Text
                      style={
                        styles.tripDate
                      }>
                      {new Date(
                        trip.scheduledDate,
                      ).toLocaleDateString()}
                    </Text>

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
                      trip.status
                    }
                  </Text>

                </View>

              </View>

              {/* TRIP DETAILS */}

              <View
                style={
                  styles.details
                }>

                <View
                  style={
                    styles.detailRow
                  }>

                  <MaterialDesignIcons
                    name="truck-outline"
                    size={16}
                    color="#64748B"
                  />

                  <Text
                    style={
                      styles.detailText
                    }>
                    Vehicle:{' '}
                    {getVehicleRegistration(
                      trip.vehicleId,
                    )}
                  </Text>

                </View>

                <View
                  style={
                    styles.detailRow
                  }>

                  <MaterialDesignIcons
                    name="account-outline"
                    size={16}
                    color="#64748B"
                  />

                  <Text
                    style={
                      styles.detailText
                    }>
                    Driver:{' '}
                    {getDriverName(
                      trip.driverId,
                    )}
                  </Text>

                </View>

                {trip.distance !==
                  undefined && (
                  <View
                    style={
                      styles.detailRow
                    }>

                    <MaterialDesignIcons
                      name="map-marker-distance"
                      size={16}
                      color="#64748B"
                    />

                    <Text
                      style={
                        styles.detailText
                      }>
                      Distance:{' '}
                      {trip.distance.toLocaleString()}{' '}
                      km
                    </Text>

                  </View>
                )}

              </View>

              {/* NOTES */}

              {trip.notes && (
                <View
                  style={
                    styles.notesContainer
                  }>

                  <MaterialDesignIcons
                    name="note-text-outline"
                    size={15}
                    color="#64748B"
                  />

                  <Text
                    style={
                      styles.notes
                    }>
                    {trip.notes}
                  </Text>

                </View>
              )}

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
                  accessibilityLabel={`View trip from ${trip.origin} to ${trip.destination}`}
                  onPress={() =>
                    navigation.navigate(
                      'TripDetails',
                      {
                        trip,
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
                  accessibilityLabel={`Edit trip from ${trip.origin} to ${trip.destination}`}
                  onPress={() =>
                    navigation.navigate(
                      'EditTrip',
                      {
                        trip,
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
                  accessibilityLabel={`Delete trip from ${trip.origin} to ${trip.destination}`}
                  onPress={() =>
                    handleDeleteTrip(
                      trip.id,
                      `${trip.origin} → ${trip.destination}`,
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

        {trips.length === 0 && (
          <View
            style={
              styles.emptyCard
            }>

            <View
              style={
                styles.emptyIcon
              }>

              <MaterialDesignIcons
                name="map-marker-path"
                size={32}
                color="#9B5CFF"
              />

            </View>

            <Text
              style={
                styles.emptyTitle
              }>
              No trips
            </Text>

            <Text
              style={
                styles.emptyText
              }>
              Your fleet currently has
              no trips.
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
      'rgba(155, 92, 255, 0.10)',

    borderWidth: 1,

    borderColor:
      'rgba(155, 92, 255, 0.20)',

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
      'rgba(155, 92, 255, 0.10)',

    borderWidth: 1,

    borderColor:
      'rgba(155, 92, 255, 0.18)',
  },

  addTripButton: {
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
      '#8B4DE8',

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

  addTripText: {
    marginLeft:
      7,

    fontSize: 12,

    fontWeight: '800',

    color:
      '#FFFFFF',
  },

  /*
   * ─────────────────────────────────────
   * TRIP CARD
   * ─────────────────────────────────────
   */

  tripCard: {
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

  tripHeader: {
    flexDirection:
      'row',

    justifyContent:
      'space-between',

    alignItems:
      'flex-start',
  },

  tripIdentity: {
    flex: 1,

    paddingRight:
      10,
  },

  routeRow: {
    flexDirection:
      'row',

    alignItems:
      'flex-start',
  },

  routeIcon: {
    width: 32,

    height: 32,

    borderRadius: 10,

    alignItems:
      'center',

    justifyContent:
      'center',

    backgroundColor:
      'rgba(155, 92, 255, 0.10)',

    borderWidth: 1,

    borderColor:
      'rgba(155, 92, 255, 0.18)',

    marginRight:
      9,
  },

  route: {
    flex: 1,

    fontSize: 16,

    lineHeight: 21,

    fontWeight: '800',

    color:
      '#F8FAFC',
  },

  dateRow: {
    flexDirection:
      'row',

    alignItems:
      'center',

    marginTop:
      8,

    marginLeft:
      41,
  },

  tripDate: {
    marginLeft:
      6,

    fontSize: 12,

    lineHeight: 16,

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
   * DETAILS
   * ─────────────────────────────────────
   */

  details: {
    marginTop:
      15,

    paddingTop:
      12,

    borderTopWidth:
      1,

    borderTopColor:
      'rgba(148, 163, 184, 0.10)',
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
   * NOTES
   * ─────────────────────────────────────
   */

  notesContainer: {
    flexDirection:
      'row',

    alignItems:
      'flex-start',

    marginTop:
      4,

    paddingTop:
      5,
  },

  notes: {
    flex: 1,

    marginLeft:
      7,

    fontSize: 12,

    lineHeight: 18,

    color:
      '#8FA0B5',
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
      8,
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
      'rgba(155, 92, 255, 0.10)',

    borderWidth: 1,

    borderColor:
      'rgba(155, 92, 255, 0.18)',
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

export default TripsScreen;