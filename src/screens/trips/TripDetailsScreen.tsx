import React from 'react';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useNavigation,
  useRoute,
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

import {useDrivers, useVehicles} from '../../store';
import type {Trip} from '../../types';

type TripDetailsNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;

const TRIP_PURPLE = '#9B5CFF';

const STATUS_COLORS = {
  Completed: '#00D6A3',
  'In Progress': '#3B82F6',
  Scheduled: '#F59E0B',
  Cancelled: '#EF4444',
} as const;

const TripDetailsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<TripDetailsNavigationProp>();
  const route = useRoute();

  const {vehicles} = useVehicles();
  const {drivers} = useDrivers();

  const {trip} = route.params as {
    trip: Trip;
  };

  const vehicle = vehicles.find(
    item => item.id === trip.vehicleId,
  );

  const driver = drivers.find(
    item => item.id === trip.driverId,
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = () => {
    switch (trip.status) {
      case 'Completed':
        return STATUS_COLORS.Completed;

      case 'In Progress':
        return STATUS_COLORS['In Progress'];

      case 'Cancelled':
        return STATUS_COLORS.Cancelled;

      default:
        return STATUS_COLORS.Scheduled;
    }
  };

  const getTripProgress = () => {
    switch (trip.status) {
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

  const getCurrentLocation = () => {
    switch (trip.status) {
      case 'Completed':
        return trip.destination;

      case 'In Progress':
        return 'En route · live location pending';

      case 'Scheduled':
        return trip.origin;

      case 'Cancelled':
        return 'Tracking unavailable';

      default:
        return 'Tracking unavailable';
    }
  };

  const getEtaLabel = () => {
    switch (trip.status) {
      case 'Completed':
        return 'Arrived';

      case 'In Progress':
        return 'Pending live feed';

      case 'Scheduled':
        return 'Not started';

      case 'Cancelled':
        return '—';

      default:
        return '—';
    }
  };

  const statusColor = getStatusColor();
  const progress = getTripProgress();

  const distanceRemaining =
    trip.distance !== undefined
      ? Math.max(
          0,
          Math.round(
            trip.distance *
              (1 - progress / 100),
          ),
        )
      : undefined;

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
              Math.max(insets.bottom, 20) + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}>

        {/* HEADER */}

        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
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
                  name="map-marker-path"
                  size={18}
                  color={TRIP_PURPLE}
                />
              </View>

              <Text style={styles.eyebrow}>
                FLEET OPERATIONS
              </Text>
            </View>

            <Text style={styles.title}>
              Trip Details
            </Text>

            <Text style={styles.subtitle}>
              Route, assignment and live trip status
            </Text>
          </View>
        </View>

        {/* ROUTE SUMMARY */}

        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.routeIcon}>
              <MaterialDesignIcons
                name="map-marker-outline"
                size={21}
                color={TRIP_PURPLE}
              />
            </View>

            <View style={styles.heroIdentity}>
              <Text style={styles.heroEyebrow}>
                ROUTE
              </Text>

              <Text
                style={styles.routeTitle}
                numberOfLines={2}>
                {trip.origin}
                {' → '}
                {trip.destination}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    `${statusColor}14`,
                  borderColor:
                    `${statusColor}30`,
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
                  {color: statusColor},
                ]}>
                {trip.status}
              </Text>
            </View>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroMetaRow}>
            <MaterialDesignIcons
              name="calendar-outline"
              size={16}
              color="#6F7892"
            />

            <Text style={styles.heroMetaText}>
              Scheduled {formatDate(trip.scheduledDate)}
            </Text>
          </View>
        </View>

        {/* TRIP PROGRESS */}

        <View style={styles.card}>
          <View style={styles.sectionHeadingRow}>
            <View>
              <Text style={styles.sectionTitle}>
                Trip Progress
              </Text>
              <Text style={styles.sectionSubtitle}>
                Current journey completion
              </Text>
            </View>

            <Text
              style={[
                styles.progressValue,
                {color: statusColor},
              ]}>
              {progress}%
            </Text>
          </View>

          <View
            style={styles.progressTrack}
            accessible
            accessibilityRole="progressbar"
            accessibilityValue={{
              min: 0,
              max: 100,
              now: progress,
            }}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: statusColor,
                },
              ]}
            />
          </View>

          <View style={styles.progressLegendRow}>
            <Text style={styles.progressLegendText}>
              {trip.origin}
            </Text>

            <Text style={styles.progressLegendText}>
              {trip.destination}
            </Text>
          </View>
        </View>

        {/* LIVE TRACKING */}

        <View style={styles.card}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.sectionTitleGroup}>
              <View style={styles.trackingIcon}>
                <MaterialDesignIcons
                  name="crosshairs-gps"
                  size={18}
                  color={TRIP_PURPLE}
                />
              </View>

              <View style={styles.sectionHeadingText}>
                <Text style={styles.sectionTitle}>
                  Live Tracking
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Current route intelligence
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.mapPlaceholder}>
            <View style={styles.mapGridRow} />
            <View style={styles.mapGridColumn} />

            <View style={styles.mapStartMarker}>
              <MaterialDesignIcons
                name="map-marker"
                size={18}
                color="#F59E0B"
              />
            </View>

            <View
              style={[
                styles.mapRouteLine,
                {
                  backgroundColor:
                    `${TRIP_PURPLE}66`,
                },
              ]}
            />

            <View
              style={[
                styles.mapProgressLine,
                {
                  width:
                    progress === 0
                      ? 0
                      : progress === 100
                      ? '100%'
                      : '62%',
                  backgroundColor:
                    statusColor,
                },
              ]}
            />

            <View
              style={[
                styles.mapCurrentMarker,
                {
                  left: `${18 + progress * 0.64}%`,
                  borderColor:
                    statusColor,
                },
              ]}>
              <View
                style={[
                  styles.mapCurrentDot,
                  {
                    backgroundColor:
                      statusColor,
                  },
                ]}
              />
            </View>

            <View style={styles.mapEndMarker}>
              <MaterialDesignIcons
                name="map-marker-check-outline"
                size={19}
                color={STATUS_COLORS.Completed}
              />
            </View>

            <View style={styles.mapLabelStart}>
              <Text style={styles.mapLabelText}>
                {trip.origin}
              </Text>
            </View>

            <View style={styles.mapLabelEnd}>
              <Text style={styles.mapLabelText}>
                {trip.destination}
              </Text>
            </View>

            <View style={styles.mapPlaceholderBadge}>
              <MaterialDesignIcons
                name="map-outline"
                size={15}
                color="#9AA4BF"
              />
              <Text style={styles.mapPlaceholderText}>
                Map service ready
              </Text>
            </View>
          </View>

          <View style={styles.trackingGrid}>
            <View style={styles.trackingMetric}>
              <Text style={styles.trackingLabel}>
                Current location
              </Text>
              <Text
                style={styles.trackingValue}
                numberOfLines={2}>
                {getCurrentLocation()}
              </Text>
            </View>

            <View style={styles.trackingMetric}>
              <Text style={styles.trackingLabel}>
                ETA
              </Text>
              <Text style={styles.trackingValue}>
                {getEtaLabel()}
              </Text>
            </View>

            <View style={styles.trackingMetric}>
              <Text style={styles.trackingLabel}>
                Distance remaining
              </Text>
              <Text style={styles.trackingValue}>
                {distanceRemaining !== undefined
                  ? `${distanceRemaining.toLocaleString()} km`
                  : 'Not provided'}
              </Text>
            </View>

            <View style={styles.trackingMetric}>
              <Text style={styles.trackingLabel}>
                Tracking status
              </Text>
              <Text
                style={[
                  styles.trackingValue,
                  {color: statusColor},
                ]}>
                {trip.status === 'In Progress'
                  ? 'Live updates pending'
                  : trip.status === 'Completed'
                  ? 'Trip completed'
                  : trip.status === 'Scheduled'
                  ? 'Awaiting start'
                  : 'Unavailable'}
              </Text>
            </View>
          </View>
        </View>

        {/* ASSIGNMENT */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Trip Assignment
          </Text>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MaterialDesignIcons
                name="truck-outline"
                size={18}
                color="#1688FF"
              />
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>
                Vehicle
              </Text>

              <Text style={styles.detailValue}>
                {vehicle
                  ? `${vehicle.registrationNumber} · ${vehicle.make} ${vehicle.model}`
                  : 'Unknown Vehicle'}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MaterialDesignIcons
                name="account-outline"
                size={18}
                color="#00D6C9"
              />
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>
                Driver
              </Text>

              <Text style={styles.detailValue}>
                {driver
                  ? `${driver.name} (${driver.employeeId})`
                  : 'Unknown Driver'}
              </Text>
            </View>
          </View>
        </View>

        {/* SCHEDULE */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Schedule
          </Text>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MaterialDesignIcons
                name="calendar-clock-outline"
                size={18}
                color="#F59E0B"
              />
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>
                Scheduled date
              </Text>

              <Text style={styles.detailValue}>
                {formatDate(trip.scheduledDate)}
              </Text>
            </View>
          </View>

          {trip.startTime && (
            <>
              <View style={styles.separator} />

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <MaterialDesignIcons
                    name="play-circle-outline"
                    size={18}
                    color="#3B82F6"
                  />
                </View>

                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>
                    Start time
                  </Text>

                  <Text style={styles.detailValue}>
                    {trip.startTime}
                  </Text>
                </View>
              </View>
            </>
          )}

          {trip.endTime && (
            <>
              <View style={styles.separator} />

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <MaterialDesignIcons
                    name="flag-checkered"
                    size={18}
                    color="#00D6A3"
                  />
                </View>

                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>
                    End time
                  </Text>

                  <Text style={styles.detailValue}>
                    {trip.endTime}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* TRIP INFORMATION */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Trip Information
          </Text>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MaterialDesignIcons
                name="map-marker-distance"
                size={18}
                color={TRIP_PURPLE}
              />
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>
                Total distance
              </Text>

              <Text
                style={[
                  styles.detailValue,
                  styles.distanceValue,
                ]}>
                {trip.distance !== undefined
                  ? `${trip.distance.toLocaleString()} km`
                  : 'Not provided'}
              </Text>
            </View>
          </View>

          {trip.notes && (
            <>
              <View style={styles.separator} />

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <MaterialDesignIcons
                    name="note-text-outline"
                    size={18}
                    color="#9AA4BF"
                  />
                </View>

                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>
                    Notes
                  </Text>

                  <Text style={styles.detailValue}>
                    {trip.notes}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* RECORD INFORMATION */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Record Information
          </Text>

          <View style={styles.detailRowCompact}>
            <Text style={styles.detailLabel}>
              Record ID
            </Text>

            <Text style={styles.detailValueSmall}>
              {trip.id}
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRowCompact}>
            <Text style={styles.detailLabel}>
              Created
            </Text>

            <Text style={styles.detailValue}>
              {formatDate(trip.createdAt)}
            </Text>
          </View>
        </View>

        <View style={styles.footerNote}>
          <MaterialDesignIcons
            name="information-outline"
            size={17}
            color="#6F7892"
          />

          <Text style={styles.footerNoteText}>
            Live location and ETA become real-time once a tracking feed is connected.
          </Text>
        </View>
      </ScrollView>
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
    opacity: 0.76,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },

  backButton: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10182B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  headerIcon: {
    width: 28,
    height: 28,
    marginRight: 8,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(155,92,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(155,92,255,0.20)',
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

  heroCard: {
    marginBottom: 12,
    padding: 15,
    borderRadius: 18,
    backgroundColor: 'rgba(18,24,46,0.84)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  routeIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(155,92,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(155,92,255,0.20)',
  },

  heroIdentity: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },

  heroEyebrow: {
    marginBottom: 3,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#6F7892',
  },

  routeTitle: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '800',
    color: '#F5F7FF',
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

  heroDivider: {
    height: 1,
    marginTop: 14,
    marginBottom: 11,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroMetaText: {
    marginLeft: 7,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    color: '#9AA4BF',
  },

  card: {
    marginBottom: 12,
    padding: 15,
    borderRadius: 18,
    backgroundColor: '#0B1423',
    borderWidth: 1,
    borderColor: '#16263B',
  },

  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitleGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  trackingIcon: {
    width: 34,
    height: 34,
    marginRight: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(155,92,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(155,92,255,0.18)',
  },

  sectionHeadingText: {
    flex: 1,
    minWidth: 0,
  },

  sectionTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
    color: '#F5F7FF',
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 15,
    color: '#6F7892',
  },

  progressValue: {
    marginLeft: 12,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '800',
  },

  progressTrack: {
    height: 8,
    marginTop: 14,
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: '#18253A',
  },

  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  progressLegendRow: {
    marginTop: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  progressLegendText: {
    maxWidth: '46%',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '600',
    color: '#6F7892',
  },

  mapPlaceholder: {
    position: 'relative',
    height: 175,
    marginTop: 14,
    overflow: 'hidden',
    borderRadius: 14,
    backgroundColor: '#0A1220',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  mapGridRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 1,
    backgroundColor: 'rgba(143,157,255,0.08)',
  },

  mapGridColumn: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 1,
    backgroundColor: 'rgba(143,157,255,0.08)',
  },

  mapRouteLine: {
    position: 'absolute',
    left: '18%',
    right: '18%',
    top: '50%',
    height: 3,
    borderRadius: 2,
  },

  mapProgressLine: {
    position: 'absolute',
    left: '18%',
    top: '50%',
    height: 4,
    borderRadius: 2,
  },

  mapStartMarker: {
    position: 'absolute',
    left: '11%',
    top: '42%',
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245,158,11,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.22)',
  },

  mapCurrentMarker: {
    position: 'absolute',
    left: '18%',
    top: 'calc(50% - 10px)',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A1220',
    borderWidth: 2,
  },

  mapCurrentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  mapEndMarker: {
    position: 'absolute',
    right: '11%',
    top: '42%',
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,214,163,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(0,214,163,0.20)',
  },

  mapLabelStart: {
    position: 'absolute',
    left: 10,
    bottom: 11,
    maxWidth: '36%',
  },

  mapLabelEnd: {
    position: 'absolute',
    right: 10,
    bottom: 11,
    maxWidth: '36%',
    alignItems: 'flex-end',
  },

  mapLabelText: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    color: '#CBD3E6',
  },

  mapPlaceholderBadge: {
    position: 'absolute',
    right: 10,
    top: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9,
    backgroundColor: 'rgba(7,13,24,0.84)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },

  mapPlaceholderText: {
    marginLeft: 5,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '700',
    color: '#9AA4BF',
  },

  trackingGrid: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },

  trackingMetric: {
    width: '50%',
    paddingHorizontal: 5,
    paddingVertical: 8,
  },

  trackingLabel: {
    marginBottom: 4,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    color: '#6F7892',
  },

  trackingValue: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: '#F5F7FF',
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  detailContent: {
    flex: 1,
    minWidth: 0,
    paddingTop: 1,
  },

  detailIcon: {
    width: 34,
    height: 34,
    marginRight: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10182B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },

  detailLabel: {
    marginBottom: 4,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    color: '#6F7892',
  },

  detailValue: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: '#F5F7FF',
  },

  detailValueSmall: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    color: '#9AA4BF',
  },

  distanceValue: {
    color: TRIP_PURPLE,
  },

  separator: {
    height: 1,
    marginVertical: 13,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  detailRowCompact: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },

  footerNote: {
    marginTop: 2,
    paddingHorizontal: 3,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  footerNoteText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 11,
    lineHeight: 16,
    color: '#6F7892',
  },
});

export default TripDetailsScreen;
