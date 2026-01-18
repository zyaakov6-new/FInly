import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Dimensions, StatusBar, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, TrendingDown, Bell, Search, Menu, FileText, Briefcase, Target } from 'lucide-react-native';
import { useTransactions } from '../context/TransactionsContext';
import { COLORS, FONTS } from '../constants/theme';
import DashboardWidgets from '../components/DashboardWidgets';

const { width } = Dimensions.get('window');

// --- Helper Components ---
const ActivityRow = ({ item }: { item: any }) => {
    const isIncome = item.isIncome;
    return (
        <View style={styles.activityRow}>
            <View style={styles.activityIconBox}>
                {isIncome ?
                    <ArrowDownLeft size={24} color={COLORS.success} /> :
                    <ArrowUpRight size={24} color={COLORS.danger} />
                }
            </View>
            <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activityDate}>{new Date(item.date).toLocaleDateString('he-IL')}</Text>
            </View>
            <Text style={[styles.activityAmount, { color: isIncome ? COLORS.success : COLORS.danger }]}>
                {item.amount}
            </Text>
        </View>
    );
};

const QuickActionButton = ({ label, icon: Icon, onPress }: any) => (
    <TouchableOpacity style={styles.quickActionBtn} onPress={onPress}>
        <View style={styles.quickActionIcon}>
            <Icon size={20} color={COLORS.secondary} />
        </View>
        <Text style={styles.quickActionText}>{label}</Text>
    </TouchableOpacity>
);

