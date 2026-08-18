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
import {useDrivers} from '../../store';

type DriversScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const DriversScreen = () => {
  const navigation =
    useNavigation<DriversScreenNavigationProp>();

  const {drivers, deleteDriver} = useDrivers();

  const handleDeleteDriver = (
    driverId: string,
    driverName: string,
  ) => {
    Alert.alert(
      'Delete Driver',
      `Are you sure you want to delete ${driverName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteDriver(driverId);
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
            Drivers
          </Text>

          <Text style={styles.subtitle}>
            Manage your fleet drivers
          </Text>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {drivers.length} drivers
          </Text>
        </View>

        {/* Drivers */}
        {drivers.map(driver => (
          <Card key={driver.id}>
            <View style={styles.driverHeader}>
              <View style={styles.driverIdentity}>
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
                  driver.status === 'Active'
                    ? styles.activeBadge
                    : driver.status ===
                      'On Leave'
                    ? styles.leaveBadge
                    : styles.inactiveBadge,
                ]}>
                <Text
                  style={[
                    styles.statusText,
                    driver.status === 'Active'
                      ? styles.activeText
                      : driver.status ===
                        'On Leave'
                      ? styles.leaveText
                      : styles.inactiveText,
                  ]}>
                  {driver.status}
                </Text>
              </View>
            </View>

            {/* Driver Details */}
            <View style={styles.details}>
              <Text style={styles.detailText}>
                Phone: {driver.phone}
              </Text>

              <Text style={styles.detailText}>
                License: {driver.licenseNumber}
              </Text>

              <Text style={styles.detailText}>
                License Expiry:{' '}
                {new Date(
                  driver.licenseExpiry,
                ).toLocaleDateString()}
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
                      'DriverDetails',
                      {
                        driver,
                      },
                    )
                  }
                />
              </View>

              {/* Edit Driver */}
              <View style={styles.actionButton}>
                <Button
                  title="Edit Driver"
                  onPress={() =>
                    navigation.navigate(
                      'EditDriver',
                      {
                        driver,
                      },
                    )
                  }
                />
              </View>

              {/* Delete Driver */}
              <View
                style={
                  styles.deleteButtonWrapper
                }>
                <TouchableOpacity
                  style={styles.deleteButton}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${driver.name}`}
                  onPress={() =>
                    handleDeleteDriver(
                      driver.id,
                      driver.name,
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
        {drivers.length === 0 && (
          <Card>
            <View style={styles.emptyState}>
              <MaterialDesignIcons
                name="account-group-outline"
                size={48}
                color="#94A3B8"
              />

              <Text style={styles.emptyTitle}>
                No drivers
              </Text>

              <Text style={styles.emptyText}>
                Your fleet currently has no
                drivers.
              </Text>
            </View>
          </Card>
        )}

        {/* Add Driver */}
        <View style={styles.addButton}>
          <Button
            title="Add Driver"
            onPress={() =>
              navigation.navigate(
                'AddDriver',
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

  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  driverIdentity: {
    flex: 1,
    paddingRight: 12,
  },

  driverName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },

  employeeId: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
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
    fontSize: 12,
    fontWeight: '700',
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

export default DriversScreen;