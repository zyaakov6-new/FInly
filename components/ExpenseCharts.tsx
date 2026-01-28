import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { PieChart as PieChartIcon, BarChart3 } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { getColors, FONTS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, LAYOUT } from '../constants/theme';

const screenWidth = Dimensions.get('window').width;

interface ExpenseData {
    category: string;
    amount: number;
}

interface Props {
    expenses: ExpenseData[];
}

const CATEGORY_COLORS = [
    '#4F7DF3', // Primary blue
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#FFE66D', // Yellow
    '#95E1D3', // Mint
    '#FF8B94', // Light red
    '#AA96DA', // Purple
    '#FCBAD3', // Pink
    '#77DD77', // Green
    '#FF9F1C', // Orange
];

export function ExpenseCharts({ expenses }: Props) {
    const { resolvedTheme, isDark } = useTheme();
    const colors = getColors(resolvedTheme);
    const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

    const chartData = useMemo(() => {
        const categoryTotals: { [key: string]: number } = {};

        expenses.forEach(expense => {
            const category = expense.category || 'אחר';
            categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
        });

        const sortedCategories = Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8); // Top 8 categories

        const total = sortedCategories.reduce((sum, [_, amount]) => sum + amount, 0);

        return sortedCategories.map(([category, amount], index) => ({
            name: category,
            amount,
            percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
            color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
            legendFontColor: colors.textSecondary,
            legendFontSize: 12,
        }));
    }, [expenses, colors.textSecondary]);

    const pieChartData = chartData.map(item => ({
        name: item.name,
        population: item.amount,
        color: item.color,
        legendFontColor: item.legendFontColor,
        legendFontSize: item.legendFontSize,
    }));

    const barChartData = {
        labels: chartData.map(item => item.name.substring(0, 6)),
        datasets: [
            {
                data: chartData.map(item => item.amount),
                colors: chartData.map(item => () => item.color),
            },
        ],
    };

    const totalAmount = chartData.reduce((sum, item) => sum + item.amount, 0);

    if (expenses.length === 0 || totalAmount === 0) {
        return null;
    }

    const chartConfig = {
        backgroundColor: colors.surface,
        backgroundGradientFrom: colors.surface,
        backgroundGradientTo: colors.surface,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(79, 125, 243, ${opacity})`,
        labelColor: () => colors.textSecondary,
        style: {
            borderRadius: 16,
        },
        propsForLabels: {
            fontFamily: FONTS.regular,
            fontSize: 10,
        },
        barPercentage: 0.6,
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }, SHADOWS.sm]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>חלוקת הוצאות</Text>
                <View style={styles.chartToggle}>
                    <TouchableOpacity
                        style={[
                            styles.toggleButton,
                            { backgroundColor: chartType === 'pie' ? colors.primaryMuted : 'transparent' }
                        ]}
                        onPress={() => setChartType('pie')}
                    >
                        <PieChartIcon size={18} color={chartType === 'pie' ? colors.primary : colors.textTertiary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.toggleButton,
                            { backgroundColor: chartType === 'bar' ? colors.primaryMuted : 'transparent' }
                        ]}
                        onPress={() => setChartType('bar')}
                    >
                        <BarChart3 size={18} color={chartType === 'bar' ? colors.primary : colors.textTertiary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Chart */}
            <View style={styles.chartWrapper}>
                {chartType === 'pie' ? (
                    <PieChart
                        data={pieChartData}
                        width={screenWidth - LAYOUT.screenPadding * 4}
                        height={180}
                        chartConfig={chartConfig}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="0"
                        absolute={false}
                        hasLegend={false}
                        center={[(screenWidth - LAYOUT.screenPadding * 4) / 4, 0]}
                    />
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <BarChart
                            data={barChartData}
                            width={Math.max(screenWidth - LAYOUT.screenPadding * 4, chartData.length * 60)}
                            height={180}
                            chartConfig={chartConfig}
                            verticalLabelRotation={30}
                            fromZero
                            showValuesOnTopOfBars
                            withCustomBarColorFromData
                            flatColor
                            yAxisLabel="₪"
                            yAxisSuffix=""
                            style={styles.barChart}
                        />
                    </ScrollView>
                )}
            </View>

            {/* Legend */}
            <View style={styles.legendContainer}>
                {chartData.map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                        <Text style={[styles.legendText, { color: colors.textSecondary }]} numberOfLines={1}>
                            {item.name}
                        </Text>
                        <Text style={[styles.legendValue, { color: colors.textPrimary }]}>
                            {item.percentage}%
                        </Text>
                    </View>
                ))}
            </View>

            {/* Total */}
            <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.totalLabel, { color: colors.textTertiary }]}>סה״כ</Text>
                <Text style={[styles.totalAmount, { color: colors.textPrimary }]}>
                    ₪{totalAmount.toLocaleString()}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: LAYOUT.screenPadding,
        marginBottom: SPACING.lg,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    title: {
        ...TYPOGRAPHY.h4,
    },
    chartToggle: {
        flexDirection: 'row',
        gap: SPACING.xs,
    },
    toggleButton: {
        width: 36,
        height: 36,
        borderRadius: RADIUS.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chartWrapper: {
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    barChart: {
        borderRadius: RADIUS.md,
    },
    legendContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '45%',
        gap: SPACING.xs,
    },
    legendColor: {
        width: 10,
        height: 10,
        borderRadius: 2,
    },
    legendText: {
        flex: 1,
        ...TYPOGRAPHY.captionSmall,
    },
    legendValue: {
        ...TYPOGRAPHY.captionSmall,
        fontFamily: FONTS.medium,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: SPACING.md,
        borderTopWidth: 1,
    },
    totalLabel: {
        ...TYPOGRAPHY.body,
    },
    totalAmount: {
        ...TYPOGRAPHY.h4,
    },
});