export default function DashboardScreen() {
    const navigation = useNavigation<any>();
    const {
        userProfile,
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
        projectsCount,
        recentActivity
    } = useTransactions();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'בוקר טוב';
        if (hour < 18) return 'צהריים טובים';
        return 'ערב טוב';
    };

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* 1. Header & Quick Actions */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>{getGreeting()},</Text>
                        <Text style={styles.username}>{userProfile?.name || 'User'}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.iconBtn}>
                            <Search size={22} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconBtn}>
                            <Bell size={22} color={COLORS.textPrimary} />
                            <View style={styles.badge} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Actions Scroll */}
                <View style={{ marginBottom: 24 }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsScroll}>
                        <QuickActionButton
                            label="יצירת חשבונית"
                            icon={FileText}
                            onPress={() => navigation.navigate('CreateInvoice')}
                        />
                        <QuickActionButton
                            label="הוספת הוצאה"
                            icon={ArrowUpRight} // Or Wallet
                            onPress={() => navigation.navigate('AddExpense')}
                        />
                        <QuickActionButton
                            label="כל ההוצאות"
                            icon={FileText}
                            onPress={() => navigation.navigate('ExpensesList')}
                        />
                        <QuickActionButton
                            label="פרויקטים"
                            icon={Briefcase}
                            onPress={() => navigation.navigate('Customers')}
                        />
                        <QuickActionButton
                            label="היעדים שלי"
                            icon={Target}
                            onPress={() => navigation.navigate('Goals')}
                        />
                    </ScrollView>
                </View>

                {/* 2. Premium KPI ScrollView */}
                <Animated.View style={[
                    styles.kpiContainer,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { translateY: slideAnim },
                            { scale: scaleAnim }
                        ]
                    }
                ]}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.kpiScrollContent}
                    >
                        {/* Income Card */}
                        <TouchableOpacity style={[styles.kpiCard, styles.kpiCardIncome]}>
                            <View style={styles.kpiIconBg}>
                                <ArrowDownLeft size={20} color={COLORS.success} />
                            </View>
                            <View>
                                <Text style={styles.kpiLabel}>הכנסות</Text>
                                <Text style={styles.kpiValue}>₪{totalRevenue.toLocaleString()}</Text>
                            </View>
                            <View style={styles.kpiTrendBadge}>
                                <TrendingUp size={12} color={COLORS.success} />
                                <Text style={styles.kpiTrendText}>+12%</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Expense Card */}
                        <TouchableOpacity style={[styles.kpiCard, styles.kpiCardExpense]}>
                            <View style={[styles.kpiIconBg, { backgroundColor: 'rgba(248, 113, 113, 0.1)' }]}>
                                <ArrowUpRight size={20} color={COLORS.danger} />
                            </View>
                            <View>
                                <Text style={styles.kpiLabel}>הוצאות</Text>
                                <Text style={styles.kpiValue}>₪{totalExpenses.toLocaleString()}</Text>
                            </View>
                            <View style={[styles.kpiTrendBadge, { backgroundColor: 'rgba(248, 113, 113, 0.1)' }]}>
                                <TrendingDown size={12} color={COLORS.danger} />
                                <Text style={[styles.kpiTrendText, { color: COLORS.danger }]}>-5%</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Profit Card */}
                        <TouchableOpacity style={[styles.kpiCard, netProfit >= 0 ? styles.kpiCardProfit : styles.kpiCardExpense]}>
                            <View style={[styles.kpiIconBg, { backgroundColor: netProfit >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' }]}>
                                <Wallet size={20} color={netProfit >= 0 ? COLORS.success : COLORS.danger} />
                            </View>
                            <View>
                                <Text style={styles.kpiLabel}>רווח נקי</Text>
                                <Text style={[styles.kpiValue, { color: netProfit >= 0 ? COLORS.success : COLORS.danger }]}>₪{netProfit.toLocaleString()}</Text>
                            </View>
                            <View style={[styles.kpiTrendBadge, { backgroundColor: netProfit >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                                <TrendingUp size={12} color={netProfit >= 0 ? COLORS.success : COLORS.danger} />
                                <Text style={[styles.kpiTrendText, { color: netProfit >= 0 ? COLORS.success : COLORS.danger }]}>{profitMargin}%</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Projects Card */}
                        <TouchableOpacity style={styles.kpiCard}>
                            <View style={[styles.kpiIconBg, { backgroundColor: 'rgba(96, 165, 250, 0.1)' }]}>
                                <Briefcase size={20} color="#60a5fa" />
                            </View>
                            <View>
                                <Text style={styles.kpiLabel}>פרויקטים</Text>
                                <Text style={styles.kpiValue}>{projectsCount}</Text>
                            </View>
                        </TouchableOpacity>
                    </ScrollView>
                </Animated.View>

                {/* 3. New Dashboard Widgets */}
                <DashboardWidgets />

                {/* 4. Detailed Activity Feed */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>תנועות אחרונות</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('AllActivity')}>
                        <Text style={styles.seeAll}>הצג הכל</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.feedContainer}>
                    {recentActivity.map((item: any) => (
                        <ActivityRow key={item.id} item={item} />
                    ))}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: Platform.OS === 'android' ? 40 : 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 24,
        paddingTop: 12,
    },
    greeting: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontFamily: FONTS.regular,
        textAlign: 'left',
    },
    username: {
        color: COLORS.textPrimary,
        fontSize: 20,
        fontFamily: FONTS.bold,
        textAlign: 'left',
        marginTop: 2,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconBtn: {
        padding: 8,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    badge: {
        width: 8,
        height: 8,
        backgroundColor: COLORS.danger,
        borderRadius: 4,
        position: 'absolute',
        top: 8,
        right: 8,
        borderWidth: 1,
        borderColor: COLORS.surface,
    },
    scrollContent: {
        // paddingHorizontal: 24, // Removed global padding to allow full-width scrolls if needed, but added back in sections
    },
    // Quick Actions
    quickActionsScroll: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 24,
    },
    quickActionBtn: {
        width: 120,
        height: 110,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    quickActionIcon: {
        backgroundColor: 'rgba(132, 101, 243, 0.15)',
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickActionText: {
        color: COLORS.secondary,
        fontSize: 14,
        fontFamily: FONTS.medium,
        textAlign: 'left'
    },
    // KPI Cards Scroll
    kpiContainer: {
        marginBottom: 32,
    },
    kpiScrollContent: {
        paddingHorizontal: 24,
        gap: 12,
    },
    kpiCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        width: 150,
        height: 160,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    kpiCardHighlight: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    kpiCardIncome: {
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        borderColor: 'rgba(16, 185, 129, 0.4)',
        borderWidth: 1.5,
        shadowColor: COLORS.success,
        shadowOpacity: 0.2,
    },
    kpiCardExpense: {
        backgroundColor: 'rgba(239, 68, 68, 0.12)',
        borderColor: 'rgba(239, 68, 68, 0.4)',
        borderWidth: 1.5,
        shadowColor: COLORS.danger,
        shadowOpacity: 0.2,
    },
    kpiCardProfit: {
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        borderColor: 'rgba(16, 185, 129, 0.4)',
        borderWidth: 1.5,
        shadowColor: COLORS.success,
        shadowOpacity: 0.2,
    },
    kpiIconBg: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    kpiLabel: {
        color: COLORS.textSecondary,
        fontSize: 13,
        fontFamily: FONTS.regular,
        marginBottom: 4,
        textAlign: 'left',
    },
    kpiValue: {
        color: COLORS.textPrimary,
        fontSize: 20,
        fontFamily: FONTS.bold,
        textAlign: 'left',
    },
    kpiLabelWhite: {
        color: COLORS.textPrimary,
        fontSize: 13,
        fontFamily: FONTS.regular,
        marginBottom: 4,
        textAlign: 'left',
    },
    kpiValueWhite: {
        color: COLORS.textPrimary,
        fontSize: 20,
        fontFamily: FONTS.bold,
        textAlign: 'left',
    },
    kpiTrendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        gap: 4,
    },
    kpiTrendText: {
        color: COLORS.success,
        fontSize: 11,
        fontFamily: FONTS.medium,
    },
    // Feed
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        color: COLORS.textPrimary,
        fontSize: 18,
        fontFamily: FONTS.bold,
    },
    seeAll: {
        color: COLORS.secondary,
        fontSize: 14,
        fontFamily: FONTS.medium,
    },
    feedContainer: {
        gap: 12,
        paddingHorizontal: 24,
    },
    activityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    activityIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: COLORS.background, // Contrast
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    activityInfo: {
        flex: 1,
        marginHorizontal: 12,
    },
    activityTitle: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontFamily: FONTS.medium,
        marginBottom: 2,
        textAlign: 'left',
    },
    activityDate: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontFamily: FONTS.regular,
        textAlign: 'left',
    },
    activityAmount: {
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
});
