import React, {useState} from 'react';

import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {useNavigation} from '@react-navigation/native';

import type {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import MaterialDesignIcons from
  '@react-native-vector-icons/material-design-icons';

import {
  FloatingBottomNav,
} from '../../components';

import {
  useAccounts,
  useAuth,
  useDrivers,
  useMaintenance,
  useTrips,
  useVehicles,
} from '../../store';

import type {
  RootStackParamList,
} from '../../navigation/AppNavigator';

/*
 * ─────────────────────────────────────
 * NAVIGATION
 * ─────────────────────────────────────
 */

type DashboardNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;

/*
 * ─────────────────────────────────────
 * ICON TYPE
 * ─────────────────────────────────────
 */

type DashboardIconName =
  React.ComponentProps<
    typeof MaterialDesignIcons
  >['name'];

/*
 * ─────────────────────────────────────
 * FLEET CATEGORY COLORS
 * ─────────────────────────────────────
 */

const FLEET_COLORS = {
  vehicles: '#1688FF',
  drivers: '#00D6C9',
  trips: '#9B5CFF',
  maintenance: '#FF9F1C',
} as const;

/*
 * ─────────────────────────────────────
 * STATUS COLORS
 * ─────────────────────────────────────
 *
 * Blue  = informational
 * Amber = warning
 * Red   = urgent
 */

const STATUS_COLORS = {
  info: '#60A5FA',
  warning: '#FBBF24',
  urgent: '#FF5A70',
} as const;

/*
 * ─────────────────────────────────────
 * FINANCIAL COLORS
 * ─────────────────────────────────────
 */

const FINANCIAL_COLORS = {
  profit: '#00D6A3',
  loss: '#FF4D6D',
} as const;

/*
 * ─────────────────────────────────────
 * FLEET STAT CARD
 * ─────────────────────────────────────
 */

const StatCard = ({
  icon,
  color,
  title,
  value,
  subtitle,
  subtitleColor,
}: {
  icon: DashboardIconName;
  color: string;
  title: string;
  value: number;
  subtitle: string;
  subtitleColor: string;
}) => {
  return (
    <View style={styles.statCard}>

      <View style={styles.statCardInner}>

        {/* ICON */}

        <View
          style={[
            styles.statIcon,
            {
              backgroundColor:
                `${color}18`,
              borderColor:
                `${color}28`,
            },
          ]}>

          <MaterialDesignIcons
            name={icon}
            size={21}
            color={color}
          />

        </View>

        {/* TITLE */}

        <Text
          style={styles.statTitle}
          numberOfLines={1}>
          {title}
        </Text>

        {/* VALUE + STATUS */}

        <View
          style={styles.statBottomRow}>

          <Text
            style={styles.statValue}>
            {value}
          </Text>

          <View
            style={styles.statStatusRow}>

            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    subtitleColor,
                },
              ]}
            />

            <Text
              style={[
                styles.statSubtitle,
                {
                  color:
                    subtitleColor,
                },
              ]}>
              {subtitle}
            </Text>

          </View>

        </View>

      </View>

    </View>
  );
};

/*
 * ─────────────────────────────────────
 * OPERATIONAL ACTIVITY ROW
 * ─────────────────────────────────────
 */

const ActivityRow = ({
  icon,
  color,
  title,
  subtitle,
  value,
  valueColor,
}: {
  icon: DashboardIconName;
  color: string;
  title: string;
  subtitle: string;
  value: number;
  valueColor: string;
}) => {
  return (
    <Pressable
      accessibilityRole="button"
      style={({pressed}) => [
        styles.activityRow,
        pressed &&
          styles.activityPressed,
      ]}>

      <View
        style={[
          styles.activityIcon,
          {
            backgroundColor:
              `${color}20`,
          },
        ]}>

        <MaterialDesignIcons
          name={icon}
          size={20}
          color={color}
        />

      </View>

      <View
        style={styles.activityText}>

        <Text
          style={styles.activityTitle}>
          {title}
        </Text>

        <Text
          style={styles.activitySubtitle}>
          {subtitle}
        </Text>

      </View>

      <Text
        style={[
          styles.activityValue,
          {
            color:
              valueColor,
          },
        ]}>
        {value}
      </Text>

      <MaterialDesignIcons
        name="chevron-right"
        size={22}
        color="#94A3B8"
      />

    </Pressable>
  );
};

