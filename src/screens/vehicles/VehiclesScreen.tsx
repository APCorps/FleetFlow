import React, {useMemo, useState} from 'react';

import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {MaterialDesignIcons} from '@react-native-vector-icons/material-design-icons/static';

import type {
  RootStackParamList,
} from '../../navigation/AppNavigator';

import {useVehicles} from '../../store';

import {
  colors,
  radius,
  spacing,
  typography,
} from '../../theme';

type VehiclesScreenNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;

type VehicleStatusFilter =
  | 'All'
  | 'Active'
  | 'Maintenance'
  | 'Inactive';

type VehicleTypeFilter =
  | 'All'
  | 'Truck'
  | 'Van'
  | 'Car'
  | 'Motorcycle';

type DashboardIconName =
  React.ComponentProps<
    typeof MaterialDesignIcons
  >['name'];

const VEHICLE_BLUE =
  colors.categories.vehicles;

const STATUS_FILTERS: VehicleStatusFilter[] = [
  'All',
  'Active',
  'Maintenance',
  'Inactive',
];

const TYPE_FILTERS: VehicleTypeFilter[] = [
  'All',
  'Truck',
  'Van',
  'Car',
  'Motorcycle',
];

const VehiclesScreen = () => {
  const navigation =
    useNavigation<VehiclesScreenNavigationProp>();

  const {width} =
    useWindowDimensions();

  const insets =
    useSafeAreaInsets();

  const {
    vehicles,
    deleteVehicle,
  } = useVehicles();

  const [
    searchQuery,
    setSearchQuery,
  ] = useState('');

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<VehicleStatusFilter>('All');

  const [
    typeFilter,
    setTypeFilter,
  ] =
    useState<VehicleTypeFilter>('All');

  const [
    filterSheetVisible,
    setFilterSheetVisible,
  ] = useState(false);

  const horizontalPadding =
    width < 360
      ? 14
      : width < 430
      ? 18
      : 20;

  const contentBottom =
    Math.max(112, insets.bottom + 112);

  /*
   * ─────────────────────────────────────
   * VEHICLE TYPE ICON
   * ─────────────────────────────────────
   */

  const getVehicleTypeIcon = (
    type: string,
  ): DashboardIconName => {
    switch (type) {
      case 'Truck':
        return 'truck-outline';

      case 'Van':
        return 'van-utility';

      case 'Car':
        return 'car-outline';

      case 'Motorcycle':
        return 'motorbike';

      default:
        return 'car-outline';
    }
  };

  /*
   * ─────────────────────────────────────
   * STATUS COLOR
   * ─────────────────────────────────────
   */

  const getStatusColor = (
    status: string,
  ) => {
    switch (status) {
      case 'Active':
        return colors.success;

      case 'Maintenance':
        return colors.warning;

      case 'Inactive':
        return colors.textMuted;

      default:
        return colors.textMuted;
    }
  };

  /*
   * ─────────────────────────────────────
   * DERIVED DATA
   * ─────────────────────────────────────
   */

  const activeVehicles =
    vehicles.filter(
      vehicle =>
        vehicle.status === 'Active',
    ).length;

  const maintenanceVehicles =
    vehicles.filter(
      vehicle =>
        vehicle.status === 'Maintenance',
    ).length;

  const normalizedSearch =
    searchQuery.trim().toLowerCase();

  const filteredVehicles =
    useMemo(() => {
      return vehicles.filter(vehicle => {
        const searchableText = [
          vehicle.registrationNumber,
          vehicle.make,
          vehicle.model,
          vehicle.type,
          String(vehicle.year),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        const matchesSearch =
          normalizedSearch.length === 0 ||
          searchableText.includes(
            normalizedSearch,
          );

        const matchesStatus =
          statusFilter === 'All' ||
          vehicle.status === statusFilter;

        const matchesType =
          typeFilter === 'All' ||
          vehicle.type === typeFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesType
        );
      });
    }, [
      vehicles,
      normalizedSearch,
      statusFilter,
      typeFilter,
    ]);

  const hasActiveFilters =
    statusFilter !== 'All' ||
    typeFilter !== 'All';

  /*
   * ─────────────────────────────────────
   * DELETE VEHICLE
   * ─────────────────────────────────────
   */

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

  /*
   * ─────────────────────────────────────
   * FILTERS
   * ─────────────────────────────────────
   */

  const clearFilters = () => {
    setStatusFilter('All');
    setTypeFilter('All');
  };

  const applyStatusFilter = (
    value: VehicleStatusFilter,
  ) => {
    setStatusFilter(value);
  };

  const applyTypeFilter = (
    value: VehicleTypeFilter,
  ) => {
    setTypeFilter(value);
  };

  /*
   * ─────────────────────────────────────
   * RENDER
   * ─────────────────────────────────────
   */

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right']}>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal:
              horizontalPadding,
            paddingBottom:
              contentBottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* HEADER */}

        <View style={styles.header}>
          <View
            style={[
              styles.headerIcon,
              {
                backgroundColor:
                  colors.primarySoft,
                borderColor:
                  colors.primaryBorder,
              },
            ]}>
            <MaterialDesignIcons
              name="truck-outline"
              size={23}
              color={VEHICLE_BLUE}
            />
          </View>

          <View style={styles.headerText}>
            <Text
              style={styles.title}>
              Vehicles
            </Text>

            <Text
              style={styles.subtitle}>
              Manage your fleet vehicles
            </Text>
          </View>

          <View
            style={styles.headerCount}>
            <Text
              style={styles.headerCountValue}>
              {vehicles.length}
            </Text>
            <Text
              style={styles.headerCountLabel}>
              total
            </Text>
          </View>
        </View>

        {/* SEARCH / FILTER / ADD */}

        <View style={styles.toolbar}>
          <View
            style={styles.searchField}>

            <MaterialDesignIcons
              name="magnify"
              size={20}
              color={colors.textMuted}
            />

            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search registration, make, model..."
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
              autoCorrect={false}
              returnKeyType="search"
              accessibilityLabel="Search vehicles"
            />

            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearSearchButton}
                activeOpacity={0.7}
                onPress={() =>
                  setSearchQuery('')
                }
                accessibilityRole="button"
                accessibilityLabel="Clear vehicle search">
                <MaterialDesignIcons
                  name="close-circle"
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.toolbarActions}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                hasActiveFilters &&
                  styles.filterButtonActive,
              ]}
              activeOpacity={0.75}
              onPress={() =>
                setFilterSheetVisible(true)
              }
              accessibilityRole="button"
              accessibilityLabel="Filter vehicles">

              <MaterialDesignIcons
                name="tune-variant"
                size={19}
                color={
                  hasActiveFilters
                    ? colors.primary
                    : colors.textSecondary
                }
              />

              <Text
                style={[
                  styles.filterButtonText,
                  hasActiveFilters &&
                    styles.filterButtonTextActive,
                ]}>
                Filter
              </Text>

              {hasActiveFilters && (
                <View
                  style={styles.filterCountBadge}>
                  <Text
                    style={
                      styles.filterCountText
                    }>
                    {
                      Number(
                        statusFilter !==
                          'All',
                      ) +
                      Number(
                        typeFilter !==
                          'All',
                      )
                    }
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addButton}
              activeOpacity={0.82}
              onPress={() =>
                navigation.navigate(
                  'AddVehicle',
                )
              }
              accessibilityRole="button"
              accessibilityLabel="Add Vehicle">
              <MaterialDesignIcons
                name="plus"
                size={19}
                color={colors.white}
              />
              <Text
                style={styles.addButtonText}>
                Add
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ACTIVE FILTER CHIPS */}

        {hasActiveFilters && (
          <View style={styles.filterChipsRow}>
            {statusFilter !== 'All' && (
              <TouchableOpacity
                style={styles.activeChip}
                activeOpacity={0.75}
                onPress={() =>
                  setStatusFilter('All')
                }>
                <Text
                  style={styles.activeChipText}>
                  Status: {statusFilter}
                </Text>

                <MaterialDesignIcons
                  name="close"
                  size={15}
                  color={colors.primary}
                />
              </TouchableOpacity>
            )}

            {typeFilter !== 'All' && (
              <TouchableOpacity
                style={styles.activeChip}
                activeOpacity={0.75}
                onPress={() =>
                  setTypeFilter('All')
                }>
                <Text
                  style={styles.activeChipText}>
                  Type: {typeFilter}
                </Text>

                <MaterialDesignIcons
                  name="close"
                  size={15}
                  color={colors.primary}
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.clearFiltersLink}
              activeOpacity={0.75}
              onPress={clearFilters}
              accessibilityRole="button"
              accessibilityLabel="Clear vehicle filters">
              <Text
                style={
                  styles.clearFiltersText
                }>
                Clear
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* SUMMARY */}

        <View
          style={styles.summaryCard}>

          <View style={styles.summaryMetric}>
            <Text
              style={styles.summaryValue}>
              {vehicles.length}
            </Text>

            <Text
              style={styles.summaryLabel}>
              Total
            </Text>
          </View>

          <View
            style={styles.summaryDivider}
          />

          <View style={styles.summaryMetric}>
            <Text
              style={[
                styles.summaryValue,
                {
                  color:
                    colors.success,
                },
              ]}>
              {activeVehicles}
            </Text>

            <Text
              style={styles.summaryLabel}>
              Active
            </Text>
          </View>

          <View
            style={styles.summaryDivider}
          />

          <View style={styles.summaryMetric}>
            <Text
              style={[
                styles.summaryValue,
                {
                  color:
                    colors.warning,
                },
              ]}>
              {maintenanceVehicles}
            </Text>

            <Text
              style={styles.summaryLabel}>
              Service
            </Text>
          </View>

          <View
            style={[
              styles.summaryAccent,
              {
                backgroundColor:
                  colors.primarySoft,
                borderColor:
                  colors.primaryBorder,
              },
            ]}>
            <MaterialDesignIcons
              name="truck-outline"
              size={20}
              color={VEHICLE_BLUE}
            />
          </View>
        </View>

        {/* RESULT META */}

        <View style={styles.resultHeader}>
          <View>
            <Text
              style={styles.sectionLabel}>
              FLEET
            </Text>

            <Text
              style={styles.resultText}>
              {filteredVehicles.length}{' '}
              {filteredVehicles.length === 1
                ? 'vehicle'
                : 'vehicles'}{' '}
              shown
            </Text>
          </View>

          <Text
            style={styles.resultHint}>
            {normalizedSearch.length > 0
              ? 'Search active'
              : 'Live fleet'}
          </Text>
        </View>

        {/* VEHICLES */}

        {filteredVehicles.map(
          vehicle => {
            const statusColor =
              getStatusColor(
                vehicle.status,
              );

            return (
              <View
                key={vehicle.id}
                style={styles.vehicleCard}>

                {/* VEHICLE HEADER */}

                <View
                  style={
                    styles.vehicleHeader
                  }>

                  <View
                    style={
                      styles.vehicleIdentity
                    }>

                    <View
                      style={[
                        styles.identityRow,
                        {
                          maxWidth:
                            width <
                            380
                              ? '67%'
                              : '74%',
                        },
                      ]}>

                      <View
                        style={[
                          styles.vehicleTypeChip,
                          {
                            backgroundColor:
                              `${statusColor}14`,
                            borderColor:
                              `${statusColor}30`,
                          },
                        ]}>
                        <MaterialDesignIcons
                          name={getVehicleTypeIcon(
                            vehicle.type,
                          )}
                          size={17}
                          color={
                            statusColor
                          }
                        />
                      </View>

                      <Text
                        style={
                          styles.registration
                        }
                        numberOfLines={1}>
                        {
                          vehicle.registrationNumber
                        }
                      </Text>
                    </View>

                    <Text
                      style={
                        styles.vehicleName
                      }
                      numberOfLines={1}>
                      {vehicle.make}{' '}
                      {vehicle.model}
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
                          color:
                            statusColor,
                        },
                      ]}>
                      {vehicle.status}
                    </Text>
                  </View>
                </View>

                {/* SPECIFICATIONS */}

                <View
                  style={styles.specRow}>

                  <View
                    style={
                      styles.specItem
                    }>
                    <MaterialDesignIcons
                      name="shape-outline"
                      size={14}
                      color={
                        colors.textMuted
                      }
                    />

                    <Text
                      style={
                        styles.specText
                      }>
                      {vehicle.type}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.specItem
                    }>
                    <MaterialDesignIcons
                      name="calendar-outline"
                      size={14}
                      color={
                        colors.textMuted
                      }
                    />

                    <Text
                      style={
                        styles.specText
                      }>
                      {vehicle.year}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.specItem
                    }>
                    <MaterialDesignIcons
                      name="speedometer"
                      size={14}
                      color={
                        colors.textMuted
                      }
                    />

                    <Text
                      style={
                        styles.specText
                      }>
                      {vehicle.mileage.toLocaleString()}{' '}
                      km
                    </Text>
                  </View>
                </View>

                <View
                  style={styles.divider}
                />

                {/* ACTIONS */}

                <View
                  style={styles.actionsRow}>

                  <Text
                    style={
                      styles.registrationMeta
                    }
                    numberOfLines={1}>
                    Fleet ID · {vehicle.id}
                  </Text>

                  <TouchableOpacity
                    style={
                      styles.iconButton
                    }
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`View ${vehicle.registrationNumber}`}
                    onPress={() =>
                      navigation.navigate(
                        'VehicleDetails',
                        {
                          vehicle,
                        },
                      )
                    }>
                    <MaterialDesignIcons
                      name="eye-outline"
                      size={18}
                      color={
                        colors.textSecondary
                      }
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={
                      styles.iconButton
                    }
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${vehicle.registrationNumber}`}
                    onPress={() =>
                      navigation.navigate(
                        'EditVehicle',
                        {
                          vehicle,
                        },
                      )
                    }>
                    <MaterialDesignIcons
                      name="pencil-outline"
                      size={18}
                      color={
                        colors.textSecondary
                      }
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={
                      styles.iconButton
                    }
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
                      name="trash-can-outline"
                      size={18}
                      color={
                        colors.textSecondary
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          },
        )}

        {/* EMPTY / NO RESULTS */}

        {filteredVehicles.length ===
          0 && (
          <View
            style={styles.emptyCard}>

            <View
              style={[
                styles.emptyIcon,
                {
                  backgroundColor:
                    colors.primarySoft,
                  borderColor:
                    colors.primaryBorder,
                },
              ]}>
              <MaterialDesignIcons
                name={
                  vehicles.length === 0
                    ? 'truck-outline'
                    : 'magnify'
                }
                size={30}
                color={VEHICLE_BLUE}
              />
            </View>

            <Text
              style={styles.emptyTitle}>
              {vehicles.length === 0
                ? 'No vehicles'
                : 'No matches found'}
            </Text>

            <Text
              style={styles.emptyText}>
              {vehicles.length === 0
                ? 'Your fleet currently has no vehicles.'
                : 'Try another search or clear the active filters.'}
            </Text>

            {vehicles.length > 0 &&
              (hasActiveFilters ||
                searchQuery.length >
                  0) && (
                <TouchableOpacity
                  style={
                    styles.emptyAction
                  }
                  activeOpacity={0.78}
                  onPress={() => {
                    setSearchQuery('');
                    clearFilters();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Clear vehicle search and filters">
                  <Text
                    style={
                      styles.emptyActionText
                    }>
                    Clear search
                  </Text>
                </TouchableOpacity>
              )}
          </View>
        )}
      </ScrollView>

      {/* FILTER SHEET */}

      <Modal
        visible={filterSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setFilterSheetVisible(false)
        }>

        <View
          style={styles.modalRoot}>

          <Pressable
            style={styles.modalBackdrop}
            onPress={() =>
              setFilterSheetVisible(false)
            }
          />

          <View
            style={[
              styles.filterSheet,
              {
                paddingBottom:
                  Math.max(
                    insets.bottom,
                    spacing.lg,
                  ),
              },
            ]}>

            <View
              style={
                styles.sheetHandle
              }
            />

            <View
              style={styles.sheetHeader}>

              <View>
                <Text
                  style={
                    styles.sheetTitle
                  }>
                  Filter vehicles
                </Text>

                <Text
                  style={
                    styles.sheetSubtitle
                  }>
                  Narrow the fleet list
                </Text>
              </View>

              <TouchableOpacity
                style={
                  styles.sheetCloseButton
                }
                activeOpacity={0.75}
                onPress={() =>
                  setFilterSheetVisible(
                    false,
                  )
                }
                accessibilityRole="button"
                accessibilityLabel="Close vehicle filters">
                <MaterialDesignIcons
                  name="close"
                  size={20}
                  color={
                    colors.textSecondary
                  }
                />
              </TouchableOpacity>
            </View>

            <Text
              style={styles.sheetSectionLabel}>
              STATUS
            </Text>

            <View
              style={styles.optionGrid}>
              {STATUS_FILTERS.map(
                option => {
                  const selected =
                    statusFilter ===
                    option;

                  return (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.optionButton,
                        selected &&
                          styles.optionButtonSelected,
                      ]}
                      activeOpacity={0.76}
                      onPress={() =>
                        applyStatusFilter(
                          option,
                        )
                      }
                      accessibilityRole="button"
                      accessibilityState={{
                        selected,
                      }}>
                      <Text
                        style={[
                          styles.optionText,
                          selected &&
                            styles.optionTextSelected,
                        ]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                },
              )}
            </View>

            <Text
              style={
                styles.sheetSectionLabel
              }>
              TYPE
            </Text>

            <View
              style={styles.optionGrid}>
              {TYPE_FILTERS.map(
                option => {
                  const selected =
                    typeFilter ===
                    option;

                  return (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.optionButton,
                        selected &&
                          styles.optionButtonSelected,
                      ]}
                      activeOpacity={0.76}
                      onPress={() =>
                        applyTypeFilter(
                          option,
                        )
                      }
                      accessibilityRole="button"
                      accessibilityState={{
                        selected,
                      }}>
                      <Text
                        style={[
                          styles.optionText,
                          selected &&
                            styles.optionTextSelected,
                        ]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                },
              )}
            </View>

            <View
              style={styles.sheetFooter}>

              <TouchableOpacity
                style={
                  styles.sheetClearButton
                }
                activeOpacity={0.75}
                onPress={clearFilters}
                accessibilityRole="button"
                accessibilityLabel="Clear vehicle filters">
                <Text
                  style={
                    styles.sheetClearText
                  }>
                  Clear
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.sheetApplyButton
                }
                activeOpacity={0.8}
                onPress={() =>
                  setFilterSheetVisible(
                    false,
                  )
                }
                accessibilityRole="button"
                accessibilityLabel="Apply vehicle filters">
                <Text
                  style={
                    styles.sheetApplyText
                  }>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      colors.background,
  },

  content: {
    paddingTop:
      spacing.lg,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom:
      spacing.lg,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius:
      radius.lg,
    alignItems: 'center',
    justifyContent:
      'center',
    borderWidth: 1,
    marginRight:
      spacing.md,
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize:
      typography.size.xxl,
    lineHeight:
      typography.lineHeight.xxl,
    fontWeight:
      typography.weight.extraBold,
    letterSpacing:
      typography.letterSpacing.tight,
    color:
      colors.textPrimary,
  },

  subtitle: {
    marginTop:
      spacing.xs,
    fontSize:
      typography.size.sm,
    lineHeight:
      typography.lineHeight.sm,
    color:
      colors.textSecondary,
  },

  headerCount: {
    minWidth: 50,
    alignItems:
      'flex-end',
  },

  headerCountValue: {
    fontSize:
      typography.size.lg,
    lineHeight:
      typography.lineHeight.lg,
    fontWeight:
      typography.weight.bold,
    color:
      colors.textPrimary,
  },

  headerCountLabel: {
    marginTop:
      1,
    fontSize:
      typography.size.xs,
    lineHeight:
      typography.lineHeight.xs,
    fontWeight:
      typography.weight.medium,
    color:
      colors.textMuted,
    textTransform:
      'uppercase',
    letterSpacing:
      typography.letterSpacing.wide,
  },

  toolbar: {
    gap: spacing.sm,
    marginBottom:
      spacing.md,
  },

  toolbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },

  searchField: {
    flex: 1,
    minWidth: 0,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal:
      spacing.md,
    borderWidth: 1,
    borderColor:
      colors.border,
    borderRadius:
      radius.input,
    backgroundColor:
      colors.surfaceElevated,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    marginLeft:
      spacing.sm,
    paddingVertical: 0,
    fontSize:
      typography.size.md,
    lineHeight:
      typography.lineHeight.md,
    color:
      colors.textPrimary,
  },

  clearSearchButton: {
    paddingLeft:
      spacing.sm,
  },

  filterButton: {
    height: 46,
    minWidth: 104,
    paddingHorizontal:
      spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor:
      colors.border,
    borderRadius:
      radius.input,
    backgroundColor:
      colors.surfaceElevated,
  },

  addButton: {
    height: 46,
    minWidth: 94,
    paddingHorizontal:
      spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius:
      radius.input,
    backgroundColor:
      VEHICLE_BLUE,
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.14)',
  },

  addButtonText: {
    fontSize:
      typography.size.sm,
    lineHeight:
      typography.lineHeight.sm,
    fontWeight:
      typography.weight.bold,
    color:
      colors.white,
  },

  filterButtonActive: {
    backgroundColor:
      colors.primarySoft,
    borderColor:
      colors.primaryBorder,
  },

  filterButtonText: {
    fontSize:
      typography.size.sm,
    lineHeight:
      typography.lineHeight.sm,
    fontWeight:
      typography.weight.semiBold,
    color:
      colors.textSecondary,
  },

  filterButtonTextActive: {
    color:
      colors.primary,
  },

  filterCountBadge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius:
      radius.pill,
    alignItems: 'center',
    justifyContent:
      'center',
    backgroundColor:
      colors.primary,
  },

  filterCountText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight:
      typography.weight.bold,
    color:
      colors.white,
  },

  filterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom:
      spacing.md,
  },

  activeChip: {
    minHeight: 32,
    paddingHorizontal:
      spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor:
      colors.primaryBorder,
    borderRadius:
      radius.pill,
    backgroundColor:
      colors.primarySoft,
  },

  activeChipText: {
    fontSize:
      typography.size.xs,
    lineHeight:
      typography.lineHeight.xs,
    fontWeight:
      typography.weight.semiBold,
    color:
      colors.primary,
  },

  clearFiltersLink: {
    minHeight: 32,
    paddingHorizontal:
      spacing.sm,
    justifyContent:
      'center',
  },

  clearFiltersText: {
    fontSize:
      typography.size.xs,
    lineHeight:
      typography.lineHeight.xs,
    fontWeight:
      typography.weight.semiBold,
    color:
      colors.textSecondary,
  },

  summaryCard: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal:
      spacing.md,
    paddingVertical:
      spacing.md,
    marginBottom:
      spacing.lg,
    borderWidth: 1,
    borderColor:
      colors.border,
    borderRadius:
      radius.lg,
    backgroundColor:
      colors.surfaceElevated,
  },

  summaryMetric: {
    flex: 1,
    minWidth: 0,
  },

  summaryValue: {
    fontSize:
      typography.size.xl,
    lineHeight:
      typography.lineHeight.xl,
    fontWeight:
      typography.weight.bold,
    color:
      colors.textPrimary,
  },

  summaryLabel: {
    marginTop:
      2,
    fontSize:
      typography.size.xs,
    lineHeight:
      typography.lineHeight.xs,
    fontWeight:
      typography.weight.medium,
    color:
      colors.textSecondary,
  },

  summaryDivider: {
    width: 1,
    height: 36,
    marginHorizontal:
      spacing.sm,
    backgroundColor:
      colors.border,
  },

  summaryAccent: {
    width: 40,
    height: 40,
    marginLeft:
      spacing.sm,
    borderRadius:
      radius.md,
    alignItems: 'center',
    justifyContent:
      'center',
    borderWidth: 1,
  },

  resultHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent:
      'space-between',
    marginBottom:
      spacing.sm,
  },

  sectionLabel: {
    fontSize:
      typography.size.xs,
    lineHeight:
      typography.lineHeight.xs,
    fontWeight:
      typography.weight.bold,
    letterSpacing:
      typography.letterSpacing.heading,
    color:
      colors.textMuted,
  },

  resultText: {
    marginTop:
      3,
    fontSize:
      typography.size.sm,
    lineHeight:
      typography.lineHeight.sm,
    fontWeight:
      typography.weight.medium,
    color:
      colors.textSecondary,
  },

  resultHint: {
    fontSize:
      typography.size.xs,
    lineHeight:
      typography.lineHeight.xs,
    fontWeight:
      typography.weight.medium,
    color:
      colors.textMuted,
  },

  vehicleCard: {
    padding: spacing.card,
    marginBottom:
      spacing.md,
    borderWidth: 1,
    borderColor:
      colors.border,
    borderRadius:
      radius.lg,
    backgroundColor:
      colors.surfaceStrong,
  },

  vehicleHeader: {
    flexDirection: 'row',
    alignItems:
      'flex-start',
    justifyContent:
      'space-between',
  },

  vehicleIdentity: {
    flex: 1,
    minWidth: 0,
    paddingRight:
      spacing.sm,
  },

  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  vehicleTypeChip: {
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius:
      radius.md,
    alignItems: 'center',
    justifyContent:
      'center',
    borderWidth: 1,
    marginRight:
      spacing.sm,
  },

  registration: {
    flexShrink: 1,
    fontSize:
      typography.size.lg,
    lineHeight:
      typography.lineHeight.lg,
    fontWeight:
      typography.weight.bold,
    color:
      colors.textPrimary,
  },

  vehicleName: {
    marginTop:
      spacing.xs,
    fontSize:
      typography.size.sm,
    lineHeight:
      typography.lineHeight.sm,
    fontWeight:
      typography.weight.medium,
    color:
      colors.textSecondary,
  },

  statusBadge: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal:
      spacing.sm,
    paddingVertical:
      spacing.xs,
    borderRadius:
      radius.pill,
    borderWidth: 1,
    marginTop: 1,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight:
      spacing.xs,
  },

  statusText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight:
      typography.weight.bold,
  },

  specRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.md,
    marginTop:
      spacing.md,
  },

  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  specText: {
    fontSize:
      typography.size.xs,
    lineHeight:
      typography.lineHeight.xs,
    fontWeight:
      typography.weight.medium,
    color:
      colors.textSecondary,
  },

  divider: {
    height: 1,
    marginTop:
      spacing.md,
    backgroundColor:
      colors.borderLight,
  },

  actionsRow: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop:
      spacing.sm,
  },

  registrationMeta: {
    flex: 1,
    minWidth: 0,
    marginRight:
      spacing.sm,
    fontSize: 10,
    lineHeight: 14,
    color:
      colors.textMuted,
  },

  iconButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent:
      'center',
    borderRadius:
      radius.md,
    borderWidth: 1,
    borderColor:
      colors.border,
    backgroundColor:
      'transparent',
    marginLeft:
      spacing.xs,
  },

  emptyCard: {
    alignItems: 'center',
    justifyContent:
      'center',
    paddingVertical:
      spacing.huge,
    paddingHorizontal:
      spacing.xxl,
    borderWidth: 1,
    borderColor:
      colors.border,
    borderRadius:
      radius.lg,
    backgroundColor:
      colors.surfaceElevated,
  },

  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius:
      radius.lg,
    alignItems: 'center',
    justifyContent:
      'center',
    borderWidth: 1,
  },

  emptyTitle: {
    marginTop:
      spacing.md,
    fontSize:
      typography.size.lg,
    lineHeight:
      typography.lineHeight.lg,
    fontWeight:
      typography.weight.bold,
    color:
      colors.textPrimary,
  },

  emptyText: {
    maxWidth: 290,
    marginTop:
      spacing.xs,
    fontSize:
      typography.size.sm,
    lineHeight:
      typography.lineHeight.md,
    color:
      colors.textSecondary,
    textAlign:
      'center',
  },

  emptyAction: {
    minHeight: 40,
    paddingHorizontal:
      spacing.lg,
    marginTop:
      spacing.lg,
    alignItems: 'center',
    justifyContent:
      'center',
    borderRadius:
      radius.button,
    backgroundColor:
      colors.primarySoft,
    borderWidth: 1,
    borderColor:
      colors.primaryBorder,
  },

  emptyActionText: {
    fontSize:
      typography.size.sm,
    lineHeight:
      typography.lineHeight.sm,
    fontWeight:
      typography.weight.semiBold,
    color:
      colors.primary,
  },

  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      'rgba(0, 0, 0, 0.56)',
  },

  filterSheet: {
    paddingHorizontal:
      spacing.screen,
    paddingTop:
      spacing.md,
    borderTopLeftRadius:
      radius.sheet,
    borderTopRightRadius:
      radius.sheet,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor:
      colors.borderStrong,
    backgroundColor:
      colors.surfaceStrong,
  },

  sheetHandle: {
    width: 42,
    height: 4,
    alignSelf: 'center',
    borderRadius:
      radius.pill,
    backgroundColor:
      colors.textMuted,
    opacity: 0.65,
  },

  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    marginTop:
      spacing.lg,
  },

  sheetTitle: {
    fontSize:
      typography.size.lg,
    lineHeight:
      typography.lineHeight.lg,
    fontWeight:
      typography.weight.bold,
    color:
      colors.textPrimary,
  },

  sheetSubtitle: {
    marginTop:
      2,
    fontSize:
      typography.size.sm,
    lineHeight:
      typography.lineHeight.sm,
    color:
      colors.textSecondary,
  },

  sheetCloseButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent:
      'center',
    borderRadius:
      radius.md,
    borderWidth: 1,
    borderColor:
      colors.border,
  },

  sheetSectionLabel: {
    marginTop:
      spacing.xxl,
    marginBottom:
      spacing.sm,
    fontSize:
      typography.size.xs,
    lineHeight:
      typography.lineHeight.xs,
    fontWeight:
      typography.weight.bold,
    letterSpacing:
      typography.letterSpacing.heading,
    color:
      colors.textMuted,
  },

  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  optionButton: {
    minHeight: 42,
    paddingHorizontal:
      spacing.md,
    alignItems: 'center',
    justifyContent:
      'center',
    borderRadius:
      radius.button,
    borderWidth: 1,
    borderColor:
      colors.border,
    backgroundColor:
      colors.backgroundSoft,
  },

  optionButtonSelected: {
    borderColor:
      colors.primaryBorder,
    backgroundColor:
      colors.primarySoft,
  },

  optionText: {
    fontSize:
      typography.size.sm,
    lineHeight:
      typography.lineHeight.sm,
    fontWeight:
      typography.weight.medium,
    color:
      colors.textSecondary,
  },

  optionTextSelected: {
    fontWeight:
      typography.weight.semiBold,
    color:
      colors.primary,
  },

  sheetFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop:
      spacing.xxl,
  },

  sheetClearButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent:
      'center',
    borderRadius:
      radius.button,
    borderWidth: 1,
    borderColor:
      colors.border,
    backgroundColor:
      'transparent',
  },

  sheetClearText: {
    fontSize:
      typography.size.md,
    lineHeight:
      typography.lineHeight.md,
    fontWeight:
      typography.weight.semiBold,
    color:
      colors.textSecondary,
  },

  sheetApplyButton: {
    flex: 1.3,
    minHeight: 48,
    alignItems: 'center',
    justifyContent:
      'center',
    borderRadius:
      radius.button,
    backgroundColor:
      colors.primary,
  },

  sheetApplyText: {
    fontSize:
      typography.size.md,
    lineHeight:
      typography.lineHeight.md,
    fontWeight:
      typography.weight.bold,
    color:
      colors.white,
  },
});

export default VehiclesScreen;
