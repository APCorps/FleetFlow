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
import {
  useMaintenance,
  useVehicles,
} from '../../store';

type MaintenanceScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const MaintenanceScreen = () => {
  const navigation =
    useNavigation<MaintenanceScreenNavigationProp>();

  const {
    maintenanceRecords,
    deleteMaintenance,
  } = useMaintenance();

  const {vehicles} = useVehicles();

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

  const handleDeleteMaintenance = (
    maintenanceId: string,
    maintenanceTitle: string,
  ) => {
    Alert.alert(
      'Delete Maintenance',
      `Are you sure you want to delete "${maintenanceTitle}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteMaintenance(
              maintenanceId,
            );
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
            Maintenance
          </Text>

          <Text style={styles.subtitle}>
            Manage vehicle maintenance
          </Text>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {maintenanceRecords.length}{' '}
            maintenance records
          </Text>
        </View>

        {/* Maintenance Records */}
        {maintenanceRecords.map(record => (
          <Card key={record.id}>
            {/* Record Header */}
            <View style={styles.recordHeader}>
              <View style={styles.recordIdentity}>
                <Text style={styles.recordTitle}>
                  {record.title}
                </Text>

                <Text
                  style={
                    styles.vehicleRegistration
                  }>
                  {getVehicleRegistration(
                    record.vehicleId,
                  )}
                </Text>
              </View>

              {/* Status */}
              <View
                style={[
                  styles.statusBadge,
                  record.status ===
                  'Completed'
                    ? styles.completedBadge
                    : record.status ===
                      'In Progress'
                    ? styles.inProgressBadge
                    : styles.scheduledBadge,
                ]}>
                <Text
                  style={[
                    styles.statusText,
                    record.status ===
                    'Completed'
                      ? styles.completedText
                      : record.status ===
                        'In Progress'
                      ? styles.inProgressText
                      : styles.scheduledText,
                  ]}>
                  {record.status}
                </Text>
              </View>
            </View>

            {/* Description */}
            <Text style={styles.description}>
              {record.description}
            </Text>

            {/* Priority */}
            <View style={styles.priorityRow}>
              <Text
                style={styles.priorityLabel}>
                Priority
              </Text>

              <View
                style={[
                  styles.priorityBadge,
                  record.priority ===
                  'High'
                    ? styles.highPriorityBadge
                    : record.priority ===
                      'Medium'
                    ? styles.mediumPriorityBadge
                    : styles.lowPriorityBadge,
                ]}>
                <Text
                  style={[
                    styles.priorityText,
                    record.priority ===
                    'High'
                      ? styles.highPriorityText
                      : record.priority ===
                        'Medium'
                      ? styles.mediumPriorityText
                      : styles.lowPriorityText,
                  ]}>
                  {record.priority}
                </Text>
              </View>
            </View>

            {/* Details */}
            <View style={styles.details}>
              <Text
                style={styles.detailText}>
                Scheduled:{' '}
                {new Date(
                  record.scheduledDate,
                ).toLocaleDateString()}
              </Text>

              {record.mileage !==
                undefined && (
                <Text
                  style={
                    styles.detailText
                  }>
                  Mileage:{' '}
                  {record.mileage.toLocaleString()}{' '}
                  km
                </Text>
              )}

              {record.cost !==
                undefined && (
                <Text
                  style={
                    styles.detailText
                  }>
                  Cost: ₹
                  {record.cost.toLocaleString()}
                </Text>
              )}

              {record.completedDate && (
                <Text
                  style={
                    styles.detailText
                  }>
                  Completed:{' '}
                  {new Date(
                    record.completedDate,
                  ).toLocaleDateString()}
                </Text>
              )}
            </View>

            {/* Actions */}
            <View
              style={styles.actionButtons}>

              {/* View Details */}
              <View
                style={
                  styles.actionButton
                }>
                <Button
                  title="View Details"
                  onPress={() =>
                    navigation.navigate(
                      'MaintenanceDetails',
                      {
                        maintenance:
                          record,
                      },
                    )
                  }
                />
              </View>

              {/* Edit */}
              <View
                style={
                  styles.actionButton
                }>
                <Button
                  title="Edit Maintenance"
                  onPress={() =>
                    navigation.navigate(
                      'EditMaintenance',
                      {
                        maintenance:
                          record,
                      },
                    )
                  }
                />
              </View>

              {/* Delete */}
              <View
                style={
                  styles.deleteButtonWrapper
                }>
                <TouchableOpacity
                  style={
                    styles.deleteButton
                  }
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${record.title}`}
                  onPress={() =>
                    handleDeleteMaintenance(
                      record.id,
                      record.title,
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
        {maintenanceRecords.length ===
          0 && (
          <Card>
            <View
              style={
                styles.emptyState
              }>
              <MaterialDesignIcons
                name="wrench-outline"
                size={48}
                color="#94A3B8"
              />

              <Text
                style={
                  styles.emptyTitle
                }>
                No maintenance records
              </Text>

              <Text
                style={
                  styles.emptyText
                }>
                Your fleet currently has
                no maintenance records.
              </Text>
            </View>
          </Card>
        )}

        {/* Add Maintenance */}
        <View style={styles.addButton}>
          <Button
            title="Add Maintenance"
            onPress={() =>
              navigation.navigate(
                'AddMaintenance',
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

  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  recordIdentity: {
    flex: 1,
    paddingRight: 12,
  },

  recordTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },

  vehicleRegistration: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '700',
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

  description: {
    marginTop: 14,
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
  },

  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  priorityLabel: {
    marginRight: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },

  priorityBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
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
    fontSize: 11,
    fontWeight: '700',
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

  details: {
    marginTop: 14,
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

export default MaintenanceScreen;