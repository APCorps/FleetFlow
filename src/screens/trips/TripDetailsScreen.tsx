import React from 'react';
import {useRoute} from '@react-navigation/native';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {useDrivers, useVehicles} from '../../store';
import {Trip} from '../../types';

const TripDetailsScreen = () => {
  const route = useRoute();

  const {vehicles} = useVehicles();
  const {drivers} = useDrivers();

  const {trip} = route.params as {
    trip: Trip;
  };

  const vehicle = vehicles.find(
    item => item.id === trip.vehicleId,
  );

  const driver = drivers.find(
    item => item.id === trip.driverId,
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const getStatusBadgeStyle = () => {
    switch (trip.status) {
      case 'Completed':
        return styles.completedBadge;

      case 'In Progress':
        return styles.inProgressBadge;

      case 'Cancelled':
        return styles.cancelledBadge;

      default:
        return styles.scheduledBadge;
    }
  };

  const getStatusTextStyle = () => {
    switch (trip.status) {
      case 'Completed':
        return styles.completedText;

      case 'In Progress':
        return styles.inProgressText;

      case 'Cancelled':
        return styles.cancelledText;

      default:
        return styles.scheduledText;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Trip Details
          </Text>

          <Text style={styles.subtitle}>
            View trip information
          </Text>
        </View>

        {/* Main Trip Card */}
        <View style={styles.glassCard}>
          <View style={styles.routeRow}>
            <View style={styles.routeContainer}>
              <Text style={styles.route}>
                {trip.origin}
              </Text>

              <Text style={styles.routeArrow}>
                →
              </Text>

              <Text style={styles.route}>
                {trip.destination}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                getStatusBadgeStyle(),
              ]}>
              <Text
                style={[
                  styles.statusText,
                  getStatusTextStyle(),
                ]}>
                {trip.status}
              </Text>
            </View>
          </View>

          <View style={styles.routeLine} />

          <Text style={styles.scheduledDate}>
            Scheduled:{' '}
            {formatDate(trip.scheduledDate)}
          </Text>
        </View>

        {/* Assignment */}
        <View style={styles.glassCard}>
          <Text style={styles.sectionTitle}>
            Trip Assignment
          </Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Vehicle
            </Text>

            <Text style={styles.detailValue}>
              {vehicle
                ? `${vehicle.registrationNumber} - ${vehicle.make} ${vehicle.model}`
                : 'Unknown Vehicle'}
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Driver
            </Text>

            <Text style={styles.detailValue}>
              {driver
                ? `${driver.name} (${driver.employeeId})`
                : 'Unknown Driver'}
            </Text>
          </View>
        </View>

        {/* Schedule */}
        <View style={styles.glassCard}>
          <Text style={styles.sectionTitle}>
            Schedule
          </Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Scheduled Date
            </Text>

            <Text style={styles.detailValue}>
              {formatDate(trip.scheduledDate)}
            </Text>
          </View>

          {trip.startTime && (
            <>
              <View style={styles.separator} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  Start Time
                </Text>

                <Text style={styles.detailValue}>
                  {trip.startTime}
                </Text>
              </View>
            </>
          )}

          {trip.endTime && (
            <>
              <View style={styles.separator} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  End Time
                </Text>

                <Text style={styles.detailValue}>
                  {trip.endTime}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Trip Information */}
        <View style={styles.glassCard}>
          <Text style={styles.sectionTitle}>
            Trip Information
          </Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Distance
            </Text>

            <Text style={styles.distanceValue}>
              {trip.distance !== undefined
                ? `${trip.distance.toLocaleString()} km`
                : 'Not provided'}
            </Text>
          </View>

          {trip.notes && (
            <>
              <View style={styles.separator} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  Notes
                </Text>

                <Text style={styles.detailValue}>
                  {trip.notes}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Record Information */}
        <View style={styles.glassCard}>
          <Text style={styles.sectionTitle}>
            Record Information
          </Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Record ID
            </Text>

            <Text style={styles.detailValueSmall}>
              {trip.id}
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Created
            </Text>

            <Text style={styles.detailValue}>
              {formatDate(trip.createdAt)}
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF4FA',
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0F172A',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#64748B',
  },

  glassCard: {
    marginBottom: 14,
    padding: 18,
    borderRadius: 18,
    backgroundColor:
      'rgba(255, 255, 255, 0.88)',
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.95)',
    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },

  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  routeContainer: {
    flex: 1,
    paddingRight: 12,
  },

  route: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },

  routeArrow: {
    marginVertical: 4,
    fontSize: 18,
    fontWeight: '700',
    color: '#2563EB',
  },

  statusBadge: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
  },

  scheduledBadge: {
    backgroundColor: '#FEF3C7',
  },

  inProgressBadge: {
    backgroundColor: '#DBEAFE',
  },

  completedBadge: {
    backgroundColor: '#DCFCE7',
  },

  cancelledBadge: {
    backgroundColor: '#FEE2E2',
  },

  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },

  scheduledText: {
    color: '#92400E',
  },

  inProgressText: {
    color: '#1D4ED8',
  },

  completedText: {
    color: '#166534',
  },

  cancelledText: {
    color: '#991B1B',
  },

  routeLine: {
    height: 1,
    marginTop: 16,
    marginBottom: 12,
    backgroundColor: '#E2E8F0',
  },

  scheduledDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },

  sectionTitle: {
    marginBottom: 18,
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },

  detailRow: {
    marginBottom: 2,
  },

  detailLabel: {
    marginBottom: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  detailValue: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
    color: '#0F172A',
  },

  detailValueSmall: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
    color: '#334155',
  },

  distanceValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563EB',
  },

  separator: {
    height: 1,
    marginVertical: 15,
    backgroundColor: '#E2E8F0',
  },
});

export default TripDetailsScreen;