/*
 * ─────────────────────────────────────
 * DASHBOARD
 * ─────────────────────────────────────
 */

const DashboardScreen = () => {

  /*
   * ALL HOOKS AT THE TOP
   */

  const navigation =
    useNavigation<DashboardNavigationProp>();

  const {
    user,
    logout,
  } = useAuth();

  const {
    vehicles,
  } = useVehicles();

  const {
    drivers,
  } = useDrivers();

  const {
    trips,
  } = useTrips();

  const {
    maintenanceRecords,
  } = useMaintenance();

  const {
    totalIncome,
    totalExpenses,
    netProfitLoss,
  } = useAccounts();

  const [
    profileMenuVisible,
    setProfileMenuVisible,
  ] = useState(false);

  /*
   * ─────────────────────────────────────
   * TIME OF DAY
   * ─────────────────────────────────────
   */

  const currentHour =
    new Date().getHours();

  const greeting =
    currentHour < 12
      ? 'Good morning'
      : currentHour < 17
      ? 'Good afternoon'
      : 'Good evening';

  /*
   * ─────────────────────────────────────
   * FLEET DATA
   * ─────────────────────────────────────
   */

  const totalVehicles =
    vehicles.length;

  const activeVehicles =
    vehicles.filter(
      vehicle =>
        vehicle.status === 'Active',
    ).length;

  const totalDrivers =
    drivers.length;

  const activeDrivers =
    drivers.filter(
      driver =>
        driver.status === 'Active',
    ).length;

  const totalTrips =
    trips.length;

  const inProgressTrips =
    trips.filter(
      trip =>
        trip.status === 'In Progress',
    ).length;

  const completedTrips =
    trips.filter(
      trip =>
        trip.status === 'Completed',
    ).length;

  const maintenanceVehicles =
    vehicles.filter(
      vehicle =>
        vehicle.status === 'Maintenance',
    ).length;

  const upcomingMaintenance =
    maintenanceRecords.filter(
      record =>
        record.status === 'Scheduled' ||
        record.status === 'In Progress',
    ).length;

  const highPriorityAlerts =
    maintenanceRecords.filter(
      record =>
        record.priority === 'High',
    ).length;

  /*
   * ─────────────────────────────────────
   * FINANCIAL DATA
   * ─────────────────────────────────────
   */

  const isProfit =
    netProfitLoss >= 0;

  const financialColor =
    isProfit
      ? FINANCIAL_COLORS.profit
      : FINANCIAL_COLORS.loss;

  const formatCurrency = (
    amount: number,
  ) => {
    return `₹${Math.abs(
      amount,
    ).toLocaleString(
      'en-IN',
    )}`;
  };

  /*
   * ─────────────────────────────────────
   * LOGOUT
   * ─────────────────────────────────────
   */

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
   * ─────────────────────────────────────
   * RENDER
   * ─────────────────────────────────────
   */

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom']}>

      {/* BACKGROUND */}

      <View
        pointerEvents="none"
        style={styles.background}>

        <View
          style={styles.blueGlow}
        />

        <View
          style={styles.violetGlow}
        />

        <View
          style={styles.cyanGlow}
        />

      </View>

      {/* DASHBOARD */}

      <View style={styles.screen}>

        {/* HEADER */}

        <View
          style={styles.header}>

          <View
            style={styles.brandBlock}>

            <Text
              style={styles.brand}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}>

              Fleet
              <Text
                style={
                  styles.brandAccent
                }>
                Flow
              </Text>

            </Text>

            <Text
              style={styles.brandCaption}>
              — FLEET OPERATIONS —
            </Text>

          </View>

          {/* PROFILE */}

          <View
            style={
              styles.profileContainer
            }>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open profile menu"
              accessibilityState={{
                expanded:
                  profileMenuVisible,
              }}
              hitSlop={8}
              onPress={() =>
                setProfileMenuVisible(true)
              }
              style={({pressed}) => [
                styles.profileButton,
                pressed &&
                  styles.profilePressed,
              ]}>

              <Text
                style={
                  styles.profileInitial
                }>
                {user?.email
                  ?.charAt(0)
                  .toUpperCase() ||
                  'P'}
              </Text>

              <View
                style={styles.onlineDot}
              />

            </Pressable>

          </View>

        </View>

        {/* GREETING */}

        <View
          style={styles.greetingBlock}>

          <Text
            style={styles.greeting}>
            {greeting} 👋
          </Text>

          <Text
            style={
              styles.greetingSubtitle
            }>
            Here's what's happening
            with your fleet today.
          </Text>

        </View>

        {/* FLEET OVERVIEW */}

        <View
          style={
            styles.sectionHeadingBlock
          }>

          <Text
            style={styles.sectionTitle}>
            FLEET OVERVIEW
          </Text>

          <Text
            style={
              styles.sectionSubtitle
            }>
            Monitor your fleet's
            current operational status
          </Text>

        </View>

        {/* 2 × 2 CARD GRID */}

        <View
          style={styles.statsGrid}>

          <StatCard
            icon="truck-outline"
            color={
              FLEET_COLORS.vehicles
            }
            title="Total Vehicles"
            value={totalVehicles}
            subtitle={`${activeVehicles} Active`}
            subtitleColor={
              STATUS_COLORS.info
            }
          />

          <StatCard
            icon="account-group-outline"
            color={
              FLEET_COLORS.drivers
            }
            title="Total Drivers"
            value={totalDrivers}
            subtitle={`${activeDrivers} Active`}
            subtitleColor={
              STATUS_COLORS.info
            }
          />

          <StatCard
            icon="source-branch"
            color={
              FLEET_COLORS.trips
            }
            title="Total Trips"
            value={totalTrips}
            subtitle={`${inProgressTrips} In Progress`}
            subtitleColor={
              STATUS_COLORS.info
            }
          />

          <StatCard
            icon="wrench-outline"
            color={
              FLEET_COLORS.maintenance
            }
            title="Maintenance"
            value={
              maintenanceVehicles
            }
            subtitle={`${upcomingMaintenance} Upcoming`}
            subtitleColor={
              STATUS_COLORS.warning
            }
          />

        </View>

        {/* FINANCIAL PERFORMANCE */}

        <View
          style={
            styles.sectionHeadingRow
          }>

          <View
            style={
              styles.sectionHeadingBlock
            }>

            <Text
              style={
                styles.sectionTitle
              }>
              FINANCIAL PERFORMANCE
            </Text>

          </View>

          <MaterialDesignIcons
            name="information-outline"
            size={17}
            color="#94A3B8"
            style={
              styles.infoIcon
            }
          />

        </View>

        <View
          style={styles.financeCard}>

          {/* PROFIT / LOSS GRAPHIC */}

          <View
            style={
              styles.financeCircleArea
            }>

            <View
              style={[
                styles.financeCircleOuter,
                {
                  borderColor:
                    `${financialColor}35`,
                },
              ]}>

              <View
                style={[
                  styles.financeCircleInner,
                  {
                    borderColor:
                      financialColor,
                  },
                ]}>

                <MaterialDesignIcons
                  name={
                    isProfit
                      ? 'trending-up'
                      : 'trending-down'
                  }
                  size={23}
                  color={
                    financialColor
                  }
                />

                <Text
                  style={[
                    styles.financeAmount,
                    {
                      color:
                        financialColor,
                    },
                  ]}>

                  {isProfit
                    ? '+'
                    : '-'}
                  {formatCurrency(
                    netProfitLoss,
                  )}

                </Text>

                <Text
                  style={
                    styles.financeProfitLabel
                  }>
                  {isProfit
                    ? 'PROFIT'
                    : 'LOSS'}
                </Text>

              </View>

            </View>

          </View>

          {/* FINANCIAL DETAILS */}

          <View
            style={
              styles.financeDetails
            }>

            <View
              style={styles.financeRow}>

              <View
                style={
                  styles.financeRowLeft
                }>

                <View
                  style={[
                    styles.financeIcon,
                    {
                      backgroundColor:
                        `${FINANCIAL_COLORS.profit}18`,
                    },
                  ]}>

                  <MaterialDesignIcons
                    name="trending-up"
                    size={17}
                    color={
                      FINANCIAL_COLORS.profit
                    }
                  />

                </View>

                <Text
                  style={
                    styles.financeLabel
                  }>
                  Total Revenue
                </Text>

              </View>

              <Text
                style={
                  styles.financeValue
                }>
                {formatCurrency(
                  totalIncome,
                )}
              </Text>

            </View>

            <View
              style={
                styles.financeDivider
              }
            />

            <View
              style={
                styles.financeRow
              }>

              <View
                style={
                  styles.financeRowLeft
                }>

                <View
                  style={[
                    styles.financeIcon,
                    {
                      backgroundColor:
                        `${FINANCIAL_COLORS.loss}18`,
                    },
                  ]}>

                  <MaterialDesignIcons
                    name="trending-down"
                    size={17}
                    color={
                      FINANCIAL_COLORS.loss
                    }
                  />

                </View>

                <Text
                  style={
                    styles.financeLabel
                  }>
                  Total Expenses
                </Text>

              </View>

              <Text
                style={
                  styles.financeValue
                }>
                {formatCurrency(
                  totalExpenses,
                )}
              </Text>

            </View>

            <View
              style={
                styles.financeDivider
              }
            />

            <View
              style={
                styles.financeRow
              }>

              <View
                style={
                  styles.financeRowLeft
                }>

                <View
                  style={[
                    styles.financeIcon,
                    {
                      backgroundColor:
                        `${financialColor}18`,
                    },
                  ]}>

                  <MaterialDesignIcons
                    name="wallet-outline"
                    size={17}
                    color={
                      financialColor
                    }
                  />

                </View>

                <Text
                  style={
                    styles.financeLabel
                  }>
                  Net {isProfit
                    ? 'Profit'
                    : 'Loss'}
                </Text>

              </View>

              <Text
                style={[
                  styles.financeValue,
                  {
                    color:
                      financialColor,
                  },
                ]}>

                {isProfit
                  ? '+'
                  : '-'}
                {formatCurrency(
                  netProfitLoss,
                )}

              </Text>

            </View>

          </View>

        </View>

        {/* OPERATIONAL ACTIVITY */}

        <View
          style={
            styles.sectionHeadingBlock
          }>

          <Text
            style={styles.sectionTitle}>
            OPERATIONAL ACTIVITY
          </Text>

          <Text
            style={
              styles.sectionSubtitle
            }>
            Recent activity and items
            requiring attention
          </Text>

        </View>

        <View
          style={styles.activityCard}>

          <ActivityRow
            icon="truck-check-outline"
            color={
              FLEET_COLORS.vehicles
            }
            title="Recent Trips"
            subtitle={`${completedTrips} trips completed`}
            value={completedTrips}
            valueColor={
              STATUS_COLORS.info
            }
          />

          <View
            style={
              styles.activityDivider
            }
          />

          <ActivityRow
            icon="wrench-outline"
            color={
              FLEET_COLORS.maintenance
            }
            title="Upcoming Maintenance"
            subtitle={`${upcomingMaintenance} vehicles require attention`}
            value={
              upcomingMaintenance
            }
            valueColor={
              STATUS_COLORS.warning
            }
          />

          <View
            style={
              styles.activityDivider
            }
          />

          <ActivityRow
            icon="bell-outline"
            color={
              STATUS_COLORS.urgent
            }
            title="Alerts"
            subtitle="High-priority maintenance"
            value={
              highPriorityAlerts
            }
            valueColor={
              STATUS_COLORS.urgent
            }
          />

        </View>

      </View>

      {/* PROFILE MODAL */}

      <Modal
        visible={profileMenuVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() =>
          setProfileMenuVisible(false)
        }>

        <View
          style={
            styles.profileModalContainer
          }>

          <Pressable
            style={
              styles.profileModalBackdrop
            }
            onPress={() =>
              setProfileMenuVisible(false)
            }
          />

          <View
            style={
              styles.profileModalMenu
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
                    'P'}
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
                styles.profileDivider
              }
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Logout"
              hitSlop={6}
              onPress={
                handleLogout
              }
              style={({pressed}) => [
                styles.logoutButton,
                pressed &&
                  styles.logoutPressed,
              ]}>

              <View
                style={
                  styles.logoutIcon
                }>

                <MaterialDesignIcons
                  name="logout"
                  size={18}
                  color={
                    FINANCIAL_COLORS.loss
                  }
                />

              </View>

              <Text
                style={
                  styles.logoutText
                }>
                Logout
              </Text>

            </Pressable>

          </View>

        </View>

      </Modal>

     

    </SafeAreaView>
  );
};

