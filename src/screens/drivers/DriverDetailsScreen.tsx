import React from 'react';
import {useRoute} from '@react-navigation/native';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {Driver} from '../../types';

const DriverDetailsScreen = () => {
  const route = useRoute();

  const {driver} = route.params as {
    driver: Driver;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const getStatusBadgeStyle = () => {
    switch (driver.status) {
      case 'Active':
        return styles.activeBadge;

      case 'On Leave':
        return styles.leaveBadge;

      default:
        return styles.inactiveBadge;
    }
  };

  const getStatusTextStyle = () => {
    switch (driver.status) {
      case 'Active':
        return styles.activeText;

      case 'On Leave':
        return styles.leaveText;

      default:
        return styles.inactiveText;
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
            Driver Details
          </Text>

          <Text style={styles.subtitle}>
            View driver information
          </Text>
        </View>

        {/* Driver Summary */}
        <View style={styles.glassCard}>
          <View style={styles.driverHeader}>
            <View style={styles.identity}>
              <Text style={styles.driverName}>
                {driver.name}
              </Text>

              <Text style={styles.employeeId}>
                {driver.employeeId}
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
                {driver.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.glassCard}>
          <Text style={styles.sectionTitle}>
            Contact Information
          </Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Phone
            </Text>

            <Text style={styles.detailValue}>
              {driver.phone}
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Employee ID
            </Text>

            <Text style={styles.detailValue}>
              {driver.employeeId}
            </Text>
          </View>
        </View>

        {/* License Information */}
        <View style={styles.glassCard}>
          <Text style={styles.sectionTitle}>
            License Information
          </Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              License Number
            </Text>

            <Text style={styles.detailValue}>
              {driver.licenseNumber}
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              License Expiry
            </Text>

            <Text style={styles.detailValue}>
              {formatDate(
                driver.licenseExpiry,
              )}
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
              {driver.id}
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

  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  identity: {
    flex: 1,
    paddingRight: 12,
  },

  driverName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },

  employeeId: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },

  statusBadge: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
  },

  activeBadge: {
    backgroundColor: '#DCFCE7',
  },

  leaveBadge: {
    backgroundColor: '#FEE2E2',
  },

  inactiveBadge: {
    backgroundColor: '#FEF3C7',
  },

  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },

  activeText: {
    color: '#166534',
  },

  leaveText: {
    color: '#991B1B',
  },

  inactiveText: {
    color: '#92400E',
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

  separator: {
    height: 1,
    marginVertical: 15,
    backgroundColor: '#E2E8F0',
  },
});

export default DriverDetailsScreen;