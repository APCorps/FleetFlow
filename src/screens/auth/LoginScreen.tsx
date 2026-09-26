import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Svg, {
  Circle,
  Line,
  Path,
} from 'react-native-svg';

import {
  Button,
  Card,
  Input,
} from '../../components';

import {useAuth} from '../../store';

const {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
} = Dimensions.get('window');

const LoginScreen = () => {
  const {login} = useAuth();

  // Stores the username entered by the FleetFlow user.
  const [username, setUsername] =
    useState('');

  const [password, setPassword] =
    useState('');

  /*
   * ─────────────────────────────
   * ANIMATION VALUES
   * ─────────────────────────────
   */

  const routeOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const routeProgress = useRef(
    new Animated.Value(0),
  ).current;

  const logoOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const logoScale = useRef(
    new Animated.Value(0.94),
  ).current;

  const headingOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const headingTranslateY = useRef(
    new Animated.Value(14),
  ).current;

  const cardOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const cardTranslateY = useRef(
    new Animated.Value(28),
  ).current;

  const footerOpacity = useRef(
    new Animated.Value(0),
  ).current;

  /*
   * ─────────────────────────────
   * LOGIN SCREEN ENTRY
   * ─────────────────────────────
   */

  useEffect(() => {
    Animated.sequence([
      /*
       * Route environment appears first.
       */
      Animated.timing(
        routeOpacity,
        {
          toValue: 1,
          duration: 500,
          easing: Easing.out(
            Easing.quad,
          ),
          useNativeDriver: true,
        },
      ),

      /*
       * Route draws across screen.
       */
      Animated.timing(
        routeProgress,
        {
          toValue: 1,
          duration: 850,
          easing: Easing.out(
            Easing.cubic,
          ),
          useNativeDriver: true,
        },
      ),

      /*
       * FleetFlow branding.
       */
      Animated.parallel([
        Animated.timing(
          logoOpacity,
          {
            toValue: 1,
            duration: 450,
            easing: Easing.out(
              Easing.quad,
            ),
            useNativeDriver: true,
          },
        ),

        Animated.spring(
          logoScale,
          {
            toValue: 1,
            damping: 18,
            stiffness: 140,
            mass: 0.7,
            useNativeDriver: true,
          },
        ),
      ]),

      Animated.delay(120),

      /*
       * Welcome heading.
       */
      Animated.parallel([
        Animated.timing(
          headingOpacity,
          {
            toValue: 1,
            duration: 400,
            easing: Easing.out(
              Easing.quad,
            ),
            useNativeDriver: true,
          },
        ),

        Animated.timing(
          headingTranslateY,
          {
            toValue: 0,
            duration: 400,
            easing: Easing.out(
              Easing.cubic,
            ),
            useNativeDriver: true,
          },
        ),
      ]),

      Animated.delay(100),

      /*
       * Login panel.
       */
      Animated.parallel([
        Animated.timing(
          cardOpacity,
          {
            toValue: 1,
            duration: 500,
            easing: Easing.out(
              Easing.quad,
            ),
            useNativeDriver: true,
          },
        ),

        Animated.timing(
          cardTranslateY,
          {
            toValue: 0,
            duration: 550,
            easing: Easing.out(
              Easing.cubic,
            ),
            useNativeDriver: true,
          },
        ),
      ]),

      /*
       * Footer.
       */
      Animated.timing(
        footerOpacity,
        {
          toValue: 1,
          duration: 350,
          easing: Easing.out(
            Easing.quad,
          ),
          useNativeDriver: true,
        },
      ),
    ]).start();
  }, []);

  /*
  * ─────────────────────────────
  * LOGIN
  * ─────────────────────────────
  */

  // Sends the entered username and password to the FastAPI authentication endpoint.
  const handleLogin = async () => {
    if (
      !username.trim() ||
      !password.trim()
    ) {
      Alert.alert(
        'Missing Information',
        'Please enter your username and password.',
      );

      return;
    }

    try {
      await login(
        username.trim(),
        password,
      );
    } catch (error) {
      // Shows the actual backend or network error so we can identify the login problem.
      console.error('Login failed:', error);

      const message =
        error instanceof Error
          ? error.message
          : 'Unknown login error';

      Alert.alert(
        'Login Error',
        message,
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }>

      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }>

        {/* ─────────────────────
            ROUTE BACKGROUND
        ───────────────────── */}

        <Animated.View
          pointerEvents="none"
          style={[
            styles.routeLayer,
            {
              opacity:
                routeOpacity,
            },
          ]}>

          <Svg
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            viewBox={`0 0 ${SCREEN_WIDTH} ${SCREEN_HEIGHT}`}>

            {/* Main logistics route */}

            <Path
              d={`
                M-40 ${SCREEN_HEIGHT * 0.23}
                C
                ${SCREEN_WIDTH * 0.18}
                ${SCREEN_HEIGHT * 0.14},
                ${SCREEN_WIDTH * 0.35}
                ${SCREEN_HEIGHT * 0.32},
                ${SCREEN_WIDTH * 0.54}
                ${SCREEN_HEIGHT * 0.22}

                S
                ${SCREEN_WIDTH * 0.86}
                ${SCREEN_HEIGHT * 0.14},
                ${SCREEN_WIDTH + 40}
                ${SCREEN_HEIGHT * 0.25}
              `}
              stroke="#38BDF8"
              strokeWidth="1.5"
              strokeDasharray="3 8"
              fill="none"
              opacity="0.48"
            />

            {/* Secondary route */}

            <Path
              d={`
                M-30 ${SCREEN_HEIGHT * 0.78}
                C
                ${SCREEN_WIDTH * 0.20}
                ${SCREEN_HEIGHT * 0.70},
                ${SCREEN_WIDTH * 0.42}
                ${SCREEN_HEIGHT * 0.84},
                ${SCREEN_WIDTH * 0.64}
                ${SCREEN_HEIGHT * 0.74}

                S
                ${SCREEN_WIDTH * 0.88}
                ${SCREEN_HEIGHT * 0.70},
                ${SCREEN_WIDTH + 30}
                ${SCREEN_HEIGHT * 0.77}
              `}
              stroke="#14B8A6"
              strokeWidth="1"
              strokeDasharray="2 10"
              fill="none"
              opacity="0.25"
            />

            {/* Road lines */}

            <Line
              x1="0"
              y1={SCREEN_HEIGHT * 0.88}
              x2={SCREEN_WIDTH}
              y2={SCREEN_HEIGHT * 0.88}
              stroke="#334155"
              strokeWidth="1"
              opacity="0.3"
            />

            <Line
              x1="0"
              y1={SCREEN_HEIGHT * 0.91}
              x2={SCREEN_WIDTH}
              y2={SCREEN_HEIGHT * 0.91}
              stroke="#64748B"
              strokeWidth="1"
              strokeDasharray="22 18"
              opacity="0.22"
            />

            {/* Route start */}

            <Circle
              cx={SCREEN_WIDTH * 0.16}
              cy={SCREEN_HEIGHT * 0.22}
              r="4"
              fill="#38BDF8"
              opacity="0.7"
            />

            {/* Route destination */}

            <Circle
              cx={SCREEN_WIDTH * 0.82}
              cy={SCREEN_HEIGHT * 0.21}
              r="4"
              fill="#14B8A6"
              opacity="0.7"
            />

            {/* Operational point */}

            <Circle
              cx={SCREEN_WIDTH * 0.72}
              cy={SCREEN_HEIGHT * 0.76}
              r="3"
              fill="#38BDF8"
              opacity="0.45"
            />

          </Svg>

        </Animated.View>

        {/* ─────────────────────
            CONTENT
        ───────────────────── */}

        <View style={styles.content}>

          {/* BRAND */}

          <Animated.View
            style={[
              styles.brandContainer,
              {
                opacity:
                  logoOpacity,

                transform: [
                  {
                    scale:
                      logoScale,
                  },
                ],
              },
            ]}>

            <View
              style={styles.brandMark}>

              <Text
                style={
                  styles.brandMarkText
                }>
                F
              </Text>

            </View>

            <View>
              <Text
                style={styles.brand}>
                Fleet
                <Text
                  style={
                    styles.brandAccent
                  }>
                  Flow
                </Text>
              </Text>

              <Text
                style={
                  styles.brandSubtitle
                }>
                FLEET MANAGEMENT SOLUTIONS
              </Text>
            </View>

          </Animated.View>

          {/* HEADING */}

          <Animated.View
            style={[
              styles.headingContainer,
              {
                opacity:
                  headingOpacity,

                transform: [
                  {
                    translateY:
                      headingTranslateY,
                  },
                ],
              },
            ]}>

            <Text
              style={styles.title}>
              Welcome Aboard
            </Text>

            <Text
              style={
                styles.subtitle
              }>
              Sign in to manage your fleet
              operations
            </Text>

          </Animated.View>

          {/* LOGIN CARD */}

          <Animated.View
            style={[
              styles.cardWrapper,
              {
                opacity:
                  cardOpacity,

                transform: [
                  {
                    translateY:
                      cardTranslateY,
                  },
                ],
              },
            ]}>

            <Card elevated>

              <View
                style={
                  styles.cardHeader
                }>

                <View
                  style={
                    styles.statusDot
                  }
                />

                <Text
                  style={
                    styles.statusText
                  }>
                  OPERATIONS ACCESS
                </Text>

              </View>

              {/* Collects the username used by the FastAPI authentication endpoint. */}
              <Input
                label="Username"
                placeholder="Enter your username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <View
                style={
                  styles.buttonWrapper
                }>

                <Button
                  title="Login"
                  onPress={
                    handleLogin
                  }
                />

              </View>

            </Card>

          </Animated.View>

          {/* SECURITY / STATUS */}

          <Animated.View
            style={[
              styles.footer,
              {
                opacity:
                  footerOpacity,
              },
            ]}>

            <View
              style={
                styles.footerStatus
              }>

              <View
                style={
                  styles.footerDot
                }
              />

              <Text
                style={
                  styles.footerStatusText
                }>
                FLEET SYSTEM READY
              </Text>

            </View>

            <Text
              style={
                styles.footerText
              }>
              FLEET OPERATIONS • LOGISTICS • CONTROL
            </Text>

          </Animated.View>

        </View>

      </ScrollView>

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050A12',
  },

  scrollContent: {
    flexGrow: 1,
    minHeight: SCREEN_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  routeLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  content: {
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    alignItems: 'center',
  },

  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 34,
  },

  brandMark: {
    width: 42,
    height: 42,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B1827',
    borderWidth: 1,
    borderColor: '#38BDF8',
    marginRight: 11,
  },

  brandMarkText: {
    color: '#38BDF8',
    fontSize: 23,
    fontWeight: '900',
  },

  brand: {
    color: '#F8FAFC',
    fontSize: 27,
    lineHeight: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
  },

  brandAccent: {
    color: '#38BDF8',
  },

  brandSubtitle: {
    marginTop: 2,
    color: '#64748B',
    fontSize: 6.5,
    fontWeight: '800',
    letterSpacing: 1.15,
  },

  headingContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },

  title: {
    color: '#F8FAFC',
    fontSize: 31,
    lineHeight: 37,
    fontWeight: '700',
    letterSpacing: -0.6,
  },

  subtitle: {
    marginTop: 7,
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },

  cardWrapper: {
    width: '100%',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#14B8A6',
    marginRight: 8,
  },

  statusText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
  },

  buttonWrapper: {
    marginTop: 4,
  },

  footer: {
    alignItems: 'center',
    marginTop: 25,
  },

  footerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  footerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#14B8A6',
    marginRight: 7,
  },

  footerStatusText: {
    color: '#14B8A6',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
  },

  footerText: {
    color: '#475569',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
});

export default LoginScreen;