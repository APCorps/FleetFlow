import React from 'react';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import type {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {
  MaterialDesignIcons,
} from '@react-native-vector-icons/material-design-icons/static';

import type {
  RootStackParamList,
} from '../../navigation/AppNavigator';

import {Driver} from '../../types';

type DriverDetailsNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;

const DRIVER_TEAL = '#00D6C9';

const DriverDetailsScreen = () => {
  const insets = useSafeAreaInsets();

  const navigation =
    useNavigation<DriverDetailsNavigationProp>();

  const route = useRoute();

  const {driver} = route.params as {
    driver: Driver;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = () => {
    switch (driver.status) {
      case 'Active':
        return '#00D6C9';

      case 'On Leave':
        return '#EF4444';

      default:
        return '#F59E0B';
    }
  };

  const statusColor = getStatusColor();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.safeAreaTop,
          {
            height: insets.top,
          },
        ]}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              Math.max(insets.bottom, 20) + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}>

        {/* HEADER */}

        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
            style={({pressed}) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}>
            <MaterialDesignIcons
              name="arrow-left"
              size={20}
              color="#F5F7FF"
            />
          </Pressable>

          <View style={styles.headerText}>
            <View style={styles.eyebrowRow}>
              <View style={styles.headerIcon}>
                <MaterialDesignIcons
                  name="account-hard-hat-outline"
                  size={18}
                  color={DRIVER_TEAL}
                />
              </View>

              <Text style={styles.eyebrow}>
                DRIVER
              </Text>
            </View>

            <Text style={styles.title}>
              Driver Details
            </Text>

            <Text style={styles.subtitle}>
              View driver information
            </Text>
          </View>
        </View>

        {/* DRIVER SUMMARY */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <MaterialDesignIcons
              name="account-outline"
              size={25}
              color={statusColor}
            />
          </View>

          <View style={styles.identity}>
            <Text
              style={styles.driverName}
              numberOfLines={1}>
              {driver.name}
            </Text>

            <Text style={styles.employeeId}>
              {driver.employeeId}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  `${statusColor}14`,
                borderColor:
                  `${statusColor}28`,
              },
            ]}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    statusColor,
                },
              ]}
            />

            <Text
              style={[
                styles.statusText,
                {
                  color: statusColor,
                },
              ]}>
              {driver.status}
            </Text>
          </View>
        </View>

        {/* CONTACT INFORMATION */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Contact Information
          </Text>

          <Text style={styles.sectionSubtitle}>
            Primary contact details for this driver.
          </Text>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MaterialDesignIcons
                name="phone-outline"
                size={18}
                color={DRIVER_TEAL}
              />
            </View>

            <View style={styles.detailTextBlock}>
              <Text style={styles.detailLabel}>
                Phone
              </Text>

              <Text style={styles.detailValue}>
                {driver.phone}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MaterialDesignIcons
                name="badge-account-outline"
                size={18}
                color={DRIVER_TEAL}
              />
            </View>

            <View style={styles.detailTextBlock}>
              <Text style={styles.detailLabel}>
                Employee ID
              </Text>

              <Text style={styles.detailValue}>
                {driver.employeeId}
              </Text>
            </View>
          </View>
        </View>

        {/* LICENSE INFORMATION */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            License Information
          </Text>

          <Text style={styles.sectionSubtitle}>
            Licensing details associated with the driver.
          </Text>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MaterialDesignIcons
                name="card-account-details-outline"
                size={18}
                color={DRIVER_TEAL}
              />
            </View>

            <View style={styles.detailTextBlock}>
              <Text style={styles.detailLabel}>
                License Number
              </Text>

              <Text style={styles.detailValue}>
                {driver.licenseNumber}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MaterialDesignIcons
                name="calendar-clock-outline"
                size={18}
                color={DRIVER_TEAL}
              />
            </View>

            <View style={styles.detailTextBlock}>
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
        </View>

        {/* RECORD INFORMATION */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Record Information
          </Text>

          <Text style={styles.sectionSubtitle}>
            System information for this driver record.
          </Text>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MaterialDesignIcons
                name="identifier"
                size={18}
                color={DRIVER_TEAL}
              />
            </View>

            <View style={styles.detailTextBlock}>
              <Text style={styles.detailLabel}>
                Record ID
              </Text>

              <Text
                style={styles.detailValueSmall}
                selectable>
                {driver.id}
              </Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050711',
  },

  safeAreaTop: {
    backgroundColor: '#050711',
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
  },

  pressed: {
    opacity: 0.78,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    marginRight: 12,
    marginTop: 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10182B',
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.08)',
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  headerIcon: {
    width: 30,
    height: 30,
    marginRight: 8,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(0, 214, 201, 0.10)',
    borderWidth: 1,
    borderColor:
      'rgba(0, 214, 201, 0.18)',
  },

  eyebrow: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: '#6F7892',
  },

  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: '#F5F7FF',
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: '#9AA4BF',
  },

  summaryCard: {
    minHeight: 82,
    marginBottom: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor:
      'rgba(18, 24, 46, 0.84)',
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.08)',
  },

  summaryIcon: {
    width: 46,
    height: 46,
    marginRight: 11,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(0, 214, 201, 0.10)',
    borderWidth: 1,
    borderColor:
      'rgba(0, 214, 201, 0.20)',
  },

  identity: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },

  driverName: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '800',
    color: '#F5F7FF',
  },

  employeeId: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
    color: DRIVER_TEAL,
  },

  statusBadge: {
    maxWidth: 105,
    paddingHorizontal: 9,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
  },

  statusDot: {
    width: 6,
    height: 6,
    marginRight: 6,
    borderRadius: 3,
  },

  statusText: {
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '800',
  },

  sectionHeader: {
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
    color: '#F5F7FF',
  },

  sectionSubtitle: {
    marginTop: 4,
    marginBottom: 8,
    fontSize: 12,
    lineHeight: 17,
    color: '#6F7892',
  },

  detailCard: {
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: '#0B1423',
    borderWidth: 1,
    borderColor: '#16263B',
  },

  detailRow: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailIcon: {
    width: 38,
    height: 38,
    marginRight: 11,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(0, 214, 201, 0.08)',
    borderWidth: 1,
    borderColor:
      'rgba(0, 214, 201, 0.14)',
  },

  detailTextBlock: {
    flex: 1,
    minWidth: 0,
  },

  detailLabel: {
    marginBottom: 3,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '600',
    color: '#6F7892',
  },

  detailValue: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#CBD3E6',
  },

  detailValueSmall: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    color: '#9AA4BF',
  },

  separator: {
    height: 1,
    backgroundColor:
      'rgba(255, 255, 255, 0.06)',
  },
});

export default DriverDetailsScreen;
