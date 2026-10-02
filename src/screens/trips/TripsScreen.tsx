import React, {useMemo, useState} from 'react';

import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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

type TripStatus =
  | 'All'
  | 'Completed'
  | 'In Progress'
  | 'Scheduled'
  | 'Cancelled';

const TRIP_PURPLE = '#9B5CFF';

const STATUS_COLORS = {
  Completed: '#00D6A3',
  'In Progress': '#3B82F6',
  Scheduled: '#F59E0B',
  Cancelled: '#EF4444',
} as const;

const TripsScreen = () => {
  const insets = useSafeAreaInsets();

  const navigation =
    useNavigation<TripsScreenNavigationProp>();

  const {
    trips,
    deleteTrip,
  } = useTrips();

  const {vehicles} = useVehicles();
  const {drivers} = useDrivers();

  const [searchQuery, setSearchQuery] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState<TripStatus>('All');

  const [filterVisible, setFilterVisible] =
    useState(false);

  const [trackingTripId, setTrackingTripId] =
    useState<string | null>(null);

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

  const getStatusColor = (
    status: string,
  ) => {
    switch (status) {
      case 'Completed':
        return STATUS_COLORS.Completed;

      case 'In Progress':
        return STATUS_COLORS['In Progress'];

      case 'Scheduled':
        return STATUS_COLORS.Scheduled;

      case 'Cancelled':
        return STATUS_COLORS.Cancelled;

      default:
        return '#94A3B8';
    }
  };

  const getTripProgress = (
    status: string,
  ) => {
    switch (status) {
      case 'Completed':
        return 100;

      case 'In Progress':
        return 62;

      case 'Scheduled':
        return 0;

      case 'Cancelled':
        return 0;

      default:
        return 0;
    }
  };

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

  const filteredTrips = useMemo(() => {
    const query =
      searchQuery.trim().toLowerCase();

    return trips.filter(trip => {
      const matchesStatus =
        statusFilter === 'All' ||
        trip.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      const vehicleRegistration =
        getVehicleRegistration(
          trip.vehicleId,
        );

      const driverName =
        getDriverName(
          trip.driverId,
        );

      return [
        trip.origin,
        trip.destination,
        vehicleRegistration,
        driverName,
        trip.status,
      ].some(value =>
        String(value)
          .toLowerCase()
          .includes(query),
      );
    });
  }, [
    trips,
    vehicles,
    drivers,
    searchQuery,
    statusFilter,
  ]);

  const completedCount = trips.filter(
    trip => trip.status === 'Completed',
  ).length;

  const inProgressCount = trips.filter(
    trip => trip.status === 'In Progress',
  ).length;

  const scheduledCount = trips.filter(
    trip => trip.status === 'Scheduled',
  ).length;

  const cancelledCount = trips.filter(
    trip => trip.status === 'Cancelled',
  ).length;

  const activeFilterCount =
    statusFilter === 'All' ? 0 : 1;

  const hasFilters =
    Boolean(searchQuery.trim()) ||
    statusFilter !== 'All';

  return (
    <View style={styles.container}>
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
              Math.max(insets.bottom, 20) + 110,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <MaterialDesignIcons
              name="map-marker-path"
              size={23}
              color={TRIP_PURPLE}
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>
              FLEET OPERATIONS
            </Text>

            <Text style={styles.title}>
              Trips
            </Text>

            <Text style={styles.subtitle}>
              Manage your fleet trips
            </Text>
          </View>
        </View>

        {/* SUMMARY */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryMain}>
            <Text style={styles.summaryValue}>
              {trips.length}
            </Text>

            <Text style={styles.summaryLabel}>
              Total Trips
            </Text>
          </View>

          <View style={styles.summaryMetrics}>
            <View style={styles.summaryMetric}>
              <View
                style={[
                  styles.metricDot,
                  {
                    backgroundColor:
                      STATUS_COLORS.Completed,
                  },
                ]}
              />
              <Text style={styles.metricValue}>
                {completedCount}
              </Text>
              <Text style={styles.metricLabel}>
                Done
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryMetric}>
              <View
                style={[
                  styles.metricDot,
                  {
                    backgroundColor:
                      STATUS_COLORS['In Progress'],
                  },
                ]}
              />
              <Text style={styles.metricValue}>
                {inProgressCount}
              </Text>
              <Text style={styles.metricLabel}>
                Active
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryMetric}>
              <View
                style={[
                  styles.metricDot,
                  {
                    backgroundColor:
                      STATUS_COLORS.Scheduled,
                  },
                ]}
              />
              <Text style={styles.metricValue}>
                {scheduledCount}
              </Text>
              <Text style={styles.metricLabel}>
                Planned
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryMetric}>
              <View
                style={[
                  styles.metricDot,
                  {
                    backgroundColor:
                      STATUS_COLORS.Cancelled,
                  },
                ]}
              />
              <Text style={styles.metricValue}>
                {cancelledCount}
              </Text>
              <Text style={styles.metricLabel}>
                Cancelled
              </Text>
            </View>
          </View>
        </View>

        {/* SEARCH + FILTER + ADD */}

        <View style={styles.actionRow}>
          <View style={styles.searchBox}>
            <MaterialDesignIcons
              name="magnify"
              size={19}
              color="#6F7892"
            />

            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search trips"
              placeholderTextColor="#6F7892"
              style={styles.searchInput}
              returnKeyType="search"
              autoCorrect={false}
            />

            {searchQuery.length > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear trip search"
                onPress={() =>
                  setSearchQuery('')
                }
                style={({pressed}) => [
                  styles.clearButton,
                  pressed && styles.pressed,
                ]}>
                <MaterialDesignIcons
                  name="close-circle"
                  size={17}
                  color="#6F7892"
                />
              </Pressable>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilterCount > 0 &&
                styles.filterButtonActive,
            ]}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel="Filter trips"
            onPress={() =>
              setFilterVisible(true)
            }>

            <MaterialDesignIcons
              name="tune-variant"
              size={19}
              color={
                activeFilterCount > 0
                  ? '#FFFFFF'
                  : '#CBD3E6'
              }
            />

            {activeFilterCount > 0 && (
              <View style={styles.filterCount}>
                <Text style={styles.filterCountText}>
                  {activeFilterCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel="Add Trip"
            onPress={() =>
              navigation.navigate('AddTrip')
            }>

            <MaterialDesignIcons
              name="plus"
              size={19}
              color="#FFFFFF"
            />

            <Text style={styles.addButtonText}>
              Add
            </Text>
          </TouchableOpacity>
        </View>

        {hasFilters && (
          <View style={styles.filterSummary}>
            <Text style={styles.filterSummaryText}>
              {filteredTrips.length} result
              {filteredTrips.length === 1
                ? ''
                : 's'}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear trip filters"
              onPress={() => {
                setSearchQuery('');
                setStatusFilter('All');
              }}
              style={({pressed}) => [
                styles.clearFilters,
                pressed && styles.pressed,
              ]}>
              <Text style={styles.clearFiltersText}>
                Clear
              </Text>
            </Pressable>
          </View>
        )}

        {/* TRIPS */}

        {filteredTrips.map(trip => {
          const statusColor =
            getStatusColor(
              trip.status,
            );

          return (
            <View
              key={trip.id}
              style={styles.tripCard}>

              <View style={styles.tripHeader}>
                <View style={styles.tripIdentity}>
                  <View style={styles.routeRow}>
                    <View style={styles.routeIcon}>
                      <MaterialDesignIcons
                        name="map-marker-outline"
                        size={17}
                        color={TRIP_PURPLE}
                      />
                    </View>

                    <Text
                      style={styles.route}
                      numberOfLines={2}>
                      {trip.origin}
                      {' → '}
                      {trip.destination}
                    </Text>
                  </View>

                  <View style={styles.dateRow}>
                    <MaterialDesignIcons
                      name="calendar-outline"
                      size={15}
                      color="#6F7892"
                    />

                    <Text style={styles.tripDate}>
                      {new Date(
                        trip.scheduledDate,
                      ).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

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
                    {trip.status}
                  </Text>
                </View>
              </View>

              <View style={styles.details}>
                <View style={styles.detailRow}>
                  <MaterialDesignIcons
                    name="truck-outline"
                    size={16}
                    color="#6F7892"
                  />

                  <Text
                    style={styles.detailText}
                    numberOfLines={1}>
                    Vehicle:{' '}
                    {getVehicleRegistration(
                      trip.vehicleId,
                    )}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <MaterialDesignIcons
                    name="account-outline"
                    size={16}
                    color="#6F7892"
                  />

                  <Text
                    style={styles.detailText}
                    numberOfLines={1}>
                    Driver:{' '}
                    {getDriverName(
                      trip.driverId,
                    )}
                  </Text>
                </View>

                {trip.distance !==
                  undefined && (
                  <View style={styles.detailRow}>
                    <MaterialDesignIcons
                      name="map-marker-distance"
                      size={16}
                      color="#6F7892"
                    />

                    <Text
                      style={styles.detailText}
                      numberOfLines={1}>
                      Distance:{' '}
                      {trip.distance.toLocaleString()}{' '}
                      km
                    </Text>
                  </View>
                )}
              </View>

              {/* PROGRESS */}

              <View style={styles.progressBlock}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>
                    Trip progress
                  </Text>

                  <Text
                    style={[
                      styles.progressValue,
                      {
                        color: statusColor,
                      },
                    ]}>
                    {getTripProgress(trip.status)}%
                  </Text>
                </View>

                <View
                  style={styles.progressTrack}
                  accessible
                  accessibilityRole="progressbar"
                  accessibilityValue={{
                    min: 0,
                    max: 100,
                    now: getTripProgress(trip.status),
                  }}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${getTripProgress(
                          trip.status,
                        )}%`,
                        backgroundColor: statusColor,
                      },
                    ]}
                  />
                </View>
              </View>

              {trip.notes && (
                <View style={styles.notesContainer}>
                  <MaterialDesignIcons
                    name="note-text-outline"
                    size={15}
                    color="#6F7892"
                  />

                  <Text style={styles.notes}>
                    {trip.notes}
                  </Text>
                </View>
              )}

              <View style={styles.divider} />

              <View style={styles.actionsRow}>
                <View style={styles.actionSpacer} />

                <TouchableOpacity
                  style={styles.iconButton}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Track trip from ${trip.origin} to ${trip.destination}`}
                  onPress={() =>
                    setTrackingTripId(trip.id)
                  }>
                  <MaterialDesignIcons
                    name="map-marker-radius-outline"
                    size={18}
                    color="#94A3B8"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconButton}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`View trip from ${trip.origin} to ${trip.destination}`}
                  onPress={() =>
                    navigation.navigate(
                      'TripDetails',
                      {trip},
                    )
                  }>
                  <MaterialDesignIcons
                    name="eye-outline"
                    size={18}
                    color="#94A3B8"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconButton}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit trip from ${trip.origin} to ${trip.destination}`}
                  onPress={() =>
                    navigation.navigate(
                      'EditTrip',
                      {trip},
                    )
                  }>
                  <MaterialDesignIcons
                    name="pencil-outline"
                    size={18}
                    color="#94A3B8"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconButton}
                  activeOpacity={0.7}
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

        {filteredTrips.length === 0 && (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <MaterialDesignIcons
                name={
                  trips.length === 0
                    ? 'map-marker-path'
                    : 'map-search-outline'
                }
                size={31}
                color={TRIP_PURPLE}
              />
            </View>

            <Text style={styles.emptyTitle}>
              {trips.length === 0
                ? 'No trips'
                : 'No matching trips'}
            </Text>

            <Text style={styles.emptyText}>
              {trips.length === 0
                ? 'Your fleet currently has no trips.'
                : 'Try a different search or clear the active filters.'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* LIVE TRIP TRACKING */}

      <Modal
        visible={trackingTripId !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setTrackingTripId(null)}>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.trackingSheet,
              {
                paddingBottom:
                  Math.max(insets.bottom, 18) + 12,
              },
            ]}>
            {trackingTripId !== null &&
              (() => {
                const trackingTrip = trips.find(
                  trip => trip.id === trackingTripId,
                );

                if (!trackingTrip) {
                  return (
                    <View style={styles.trackingFallback}>
                      <Text style={styles.trackingFallbackTitle}>
                        Trip unavailable
                      </Text>

                      <TouchableOpacity
                        style={styles.trackingCloseButton}
                        activeOpacity={0.82}
                        onPress={() =>
                          setTrackingTripId(null)
                        }>
                        <Text
                          style={styles.trackingCloseButtonText}>
                          Close
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                }

                const trackingProgress =
                  getTripProgress(
                    trackingTrip.status,
                  );

                const trackingDistanceRemaining =
                  trackingTrip.distance !== undefined
                    ? Math.max(
                        0,
                        Math.round(
                          trackingTrip.distance *
                            (1 -
                              trackingProgress /
                                100),
                        ),
                      )
                    : undefined;

                const currentLocation =
                  trackingTrip.status === 'Completed'
                    ? trackingTrip.destination
                    : trackingTrip.status === 'In Progress'
                    ? 'En route · live location pending'
                    : trackingTrip.status === 'Scheduled'
                    ? trackingTrip.origin
                    : 'Tracking unavailable';

                const etaLabel =
                  trackingTrip.status === 'Completed'
                    ? 'Arrived'
                    : trackingTrip.status === 'In Progress'
                    ? 'Pending live feed'
                    : trackingTrip.status === 'Scheduled'
                    ? 'Not started'
                    : '—';

                const trackingStatusColor =
                  getStatusColor(
                    trackingTrip.status,
                  );

                return (
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={
                      styles.trackingContent
                    }>
                    <View style={styles.sheetHandle} />

                    <View style={styles.trackingHeader}>
                      <View style={styles.trackingHeaderText}>
                        <Text
                          style={styles.sheetEyebrow}>
                          LIVE TRIP TRACKING
                        </Text>

                        <Text
                          style={styles.trackingTitle}
                          numberOfLines={2}>
                          {trackingTrip.origin}
                          {' → '}
                          {trackingTrip.destination}
                        </Text>

                        <Text
                          style={styles.trackingSubtitle}>
                          Tracking workspace for the selected trip
                        </Text>
                      </View>

                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Close trip tracking"
                        onPress={() =>
                          setTrackingTripId(null)
                        }
                        style={({pressed}) => [
                          styles.sheetClose,
                          pressed && styles.pressed,
                        ]}>
                        <MaterialDesignIcons
                          name="close"
                          size={20}
                          color="#CBD3E6"
                        />
                      </Pressable>
                    </View>

                    <View style={styles.mapPlaceholder}>
                      <View style={styles.mapGridHorizontalTop} />
                      <View style={styles.mapGridHorizontalBottom} />
                      <View style={styles.mapGridVerticalLeft} />
                      <View style={styles.mapGridVerticalRight} />

                      <View style={styles.mapRouteLine} />

                      <View
                        style={[
                          styles.mapPoint,
                          styles.mapOriginPoint,
                        ]}>
                        <MaterialDesignIcons
                          name="map-marker"
                          size={18}
                          color="#FFFFFF"
                        />
                      </View>

                      <View
                        style={[
                          styles.mapPoint,
                          styles.mapDestinationPoint,
                        ]}>
                        <MaterialDesignIcons
                          name="flag-checkered"
                          size={17}
                          color="#FFFFFF"
                        />
                      </View>

                      <View style={styles.mapCurrentPill}>
                        <View
                          style={[
                            styles.mapCurrentDot,
                            {
                              backgroundColor:
                                trackingStatusColor,
                            },
                          ]}
                        />

                        <Text
                          style={styles.mapCurrentText}
                          numberOfLines={1}>
                          {currentLocation}
                        </Text>
                      </View>

                      <View style={styles.mapProviderLabel}>
                        <MaterialDesignIcons
                          name="map-outline"
                          size={14}
                          color="#9AA4BF"
                        />

                        <Text
                          style={styles.mapProviderText}>
                          Map integration ready
                        </Text>
                      </View>
                    </View>

                    <View style={styles.trackingProgressCard}>
                      <View
                        style={
                          styles.trackingProgressHeader
                        }>
                        <View>
                          <Text
                            style={
                              styles.trackingProgressEyebrow
                            }>
                            ROUTE PROGRESS
                          </Text>

                          <Text
                            style={
                              styles.trackingProgressValue
                            }>
                            {trackingProgress}% complete
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.trackingStatusBadge,
                            {
                              backgroundColor:
                                `${trackingStatusColor}14`,
                              borderColor:
                                `${trackingStatusColor}28`,
                            },
                          ]}>
                          <View
                            style={[
                              styles.statusDot,
                              {
                                backgroundColor:
                                  trackingStatusColor,
                              },
                            ]}
                          />

                          <Text
                            style={[
                              styles.statusText,
                              {
                                color:
                                  trackingStatusColor,
                              },
                            ]}>
                            {trackingTrip.status}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={styles.trackingProgressTrack}
                        accessible
                        accessibilityRole="progressbar"
                        accessibilityValue={{
                          min: 0,
                          max: 100,
                          now: trackingProgress,
                        }}>
                        <View
                          style={[
                            styles.trackingProgressFill,
                            {
                              width: `${trackingProgress}%`,
                              backgroundColor:
                                trackingStatusColor,
                            },
                          ]}
                        />
                      </View>
                    </View>

                    <View style={styles.trackingMetrics}>
                      <View style={styles.trackingMetric}>
                        <MaterialDesignIcons
                          name="clock-outline"
                          size={19}
                          color={TRIP_PURPLE}
                        />

                        <Text
                          style={styles.trackingMetricLabel}>
                          ETA
                        </Text>

                        <Text
                          style={styles.trackingMetricValue}
                          numberOfLines={2}>
                          {etaLabel}
                        </Text>
                      </View>

                      <View style={styles.trackingMetricDivider} />

                      <View style={styles.trackingMetric}>
                        <MaterialDesignIcons
                          name="map-marker-distance"
                          size={19}
                          color={TRIP_PURPLE}
                        />

                        <Text
                          style={styles.trackingMetricLabel}>
                          REMAINING
                        </Text>

                        <Text
                          style={styles.trackingMetricValue}>
                          {trackingDistanceRemaining !==
                          undefined
                            ? `${trackingDistanceRemaining.toLocaleString(
                                'en-IN',
                              )} km`
                            : '—'}
                        </Text>
                      </View>

                      <View style={styles.trackingMetricDivider} />

                      <View style={styles.trackingMetric}>
                        <MaterialDesignIcons
                          name="calendar-outline"
                          size={19}
                          color={TRIP_PURPLE}
                        />

                        <Text
                          style={styles.trackingMetricLabel}>
                          DEPARTURE
                        </Text>

                        <Text
                          style={styles.trackingMetricValue}
                          numberOfLines={2}>
                          {new Date(
                            trackingTrip.scheduledDate,
                          ).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.trackingInfoCard}>
                      <View style={styles.trackingInfoRow}>
                        <View style={styles.trackingInfoIcon}>
                          <MaterialDesignIcons
                            name="truck-outline"
                            size={18}
                            color="#9B5CFF"
                          />
                        </View>

                        <View style={styles.trackingInfoText}>
                          <Text style={styles.trackingInfoLabel}>
                            VEHICLE
                          </Text>

                          <Text style={styles.trackingInfoValue}>
                            {getVehicleRegistration(
                              trackingTrip.vehicleId,
                            )}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.trackingInfoDivider} />

                      <View style={styles.trackingInfoRow}>
                        <View style={styles.trackingInfoIcon}>
                          <MaterialDesignIcons
                            name="account-outline"
                            size={18}
                            color="#9B5CFF"
                          />
                        </View>

                        <View style={styles.trackingInfoText}>
                          <Text style={styles.trackingInfoLabel}>
                            DRIVER
                          </Text>

                          <Text style={styles.trackingInfoValue}>
                            {getDriverName(
                              trackingTrip.driverId,
                            )}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.trackingNotice}>
                      <MaterialDesignIcons
                        name="satellite-variant"
                        size={18}
                        color="#55D6FF"
                      />

                      <Text style={styles.trackingNoticeText}>
                        Live GPS data can be connected to this
                        workspace later without changing the trip
                        workflow.
                      </Text>
                    </View>
                  </ScrollView>
                );
              })()}
          </View>
        </View>
      </Modal>

      {/* FILTER SHEET */}

      <Modal
        visible={filterVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setFilterVisible(false)
        }>

        <Pressable
          style={styles.modalBackdrop}
          onPress={() =>
            setFilterVisible(false)
          }>

          <Pressable
            style={[
              styles.filterSheet,
              {
                paddingBottom:
                  Math.max(insets.bottom, 18) +
                  14,
              },
            ]}
            onPress={() => {}}>

            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetEyebrow}>
                  FILTER
                </Text>

                <Text style={styles.sheetTitle}>
                  Trip status
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close filter"
                onPress={() =>
                  setFilterVisible(false)
                }
                style={({pressed}) => [
                  styles.sheetClose,
                  pressed && styles.pressed,
                ]}>
                <MaterialDesignIcons
                  name="close"
                  size={20}
                  color="#CBD3E6"
                />
              </Pressable>
            </View>

            {(
              [
                'All',
                'Completed',
                'In Progress',
                'Scheduled',
                'Cancelled',
              ] as TripStatus[]
            ).map(option => {
              const selected =
                statusFilter === option;

              const optionColor =
                option === 'All'
                  ? TRIP_PURPLE
                  : getStatusColor(option);

              return (
                <Pressable
                  key={option}
                  accessibilityRole="radio"
                  accessibilityState={{
                    selected,
                  }}
                  onPress={() =>
                    setStatusFilter(option)
                  }
                  style={({pressed}) => [
                    styles.filterOption,
                    selected &&
                      styles.filterOptionSelected,
                    pressed &&
                      styles.pressed,
                  ]}>

                  <View
                    style={[
                      styles.optionIcon,
                      {
                        backgroundColor:
                          `${optionColor}14`,
                        borderColor:
                          `${optionColor}30`,
                      },
                    ]}>

                    <View
                      style={[
                        styles.optionDot,
                        {
                          backgroundColor:
                            optionColor,
                        },
                      ]}
                    />
                  </View>

                  <Text style={styles.filterOptionText}>
                    {option}
                  </Text>

                  <View style={styles.optionRight}>
                    <Text style={styles.optionCount}>
                      {option === 'All'
                        ? trips.length
                        : trips.filter(
                            trip =>
                              trip.status ===
                              option,
                          ).length}
                    </Text>

                    {selected && (
                      <MaterialDesignIcons
                        name="check"
                        size={19}
                        color={TRIP_PURPLE}
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}

            <TouchableOpacity
              style={styles.applyButton}
              activeOpacity={0.82}
              onPress={() =>
                setFilterVisible(false)
              }>
              <Text style={styles.applyButtonText}>
                Done
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
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
    marginBottom: 16,
  },

  headerIcon: {
    width: 46,
    height: 46,
    marginRight: 12,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(155, 92, 255, 0.10)',
    borderWidth: 1,
    borderColor:
      'rgba(155, 92, 255, 0.20)',
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

  summaryCard: {
    minHeight: 88,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor:
      'rgba(18, 24, 46, 0.84)',
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.08)',
  },

  summaryMain: {
    minWidth: 76,
    paddingRight: 8,
  },

  summaryValue: {
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '800',
    color: '#F5F7FF',
  },

  summaryLabel: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    color: '#6F7892',
  },

  summaryMetrics: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  summaryMetric: {
    alignItems: 'center',
    minWidth: 36,
  },

  metricDot: {
    width: 6,
    height: 6,
    marginBottom: 4,
    borderRadius: 3,
  },

  metricValue: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
    color: '#CBD3E6',
  },

  metricLabel: {
    marginTop: 1,
    fontSize: 8,
    lineHeight: 12,
    fontWeight: '600',
    color: '#6F7892',
  },

  summaryDivider: {
    width: 1,
    height: 28,
    backgroundColor:
      'rgba(255, 255, 255, 0.06)',
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  searchBox: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#0B1221',
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.08)',
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    marginLeft: 8,
    paddingVertical: 0,
    fontSize: 13,
    lineHeight: 18,
    color: '#F5F7FF',
  },

  clearButton: {
    padding: 4,
  },

  filterButton: {
    width: 44,
    height: 44,
    marginLeft: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10182B',
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.08)',
  },

  filterButtonActive: {
    backgroundColor: '#7B4ACC',
    borderColor:
      'rgba(255, 255, 255, 0.12)',
  },

  filterCount: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 14,
    height: 14,
    paddingHorizontal: 3,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  filterCountText: {
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '800',
    color: '#7B4ACC',
  },

  addButton: {
    height: 44,
    marginLeft: 8,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#8B4DE8',
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.10)',
  },

  addButtonText: {
    marginLeft: 6,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  filterSummary: {
    minHeight: 28,
    marginBottom: 8,
    paddingHorizontal: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  filterSummaryText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    color: '#6F7892',
  },

  clearFilters: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },

  clearFiltersText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    color: TRIP_PURPLE,
  },

  tripCard: {
    marginBottom: 11,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#0B1423',
    borderWidth: 1,
    borderColor: '#16263B',
  },

  tripHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  tripIdentity: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },

  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  routeIcon: {
    width: 32,
    height: 32,
    marginRight: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(155, 92, 255, 0.10)',
    borderWidth: 1,
    borderColor:
      'rgba(155, 92, 255, 0.18)',
  },

  route: {
    flex: 1,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
    color: '#F5F7FF',
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 41,
  },

  tripDate: {
    marginLeft: 6,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: '#9AA4BF',
  },

  statusBadge: {
    flexShrink: 0,
    maxWidth: 108,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
  },

  statusDot: {
    width: 6,
    height: 6,
    marginRight: 6,
    borderRadius: 3,
  },

  statusText: {
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '800',
  },

  details: {
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor:
      'rgba(255, 255, 255, 0.06)',
  },

  detailRow: {
    minHeight: 22,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    color: '#9AA4BF',
  },

  progressBlock: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor:
      'rgba(255, 255, 255, 0.06)',
  },

  progressHeader: {
    marginBottom: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  progressLabel: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#6F7892',
    textTransform: 'uppercase',
  },

  progressValue: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
  },

  progressTrack: {
    height: 6,
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: '#162235',
  },

  progressFill: {
    height: '100%',
    borderRadius: 999,
  },

  notesContainer: {
    marginTop: 3,
    paddingTop: 5,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  notes: {
    flex: 1,
    marginLeft: 7,
    fontSize: 12,
    lineHeight: 18,
    color: '#8FA0B5',
  },

  divider: {
    height: 1,
    marginTop: 8,
    backgroundColor:
      'rgba(255, 255, 255, 0.06)',
  },

  actionsRow: {
    marginTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  actionSpacer: {
    flex: 1,
  },

  iconButton: {
    width: 34,
    height: 34,
    marginLeft: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'transparent',
  },

  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 42,
    borderRadius: 16,
    backgroundColor: '#0B1423',
    borderWidth: 1,
    borderColor: '#16263B',
  },

  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(155, 92, 255, 0.10)',
    borderWidth: 1,
    borderColor:
      'rgba(155, 92, 255, 0.18)',
  },

  emptyTitle: {
    marginTop: 14,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '800',
    color: '#F5F7FF',
  },

  emptyText: {
    maxWidth: 280,
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    color: '#8B96B0',
  },

  trackingSheet: {
    maxHeight: '92%',
    paddingHorizontal: 18,
    paddingTop: 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#0A1020',
    borderTopWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.08)',
  },

  trackingContent: {
    paddingBottom: 2,
  },

  trackingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  trackingHeaderText: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },

  trackingTitle: {
    marginTop: 4,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '800',
    color: '#F5F7FF',
  },

  trackingSubtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: '#8B96B0',
  },

  mapPlaceholder: {
    height: 192,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 16,
    backgroundColor: '#0D1526',
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.08)',
  },

  mapGridHorizontalTop: {
    position: 'absolute',
    top: 45,
    left: -20,
    right: -20,
    height: 1,
    backgroundColor:
      'rgba(155, 164, 191, 0.08)',
    transform: [{rotate: '-7deg'}],
  },

  mapGridHorizontalBottom: {
    position: 'absolute',
    bottom: 42,
    left: -20,
    right: -20,
    height: 1,
    backgroundColor:
      'rgba(155, 164, 191, 0.08)',
    transform: [{rotate: '8deg'}],
  },

  mapGridVerticalLeft: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    left: '27%',
    width: 1,
    backgroundColor:
      'rgba(155, 164, 191, 0.07)',
    transform: [{rotate: '14deg'}],
  },

  mapGridVerticalRight: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    right: '25%',
    width: 1,
    backgroundColor:
      'rgba(155, 164, 191, 0.07)',
    transform: [{rotate: '-13deg'}],
  },

  mapRouteLine: {
    position: 'absolute',
    top: '46%',
    left: '21%',
    width: '58%',
    height: 3,
    borderRadius: 999,
    backgroundColor:
      'rgba(155, 92, 255, 0.34)',
    transform: [{rotate: '-8deg'}],
  },

  mapPoint: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F1A30',
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.12)',
  },

  mapOriginPoint: {
    top: '53%',
    left: '15%',
  },

  mapDestinationPoint: {
    top: '31%',
    right: '12%',
  },

  mapCurrentPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    maxWidth: '78%',
    minHeight: 34,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor:
      'rgba(5, 7, 17, 0.84)',
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.08)',
  },

  mapCurrentDot: {
    width: 7,
    height: 7,
    marginRight: 7,
    borderRadius: 4,
  },

  mapCurrentText: {
    flexShrink: 1,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    color: '#CBD3E6',
  },

  mapProviderLabel: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9,
    backgroundColor:
      'rgba(5, 7, 17, 0.76)',
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.07)',
  },

  mapProviderText: {
    marginLeft: 5,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '700',
    color: '#9AA4BF',
  },

  trackingProgressCard: {
    marginTop: 12,
    padding: 13,
    borderRadius: 15,
    backgroundColor: '#0B1423',
    borderWidth: 1,
    borderColor: '#16263B',
  },

  trackingProgressHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 9,
  },

  trackingProgressEyebrow: {
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#6F7892',
  },

  trackingProgressValue: {
    marginTop: 3,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
    color: '#F5F7FF',
  },

  trackingStatusBadge: {
    maxWidth: 112,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
  },

  trackingProgressTrack: {
    height: 8,
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: '#162235',
  },

  trackingProgressFill: {
    height: '100%',
    borderRadius: 999,
  },

  trackingMetrics: {
    marginTop: 12,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 15,
    backgroundColor: '#0B1423',
    borderWidth: 1,
    borderColor: '#16263B',
  },

  trackingMetric: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 8,
    alignItems: 'center',
  },

  trackingMetricDivider: {
    width: 1,
    backgroundColor:
      'rgba(255, 255, 255, 0.07)',
  },

  trackingMetricLabel: {
    marginTop: 6,
    fontSize: 8,
    lineHeight: 12,
    fontWeight: '700',
    letterSpacing: 0.7,
    color: '#6F7892',
  },

  trackingMetricValue: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
    textAlign: 'center',
    color: '#CBD3E6',
  },

  trackingInfoCard: {
    marginTop: 12,
    paddingHorizontal: 13,
    borderRadius: 15,
    backgroundColor: '#0B1423',
    borderWidth: 1,
    borderColor: '#16263B',
  },

  trackingInfoRow: {
    minHeight: 57,
    flexDirection: 'row',
    alignItems: 'center',
  },

  trackingInfoIcon: {
    width: 36,
    height: 36,
    marginRight: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(155, 92, 255, 0.10)',
    borderWidth: 1,
    borderColor:
      'rgba(155, 92, 255, 0.18)',
  },

  trackingInfoText: {
    flex: 1,
    minWidth: 0,
  },

  trackingInfoLabel: {
    fontSize: 8,
    lineHeight: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#6F7892',
  },

  trackingInfoValue: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: '#F5F7FF',
  },

  trackingInfoDivider: {
    height: 1,
    backgroundColor:
      'rgba(255, 255, 255, 0.06)',
  },

  trackingNotice: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 13,
    backgroundColor:
      'rgba(85, 214, 255, 0.06)',
    borderWidth: 1,
    borderColor:
      'rgba(85, 214, 255, 0.14)',
  },

  trackingNoticeText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 11,
    lineHeight: 16,
    color: '#9AA4BF',
  },

  trackingFallback: {
    paddingVertical: 24,
    alignItems: 'center',
  },

  trackingFallbackTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
    color: '#F5F7FF',
  },

  trackingCloseButton: {
    minHeight: 44,
    marginTop: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B4DE8',
  },

  trackingCloseButtonText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor:
      'rgba(0, 0, 0, 0.58)',
  },

  filterSheet: {
    paddingHorizontal: 18,
    paddingTop: 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#0A1020',
    borderTopWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.08)',
  },

  sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    marginBottom: 18,
    borderRadius: 2,
    backgroundColor: '#33415B',
  },

  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  sheetEyebrow: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: '#6F7892',
  },

  sheetTitle: {
    marginTop: 3,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '800',
    color: '#F5F7FF',
  },

  sheetClose: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10182B',
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.08)',
  },

  filterOption: {
    minHeight: 54,
    marginBottom: 7,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 13,
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.05)',
    backgroundColor: '#0D1526',
  },

  filterOptionSelected: {
    borderColor:
      'rgba(155, 92, 255, 0.24)',
    backgroundColor:
      'rgba(155, 92, 255, 0.08)',
  },

  optionIcon: {
    width: 32,
    height: 32,
    marginRight: 10,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  optionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  filterOptionText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: '#CBD3E6',
  },

  optionRight: {
    minWidth: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  optionCount: {
    marginRight: 7,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    color: '#6F7892',
  },

  applyButton: {
    minHeight: 48,
    marginTop: 7,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B4DE8',
  },

  applyButtonText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default TripsScreen;
