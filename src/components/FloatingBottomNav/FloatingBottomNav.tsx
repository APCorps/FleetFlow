import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  MaterialDesignIcons,
} from '@react-native-vector-icons/material-design-icons/static';

import {
  radius,
  spacing,
} from '../../theme';

export type BottomNavRoute =
  | 'Dashboard'
  | 'Vehicles'
  | 'Drivers'
  | 'Trips'
  | 'Accounts';

type FloatingBottomNavProps = {
  activeRoute: BottomNavRoute;

  onNavigate: (
    route: BottomNavRoute,
  ) => void;
};

type IconName =
  React.ComponentProps<
    typeof MaterialDesignIcons
  >['name'];

type NavItem = {
  route: BottomNavRoute;
  label: string;
  icon: IconName;
  activeColor: string;
};

const navItems: NavItem[] = [
  {
    route: 'Dashboard',
    label: 'Home',
    icon: 'view-dashboard-outline',
    activeColor: '#3B82F6',
  },

  {
    route: 'Vehicles',
    label: 'Vehicles',
    icon: 'truck-outline',
    activeColor: '#1688FF',
  },

  {
    route: 'Drivers',
    label: 'Drivers',
    icon: 'steering',
    activeColor: '#00D6C9',
  },

  {
    route: 'Trips',
    label: 'Trips',
    icon: 'map-marker-path',
    activeColor: '#9B5CFF',
  },

  {
    route: 'Accounts',
    label: 'Accounts',
    icon: 'chart-line',
    activeColor: '#00D6A3',
  },
];

const FloatingBottomNav = ({
  activeRoute,
  onNavigate,
}: FloatingBottomNavProps) => {
  const [barWidth, setBarWidth] =
    useState(0);

  const activeIndex = Math.max(
    navItems.findIndex(
      item =>
        item.route === activeRoute,
    ),
    0,
  );

  const indicatorPosition =
    useRef(
      new Animated.Value(activeIndex),
    ).current;

  const handleBarLayout = (
    event: LayoutChangeEvent,
  ) => {
    setBarWidth(
      event.nativeEvent.layout.width,
    );
  };

  useEffect(() => {
    Animated.timing(
      indicatorPosition,
      {
        toValue: activeIndex,

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
    indicatorPosition,
  ]);

  const innerWidth =
    Math.max(barWidth - 8, 0);

  const itemWidth =
    innerWidth / navItems.length;

  const indicatorTranslateX =
    indicatorPosition.interpolate({
      inputRange: [0, 1, 2, 3, 4],

      outputRange: [
        0,
        itemWidth,
        itemWidth * 2,
        itemWidth * 3,
        itemWidth * 4,
      ],
    });

  const activeColor =
    navItems[activeIndex]
      ?.activeColor ?? '#3B82F6';

  return (
    <View
      style={styles.outerContainer}
      pointerEvents="box-none">

      <View
        style={styles.navigationBar}
        onLayout={handleBarLayout}>

        {/* ─────────────────────────
            SLIDING ACTIVE BACKGROUND
           ───────────────────────── */}

        {barWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.activeIndicator,

              {
                width: itemWidth,
                transform: [
                  {
                    translateX:
                      indicatorTranslateX,
                  },
                ],

                backgroundColor:
                  `${activeColor}18`,

                borderColor:
                  `${activeColor}25`,
              },
            ]}
          />
        )}

        {/* ─────────────────────────
            NAVIGATION ITEMS
           ───────────────────────── */}

        {navItems.map(item => {
          const isActive =
            activeRoute === item.route;

          return (
            <Pressable
              key={item.route}
              accessibilityRole="button"
              accessibilityLabel={
                `Open ${item.label}`
              }
              accessibilityState={{
                selected: isActive,
              }}
              onPress={() =>
                onNavigate(item.route)
              }
              style={({pressed}) => [
                styles.navItem,

                pressed &&
                  styles.pressedNavItem,
              ]}>

              <MaterialDesignIcons
                name={item.icon}
                size={21}
                color={
                  isActive
                    ? item.activeColor
                    : '#94A3B8'
                }
              />

              <Text
                style={[
                  styles.label,

                  isActive && {
                    color:
                      item.activeColor,

                    fontWeight: '700',
                  },
                ]}>
                {item.label}
              </Text>

            </Pressable>
          );
        })}

      </View>
    </View>
  );
};

const styles = StyleSheet.create({

  /*
   * ─────────────────────────────────────
   * FLOATING POSITION
   * ─────────────────────────────────────
   */

  outerContainer: {
    position: 'absolute',

    left: spacing.xxl,
    right: spacing.xxl,

    bottom: spacing.lg,

    alignItems: 'center',
  },

  /*
   * ─────────────────────────────────────
   * NAVIGATION BAR
   * ─────────────────────────────────────
   */

  navigationBar: {
    width: '100%',

    minHeight: 68,

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: spacing.xs,

    paddingVertical: spacing.xs,

    backgroundColor:
      'rgba(8, 18, 34, 0.96)',

    borderWidth: 1,

    borderColor:
      'rgba(148, 163, 184, 0.18)',

    borderRadius: radius.xl,

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: 8,
    },

    shadowOpacity: 0.28,

    shadowRadius: 18,

    elevation: 8,

    overflow: 'hidden',
  },

  /*
   * ─────────────────────────────────────
   * SLIDING ACTIVE INDICATOR
   * ─────────────────────────────────────
   *
   * This is the ONLY thing that moves.
   */

  activeIndicator: {
    position: 'absolute',

    left: spacing.xs,

    top: spacing.xs,

    bottom: spacing.xs,

    borderWidth: 1,

    borderRadius: radius.lg,
  },

  /*
   * ─────────────────────────────────────
   * NAV ITEM
   * ─────────────────────────────────────
   */

  navItem: {
    flex: 1,

    minHeight: 54,

    alignItems: 'center',

    justifyContent: 'center',

    borderRadius: radius.lg,

    paddingHorizontal: 2,

    zIndex: 2,
  },

  /*
   * ─────────────────────────────────────
   * PRESS FEEDBACK
   * ─────────────────────────────────────
   */

  pressedNavItem: {
    opacity: 0.62,

    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  /*
   * ─────────────────────────────────────
   * LABEL
   * ─────────────────────────────────────
   */

  label: {
    color: '#94A3B8',

    fontSize: 9,

    lineHeight: 12,

    fontWeight: '500',

    marginTop: 3,
  },
});

export default FloatingBottomNav;