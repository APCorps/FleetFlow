import React from 'react';

import {
  NavigationContainer,
} from '@react-navigation/native';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';
import WelcomeBackScreen from '../screens/auth/WelcomeBackScreen';

import MainScreenLayout from '../components/navigation/MainScreenLayout';

import AddVehicleScreen from '../screens/vehicles/AddVehicleScreen';
import VehicleDetailsScreen from '../screens/vehicles/VehicleDetailsScreen';
import EditVehicleScreen from '../screens/vehicles/EditVehicleScreen';

import AddDriverScreen from '../screens/drivers/AddDriverScreen';
import DriverDetailsScreen from '../screens/drivers/DriverDetailsScreen';
import EditDriverScreen from '../screens/drivers/EditDriverScreen';

import MaintenanceScreen from '../screens/maintenance/MaintenanceScreen';
import AddMaintenanceScreen from '../screens/maintenance/AddMaintenanceScreen';
import MaintenanceDetailsScreen from '../screens/maintenance/MaintenanceDetailsScreen';
import EditMaintenanceScreen from '../screens/maintenance/EditMaintenanceScreen';

import AddTripScreen from '../screens/trips/AddTripScreen';
import TripDetailsScreen from '../screens/trips/TripDetailsScreen';
import EditTripScreen from '../screens/trips/EditTripScreen';

import {
  useAuth,
} from '../store';

import {
  Vehicle,
  Driver,
  Maintenance,
  Trip,
} from '../types';

/*
 * ─────────────────────────────────────
 * ROOT STACK
 * ─────────────────────────────────────
 */

export type RootStackParamList = {
  Login: undefined;

  WelcomeBack: {
    email?: string;
  };

  /*
   * Persistent main application shell.
   *
   * Dashboard / Vehicles / Drivers /
   * Trips / Accounts live inside this
   * screen and are switched locally by
   * MainScreenLayout.
   */

  Main: undefined;

  /*
   * Vehicle flow
   */

  AddVehicle: undefined;

  VehicleDetails: {
    vehicle: Vehicle;
  };

  EditVehicle: {
    vehicle: Vehicle;
  };

  /*
   * Driver flow
   */

  AddDriver: undefined;

  DriverDetails: {
    driver: Driver;
  };

  EditDriver: {
    driver: Driver;
  };

  /*
   * Maintenance flow
   */

  Maintenance: undefined;

  AddMaintenance: undefined;

  MaintenanceDetails: {
    maintenance: Maintenance;
  };

  EditMaintenance: {
    maintenance: Maintenance;
  };

  /*
   * Trip flow
   */

  AddTrip: undefined;

  TripDetails: {
    trip: Trip;
  };

  EditTrip: {
    trip: Trip;
  };
};

const Stack =
  createNativeStackNavigator<
    RootStackParamList
  >();

/*
 * ─────────────────────────────────────
 * APP NAVIGATOR
 * ─────────────────────────────────────
 */

const AppNavigator = () => {
  const {
    isAuthenticated,
    isLoading,
    user,
    justLoggedIn,
  } = useAuth();

  if (isLoading) {
    return null;
  }

  /*
   * Force the correct root stack
   * whenever authentication state
   * changes.
   */

  const navigatorKey =
    !isAuthenticated
      ? 'unauthenticated'
      : justLoggedIn
      ? 'authenticated-welcome'
      : 'authenticated-main';

  const initialRouteName =
    !isAuthenticated
      ? 'Login'
      : justLoggedIn
      ? 'WelcomeBack'
      : 'Main';

  return (
    <NavigationContainer>

      <Stack.Navigator
        key={navigatorKey}
        initialRouteName={
          initialRouteName
        }
        screenOptions={{
          headerShown: false,

          /*
           * Preserve the existing
           * horizontal transition for
           * Add / Edit / Details flows.
           */

          animation:
            'slide_from_right',

          gestureEnabled: true,

          contentStyle: {
            backgroundColor:
              '#070D18',
          },
        }}>

        {/* ─────────────────────────
            AUTHENTICATION
           ───────────────────────── */}

        {!isAuthenticated ? (

          <Stack.Screen
            name="Login"
            component={LoginScreen}
          />

        ) : (

          <>

            {/* WELCOME */}

            {justLoggedIn && (
              <Stack.Screen
                name="WelcomeBack"
                component={
                  WelcomeBackScreen
                }
                initialParams={{
                  email: user?.email,
                }}
                options={{
                  animation:
                    'fade',
                }}
              />
            )}

            {/* ─────────────────────
                MAIN APPLICATION SHELL
               ───────────────────── */}

            <Stack.Screen
              name="Main"
              component={
                MainScreenLayout
              }
              options={{
                /*
                 * Absolutely no native-stack
                 * slide for the main shell.
                 *
                 * Tab transitions are handled
                 * exclusively by the animated
                 * content track inside
                 * MainScreenLayout.
                 */

                animation:
                  'none',

                gestureEnabled: false,
              }}
            />

            {/* ─────────────────────
                VEHICLE FLOW
               ───────────────────── */}

            <Stack.Screen
              name="AddVehicle"
              component={
                AddVehicleScreen
              }
            />

            <Stack.Screen
              name="VehicleDetails"
              component={
                VehicleDetailsScreen
              }
            />

            <Stack.Screen
              name="EditVehicle"
              component={
                EditVehicleScreen
              }
            />

            {/* ─────────────────────
                DRIVER FLOW
               ───────────────────── */}

            <Stack.Screen
              name="AddDriver"
              component={
                AddDriverScreen
              }
            />

            <Stack.Screen
              name="DriverDetails"
              component={
                DriverDetailsScreen
              }
            />

            <Stack.Screen
              name="EditDriver"
              component={
                EditDriverScreen
              }
            />

            {/* ─────────────────────
                MAINTENANCE FLOW
               ───────────────────── */}

            <Stack.Screen
              name="Maintenance"
              component={
                MaintenanceScreen
              }
            />

            <Stack.Screen
              name="AddMaintenance"
              component={
                AddMaintenanceScreen
              }
            />

            <Stack.Screen
              name="MaintenanceDetails"
              component={
                MaintenanceDetailsScreen
              }
            />

            <Stack.Screen
              name="EditMaintenance"
              component={
                EditMaintenanceScreen
              }
            />

            {/* ─────────────────────
                TRIP FLOW
               ───────────────────── */}

            <Stack.Screen
              name="AddTrip"
              component={
                AddTripScreen
              }
            />

            <Stack.Screen
              name="TripDetails"
              component={
                TripDetailsScreen
              }
            />

            <Stack.Screen
              name="EditTrip"
              component={
                EditTripScreen
              }
            />

          </>

        )}

      </Stack.Navigator>

    </NavigationContainer>
  );
};

export default AppNavigator;