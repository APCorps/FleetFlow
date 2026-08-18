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

import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';

import type {RootStackParamList} from '../../navigation/AppNavigator';

import {Button, Card} from '../../components';
import {
  useDrivers,
  useTrips,
  useVehicles,
} from '../../store';

type TripsScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const TripsScreen = () => {
  const navigation =
    useNavigation<TripsScreenNavigationProp>();

  const {
    trips,
    deleteTrip,
  } = useTrips();

  const {vehicles} = useVehicles();
  const {drivers} = useDrivers();

  const getVehicleRegistration = (
    vehicleId: string,
  ) => {
    const vehicle = vehicles.find(
      item => item.id === vehicleId,
    );

    return (
      vehicle?.registrationNumber ??
      'Unknown Vehicle'
    );
  };

  const getDriverName = (
    driverId: string,
  ) => {
    const driver = drivers.find(
      item => item.id === driverId,
    );

    return (
      driver?.name ??
      'Unknown Driver'
    );
  };

  const handleDeleteTrip = (
    tripId: string,
    route: string,
  ) => {
    Alert.alert(
      'Delete Trip',
      `Are you sure you want to delete "${route}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteTrip(tripId);
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

        <View style={styles.header}>
          <Text style={styles.title}>
            Trips
          </Text>

          <Text style={styles.subtitle}>
            Manage your fleet trips
          </Text>
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {trips.length} trips
          </Text>
        </View>

        {trips.map(trip => (
          <Card key={trip.id}>
            <View style={styles.tripHeader}>
              <View style={styles.tripIdentity}>
                <Text style={styles.route}>
                  {trip.origin} → {trip.destination}
                </Text>

                <Text style={styles.tripDate}>
                  {new Date(
                    trip.scheduledDate,
                  ).toLocaleDateString()}
                </Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  trip.status === 'Completed'
                    ? styles.completedBadge
                    : trip.status ===
                      'In Progress'
                    ? styles.inProgressBadge
                    : trip.status ===
                      'Cancelled'
                    ? styles.cancelledBadge
                    : styles.scheduledBadge,
                ]}>
                <Text
                  style={[
                    styles.statusText,
                    trip.status === 'Completed'
                      ? styles.completedText
                      : trip.status ===
                        'In Progress'
                      ? styles.inProgressText
                      : trip.status ===
                        'Cancelled'
                      ? styles.cancelledText
                      : styles.scheduledText,
                  ]}>
                  {trip.status}
                </Text>
              </View>
            </View>

            <View style={styles.details}>
              <Text style={styles.detailText}>
                Vehicle:{' '}
                {getVehicleRegistration(
                  trip.vehicleId,
                )}
              </Text>

              <Text style={styles.detailText}>
                Driver:{' '}
                {getDriverName(
                  trip.driverId,
                )}
              </Text>

              {trip.distance !== undefined && (
                <Text style={styles.detailText}>
                  Distance:{' '}
                  {trip.distance.toLocaleString()} km
                </Text>
              )}
            </View>

            {trip.notes && (
              <Text style={styles.notes}>
                {trip.notes}
              </Text>
            )}

            <View style={styles.actionButtons}>
              <View style={styles.actionButton}>
                <Button
                  title="View Details"
                  onPress={() =>
                    navigation.navigate(
                      'TripDetails',
                      {
                        trip,
                      },
                    )
                  }
                />
              </View>

              <View style={styles.actionButton}>
                <Button
                  title="Edit Trip"
                  onPress={() =>
                    navigation.navigate(
                      'EditTrip',
                      {
                        trip,
                      },
                    )
                  }
                />
              </View>

              <View
                style={
                  styles.deleteButtonWrapper
                }>
                <TouchableOpacity
                  style={styles.deleteButton}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${trip.origin} to ${trip.destination} trip`}
                  onPress={() =>
                    handleDeleteTrip(
                      trip.id,
                      `${trip.origin} → ${trip.destination}`,
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

        {trips.length === 0 && (
          <Card>
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                No trips
              </Text>

              <Text style={styles.emptyText}>
                Your fleet currently has no trips.
              </Text>
            </View>
          </Card>
        )}

        <View style={styles.addButton}>
          <Button
            title="Add Trip"
            onPress={() =>
              navigation.navigate(
                'AddTrip',
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

  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  tripIdentity: {
    flex: 1,
    paddingRight: 12,
  },

  route: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },

  tripDate: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  completedBadge: {
    backgroundColor: '#DCFCE7',
  },

  inProgressBadge: {
    backgroundColor: '#DBEAFE',
  },

  scheduledBadge: {
    backgroundColor: '#FEF3C7',
  },

  cancelledBadge: {
    backgroundColor: '#FEE2E2',
  },

  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },

  completedText: {
    color: '#166534',
  },

  inProgressText: {
    color: '#1D4ED8',
  },

  scheduledText: {
    color: '#92400E',
  },

  cancelledText: {
    color: '#991B1B',
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

  notes: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
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

export default TripsScreen;