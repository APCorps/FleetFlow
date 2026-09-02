import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Svg, {
  Circle,
  Line,
  Path,
  Rect,
} from 'react-native-svg';

type SplashScreenProps = {
  onFinish: () => void;
};

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} =
  Dimensions.get('window');

const TRUCK_WIDTH = 230;
const TRUCK_HEIGHT = 105;
const LOGO_WIDTH = 190;

const SplashScreen = ({
  onFinish,
}: SplashScreenProps) => {
  const truckX = useRef(
    new Animated.Value(
      -TRUCK_WIDTH - 80,
    ),
  ).current;

  const logoX = useRef(
    new Animated.Value(
      -SCREEN_WIDTH,
    ),
  ).current;

  const logoOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const logoScale = useRef(
    new Animated.Value(0.92),
  ).current;

  const truckOpacity = useRef(
    new Animated.Value(1),
  ).current;

  const routeOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const hubOpacity = useRef(
    new Animated.Value(0),
  ).current;

  useEffect(() => {
    const entry = Animated.parallel([
      Animated.timing(routeOpacity, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),

      Animated.timing(truckX, {
        toValue:
          SCREEN_WIDTH * 0.50 -
          TRUCK_WIDTH * 0.30,
        duration: 1150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(logoX, {
        toValue: 0,
        duration: 1150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    const dropOff = Animated.parallel([
        Animated.timing(logoX, {
            toValue: 0,
            duration: 650,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }),

        Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
        }),

        Animated.spring(logoScale, {
            toValue: 1,
            damping: 18,
            stiffness: 150,
            mass: 0.7,
            useNativeDriver: true,
        }),

        Animated.timing(hubOpacity, {
            toValue: 1,
            duration: 450,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
        }),
    ]);

    const exit = Animated.parallel([
      Animated.timing(truckX, {
        toValue: SCREEN_WIDTH + 80,
        duration: 900,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(truckOpacity, {
        toValue: 0.92,
        duration: 900,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),

      Animated.sequence([
        Animated.delay(260),

        Animated.parallel([
          Animated.timing(logoOpacity, {
            toValue: 0,
            duration: 320,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),

          Animated.timing(logoScale, {
            toValue: 0.97,
            duration: 320,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]);

    Animated.sequence([
      entry,
      Animated.delay(80),
      dropOff,
      Animated.delay(180),
      exit,
    ]).start(({finished}) => {
      if (finished) {
        onFinish();
      }
    });
  }, [
    hubOpacity,
    logoOpacity,
    logoScale,
    logoX,
    onFinish,
    routeOpacity,
    truckOpacity,
    truckX,
  ]);

  return (
    <View style={styles.container}>

      {/* Route / map background */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.routeLayer,
          {
            opacity: routeOpacity,
          },
        ]}>

        <Svg
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT}
          viewBox={`0 0 ${SCREEN_WIDTH} ${SCREEN_HEIGHT}`}>

          <Path
            d={`M-30 ${SCREEN_HEIGHT * 0.26}
                C ${SCREEN_WIDTH * 0.20} ${SCREEN_HEIGHT * 0.18},
                  ${SCREEN_WIDTH * 0.38} ${SCREEN_HEIGHT * 0.34},
                  ${SCREEN_WIDTH * 0.58} ${SCREEN_HEIGHT * 0.25}
                S ${SCREEN_WIDTH * 0.88} ${SCREEN_HEIGHT * 0.18},
                  ${SCREEN_WIDTH + 30} ${SCREEN_HEIGHT * 0.29}`}
            stroke="#38BDF8"
            strokeWidth="1.5"
            strokeDasharray="3 8"
            fill="none"
            opacity="0.55"
          />

          <Line
            x1="0"
            y1={SCREEN_HEIGHT * 0.73}
            x2={SCREEN_WIDTH}
            y2={SCREEN_HEIGHT * 0.73}
            stroke="#334155"
            strokeWidth="1"
            opacity="0.45"
          />

          <Line
            x1="0"
            y1={SCREEN_HEIGHT * 0.76}
            x2={SCREEN_WIDTH}
            y2={SCREEN_HEIGHT * 0.76}
            stroke="#64748B"
            strokeWidth="1"
            strokeDasharray="24 18"
            opacity="0.34"
          />

          {/* Route start */}
          <Circle
            cx={SCREEN_WIDTH * 0.18}
            cy={SCREEN_HEIGHT * 0.26}
            r="4"
            fill="#38BDF8"
            opacity="0.75"
          />

          {/* Route destination */}
          <Circle
            cx={SCREEN_WIDTH * 0.78}
            cy={SCREEN_HEIGHT * 0.24}
            r="4"
            fill="#14B8A6"
            opacity="0.75"
          />

        </Svg>
      </Animated.View>

      {/* Deployment hub */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.hub,
          {
            opacity: hubOpacity,
          },
        ]}>

        <View style={styles.hubOuter} />
        <View style={styles.hubMiddle} />
        <View style={styles.hubInner} />

      </Animated.View>

      {/* Truck */}
      <Animated.View
        style={[
          styles.truckWrapper,
          {
            opacity: truckOpacity,

            transform: [
              {
                translateX: truckX,
              },
            ],
          },
        ]}>

        <TruckArtwork />

      </Animated.View>

      {/* FleetFlow logo */}
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            opacity: logoOpacity,

            transform: [
              {
                translateX: logoX,
              },
              {
                scale: logoScale,
              },
            ],
          },
        ]}>

        <FleetFlowLogo />

      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          FLEET MANAGEMENT • OPERATIONS • CONTROL
        </Text>
      </View>

    </View>
  );
};

const FleetFlowLogo = () => {
  return (
    <View style={styles.logoRow}>

      <Svg
        width={42}
        height={42}
        viewBox="0 0 42 42">

        {/* Premium FleetFlow mark */}
        <Path
          d="M9 31 L15 11 L22 11 L18 22 L30 11 L35 11 L29 31 L22 31 L25 21 L16 31 Z"
          fill="#38BDF8"
        />

        <Path
          d="M13 24 L18 17 L28 17 L23 24 Z"
          fill="#E2E8F0"
          opacity="0.95"
        />

      </Svg>

      <View style={styles.logoTextBlock}>

        <Text style={styles.logoText}>
          Fleet
          <Text style={styles.logoAccent}>
            Flow
          </Text>
        </Text>

        <Text style={styles.logoSubtitle}>
          FLEET MANAGEMENT SOLUTIONS
        </Text>

      </View>

    </View>
  );
};

const TruckArtwork = () => {
  return (
    <Svg
      width={TRUCK_WIDTH}
      height={TRUCK_HEIGHT}
      viewBox="0 0 230 105">

      {/* Trailer */}
      <Rect
        x="5"
        y="17"
        width="135"
        height="60"
        rx="3"
        fill="#111C2B"
        stroke="#64748B"
        strokeWidth="1"
      />

      {/* Trailer upper detail */}
      <Line
        x1="13"
        y1="25"
        x2="132"
        y2="25"
        stroke="#94A3B8"
        strokeWidth="1"
        opacity="0.28"
      />

      {/* FleetFlow blue trailer stripe */}
      <Line
        x1="15"
        y1="70"
        x2="130"
        y2="70"
        stroke="#38BDF8"
        strokeWidth="2"
        opacity="0.85"
      />

      {/* Cab */}
      <Path
        d="M140 35 L167 35 L190 52 L210 52 L220 76 L220 78 L140 78 Z"
        fill="#CBD5E1"
        stroke="#94A3B8"
        strokeWidth="1.2"
      />

      {/* Cab window */}
      <Path
        d="M164 40 L181 40 L194 51 L164 51 Z"
        fill="#0F2235"
        stroke="#64748B"
        strokeWidth="1"
      />

      {/* Front window */}
      <Path
        d="M197 53 L208 53 L215 70 L197 70 Z"
        fill="#10283D"
        stroke="#64748B"
        strokeWidth="1"
      />

      {/* Front light */}
      <Rect
        x="213"
        y="72"
        width="8"
        height="5"
        rx="1"
        fill="#14B8A6"
      />

      {/* Cab accent */}
      <Rect
        x="143"
        y="74"
        width="12"
        height="4"
        rx="1"
        fill="#38BDF8"
      />

      {/* Trailer wheel */}
      <Circle
        cx="42"
        cy="81"
        r="12"
        fill="#0B1220"
        stroke="#64748B"
        strokeWidth="2"
      />

      <Circle
        cx="42"
        cy="81"
        r="5"
        fill="#94A3B8"
      />

      {/* Cab wheel */}
      <Circle
        cx="178"
        cy="81"
        r="12"
        fill="#0B1220"
        stroke="#64748B"
        strokeWidth="2"
      />

      <Circle
        cx="178"
        cy="81"
        r="5"
        fill="#94A3B8"
      />

      {/* Trailer / cab connection */}
      <Rect
        x="134"
        y="64"
        width="12"
        height="7"
        fill="#475569"
      />

      {/* Motion line */}
      <Line
        x1="0"
        y1="91"
        x2="62"
        y2="91"
        stroke="#14B8A6"
        strokeWidth="2"
        opacity="0.5"
      />

    </Svg>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    /*
     * Premium graphite/navy background
     */
    backgroundColor: '#050A12',

    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /*
   * Explicit positioning instead of
   * StyleSheet.absoluteFillObject.
   */
  routeLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  truckWrapper: {
    position: 'absolute',
    left: 0,
    top: SCREEN_HEIGHT * 0.43,
    width: TRUCK_WIDTH,
    height: TRUCK_HEIGHT,
  },

  /*
   * Explicitly centered on the screen.
   */
  logoWrapper: {
    position: 'absolute',

    left:
      SCREEN_WIDTH / 2 -
      LOGO_WIDTH / 2,

    top: SCREEN_HEIGHT * 0.38,

    width: LOGO_WIDTH,
    height: 64,

    alignItems: 'center',
    justifyContent: 'center',
  },

  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: LOGO_WIDTH,
  },

  logoTextBlock: {
    marginLeft: 6,
  },

  logoText: {
    color: '#F8FAFC',
    fontSize: 25,
    lineHeight: 28,
    fontWeight: '800',
    letterSpacing: -0.8,
  },

  logoAccent: {
    color: '#38BDF8',
  },

  logoSubtitle: {
    marginTop: 2,
    color: '#94A3B8',
    fontSize: 6.5,
    fontWeight: '700',
    letterSpacing: 0.9,
  },

  /*
   * Teal deployment / operations hub
   */
  hub: {
    position: 'absolute',

    top: SCREEN_HEIGHT * 0.68,

    left:
      SCREEN_WIDTH / 2 -
      38,

    width: 76,
    height: 22,

    alignItems: 'center',
    justifyContent: 'center',
  },

  hubOuter: {
    position: 'absolute',

    width: 76,
    height: 18,

    borderRadius: 38,
    borderWidth: 1,

    borderColor: '#14B8A6',

    opacity: 0.35,
  },

  hubMiddle: {
    position: 'absolute',

    width: 52,
    height: 12,

    borderRadius: 26,
    borderWidth: 1,

    borderColor: '#14B8A6',

    opacity: 0.55,
  },

  hubInner: {
    width: 16,
    height: 6,

    borderRadius: 8,

    backgroundColor: '#14B8A6',

    opacity: 0.8,
  },

  footer: {
    position: 'absolute',

    bottom: 34,

    left: 0,
    right: 0,

    alignItems: 'center',
  },

  footerText: {
    color: '#718096',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});

export default SplashScreen;