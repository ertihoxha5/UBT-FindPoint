import React from 'react';
import { View, StyleSheet, Text, useColorScheme } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface StatisticsGraphsProps {
  totalUsers: number;
  totalItems: number;
  approvedItems: number;
  pendingItems: number;
  blockedUsers: number;
  itemsByDay?: Array<{ bucket: string; total: number }>;
  usersByDay?: Array<{ bucket: string; total: number }>;
}

export function StatisticsGraphs({
  totalUsers,
  totalItems,
  approvedItems,
  pendingItems,
  blockedUsers,
  itemsByDay = [],
  usersByDay = [],
}: StatisticsGraphsProps) {
  const isDark = useColorScheme() === 'dark';

  // Calculate percentages for pie chart
  const itemsApprovedPercent = totalItems > 0 ? (approvedItems / totalItems) * 100 : 0;
  const itemsPendingPercent = totalItems > 0 ? (pendingItems / totalItems) * 100 : 0;
  const activeUsersPercent = totalUsers > 0 ? ((totalUsers - blockedUsers) / totalUsers) * 100 : 0;

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Items Status Pie Chart */}
      <View style={[styles.chartCard, isDark && styles.chartCardDark]}>
        <Text style={[styles.chartTitle, isDark && styles.chartTitleDark]}>Item Status Distribution</Text>
        <View style={styles.pieSvgContainer}>
          <Svg width={220} height={220} viewBox="0 0 220 220">
            <PieChart
              cx={110}
              cy={110}
              r={80}
              data={[
                { value: itemsApprovedPercent, color: '#10b981', label: 'Approved' },
                { value: itemsPendingPercent, color: '#f59e0b', label: 'Pending' },
              ]}
            />
          </Svg>
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#10b981' }]} />
            <Text style={[styles.legendText, isDark && styles.legendTextDark]}>
              Approved: {approvedItems}
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#f59e0b' }]} />
            <Text style={[styles.legendText, isDark && styles.legendTextDark]}>
              Pending: {pendingItems}
            </Text>
          </View>
        </View>
      </View>

      {/* Users Status Pie Chart */}
      <View style={[styles.chartCard, isDark && styles.chartCardDark]}>
        <Text style={[styles.chartTitle, isDark && styles.chartTitleDark]}>User Status Distribution</Text>
        <View style={styles.pieSvgContainer}>
          <Svg width={220} height={220} viewBox="0 0 220 220">
            <PieChart
              cx={110}
              cy={110}
              r={80}
              data={[
                { value: activeUsersPercent, color: '#0f5ee8', label: 'Active' },
                { value: 100 - activeUsersPercent, color: '#ef4444', label: 'Blocked' },
              ]}
            />
          </Svg>
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#0f5ee8' }]} />
            <Text style={[styles.legendText, isDark && styles.legendTextDark]}>
              Active: {totalUsers - blockedUsers}
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#ef4444' }]} />
            <Text style={[styles.legendText, isDark && styles.legendTextDark]}>
              Blocked: {blockedUsers}
            </Text>
          </View>
        </View>
      </View>

      {/* Activity Trend Bar Chart */}
      {itemsByDay.length > 0 && (
        <View style={[styles.chartCard, isDark && styles.chartCardDark]}>
          <Text style={[styles.chartTitle, isDark && styles.chartTitleDark]}>7-Day Activity Trend</Text>
          <View style={styles.barChartContainer}>
            {itemsByDay.slice(0, 7).map((entry, idx) => (
              <BarChartItem
                key={idx}
                label={entry.bucket}
                value={entry.total}
                maxValue={Math.max(...itemsByDay.map((e) => e.total), 1)}
                isDark={isDark}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

interface BarChartItemProps {
  label: string;
  value: number;
  maxValue: number;
  isDark: boolean;
}

function BarChartItem({ label, value, maxValue, isDark }: BarChartItemProps) {
  const heightPercent = (value / maxValue) * 100;

  return (
    <View style={styles.barItem}>
      <View style={styles.barContainer}>
        <View
          style={[
            styles.bar,
            {
              height: `${heightPercent}%`,
              backgroundColor: isDark ? '#60a5fa' : '#0f5ee8',
            },
          ]}
        />
      </View>
      <Text style={[styles.barLabel, isDark && styles.barLabelDark]}>{label}</Text>
      <Text style={[styles.barValue, isDark && styles.barValueDark]}>{value}</Text>
    </View>
  );
}

interface PieChartProps {
  cx: number;
  cy: number;
  r: number;
  data: Array<{ value: number; color: string; label: string }>;
}

function PieChart({ cx, cy, r, data }: PieChartProps) {
  const positiveSlices = data.filter((item) => item.value > 0);

  if (positiveSlices.length === 1) {
    return (
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        fill={positiveSlices[0].color}
        stroke="white"
        strokeWidth={2}
      />
    );
  }

  let currentAngle = -Math.PI / 2;
  const slices = [];

  for (const item of data) {
    if (item.value <= 0) {
      continue;
    }

    const sliceAngle = (item.value / 100) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(currentAngle);
    const y1 = cy + r * Math.sin(currentAngle);
    const x2 = cx + r * Math.cos(currentAngle + sliceAngle);
    const y2 = cy + r * Math.sin(currentAngle + sliceAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    slices.push(
      <Path
        key={item.label}
        d={pathData}
        fill={item.color}
        strokeWidth={2}
        stroke="white"
      />
    );

    currentAngle += sliceAngle;
  }

  return <>{slices}</>;
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    marginBottom: 14,
  },
  containerDark: {},
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  chartCardDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  chartTitleDark: {
    color: '#f1f5f9',
  },
  pieSvgContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  legendTextDark: {
    color: '#cbd5e1',
  },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 180,
    marginVertical: 16,
    paddingHorizontal: 4,
    gap: 8,
  },
  barItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  barContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 6,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
  },
  barLabelDark: {
    color: '#94a3b8',
  },
  barValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f5ee8',
  },
  barValueDark: {
    color: '#60a5fa',
  },
});
