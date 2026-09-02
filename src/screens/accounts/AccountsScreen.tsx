import React, {useMemo} from 'react';

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import MaterialDesignIcons from
  '@react-native-vector-icons/material-design-icons';

import Svg, {
  Circle,
  LinearGradient,
  Defs,
  Path,
  Polyline,
  Stop,
} from 'react-native-svg';

import {useAccounts, useVehicles} from '../../store';

import {
  spacing,
  radius,
  typography,
} from '../../theme';

/*
 * ─────────────────────────────────────
 * ACCOUNTS COLORS
 * ─────────────────────────────────────
 */

const COLORS = {
  background: '#070D18',

  surface: '#0B1423',

  surfaceElevated: '#101B2D',

  border: '#1B2A40',

  borderSoft: '#16263B',

  textPrimary: '#F8FAFC',

  textSecondary: '#94A3B8',

  textMuted: '#667892',

  blue: '#3B82F6',

  blueSoft: '#13294A',

  green: '#00D6A3',

  greenSoft: '#103B33',

  red: '#EF4444',

  redSoft: '#401B24',

  gray: '#94A3B8',

  graySoft: '#202C3D',
};

/*
 * ─────────────────────────────────────
 * TYPES
 * ─────────────────────────────────────
 */

type VehicleFinancialData = {
  vehicleId: string;
  registrationNumber: string;
  make: string;
  model: string;
  profitLoss: number;
};

/*
 * ─────────────────────────────────────
 * SPARKLINE
 * ─────────────────────────────────────
 */

const SPARKLINE_WIDTH = 76;
const SPARKLINE_HEIGHT = 34;

const getSparkline = (value: number) => {
  if (value > 0) {
    return {
      points: '2,27 17,22 32,24 49,16 74,5',
      areaPath:
        'M 2 27 L 17 22 L 32 24 L 49 16 L 74 5 L 74 34 L 2 34 Z',
      endX: 74,
      endY: 5,
      color: COLORS.green,
      gradientId: 'profitGradient',
    };
  }

  if (value < 0) {
    return {
      points: '2,6 18,11 32,9 49,17 74,27',
      areaPath:
        'M 2 6 L 18 11 L 32 9 L 49 17 L 74 27 L 74 34 L 2 34 Z',
      endX: 74,
      endY: 27,
      color: COLORS.red,
      gradientId: 'lossGradient',
    };
  }

  return {
    points: '2,17 18,17 32,20 49,15 74,17',
    areaPath:
      'M 2 17 L 18 17 L 32 20 L 49 15 L 74 17 L 74 34 L 2 34 Z',
    endX: 74,
    endY: 17,
    color: COLORS.gray,
    gradientId: 'evenGradient',
  };
};

