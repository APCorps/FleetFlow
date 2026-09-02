import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Animated,
  Easing,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  useNavigation,
} from '@react-navigation/native';

import {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import FloatingBottomNav, {
  BottomNavRoute,
} from '../FloatingBottomNav/FloatingBottomNav';

import {
  RootStackParamList,
} from '../../navigation/AppNavigator';

import DashboardScreen from '../../screens/dashboard/DashboardScreen';
import VehiclesScreen from '../../screens/vehicles/VehiclesScreen';
import DriversScreen from '../../screens/drivers/DriversScreen';
import TripsScreen from '../../screens/trips/TripsScreen';
import AccountsScreen from '../../screens/accounts/AccountsScreen';

type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;

const TAB_ROUTES: BottomNavRoute[] = [
  'Dashboard',
  'Vehicles',
  'Drivers',
  'Trips',
  'Accounts',
];

const MainScreenLayout = () => {
  const {
    width,
  } = useWindowDimensions();

  const navigation =
    useNavigation<NavigationProp>();

  const [
    activeRoute,
    setActiveRoute,
  ] = useState<BottomNavRoute>(
    'Dashboard',
  );

  const activeIndex = Math.max(
    TAB_ROUTES.indexOf(activeRoute),
    0,
  );

  const contentTranslateX =
    useRef(
      new Animated.Value(0),
    ).current;

  useEffect(() => {
    Animated.timing(
      contentTranslateX,
      {
        toValue:
          -activeIndex * width,

        duration: 320,

        easing:
          Easing.out(
            Easing.cubic,
          ),

        useNativeDriver: true,
      },
    ).start();
  }, [
    activeIndex,
    width,
    contentTranslateX,
  ]);

  const handleNavigate = (
    route: BottomNavRoute,
  ) => {
    if (
      route === activeRoute
    ) {
      return;
    }

    setActiveRoute(route);
  };

  return (
    <View
      style={styles.container}>

      {/*
       * ─────────────────────────────
       * CONTENT VIEWPORT
       * ─────────────────────────────
       *
       * Only this area clips and
       * animates horizontally.
       *
       * The bottom navigation is NOT
       * inside this view.
       */}

      <View
        style={styles.contentViewport}>

        <Animated.View
          style={[
            styles.contentTrack,
            {
              width:
                width *
                TAB_ROUTES.length,

              transform: [
                {
                  translateX:
                    contentTranslateX,
                },
              ],
            },
          ]}>

          {/* DASHBOARD */}

          <View
            style={[
              styles.page,
              {
                width,
              },
            ]}>

            <DashboardScreen />

          </View>

          {/* VEHICLES */}

          <View
            style={[
              styles.page,
              {
                width,
              },
            ]}>

            <VehiclesScreen />

          </View>

          {/* DRIVERS */}

          <View
            style={[
              styles.page,
              {
                width,
              },
            ]}>

            <DriversScreen />

          </View>

          {/* TRIPS */}

          <View
            style={[
              styles.page,
              {
                width,
              },
            ]}>

            <TripsScreen />

          </View>

          {/* ACCOUNTS */}

          <View
            style={[
              styles.page,
              {
                width,
              },
            ]}>

            <AccountsScreen />

          </View>

        </Animated.View>

      </View>

      {/*
       * ─────────────────────────────
       * FIXED BOTTOM NAVIGATION
       * ─────────────────────────────
       *
       * IMPORTANT:
       *
       * This is a sibling of the
       * Animated.View above.
       *
       * It does NOT receive the
       * content track transform.
       *
       * Therefore the entire nav
       * remains pixel-stable while
       * pages slide underneath it.
       */}

      <FloatingBottomNav
        activeRoute={activeRoute}
        onNavigate={handleNavigate}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      '#020817',
  },

  contentViewport: {
    flex: 1,
    overflow: 'hidden',
  },

  contentTrack: {
    flex: 1,
    flexDirection: 'row',
  },

  page: {
    flex: 1,
  },
});

export default MainScreenLayout;