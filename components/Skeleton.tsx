import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getColors, RADIUS, SPACING } from '../constants/theme';

interface SkeletonProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = RADIUS.md, style }: SkeletonProps) {
    const { resolvedTheme, isDark } = useTheme();
    const colors = getColors(resolvedTheme);
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const shimmer = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        shimmer.start();
        return () => shimmer.stop();
    }, []);

    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: isDark ? colors.fill : colors.fillSecondary,
                    opacity,
                },
                style,
            ]}
        />
    );
}

// Pre-built skeleton layouts
export function CardSkeleton() {
    const { resolvedTheme } = useTheme();
    const colors = getColors(resolvedTheme);

    return (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
                <Skeleton width={44} height={44} borderRadius={RADIUS.md} />
                <View style={styles.cardInfo}>
                    <Skeleton width="60%" height={16} style={{ marginBottom: SPACING.xs }} />
                    <Skeleton width="40%" height={12} />
                </View>
                <Skeleton width={80} height={20} />
            </View>
        </View>
    );
}

export function ListItemSkeleton() {
    const { resolvedTheme } = useTheme();
    const colors = getColors(resolvedTheme);

    return (
        <View style={[styles.listItem, { backgroundColor: colors.surface }]}>
            <Skeleton width={40} height={40} borderRadius={RADIUS.md} />
            <View style={styles.listItemContent}>
                <Skeleton width="70%" height={14} style={{ marginBottom: SPACING.xs }} />
                <Skeleton width="40%" height={12} />
            </View>
            <Skeleton width={60} height={16} />
        </View>
    );
}

export function ChartSkeleton() {
    const { resolvedTheme } = useTheme();
    const colors = getColors(resolvedTheme);

    return (
        <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
            <Skeleton width="40%" height={20} style={{ marginBottom: SPACING.lg }} />
            <View style={styles.chartContent}>
                <Skeleton width={120} height={120} borderRadius={60} />
                <View style={styles.chartLegend}>
                    <Skeleton width="100%" height={12} style={{ marginBottom: SPACING.sm }} />
                    <Skeleton width="80%" height={12} style={{ marginBottom: SPACING.sm }} />
                    <Skeleton width="60%" height={12} />
                </View>
            </View>
        </View>
    );
}

export function DashboardSkeleton() {
    return (
        <View style={styles.dashboardContainer}>
            {/* Hero skeleton */}
            <View style={styles.heroSkeleton}>
                <Skeleton width="50%" height={24} style={{ marginBottom: SPACING.sm }} />
                <Skeleton width="70%" height={18} style={{ marginBottom: SPACING.xl }} />
                <View style={styles.balanceSkeleton}>
                    <Skeleton width={120} height={120} borderRadius={60} />
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Skeleton width={100} height={14} style={{ marginBottom: SPACING.sm }} />
                        <Skeleton width={150} height={36} style={{ marginBottom: SPACING.sm }} />
                        <Skeleton width={80} height={24} borderRadius={RADIUS.full} />
                    </View>
                </View>
            </View>

            {/* Stats pills skeleton */}
            <View style={styles.pillsRow}>
                <Skeleton width="48%" height={70} borderRadius={RADIUS.xl} />
                <Skeleton width="48%" height={70} borderRadius={RADIUS.xl} />
            </View>

            {/* Cards skeleton */}
            <CardSkeleton />
            <CardSkeleton />
        </View>
    );
}

const styles = StyleSheet.create({
    skeleton: {
        overflow: 'hidden',
    },
    card: {
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardInfo: {
        flex: 1,
        marginHorizontal: SPACING.md,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.sm,
    },
    listItemContent: {
        flex: 1,
        marginHorizontal: SPACING.md,
    },
    chartCard: {
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
    },
    chartContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    chartLegend: {
        flex: 1,
        marginLeft: SPACING.xl,
    },
    dashboardContainer: {
        padding: SPACING.lg,
    },
    heroSkeleton: {
        paddingVertical: SPACING.xl,
        marginBottom: SPACING.xl,
    },
    balanceSkeleton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pillsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.xl,
    },
});
