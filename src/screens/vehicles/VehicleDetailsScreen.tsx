import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {Button, Card} from '../../components';
import {Vehicle} from '../../types';

interface VehicleDetailsScreenProps {
  route: {
    params: {
      vehicle: Vehicle;
    };
  };
  navigation: {
    goBack: () => void;
  };
}

const VehicleDetailsScreen = ({
  route,
  navigation,
}: VehicleDetailsScreenProps) => {
  const {vehicle} = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Vehicle Details</Text>

          <Text style={styles.subtitle}>
            Complete vehicle information
          </Text>
        </View>

        <Card>
          <View style={styles.vehicleHeader}>
            <View>
              <Text style={styles.registration}>
                {vehicle.registrationNumber}
              </Text>

              <Text style={styles.vehicleName}>
                {vehicle.make} {vehicle.model}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                vehicle.status === 'Active'
                  ? styles.activeBadge
                  : styles.maintenanceBadge,
              ]}>
              <Text
                style={[
                  styles.statusText,
                  vehicle.status === 'Active'
                    ? styles.activeText
                    : styles.maintenanceText,
                ]}>
                {vehicle.status}
              </Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Vehicle Information</Text>

        <Card>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Registration Number
            </Text>

            <Text style={styles.detailValue}>
              {vehicle.registrationNumber}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Make</Text>

            <Text style={styles.detailValue}>
              {vehicle.make}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Model</Text>

            <Text style={styles.detailValue}>
              {vehicle.model}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Year</Text>

            <Text style={styles.detailValue}>
              {vehicle.year}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type</Text>

            <Text style={styles.detailValue}>
              {vehicle.type}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mileage</Text>

            <Text style={styles.detailValue}>
              {vehicle.mileage.toLocaleString()} km
            </Text>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Record Information</Text>

        <Card>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Vehicle ID
            </Text>

            <Text style={styles.detailValue}>
              {vehicle.id}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Created
            </Text>

            <Text style={styles.detailValue}>
              {new Date(vehicle.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </Card>

        <View style={styles.backButton}>
          <Button
            title="Back to Vehicles"
            onPress={() => navigation.goBack()}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  header: {
    marginBottom: 24,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0F172A',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: '#64748B',
  },

  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  registration: {
    fontSize: 24,
    fontWeight: '800',
    color: '#bbb6b7',
  },

  vehicleName: {
    marginTop: 5,
    fontSize: 17,
    fontWeight: '600',
    color: '#e2dca1',
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  activeBadge: {
    backgroundColor: '#DCFCE7',
  },

  maintenanceBadge: {
    backgroundColor: '#FEF3C7',
  },

  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },

  activeText: {
    color: '#166534',
  },

  maintenanceText: {
    color: '#92400E',
  },

  sectionTitle: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },

  detailLabel: {
    flex: 1,
    fontSize: 14,
    color: '#7ecbdf',
  },

  detailValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#21f793',
    textAlign: 'right',
  },

  backButton: {
    marginTop: 24,
    marginBottom: 20,
  },
});

export default VehicleDetailsScreen;
