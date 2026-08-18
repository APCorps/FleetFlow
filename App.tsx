import React from 'react';

import AppNavigator from './src/navigation/AppNavigator';

import {
  AuthProvider,
  VehicleProvider,
  DriverProvider,
  MaintenanceProvider,
  TripProvider,
} from './src/store';

const App = () => {
  return (
    <AuthProvider>
      <VehicleProvider>
        <DriverProvider>
          <MaintenanceProvider>
            <TripProvider>
              <AppNavigator />
            </TripProvider>
          </MaintenanceProvider>
        </DriverProvider>
      </VehicleProvider>
    </AuthProvider>
  );
};

export default App;