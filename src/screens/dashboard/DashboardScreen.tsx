import React, {useEffect, useRef, useState} from 'react';

import {
  AccessibilityInfo,
  Animated,
  Easing,
  GestureResponderEvent,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import MaterialDesignIcons from
  '@react-native-vector-icons/material-design-icons';

import Svg, {
  Circle,
  Path,
  Polyline,
  Rect,
} from 'react-native-svg';

import {
  useAccounts,
  useAuth,
  useDrivers,
  useMaintenance,
  useTrips,
  useVehicles,
} from '../../store';

import type {
  BottomNavRoute,
} from '../../components/FloatingBottomNav/FloatingBottomNav';

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

const FLEET_CARD_SURFACES = {
  vehicles: '#071828',
  drivers: '#06201F',
  trips: '#120A22',
  maintenance: '#211808',
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

/*
 * ─────────────────────────────────────
 * FLEET STAT CARD
 * ─────────────────────────────────────
 *
 * Each card has its own ambient motion:
 *
 * Vehicles:
 *   route path + moving vehicle dot +
 *   diagonal data streams.
 *
 * Drivers:
 *   ECG pulse + breathing ring.
 *
 * Trips:
 *   constellation particles +
 *   orbital navigation dot.
 *
 * Maintenance:
 *   kinetic border segment.
 */

type FleetCardCategory =
  | 'vehicles'
  | 'drivers'
  | 'trips'
  | 'maintenance';

const AnimatedSvgPath =
  Animated.createAnimatedComponent(Path);

const AnimatedSvgRect =
  Animated.createAnimatedComponent(Rect);

const StatCard = ({
  icon,
  color,
  title,
  value,
  subtitle,
  subtitleColor,
  cardBackground,
  category,
  onPress,
  entranceDelay,
  reduceMotion,
}: {
  icon: DashboardIconName;
  color: string;
  title: string;
  value: number;
  subtitle: string;
  subtitleColor: string;
  cardBackground: string;
  category: FleetCardCategory;
  onPress: () => void;
  entranceDelay: number;
  reduceMotion: boolean;
}) => {
  /*
   * ─────────────────────────────────────
   * ENTRANCE
   * ─────────────────────────────────────
   */

  const entranceOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const entranceTranslateY = useRef(
    new Animated.Value(18),
  ).current;

  /*
   * ─────────────────────────────────────
   * INTERACTION
   * ─────────────────────────────────────
   *
   * These values stay JS-driven for the
   * entire lifetime of the card because
   * touch-position updates use setValue().
   * React Native does not allow the same
   * Animated.Value to switch between the
   * native and JS animation drivers.
   */

  const interactionScale = useRef(
    new Animated.Value(1),
  ).current;

  const rotateX = useRef(
    new Animated.Value(0),
  ).current;

  const rotateY = useRef(
    new Animated.Value(0),
  ).current;

  const touchFrame = useRef<number | null>(
    null,
  );

  const cardSize = useRef({
    width: 1,
    height: 1,
  }).current;

  /*
   * ─────────────────────────────────────
   * CATEGORY MOTION
   * ─────────────────────────────────────
   */

  const categoryProgress = useRef(
    new Animated.Value(0),
  ).current;

  const categoryAnimation =
    useRef<Animated.CompositeAnimation | null>(
      null,
    );

  /*
   * Decorative motion opacity.
   *
   * It is subdued during a press so the
   * tactile feedback remains dominant.
   */

  const ambientOpacity = useRef(
    new Animated.Value(1),
  ).current;

  /*
   * ─────────────────────────────────────
   * ENTRANCE ANIMATION
   * ─────────────────────────────────────
   */

  useEffect(() => {
    entranceOpacity.stopAnimation();
    entranceTranslateY.stopAnimation();

    entranceOpacity.setValue(0);

    entranceTranslateY.setValue(
      reduceMotion ? 0 : 18,
    );

    const entrance =
      Animated.sequence([
        ...(reduceMotion
          ? []
          : [
              Animated.delay(
                entranceDelay,
              ),
            ]),

        Animated.parallel([
          Animated.timing(
            entranceOpacity,
            {
              toValue: 1,
              duration: reduceMotion
                ? 180
                : 260,
              easing:
                Easing.out(
                  Easing.quad,
                ),
              useNativeDriver: true,
            },
          ),

          ...(reduceMotion
            ? []
            : [
                Animated.timing(
                  entranceTranslateY,
                  {
                    toValue: 0,
                    duration: 280,
                    easing:
                      Easing.out(
                        Easing.cubic,
                      ),
                    useNativeDriver: true,
                  },
                ),
              ]),
        ]),
      ]);

    entrance.start();

    return () => {
      entrance.stop();
    };
  }, [
    entranceDelay,
    reduceMotion,
    entranceOpacity,
    entranceTranslateY,
  ]);

  /*
   * ─────────────────────────────────────
   * CATEGORY AMBIENT LOOP
   * ─────────────────────────────────────
   *
   * Uses a single JS-driven progress value.
   * This value feeds the category-specific
   * SVG dash/path motion. The native-driven
   * entrance and popup animations use their
   * own Animated.Values and never share the
   * category progress node.
   */

  useEffect(() => {
    categoryAnimation.current?.stop();

    categoryProgress.stopAnimation();
    categoryProgress.setValue(0);

    if (reduceMotion) {
      return () => {
        categoryAnimation.current?.stop();
      };
    }

    const duration =
      category === 'vehicles'
        ? 3200
        : category === 'drivers'
        ? 3000
        : category === 'trips'
        ? 3500
        : 3800;

    const loop = Animated.loop(
      Animated.timing(
        categoryProgress,
        {
          toValue: 1,
          duration,
          easing:
            Easing.inOut(Easing.sin),
          useNativeDriver: false,
        },
      ),
    );

    categoryAnimation.current = loop;
    loop.start();

    return () => {
      loop.stop();
      if (
        categoryAnimation.current === loop
      ) {
        categoryAnimation.current = null;
      }
    };
  }, [
    category,
    reduceMotion,
    categoryProgress,
    categoryAnimation,
  ]);

  /*
   * ─────────────────────────────────────
   * INTERACTION / PRESS
   * ─────────────────────────────────────
   */

  const handleTouchStart = () => {
    const animations: Animated.CompositeAnimation[] =
      [
        Animated.timing(
          interactionScale,
          {
            toValue: 0.97,
            duration: 100,
            easing:
              Easing.out(
                Easing.quad,
              ),
            useNativeDriver: false,
          },
        ),
        Animated.timing(
          ambientOpacity,
          {
            toValue:
              reduceMotion
                ? 1
                : 0.18,
            duration: 100,
            easing:
              Easing.out(
                Easing.quad,
              ),
            useNativeDriver: false,
          },
        ),
      ];

    Animated.parallel(
      animations,
    ).start();
  };

  /*
   * ─────────────────────────────────────
   * TILT
   * ─────────────────────────────────────
   */

  const handleTouchMove = (
    event: GestureResponderEvent,
  ) => {
    if (reduceMotion) {
      return;
    }

    const {
      locationX,
      locationY,
    } = event.nativeEvent;

    if (touchFrame.current !== null) {
      return;
    }

    touchFrame.current =
      requestAnimationFrame(() => {
        touchFrame.current = null;

        const normalizedX =
          cardSize.width > 1
            ? (locationX /
                cardSize.width) *
                2 -
              1
            : 0;

        const normalizedY =
          cardSize.height > 1
            ? (locationY /
                cardSize.height) *
                2 -
              1
            : 0;

        const clampedX =
          Math.max(
            -1,
            Math.min(
              1,
              normalizedX,
            ),
          );

        const clampedY =
          Math.max(
            -1,
            Math.min(
              1,
              normalizedY,
            ),
          );

        rotateY.setValue(
          clampedX * 9,
        );

        rotateX.setValue(
          clampedY * -7,
        );

        interactionScale.setValue(
          1.02,
        );
      });
  };

  const resetTilt = () => {
    if (
      touchFrame.current !==
      null
    ) {
      cancelAnimationFrame(
        touchFrame.current,
      );

      touchFrame.current = null;
    }

    if (reduceMotion) {
      rotateX.setValue(0);
      rotateY.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.spring(
        rotateX,
        {
          toValue: 0,
          damping: 16,
          stiffness: 180,
          mass: 0.7,
          useNativeDriver: false,
        },
      ),

      Animated.spring(
        rotateY,
        {
          toValue: 0,
          damping: 16,
          stiffness: 180,
          mass: 0.7,
          useNativeDriver: false,
        },
      ),
    ]).start();
  };

  const handleTouchEnd = () => {
    Animated.parallel([
      Animated.spring(
        interactionScale,
        {
          toValue: 1,
          damping: 14,
          stiffness: 220,
          mass: 0.65,
          useNativeDriver: false,
        },
      ),

      Animated.timing(
        ambientOpacity,
        {
          toValue: 1,
          duration: 180,
          easing:
            Easing.out(
              Easing.quad,
            ),
          useNativeDriver: false,
        },
      ),
    ]).start();

    resetTilt();
  };

  /*
   * ─────────────────────────────────────
   * SHARED PROGRESS
   * ─────────────────────────────────────
   */

  const p = categoryProgress;

  /*
   * ─────────────────────────────────────
   * VEHICLES
   * ─────────────────────────────────────
   */

  const vehicleDotX =
    p.interpolate({
      inputRange: [
        0,
        0.125,
        0.25,
        0.375,
        0.5,
        0.625,
        0.75,
        0.875,
        1,
      ],
      outputRange: [
        4,
        11,
        18,
        29,
        43,
        56,
        67,
        75,
        4,
      ],
    });

  const vehicleDotY =
    p.interpolate({
      inputRange: [
        0,
        0.125,
        0.25,
        0.375,
        0.5,
        0.625,
        0.75,
        0.875,
        1,
      ],
      outputRange: [
        34,
        30,
        24,
        18,
        14,
        16,
        20,
        28,
        34,
      ],
    });

  const dataStreamX =
    p.interpolate({
      inputRange: [0, 1],
      outputRange: [-120, 120],
    });

  /*
   * ─────────────────────────────────────
   * DRIVERS
   * ─────────────────────────────────────
   */

  const driversDashOffset =
    p.interpolate({
      inputRange: [0, 1],
      outputRange: [80, 0],
    });

  const breathingScale =
    p.interpolate({
      inputRange: [
        0,
        0.25,
        0.5,
        0.75,
        1,
      ],
      outputRange: [
        0.92,
        1.08,
        0.92,
        1.08,
        0.92,
      ],
    });

  const breathingOpacity =
    p.interpolate({
      inputRange: [
        0,
        0.25,
        0.5,
        0.75,
        1,
      ],
      outputRange: [
        0.22,
        0.08,
        0.22,
        0.08,
        0.22,
      ],
    });

  /*
   * ─────────────────────────────────────
   * TRIPS
   * ─────────────────────────────────────
   */

  const tripOrbitX =
    p.interpolate({
      inputRange: [
        0,
        0.25,
        0.5,
        0.75,
        1,
      ],
      outputRange: [
        0,
        13,
        0,
        -13,
        0,
      ],
    });

  const tripOrbitY =
    p.interpolate({
      inputRange: [
        0,
        0.25,
        0.5,
        0.75,
        1,
      ],
      outputRange: [
        -9,
        0,
        9,
        0,
        -9,
      ],
    });

  const constellationPulse =
    p.interpolate({
      inputRange: [
        0,
        0.2,
        0.4,
        0.6,
        0.8,
        1,
      ],
      outputRange: [
        0.34,
        0.58,
        0.30,
        0.62,
        0.30,
        0.34,
      ],
    });

  const constellationScale =
    p.interpolate({
      inputRange: [
        0,
        0.5,
        1,
      ],
      outputRange: [
        0.94,
        1.06,
        0.94,
      ],
    });

  /*
   * ─────────────────────────────────────
   * MAINTENANCE
   * ─────────────────────────────────────
   */

  const maintenanceDashOffset =
    p.interpolate({
      inputRange: [0, 1],
      outputRange: [400, 0],
    });

  /*
   * ─────────────────────────────────────
   * CARD
   * ─────────────────────────────────────
   */

  return (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity:
            entranceOpacity,
          transform: [
            {
              perspective: 1000,
            },
            {
              translateY:
                entranceTranslateY,
            },
            {
              scale:
                interactionScale,
            },
            ...(reduceMotion
              ? []
              : [
                  {
                    rotateX:
                      rotateX.interpolate(
                        {
                          inputRange: [
                            -10,
                            10,
                          ],
                          outputRange: [
                            '-10deg',
                            '10deg',
                          ],
                        },
                      ),
                  },
                  {
                    rotateY:
                      rotateY.interpolate(
                        {
                          inputRange: [
                            -10,
                            10,
                          ],
                          outputRange: [
                            '-10deg',
                            '10deg',
                          ],
                        },
                      ),
                  },
                ]),
          ],
        },
      ]}>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${title}`}
        accessibilityHint={`View ${title} details`}
        hitSlop={4}
        onPress={onPress}
        onTouchStart={
          handleTouchStart
        }
        onTouchMove={
          handleTouchMove
        }
        onTouchEnd={
          handleTouchEnd
        }
        onTouchCancel={
          handleTouchEnd
        }
        onLayout={event => {
          cardSize.width =
            event.nativeEvent.layout.width;

          cardSize.height =
            event.nativeEvent.layout.height;
        }}
        style={[
          styles.statCardInner,
          {
            backgroundColor:
              cardBackground,
            borderColor:
              `${color}30`,
          },
        ]}>

        {/* CATEGORY DECORATION */}

        <View
          pointerEvents="none"
          style={
            styles.categoryMotionLayer
          }>

          {/* ─────────────────────
              VEHICLES
             ───────────────────── */}

          {category ===
            'vehicles' && (
            <>
              <Svg
                style={
                  styles.vehicleRouteSvg
                }
                width="100%"
                height="52"
                viewBox="0 0 84 52">

                <Path
                  d="M4 36 C18 12, 29 42, 43 23 C55 7, 67 17, 80 8"
                  fill="none"
                  stroke={color}
                  strokeWidth="1.5"
                  strokeOpacity={0.30}
                  strokeDasharray="3 5"
                  strokeLinecap="round"
                />

                <AnimatedSvgPath
                  d="M4 36 C18 12, 29 42, 43 23 C55 7, 67 17, 80 8"
                  fill="none"
                  stroke={color}
                  strokeWidth="1.9"
                  strokeOpacity={
                    Animated.multiply(
                      ambientOpacity,
                      0.50,
                    )
                  }
                  strokeDasharray="1 14"
                  strokeDashoffset={p}
                />

              </Svg>

              <Animated.View
                style={[
                  styles.vehicleMotionDot,
                  {
                    backgroundColor:
                      color,
                    opacity:
                      Animated.multiply(
                        ambientOpacity,
                        0.68,
                      ),
                    transform: [
                      {
                        translateX:
                          vehicleDotX,
                      },
                      {
                        translateY:
                          vehicleDotY,
                      },
                    ],
                  },
                ]}
              />

              {[0, 1, 2].map(
                stream => (
                  <Animated.View
                    key={`vehicle-stream-${stream}`}
                    style={[
                      styles.vehicleDataStream,
                      {
                        backgroundColor:
                          color,
                        opacity:
                          Animated.multiply(
                            ambientOpacity,
                            0.10 +
                              stream *
                                0.02,
                          ),
                        transform: [
                          {
                            translateX:
                              Animated.add(
                                dataStreamX,
                                stream *
                                  42,
                              ),
                          },
                          {
                            rotate:
                              '-25deg',
                          },
                        ],
                      },
                    ]}
                  />
                ),
              )}
            </>
          )}

          {/* ─────────────────────
              DRIVERS
             ───────────────────── */}

          {category ===
            'drivers' && (
            <>
              <Svg
                style={
                  styles.driverEcgSvg
                }
                width="100%"
                height="42"
                viewBox="0 0 120 42">

                <Path
                  d="M2 23 H25 L31 23 L36 8 L42 31 L48 18 L54 23 H82 L87 23 L93 12 L99 28 L105 22 H118"
                  fill="none"
                  stroke={color}
                  strokeWidth="1.5"
                  strokeOpacity={0.32}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="8 5"
                />

                <AnimatedSvgPath
                  d="M2 23 H25 L31 23 L36 8 L42 31 L48 18 L54 23 H82 L87 23 L93 12 L99 28 L105 22 H118"
                  fill="none"
                  stroke={color}
                  strokeWidth="2.0"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="18 62"
                  strokeDashoffset={
                    driversDashOffset
                  }
                  strokeOpacity={
                    Animated.multiply(
                      ambientOpacity,
                      0.68,
                    )
                  }
                />

              </Svg>

              <Animated.View
                pointerEvents="none"
                style={[
                  styles.driverBreathingRing,
                  {
                    borderColor:
                      color,
                    opacity:
                      Animated.multiply(
                        ambientOpacity,
                        breathingOpacity,
                      ),
                    transform: [
                      {
                        scale:
                          breathingScale,
                      },
                    ],
                  },
                ]}
              />
            </>
          )}

          {/* ─────────────────────
              TRIPS
             ───────────────────── */}

          {category ===
            'trips' && (
            <>
              <Svg
                style={
                  styles.tripConstellationSvg
                }
                width="100%"
                height="62"
                viewBox="0 0 120 62">

                <Path
                  d="M9 17 L37 8 L61 23 L91 11 L111 29 M37 8 L52 48 L91 11 L77 54 L111 29 M9 17 L52 48"
                  fill="none"
                  stroke={color}
                  strokeWidth="0.8"
                  strokeOpacity={0.28}
                />

              </Svg>

              {[
                {
                  x: 12,
                  y: 18,
                  delay: 0,
                },
                {
                  x: 40,
                  y: 9,
                  delay: 0.12,
                },
                {
                  x: 64,
                  y: 24,
                  delay: 0.24,
                },
                {
                  x: 93,
                  y: 12,
                  delay: 0.36,
                },
                {
                  x: 78,
                  y: 54,
                  delay: 0.48,
                },
                {
                  x: 110,
                  y: 30,
                  delay: 0.60,
                },
              ].map(
                particle => (
                  <Animated.View
                    key={`${particle.x}-${particle.y}`}
                    pointerEvents="none"
                    style={[
                      styles.tripParticle,
                      {
                        left:
                          `${particle.x}%`,
                        top:
                          particle.y,
                        backgroundColor:
                          color,
                        opacity:
                          Animated.multiply(
                            ambientOpacity,
                            constellationPulse,
                          ),
                        transform: [
                          {
                            scale:
                              constellationScale,
                          },
                        ],
                      },
                    ]}
                  />
                ),
              )}

              <Animated.View
                pointerEvents="none"
                style={[
                  styles.tripOrbitDot,
                  {
                    backgroundColor:
                      color,
                    opacity:
                      Animated.multiply(
                        ambientOpacity,
                        0.72,
                      ),
                    transform: [
                      {
                        translateX:
                          tripOrbitX,
                      },
                      {
                        translateY:
                          tripOrbitY,
                      },
                    ],
                  },
                ]}
              />
            </>
          )}

          {/* ─────────────────────
              MAINTENANCE
             ───────────────────── */}

          {category ===
            'maintenance' && (
            <Svg
              pointerEvents="none"
              style={
                styles.maintenanceBorderSvg
              }
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              preserveAspectRatio="none">

              <Rect
                x="1"
                y="1"
                width="98"
                height="98"
                rx="15"
                fill="none"
                stroke={color}
                strokeWidth="1.2"
                strokeOpacity={0.14}
              />

              <AnimatedSvgRect
                x="1"
                y="1"
                width="98"
                height="98"
                rx="15"
                fill="none"
                stroke={color}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeDasharray="16 384"
                strokeDashoffset={
                  maintenanceDashOffset
                }
                strokeOpacity={
                  Animated.multiply(
                    ambientOpacity,
                    0.70,
                  )
                }
              />

            </Svg>
          )}

        </View>

        {/* CONTENT */}

        <View
          pointerEvents="none"
          style={
            styles.statCardContent
          }>

          <View
            style={[
              styles.statIcon,
              {
                backgroundColor:
                  `${color}18`,
                borderColor:
                  `${color}35`,
              },
            ]}>

            <MaterialDesignIcons
              name={icon}
              size={21}
              color={color}
            />

          </View>

          <Text
            style={styles.statTitle}
            numberOfLines={1}>
            {title}
          </Text>

          <View
            style={
              styles.statBottomRow
            }>

            <Text
              style={styles.statValue}>
              {value}
            </Text>

            <View
              style={
                styles.statStatusRow
              }>

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

      </Pressable>

    </Animated.View>
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

type DashboardScreenProps = {
  onNavigate?: (
    route: BottomNavRoute | 'Maintenance',
  ) => void;
};

const DashboardScreen = ({
  onNavigate,
}: DashboardScreenProps) => {

  /*
   * ALL HOOKS AT THE TOP
   */

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

  const [
    profilePopupMounted,
    setProfilePopupMounted,
  ] = useState(false);

  const profilePopupOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const profilePopupScale = useRef(
    new Animated.Value(0.96),
  ).current;

  const profilePopupTranslateY = useRef(
    new Animated.Value(-8),
  ).current;

  const profileBackdropOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const [
    reduceMotion,
    setReduceMotion,
  ] = useState(false);

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then(
      enabled => {
        if (mounted) {
          setReduceMotion(enabled);
        }
      },
    );

    const subscription =
      AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        enabled => {
          setReduceMotion(enabled);
        },
      );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

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

  const openProfileMenu = () => {
    setProfilePopupMounted(true);
    setProfileMenuVisible(true);

    profilePopupOpacity.stopAnimation();
    profilePopupScale.stopAnimation();
    profilePopupTranslateY.stopAnimation();
    profileBackdropOpacity.stopAnimation();

    profilePopupOpacity.setValue(0);
    profilePopupScale.setValue(0.96);
    profilePopupTranslateY.setValue(-8);
    profileBackdropOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(profileBackdropOpacity, {
        toValue: 1,
        duration: 160,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(profilePopupOpacity, {
        toValue: 1,
        duration: 170,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(profilePopupScale, {
        toValue: 1,
        duration: 190,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(profilePopupTranslateY, {
        toValue: 0,
        duration: 190,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeProfileMenu = () => {
    if (!profilePopupMounted) {
      return;
    }

    Animated.parallel([
      Animated.timing(profileBackdropOpacity, {
        toValue: 0,
        duration: 130,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(profilePopupOpacity, {
        toValue: 0,
        duration: 130,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(profilePopupScale, {
        toValue: 0.96,
        duration: 130,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(profilePopupTranslateY, {
        toValue: -8,
        duration: 130,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({finished}) => {
      if (finished) {
        setProfileMenuVisible(false);
        setProfilePopupMounted(false);
      }
    });
  };

  useEffect(() => {
    return () => {
      profilePopupOpacity.stopAnimation();
      profilePopupScale.stopAnimation();
      profilePopupTranslateY.stopAnimation();
      profileBackdropOpacity.stopAnimation();
    };
  }, [
    profilePopupOpacity,
    profilePopupScale,
    profilePopupTranslateY,
    profileBackdropOpacity,
  ]);

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
              onPress={openProfileMenu}
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

        </View>

        {/* 2 × 2 CARD GRID */}

        <View
          style={styles.statsGrid}>

          <StatCard
            icon="truck-outline"
            color={
              FLEET_COLORS.vehicles
            }
            cardBackground={
              FLEET_CARD_SURFACES.vehicles
            }
            category="vehicles" 
            title="Total Vehicles"
            value={totalVehicles}
            subtitle={`${activeVehicles} Active`}
            subtitleColor={
              STATUS_COLORS.info
            }
            onPress={() =>
              onNavigate?.('Vehicles')
            }
            entranceDelay={0}
            reduceMotion={reduceMotion}
          />

          <StatCard
            icon="account-group-outline"
            color={
              FLEET_COLORS.drivers
            }
            cardBackground={
              FLEET_CARD_SURFACES.drivers
            }
            category="drivers" 
            title="Total Drivers"
            value={totalDrivers}
            subtitle={`${activeDrivers} Active`}
            subtitleColor={
              STATUS_COLORS.info
            }
            onPress={() =>
              onNavigate?.('Drivers')
            }
            entranceDelay={65}
            reduceMotion={reduceMotion}
          />

          <StatCard
            icon="source-branch"
            color={
              FLEET_COLORS.trips
            }
            cardBackground={
              FLEET_CARD_SURFACES.trips
            }
            category="trips" 
            title="Total Trips"
            value={totalTrips}
            subtitle={`${inProgressTrips} In Progress`}
            subtitleColor={
              STATUS_COLORS.info
            }
            onPress={() =>
              onNavigate?.('Trips')
            }
            entranceDelay={130}
            reduceMotion={reduceMotion}
          />

          <StatCard
            icon="wrench-outline"
            color={
              FLEET_COLORS.maintenance
            }
            cardBackground={
              FLEET_CARD_SURFACES.maintenance
            }
            category="maintenance" 
            title="Maintenance"
            value={
              maintenanceVehicles
            }
            subtitle={`${upcomingMaintenance} Upcoming`}
            subtitleColor={
              STATUS_COLORS.warning
            }
            onPress={() =>
              onNavigate?.(
                'Maintenance',
              )
            }
            entranceDelay={195}
            reduceMotion={reduceMotion}
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
        visible={profilePopupMounted}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeProfileMenu}>

        <View
          style={
            styles.profileModalContainer
          }>

          <Animated.View
            pointerEvents="box-none"
            style={[
              styles.profileModalBackdropContainer,
              {
                opacity: profileBackdropOpacity,
              },
            ]}>
            <Pressable
              style={
                styles.profileModalBackdrop
              }
              accessibilityRole="button"
              accessibilityLabel="Close profile menu"
              onPress={closeProfileMenu}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.profileModalMenu,
              {
                opacity: profilePopupOpacity,
                transform: [
                  {
                    translateY:
                      profilePopupTranslateY,
                  },
                  {
                    scale: profilePopupScale,
                  },
                ],
              },
            ]}>

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

          </Animated.View>

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

  profileModalBackdropContainer: {
  position: 'absolute',

  top: 0,
  right: 0,
  bottom: 0,
  left: 0,

  zIndex: 1,
},

profileModalBackdrop: {
  position: 'absolute',

  top: 0,
  right: 0,
  bottom: 0,
  left: 0,

  backgroundColor:
    'rgba(0, 0, 0, 0.18)',
},

  profileModalMenu: {
    zIndex: 2,
    position: 'absolute',

    top: 84,

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

    position: 'relative',

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

    overflow: 'hidden',
  },

  statAmbientGlow: {
    position: 'absolute',

    width: 130,
    height: 130,

    borderRadius: 65,

    top: -54,
    right: -38,

    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 28,

    elevation: 0,
  },

  statAmbientGlowSecondary: {
    position: 'absolute',

    width: 92,
    height: 92,

    borderRadius: 46,

    bottom: -42,
    left: -28,

    shadowColor: '#000000',
    shadowOpacity: 0.24,
    shadowRadius: 22,

    elevation: 0,
  },

  categoryMotionLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },

  vehicleRouteSvg: {
    position: 'absolute',
    right: 6,
    bottom: 8,
  },

  vehicleMotionDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 3,
    right: 10,
    bottom: 32,
  },

  vehicleDataStream: {
    position: 'absolute',
    width: 96,
    height: 1,
    top: 18,
    right: -24,
  },

  driverEcgSvg: {
    position: 'absolute',
    right: 5,
    bottom: 16,
  },

  driverBreathingRing: {
    position: 'absolute',
    width: 54,
    height: 54,
    left: 3,
    top: 5,
    borderRadius: 27,
    borderWidth: 1.5,
  },

  tripConstellationSvg: {
    position: 'absolute',
    right: 3,
    top: 4,
  },

  tripParticle: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 2,
    marginLeft: -1.5,
    marginTop: -1.5,
  },

  tripOrbitDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 3,
    left: 21,
    top: 22,
  },

  maintenanceBorderSvg: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  statCardContent: {
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 2,
  },

  statCardPressed: {
    opacity: 0.9,
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