const Sparkline = ({
  value,
}: {
  value: number;
}) => {
  const graph = getSparkline(value);

  return (
    <View style={styles.sparkline}>
      <Svg
        width={SPARKLINE_WIDTH}
        height={SPARKLINE_HEIGHT}
        viewBox={`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`}>

        <Defs>
          <LinearGradient
            id={graph.gradientId}
            x1="0"
            y1="0"
            x2="0"
            y2="1">

            <Stop
              offset="0"
              stopColor={graph.color}
              stopOpacity="0.18"
            />

            <Stop
              offset="1"
              stopColor={graph.color}
              stopOpacity="0"
            />

          </LinearGradient>
        </Defs>

        {value !== 0 && (
          <Path
            d={graph.areaPath}
            fill={`url(#${graph.gradientId})`}
          />
        )}

        <Polyline
          points={graph.points}
          fill="none"
          stroke={graph.color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <Circle
          cx={graph.endX}
          cy={graph.endY}
          r="3"
          fill={graph.color}
        />

      </Svg>
    </View>
  );
};

/*
 * ─────────────────────────────────────
 * ACCOUNTS SCREEN
 * ─────────────────────────────────────
 */

const AccountsScreen = () => {
  const {vehicles} = useVehicles();

  const {
    transactions,
    totalIncome,
    totalExpenses,
  } = useAccounts();

  /*
   * VEHICLE-WISE PROFIT / LOSS
   */

  const vehicleFinancialData =
    useMemo<VehicleFinancialData[]>(() => {
      return vehicles.map(vehicle => {
        const vehicleTransactions =
          transactions.filter(
            transaction =>
              transaction.vehicleId === vehicle.id,
          );

        const income =
          vehicleTransactions
            .filter(
              transaction =>
                transaction.type === 'Income',
            )
            .reduce(
              (total, transaction) =>
                total + transaction.amount,
              0,
            );

        const expenses =
          vehicleTransactions
            .filter(
              transaction =>
                transaction.type === 'Expense',
            )
            .reduce(
              (total, transaction) =>
                total + transaction.amount,
              0,
            );

        return {
          vehicleId: vehicle.id,
          registrationNumber:
            vehicle.registrationNumber,
          make: vehicle.make,
          model: vehicle.model,
          profitLoss: income - expenses,
        };
      });
    }, [vehicles, transactions]);

  /*
   * TOTALS
   */

  const netProfitLoss =
    totalIncome - totalExpenses;

  const totalProfit =
    Math.max(netProfitLoss, 0);

  const totalLoss =
    Math.min(netProfitLoss, 0);

  /*
   * RESULT COLOR
   */

  const getResultColor = (
    value: number,
  ) => {
    if (value > 0) {
      return COLORS.green;
    }

    if (value < 0) {
      return COLORS.red;
    }

    return COLORS.gray;
  };

  /*
   * RESULT LABEL
   */

  const getResultLabel = (
    value: number,
  ) => {
    if (value > 0) {
      return 'PROFIT';
    }

    if (value < 0) {
      return 'LOSS';
    }

    return 'BREAK-EVEN';
  };

  /*
   * MONEY FORMAT
   */

  const formatAmount = (
    value: number,
  ) => {
    return `₹${Math.abs(value).toLocaleString(
      'en-IN',
    )}`;
  };

  return (
    <SafeAreaView
      style={styles.container}>

      <View style={styles.screen}>

        {/* ─────────────────────────
            HEADER
           ───────────────────────── */}

        <View style={styles.header}>

          <View style={styles.headerText}>

            <Text style={styles.eyebrow}>
              FLEET FINANCIALS
            </Text>

            <Text style={styles.title}>
              Accounts
            </Text>

            <Text style={styles.subtitle}>
              Vehicle-wise profit & loss
            </Text>

          </View>

          <View style={styles.headerIcon}>

            <MaterialDesignIcons
              name="currency-inr"
              size={22}
              color={COLORS.blue}
            />

          </View>

        </View>

        {/* ─────────────────────────
            FINANCIAL SUMMARY
           ───────────────────────── */}

        <View style={styles.summaryCard}>

          <View style={styles.summaryItem}>

            <Text style={styles.summaryLabel}>
              TOTAL PROFIT
            </Text>

            <Text
              style={[
                styles.summaryValue,
                {
                  color: COLORS.green,
                },
              ]}>
              {formatAmount(totalProfit)}
            </Text>

          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>

            <Text style={styles.summaryLabel}>
              TOTAL LOSS
            </Text>

            <Text
              style={[
                styles.summaryValue,
                {
                  color: COLORS.red,
                },
              ]}>
              {formatAmount(totalLoss)}
            </Text>

          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>

            <Text style={styles.summaryLabel}>
              NET PROFIT
            </Text>

            <Text
              style={[
                styles.summaryValue,
                {
                  color:
                    getResultColor(
                      netProfitLoss,
                    ),
                },
              ]}>

              {netProfitLoss < 0
                ? '-'
                : ''}

              {formatAmount(
                netProfitLoss,
              )}

            </Text>

          </View>

        </View>

        {/* ─────────────────────────
            VEHICLE SECTION
           ───────────────────────── */}

        <View style={styles.sectionHeader}>

          <View
            style={
              styles.sectionHeaderText
            }>

            <Text
              style={styles.sectionTitle}>
              VEHICLE WISE PROFIT & LOSS
            </Text>

            <Text
              style={styles.sectionSubtitle}>
              Current financial performance
            </Text>

          </View>

          <View style={styles.countBadge}>

            <Text style={styles.countText}>
              {vehicles.length}
            </Text>

          </View>

        </View>

        {/* ─────────────────────────
            VEHICLE LIST
           ───────────────────────── */}

        <ScrollView
          style={styles.list}
          contentContainerStyle={
            styles.listContent
          }
          showsVerticalScrollIndicator={
            false}>

          {vehicleFinancialData.map(
            vehicle => {

              const resultColor =
                getResultColor(
                  vehicle.profitLoss,
                );

              const resultLabel =
                getResultLabel(
                  vehicle.profitLoss,
                );

              const isProfit =
                vehicle.profitLoss > 0;

              const isLoss =
                vehicle.profitLoss < 0;

              const iconBackground =
                isProfit
                  ? COLORS.blueSoft
                  : isLoss
                  ? COLORS.redSoft
                  : COLORS.graySoft;

              const iconColor =
                isProfit
                  ? COLORS.blue
                  : isLoss
                  ? COLORS.red
                  : COLORS.gray;

              return (
                <View
                  key={vehicle.vehicleId}
                  style={styles.vehicleCard}>

                  {/* ICON */}

                  <View
                    style={[
                      styles.vehicleIcon,
                      {
                        backgroundColor:
                          iconBackground,
                      },
                    ]}>

                    <MaterialDesignIcons
                      name="truck-outline"
                      size={21}
                      color={iconColor}
                    />

                  </View>

                  {/* DETAILS */}

                  <View
                    style={styles.vehicleInfo}>

                    <Text
                      style={
                        styles.vehicleName
                      }
                      numberOfLines={1}>

                      {vehicle.registrationNumber}
                      {' · '}
                      {vehicle.make}{' '}
                      {vehicle.model}

                    </Text>

                    <Text
                      style={
                        styles.vehicleId
                      }
                      numberOfLines={1}>

                      {vehicle.vehicleId}

                    </Text>

                  </View>

                  {/* GRAPH */}

                  <Sparkline
                    value={
                      vehicle.profitLoss
                    }
                  />

                  {/* RESULT */}

                  <View
                    style={
                      styles.resultContainer
                    }>

                    <Text
                      style={[
                        styles.resultLabel,
                        {
                          color:
                            resultColor,
                        },
                      ]}>

                      {resultLabel}

                    </Text>

                    <Text
                      style={[
                        styles.resultAmount,
                        {
                          color:
                            resultColor,
                        },
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit>

                      {vehicle.profitLoss < 0
                        ? '-'
                        : ''}

                      {formatAmount(
                        vehicle.profitLoss,
                      )}

                    </Text>

                  </View>

                </View>
              );
            },
          )}

          {/* EMPTY STATE */}

          {vehicleFinancialData.length ===
            0 && (
            <View style={styles.emptyState}>

              <View
                style={
                  styles.emptyIcon
                }>

                <MaterialDesignIcons
                  name="truck-outline"
                  size={30}
                  color={COLORS.textMuted}
                />

              </View>

              <Text
                style={
                  styles.emptyTitle
                }>
                No vehicles yet
              </Text>

              <Text
                style={
                  styles.emptySubtitle
                }>
                Vehicle financial performance
                will appear here.
              </Text>

            </View>
          )}

          {/* MORE VEHICLES */}

          {vehicleFinancialData.length >
            3 && (
            <Text style={styles.scrollHint}>
              + more vehicles scroll below
            </Text>
          )}

          {/* BOTTOM NAV SPACE */}

          <View
            style={
              styles.bottomNavigationSpace
            }
          />

        </ScrollView>

      </View>

    </SafeAreaView>
  );
};

/*
 * ─────────────────────────────────────
 * STYLES
 * ─────────────────────────────────────
 */

const styles = StyleSheet.create({

  /*
   * SCREEN
   */

  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  screen: {
    flex: 1,
    paddingHorizontal:
      spacing.lg,
    paddingTop:
      spacing.md,
  },

  /*
   * HEADER
   */

  header: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    marginBottom:
      spacing.md,
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  eyebrow: {
    color:
      COLORS.blue,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.3,
    marginBottom: 3,
  },

  title: {
    color:
      COLORS.textPrimary,
    fontSize: 29,
    lineHeight: 34,
    fontWeight: '800',
  },

  subtitle: {
    color:
      COLORS.textSecondary,
    fontSize: 12,
    marginTop: 3,
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius:
      radius.md,
    alignItems: 'center',
    justifyContent:
      'center',
    backgroundColor:
      COLORS.blueSoft,
    marginLeft:
      spacing.md,
  },

  /*
   * SUMMARY CARD
   */

  summaryCard: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    borderRadius:
      radius.lg,
    paddingVertical:
      spacing.md,
    paddingHorizontal:
      spacing.sm,
    marginBottom:
      spacing.lg,
  },

  summaryItem: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal:
      spacing.xs,
    justifyContent:
      'center',
  },

  summaryLabel: {
    color:
      COLORS.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.7,
    marginBottom: 7,
  },

  summaryValue: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },

  summaryDivider: {
    width: 1,
    height: 42,
    backgroundColor:
      COLORS.border,
  },

  /*
   * SECTION HEADER
   */

  sectionHeader: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    marginBottom:
      spacing.sm,
  },

  sectionHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  sectionTitle: {
    color:
      COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  sectionSubtitle: {
    color:
      COLORS.textMuted,
    fontSize: 10,
    marginTop: 4,
  },

  countBadge: {
    width: 28,
    height: 28,
    borderRadius:
      radius.pill,
    alignItems: 'center',
    justifyContent:
      'center',
    backgroundColor:
      COLORS.blueSoft,
  },

  countText: {
    color:
      COLORS.blue,
    fontSize: 11,
    fontWeight: '800',
  },

  /*
   * LIST
   */

  list: {
    flex: 1,
  },

  listContent: {
    paddingTop: 2,
    paddingBottom:
      spacing.xl,
  },

  /*
   * VEHICLE CARD
   */

  vehicleCard: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    borderRadius:
      radius.lg,
    paddingHorizontal:
      spacing.md,
    paddingVertical:
      spacing.sm,
    marginBottom:
      spacing.sm,
  },

  /*
   * ICON
   */

  vehicleIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent:
      'center',
    marginRight:
      spacing.md,
    flexShrink: 0,
  },

  /*
   * VEHICLE DETAILS
   */

  vehicleInfo: {
    flex: 1,
    minWidth: 0,
    justifyContent:
      'center',
    paddingRight:
      spacing.xs,
  },

  vehicleName: {
    color:
      COLORS.textPrimary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },

  vehicleId: {
    color:
      COLORS.textMuted,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 5,
  },

  /*
   * SPARKLINE
   */

  sparkline: {
    width:
      SPARKLINE_WIDTH,
    height:
      SPARKLINE_HEIGHT,
    alignItems: 'center',
    justifyContent:
      'center',
    marginHorizontal:
      spacing.sm,
    flexShrink: 0,
  },

  /*
   * RESULT
   */

  resultContainer: {
    width: 78,
    alignItems: 'flex-end',
    justifyContent:
      'center',
    flexShrink: 0,
  },

  resultLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  resultAmount: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    maxWidth: 78,
  },

  /*
   * EMPTY STATE
   */

  emptyState: {
    alignItems: 'center',
    justifyContent:
      'center',
    paddingVertical:
      spacing.xxl,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius:
      radius.lg,
    alignItems: 'center',
    justifyContent:
      'center',
    backgroundColor:
      COLORS.surfaceElevated,
    marginBottom:
      spacing.md,
  },

  emptyTitle: {
    color:
      COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },

  emptySubtitle: {
    color:
      COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },

  /*
   * SCROLL HINT
   */

  scrollHint: {
    color:
      COLORS.textMuted,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
    marginBottom:
      spacing.sm,
  },

  /*
   * BOTTOM NAV
   */

  bottomNavigationSpace: {
    height: 100,
  },
});

export default AccountsScreen;