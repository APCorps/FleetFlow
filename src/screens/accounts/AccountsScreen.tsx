import React, {
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Animated,
  Easing,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  MaterialDesignIcons,
} from '@react-native-vector-icons/material-design-icons/static';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import Svg, {
  Circle,
} from 'react-native-svg';

import {
  useAccounts,
  useVehicles,
} from '../../store';

import {
  radius,
  spacing,
} from '../../theme';

type PeriodKey =
  | 'all'
  | 'month'
  | 'quarter'
  | 'sixMonths'
  | 'year';

type LedgerFilter =
  | 'All'
  | 'Income'
  | 'Expense';

type OverlayKey =
  | null
  | 'performance'
  | 'expenseMix'
  | 'ledger';

type UiState = {
  period: PeriodKey;
  overlay: OverlayKey;
  ledgerVehicleId: string | null;
  ledgerQuery: string;
  ledgerFilter: LedgerFilter;
};

type TransactionRow = {
  key: string;
  id: string;
  type: 'Income' | 'Expense';
  amount: number;
  vehicleId: string | null;
  registrationNumber: string;
  description: string;
  category: string;
  reference: string;
  dateLabel: string;
  dateValue: number | null;
};

type VehicleFinancialData = {
  vehicleId: string;
  registrationNumber: string;
  make: string;
  model: string;
  income: number;
  expenses: number;
  profitLoss: number;
  margin: number;
  transactionCount: number;
};

type CategoryItem = {
  label: string;
  amount: number;
  share: number;
};

type AccountsDerivedData = {
  periodTransactions: TransactionRow[];
  ledgerRows: TransactionRow[];
  recentTransactions: TransactionRow[];
  vehicleFinancialData: VehicleFinancialData[];
  incomeCategories: CategoryItem[];
  expenseCategories: CategoryItem[];
  currentIncome: number;
  currentExpenses: number;
  previousIncome: number;
  previousExpenses: number;
  previousProfit: number | null;
  profitableVehicles: number;
  lossMakingVehicles: number;
  breakEvenVehicles: number;
  periodHasDatedRecords: boolean;
  usingAllTimeFallback: boolean;
};

const COLORS = {
  background: '#050711',
  surface: '#0B1220',
  surfaceElevated: '#10192A',
  border: 'rgba(255,255,255,0.08)',
  borderSoft: 'rgba(255,255,255,0.05)',
  textPrimary: '#F5F7FF',
  textSecondary: '#9AA4BF',
  textMuted: '#6F7892',
  blue: '#5B8CFF',
  blueSoft: 'rgba(91,140,255,0.13)',
  cyan: '#55D6FF',
  green: '#39E6C4',
  greenSoft: 'rgba(57,230,196,0.13)',
  red: '#FF6685',
  redSoft: 'rgba(255,102,133,0.12)',
  amber: '#FFC857',
  amberSoft: 'rgba(255,200,87,0.12)',
  graySoft: 'rgba(154,164,191,0.09)',
  white: '#FFFFFF',
};

const EXPENSE_CATEGORY_COLORS: Record<string, string> = {
  Fuel: '#FFC857',
  Maintenance: '#FF9F1C',
  'Driver costs': '#9B7BFF',
  Tolls: '#55D6FF',
  Other: '#5B8CFF',
};

const getExpenseCategoryColor = (label: string) =>
  EXPENSE_CATEGORY_COLORS[label] || COLORS.textSecondary;

const PERIODS: Array<{
  key: PeriodKey;
  label: string;
}> = [
  {key: 'all', label: 'All time'},
  {key: 'month', label: '1 month'},
  {key: 'quarter', label: '3 months'},
  {key: 'sixMonths', label: '6 months'},
  {key: 'year', label: '1 year'},
];

const LEDGER_FILTERS: LedgerFilter[] = [
  'All',
  'Income',
  'Expense',
];

const safeRecord = (
  transaction: unknown,
): Record<string, unknown> => {
  if (
    typeof transaction === 'object' &&
    transaction !== null
  ) {
    return transaction as Record<string, unknown>;
  }

  return {};
};

