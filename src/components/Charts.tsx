import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const screenWidth = Dimensions.get('window').width;

interface ChartData {
  label: string;
  value: number;
  color: string;
  icon: string;
}

interface BarChartProps {
  data: ChartData[];
  title: string;
}

export function ModernBarChart({ data, title }: BarChartProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const maxValue = Math.max(...data.map(item => item.value));
  const chartWidth = screenWidth - 64; // Marges
  
  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      
      <View style={styles.barsContainer}>
        {data.map((item, index) => {
          const barHeight = maxValue > 0 ? (item.value / maxValue) * 120 : 0;
          
          return (
            <View key={index} style={styles.barWrapper}>
              <View style={styles.barContainer}>
                <Text style={styles.barValue}>{item.value}</Text>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: barHeight,
                      backgroundColor: item.color,
                    }
                  ]} 
                />
              </View>
              <View style={styles.barLabelContainer}>
                <Text style={styles.barIcon}>{item.icon}</Text>
                <Text style={styles.barLabel}>{item.label}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

interface DonutChartProps {
  data: ChartData[];
  title: string;
  total: number;
}

export function ModernDonutChart({ data, title, total }: DonutChartProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      
      <View style={styles.donutContainer}>
        {/* Centre du donut avec total */}
        <View style={styles.donutCenter}>
          <Text style={styles.donutTotal}>{total}</Text>
          <Text style={styles.donutTotalLabel}>Total</Text>
        </View>
        
        {/* Légende */}
        <View style={styles.legendContainer}>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={styles.legendRow}>
                <Text style={styles.legendIcon}>{item.icon}</Text>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text style={styles.legendLabel}>{item.label}</Text>
              </View>
              <Text style={styles.legendValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

interface ProgressChartProps {
  data: ChartData[];
  title: string;
}

export function ModernProgressChart({ data, title }: ProgressChartProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      
      <View style={styles.progressContainer}>
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          
          return (
            <View key={index} style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <View style={styles.progressLabelRow}>
                  <Text style={styles.progressIcon}>{item.icon}</Text>
                  <Text style={styles.progressLabel}>{item.label}</Text>
                </View>
                <Text style={styles.progressValue}>{item.value}</Text>
              </View>
              
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      width: `${percentage}%`,
                      backgroundColor: item.color,
                    }
                  ]} 
                />
              </View>
              
              <Text style={styles.progressPercentage}>{percentage.toFixed(1)}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

interface StatsGridProps {
  data: ChartData[];
}

export function ModernStatsGrid({ data }: StatsGridProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  return (
    <View style={styles.statsGrid}>
      {data.map((item, index) => (
        <View key={index} style={styles.statCard}>
          <Text style={styles.statIcon}>{item.icon}</Text>
          <Text style={styles.statValue}>{item.value}</Text>
          <Text style={styles.statLabel}>{item.label}</Text>
          <View style={[styles.statIndicator, { backgroundColor: item.color }]} />
        </View>
      ))}
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  // Conteneur général
  chartContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  
  // Bar Chart
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 160,
    paddingHorizontal: 10,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 140,
    marginBottom: 8,
  },
  bar: {
    width: 24,
    borderRadius: 12,
    minHeight: 4,
  },
  barValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  barLabelContainer: {
    alignItems: 'center',
  },
  barIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  barLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Donut Chart
  donutContainer: {
    alignItems: 'center',
  },
  donutCenter: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    borderRadius: 50,
    backgroundColor: colors.background,
  },
  donutTotal: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
  },
  donutTotalLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  legendContainer: {
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  legendIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },
  legendValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '700',
  },
  
  // Progress Chart
  progressContainer: {
    gap: 16,
  },
  progressItem: {
    marginBottom: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },
  progressValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
    minWidth: 2,
  },
  progressPercentage: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    margin: 16,
  },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: (screenWidth - 64) / 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  statIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
