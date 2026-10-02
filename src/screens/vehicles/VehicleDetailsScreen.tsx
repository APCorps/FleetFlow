import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import {MaterialDesignIcons} from '@react-native-vector-icons/material-design-icons/static';

import {Vehicle} from '../../types';
import {colors, radius, spacing, typography} from '../../theme';

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

type DetailRowProps = {
  icon: React.ComponentProps<typeof MaterialDesignIcons>['name'];
  label: string;
  value: string;
  last?: boolean;
};

const DetailRow = ({
  icon,
  label,
  value,
  last = false,
}: DetailRowProps) => {
  return (
    <View style={[styles.detailRow, last && styles.detailRowLast]}>
      <View style={styles.detailLabelGroup}>
        <View style={styles.detailIconWrap}>
          <MaterialDesignIcons
            name={icon}
            size={17}
            color={colors.textSecondary}
          />
        </View>

        <Text style={styles.detailLabel}>{label}</Text>
      </View>

      <Text
        style={styles.detailValue}
        numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
};

const VehicleDetailsScreen = ({
  route,
  navigation,
}: VehicleDetailsScreenProps) => {
  const {vehicle} = route.params;

  const statusColor =
    vehicle.status === 'Active'
      ? colors.success
      : vehicle.status === 'Maintenance'
      ? colors.warning
      : colors.textSecondary;

  const statusBackground =
    vehicle.status === 'Active'
      ? colors.successSoft
      : vehicle.status === 'Maintenance'
      ? colors.warningSoft
      : 'rgba(154, 164, 191, 0.10)';

  const vehicleTypeIcon = (() => {
    switch (vehicle.type) {
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
  })();

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back to Vehicles"
            onPress={navigation.goBack}
            style={({pressed}) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}>
            <MaterialDesignIcons
              name="arrow-left"
              size={21}
              color={colors.textPrimary}
            />
          </Pressable>

          <View style={styles.topBarText}>
            <Text style={styles.screenTitle}>Vehicle Details</Text>
            <Text style={styles.screenSubtitle}>
              Complete vehicle information
            </Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.vehicleIconWrap}>
              <MaterialDesignIcons
                name={vehicleTypeIcon}
                size={28}
                color={colors.categories.vehicles}
              />
            </View>

            <View
              style={[
                styles.statusBadge,
                {backgroundColor: statusBackground},
              ]}>
              <View
                style={[
                  styles.statusDot,
                  {backgroundColor: statusColor},
                ]}
              />
              <Text style={[styles.statusText, {color: statusColor}]}>
                {vehicle.status}
              </Text>
            </View>
          </View>

          <Text style={styles.registration}>
            {vehicle.registrationNumber}
          </Text>

          <Text style={styles.vehicleName}>
            {vehicle.make} {vehicle.model}
          </Text>

          <View style={styles.heroMetaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>TYPE</Text>
              <Text style={styles.metaValue}>{vehicle.type}</Text>
            </View>

            <View style={styles.metaDivider} />

            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>YEAR</Text>
              <Text style={styles.metaValue}>{vehicle.year}</Text>
            </View>

            <View style={styles.metaDivider} />

            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>MILEAGE</Text>
              <Text style={styles.metaValue}>
                {vehicle.mileage.toLocaleString()} km
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Vehicle Information</Text>

        <View style={styles.detailCard}>
          <DetailRow
            icon="card-text-outline"
            label="Registration Number"
            value={vehicle.registrationNumber}
          />
          <DetailRow
            icon="factory"
            label="Make"
            value={vehicle.make}
          />
          <DetailRow
            icon="car-side"
            label="Model"
            value={vehicle.model}
          />
          <DetailRow
            icon="calendar-outline"
            label="Year"
            value={String(vehicle.year)}
          />
          <DetailRow
            icon="shape-outline"
            label="Type"
            value={vehicle.type}
          />
          <DetailRow
            icon="speedometer"
            label="Mileage"
            value={`${vehicle.mileage.toLocaleString()} km`}
            last
          />
        </View>

        <Text style={styles.sectionTitle}>Record Information</Text>

        <View style={styles.detailCard}>
          <DetailRow
            icon="identifier"
            label="Vehicle ID"
            value={vehicle.id}
          />
          <DetailRow
            icon="clock-outline"
            label="Created"
            value={new Date(vehicle.createdAt).toLocaleDateString()}
            last
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to Vehicles"
          onPress={navigation.goBack}
          style={({pressed}) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
          ]}>
          <MaterialDesignIcons
            name="arrow-left"
            size={19}
            color={colors.white}
          />
          <Text style={styles.primaryButtonText}>Back to Vehicles</Text>
        </Pressable>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.md,
  },

  pressed: {
    opacity: 0.72,
  },

  topBarText: {
    flex: 1,
  },

  screenTitle: {
    fontSize: typography.size.xl,
    lineHeight: typography.lineHeight.xl,
    fontWeight: typography.weight.bold,
    letterSpacing: typography.letterSpacing.tight,
    color: colors.textPrimary,
  },

  screenSubtitle: {
    marginTop: 2,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.textSecondary,
  },

  heroCard: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: spacing.card,
  },

  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  vehicleIconWrap: {
    width: 50,
    height: 50,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  statusText: {
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.weight.bold,
  },

  registration: {
    marginTop: spacing.lg,
    fontSize: typography.size.xxl,
    lineHeight: typography.lineHeight.xxl,
    fontWeight: typography.weight.extraBold,
    letterSpacing: typography.letterSpacing.tight,
    color: colors.textPrimary,
  },

  vehicleName: {
    marginTop: 4,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
  },

  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  metaItem: {
    flex: 1,
  },

  metaDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },

  metaLabel: {
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.weight.bold,
    letterSpacing: typography.letterSpacing.wide,
    color: colors.textMuted,
  },

  metaValue: {
    marginTop: 4,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },

  sectionTitle: {
    marginTop: spacing.section,
    marginBottom: spacing.md,
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.weight.bold,
    letterSpacing: typography.letterSpacing.tight,
    color: colors.textPrimary,
  },

  detailCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    paddingHorizontal: spacing.card,
  },

  detailRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  detailRowLast: {
    borderBottomWidth: 0,
  },

  detailLabelGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.md,
  },

  detailIconWrap: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSoft,
    marginRight: spacing.sm,
  },

  detailLabel: {
    flex: 1,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.textSecondary,
  },

  detailValue: {
    flex: 1,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    textAlign: 'right',
  },

  primaryButton: {
    minHeight: spacing.touch,
    marginTop: spacing.section,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.button,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
  },

  primaryButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },

  primaryButtonText: {
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.bold,
    color: colors.white,
  },

  bottomSpace: {
    height: 24,
  },
});

export default VehicleDetailsScreen;