const firstString = (
  record: Record<string, unknown>,
  keys: string[],
): string => {
  for (const key of keys) {
    const value = record[key];

    if (
      typeof value === 'string' &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  return '';
};

const getTransactionDateValue = (
  transaction: unknown,
): number | null => {
  const record = safeRecord(transaction);
  const rawValue =
    record.date ??
    record.transactionDate ??
    record.createdAt ??
    record.createdDate;

  if (rawValue instanceof Date) {
    const time = rawValue.getTime();

    return Number.isFinite(time)
      ? time
      : null;
  }

  if (
    typeof rawValue === 'string' ||
    typeof rawValue === 'number'
  ) {
    const time = new Date(rawValue).getTime();

    return Number.isFinite(time)
      ? time
      : null;
  }

  return null;
};

const formatDate = (
  timestamp: number | null,
) => {
  if (!timestamp) {
    return '—';
  }

  return new Date(timestamp).toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  );
};

const formatAmount = (value: number) => {
  return `₹${Math.abs(value).toLocaleString('en-IN')}`;
};

const getResultColor = (value: number) => {
  if (value > 0) {
    return COLORS.green;
  }

  if (value < 0) {
    return COLORS.red;
  }

  return COLORS.textSecondary;
};

const getResultLabel = (value: number) => {
  if (value > 0) {
    return 'PROFIT';
  }

  if (value < 0) {
    return 'LOSS';
  }

  return 'BREAK-EVEN';
};

const getMargin = (
  income: number,
  profitLoss: number,
) => {
  if (income <= 0) {
    return 0;
  }

  return (profitLoss / income) * 100;
};

const getPeriodStart = (
  now: Date,
  period: PeriodKey,
) => {
  const start = new Date(now);

  if (period === 'month') {
    start.setMonth(start.getMonth() - 1);
  }

  if (period === 'quarter') {
    start.setMonth(start.getMonth() - 3);
  }

  if (period === 'sixMonths') {
    start.setMonth(start.getMonth() - 6);
  }

  if (period === 'year') {
    start.setMonth(start.getMonth() - 12);
  }

  return start;
};

const getPreviousPeriodStart = (
  currentStart: Date,
  period: PeriodKey,
) => {
  const start = new Date(currentStart);

  if (period === 'month') {
    start.setMonth(start.getMonth() - 1);
  }

  if (period === 'quarter') {
    start.setMonth(start.getMonth() - 3);
  }

  if (period === 'sixMonths') {
    start.setMonth(start.getMonth() - 6);
  }

  if (period === 'year') {
    start.setMonth(start.getMonth() - 12);
  }

  return start;
};

const sumByType = (
  transactions: TransactionRow[],
  type: 'Income' | 'Expense',
) => {
  return transactions
    .filter(transaction => transaction.type === type)
    .reduce(
      (total, transaction) =>
        total + transaction.amount,
      0,
    );
};

const normalizeCategory = (
  value: string,
  type: 'Income' | 'Expense',
) => {
  const normalized = value
    .trim()
    .toLowerCase();

  if (type === 'Income') {
    if (
      normalized.includes('delivery')
    ) {
      return 'Delivery';
    }

    if (
      normalized.includes('transport') ||
      normalized.includes('freight') ||
      normalized.includes('trip')
    ) {
      return 'Transport';
    }

    return 'Other';
  }

  if (normalized.includes('fuel')) {
    return 'Fuel';
  }

  if (
    normalized.includes('maintenance') ||
    normalized.includes('service') ||
    normalized.includes('repair')
  ) {
    return 'Maintenance';
  }

  if (
    normalized.includes('driver') ||
    normalized.includes('salary') ||
    normalized.includes('wage')
  ) {
    return 'Driver costs';
  }

  if (normalized.includes('toll')) {
    return 'Tolls';
  }

  return 'Other';
};

const getTransactionCategory = (
  transaction: unknown,
  type: 'Income' | 'Expense',
) => {
  const record = safeRecord(transaction);
  const explicitCategory = firstString(
    record,
    [
      'category',
      'expenseCategory',
      'incomeCategory',
    ],
  );

  if (explicitCategory) {
    return normalizeCategory(
      explicitCategory,
      type,
    );
  }

  const description = firstString(
    record,
    [
      'description',
      'title',
      'name',
      'notes',
      'remark',
    ],
  );

  return normalizeCategory(
    description,
    type,
  );
};

const getCategoryItems = (
  transactions: TransactionRow[],
  type: 'Income' | 'Expense',
): CategoryItem[] => {
  const labels =
    type === 'Income'
      ? [
          'Delivery',
          'Transport',
          'Other',
        ]
      : [
          'Fuel',
          'Maintenance',
          'Driver costs',
          'Tolls',
          'Other',
        ];

  const total = sumByType(
    transactions,
    type,
  );

  return labels
    .map(label => {
      const amount = transactions
        .filter(
          transaction =>
            transaction.type === type &&
            transaction.category === label,
        )
        .reduce(
          (sum, transaction) =>
            sum + transaction.amount,
          0,
        );

      return {
        label,
        amount,
        share:
          total > 0
            ? (amount / total) * 100
            : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);
};

const getTrendPercent = (
  current: number,
  previous: number | null,
) => {
  if (
    previous === null ||
    previous === 0
  ) {
    return null;
  }

  return (
    ((current - previous) /
      Math.abs(previous)) *
    100
  );
};

const PerformanceGraph = ({
  income,
  expenses,
  expanded = false,
}: {
  income: number;
  expenses: number;
  expanded?: boolean;
}) => {
  const maxValue = Math.max(
    income,
    expenses,
    1,
  );

  const incomeHeight =
    Math.max(4, (income / maxValue) * 100);
  const expenseHeight =
    Math.max(4, (expenses / maxValue) * 100);

  return (
    <View
      style={[
        styles.graphCanvas,
        expanded && styles.graphCanvasExpanded,
      ]}>
      <View style={styles.graphValueRow}>
        <View style={styles.graphValueBlock}>
          <Text style={styles.graphLabel}>
            REVENUE
          </Text>
          <Text
            style={[
              styles.graphValue,
              {color: COLORS.blue},
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit>
            {formatAmount(income)}
          </Text>
        </View>

        <View
          style={[
            styles.graphValueBlock,
            styles.graphValueBlockRight,
          ]}>
          <Text style={styles.graphLabel}>
            EXPENSES
          </Text>
          <Text
            style={[
              styles.graphValue,
              {color: COLORS.red},
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit>
            {formatAmount(expenses)}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.chartArea,
          expanded && styles.chartAreaExpanded,
        ]}>
        <View style={styles.chartGuideTop} />
        <View style={styles.chartGuideMid} />
        <View style={styles.chartBars}>
          <View
            style={styles.chartColumn}
            accessible
            accessibilityLabel={`Revenue ${formatAmount(
              income,
            )}`}>
            <View
              style={[
                styles.chartBar,
                styles.chartBarRevenue,
                {height: `${incomeHeight}%`},
              ]}
            />
            <Text style={styles.chartAxisLabel}>
              REV
            </Text>
          </View>

          <View
            style={styles.chartColumn}
            accessible
            accessibilityLabel={`Expenses ${formatAmount(
              expenses,
            )}`}>
            <View
              style={[
                styles.chartBar,
                styles.chartBarExpense,
                {height: `${expenseHeight}%`},
              ]}
            />
            <Text style={styles.chartAxisLabel}>
              EXP
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.graphHintRow}>
        <MaterialDesignIcons
          name="gesture-tap"
          size={14}
          color={COLORS.textMuted}
        />
        <Text style={styles.graphHintText}>
          Tap to expand
        </Text>
      </View>
    </View>
  );
};

const ExpenseMixGraph = ({
  categories,
  expanded = false,
}: {
  categories: CategoryItem[];
  expanded?: boolean;
}) => {
  const visible = categories.filter(
    item => item.amount > 0,
  );

  const total = visible.reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  const size = expanded ? 220 : 96;
  const strokeWidth = expanded ? 19 : 12;
  const radiusValue =
    (size - strokeWidth) / 2;
  const circumference =
    2 * Math.PI * radiusValue;
  const gap = expanded ? 4 : 2;

  let runningLength = 0;

  return (
    <View
      style={[
        styles.graphCanvas,
        expanded && styles.graphCanvasExpanded,
      ]}>
      <View style={styles.graphValueRow}>
        <View style={styles.graphValueBlock}>
          <Text style={styles.graphLabel}>
            EXPENSE MIX
          </Text>
          <Text
            style={styles.graphValue}
            numberOfLines={1}
            adjustsFontSizeToFit>
            {formatAmount(total)}
          </Text>
        </View>

        <View
          style={[
            styles.mixHeaderIcon,
            expanded && styles.mixHeaderIconExpanded,
          ]}>
          <MaterialDesignIcons
            name="chart-donut-variant"
            size={expanded ? 22 : 18}
            color={COLORS.amber}
          />
        </View>
      </View>

      {visible.length === 0 ? (
        <View style={styles.graphEmpty}>
          <MaterialDesignIcons
            name="chart-donut-variant"
            size={expanded ? 34 : 26}
            color={COLORS.textMuted}
          />
          <Text style={styles.graphEmptyText}>
            No expense categories yet
          </Text>
        </View>
      ) : (
        <View
          style={[
            styles.donutBody,
            expanded && styles.donutBodyExpanded,
          ]}>
          <View
            style={[
              styles.donut,
              {
                width: size,
                height: size,
              },
            ]}>
            <Svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}>
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radiusValue}
                stroke="#141F32"
                strokeWidth={strokeWidth}
                fill="none"
              />

              {visible.map(item => {
                const rawLength =
                  circumference *
                  (item.share / 100);
                const segmentLength = Math.max(
                  0,
                  rawLength - gap,
                );
                const offset = runningLength;
                runningLength += rawLength;

                return (
                  <Circle
                    key={item.label}
                    cx={size / 2}
                    cy={size / 2}
                    r={radiusValue}
                    stroke={getExpenseCategoryColor(
                      item.label,
                    )}
                    strokeWidth={strokeWidth}
                    strokeLinecap="butt"
                    strokeDasharray={`${segmentLength} ${circumference}`}
                    strokeDashoffset={-offset}
                    fill="none"
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                  />
                );
              })}
            </Svg>

            <View
              style={[
                styles.donutCenter,
                expanded && styles.donutCenterExpanded,
              ]}>
              <Text style={styles.donutCenterLabel}>
                TOTAL
              </Text>
              <Text
                style={[
                  styles.donutCenterValue,
                  expanded &&
                    styles.donutCenterValueExpanded,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit>
                {formatAmount(total)}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.donutLegend,
              expanded && styles.donutLegendExpanded,
            ]}>
            {visible
              .slice(0, expanded ? 5 : 3)
              .map(item => (
                <View
                  key={item.label}
                  style={styles.donutLegendRow}>
                  <View
                    style={[
                      styles.donutLegendDot,
                      {
                        backgroundColor:
                          getExpenseCategoryColor(
                            item.label,
                          ),
                      },
                    ]}
                  />
                  <View
                    style={styles.donutLegendTextWrap}>
                    <Text
                      style={styles.donutLegendLabel}
                      numberOfLines={1}>
                      {item.label}
                    </Text>
                    <Text
                      style={styles.donutLegendShare}
                      numberOfLines={1}>
                      {item.share.toFixed(1)}%
                    </Text>
                  </View>
                  <Text
                    style={styles.donutLegendAmount}
                    numberOfLines={1}>
                    {formatAmount(item.amount)}
                  </Text>
                </View>
              ))}

            {!expanded && visible.length > 3 && (
              <Text style={styles.donutMoreText}>
                +{visible.length - 3} more
              </Text>
            )}
          </View>
        </View>
      )}

      <View style={styles.graphHintRow}>
        <MaterialDesignIcons
          name="gesture-tap"
          size={14}
          color={COLORS.textMuted}
        />
        <Text style={styles.graphHintText}>
          Tap to expand
        </Text>
      </View>
    </View>
  );
};

const CategoryList = ({
  title,
  items,
  color,
}: {
  title: string;
  items: CategoryItem[];
  color: string;
}) => {
  return (
    <View style={styles.breakdownColumn}>
      <Text style={styles.breakdownTitle}>
        {title}
      </Text>

      {items
        .slice(0, 4)
        .map(item => (
          <View
            key={item.label}
            style={styles.breakdownRow}>
            <View
              style={styles.breakdownLabelWrap}>
              <View
                style={[
                  styles.breakdownDot,
                  {backgroundColor: color},
                ]}
              />
              <Text
                style={styles.breakdownLabel}
                numberOfLines={1}>
                {item.label}
              </Text>
            </View>

            <Text
              style={styles.breakdownAmount}
              numberOfLines={1}>
              {formatAmount(item.amount)}
            </Text>
          </View>
        ))}
    </View>
  );
};

const PeriodFilter = ({
  value,
  onChange,
}: {
  value: PeriodKey;
  onChange: (period: PeriodKey) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const heightAnim = useRef(
    new Animated.Value(0),
  ).current;

  const activePeriod =
    PERIODS.find(period => period.key === value) ||
    PERIODS[0];

  const toggleExpanded = () => {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);

    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: nextExpanded ? 58 : 0,
        duration: nextExpanded ? 220 : 180,
        easing: nextExpanded
          ? Easing.out(Easing.cubic)
          : Easing.in(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleSelect = (period: PeriodKey) => {
    onChange(period);

    Animated.timing(heightAnim, {
      toValue: 0,
      duration: 170,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: false,
    }).start(({finished}) => {
      if (finished) {
        setExpanded(false);
      }
    });
  };

  const chevronRotation =
    heightAnim.interpolate({
      inputRange: [0, 58],
      outputRange: ['0deg', '180deg'],
    });

  return (
    <View style={styles.filterWrap}>
      <Pressable
        onPress={toggleExpanded}
        accessibilityRole="button"
        accessibilityState={{expanded}}
        accessibilityLabel={`Financial period filter. Current selection: ${activePeriod.label}`}
        style={({pressed}) => [
          styles.filterToggle,
          pressed && styles.filterTogglePressed,
        ]}>
        <View style={styles.filterToggleLeft}>
          <View style={styles.periodIcon}>
            <MaterialDesignIcons
              name="filter-variant"
              size={17}
              color={COLORS.blue}
            />
          </View>

          <View style={styles.filterToggleTextWrap}>
            <Text style={styles.filterToggleLabel}>
              FINANCIAL FILTER
            </Text>
            <Text
              style={styles.filterToggleValue}
              numberOfLines={1}>
              {activePeriod.label}
            </Text>
          </View>
        </View>

        <Animated.View
          style={{
            transform: [
              {rotate: chevronRotation},
            ],
          }}>
          <MaterialDesignIcons
            name="chevron-down"
            size={20}
            color={COLORS.textSecondary}
          />
        </Animated.View>
      </Pressable>

      <Animated.View
        style={[
          styles.filterPanel,
          {
            height: heightAnim,
            opacity: heightAnim.interpolate({
              inputRange: [0, 58],
              outputRange: [0, 1],
            }),
            transform: [
              {
                translateY: heightAnim.interpolate({
                  inputRange: [0, 58],
                  outputRange: [-5, 0],
                }),
              },
            ],
          },
        ]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.filterOptionsRow
          }>
          {PERIODS.map(period => {
            const active =
              period.key === value;

            return (
              <Pressable
                key={period.key}
                onPress={() =>
                  handleSelect(period.key)
                }
                accessibilityRole="button"
                accessibilityLabel={`Set financial period to ${period.label}`}
                style={({pressed}) => [
                  styles.periodChip,
                  active &&
                    styles.periodChipActive,
                  pressed &&
                    styles.periodChipPressed,
                ]}>
                <Text
                  style={[
                    styles.periodChipText,
                    active &&
                      styles.periodChipTextActive,
                  ]}>
                  {period.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const AccountsScreen = () => {
  const {vehicles} = useVehicles();

  const {
    transactions,
    totalIncome,
    totalExpenses,
  } = useAccounts();

  const [ui, setUi] = useState<UiState>({
    period: 'all',
    overlay: null,
    ledgerVehicleId: null,
    ledgerQuery: '',
    ledgerFilter: 'All',
  });

  const overlayAnim = useRef(
    new Animated.Value(0),
  ).current;

  const derived = useMemo<AccountsDerivedData>(() => {
    const now = new Date();
    const rawTransactions = Array.isArray(
      transactions,
    )
      ? transactions
      : [];

    const baseRows: TransactionRow[] =
      rawTransactions.map(
        (transaction, index) => {
          const record = safeRecord(
            transaction,
          );
          const type =
            record.type === 'Income'
              ? 'Income'
              : 'Expense';
          const dateValue =
            getTransactionDateValue(
              transaction,
            );
          const vehicleId =
            typeof record.vehicleId === 'string'
              ? record.vehicleId
              : null;
          const id =
            firstString(record, ['id']) ||
            `transaction-${index}`;

          const registrationNumber =
            vehicleId
              ? vehicles.find(
                  vehicle =>
                    vehicle.id === vehicleId,
                )?.registrationNumber ||
                'Unassigned vehicle'
              : 'Unassigned vehicle';

          const description =
            firstString(record, [
              'description',
              'title',
              'name',
              'notes',
              'remark',
            ]) || 'Account transaction';

          const reference =
            firstString(record, [
              'reference',
              'referenceNumber',
              'ref',
              'transactionId',
            ]) || '—';

          const amount =
            typeof record.amount === 'number'
              ? record.amount
              : Number(record.amount) || 0;

          return {
            key: `${id}-${index}`,
            id,
            type,
            amount: Math.abs(amount),
            vehicleId,
            registrationNumber,
            description,
            category:
              getTransactionCategory(
                transaction,
                type,
              ),
            reference,
            dateLabel:
              formatDate(dateValue),
            dateValue,
          };
        },
      );

    const datedCount = baseRows.filter(
      row => row.dateValue !== null,
    ).length;

    const periodStart =
      getPeriodStart(now, ui.period);

    const previousStart =
      getPreviousPeriodStart(
        periodStart,
        ui.period,
      );

    const usingAllTimeFallback =
      ui.period !== 'all' &&
      datedCount === 0;

    const periodRows =
      usingAllTimeFallback || ui.period === 'all'
        ? baseRows
        : baseRows.filter(row => {
            if (row.dateValue === null) {
              return false;
            }

            return (
              row.dateValue >=
                periodStart.getTime() &&
              row.dateValue <= now.getTime()
            );
          });

    const previousRows =
      ui.period === 'all' ||
      usingAllTimeFallback
        ? []
        : baseRows.filter(row => {
            if (row.dateValue === null) {
              return false;
            }

            return (
              row.dateValue >=
                previousStart.getTime() &&
              row.dateValue <
                periodStart.getTime()
            );
          });

    const currentIncome =
      ui.period === 'all' ||
      usingAllTimeFallback
        ? totalIncome
        : sumByType(periodRows, 'Income');

    const currentExpenses =
      ui.period === 'all' ||
      usingAllTimeFallback
        ? totalExpenses
        : sumByType(periodRows, 'Expense');

    const previousIncome = sumByType(
      previousRows,
      'Income',
    );

    const previousExpenses = sumByType(
      previousRows,
      'Expense',
    );

    const periodRowsDescending = [
      ...periodRows,
    ].sort(
      (a, b) =>
        (b.dateValue ?? 0) -
        (a.dateValue ?? 0),
    );

    const filteredLedgerRows =
      periodRowsDescending.filter(row => {
        const matchesVehicle =
          ui.ledgerVehicleId === null ||
          row.vehicleId ===
            ui.ledgerVehicleId;

        const matchesType =
          ui.ledgerFilter === 'All' ||
          row.type === ui.ledgerFilter;

        const query =
          ui.ledgerQuery.trim().toLowerCase();

        const matchesQuery =
          !query ||
          [
            row.description,
            row.registrationNumber,
            row.category,
            row.reference,
          ].some(value =>
            value
              .toLowerCase()
              .includes(query),
          );

        return (
          matchesVehicle &&
          matchesType &&
          matchesQuery
        );
      });

    const periodTransactions =
      periodRowsDescending;

    const vehicleFinancialData: VehicleFinancialData[] =
      vehicles.map(vehicle => {
        const vehicleTransactions =
          periodTransactions.filter(
            transaction =>
              transaction.vehicleId === vehicle.id,
          );

        const income = sumByType(
          vehicleTransactions,
          'Income',
        );

        const expenses = sumByType(
          vehicleTransactions,
          'Expense',
        );

        const profitLoss =
          income - expenses;

        return {
          vehicleId: vehicle.id,
          registrationNumber:
            vehicle.registrationNumber,
          make: vehicle.make,
          model: vehicle.model,
          income,
          expenses,
          profitLoss,
          margin: getMargin(
            income,
            profitLoss,
          ),
          transactionCount:
            vehicleTransactions.length,
        };
      });

    const periodProfit =
      currentIncome - currentExpenses;
    const previousProfit =
      ui.period === 'all' ||
      usingAllTimeFallback
        ? null
        : previousIncome - previousExpenses;

    const incomeCategories =
      getCategoryItems(
        periodTransactions,
        'Income',
      );
    const expenseCategories =
      getCategoryItems(
        periodTransactions,
        'Expense',
      );

    return {
      periodTransactions,
      ledgerRows: filteredLedgerRows,
      recentTransactions:
        periodTransactions.slice(0, 6),
      vehicleFinancialData,
      incomeCategories,
      expenseCategories,
      currentIncome,
      currentExpenses,
      previousIncome,
      previousExpenses,
      previousProfit,
      profitableVehicles:
        vehicleFinancialData.filter(
          vehicle => vehicle.profitLoss > 0,
        ).length,
      lossMakingVehicles:
        vehicleFinancialData.filter(
          vehicle => vehicle.profitLoss < 0,
        ).length,
      breakEvenVehicles:
        vehicleFinancialData.filter(
          vehicle => vehicle.profitLoss === 0,
        ).length,
      periodHasDatedRecords:
        datedCount > 0,
      usingAllTimeFallback,
    };
  }, [
    transactions,
    vehicles,
    totalIncome,
    totalExpenses,
    ui.period,
    ui.ledgerVehicleId,
    ui.ledgerQuery,
    ui.ledgerFilter,
  ]);

  const netProfitLoss =
    derived.currentIncome -
    derived.currentExpenses;

  const netMargin =
    derived.currentIncome > 0
      ? (netProfitLoss /
          derived.currentIncome) *
        100
      : 0;

  const netColor =
    getResultColor(netProfitLoss);

  const totalTransactions =
    derived.periodTransactions.length;

  const netTrend = getTrendPercent(
    netProfitLoss,
    derived.previousProfit,
  );

  const highestExpenseCategory =
    derived.expenseCategories.find(
      item => item.amount > 0,
    ) || null;

  const shouldFlagLowMargin =
    netProfitLoss >= 0 &&
    derived.currentIncome > 0 &&
    netMargin < 10;

  const shouldFlagLossFleet =
    derived.lossMakingVehicles > 0;

  const shouldFlagExpenseConcentration =
    highestExpenseCategory !== null &&
    highestExpenseCategory.share >= 45;

  const hasAlerts =
    shouldFlagLossFleet ||
    shouldFlagLowMargin ||
    shouldFlagExpenseConcentration ||
    netProfitLoss < 0;

  const activeLedgerVehicle =
    ui.ledgerVehicleId
      ? vehicles.find(
          vehicle =>
            vehicle.id === ui.ledgerVehicleId,
        )
      : null;

  const openOverlay = (
    overlay: Exclude<OverlayKey, null>,
    vehicleId: string | null = null,
  ) => {
    overlayAnim.setValue(0);

    setUi(previous => ({
      ...previous,
      overlay,
      ledgerVehicleId:
        overlay === 'ledger'
          ? vehicleId
          : previous.ledgerVehicleId,
      ledgerQuery:
        overlay === 'ledger'
          ? ''
          : previous.ledgerQuery,
      ledgerFilter:
        overlay === 'ledger'
          ? 'All'
          : previous.ledgerFilter,
    }));
  };

  const animateOverlayIn = () => {
    Animated.parallel([
      Animated.timing(
        overlayAnim,
        {
          toValue: 1,
          duration: 230,
          easing: Easing.out(
            Easing.cubic,
          ),
          useNativeDriver: true,
        },
      ),
    ]).start();
  };

  const closeOverlay = () => {
    Animated.timing(
      overlayAnim,
      {
        toValue: 0,
        duration: 170,
        easing: Easing.in(
          Easing.cubic,
        ),
        useNativeDriver: true,
      },
    ).start(() => {
      setUi(previous => ({
        ...previous,
        overlay: null,
      }));
    });
  };

  const overlayScale =
    overlayAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.94, 1],
    });

  const overlayTranslateY =
    overlayAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 0],
    });

  const periodLabel =
    PERIODS.find(
      period => period.key === ui.period,
    )?.label || 'All time';

  const trendLabel =
    netTrend === null
      ? ui.period === 'all'
        ? 'Current ledger'
        : 'No previous period'
      : `${netTrend >= 0 ? '+' : ''}${netTrend.toFixed(
          1,
        )}% vs previous`;

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: 116,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>
              FLEET FINANCIALS
            </Text>
            <Text style={styles.title}>
              Accounts
            </Text>
            <Text style={styles.subtitle}>
              Margin, cost control and vehicle profitability
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

        <PeriodFilter
          value={ui.period}
          onChange={period =>
            setUi(previous => ({
              ...previous,
              period,
            }))
          }
        />

        {ui.period !== 'all' &&
          derived.usingAllTimeFallback && (
            <View style={styles.dataNote}>
              <MaterialDesignIcons
                name="information-outline"
                size={15}
                color={COLORS.cyan}
              />
              <Text style={styles.dataNoteText}>
                No dated transactions are available yet, so the selected period is showing the current ledger.
              </Text>
            </View>
          )}

        <View style={styles.summaryCard}>
          <View style={styles.summaryMetric}>
            <Text style={styles.summaryLabel}>
              REVENUE
            </Text>
            <Text
              style={[
                styles.summaryValue,
                {color: COLORS.blue},
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit>
              {formatAmount(
                derived.currentIncome,
              )}
            </Text>
            <Text style={styles.summaryMeta}>
              {periodLabel}
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryMetric}>
            <Text style={styles.summaryLabel}>
              EXPENSES
            </Text>
            <Text
              style={[
                styles.summaryValue,
                {color: COLORS.red},
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit>
              {formatAmount(
                derived.currentExpenses,
              )}
            </Text>
            <Text style={styles.summaryMeta}>
              Operating costs
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryMetric}>
            <Text style={styles.summaryLabel}>
              NET PROFIT
            </Text>
            <Text
              style={[
                styles.summaryValue,
                {color: netColor},
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit>
              {netProfitLoss < 0 ? '-' : ''}
              {formatAmount(netProfitLoss)}
            </Text>
            <Text style={styles.summaryMeta}>
              {trendLabel}
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryMetric}>
            <Text style={styles.summaryLabel}>
              MARGIN
            </Text>
            <Text
              style={[
                styles.summaryValue,
                {
                  color:
                    netMargin >= 0
                      ? COLORS.green
                      : COLORS.red,
                },
              ]}>
              {netMargin.toFixed(1)}%
            </Text>
            <Text style={styles.summaryMeta}>
              {totalTransactions} records
            </Text>
          </View>
        </View>

        <View style={styles.insightStrip}>
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>
              PROFITABLE
            </Text>
            <Text
              style={[
                styles.insightValue,
                {color: COLORS.green},
              ]}>
              {derived.profitableVehicles}
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>
              LOSS-MAKING
            </Text>
            <Text
              style={[
                styles.insightValue,
                {color: COLORS.red},
              ]}>
              {derived.lossMakingVehicles}
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>
              BREAK-EVEN
            </Text>
            <Text
              style={[
                styles.insightValue,
                {color: COLORS.textSecondary},
              ]}>
              {derived.breakEvenVehicles}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionTitle}>
              FINANCIAL VIEW
            </Text>
            <Text style={styles.sectionSubtitle}>
              Two focused charts. Tap either for the full view.
            </Text>
          </View>
        </View>

        <View style={styles.graphGrid}>
          <Pressable
            onPress={() =>
              openOverlay('performance')
            }
            accessibilityRole="button"
            accessibilityLabel="Expand revenue and expense performance chart"
            style={({pressed}) => [
              styles.graphCard,
              pressed && styles.graphCardPressed,
            ]}>
            <Text style={styles.graphCardTitle}>
              PERFORMANCE
            </Text>
            <PerformanceGraph
              income={derived.currentIncome}
              expenses={derived.currentExpenses}
            />
          </Pressable>

          <Pressable
            onPress={() =>
              openOverlay('expenseMix')
            }
            accessibilityRole="button"
            accessibilityLabel="Expand expense mix chart"
            style={({pressed}) => [
              styles.graphCard,
              pressed && styles.graphCardPressed,
            ]}>
            <Text style={styles.graphCardTitle}>
              EXPENSE MIX
            </Text>
            <ExpenseMixGraph
              categories={
                derived.expenseCategories
              }
            />
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionTitle}>
              FINANCIAL BREAKDOWN
            </Text>
            <Text style={styles.sectionSubtitle}>
              Where revenue comes from and where costs go.
            </Text>
          </View>
        </View>

        <View style={styles.breakdownCard}>
          <CategoryList
            title="REVENUE"
            items={derived.incomeCategories}
            color={COLORS.blue}
          />
          <View style={styles.breakdownDivider} />
          <CategoryList
            title="EXPENSES"
            items={derived.expenseCategories}
            color={COLORS.red}
          />
        </View>

        {hasAlerts && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>
                  ATTENTION REQUIRED
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Finance items worth a closer look.
                </Text>
              </View>
              <View style={styles.alertBadge}>
                <MaterialDesignIcons
                  name="alert-outline"
                  size={15}
                  color={COLORS.amber}
                />
              </View>
            </View>

            <View style={styles.alertCard}>
              {netProfitLoss < 0 && (
                <View style={styles.alertRow}>
                  <View
                    style={[
                      styles.alertIcon,
                      {
                        backgroundColor:
                          COLORS.redSoft,
                      },
                    ]}>
                    <MaterialDesignIcons
                      name="trending-down"
                      size={18}
                      color={COLORS.red}
                    />
                  </View>
                  <View style={styles.alertTextWrap}>
                    <Text style={styles.alertTitle}>
                      Fleet is currently loss-making
                    </Text>
                    <Text style={styles.alertSubtitle}>
                      Net position is {formatAmount(
                        Math.abs(netProfitLoss),
                      )}{' '}
                      below zero for the selected period.
                    </Text>
                  </View>
                </View>
              )}

              {shouldFlagLossFleet && (
                <View style={styles.alertRow}>
                  <View
                    style={[
                      styles.alertIcon,
                      {
                        backgroundColor:
                          COLORS.redSoft,
                      },
                    ]}>
                    <MaterialDesignIcons
                      name="truck-alert-outline"
                      size={18}
                      color={COLORS.red}
                    />
                  </View>
                  <View style={styles.alertTextWrap}>
                    <Text style={styles.alertTitle}>
                      {derived.lossMakingVehicles} vehicle{derived.lossMakingVehicles === 1 ? '' : 's'} need review
                    </Text>
                    <Text style={styles.alertSubtitle}>
                      Open vehicle profitability to inspect the underlying ledger.
                    </Text>
                  </View>
                </View>
              )}

              {shouldFlagExpenseConcentration &&
                highestExpenseCategory && (
                  <View style={styles.alertRow}>
                    <View
                      style={[
                        styles.alertIcon,
                        {
                          backgroundColor:
                            COLORS.amberSoft,
                        },
                      ]}>
                      <MaterialDesignIcons
                        name="chart-donut-variant"
                        size={18}
                        color={COLORS.amber}
                      />
                    </View>
                    <View style={styles.alertTextWrap}>
                      <Text style={styles.alertTitle}>
                        {highestExpenseCategory.label} is the main cost driver
                      </Text>
                      <Text style={styles.alertSubtitle}>
                        {highestExpenseCategory.share.toFixed(1)}% of expenses sit in this category.
                      </Text>
                    </View>
                  </View>
                )}

              {shouldFlagLowMargin && (
                <View style={styles.alertRow}>
                  <View
                    style={[
                      styles.alertIcon,
                      {
                        backgroundColor:
                          COLORS.amberSoft,
                      },
                    ]}>
                    <MaterialDesignIcons
                      name="percent-outline"
                      size={18}
                      color={COLORS.amber}
                    />
                  </View>
                  <View style={styles.alertTextWrap}>
                    <Text style={styles.alertTitle}>
                      Margin is below 10%
                    </Text>
                    <Text style={styles.alertSubtitle}>
                      Current net margin is {netMargin.toFixed(1)}% for the selected period.
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </>
        )}

        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionTitle}>
              VEHICLE PROFITABILITY
            </Text>
            <Text style={styles.sectionSubtitle}>
              Tap a vehicle to open its financial ledger.
            </Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {derived.vehicleFinancialData.length}
            </Text>
          </View>
        </View>

        {derived.vehicleFinancialData.map(
          vehicle => {
            const color =
              getResultColor(
                vehicle.profitLoss,
              );

            return (
              <Pressable
                key={vehicle.vehicleId}
                onPress={() =>
                  openOverlay(
                    'ledger',
                    vehicle.vehicleId,
                  )
                }
                accessibilityRole="button"
                accessibilityLabel={`Open financial ledger for ${vehicle.registrationNumber}`}
                style={({pressed}) => [
                  styles.vehicleCard,
                  pressed &&
                    styles.vehicleCardPressed,
                ]}>
                <View
                  style={styles.vehicleTopRow}>
                  <View
                    style={styles.vehicleIdentity}>
                    <View
                      style={[
                        styles.vehicleIcon,
                        {
                          backgroundColor:
                            vehicle.profitLoss >
                            0
                              ? COLORS.greenSoft
                              : vehicle.profitLoss <
                                0
                              ? COLORS.redSoft
                              : COLORS.graySoft,
                        },
                      ]}>
                      <MaterialDesignIcons
                        name="truck-outline"
                        size={21}
                        color={color}
                      />
                    </View>

                    <View
                      style={
                        styles.vehicleIdentityText
                      }>
                      <Text
                        style={
                          styles.vehicleRegistration
                        }
                        numberOfLines={1}>
                        {
                          vehicle.registrationNumber
                        }
                      </Text>
                      <Text
                        style={
                          styles.vehicleModel
                        }
                        numberOfLines={1}>
                        {vehicle.make}{' '}
                        {vehicle.model}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={styles.vehicleResult}>
                    <Text
                      style={[
                        styles.vehicleResultLabel,
                        {color},
                      ]}>
                      {getResultLabel(
                        vehicle.profitLoss,
                      )}
                    </Text>
                    <MaterialDesignIcons
                      name="chevron-right"
                      size={18}
                      color={COLORS.textMuted}
                    />
                  </View>
                </View>

                <View
                  style={styles.vehicleMetrics}>
                  <View
                    style={styles.vehicleMetric}>
                    <Text
                      style={
                        styles.vehicleMetricLabel
                      }>
                      REVENUE
                    </Text>
                    <Text
                      style={
                        styles.vehicleMetricValue
                      }
                      numberOfLines={1}
                      adjustsFontSizeToFit>
                      {formatAmount(
                        vehicle.income,
                      )}
                    </Text>
                  </View>

                  <View
                    style={styles.vehicleMetric}>
                    <Text
                      style={
                        styles.vehicleMetricLabel
                      }>
                      EXPENSES
                    </Text>
                    <Text
                      style={[
                        styles.vehicleMetricValue,
                        {color: COLORS.red},
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit>
                      {formatAmount(
                        vehicle.expenses,
                      )}
                    </Text>
                  </View>

                  <View
                    style={styles.vehicleMetric}>
                    <Text
                      style={
                        styles.vehicleMetricLabel
                      }>
                      PROFIT
                    </Text>
                    <Text
                      style={[
                        styles.vehicleMetricValue,
                        {color},
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

                  <View
                    style={styles.vehicleMetric}>
                    <Text
                      style={
                        styles.vehicleMetricLabel
                      }>
                      MARGIN
                    </Text>
                    <Text
                      style={[
                        styles.vehicleMetricValue,
                        {
                          color:
                            vehicle.margin >=
                            0
                              ? COLORS.green
                              : COLORS.red,
                        },
                      ]}>
                      {vehicle.margin.toFixed(
                        1,
                      )}
                      %
                    </Text>
                  </View>
                </View>

                <View
                  style={styles.vehicleBottomRow}>
                  <View
                    style={styles.vehicleActivity}>
                    <MaterialDesignIcons
                      name="receipt-text-outline"
                      size={14}
                      color={COLORS.textMuted}
                    />
                    <Text
                      style={
                        styles.vehicleActivityText
                      }>
                      {vehicle.transactionCount}{' '}
                      record
                      {vehicle.transactionCount ===
                      1
                        ? ''
                        : 's'}
                    </Text>
                  </View>

                  <Text
                    style={styles.vehicleHint}>
                    View ledger
                  </Text>
                </View>
              </Pressable>
            );
          },
        )}

        {derived.vehicleFinancialData.length ===
          0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <MaterialDesignIcons
                name="finance"
                size={30}
                color={COLORS.textMuted}
              />
            </View>
            <Text style={styles.emptyTitle}>
              No financial records yet
            </Text>
            <Text style={styles.emptySubtitle}>
              Vehicle profitability will appear here once account records are available.
            </Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionTitle}>
              RECENT TRANSACTIONS
            </Text>
            <Text style={styles.sectionSubtitle}>
              Latest activity for the selected period.
            </Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {totalTransactions}
            </Text>
          </View>
        </View>

        <View style={styles.recentCard}>
          {derived.recentTransactions.length === 0 ? (
            <View style={styles.recentEmpty}>
              <Text style={styles.recentEmptyText}>
                No transactions in this period.
              </Text>
            </View>
          ) : (
            derived.recentTransactions.map(
              (transaction, index) => (
                <View
                  key={transaction.key}
                  style={[
                    styles.transactionRow,
                    index > 0 &&
                      styles.transactionRowBorder,
                  ]}>
                  <View
                    style={[
                      styles.transactionIcon,
                      {
                        backgroundColor:
                          transaction.type ===
                          'Income'
                            ? COLORS.greenSoft
                            : COLORS.redSoft,
                      },
                    ]}>
                    <MaterialDesignIcons
                      name={
                        transaction.type ===
                        'Income'
                          ? 'arrow-bottom-left'
                          : 'arrow-top-right'
                      }
                      size={16}
                      color={
                        transaction.type ===
                        'Income'
                          ? COLORS.green
                          : COLORS.red
                      }
                    />
                  </View>

                  <View
                    style={styles.transactionInfo}>
                    <Text
                      style={
                        styles.transactionTitle
                      }
                      numberOfLines={1}>
                      {
                        transaction.description
                      }
                    </Text>
                    <Text
                      style={
                        styles.transactionMeta
                      }
                      numberOfLines={1}>
                      {transaction.registrationNumber}{' '}
                      ·{' '}
                      {transaction.category}{' '}
                      ·{' '}
                      {transaction.dateLabel}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.transactionAmount,
                      {
                        color:
                          transaction.type ===
                          'Income'
                            ? COLORS.green
                            : COLORS.red,
                      },
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit>
                    {transaction.type ===
                    'Income'
                      ? '+'
                      : '-'}
                    {formatAmount(
                      transaction.amount,
                    )}
                  </Text>
                </View>
              ),
            )
          )}
        </View>

        <Pressable
          onPress={() =>
            openOverlay('ledger')
          }
          accessibilityRole="button"
          accessibilityLabel="Open full financial ledger"
          style={({pressed}) => [
            styles.ledgerButton,
            pressed && styles.ledgerButtonPressed,
          ]}>
          <MaterialDesignIcons
            name="table-eye"
            size={18}
            color={COLORS.blue}
          />
          <Text style={styles.ledgerButtonText}>
            View full ledger
          </Text>
          <MaterialDesignIcons
            name="arrow-right"
            size={18}
            color={COLORS.blue}
          />
        </Pressable>
      </ScrollView>

      <Modal
        visible={ui.overlay !== null}
        transparent
        animationType="none"
        onRequestClose={closeOverlay}
        onShow={animateOverlayIn}
        statusBarTranslucent
        navigationBarTranslucent>
        <SafeAreaView
          style={styles.modalSafeArea}
          edges={['top', 'bottom']}>
          <View style={styles.modalRoot}>
          <Animated.View
            style={[
              styles.modalBackdrop,
              {
                opacity: overlayAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.82],
                }),
              },
            ]}
          />

          <Pressable
            style={styles.modalDismissArea}
            onPress={closeOverlay}
            accessibilityRole="button"
            accessibilityLabel="Close overlay"
          />

          <Animated.View
            style={[
              styles.modalCard,
              ui.overlay === 'ledger' &&
                styles.modalCardLedger,
              {
                opacity: overlayAnim,
                transform: [
                  {
                    scale: overlayScale,
                  },
                  {
                    translateY:
                      overlayTranslateY,
                  },
                ],
              },
            ]}>
            {ui.overlay === 'performance' && (
              <>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalEyebrow}>
                      FINANCIAL PERFORMANCE
                    </Text>
                    <Text style={styles.modalTitle}>
                      Revenue vs expenses
                    </Text>
                    <Text style={styles.modalSubtitle}>
                      {periodLabel}
                    </Text>
                  </View>
                  <Pressable
                    onPress={closeOverlay}
                    accessibilityRole="button"
                    accessibilityLabel="Close performance chart"
                    style={styles.modalCloseButton}>
                    <MaterialDesignIcons
                      name="close"
                      size={19}
                      color={COLORS.textSecondary}
                    />
                  </Pressable>
                </View>

                <PerformanceGraph
                  income={derived.currentIncome}
                  expenses={derived.currentExpenses}
                  expanded
                />

                <View style={styles.modalFooterRow}>
                  <View style={styles.modalLegendItem}>
                    <View
                      style={[
                        styles.legendDot,
                        {
                          backgroundColor:
                            COLORS.blue,
                        },
                      ]}
                    />
                    <Text style={styles.modalLegendText}>
                      Revenue
                    </Text>
                  </View>
                  <View style={styles.modalLegendItem}>
                    <View
                      style={[
                        styles.legendDot,
                        {
                          backgroundColor:
                            COLORS.red,
                        },
                      ]}
                    />
                    <Text style={styles.modalLegendText}>
                      Expenses
                    </Text>
                  </View>
                </View>
              </>
            )}

            {ui.overlay === 'expenseMix' && (
              <>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalEyebrow}>
                      EXPENSE BREAKDOWN
                    </Text>
                    <Text style={styles.modalTitle}>
                      Cost mix
                    </Text>
                    <Text style={styles.modalSubtitle}>
                      {periodLabel}
                    </Text>
                  </View>
                  <Pressable
                    onPress={closeOverlay}
                    accessibilityRole="button"
                    accessibilityLabel="Close expense mix chart"
                    style={styles.modalCloseButton}>
                    <MaterialDesignIcons
                      name="close"
                      size={19}
                      color={COLORS.textSecondary}
                    />
                  </Pressable>
                </View>

                <ExpenseMixGraph
                  categories={
                    derived.expenseCategories
                  }
                  expanded
                />

                <View style={styles.breakdownSummaryRow}>
                  <Text style={styles.breakdownSummaryLabel}>
                    Total expenses
                  </Text>
                  <Text style={styles.breakdownSummaryValue}>
                    {formatAmount(
                      derived.currentExpenses,
                    )}
                  </Text>
                </View>
              </>
            )}

            {ui.overlay === 'ledger' && (
              <View style={styles.ledgerOverlayBody}>
                <View style={styles.modalHeader}>
                  <View style={styles.ledgerModalHeaderText}>
                    <Text style={styles.modalEyebrow}>
                      FINANCIAL LEDGER
                    </Text>
                    <Text
                      style={styles.modalTitle}
                      numberOfLines={1}>
                      {activeLedgerVehicle
                        ? activeLedgerVehicle.registrationNumber
                        : 'All transactions'}
                    </Text>
                    <Text style={styles.modalSubtitle}>
                      {activeLedgerVehicle
                        ? `${activeLedgerVehicle.make} ${activeLedgerVehicle.model}`
                        : periodLabel}
                    </Text>
                  </View>
                  <Pressable
                    onPress={closeOverlay}
                    accessibilityRole="button"
                    accessibilityLabel="Close financial ledger"
                    style={styles.modalCloseButton}>
                    <MaterialDesignIcons
                      name="close"
                      size={19}
                      color={COLORS.textSecondary}
                    />
                  </Pressable>
                </View>

                <View style={styles.ledgerSearchBox}>
                  <MaterialDesignIcons
                    name="magnify"
                    size={18}
                    color={COLORS.textMuted}
                  />
                  <TextInput
                    value={ui.ledgerQuery}
                    onChangeText={value =>
                      setUi(previous => ({
                        ...previous,
                        ledgerQuery: value,
                      }))
                    }
                    placeholder="Search description, vehicle or reference"
                    placeholderTextColor={
                      COLORS.textMuted
                    }
                    style={styles.ledgerSearchInput}
                    accessibilityLabel="Search financial ledger"
                  />
                  {ui.ledgerQuery.length > 0 && (
                    <Pressable
                      onPress={() =>
                        setUi(previous => ({
                          ...previous,
                          ledgerQuery: '',
                        }))
                      }
                      accessibilityRole="button"
                      accessibilityLabel="Clear ledger search"
                      style={styles.searchClearButton}>
                      <MaterialDesignIcons
                        name="close-circle"
                        size={18}
                        color={COLORS.textMuted}
                      />
                    </Pressable>
                  )}
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={
                    styles.ledgerFilterRow
                  }>
                  {LEDGER_FILTERS.map(filter => {
                    const active =
                      filter ===
                      ui.ledgerFilter;

                    return (
                      <Pressable
                        key={filter}
                        onPress={() =>
                          setUi(previous => ({
                            ...previous,
                            ledgerFilter:
                              filter,
                          }))
                        }
                        style={[
                          styles.ledgerFilterChip,
                          active &&
                            styles.ledgerFilterChipActive,
                        ]}>
                        <Text
                          style={[
                            styles.ledgerFilterText,
                            active &&
                              styles.ledgerFilterTextActive,
                          ]}>
                          {filter}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                <View style={styles.ledgerStatsRow}>
                  <Text style={styles.ledgerStatsText}>
                    {derived.ledgerRows.length}{' '}
                    matching record
                    {derived.ledgerRows.length === 1
                      ? ''
                      : 's'}
                  </Text>
                  <Text style={styles.ledgerStatsText}>
                    {activeLedgerVehicle
                      ? activeLedgerVehicle.registrationNumber
                      : periodLabel}
                  </Text>
                </View>

                <FlatList
                  data={derived.ledgerRows}
                  keyExtractor={item => item.key}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={
                    styles.ledgerList
                  }
                  initialNumToRender={16}
                  maxToRenderPerBatch={16}
                  windowSize={7}
                  ListEmptyComponent={
                    <View style={styles.ledgerEmpty}>
                      <MaterialDesignIcons
                        name="file-search-outline"
                        size={30}
                        color={COLORS.textMuted}
                      />
                      <Text style={styles.ledgerEmptyTitle}>
                        No matching transactions
                      </Text>
                      <Text style={styles.ledgerEmptyText}>
                        Try another search or filter.
                      </Text>
                    </View>
                  }
                  renderItem={({item}) => (
                    <View style={styles.ledgerRow}>
                      <View
                        style={[
                          styles.ledgerTypeIcon,
                          {
                            backgroundColor:
                              item.type ===
                              'Income'
                                ? COLORS.greenSoft
                                : COLORS.redSoft,
                          },
                        ]}>
                        <MaterialDesignIcons
                          name={
                            item.type ===
                            'Income'
                              ? 'arrow-bottom-left'
                              : 'arrow-top-right'
                          }
                          size={16}
                          color={
                            item.type ===
                            'Income'
                              ? COLORS.green
                              : COLORS.red
                          }
                        />
                      </View>

                      <View
                        style={
                          styles.ledgerMain
                        }>
                        <Text
                          style={
                            styles.ledgerTitle
                          }
                          numberOfLines={1}>
                          {item.description}
                        </Text>
                        <Text
                          style={
                            styles.ledgerMeta
                          }
                          numberOfLines={1}>
                          {item.dateLabel}{' '}
                          ·{' '}
                          {item.registrationNumber}{' '}
                          ·{' '}
                          {item.category}
                        </Text>
                        <Text
                          style={
                            styles.ledgerReference
                          }
                          numberOfLines={1}>
                          Ref {item.reference}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.ledgerAmount,
                          {
                            color:
                              item.type ===
                              'Income'
                                ? COLORS.green
                                : COLORS.red,
                          },
                        ]}
                        numberOfLines={1}
                        adjustsFontSizeToFit>
                        {item.type === 'Income'
                          ? '+'
                          : '-'}
                        {formatAmount(
                          item.amount,
                        )}
                      </Text>
                    </View>
                  )}
                />
              </View>
            )}
          </Animated.View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
  },

  header: {
    minHeight: 76,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerText: {
    flex: 1,
    minWidth: 0,
    paddingRight: spacing.md,
  },

  eyebrow: {
    marginBottom: 3,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: COLORS.blue,
  },

  title: {
    fontSize: 29,
    lineHeight: 34,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textSecondary,
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.blueSoft,
    borderWidth: 1,
    borderColor: 'rgba(91,140,255,0.22)',
  },

  periodRow: {
    minHeight: 42,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  filterWrap: {
    marginBottom: 10,
  },

  filterToggle: {
    minHeight: 46,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  filterTogglePressed: {
    opacity: 0.86,
    transform: [{scale: 0.992}],
  },

  filterToggleLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },

  filterToggleTextWrap: {
    flex: 1,
    minWidth: 0,
    marginLeft: spacing.sm,
  },

  filterToggleLabel: {
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '800',
    letterSpacing: 0.65,
    color: COLORS.textMuted,
  },

  filterToggleValue: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  filterPanel: {
    overflow: 'hidden',
    marginTop: 6,
    borderRadius: radius.md,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },

  filterOptionsRow: {
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: spacing.sm,
  },

  periodChipPressed: {
    opacity: 0.78,
    transform: [{scale: 0.985}],
  },

  periodIcon: {
    width: 34,
    height: 34,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: COLORS.blueSoft,
  },

  periodChips: {
    paddingRight: 6,
    gap: 7,
  },

  periodChip: {
    minHeight: 32,
    paddingHorizontal: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },

  periodChipActive: {
    backgroundColor: COLORS.blueSoft,
    borderColor: 'rgba(91,140,255,0.28)',
  },

  periodChipText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },

  periodChipTextActive: {
    color: COLORS.blue,
  },

  dataNote: {
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: 'rgba(85,214,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(85,214,255,0.13)',
  },

  dataNoteText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 10,
    lineHeight: 14,
    color: COLORS.textSecondary,
  },

  summaryCard: {
    marginBottom: 10,
    paddingHorizontal: 2,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: radius.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  summaryMetric: {
    flex: 1,
    minWidth: 0,
    minHeight: 88,
    paddingHorizontal: 9,
    paddingVertical: 11,
    justifyContent: 'center',
  },

  summaryDivider: {
    width: 1,
    marginVertical: 16,
    backgroundColor: COLORS.borderSoft,
  },

  summaryLabel: {
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '800',
    letterSpacing: 0.65,
    color: COLORS.textMuted,
  },

  summaryValue: {
    marginTop: 5,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '800',
  },

  summaryMeta: {
    marginTop: 4,
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  insightStrip: {
    marginBottom: spacing.lg,
    paddingVertical: 10,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.borderSoft,
  },

  insightItem: {
    flex: 1,
    alignItems: 'center',
  },

  insightLabel: {
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: COLORS.textMuted,
  },

  insightValue: {
    marginTop: 2,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },

  sectionHeader: {
    minHeight: 40,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionHeaderText: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },

  sectionTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 0.55,
    color: COLORS.textPrimary,
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 14,
    color: COLORS.textMuted,
  },

  graphGrid: {
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
  },

  graphCard: {
    flex: 1,
    minWidth: 0,
    padding: spacing.sm,
    overflow: 'hidden',
    borderRadius: radius.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  graphCardPressed: {
    opacity: 0.84,
    transform: [{scale: 0.985}],
  },

  graphCardTitle: {
    marginBottom: 4,
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '800',
    letterSpacing: 0.65,
    color: COLORS.textMuted,
  },

  graphCanvas: {
    flex: 1,
    minHeight: 142,
  },

  graphCanvasExpanded: {
    minHeight: 240,
    maxHeight: 330,
  },

  graphValueRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  graphValueBlock: {
    flex: 1,
    minWidth: 0,
    paddingRight: 6,
  },

  graphValueBlockRight: {
    alignItems: 'flex-end',
    paddingRight: 0,
    paddingLeft: 6,
  },

  graphLabel: {
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '800',
    letterSpacing: 0.55,
    color: COLORS.textMuted,
  },

  graphValue: {
    marginTop: 3,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  chartArea: {
    flex: 1,
    minHeight: 70,
    marginTop: 5,
    position: 'relative',
    overflow: 'hidden',
  },

  chartAreaExpanded: {
    minHeight: 245,
  },

  chartGuideTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    top: '22%',
    backgroundColor: COLORS.borderSoft,
  },

  chartGuideMid: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    top: '62%',
    backgroundColor: COLORS.borderSoft,
  },

  chartBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 12,
    paddingTop: 8,
  },

  chartColumn: {
    height: '100%',
    width: 34,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  chartBar: {
    width: '72%',
    minHeight: 4,
    borderRadius: 6,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },

  chartBarRevenue: {
    backgroundColor: COLORS.blue,
  },

  chartBarExpense: {
    backgroundColor: COLORS.red,
  },

  chartAxisLabel: {
    marginTop: 5,
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '800',
    letterSpacing: 0.45,
    color: COLORS.textMuted,
  },

  graphHintRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  graphHintText: {
    marginLeft: 4,
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  mixHeaderIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: COLORS.amberSoft,
  },

  mixHeaderIconExpanded: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
  },

  donutBody: {
    flex: 1,
    minHeight: 72,
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },

  donutBodyExpanded: {
    minHeight: 245,
    gap: spacing.xl,
  },

  donut: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  donutCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  donutCenterExpanded: {
    paddingHorizontal: 18,
  },

  donutCenterLabel: {
    fontSize: 7,
    lineHeight: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
    color: COLORS.textMuted,
  },

  donutCenterValue: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  donutCenterValueExpanded: {
    fontSize: 18,
    lineHeight: 22,
  },

  donutLegend: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },

  donutLegendExpanded: {
    gap: 10,
  },

  donutLegendRow: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },

  donutLegendDot: {
    width: 7,
    height: 7,
    flexShrink: 0,
    marginRight: 5,
    borderRadius: radius.pill,
  },

  donutLegendTextWrap: {
    flex: 1,
    minWidth: 0,
    paddingRight: 4,
  },

  donutLegendLabel: {
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },

  donutLegendShare: {
    marginTop: 1,
    fontSize: 7,
    lineHeight: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  donutLegendAmount: {
    maxWidth: 74,
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  donutMoreText: {
    marginTop: 1,
    fontSize: 7,
    lineHeight: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },

  graphEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
  },

  graphEmptyText: {
    marginTop: 5,
    fontSize: 9,
    lineHeight: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  breakdownCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    flexDirection: 'row',
    borderRadius: radius.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  breakdownColumn: {
    flex: 1,
    minWidth: 0,
  },

  breakdownDivider: {
    width: 1,
    marginHorizontal: 12,
    backgroundColor: COLORS.borderSoft,
  },

  breakdownTitle: {
    marginBottom: 8,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 0.55,
    color: COLORS.textMuted,
  },

  breakdownRow: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  breakdownLabelWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 7,
  },

  breakdownDot: {
    width: 5,
    height: 5,
    marginRight: 6,
    borderRadius: 3,
  },

  breakdownLabel: {
    flex: 1,
    fontSize: 9,
    lineHeight: 13,
    color: COLORS.textSecondary,
  },

  breakdownAmount: {
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  alertBadge: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: COLORS.amberSoft,
  },

  alertCard: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  alertRow: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSoft,
  },

  alertIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },

  alertTextWrap: {
    flex: 1,
    minWidth: 0,
  },

  alertTitle: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  alertSubtitle: {
    marginTop: 3,
    fontSize: 9,
    lineHeight: 13,
    color: COLORS.textMuted,
  },

  countBadge: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: COLORS.blueSoft,
  },

  countBadgeText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
    color: COLORS.blue,
  },

  vehicleCard: {
    marginBottom: 8,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  vehicleCardPressed: {
    opacity: 0.84,
    transform: [{scale: 0.988}],
  },

  vehicleTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  vehicleIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.sm,
  },

  vehicleIcon: {
    width: 42,
    height: 42,
    marginRight: 9,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },

  vehicleIdentityText: {
    flex: 1,
    minWidth: 0,
  },

  vehicleRegistration: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  vehicleModel: {
    marginTop: 2,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  vehicleResult: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  vehicleResultLabel: {
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '800',
    letterSpacing: 0.45,
  },

  vehicleMetrics: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSoft,
  },

  vehicleMetric: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },

  vehicleMetricLabel: {
    fontSize: 7,
    lineHeight: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: COLORS.textMuted,
  },

  vehicleMetricValue: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  vehicleBottomRow: {
    minHeight: 28,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  vehicleActivity: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },

  vehicleActivityText: {
    marginLeft: 5,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  vehicleHint: {
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '700',
    color: COLORS.blue,
  },

  recentCard: {
    marginBottom: 8,
    overflow: 'hidden',
    borderRadius: radius.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  recentEmpty: {
    minHeight: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },

  recentEmptyText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },

  transactionRow: {
    minHeight: 62,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  transactionRowBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSoft,
  },

  transactionIcon: {
    width: 34,
    height: 34,
    marginRight: 8,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },

  transactionInfo: {
    flex: 1,
    minWidth: 0,
    paddingRight: 7,
  },

  transactionTitle: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  transactionMeta: {
    marginTop: 2,
    fontSize: 8,
    lineHeight: 11,
    color: COLORS.textMuted,
  },

  transactionAmount: {
    width: 72,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    textAlign: 'right',
  },

  ledgerButton: {
    minHeight: 46,
    marginBottom: spacing.xl,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.button,
    backgroundColor: COLORS.blueSoft,
    borderWidth: 1,
    borderColor: 'rgba(91,140,255,0.23)',
  },

  ledgerButtonPressed: {
    opacity: 0.84,
  },

  ledgerButtonText: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
    color: COLORS.blue,
  },

  modalSafeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  modalRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },

  modalDismissArea: {
    ...StyleSheet.absoluteFillObject,
  },

  modalCard: {
    width: '92%',
    maxWidth: 560,
    padding: 16,
    borderRadius: radius.xl,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    elevation: 18,
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: {width: 0, height: 12},
  },

  modalCardLedger: {
    width: '94%',
    height: '86%',
    maxWidth: 640,
    paddingBottom: 10,
  },

  modalHeader: {
    minHeight: 58,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  modalEyebrow: {
    marginBottom: 3,
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: COLORS.blue,
  },

  modalTitle: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  modalSubtitle: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 14,
    color: COLORS.textMuted,
  },

  modalCloseButton: {
    width: 36,
    height: 36,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: COLORS.graySoft,
  },

  modalFooterRow: {
    marginTop: 8,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSoft,
  },

  modalLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  legendDot: {
    width: 7,
    height: 7,
    marginRight: 5,
    borderRadius: 4,
  },

  modalLegendText: {
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },

  breakdownSummaryRow: {
    marginTop: 8,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSoft,
  },

  breakdownSummaryLabel: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },

  breakdownSummaryValue: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  ledgerOverlayBody: {
    flex: 1,
    minHeight: 0,
  },

  ledgerModalHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  ledgerSearchBox: {
    minHeight: 42,
    paddingHorizontal: 11,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },

  ledgerSearchInput: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 7,
    paddingVertical: 0,
    fontSize: 11,
    color: COLORS.textPrimary,
  },

  searchClearButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  ledgerFilterRow: {
    paddingBottom: 8,
    gap: 6,
  },

  ledgerFilterChip: {
    minHeight: 30,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },

  ledgerFilterChipActive: {
    backgroundColor: COLORS.blueSoft,
    borderColor: 'rgba(91,140,255,0.25)',
  },

  ledgerFilterText: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },

  ledgerFilterTextActive: {
    color: COLORS.blue,
  },

  ledgerStatsRow: {
    minHeight: 28,
    paddingBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  ledgerStatsText: {
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },

  ledgerList: {
    paddingBottom: 14,
  },

  ledgerRow: {
    minHeight: 70,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSoft,
  },

  ledgerTypeIcon: {
    width: 34,
    height: 34,
    marginRight: 8,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },

  ledgerMain: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },

  ledgerTitle: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  ledgerMeta: {
    marginTop: 2,
    fontSize: 8,
    lineHeight: 11,
    color: COLORS.textMuted,
  },

  ledgerReference: {
    marginTop: 2,
    fontSize: 8,
    lineHeight: 11,
    color: COLORS.textMuted,
  },

  ledgerAmount: {
    width: 82,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    textAlign: 'right',
  },

  ledgerEmpty: {
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  ledgerEmptyTitle: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  ledgerEmptyText: {
    marginTop: 3,
    fontSize: 9,
    lineHeight: 13,
    color: COLORS.textMuted,
  },

  emptyState: {
    marginBottom: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: 42,
    borderRadius: radius.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: COLORS.surfaceElevated,
  },

  emptyTitle: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  emptySubtitle: {
    maxWidth: 280,
    marginTop: 5,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    color: COLORS.textMuted,
  },
});

export default AccountsScreen;
