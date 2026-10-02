import React from 'react';

import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';

import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  MaterialDesignIcons,
} from '@react-native-vector-icons/material-design-icons/static';

import {
  colors,
  radius,
  spacing,
  typography,
} from '../../theme';

export type BottomNavRoute =
  | 'Dashboard'
  | 'Vehicles'
  | 'Drivers'
  | 'Trips'
  | 'Maintenance'
  | 'Accounts';

type IconName = React.ComponentProps<
  typeof MaterialDesignIcons
>['name'];

type NavItem = {
  route: BottomNavRoute;
  label: string;
  icon: IconName;
  color: string;
};

type FloatingBottomNavProps = {
  activeRoute: BottomNavRoute;
  onNavigate: (
    route: BottomNavRoute,
  ) => void;
};

const NAV_ITEMS: NavItem[] = [
  {
    route: 'Dashboard',
    label: 'Home',
    icon: 'view-dashboard-outline',
    color: colors.categories.dashboard,
  },
  {
    route: 'Vehicles',
    label: 'Vehicles',
    icon: 'truck-outline',
    color: colors.categories.vehicles,
  },
  {
    route: 'Drivers',
    label: 'Drivers',
    icon: 'account-group-outline',
    color: colors.categories.drivers,
  },
  {
    route: 'Trips',
    label: 'Trips',
    icon: 'source-branch',
    color: colors.categories.trips,
  },
  {
    route: 'Maintenance',
    label: 'Maintenance',
    icon: 'wrench-outline',
    color: colors.categories.maintenance,
  },
  {
    route: 'Accounts',
    label: 'Accounts',
    icon: 'wallet-outline',
    color: colors.categories.accounts,
  },
];

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(
    true,
  );
}

const FloatingBottomNav = ({
  activeRoute,
  onNavigate,
}: FloatingBottomNavProps) => {
  const insets = useSafeAreaInsets();

  const handlePress = (
    route: BottomNavRoute,
  ) => {
    if (route === activeRoute) {
      return;
    }

    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        230,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.scaleXY,
      ),
    );

    onNavigate(route);
  };

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          bottom:
            Math.max(
              insets.bottom,
              spacing.xs,
            ) + spacing.sm,
        },
      ]}>
      <View
        style={styles.navBar}>
        {NAV_ITEMS.map(item => {
          const active =
            item.route === activeRoute;

          return (
            <Pressable
              key={item.route}
              accessibilityRole="tab"
              accessibilityState={{
                selected: active,
              }}
              accessibilityLabel={
                item.label
              }
              onPress={() =>
                handlePress(
                  item.route,
                )
              }
              style={({pressed}) => [
                styles.navItem,
                active
                  ? styles.navItemActive
                  : styles.navItemInactive,
                pressed &&
                  styles.navItemPressed,
              ]}>
              <View
                style={[
                  styles.iconShell,
                  active && {
                    backgroundColor:
                      `${item.color}20`,
                    borderColor:
                      `${item.color}38`,
                  },
                ]}>
                <MaterialDesignIcons
                  name={item.icon}
                  size={active ? 18 : 20}
                  color={
                    active
                      ? item.color
                      : colors.textMuted
                  }
                />
              </View>

              {active && (
                <Text
                  numberOfLines={1}
                  style={[
                    styles.activeLabel,
                    {
                      color:
                        item.color,
                    },
                  ]}>
                  {item.label}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    alignItems: 'center',
    zIndex: 50,
  },

  navBar: {
    width: '100%',
    maxWidth: 520,
    minHeight: 58,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sheet,
    backgroundColor:
      'rgba(8, 12, 28, 0.96)',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    elevation: 12,
  },

  navItem: {
    minHeight: 48,
    marginHorizontal: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.button,
  },

  navItemActive: {
    flex: 1.9,
    minWidth: 72,
    paddingHorizontal: spacing.sm,
    backgroundColor:
      'rgba(255, 255, 255, 0.055)',
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.07)',
  },

  navItemInactive: {
    flex: 1,
    minWidth: 36,
  },

  navItemPressed: {
    opacity: 0.72,
    transform: [
      {
        scale: 0.97,
      },
    ],
  },

  iconShell: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor:
      'transparent',
  },

  activeLabel: {
    marginLeft: spacing.xs,
    maxWidth: 72,
    fontSize: 8.5,
    lineHeight: 11,
    fontWeight:
      typography.weight.bold,
    letterSpacing: 0.1,
  },
});

export default FloatingBottomNav;
