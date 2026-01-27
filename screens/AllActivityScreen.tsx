import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    useColorScheme,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronRight, FileText, CreditCard, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useTransactions, Transaction } from '../context/TransactionsContext';
import { useTheme } from '../context/ThemeContext';
import { getColors, FONTS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, LAYOUT } from '../constants/theme';

export default function AllActivityScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { resolvedTheme, isDark } = useTheme();
    const colors = getColors(resolvedTheme);
    const { allTransactions } = useTransactions();

    const handleTransactionPress = (item: Transaction) => {
        if (item.type === 'invoice') {
            navigation.navigate('InvoiceDetails', { transactionId: item.id });
        }
    };

    const renderItem = ({ item }: { item: Transaction }) => {
        const timeAgo = () => {
            const days = Math.floor((Date.now() - new Date(item.date).getTime()) / (1000 * 60 * 60 * 24));
            if (days === 0) return 'היום';
            if (days === 1) return 'אתמול';
            return `לפני ${days} ימים`;
        };

        const isIncome = item.isIncome;

        return (
            <TouchableOpacity
                style={[styles.activityItem, { backgroundColor: colors.surface }, SHADOWS.sm]}
                onPress={() => handleTransactionPress(item)}
                activeOpacity={0.7}
            >
                <View style={styles.activityContent}>
                    <View style={[
                        styles.iconContainer,
                        { backgroundColor: isIncome ? colors.successMuted : colors.dangerMuted }
                    ]}>
                        {isIncome ? (
                            <TrendingUp size={18} color={colors.success} />
                        ) : (
                            <TrendingDown size={18} color={colors.danger} />
                        )}
                    </View>
                    <View style={styles.textContent}>
                        <Text style={[styles.activityTitle, { color: colors.textPrimary }]}>
                            {item.title}
                        </Text>
                        <Text style={[styles.activityTime, { color: colors.textTertiary }]}>
                            {timeAgo()} • {new Date(item.date).toLocaleDateString('he-IL')}
                        </Text>
                    </View>
                </View>
                <View style={styles.amountSection}>
                    <Text style={[
                        styles.activityAmount,
                        { color: isIncome ? colors.success : colors.danger }
                    ]}>
                        {isIncome ? '+' : '-'}{item.amount}
                    </Text>
                    {item.type === 'invoice' && (
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: item.status === 'paid' ? colors.successMuted : colors.warningMuted }
                        ]}>
                            <Text style={[
                                styles.statusText,
                                { color: item.status === 'paid' ? colors.success : colors.warning }
                            ]}>
                                {item.status === 'paid' ? 'שולם' : 'ממתין'}
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.headerButton, { backgroundColor: colors.surfaceSecondary }]}
                >
                    <ChevronRight size={24} color={colors.textSecondary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                    כל הפעילות
                </Text>
                <View style={{ width: 44 }} />
            </View>

            {/* List */}
            <FlatList
                data={allTransactions}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceSecondary }]}>
                            <FileText size={32} color={colors.textTertiary} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                            אין פעילות עדיין
                        </Text>
                        <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
                            ההכנסות וההוצאות שלך יופיעו כאן
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: LAYOUT.screenPadding,
        paddingBottom: SPACING.lg,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...TYPOGRAPHY.h3,
    },
    listContent: {
        paddingHorizontal: LAYOUT.screenPadding,
        paddingBottom: 100,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.lg,
        borderRadius: RADIUS.xl,
        marginBottom: SPACING.md,
    },
    activityContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: SPACING.md,
    },
    textContent: {
        flex: 1,
    },
    activityTitle: {
        ...TYPOGRAPHY.body,
        fontFamily: FONTS.medium,
        marginBottom: SPACING.xs,
    },
    activityTime: {
        ...TYPOGRAPHY.caption,
    },
    amountSection: {
        alignItems: 'flex-end',
    },
    activityAmount: {
        ...TYPOGRAPHY.label,
        marginBottom: SPACING.xs,
    },
    statusBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.sm,
    },
    statusText: {
        ...TYPOGRAPHY.captionSmall,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING['6xl'],
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: RADIUS.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
    },
    emptyTitle: {
        ...TYPOGRAPHY.h4,
        marginBottom: SPACING.sm,
    },
    emptySubtitle: {
        ...TYPOGRAPHY.body,
        textAlign: 'center',
    },
});
