import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';


import VehiclesScreen from '../screens/vehicles/VehiclesScreen';
import AddVehicleScreen from '../screens/vehicles/AddVehicleScreen';
import VehicleDetailsScreen from '../screens/vehicles/VehicleDetailsScreen';
import EditVehicleScreen from '../screens/vehicles/EditVehicleScreen';

import DriversScreen from '../screens/drivers/DriversScreen';
import AddDriverScreen from '../screens/drivers/AddDriverScreen';
import DriverDetailsScreen from '../screens/drivers/DriverDetailsScreen';
import EditDriverScreen from '../screens/drivers/EditDriverScreen';

import MaintenanceScreen from '../screens/maintenance/MaintenanceScreen';
import AddMaintenanceScreen from '../screens/maintenance/AddMaintenanceScreen';
import MaintenanceDetailsScreen from '../screens/maintenance/MaintenanceDetailsScreen';
import EditMaintenanceScreen from '../screens/maintenance/EditMaintenanceScreen';

import TripsScreen from '../screens/trips/TripsScreen';
import AddTripScreen from '../screens/trips/AddTripScreen';
import TripDetailsScreen from '../screens/trips/TripDetailsScreen';
import EditTripScreen from '../screens/trips/EditTripScreen';

import {useAuth} from '../store';
import {Vehicle} from '../types';
import {Driver} from '../types';
import {Maintenance} from '../types';
import {Trip} from '../types';


export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  Vehicles: undefined;
  AddVehicle: undefined;
  VehicleDetails: {
    vehicle: Vehicle;
  };
  EditVehicle: {
    vehicle: Vehicle;
  };
  Drivers: undefined;
  AddDriver: undefined;
    DriverDetails: {
    driver: Driver;
    };
    
  EditDriver: {
    driver: Driver;
  };
  Maintenance: undefined;
  AddMaintenance: undefined;
  MaintenanceDetails: {
    maintenance: Maintenance;
  };
  EditMaintenance: {
    maintenance: Maintenance;
  };
  Trips: undefined;
  AddTrip: undefined;
    TripDetails: {
    trip: Trip;
    };

    EditTrip: {
    trip: Trip;
    };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const {isAuthenticated, isLoading} = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        key={isAuthenticated ? 'authenticated' : 'unauthenticated'}
        screenOptions={{
          headerShown: false,
        }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
            />

            <Stack.Screen
              name="Vehicles"
              component={VehiclesScreen}
            />

            <Stack.Screen
              name="AddVehicle"
              component={AddVehicleScreen}
            />

            <Stack.Screen
              name="VehicleDetails"
              component={VehicleDetailsScreen}
            />
            <Stack.Screen
                name="EditVehicle"
                component={EditVehicleScreen}
            />
            <Stack.Screen
                name="Drivers"
                component={DriversScreen}
            />
            <Stack.Screen
                name="AddDriver"
                component={AddDriverScreen}
            />
            <Stack.Screen
                name="DriverDetails"
                component={DriverDetailsScreen}
            />
            <Stack.Screen
                name="EditDriver"
                component={EditDriverScreen}
            />
            <Stack.Screen
                name="Maintenance"
                component={MaintenanceScreen}
            />
            <Stack.Screen
                name="AddMaintenance"
                component={AddMaintenanceScreen}
            />
            <Stack.Screen
                name="MaintenanceDetails"
                component={MaintenanceDetailsScreen}
            />
            <Stack.Screen
                name="EditMaintenance"
                component={EditMaintenanceScreen}
            />
            <Stack.Screen
                name="Trips"
                component={TripsScreen}
            />
            <Stack.Screen
                name="AddTrip"
                component={AddTripScreen}
            />
            <Stack.Screen
                name="TripDetails"
                component={TripDetailsScreen}
            />
            <Stack.Screen
                name="EditTrip"
                component={EditTripScreen}
            />
          </>
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;