import React from 'react';
import {useRoute} from '@react-navigation/native';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {useVehicles} from '../../store';
import {Maintenance} from '../../types';

const MaintenanceDetailsScreen = () => {
  const route = useRoute();

  const {vehicles} = useVehicles();

  const {maintenance} = route.params as {
    maintenance: Maintenance;
  };

  const vehicle = vehicles.find(
    item => item.id === maintenance.vehicleId,
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Maintenance Details
          </Text>

          <Text style={styles.subtitle}>
            View maintenance record information
          </Text>
        </View>

        {/* Main Maintenance Card */}
        <View style={styles.glassCard}>
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.maintenanceTitle}>
                {maintenance.title}
              </Text>

              <Text style={styles.vehicleRegistration}>
                {vehicle?.registrationNumber ??
                  'Unknown Vehicle'}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                maintenance.status === 'Completed'
                  ? styles.completedBadge
                  : maintenance.status ===
                    'In Progress'
                  ? styles.inProgressBadge
                  : styles.scheduledBadge,
              ]}>
              <Text
                style={[
                  styles.statusText,
                  maintenance.status === 'Completed'
                    ? styles.completedText
                    : maintenance.status ===
                      'In Progress'
                    ? styles.inProgressText
                    : styles.scheduledText,
                ]}>
                {maintenance.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Maintenance Information */}
        <View style={styles.glassCard}>
          <Text style={styles.sectionTitle}>
            Maintenance Information
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
              Description
            </Text>

            <Text style={styles.detailValue}>
              {maintenance.description}
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Priority
            </Text>

            <View
              style={[
                styles.priorityBadge,
                maintenance.priority === 'High'
                  ? styles.highPriorityBadge
                  : maintenance.priority === 'Medium'
                  ? styles.mediumPriorityBadge
                  : styles.lowPriorityBadge,
              ]}>
              <Text
                style={[
                  styles.priorityText,
                  maintenance.priority === 'High'
                    ? styles.highPriorityText
                    : maintenance.priority === 'Medium'
                    ? styles.mediumPriorityText
                    : styles.lowPriorityText,
                ]}>
                {maintenance.priority}
              </Text>
            </View>
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
              {formatDate(
                maintenance.scheduledDate,
              )}
            </Text>
          </View>

          {maintenance.completedDate && (
            <>
              <View style={styles.separator} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  Completed Date
                </Text>

                <Text style={styles.detailValue}>
                  {formatDate(
                    maintenance.completedDate,
                  )}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Vehicle Metrics */}
        <View style={styles.glassCard}>
          <Text style={styles.sectionTitle}>
            Vehicle Metrics
          </Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Mileage
            </Text>

            <Text style={styles.detailValue}>
              {maintenance.mileage !== undefined
                ? `${maintenance.mileage.toLocaleString()} km`
                : 'Not provided'}
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Cost
            </Text>

            <Text style={styles.costValue}>
              {maintenance.cost !== undefined
                ? `₹${maintenance.cost.toLocaleString()}`
                : 'Not provided'}
            </Text>
          </View>
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
              {maintenance.id}
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Created
            </Text>

            <Text style={styles.detailValue}>
              {formatDate(maintenance.createdAt)}
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

  /*
   * Liquid glass card
   */
  glassCard: {
    marginBottom: 14,
    padding: 18,
    borderRadius: 18,

    backgroundColor: 'rgba(255, 255, 255, 0.88)',

    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',

    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,

    elevation: 4,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  titleContainer: {
    flex: 1,
    paddingRight: 12,
  },

  maintenanceTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },

  vehicleRegistration: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },

  /*
   * Status
   */
  statusBadge: {
    paddingHorizontal: 11,
    paddingVertical: 7,
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

  statusText: {
    fontSize: 11,
    fontWeight: '800',
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

  /*
   * Sections
   */
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

  separator: {
    height: 1,
    marginVertical: 15,
    backgroundColor: '#E2E8F0',
  },

  /*
   * Priority
   */
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 16,
  },

  highPriorityBadge: {
    backgroundColor: '#FEE2E2',
  },

  mediumPriorityBadge: {
    backgroundColor: '#FEF3C7',
  },

  lowPriorityBadge: {
    backgroundColor: '#DCFCE7',
  },

  priorityText: {
    fontSize: 12,
    fontWeight: '800',
  },

  highPriorityText: {
    color: '#991B1B',
  },

  mediumPriorityText: {
    color: '#92400E',
  },

  lowPriorityText: {
    color: '#166534',
  },

  /*
   * Cost
   */
  costValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563EB',
  },
});

export default MaintenanceDetailsScreen;