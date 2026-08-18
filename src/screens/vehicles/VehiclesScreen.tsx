import React from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  MaterialDesignIcons,
} from '@react-native-vector-icons/material-design-icons/static';

import type {RootStackParamList} from '../../navigation/AppNavigator';

import {Button, Card} from '../../components';
import {useVehicles} from '../../store';

type VehiclesScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const VehiclesScreen = () => {
  const navigation =
    useNavigation<VehiclesScreenNavigationProp>();

  const {
    vehicles,
    deleteVehicle,
  } = useVehicles();

  const handleDeleteVehicle = (
    vehicleId: string,
    registrationNumber: string,
  ) => {
    Alert.alert(
      'Delete Vehicle',
      `Are you sure you want to delete ${registrationNumber}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteVehicle(vehicleId);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Vehicles
          </Text>

          <Text style={styles.subtitle}>
            Manage your fleet vehicles
          </Text>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {vehicles.length} vehicles
          </Text>
        </View>

        {/* Vehicles */}
        {vehicles.map(vehicle => (
          <Card key={vehicle.id}>
            {/* Vehicle Header */}
            <View style={styles.vehicleHeader}>
              <View style={styles.vehicleIdentity}>
                <Text style={styles.registration}>
                  {vehicle.registrationNumber}
                </Text>

                <Text style={styles.vehicleName}>
                  {vehicle.make} {vehicle.model}
                </Text>
              </View>

              {/* Status */}
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

            {/* Details */}
            <View style={styles.details}>
              <Text style={styles.detailText}>
                Type: {vehicle.type}
              </Text>

              <Text style={styles.detailText}>
                Year: {vehicle.year}
              </Text>

              <Text style={styles.detailText}>
                Mileage:{' '}
                {vehicle.mileage.toLocaleString()} km
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actionButtons}>

              {/* View Details */}
              <View style={styles.actionButton}>
                <Button
                  title="View Details"
                  onPress={() =>
                    navigation.navigate(
                      'VehicleDetails',
                      {
                        vehicle,
                      },
                    )
                  }
                />
              </View>

              {/* Edit Vehicle */}
              <View style={styles.actionButton}>
                <Button
                  title="Edit Vehicle"
                  onPress={() =>
                    navigation.navigate(
                      'EditVehicle',
                      {
                        vehicle,
                      },
                    )
                  }
                />
              </View>

              {/* Delete Vehicle */}
              <View
                style={
                  styles.deleteButtonWrapper
                }>
                <TouchableOpacity
                  style={styles.deleteButton}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${vehicle.registrationNumber}`}
                  onPress={() =>
                    handleDeleteVehicle(
                      vehicle.id,
                      vehicle.registrationNumber,
                    )
                  }>
                  <MaterialDesignIcons
                    name="delete"
                    size={22}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        ))}

        {/* Empty State */}
        {vehicles.length === 0 && (
          <Card>
            <View style={styles.emptyState}>
              <MaterialDesignIcons
                name="truck-outline"
                size={48}
                color="#94A3B8"
              />

              <Text style={styles.emptyTitle}>
                No vehicles
              </Text>

              <Text style={styles.emptyText}>
                Your fleet currently has no
                vehicles.
              </Text>
            </View>
          </Card>
        )}

        {/* Add Vehicle */}
        <View style={styles.addButton}>
          <Button
            title="Add Vehicle"
            onPress={() =>
              navigation.navigate(
                'AddVehicle',
              )
            }
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
    marginBottom: 16,
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

  summary: {
    marginBottom: 16,
  },

  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },

  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  vehicleIdentity: {
    flex: 1,
    paddingRight: 12,
  },

  registration: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
  },

  vehicleName: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
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

  details: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },

  detailText: {
    marginBottom: 5,
    fontSize: 13,
    color: '#64748B',
  },

  actionButtons: {
    flexDirection: 'row',
    marginHorizontal: -4,
    marginTop: 12,
  },

  actionButton: {
    flex: 1,
    paddingHorizontal: 4,
  },

  deleteButtonWrapper: {
    width: 52,
    paddingHorizontal: 4,
  },

  deleteButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addButton: {
    marginTop: 4,
    marginBottom: 20,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },

  emptyText: {
    marginTop: 6,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});

export default VehiclesScreen;