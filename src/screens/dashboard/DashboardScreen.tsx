import React, {useEffect, useRef, useState} from 'react';

import {
  AccessibilityInfo,
  Animated,
  Easing,
  GestureResponderEvent,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  MaterialDesignIcons,
} from '@react-native-vector-icons/material-design-icons/static';

import {
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';

import type {
  Asset,
  CameraOptions,
  ImageLibraryOptions,
} from 'react-native-image-picker';

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

import {
  colors,
  radius,
} from '../../theme';

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
  vehicles: colors.categories.vehicles,
  drivers: colors.categories.drivers,
  trips: colors.categories.trips,
  maintenance: colors.categories.maintenance,
} as const;

const FLEET_CARD_SURFACES = {
  vehicles: 'rgba(12, 30, 54, 0.92)',
  drivers: 'rgba(7, 35, 34, 0.92)',
  trips: 'rgba(25, 13, 45, 0.92)',
  maintenance: 'rgba(40, 28, 8, 0.92)',
} as const;

/*
 * ─────────────────────────────────────
 * STATUS COLORS
 * ─────────────────────────────────────
 */

const STATUS_COLORS = {
  info: colors.info,
  warning: colors.warning,
  urgent: colors.danger,
} as const;

/*
 * ─────────────────────────────────────
 * FINANCIAL COLORS
 * ─────────────────────────────────────
 */

const FINANCIAL_COLORS = {
  profit: colors.success,
  loss: colors.danger,
} as const;