/*
 * ─────────────────────────────────────
 * STYLES
 * ─────────────────────────────────────
 */

const styles = StyleSheet.create({

  /*
   * ROOT
   */

  safeArea: {
    flex: 1,

    backgroundColor:
      '#020817',
  },

  screen: {
    flex: 1,

    paddingHorizontal: 22,

    paddingTop: 8,

    paddingBottom: 100,
  },

  /*
   * BACKGROUND
   */

  background: {
    position: 'absolute',

    top: 0,
    right: 0,
    bottom: 0,
    left: 0,

    overflow: 'hidden',

    backgroundColor:
      '#020817',
  },

  blueGlow: {
    position: 'absolute',

    width: 300,
    height: 300,

    borderRadius: 150,

    top: -170,
    right: -130,

    backgroundColor:
      'rgba(37, 99, 235, 0.13)',
  },

  violetGlow: {
    position: 'absolute',

    width: 270,
    height: 270,

    borderRadius: 135,

    top: 250,
    left: -180,

    backgroundColor:
      'rgba(124, 58, 237, 0.08)',
  },

  cyanGlow: {
    position: 'absolute',

    width: 280,
    height: 280,

    borderRadius: 140,

    bottom: -180,
    right: -150,

    backgroundColor:
      'rgba(8, 145, 178, 0.08)',
  },

  /*
   * HEADER
   */

  header: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'space-between',

    minHeight: 47,
  },

  brandBlock: {
    flex: 1,

    paddingRight: 12,
  },

  brand: {
    fontSize: 25,

    lineHeight: 28,

    fontWeight: '900',

    letterSpacing: -1,

    color:
      '#F8FAFC',

    includeFontPadding: false,
  },

  brandAccent: {
    color:
      '#1688FF',
  },

  brandCaption: {
    marginTop: 2,

    fontSize: 7,

    lineHeight: 9,

    fontWeight: '700',

    letterSpacing: 1.9,

    color:
      '#94A3B8',
  },

  /*
   * PROFILE
   */

  profileContainer: {
    position: 'relative',

    zIndex: 10,
  },

  profileButton: {
    width: 42,
    height: 42,

    borderRadius: 21,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor:
      'rgba(30, 41, 59, 0.90)',

    borderWidth: 1,

    borderColor:
      'rgba(148, 163, 184, 0.30)',
  },

  profilePressed: {
    transform: [
      {
        scale: 0.95,
      },
    ],
  },

  profileInitial: {
    fontSize: 17,

    fontWeight: '800',

    color:
      '#F8FAFC',
  },

  onlineDot: {
    position: 'absolute',

    width: 7,
    height: 7,

    borderRadius: 4,

    right: 1,
    bottom: 2,

    backgroundColor:
      '#00D6A3',

    borderWidth: 1,

    borderColor:
      '#020817',
  },

  /*
   * PROFILE MODAL
   */

  profileModalContainer: {
    flex: 1,

    position: 'relative',
  },

  profileModalBackdrop: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor:
      'rgba(0, 0, 0, 0.18)',
  },

  profileModalMenu: {
    position: 'absolute',

    top: 58,

    right: 22,

    width: 215,

    padding: 10,

    borderRadius: 16,

    backgroundColor:
      '#0B1324',

    borderWidth: 1,

    borderColor:
      'rgba(148, 163, 184, 0.22)',

    elevation: 24,

    shadowColor:
      '#000000',

    shadowOffset: {
      width: 0,
      height: 10,
    },

    shadowOpacity: 0.40,

    shadowRadius: 20,
  },

  profileMenuHeader: {
    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 4,

    paddingVertical: 4,
  },

  profileMenuAvatar: {
    width: 36,
    height: 36,

    borderRadius: 18,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor:
      'rgba(22, 136, 255, 0.15)',

    borderWidth: 1,

    borderColor:
      'rgba(22, 136, 255, 0.20)',
  },

  profileMenuInitial: {
    fontSize: 15,

    fontWeight: '800',

    color:
      '#60A5FA',
  },

  profileMenuInfo: {
    flex: 1,

    marginLeft: 9,
  },

  profileMenuTitle: {
    fontSize: 12,

    fontWeight: '800',

    color:
      '#F8FAFC',
  },

  profileMenuEmail: {
    marginTop: 2,

    fontSize: 9,

    color:
      '#A8B6C8',
  },

  profileDivider: {
    height: 1,

    marginVertical: 9,

    backgroundColor:
      'rgba(148, 163, 184, 0.12)',
  },

  logoutButton: {
    minHeight: 44,

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 5,

    borderRadius: 10,
  },

  logoutPressed: {
    backgroundColor:
      'rgba(255, 77, 109, 0.10)',
  },

  logoutIcon: {
    width: 32,
    height: 32,

    borderRadius: 10,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor:
      'rgba(255, 77, 109, 0.10)',
  },

  logoutText: {
    marginLeft: 9,

    fontSize: 12,

    fontWeight: '700',

    color:
      '#FF6B7F',
  },

  /*
   * GREETING
   */

  greetingBlock: {
    marginTop: 15,
  },

  greeting: {
    fontSize: 21,

    lineHeight: 26,

    fontWeight: '800',

    color:
      '#F8FAFC',

    includeFontPadding: false,
  },

  greetingSubtitle: {
    marginTop: 4,

    fontSize: 12,

    lineHeight: 17,

    color:
      '#B6C2D1',

    fontWeight: '500',
  },

  /*
   * SECTION HEADINGS
   */

  sectionHeadingBlock: {
    marginTop: 11,
  },

  sectionHeadingRow: {
    flexDirection: 'row',

    alignItems: 'center',

    marginTop: 1,
  },

  sectionTitle: {
    marginBottom: 2,

    fontSize: 11,

    lineHeight: 15,

    fontWeight: '800',

    letterSpacing: 0.8,

    color:
      '#A8B6C8',
  },

  sectionSubtitle: {
    fontSize: 9,

    lineHeight: 12,

    fontWeight: '500',

    color:
      '#94A3B8',
  },

  infoIcon: {
    marginTop: 8,

    marginLeft: 5,
  },

  /*
   * FLEET OVERVIEW
   * ─────────────────────────────────
   * 2 × 2 CARD GRID
   */

  statsGrid: {
    flexDirection: 'row',

    flexWrap: 'wrap',

    marginTop: 5,

    marginHorizontal: -4,
  },

  statCard: {
    width: '50%',

    paddingHorizontal: 4,

    paddingVertical: 4,
  },

  statCardInner: {
    minHeight: 104,

    paddingHorizontal: 12,

    paddingVertical: 11,

    borderRadius: 16,

    backgroundColor:
      'rgba(7, 25, 45, 0.96)',

    borderWidth: 1,

    borderColor:
      'rgba(148, 163, 184, 0.14)',

    justifyContent:
      'space-between',

    elevation: 3,

    shadowColor:
      '#000000',

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.16,

    shadowRadius: 8,
  },

  statIcon: {
    width: 36,

    height: 36,

    borderRadius: 11,

    alignItems: 'center',

    justifyContent: 'center',

    borderWidth: 1,
  },

  statTitle: {
    marginTop: 7,

    fontSize: 9,

    lineHeight: 12,

    fontWeight: '700',

    letterSpacing: 0.2,

    color:
      '#B6C2D1',
  },

  statBottomRow: {
    flexDirection: 'row',

    alignItems: 'flex-end',

    justifyContent:
      'space-between',

    marginTop: 2,
  },

  statValue: {
    fontSize: 23,

    lineHeight: 26,

    fontWeight: '900',

    color:
      '#F8FAFC',
  },

  statStatusRow: {
    flexDirection: 'row',

    alignItems: 'center',

    marginBottom: 3,

    marginLeft: 4,

    flexShrink: 1,
  },

  statusDot: {
    width: 5,

    height: 5,

    borderRadius: 3,

    marginRight: 4,
  },

  statSubtitle: {
    fontSize: 8,

    lineHeight: 11,

    fontWeight: '700',

    flexShrink: 1,
  },

  /*
   * FINANCIAL PERFORMANCE
   */

  financeCard: {
    minHeight: 137,

    flexDirection: 'row',

    marginTop: 2,

    paddingHorizontal: 11,

    paddingVertical: 9,

    borderRadius: 17,

    backgroundColor:
      'rgba(5, 24, 43, 0.96)',

    borderWidth: 1,

    borderColor:
      'rgba(59, 130, 246, 0.22)',

    elevation: 4,
  },

  financeCircleArea: {
    width: '41%',

    alignItems: 'center',

    justifyContent: 'center',
  },

  financeCircleOuter: {
    width: 91,

    height: 91,

    borderRadius: 46,

    alignItems: 'center',

    justifyContent: 'center',

    borderWidth: 5,
  },

  financeCircleInner: {
    width: 77,

    height: 77,

    borderRadius: 39,

    alignItems: 'center',

    justifyContent: 'center',

    borderWidth: 2,
  },

  financeAmount: {
    marginTop: 2,

    fontSize: 13,

    lineHeight: 17,

    fontWeight: '900',
  },

  financeProfitLabel: {
    marginTop: 1,

    fontSize: 8,

    fontWeight: '800',

    letterSpacing: 0.7,

    color:
      '#CBD5E1',
  },

  financeDetails: {
    flex: 1,

    justifyContent: 'center',

    paddingLeft: 5,
  },

  financeRow: {
    minHeight: 32,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'space-between',
  },

  financeRowLeft: {
    flex: 1,

    flexDirection: 'row',

    alignItems: 'center',
  },

  financeIcon: {
    width: 28,

    height: 28,

    borderRadius: 9,

    alignItems: 'center',

    justifyContent: 'center',
  },

  financeLabel: {
    marginLeft: 7,

    fontSize: 10,

    fontWeight: '500',

    color:
      '#CBD5E1',
  },

  financeValue: {
    fontSize: 10,

    fontWeight: '800',

    color:
      '#F8FAFC',
  },

  financeDivider: {
    height: 1,

    backgroundColor:
      'rgba(148, 163, 184, 0.12)',
  },

  /*
   * OPERATIONAL ACTIVITY
   */

  activityCard: {
    marginTop: 2,

    paddingHorizontal: 11,

    paddingVertical: 3,

    borderRadius: 17,

    backgroundColor:
      'rgba(5, 24, 43, 0.96)',

    borderWidth: 1,

    borderColor:
      'rgba(148, 163, 184, 0.15)',
  },

  activityRow: {
    minHeight: 46,

    flexDirection: 'row',

    alignItems: 'center',
  },

  activityPressed: {
    opacity: 0.68,
  },

  activityIcon: {
    width: 33,

    height: 33,

    borderRadius: 11,

    alignItems: 'center',

    justifyContent: 'center',
  },

  activityText: {
    flex: 1,

    marginLeft: 9,
  },

  activityTitle: {
    fontSize: 11,

    lineHeight: 14,

    fontWeight: '800',

    color:
      '#F8FAFC',
  },

  activitySubtitle: {
    marginTop: 1,

    fontSize: 9,

    lineHeight: 12,

    fontWeight: '500',

    color:
      '#A8B6C8',
  },

  activityValue: {
    marginRight: 3,

    fontSize: 17,

    lineHeight: 21,

    fontWeight: '900',
  },

  activityDivider: {
    height: 1,

    marginLeft: 42,

    backgroundColor:
      'rgba(148, 163, 184, 0.12)',
  },
});

export default DashboardScreen;