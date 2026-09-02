import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';

import type {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import type {
  RootStackParamList,
} from '../../navigation/AppNavigator';

import {useAuth} from '../../store';

const {
  width: SCREEN_WIDTH,
} = Dimensions.get('window');

type WelcomeBackNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    'WelcomeBack'
  >;

type WelcomeBackScreenProps = {
  email?: string;
};

const WelcomeBackScreen = ({
  email,
}: WelcomeBackScreenProps) => {
  const navigation =
    useNavigation<WelcomeBackNavigationProp>();

  const {
    completeLoginTransition,
  } = useAuth();

  const [writtenText, setWrittenText] =
    useState('');

  const welcomeOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const emailOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const terminalOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const vehiclesOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const driversOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const tripsOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const maintenanceOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const readyOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const readyScale = useRef(
    new Animated.Value(0.94),
  ).current;

  const screenOpacity = useRef(
    new Animated.Value(1),
  ).current;

  const WELCOME_TEXT =
    'Welcome back';

  useEffect(() => {
    let cancelled = false;

    const wait = (
      milliseconds: number,
    ) =>
      new Promise<void>(resolve =>
        setTimeout(
          resolve,
          milliseconds,
        ),
      );

    const writeWelcome = async () => {
      for (
        let index = 1;
        index <= WELCOME_TEXT.length;
        index += 1
      ) {
        if (cancelled) {
          return;
        }

        setWrittenText(
          WELCOME_TEXT.substring(
            0,
            index,
          ),
        );

        await wait(85);
      }
    };

    const runSequence = async () => {
      /*
       * Initial pause
       */
      await wait(180);

      if (cancelled) {
        return;
      }

      /*
       * Welcome Back
       */
      Animated.timing(
        welcomeOpacity,
        {
          toValue: 1,
          duration: 250,
          easing: Easing.out(
            Easing.quad,
          ),
          useNativeDriver: true,
        },
      ).start();

      await writeWelcome();

      if (cancelled) {
        return;
      }

      /*
       * Email
       */
      Animated.timing(
        emailOpacity,
        {
          toValue: 1,
          duration: 420,
          easing: Easing.out(
            Easing.quad,
          ),
          useNativeDriver: true,
        },
      ).start();

      await wait(380);

      if (cancelled) {
        return;
      }

      /*
       * Terminal
       */
      Animated.timing(
        terminalOpacity,
        {
          toValue: 1,
          duration: 350,
          easing: Easing.out(
            Easing.quad,
          ),
          useNativeDriver: true,
        },
      ).start();

      await wait(320);

      if (cancelled) {
        return;
      }

      /*
       * Vehicles
       */
      Animated.timing(
        vehiclesOpacity,
        {
          toValue: 1,
          duration: 260,
          easing: Easing.out(
            Easing.quad,
          ),
          useNativeDriver: true,
        },
      ).start();

      await wait(260);

      /*
       * Drivers
       */
      Animated.timing(
        driversOpacity,
        {
          toValue: 1,
          duration: 260,
          easing: Easing.out(
            Easing.quad,
          ),
          useNativeDriver: true,
        },
      ).start();

      await wait(260);

      /*
       * Trips
       */
      Animated.timing(
        tripsOpacity,
        {
          toValue: 1,
          duration: 260,
          easing: Easing.out(
            Easing.quad,
          ),
          useNativeDriver: true,
        },
      ).start();

      await wait(260);

      /*
       * Maintenance
       */
      Animated.timing(
        maintenanceOpacity,
        {
          toValue: 1,
          duration: 260,
          easing: Easing.out(
            Easing.quad,
          ),
          useNativeDriver: true,
        },
      ).start();

      await wait(360);

      if (cancelled) {
        return;
      }

      /*
       * Fleet Ready
       */
      Animated.parallel([
        Animated.timing(
          readyOpacity,
          {
            toValue: 1,
            duration: 320,
            easing: Easing.out(
              Easing.quad,
            ),
            useNativeDriver: true,
          },
        ),

        Animated.spring(
          readyScale,
          {
            toValue: 1,
            damping: 16,
            stiffness: 150,
            mass: 0.7,
            useNativeDriver: true,
          },
        ),
      ]).start();

      /*
       * Hold Fleet Ready
       */
      await wait(900);

      if (cancelled) {
        return;
      }

      /*
       * Fade out
       */
      Animated.timing(
        screenOpacity,
        {
          toValue: 0,
          duration: 420,
          easing: Easing.inOut(
            Easing.quad,
          ),
          useNativeDriver: true,
        },
      ).start(({finished}) => {
        if (
          !finished ||
          cancelled
        ) {
          return;
        }

        /*
         * Navigate first.
         *
         * This guarantees that the user
         * actually leaves WelcomeBack.
         */
        navigation.replace(
          'Dashboard',
        );

        /*
         * Then clear fresh-login state.
         */
        completeLoginTransition();
      });
    };

    runSequence();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: screenOpacity,
        },
      ]}>

      <View
        pointerEvents="none"
        style={styles.routeLayer}>

        <View
          style={styles.routeLineOne}
        />

        <View
          style={styles.routeLineTwo}
        />

        <View
          style={styles.routePointOne}
        />

        <View
          style={styles.routePointTwo}
        />

      </View>

      <View style={styles.content}>

        <View
          style={styles.brandContainer}>

          <View
            style={styles.brandMark}>

            <Text
              style={
                styles.brandMarkText
              }>
              F
            </Text>

          </View>

          <Text style={styles.brand}>
            Fleet
            <Text
              style={
                styles.brandAccent
              }>
              Flow
            </Text>
          </Text>

        </View>

        <Animated.View
          style={[
            styles.welcomeContainer,
            {
              opacity:
                welcomeOpacity,
            },
          ]}>

          <Text
            style={
              styles.welcomeText
            }>
            {writtenText}
          </Text>

          <View
            style={
              styles.signatureLine
            }
          />

        </Animated.View>

        <Animated.View
          style={[
            styles.emailContainer,
            {
              opacity:
                emailOpacity,
            },
          ]}>

          <Text style={styles.email}>
            {email ||
              'FleetFlow User'}
          </Text>

        </Animated.View>

        <Animated.View
          style={[
            styles.terminal,
            {
              opacity:
                terminalOpacity,
            },
          ]}>

          <Text
            style={
              styles.terminalTitle
            }>
            INITIALIZING FLEET
          </Text>

          <View
            style={
              styles.terminalLine
            }
          />

          <Animated.View
            style={[
              styles.systemRow,
              {
                opacity:
                  vehiclesOpacity,
              },
            ]}>

            <View
              style={
                styles.checkCircle
              }>

              <Text
                style={styles.check}>
                ✓
              </Text>

            </View>

            <Text
              style={
                styles.systemText
              }>
              Vehicles
            </Text>

            <Text
              style={styles.status}>
              ONLINE
            </Text>

          </Animated.View>

          <Animated.View
            style={[
              styles.systemRow,
              {
                opacity:
                  driversOpacity,
              },
            ]}>

            <View
              style={
                styles.checkCircle
              }>

              <Text
                style={styles.check}>
                ✓
              </Text>

            </View>

            <Text
              style={
                styles.systemText
              }>
              Drivers
            </Text>

            <Text
              style={styles.status}>
              ONLINE
            </Text>

          </Animated.View>

          <Animated.View
            style={[
              styles.systemRow,
              {
                opacity:
                  tripsOpacity,
              },
            ]}>

            <View
              style={
                styles.checkCircle
              }>

              <Text
                style={styles.check}>
                ✓
              </Text>

            </View>

            <Text
              style={
                styles.systemText
              }>
              Trips
            </Text>

            <Text
              style={styles.status}>
              ONLINE
            </Text>

          </Animated.View>

          <Animated.View
            style={[
              styles.systemRow,
              {
                opacity:
                  maintenanceOpacity,
              },
            ]}>

            <View
              style={
                styles.checkCircle
              }>

              <Text
                style={styles.check}>
                ✓
              </Text>

            </View>

            <Text
              style={
                styles.systemText
              }>
              Maintenance
            </Text>

            <Text
              style={styles.status}>
              ONLINE
            </Text>

          </Animated.View>

        </Animated.View>

        <Animated.View
          style={[
            styles.readyContainer,
            {
              opacity:
                readyOpacity,

              transform: [
                {
                  scale:
                    readyScale,
                },
              ],
            },
          ]}>

          <View
            style={styles.readyDot}
          />

          <Text
            style={styles.readyText}>
            FLEET READY
          </Text>

        </Animated.View>

      </View>

      <View style={styles.footer}>
        <Text
          style={styles.footerText}>
          FLEET OPERATIONS CONTROL
        </Text>
      </View>

    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050A12',
    alignItems: 'center',
    justifyContent: 'center',
  },

  routeLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },

  routeLineOne: {
    position: 'absolute',
    width: SCREEN_WIDTH * 1.35,
    height: 1,
    top: '28%',
    left: '-18%',
    backgroundColor: '#38BDF8',
    opacity: 0.12,
    transform: [
      {
        rotate: '-9deg',
      },
    ],
  },

  routeLineTwo: {
    position: 'absolute',
    width: SCREEN_WIDTH * 1.3,
    height: 1,
    bottom: '25%',
    left: '-14%',
    backgroundColor: '#14B8A6',
    opacity: 0.1,
    transform: [
      {
        rotate: '7deg',
      },
    ],
  },

  routePointOne: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 4,
    top: '27%',
    left: '18%',
    backgroundColor: '#38BDF8',
    opacity: 0.55,
  },

  routePointTwo: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 4,
    top: '22%',
    right: '18%',
    backgroundColor: '#14B8A6',
    opacity: 0.55,
  },

  content: {
    width: '86%',
    maxWidth: 420,
    alignItems: 'center',
  },

  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 38,
  },

  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B1827',
    borderWidth: 1,
    borderColor: '#38BDF8',
    marginRight: 10,
  },

  brandMarkText: {
    color: '#38BDF8',
    fontSize: 20,
    fontWeight: '900',
  },

  brand: {
    color: '#F8FAFC',
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.8,
  },

  brandAccent: {
    color: '#38BDF8',
  },

  welcomeContainer: {
    alignItems: 'center',
  },

  welcomeText: {
    color: '#F8FAFC',
    fontSize: 43,
    lineHeight: 52,
    fontWeight: '700',
    fontStyle: 'italic',
    letterSpacing: -1.2,
    textAlign: 'center',
    fontFamily: 'serif',
  },

  signatureLine: {
    width: 150,
    height: 2,
    marginTop: 3,
    backgroundColor: '#38BDF8',
    opacity: 0.65,
    transform: [
      {
        rotate: '-2deg',
      },
    ],
  },

  emailContainer: {
    marginTop: 13,
    marginBottom: 42,
  },

  email: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
  },

  terminal: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: '#0B1422',
    borderWidth: 1,
    borderColor: '#1E334A',
  },

  terminalTitle: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.7,
  },

  terminalLine: {
    height: 1,
    backgroundColor: '#1E334A',
    marginTop: 12,
    marginBottom: 4,
  },

  systemRow: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },

  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#123A39',
    borderWidth: 1,
    borderColor: '#14B8A6',
  },

  check: {
    color: '#14B8A6',
    fontSize: 13,
    fontWeight: '900',
  },

  systemText: {
    flex: 1,
    marginLeft: 11,
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
  },

  status: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  readyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
  },

  readyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#14B8A6',
    marginRight: 8,
  },

  readyText: {
    color: '#14B8A6',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.8,
  },

  footer: {
    position: 'absolute',
    bottom: 30,
    alignItems: 'center',
  },

  footerText: {
    color: '#475569',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});

export default WelcomeBackScreen;