const ICON_SIZES = {
  header: 21,
  card: 21,
  activity: 19,
  action: 20,
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
  cardBackground,
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
  onPress: () => void;
  entranceDelay: number;
  reduceMotion: boolean;
}) => {
  const entranceOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const entranceTranslateY = useRef(
    new Animated.Value(18),
  ).current;

  const interactionScale = useRef(
    new Animated.Value(1),
  ).current;

  const rotateX = useRef(
    new Animated.Value(0),
  ).current;

  const rotateY = useRef(
    new Animated.Value(0),
  ).current;

  const glowProgress = useRef(
    new Animated.Value(0),
  ).current;

  const glowOpacity = useRef(
    new Animated.Value(1),
  ).current;

  const glowAnimation = useRef<Animated.CompositeAnimation | null>(
    null,
  );

  const touchFrame = useRef<number | null>(
    null,
  );

  const cardSize = useRef({
    width: 1,
    height: 1,
  }).current;

  useEffect(() => {
    entranceOpacity.stopAnimation();
    entranceTranslateY.stopAnimation();

    entranceOpacity.setValue(0);
    entranceTranslateY.setValue(
      reduceMotion ? 0 : 18,
    );

    const entrance = Animated.sequence([
      ...(reduceMotion
        ? []
        : [
            Animated.delay(entranceDelay),
          ]),
      Animated.parallel([
        Animated.timing(entranceOpacity, {
          toValue: 1,
          duration: reduceMotion ? 180 : 260,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        ...(reduceMotion
          ? []
          : [
              Animated.timing(
                entranceTranslateY,
                {
                  toValue: 0,
                  duration: 280,
                  easing: Easing.out(
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

  useEffect(() => {
    glowAnimation.current?.stop();

    glowProgress.stopAnimation();
    glowOpacity.stopAnimation();

    glowProgress.setValue(0);
    glowOpacity.setValue(1);

    if (reduceMotion) {
      return () => {
        glowAnimation.current?.stop();
      };
    }

    const loop = Animated.loop(
      Animated.timing(glowProgress, {
        toValue: 1,
        duration: 6000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    );

    glowAnimation.current = loop;
    loop.start();

    return () => {
      loop.stop();
    };
  }, [
    reduceMotion,
    glowProgress,
    glowOpacity,
  ]);

  useEffect(() => {
    return () => {
      if (touchFrame.current !== null) {
        cancelAnimationFrame(
          touchFrame.current,
        );
      }
    };
  }, []);

  const resetTilt = () => {
    if (touchFrame.current !== null) {
      cancelAnimationFrame(
        touchFrame.current,
      );
      touchFrame.current = null;
    }

    Animated.parallel([
      Animated.spring(rotateX, {
        toValue: 0,
        damping: 16,
        stiffness: 180,
        mass: 0.7,
        useNativeDriver: true,
      }),
      Animated.spring(rotateY, {
        toValue: 0,
        damping: 16,
        stiffness: 180,
        mass: 0.7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleTouchStart = () => {
    const animations: Animated.CompositeAnimation[] = [
      Animated.timing(interactionScale, {
        toValue: 0.97,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ];

    if (!reduceMotion) {
      animations.push(
        Animated.timing(glowOpacity, {
          toValue: 0.32,
          duration: 100,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      );
    }

    Animated.parallel(animations).start();
  };

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
            ? (locationX / cardSize.width) *
                2 -
              1
            : 0;

        const normalizedY =
          cardSize.height > 1
            ? (locationY / cardSize.height) *
                2 -
              1
            : 0;

        const clampedX = Math.max(
          -1,
          Math.min(1, normalizedX),
        );

        const clampedY = Math.max(
          -1,
          Math.min(1, normalizedY),
        );

        /*
         * Touching the left side rotates the
         * card toward the left, while touching
         * the right side rotates it toward the
         * right. Vertical movement controls the
         * X axis tilt.
         */

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

  const handleTouchEnd = () => {
    Animated.parallel([
      Animated.spring(interactionScale, {
        toValue: 1,
        damping: 14,
        stiffness: 220,
        mass: 0.65,
        useNativeDriver: true,
      }),
      Animated.timing(glowOpacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    resetTilt();
  };

  const glowTranslateX =
    glowProgress.interpolate({
      inputRange: [0, 0.25, 0.5, 0.75, 1],
      outputRange: [
        -18,
        12,
        -8,
        18,
        -18,
      ],
    });

  const glowTranslateY =
    glowProgress.interpolate({
      inputRange: [0, 0.25, 0.5, 0.75, 1],
      outputRange: [
        10,
        -6,
        14,
        -4,
        10,
      ],
    });

  const glowScale =
    glowProgress.interpolate({
      inputRange: [0, 0.25, 0.5, 0.75, 1],
      outputRange: [
        1,
        1.08,
        0.97,
        1.10,
        1,
      ],
    });

  return (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity: entranceOpacity,
          transform: [
            {
              perspective: 1000,
            },
            {
              translateY:
                entranceTranslateY,
            },
            {
              scale: interactionScale,
            },
            ...(reduceMotion
              ? []
              : [
                  {
                    rotateX:
                      rotateX.interpolate({
                        inputRange: [-10, 10],
                        outputRange: [
                          '-10deg',
                          '10deg',
                        ],
                      }),
                  },
                  {
                    rotateY:
                      rotateY.interpolate({
                        inputRange: [-10, 10],
                        outputRange: [
                          '-10deg',
                          '10deg',
                        ],
                      }),
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
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

        {/* AMBIENT CARD GLOW */}

        <Animated.View
          pointerEvents="none"
          style={[
            styles.statAmbientGlow,
            {
              backgroundColor: color,
              shadowColor: color,
              opacity: Animated.multiply(
                glowOpacity,
                0.16,
              ),
              transform: [
                {
                  translateX:
                    glowTranslateX,
                },
                {
                  translateY:
                    glowTranslateY,
                },
                {
                  scale: glowScale,
                },
              ],
            },
          ]}
        />

        {/* SECONDARY SOFT GLOW */}

        <Animated.View
          pointerEvents="none"
          style={[
            styles.statAmbientGlowSecondary,
            {
              backgroundColor: color,
              shadowColor: color,
              opacity: Animated.multiply(
                glowOpacity,
                0.07,
              ),
              transform: [
                {
                  translateX:
                    glowTranslateY,
                },
                {
                  translateY:
                    glowTranslateX,
                },
                {
                  scale: glowScale,
                },
              ],
            },
          ]}
        />

        {/* CONTENT */}

        <View
          pointerEvents="none"
          style={styles.statCardContent}>

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
              size={ICON_SIZES.card}
              color={color}
            />

          </View>

          <Text
            style={styles.statTitle}
            numberOfLines={1}>
            {title}
          </Text>

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
          size={ICON_SIZES.activity}
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

const ProgressMetricRow = ({
  icon,
  title,
  value,
  color,
}: {
  icon: DashboardIconName;
  title: string;
  value: number;
  color: string;
}) => {
  const clampedValue = Math.max(0, Math.min(1, value));

  return (
    <View style={styles.healthRow}>
      <View style={styles.healthRowHeader}>
        <View style={styles.healthLabelRow}>
          <MaterialDesignIcons
            name={icon}
            size={18}
            color={color}
          />
          <Text style={styles.healthTitle}>{title}</Text>
        </View>
        <Text style={[styles.healthValue, {color}]}>{Math.round(clampedValue * 100)}%</Text>
      </View>

      <View style={styles.healthTrack}>
        <View
          style={[
            styles.healthFill,
            {
              width: `${clampedValue * 100}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
};

const AttentionRow = ({
  icon,
  color,
  title,
  subtitle,
  value,
  onPress,
}: {
  icon: DashboardIconName;
  color: string;
  title: string;
  subtitle: string;
  value: number;
  onPress?: () => void;
}) => {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={title}
      disabled={!onPress}
      onPress={onPress}
      style={({pressed}) => [
        styles.attentionRow,
        pressed && styles.attentionPressed,
      ]}>
      <View
        style={[
          styles.attentionIcon,
          {backgroundColor: `${color}16`},
        ]}>
        <MaterialDesignIcons
          name={icon}
          size={19}
          color={color}
        />
      </View>

      <View style={styles.attentionText}>
        <Text style={styles.attentionTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.attentionSubtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>

      <Text style={[styles.attentionValue, {color}]}>{value}</Text>

      {onPress && (
        <MaterialDesignIcons
          name="chevron-right"
          size={21}
          color={colors.textMuted}
        />
      )}
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

  const {width} = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isTablet = width >= 600;
  const horizontalPadding =
    width < 360 ? 14 : width < 430 ? 18 : 22;
  const bottomContentPadding =
    Math.max(insets.bottom, 12) + 112;
  const glowSize = Math.max(width * 0.72, 240);
  const financeStacked = width < 380;

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

  const [
    documentCaptureVisible,
    setDocumentCaptureVisible,
  ] = useState(false);

  const [
    stagedDocuments,
    setStagedDocuments,
  ] = useState<Asset[]>([]);

  const [
    documentError,
    setDocumentError,
  ] = useState('');

  const [
    isPickingDocument,
    setIsPickingDocument,
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

  const vehicleAvailability =
    totalVehicles > 0
      ? activeVehicles / totalVehicles
      : 0;

  const driverAvailability =
    totalDrivers > 0
      ? activeDrivers / totalDrivers
      : 0;

  const tripActivity =
    totalTrips > 0
      ? inProgressTrips / totalTrips
      : 0;

  const maintenanceReadiness =
    totalVehicles > 0
      ? Math.max(
          0,
          (totalVehicles - maintenanceVehicles) /
            totalVehicles,
        )
      : 0;


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
   * DOCUMENT CAPTURE
   * ─────────────────────────────────────
   */

  const openDocumentCapture = () => {
    setDocumentError('');
    setDocumentCaptureVisible(true);
  };

  const appendDocumentAssets = (assets: Asset[]) => {
    const validAssets = assets.filter(
      asset => Boolean(asset.uri),
    );

    if (validAssets.length === 0) {
      return;
    }

    setStagedDocuments(current => {
      const existingUris = new Set(
        current
          .map(asset => asset.uri)
          .filter((uri): uri is string => Boolean(uri)),
      );

      const next = [...current];

      validAssets.forEach(asset => {
        if (asset.uri && !existingUris.has(asset.uri)) {
          next.push(asset);
          existingUris.add(asset.uri);
        }
      });

      return next.slice(0, 10);
    });
  };

  // Uploads a captured document image to the FleetFlow backend.
  const uploadDocument = async (asset: Asset) => {
    if (!asset.uri) {
      throw new Error('Captured document has no URI.');
    }

    const formData = new FormData();

    formData.append('file', {
      uri: asset.uri,
      type: asset.type || 'image/jpeg',
      name: asset.fileName || `document-${Date.now()}.jpg`,
    } as any);

    const response = await fetch(
      'https://fleetflowapi.onrender.com/documents/upload',
      {
        method: 'POST',
        body: formData,
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Document upload failed.');
    }

    return data;
  };
  const handleTakeDocumentPhoto = async () => {
    if (isPickingDocument) {
      return;
    }

    setDocumentError('');
    setIsPickingDocument(true);

    const options: CameraOptions = {
      mediaType: 'photo',
      cameraType: 'back',
      quality: 1,
      saveToPhotos: false,
    };

    try {
      const response = await launchCamera(options);

      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        const cameraMessage =
          response.errorCode === 'permission'
            ? 'Camera permission was denied. Please allow camera access in Android settings.'
            : response.errorCode === 'camera_unavailable'
            ? 'The camera is unavailable on this device right now.'
            : response.errorMessage ||
              'The camera could not be opened.';

        setDocumentError(cameraMessage);
        return;
      }

      // Upload the captured document to the FleetFlow backend, then keep it staged in the UI.
      if (!response.assets?.length) {
        setDocumentError('No document photo was captured.');
        return;
      }

      try {
        await uploadDocument(response.assets[0]);

        appendDocumentAssets(response.assets);

        console.log('Document uploaded successfully.');
      } catch (error) {
        console.error('Document upload failed:', error);

        setDocumentError(
          error instanceof Error
            ? error.message
            : 'Document upload failed.',
        );
      }
    } catch (error) {
      console.error(
        'Document camera failed:',
        error,
      );
      setDocumentError(
        'The camera could not be opened. Please try again.',
      );
    } finally {
      setIsPickingDocument(false);
    }
  };

  const handleChooseDocumentFromGallery = async () => {
    if (isPickingDocument) {
      return;
    }

    setDocumentError('');
    setIsPickingDocument(true);

    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      selectionLimit: 10,
      quality: 1,
    };

    try {
      const response = await launchImageLibrary(options);
      
      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        setDocumentError(
          response.errorMessage ||
            'The gallery could not be opened.',
        );
        return;
      }

      // Upload each selected document to the FleetFlow backend, then keep the files staged in the UI.
      if (!response.assets?.length) {
        setDocumentError('No document was selected.');
        return;
      }

      try {
        for (const asset of response.assets) {
          await uploadDocument(asset);
        }

        appendDocumentAssets(response.assets);

        console.log(
          `${response.assets.length} document(s) uploaded successfully.`,
        );
      } catch (error) {
        console.error('Document upload failed:', error);

        setDocumentError(
          error instanceof Error
            ? error.message
            : 'Document upload failed.',
        );
      }
    } catch (error) {
      console.error(
        'Document gallery failed:',
        error,
      );
      setDocumentError(
        'The gallery could not be opened. Please try again.',
      );
    } finally {
      setIsPickingDocument(false);
    }
  };

  const removeStagedDocument = (uri: string | undefined) => {
    if (!uri) {
      return;
    }

    setStagedDocuments(current =>
      current.filter(asset => asset.uri !== uri),
    );
  };

  const closeDocumentCapture = () => {
    if (isPickingDocument) {
      return;
    }

    setDocumentCaptureVisible(false);
    setDocumentError('');
  };

  const getDocumentFileName = (asset: Asset) => {
    if (asset.fileName) {
      return asset.fileName;
    }

    if (asset.uri) {
      const parts = asset.uri.split('/');
      return parts[parts.length - 1] || 'Fleet document';
    }

    return 'Fleet document';
  };

  const formatDocumentSize = (bytes?: number) => {
    if (!bytes || bytes <= 0) {
      return 'Size unavailable';
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
          style={[
            styles.blueGlow,
            {
              width: glowSize,
              height: glowSize,
              borderRadius: glowSize / 2,
            },
          ]}
        />

        <View
          style={[
            styles.violetGlow,
            {
              width: glowSize * 0.88,
              height: glowSize * 0.88,
              borderRadius: glowSize * 0.44,
            },
          ]}
        />

        <View
          style={[
            styles.cyanGlow,
            {
              width: glowSize * 0.92,
              height: glowSize * 0.92,
              borderRadius: glowSize * 0.46,
            },
          ]}
        />

      </View>

      {/* DASHBOARD */}

      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.screenContent,
          {
            paddingHorizontal: horizontalPadding,
            paddingBottom: bottomContentPadding,
          },
          isTablet &&
            styles.screenContentTablet,
        ]}
        showsVerticalScrollIndicator={false}
        bounces
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled>

        {/* HEADER */}

        <View
          style={styles.header}>

          <View
            style={styles.brandBlock}>

            <Text
              style={[
                styles.brand,
                {fontSize: isTablet ? 29 : width < 360 ? 23 : 25},
              ]}
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

          {/* HEADER ACTIONS */}

          <View
            style={
              styles.headerActions
            }>

            {/* DOCUMENT CAMERA */}

            <View
              style={
                styles.documentActionContainer
              }>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Capture fleet document"
                accessibilityHint="Take a photo or choose documents such as bills and receipts"
                hitSlop={8}
                onPress={openDocumentCapture}
                style={({pressed}) => [
                  styles.documentButton,
                  pressed &&
                    styles.documentPressed,
                ]}>

                <MaterialDesignIcons
                  name="camera-outline"
                  size={ICON_SIZES.header}
                  color="#60A5FA"
                />

              </Pressable>

              {stagedDocuments.length > 0 && (
                <View
                  pointerEvents="none"
                  style={
                    styles.documentCountBadge
                  }>
                  <Text
                    style={
                      styles.documentCountText
                    }>
                    {stagedDocuments.length >= 10
                      ? '10'
                      : stagedDocuments.length}
                  </Text>
                </View>
              )}

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
            cardBackground={
              FLEET_CARD_SURFACES.vehicles
            }
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

        {/* ATTENTION REQUIRED */}

        <View
          style={styles.sectionHeadingBlock}>
          <Text style={styles.sectionTitle}>
            ATTENTION REQUIRED
          </Text>
          <Text style={styles.sectionSubtitle}>
            Items that may require operational action
          </Text>
        </View>

        <View style={styles.attentionCard}>
          {highPriorityAlerts > 0 && (
            <AttentionRow
              icon="alert-circle-outline"
              color={STATUS_COLORS.urgent}
              title="High-priority maintenance"
              subtitle="Maintenance records marked high priority"
              value={highPriorityAlerts}
              onPress={() => onNavigate?.('Maintenance')}
            />
          )}

          {highPriorityAlerts > 0 && upcomingMaintenance > 0 && (
            <View style={styles.attentionDivider} />
          )}

          {upcomingMaintenance > 0 && (
            <AttentionRow
              icon="wrench-clock-outline"
              color={STATUS_COLORS.warning}
              title="Upcoming maintenance"
              subtitle="Scheduled or in-progress maintenance items"
              value={upcomingMaintenance}
              onPress={() => onNavigate?.('Maintenance')}
            />
          )}

          {upcomingMaintenance > 0 && inProgressTrips > 0 && (
            <View style={styles.attentionDivider} />
          )}

          {inProgressTrips > 0 && (
            <AttentionRow
              icon="truck-fast-outline"
              color={STATUS_COLORS.info}
              title="Trips in progress"
              subtitle="Trips currently moving through the fleet"
              value={inProgressTrips}
              onPress={() => onNavigate?.('Trips')}
            />
          )}

          {highPriorityAlerts === 0 &&
            upcomingMaintenance === 0 &&
            inProgressTrips === 0 && (
              <View style={styles.attentionEmpty}>
                <MaterialDesignIcons
                  name="check-circle-outline"
                  size={21}
                  color={FINANCIAL_COLORS.profit}
                />
                <Text style={styles.attentionEmptyTitle}>
                  No immediate attention items
                </Text>
                <Text style={styles.attentionEmptySubtitle}>
                  Your current fleet data has no flagged operational items.
                </Text>
              </View>
            )}
        </View>

        {/* FLEET HEALTH */}

        <View style={styles.sectionHeadingBlock}>
          <Text style={styles.sectionTitle}>
            FLEET HEALTH
          </Text>
          <Text style={styles.sectionSubtitle}>
            Current availability and operational readiness
          </Text>
        </View>

        <View style={styles.healthCard}>
          <ProgressMetricRow
            icon="truck-outline"
            title="Vehicle availability"
            value={vehicleAvailability}
            color={FLEET_COLORS.vehicles}
          />

          <ProgressMetricRow
            icon="account-check-outline"
            title="Driver availability"
            value={driverAvailability}
            color={FLEET_COLORS.drivers}
          />

          <ProgressMetricRow
            icon="map-marker-path"
            title="Trip activity"
            value={tripActivity}
            color={FLEET_COLORS.trips}
          />

          <ProgressMetricRow
            icon="shield-check-outline"
            title="Maintenance readiness"
            value={maintenanceReadiness}
            color={FLEET_COLORS.maintenance}
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
          style={[
            styles.financeCard,
            financeStacked &&
              styles.financeCardStacked,
          ]}>

          {/* PROFIT / LOSS GRAPHIC */}

          <View
            style={[
              styles.financeCircleArea,
              financeStacked &&
                styles.financeCircleAreaStacked,
            ]}>

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

      </ScrollView>

      {/* DOCUMENT CAPTURE MODAL */}

      <Modal
        visible={documentCaptureVisible}
        transparent
        animationType={reduceMotion ? 'none' : 'slide'}
        statusBarTranslucent
        onRequestClose={closeDocumentCapture}>

        <View
          style={
            styles.documentModalContainer
          }>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close document capture"
            onPress={closeDocumentCapture}
            style={
              styles.documentModalBackdrop
            }
          />

          <View
            style={
              styles.documentModalSheet
            }>

            <ScrollView
              style={styles.documentSheetScroll}
              contentContainerStyle={styles.documentSheetScrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
              nestedScrollEnabled>

            <View
              style={
                styles.documentSheetHandle
              }
            />

            <View
              style={
                styles.documentSheetHeader
              }>

              <View
                style={
                  styles.documentSheetIcon
                }>
                <MaterialDesignIcons
                  name="file-document-multiple-outline"
                  size={22}
                  color="#60A5FA"
                />
              </View>

              <View
                style={
                  styles.documentSheetHeaderText
                }>
                <Text
                  style={
                    styles.documentSheetTitle
                  }>
                  Capture Fleet Document
                </Text>

                <Text
                  style={
                    styles.documentSheetSubtitle
                  }>
                  Bills, receipts, invoices and other fleet documents
                </Text>
              </View>

            </View>

            {documentError ? (
              <View
                style={
                  styles.documentErrorBox
                }>
                <MaterialDesignIcons
                  name="alert-circle-outline"
                  size={18}
                  color="#FF6B7F"
                />
                <Text
                  style={
                    styles.documentErrorText
                  }>
                  {documentError}
                </Text>
              </View>
            ) : null}

            <View
              style={
                styles.documentActionList
              }>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Take document photo"
                disabled={isPickingDocument}
                onPress={handleTakeDocumentPhoto}
                style={({pressed}) => [
                  styles.documentOption,
                  pressed &&
                    styles.documentOptionPressed,
                  isPickingDocument &&
                    styles.documentOptionDisabled,
                ]}>

                <View
                  style={
                    styles.documentOptionIcon
                  }>
                  <MaterialDesignIcons
                    name="camera-outline"
                    size={ICON_SIZES.action}
                    color="#60A5FA"
                  />
                </View>

                <View
                  style={
                    styles.documentOptionText
                  }>
                  <Text
                    style={
                      styles.documentOptionTitle
                    }>
                    {isPickingDocument
                      ? 'Opening…'
                      : 'Take Photo'}
                  </Text>
                  <Text
                    style={
                      styles.documentOptionSubtitle
                    }>
                    Capture a bill, receipt or document with the camera
                  </Text>
                </View>

                <MaterialDesignIcons
                  name="chevron-right"
                  size={22}
                  color="#667892"
                />

              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Choose fleet documents from gallery"
                disabled={isPickingDocument}
                onPress={handleChooseDocumentFromGallery}
                style={({pressed}) => [
                  styles.documentOption,
                  pressed &&
                    styles.documentOptionPressed,
                  isPickingDocument &&
                    styles.documentOptionDisabled,
                ]}>

                <View
                  style={
                    styles.documentOptionIcon
                  }>
                  <MaterialDesignIcons
                    name="image-multiple-outline"
                    size={ICON_SIZES.action}
                    color="#9B5CFF"
                  />
                </View>

                <View
                  style={
                    styles.documentOptionText
                  }>
                  <Text
                    style={
                      styles.documentOptionTitle
                    }>
                    Choose from Gallery
                  </Text>
                  <Text
                    style={
                      styles.documentOptionSubtitle
                    }>
                    Select up to 10 document photos at once
                  </Text>
                </View>

                <MaterialDesignIcons
                  name="chevron-right"
                  size={22}
                  color="#667892"
                />

              </Pressable>

            </View>

            <View
              style={
                styles.documentSelectedHeader
              }>
              <Text
                style={
                  styles.documentSelectedTitle
                }>
                Staged Documents
              </Text>
              <Text
                style={
                  styles.documentSelectedCount
                }>
                {stagedDocuments.length}/10
              </Text>
            </View>

            {stagedDocuments.length > 0 ? (
              <View
                style={
                  styles.documentGrid
                }>

                {stagedDocuments.map(asset => (
                  <View
                    key={asset.uri || getDocumentFileName(asset)}
                    style={
                      styles.documentPreviewCard
                    }>

                    {asset.uri ? (
                      <Image
                        source={{uri: asset.uri}}
                        style={
                          styles.documentPreviewImage
                        }
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={
                          styles.documentPreviewFallback
                        }>
                        <MaterialDesignIcons
                          name="file-document-outline"
                          size={24}
                          color="#60A5FA"
                        />
                      </View>
                    )}

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${getDocumentFileName(asset)}`}
                      hitSlop={5}
                      onPress={() =>
                        removeStagedDocument(
                          asset.uri,
                        )
                      }
                      style={
                        styles.documentRemoveButton
                      }>
                      <MaterialDesignIcons
                        name="close"
                        size={14}
                        color="#FFFFFF"
                      />
                    </Pressable>

                    <View
                      style={
                        styles.documentPreviewMeta
                      }>
                      <Text
                        numberOfLines={1}
                        style={
                          styles.documentPreviewName
                        }>
                        {getDocumentFileName(asset)}
                      </Text>
                      <Text
                        style={
                          styles.documentPreviewSize
                        }>
                        {formatDocumentSize(
                          asset.fileSize,
                        )}
                      </Text>
                    </View>

                  </View>
                ))}

              </View>
            ) : (
              <View
                style={
                  styles.documentEmptyState
                }>
                <MaterialDesignIcons
                  name="file-upload-outline"
                  size={28}
                  color="#667892"
                />
                <Text
                  style={
                    styles.documentEmptyTitle
                  }>
                  No documents staged
                </Text>
                <Text
                  style={
                    styles.documentEmptySubtitle
                  }>
                  Captured or selected documents will appear here.
                </Text>
              </View>
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Done with document capture"
              disabled={isPickingDocument}
              onPress={closeDocumentCapture}
              style={({pressed}) => [
                styles.documentDoneButton,
                pressed &&
                  styles.documentDonePressed,
                isPickingDocument &&
                  styles.documentDoneDisabled,
              ]}>
              <Text
                style={
                  styles.documentDoneText
                }>
                Done
              </Text>
            </Pressable>

            <Text
              style={
                styles.documentLocalNote
              }>
              Documents are staged locally for now. They are not yet attached to a vehicle, trip or expense record.
            </Text>

            </ScrollView>

          </View>

        </View>

      </Modal>

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
                width: Math.min(
                  width * 0.76,
                  isTablet ? 320 : 280,
                ),
                right: horizontalPadding,
              },
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
      colors.background,
  },

  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Define the ScrollView content styles expected by the dashboard layout.
  screenContent: {
    paddingTop: 16,
  },

  screenContentTablet: {
    paddingTop: 24,
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
      '#050711',
  },

  blueGlow: {
    position: 'absolute',

    top: '-46%',
    right: '-24%',

    backgroundColor:
      'rgba(37, 99, 235, 0.13)',
  },

  violetGlow: {
    position: 'absolute',

    top: '28%',
    left: '-34%',

    backgroundColor:
      'rgba(124, 58, 237, 0.08)',
  },

  cyanGlow: {
    position: 'absolute',

    bottom: '-30%',
    right: '-28%',

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

    minHeight: 46,
  },

  headerActions: {
    flexDirection: 'row',

    alignItems: 'center',

    gap: 8,
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
   * DOCUMENT HEADER ACTION
   */

  documentActionContainer: {
    position: 'relative',

    zIndex: 10,
  },

  documentButton: {
    width: 42,
    height: 42,

    borderRadius: 21,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      'rgba(37, 99, 235, 0.16)',

    borderWidth: 1,

    borderColor:
      'rgba(96, 165, 250, 0.28)',
  },

  documentPressed: {
    transform: [
      {
        scale: 0.95,
      },
    ],
  },

  documentCountBadge: {
    position: 'absolute',

    top: -2,
    right: -2,

    minWidth: 16,
    height: 16,

    paddingHorizontal: 3,

    borderRadius: 8,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FF4D6D',

    borderWidth: 1,
    borderColor: '#020817',
  },

  documentCountText: {
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '900',
    color: '#FFFFFF',
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
   * DOCUMENT CAPTURE MODAL
   */

  documentModalContainer: {
    flex: 1,

    justifyContent: 'flex-end',

    backgroundColor: 'rgba(0, 0, 0, 0.34)',
  },

  documentModalBackdrop: {
    position: 'absolute',

    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  documentModalSheet: {
    paddingHorizontal: 18,
    paddingTop: 9,
    paddingBottom: 18,

    maxHeight: '86%',

    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,

    backgroundColor: '#0B1324',

    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.22)',

    elevation: 24,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -10,
    },
    shadowOpacity: 0.30,
    shadowRadius: 24,
  },

  documentSheetHandle: {
    alignSelf: 'center',

    width: 42,
    height: 4,

    marginBottom: 14,

    borderRadius: 2,

    backgroundColor: '#334155',
  },

  documentSheetHeader: {
    flexDirection: 'row',

    alignItems: 'center',
  },

  documentSheetIcon: {
    width: 44,
    height: 44,

    borderRadius: 13,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'rgba(59, 130, 246, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.20)',
  },

  documentSheetHeaderText: {
    flex: 1,
    marginLeft: 11,
  },

  documentSheetTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
    color: '#F8FAFC',
  },

  documentSheetSubtitle: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '500',
    color: '#94A3B8',
  },

  documentErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',

    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,

    borderRadius: 12,

    backgroundColor: 'rgba(255, 77, 109, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 109, 0.18)',
  },

  documentErrorText: {
    flex: 1,
    marginLeft: 8,

    fontSize: 10,
    lineHeight: 14,
    fontWeight: '600',
    color: '#FF8A9A',
  },

  documentActionList: {
    marginTop: 14,

    gap: 8,
  },

  documentOption: {
    minHeight: 66,

    width: '100%',

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 10,

    borderRadius: 14,

    backgroundColor: '#101B2D',
    borderWidth: 1,
    borderColor: '#1B2A40',
  },

  documentOptionPressed: {
    opacity: 0.72,
  },

  documentOptionDisabled: {
    opacity: 0.52,
  },

  documentOptionIcon: {
    width: 38,
    height: 38,

    borderRadius: 11,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'rgba(96, 165, 250, 0.10)',
  },

  documentOptionText: {
    flex: 1,
    marginHorizontal: 10,
  },

  documentOptionTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },

  documentOptionSubtitle: {
    marginTop: 2,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '500',
    color: '#8798AE',
  },

  documentSelectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginTop: 16,
    marginBottom: 8,
  },

  documentSelectedTitle: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#A8B6C8',
  },

  documentSelectedCount: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
    color: '#60A5FA',
  },

  documentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -3,
  },

  documentPreviewCard: {
    width: '25%',
    paddingHorizontal: 3,
    marginBottom: 8,
  },

  documentPreviewImage: {
    width: '100%',
    aspectRatio: 0.82,
    borderRadius: 10,
    backgroundColor: '#111827',
  },

  documentPreviewFallback: {
    width: '100%',
    aspectRatio: 0.82,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#101B2D',
  },

  documentRemoveButton: {
    position: 'absolute',
    top: 2,
    right: 5,

    width: 22,
    height: 22,

    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },

  documentPreviewMeta: {
    marginTop: 4,
  },

  documentPreviewName: {
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '700',
    color: '#D7E0EA',
  },

  documentPreviewSize: {
    marginTop: 1,
    fontSize: 7,
    lineHeight: 9,
    fontWeight: '500',
    color: '#667892',
  },

  documentEmptyState: {
    minHeight: 104,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 18,

    borderRadius: 14,

    backgroundColor: '#0F1929',
    borderWidth: 1,
    borderColor: '#16263B',
    borderStyle: 'dashed',
  },

  documentEmptyTitle: {
    marginTop: 7,

    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
    color: '#A8B6C8',
  },

  documentEmptySubtitle: {
    marginTop: 3,

    textAlign: 'center',

    fontSize: 8,
    lineHeight: 11,
    fontWeight: '500',
    color: '#667892',
  },

  documentDoneButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 12,

    borderRadius: 13,

    backgroundColor: '#1688FF',
  },

  documentDonePressed: {
    opacity: 0.82,
  },

  documentDoneDisabled: {
    opacity: 0.55,
  },

  documentDoneText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  documentLocalNote: {
    marginTop: 8,

    textAlign: 'center',

    fontSize: 7,
    lineHeight: 10,
    fontWeight: '500',
    color: '#56677D',
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

  statCardContent: {
    flex: 1,
    justifyContent: 'space-between',
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

  /*
   * ATTENTION REQUIRED
   */

  attentionCard: {
    marginTop: 2,
    paddingHorizontal: 11,
    paddingVertical: 3,
    borderRadius: radius.card,
    backgroundColor: 'rgba(10, 21, 39, 0.94)',
    borderWidth: 1,
    borderColor: colors.border,
  },

  attentionRow: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },

  attentionPressed: {
    opacity: 0.68,
  },

  attentionIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  attentionText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 9,
    marginRight: 8,
  },

  attentionTitle: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },

  attentionSubtitle: {
    marginTop: 2,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },

  attentionValue: {
    minWidth: 24,
    marginRight: 3,
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '900',
    textAlign: 'right',
  },

  attentionDivider: {
    height: 1,
    marginLeft: 45,
    backgroundColor: colors.borderLight,
  },

  attentionEmpty: {
    minHeight: 74,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  attentionEmptyTitle: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },

  attentionEmptySubtitle: {
    marginTop: 3,
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '500',
    textAlign: 'center',
    color: colors.textMuted,
  },

  /*
   * FLEET HEALTH
   */

  healthCard: {
    marginTop: 2,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.card,
    backgroundColor: 'rgba(10, 21, 39, 0.94)',
    borderWidth: 1,
    borderColor: colors.border,
  },

  healthRow: {
    paddingVertical: 6,
  },

  healthRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  healthLabelRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  healthTitle: {
    marginLeft: 8,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
    color: colors.textSoft,
  },

  healthValue: {
    marginLeft: 8,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '900',
  },

  healthTrack: {
    height: 6,
    marginTop: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },

  healthFill: {
    height: '100%',
    minWidth: 2,
    borderRadius: 3,
  },

  financeCard: {
    minHeight: 137,

    width: '100%',

    flexDirection: 'row',

    marginTop: 2,

    paddingHorizontal: 11,

    paddingVertical: 9,

    borderRadius: 17,

    backgroundColor:
      'rgba(10, 21, 39, 0.94)',

    borderWidth: 1,

    borderColor:
      'rgba(91, 140, 255, 0.18)',

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


  financeCardStacked: {
    flexDirection: 'column',
  },

  financeCircleAreaStacked: {
    width: '100%',
    paddingVertical: 6,
  },

  documentSheetScroll: {
    maxHeight: '100%',
  },

  documentSheetScrollContent: {
    paddingBottom: 2,
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
      'rgba(10, 21, 39, 0.94)',

    borderWidth: 1,

    borderColor:
      colors.border,
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