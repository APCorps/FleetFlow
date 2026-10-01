import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  AccessibilityInfo,
  Animated,
  Easing,
  PanResponder,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  useNavigation,
} from '@react-navigation/native';

import type {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import FloatingBottomNav, {
  BottomNavRoute,
} from '../FloatingBottomNav/FloatingBottomNav';

import type {
  RootStackParamList,
} from '../../navigation/AppNavigator';

import DashboardScreen from '../../screens/dashboard/DashboardScreen';
import VehiclesScreen from '../../screens/vehicles/VehiclesScreen';
import DriversScreen from '../../screens/drivers/DriversScreen';
import TripsScreen from '../../screens/trips/TripsScreen';
import AccountsScreen from '../../screens/accounts/AccountsScreen';
import MaintenanceScreen from '../../screens/maintenance/MaintenanceScreen';

type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;

const TAB_ROUTES: BottomNavRoute[] = [
  'Dashboard',
  'Vehicles',
  'Drivers',
  'Trips',
  'Maintenance',
  'Accounts',
];

const SWIPE_THRESHOLD = 10;
const DIRECTION_RATIO = 1.15;
const SNAP_RATIO = 0.22;
const SNAP_VELOCITY = 0.5;
const EDGE_RESISTANCE = 0.28;

const MainScreenLayout = () => {
  const {width} =
    useWindowDimensions();

  /*
   * Keep this hook in place so existing
   * fast-refresh hook ordering remains stable.
   */
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

  const animationRef = useRef({
    value: new Animated.Value(0),
    gestureStartX: 0,
    gestureActive: false,
  });

  const contentTranslateX =
    animationRef.current.value;

  useEffect(() => {
    contentTranslateX.stopAnimation();

    contentTranslateX.setValue(
      -activeIndex * width,
    );
  }, [
    activeIndex,
    width,
    contentTranslateX,
  ]);

  const animateToIndex = (
    index: number,
  ) => {
    const target =
      -index * width;

    contentTranslateX.stopAnimation();

    AccessibilityInfo
      .isReduceMotionEnabled()
      .then(reduceMotion => {
        if (reduceMotion) {
          contentTranslateX.setValue(
            target,
          );
          return;
        }

        Animated.timing(
          contentTranslateX,
          {
            toValue: target,
            duration: 300,
            easing:
              Easing.out(
                Easing.cubic,
              ),
            useNativeDriver: true,
          },
        ).start();
      })
      .catch(() => {
        Animated.timing(
          contentTranslateX,
          {
            toValue: target,
            duration: 300,
            easing:
              Easing.out(
                Easing.cubic,
              ),
            useNativeDriver: true,
          },
        ).start();
      });
  };

  const handleNavigate = (
    route: BottomNavRoute,
  ) => {
    const nextIndex = Math.max(
      TAB_ROUTES.indexOf(route),
      0,
    );

    if (
      nextIndex === activeIndex
    ) {
      return;
    }

    setActiveRoute(route);
    animateToIndex(nextIndex);
  };

  const handleDashboardNavigation = (
    route:
      | BottomNavRoute
      | 'Maintenance',
  ) => {
    /*
     * Maintenance is now a native tab in the
     * same animated page track.
     */
    handleNavigate(
      route as BottomNavRoute,
    );
  };

  const panResponder =
    PanResponder.create({
      onStartShouldSetPanResponder:
        () => false,

      onMoveShouldSetPanResponder: (
        _event,
        gestureState,
      ) => {
        const dx = Math.abs(
          gestureState.dx,
        );
        const dy = Math.abs(
          gestureState.dy,
        );

        if (
          dx < SWIPE_THRESHOLD &&
          dy < SWIPE_THRESHOLD
        ) {
          return false;
        }

        return (
          dx >
          dy * DIRECTION_RATIO
        );
      },

      onMoveShouldSetPanResponderCapture:
        (
          _event,
          gestureState,
        ) => {
          const dx = Math.abs(
            gestureState.dx,
          );
          const dy = Math.abs(
            gestureState.dy,
          );

          if (
            dx < SWIPE_THRESHOLD &&
            dy < SWIPE_THRESHOLD
          ) {
            return false;
          }

          return (
            dx >
            dy * DIRECTION_RATIO
          );
        },

      onPanResponderGrant: () => {
        animationRef.current
          .gestureActive = true;

        animationRef.current
          .gestureStartX =
          -activeIndex * width;

        contentTranslateX.stopAnimation();
      },

      onPanResponderMove: (
        _event,
        gestureState,
      ) => {
        if (
          !animationRef.current
            .gestureActive
        ) {
          return;
        }

        const firstPageX = 0;

        const lastPageX =
          -(
            TAB_ROUTES.length -
            1
          ) * width;

        let nextX =
          animationRef.current
            .gestureStartX +
          gestureState.dx;

        if (
          nextX > firstPageX
        ) {
          nextX =
            firstPageX +
            (nextX -
              firstPageX) *
              EDGE_RESISTANCE;
        }

        if (
          nextX < lastPageX
        ) {
          nextX =
            lastPageX +
            (nextX -
              lastPageX) *
              EDGE_RESISTANCE;
        }

        contentTranslateX.setValue(
          nextX,
        );
      },

      onPanResponderRelease: (
        _event,
        gestureState,
      ) => {
        if (
          !animationRef.current
            .gestureActive
        ) {
          return;
        }

        animationRef.current
          .gestureActive = false;

        const currentIndex =
          activeIndex;

        let targetIndex =
          currentIndex;

        const velocityX =
          gestureState.vx;

        if (
          Math.abs(velocityX) >=
          SNAP_VELOCITY
        ) {
          if (
            velocityX < 0 &&
            currentIndex <
              TAB_ROUTES.length -
                1
          ) {
            targetIndex =
              currentIndex + 1;
          } else if (
            velocityX > 0 &&
            currentIndex > 0
          ) {
            targetIndex =
              currentIndex - 1;
          }
        } else {
          const snapDistance =
            width * SNAP_RATIO;

          if (
            gestureState.dx <
              -snapDistance &&
            currentIndex <
              TAB_ROUTES.length -
                1
          ) {
            targetIndex =
              currentIndex + 1;
          } else if (
            gestureState.dx >
              snapDistance &&
            currentIndex > 0
          ) {
            targetIndex =
              currentIndex - 1;
          }
        }

        const nextRoute =
          TAB_ROUTES[targetIndex];

        if (
          targetIndex !==
          currentIndex
        ) {
          setActiveRoute(
            nextRoute,
          );
        }

        animateToIndex(
          targetIndex,
        );
      },

      onPanResponderTerminate:
        () => {
          animationRef.current
            .gestureActive = false;

          animateToIndex(
            activeIndex,
          );
        },

      onPanResponderTerminationRequest:
        () => false,
    });

  /*
   * Prevent an unused-navigation warning while
   * keeping the existing hook order intact.
   */
  void navigation;

  return (
    <View
      style={styles.container}>

      <View
        style={styles.contentViewport}
        {...panResponder.panHandlers}>

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

          <View
            style={[
              styles.page,
              {width},
            ]}>
            <DashboardScreen
              onNavigate={
                handleDashboardNavigation
              }
            />
          </View>

          <View
            style={[
              styles.page,
              {width},
            ]}>
            <VehiclesScreen />
          </View>

          <View
            style={[
              styles.page,
              {width},
            ]}>
            <DriversScreen />
          </View>

          <View
            style={[
              styles.page,
              {width},
            ]}>
            <TripsScreen />
          </View>

          <View
            style={[
              styles.page,
              {width},
            ]}>
            <MaintenanceScreen
              onNavigateToDashboard={() =>
                handleNavigate(
                  'Dashboard',
                )
              }
            />
          </View>

          <View
            style={[
              styles.page,
              {width},
            ]}>
            <AccountsScreen />
          </View>

        </Animated.View>
      </View>

      <FloatingBottomNav
        activeRoute={
          activeRoute
        }
        onNavigate={
          handleNavigate
        }
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      '#050711',
  },

  contentViewport: {
    flex: 1,
    overflow: 'hidden',
  },

  contentTrack: {
    flexDirection: 'row',
    height: '100%',
  },

  page: {
    height: '100%',
    minWidth: 0,
  },
});

export default MainScreenLayout;
