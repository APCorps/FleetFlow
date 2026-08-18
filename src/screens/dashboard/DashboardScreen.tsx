import React, {useState} from 'react';

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import Svg, {
  Circle,
} from 'react-native-svg';

import {Button, Card} from '../../components';

import {
  useAuth,
  useDrivers,
  useMaintenance,
  useTrips,
  useVehicles,
} from '../../store';

import type {RootStackParamList} from '../../navigation/AppNavigator';

type DashboardNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

type FleetSummaryItem = {
  value: number;
  label: string;
  lowColor: string;
  highColor: string;
};

/*
 * Smaller circular graphs
 */
const RING_SIZE = 68;
const RING_STROKE_WIDTH = 6;

const RING_RADIUS =
  (RING_SIZE - RING_STROKE_WIDTH) / 2;

const RING_CIRCUMFERENCE =
  2 * Math.PI * RING_RADIUS;

const DashboardScreen = () => {
  const navigation =
    useNavigation<DashboardNavigationProp>();

  const {user, logout} = useAuth();

  const {vehicles} = useVehicles();
  const {drivers} = useDrivers();
  const {trips} = useTrips();
  const {maintenanceRecords} =
    useMaintenance();

  /*
   * Profile menu state
   */
  const [profileMenuVisible, setProfileMenuVisible] =
    useState(false);

  const handleLogout = async () => {
    setProfileMenuVisible(false);

    try {
      await logout();
    } catch (error) {
      console.error(
        'Logout failed:',
        error,
      );
    }
  };

  /*
   * VEHICLE SUMMARY
   */
  const totalVehicles = vehicles.length;

  const activeVehicles = vehicles.filter(
    vehicle => vehicle.status === 'Active',
  ).length;

  const maintenanceVehicles =
    vehicles.filter(
      vehicle =>
        vehicle.status === 'Maintenance',
    ).length;

  /*
   * DRIVER SUMMARY
   */
  const totalDrivers = drivers.length;

  const activeDrivers = drivers.filter(
    driver => driver.status === 'Active',
  ).length;

  const inactiveDrivers = drivers.filter(
    driver => driver.status === 'Inactive',
  ).length;

  const driversOnLeave = drivers.filter(
    driver => driver.status === 'On Leave',
  ).length;

  /*
   * TRIP SUMMARY
   */
  const totalTrips = trips.length;

  const scheduledTrips = trips.filter(
    trip => trip.status === 'Scheduled',
  ).length;

  const inProgressTrips = trips.filter(
    trip => trip.status === 'In Progress',
  ).length;

  const completedTrips = trips.filter(
    trip => trip.status === 'Completed',
  ).length;

  /*
   * MAINTENANCE SUMMARY
   */
  const totalMaintenance =
    maintenanceRecords.length;

  const scheduledMaintenance =
    maintenanceRecords.filter(
      record => record.status === 'Scheduled',
    ).length;

  const inProgressMaintenance =
    maintenanceRecords.filter(
      record =>
        record.status === 'In Progress',
    ).length;

  const completedMaintenance =
    maintenanceRecords.filter(
      record =>
        record.status === 'Completed',
    ).length;

  /*
   * ALERT COUNT
   */
  const alerts = maintenanceRecords.filter(
    record => record.priority === 'High',
  ).length;

  /*
   * FLEET OVERVIEW
   */
  const fleetSummary: FleetSummaryItem[] = [
    {
      value: totalVehicles,
      label: 'Vehicles',
      lowColor: '#93C5FD',
      highColor: '#2563EB',
    },
    {
      value: activeVehicles,
      label: 'Active Vehicles',
      lowColor: '#86EFAC',
      highColor: '#16A34A',
    },
    {
      value: maintenanceVehicles,
      label: 'In Maintenance',
      lowColor: '#FDE68A',
      highColor: '#D97706',
    },
    {
      value: alerts,
      label: 'Alerts',
      lowColor: '#FCA5A5',
      highColor: '#DC2626',
    },
    {
      value: totalDrivers,
      label: 'Drivers',
      lowColor: '#C4B5FD',
      highColor: '#7C3AED',
    },
    {
      value: activeDrivers,
      label: 'Active Drivers',
      lowColor: '#67E8F9',
      highColor: '#0891B2',
    },
    {
      value: totalTrips,
      label: 'Trips',
      lowColor: '#A5B4FC',
      highColor: '#4F46E5',
    },
    {
      value: totalMaintenance,
      label: 'Maintenance',
      lowColor: '#D8B4FE',
      highColor: '#9333EA',
    },
  ];

  /*
   * Largest current value is the reference
   * for all Fleet Overview rings.
   */
  const fleetMaxValue = Math.max(
    ...fleetSummary.map(item => item.value),
    1,
  );

  /*
   * Convert value to circular progress.
   */
  const getProgress = (value: number) => {
    if (value <= 0) {
      return 0;
    }

    return Math.min(
      value / fleetMaxValue,
      1,
    );
  };

  /*
   * HEX → RGB
   */
  const hexToRgb = (hex: string) => {
    const cleanHex = hex.replace('#', '');

    return {
      r: parseInt(
        cleanHex.substring(0, 2),
        16,
      ),
      g: parseInt(
        cleanHex.substring(2, 4),
        16,
      ),
      b: parseInt(
        cleanHex.substring(4, 6),
        16,
      ),
    };
  };

  /*
   * RGB → HEX
   */
  const rgbToHex = (
    r: number,
    g: number,
    b: number,
  ) => {
    const toHex = (value: number) =>
      Math.round(value)
        .toString(16)
        .padStart(2, '0');

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  /*
   * Dynamic color based on progress.
   */
  const getProgressColor = (
    progress: number,
    lowColor: string,
    highColor: string,
  ) => {
    const start = hexToRgb(lowColor);
    const end = hexToRgb(highColor);

    const r =
      start.r +
      (end.r - start.r) * progress;

    const g =
      start.g +
      (end.g - start.g) * progress;

    const b =
      start.b +
      (end.b - start.b) * progress;

    return rgbToHex(r, g, b);
  };

  /*
   * Fleet Circular Graph
   */
  const FleetRing = ({
    value,
    lowColor,
    highColor,
  }: {
    value: number;
    lowColor: string;
    highColor: string;
  }) => {
    const progress = getProgress(value);

    const strokeColor =
      progress === 0
        ? '#CBD5E1'
        : getProgressColor(
            progress,
            lowColor,
            highColor,
          );

    const strokeDashoffset =
      RING_CIRCUMFERENCE *
      (1 - progress);

    return (
      <View style={styles.ringContainer}>
        <Svg
          width={RING_SIZE}
          height={RING_SIZE}
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>

          {/* Background Ring */}
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke="#E2E8F0"
            strokeWidth={
              RING_STROKE_WIDTH
            }
            fill="none"
          />

          {/* Progress Ring */}
          {progress > 0 && (
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              stroke={strokeColor}
              strokeWidth={
                RING_STROKE_WIDTH
              }
              strokeLinecap="round"
              strokeDasharray={`${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
              strokeDashoffset={
                strokeDashoffset
              }
              fill="none"
              rotation="-90"
              origin={`${RING_SIZE / 2}, ${
                RING_SIZE / 2
              }`}
            />
          )}
        </Svg>

        {/* Number in Center */}
        <View
          style={styles.ringCenter}>
          <Text
            style={[
              styles.statValue,
              {
                color:
                  progress === 0
                    ? '#94A3B8'
                    : strokeColor,
              },
            ]}>
            {value}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View pointerEvents="none" style={styles.auroraLayer}>
        <View style={styles.auroraBlue} />
        <View style={styles.auroraViolet} />
        <View style={styles.auroraCyan} />
      </View>

      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.brand}>
                Fleet<Text style={styles.flowTitle}>Flow</Text>
            </Text>

            <Text style={styles.welcome}>
              Welcome back
              {user?.email
                ? `, ${user.email}`
                : ''}
            </Text>
          </View>

          {/* PROFILE AREA */}
          <View style={styles.profileContainer}>

            {/* PROFILE BUTTON */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open profile menu"
              accessibilityState={{
                expanded:
                  profileMenuVisible,
              }}
              onPress={() =>
                setProfileMenuVisible(
                  current => !current,
                )
              }
              style={({pressed}) => [
                styles.profileBadge,
                pressed &&
                  styles.profileBadgePressed,
              ]}>
              <Text
                style={
                  styles.profileInitial
                }>
                {user?.email
                  ?.charAt(0)
                  .toUpperCase() || 'U'}
              </Text>
            </Pressable>

            {/* PROFILE MENU */}
            {profileMenuVisible && (
              <View
                style={
                  styles.profileMenu
                }>

                <View
                  style={
                    styles.profileMenuHeader
                  }>
                  <View
                    style={
                      styles.profileMenuAvatar
                    }>
                    <Text
                      style={
                        styles.profileMenuInitial
                      }>
                      {user?.email
                        ?.charAt(0)
                        .toUpperCase() ||
                        'U'}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.profileMenuInfo
                    }>
                    <Text
                      style={
                        styles.profileMenuTitle
                      }>
                      FleetFlow User
                    </Text>

                    <Text
                      numberOfLines={1}
                      style={
                        styles.profileMenuEmail
                      }>
                      {user?.email ||
                        'FleetFlow User'}
                    </Text>
                  </View>
                </View>

                <View
                  style={
                    styles.profileMenuDivider
                  }
                />

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Logout"
                  onPress={handleLogout}
                  style={({pressed}) => [
                    styles.logoutButton,
                    pressed &&
                      styles.logoutButtonPressed,
                  ]}>

                  <View
                    style={
                      styles.logoutIcon
                    }>
                    <Text
                      style={
                        styles.logoutIconText
                      }>
                      ↪
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.logoutText
                    }>
                    Logout
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* USER INFORMATION */}
        <Card>
          <Text style={styles.cardLabel}>
            Signed in as
          </Text>

          <Text style={styles.email}>
            {user?.email ||
              'FleetFlow User'}
          </Text>
        </Card>

        {/* FLEET OVERVIEW */}
        <Text style={styles.sectionTitle}>
          Fleet Overview
        </Text>

        <View style={styles.statsGrid}>
          {fleetSummary.map(item => (
            <View
              key={item.label}
              style={styles.statWrapper}>
              <Card>
                <View
                  style={
                    styles.statCardContent
                  }>

                  <FleetRing
                    value={item.value}
                    lowColor={
                      item.lowColor
                    }
                    highColor={
                      item.highColor
                    }
                  />

                  <Text
                    style={
                      styles.statLabel
                    }>
                    {item.label}
                  </Text>
                </View>
              </Card>
            </View>
          ))}
        </View>

        {/* TRIP OVERVIEW */}
        <Text style={styles.sectionTitle}>
          Trip Overview
        </Text>

        <Card>
          <View style={styles.overviewRow}>
            <View
              style={styles.overviewItem}>
              <Text
                style={
                  styles.overviewValue
                }>
                {scheduledTrips}
              </Text>

              <Text
                style={
                  styles.overviewLabel
                }>
                Scheduled
              </Text>
            </View>

            <View
              style={styles.overviewItem}>
              <Text
                style={
                  styles.overviewValue
                }>
                {inProgressTrips}
              </Text>

              <Text
                style={
                  styles.overviewLabel
                }>
                In Progress
              </Text>
            </View>

            <View
              style={styles.overviewItem}>
              <Text
                style={
                  styles.overviewValue
                }>
                {completedTrips}
              </Text>

              <Text
                style={
                  styles.overviewLabel
                }>
                Completed
              </Text>
            </View>
          </View>
        </Card>

        {/* DRIVER OVERVIEW */}
        <Text style={styles.sectionTitle}>
          Driver Overview
        </Text>

        <Card>
          <View style={styles.overviewRow}>
            <View
              style={styles.overviewItem}>
              <Text
                style={
                  styles.overviewValue
                }>
                {activeDrivers}
              </Text>

              <Text
                style={
                  styles.overviewLabel
                }>
                Active
              </Text>
            </View>

            <View
              style={styles.overviewItem}>
              <Text
                style={
                  styles.overviewValue
                }>
                {inactiveDrivers}
              </Text>

              <Text
                style={
                  styles.overviewLabel
                }>
                Inactive
              </Text>
            </View>

            <View
              style={styles.overviewItem}>
              <Text
                style={
                  styles.overviewValue
                }>
                {driversOnLeave}
              </Text>

              <Text
                style={
                  styles.overviewLabel
                }>
                On Leave
              </Text>
            </View>
          </View>
        </Card>

        {/* MAINTENANCE OVERVIEW */}
        <Text style={styles.sectionTitle}>
          Maintenance Overview
        </Text>

        <Card>
          <View style={styles.overviewRow}>
            <View
              style={styles.overviewItem}>
              <Text
                style={
                  styles.overviewValue
                }>
                {scheduledMaintenance}
              </Text>

              <Text
                style={
                  styles.overviewLabel
                }>
                Scheduled
              </Text>
            </View>

            <View
              style={styles.overviewItem}>
              <Text
                style={
                  styles.overviewValue
                }>
                {inProgressMaintenance}
              </Text>

              <Text
                style={
                  styles.overviewLabel
                }>
                In Progress
              </Text>
            </View>

            <View
              style={styles.overviewItem}>
              <Text
                style={
                  styles.overviewValue
                }>
                {completedMaintenance}
              </Text>

              <Text
                style={
                  styles.overviewLabel
                }>
                Completed
              </Text>
            </View>
          </View>
        </Card>

        {/* QUICK ACTIONS */}
        <Text style={styles.sectionTitle}>
          Quick Actions
        </Text>

        {/* VEHICLES */}
        <Card>
          <Text style={styles.actionTitle}>
            Vehicles
          </Text>

          <Text
            style={
              styles.actionDescription
            }>
            View and manage your fleet
            vehicles.
          </Text>

          <View
            style={styles.actionButton}>
            <Button
              title="Open Vehicles"
              onPress={() =>
                navigation.navigate(
                  'Vehicles',
                )
              }
            />
          </View>
        </Card>

        {/* DRIVERS */}
        <Card>
          <Text style={styles.actionTitle}>
            Drivers
          </Text>

          <Text
            style={
              styles.actionDescription
            }>
            View and manage your fleet
            drivers.
          </Text>

          <View
            style={styles.actionButton}>
            <Button
              title="Open Drivers"
              onPress={() =>
                navigation.navigate(
                  'Drivers',
                )
              }
            />
          </View>
        </Card>

        {/* TRIPS */}
        <Card>
          <Text style={styles.actionTitle}>
            Trips
          </Text>

          <Text
            style={
              styles.actionDescription
            }>
            View and manage fleet trips
            and assignments.
          </Text>

          <View
            style={styles.actionButton}>
            <Button
              title="Open Trips"
              onPress={() =>
                navigation.navigate(
                  'Trips',
                )
              }
            />
          </View>
        </Card>

        {/* MAINTENANCE */}
        <Card>
          <Text style={styles.actionTitle}>
            Maintenance
          </Text>

          <Text
            style={
              styles.actionDescription
            }>
            Track vehicle maintenance
            and service activity.
          </Text>

          <View
            style={styles.actionButton}>
            <Button
              title="Open Maintenance"
              onPress={() =>
                navigation.navigate(
                  'Maintenance',
                )
              }
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  auroraLayer: {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  overflow: 'hidden',
  backgroundColor: '#F7F9FC',
  },

  auroraBlue: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    top: -110,
    right: -95,
    backgroundColor: 'rgba(96, 165, 250, 0.16)',
    transform: [
      {scaleX: 1.25},
      {scaleY: 0.82},
    ],
  },

  auroraViolet: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: 260,
    left: -170,
    backgroundColor: 'rgba(167, 139, 250, 0.12)',
    transform: [
      {scaleX: 1.15},
      {scaleY: 0.85},
    ],
  },

  auroraCyan: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    bottom: -80,
    right: -130,
    backgroundColor: 'rgba(34, 211, 238, 0.10)',
    transform: [
      {scaleX: 1.2},
      {scaleY: 0.8},
    ],
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    position: 'relative',
    zIndex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  headerText: {
    flex: 1,
  },

  brand: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2563EB',
  },

  flowTitle: {
  fontFamily: 'BerkshireSwash-Regular',
  fontSize: 28,
  fontWeight: '400',
   },

  welcome: {
    marginTop: 4,
    fontSize: 15,
    color: '#64748B',
  },

  /*
   * Profile Container
   */
  profileContainer: {
    position: 'relative',
    zIndex: 100,
  },

  /*
   * Profile Button
   */
  profileBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0E7FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',

    shadowColor: '#4F46E5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 3,
  },

  profileBadgePressed: {
    backgroundColor: '#C7D2FE',

    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  profileInitial: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4F46E5',
  },

  /*
   * Profile Menu
   */
  profileMenu: {
    position: 'absolute',

    top: 54,
    right: 0,

    width: 270,

    backgroundColor:
      'rgba(255, 255, 255, 0.97)',

    borderRadius: 18,

    borderWidth: 1,
    borderColor:
      'rgba(148, 163, 184, 0.24)',

    padding: 12,

    shadowColor: '#334155',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.16,
    shadowRadius: 24,

    elevation: 8,

    zIndex: 200,
  },

  profileMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
  },

  profileMenuAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0E7FF',
  },

  profileMenuInitial: {
    fontSize: 17,
    fontWeight: '800',
    color: '#4F46E5',
  },

  profileMenuInfo: {
    flex: 1,
    marginLeft: 11,
  },

  profileMenuTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#172033',
  },

  profileMenuEmail: {
    marginTop: 3,
    fontSize: 12,
    color: '#64748B',
  },

  profileMenuDivider: {
    height: 1,
    marginVertical: 9,
    backgroundColor: '#E2E8F0',
  },

  /*
   * Logout
   */
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 46,
    paddingHorizontal: 8,
    borderRadius: 12,
  },

  logoutButtonPressed: {
    backgroundColor: '#FEF2F2',
  },

  logoutIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
  },

  logoutIconText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#DC2626',
  },

  logoutText: {
    marginLeft: 11,
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },

  /*
   * User Information
   */
  cardLabel: {
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },

  email: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0F172A',
  },

  /*
   * Sections
   */
  sectionTitle: {
    marginTop: 20,
    marginBottom: 12,
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },

  /*
   * Fleet Overview
   */
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },

  statWrapper: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 2,
  },

  statCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    paddingVertical: 4,
  },

  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  ringCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statValue: {
    fontSize: 21,
    fontWeight: '800',
  },

  statLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },

  /*
   * Overview
   */
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  overviewItem: {
    flex: 1,
    alignItems: 'center',
  },

  overviewValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2563EB',
  },

  overviewLabel: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },

  /*
   * Quick Actions
   */
  actionTitle: {
    marginBottom: 8,
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },

  actionDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: '#64748B',
  },

  actionButton: {
    marginTop: 16,
  },
});

export default DashboardScreen;