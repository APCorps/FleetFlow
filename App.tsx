import React, {useState} from 'react';

import SplashScreen from './src/screens/splash/SplashScreen';

import AppNavigator from './src/navigation/AppNavigator';

import {
  AuthProvider,
  VehicleProvider,
  DriverProvider,
  MaintenanceProvider,
  TripProvider,
  AccountsProvider,
} from './src/store';

const App = () => {
  const [showSplash, setShowSplash] =
    useState(true);

  /*
   * Keep the splash completely separate
   * from authentication/navigation.
   *
   * App startup:
   *
   * Splash
   *   ↓
   * Animation finishes
   *   ↓
   * AppNavigator
   *   ↓
   * Login / WelcomeBack / Dashboard
   */

  if (showSplash) {
    return (
      <SplashScreen
        onFinish={() =>
          setShowSplash(false)
        }
      />
    );
  }

  return (
    <AuthProvider>
      <VehicleProvider>
        <DriverProvider>
          <MaintenanceProvider>
            <TripProvider>
              <AccountsProvider>
                <AppNavigator />
              </AccountsProvider>
            </TripProvider>
          </MaintenanceProvider>
        </DriverProvider>
      </VehicleProvider>
    </AuthProvider>
  );
};

export default App;