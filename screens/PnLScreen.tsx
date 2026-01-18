import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    Alert,
    Animated,
    Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowRight, ChevronDown, Calendar, TrendingUp, TrendingDown, Wallet, PieChart, Share as ShareIcon, Printer, Mail } from 'lucide-react-native';
import { useTransactions } from '../context/TransactionsContext';
import { PieChart as PieChartKit } from 'react-native-chart-kit';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { COLORS, FONTS } from '../constants/theme';

// Types
type TimePeriod = 'week' | 'month' | 'year' | 'all';

export default function PnLScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { transactions, userProfile, businessSettings } = useTransactions();

    // Helper to parse currency strings "₪ 5,000" -> 5000
    const parseAmount = (str?: string) => {
        if (!str) return 0;
        return parseFloat(str.replace(/[^0-9.-]+/g, '')) || 0;
    };

    const invoices = useMemo(() => (transactions || []).filter(t => t.type === 'invoice'), [transactions]);

    // State
    const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('month');
    const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
    const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
    // Animation
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(50)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    // Helpers
    const getPeriodLabel = (period: TimePeriod) => {
        const now = new Date();
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        switch (period) {
            case 'week': return `Week of ${now.getDate()} ${monthNames[now.getMonth()]}`;
            case 'month': return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
            case 'year': return `${now.getFullYear()}`;
            case 'all': return 'All Time';
            default: return '';
        }
    };

    // Filter Logic
    const filteredData = useMemo(() => {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);

        const startOfYear = new Date(now.getFullYear(), 0, 1);
        startOfYear.setHours(0, 0, 0, 0);

        const filterDate = (dateString: string | Date) => {
            const date = new Date(dateString);
            date.setHours(0, 0, 0, 0); // Normalize check date too

            if (selectedPeriod === 'week') return date >= startOfWeek;
            if (selectedPeriod === 'month') return date >= startOfMonth;
            if (selectedPeriod === 'year') return date >= startOfYear;
            return true;
        };

        // Filter Invoices (Revenue)
        const periodRevenues = invoices.filter(inv =>
            (inv.status === 'paid' || inv.status === 'pending') &&
            filterDate(inv.date)
        );

        // Filter Expenses
        const periodExpenses = transactions.filter(t =>
            t.type === 'expense' &&
            filterDate(t.date)
        );

        return { periodRevenues, periodExpenses };
    }, [selectedPeriod, invoices, transactions]);

    // KEY Calculations
    // 1. Total Revenue: Sum of invoice amounts
    const totalRevenue = filteredData.periodRevenues.reduce((sum, inv) => sum + parseAmount(inv.amount), 0);

    // 2. Total Expenses: Sum of direct expenses + Sum of My Cost from invoices
    const expensesFromInvoices = filteredData.periodRevenues.reduce((sum, inv) => sum + parseAmount(inv.cost), 0);
    const directExpenses = filteredData.periodExpenses.reduce((sum, exp) => sum + parseAmount(exp.amount), 0);
    const totalExpenses = directExpenses + expensesFromInvoices;

    // const totalExpenses = directExpenses + expensesFromInvoices; // Removed duplicate
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

    // 3. Expenses by Category (for Pie Chart)
    const expensesByCategory = useMemo(() => {
        const groups: Record<string, number> = {};

        filteredData.periodExpenses.forEach(exp => {
            const amount = parseAmount(exp.amount);
            const catName = exp.category || 'Other';
            groups[catName] = (groups[catName] || 0) + amount;
        });

        // Add "My Cost" from invoices as "Services Cost" or similar if needed, 
        // but typically PnL charts focus on direct expenses categories. 
        // Let's add 'Cost of Services' if > 0
        if (expensesFromInvoices > 0) {
            groups['עלות מכר (Cost)'] = expensesFromInvoices;
        }

        const CHART_COLORS = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
            '#C9CBCF', '#FFCD56', '#4D5360', '#F7464A'
        ];

        return Object.entries(groups)
            .sort((a, b) => b[1] - a[1]) // Sort by amount desc
            .map(([name, amount], index) => ({
                name, // Pass full name, we will hide legend on chart
                amount,
                color: CHART_COLORS[index % CHART_COLORS.length],
                legendFontColor: COLORS.textSecondary,
                legendFontSize: 12
            }));
    }, [filteredData, expensesFromInvoices]);

    // Advanced: Profit by "Project" (Group by Client)
    const projectsData = useMemo(() => {
        const groups: Record<string, { revenue: number, expenses: number, expensesList: any[], invoicesList: any[] }> = {};

        // 1. Group Revenues (and Invoice Costs)
        filteredData.periodRevenues.forEach(inv => {
            const client = inv.clientName || 'General Project';
            if (!groups[client]) groups[client] = { revenue: 0, expenses: 0, expensesList: [], invoicesList: [] };

            const revenue = parseAmount(inv.amount);
            const myCost = parseAmount(inv.cost);

            groups[client].revenue += revenue;
            groups[client].expenses += myCost; // Add service cost to project expenses
            groups[client].invoicesList.push(inv);
        });

        // 2. Group Direct Expenses
        filteredData.periodExpenses.forEach(exp => {
            const client = exp.clientName || 'General Expenses';
            if (!groups[client]) groups[client] = { revenue: 0, expenses: 0, expensesList: [], invoicesList: [] };

            const amount = parseAmount(exp.amount);
            groups[client].expenses += amount;
            groups[client].expensesList.push(exp);
        });

        // Convert to array and sort by Profit
        return Object.entries(groups).map(([name, data]) => {
            const profit = data.revenue - data.expenses;
            const margin = data.revenue > 0 ? ((profit / data.revenue) * 100).toFixed(0) : '0';
            return { name, ...data, profit, margin };
        }).sort((a, b) => b.profit - a.profit);
    }, [filteredData]);

    const projectCount = projectsData.filter(p => p.revenue > 0).length;

    // --- Export Logic ---
    const handleExportPDF = async () => {
        try {
            const { name, email, phone } = userProfile;
            const businessName = businessSettings.name || name;
            const { taxId, address } = businessSettings;

            const html = `
                <html dir="rtl">
                  <head>
                    <meta charset="utf-8">
                    <style>
                      body { font-family: 'Helvetica', sans-serif; padding: 40px; text-align: right; direction: rtl; }
                      h1 { color: #00d4aa; text-align: center; margin-bottom: 10px; }
                      .header-info { text-align: center; color: #666; margin-bottom: 40px; font-size: 14px; }
                      .card { border: 1px solid #ddd; padding: 20px; margin-bottom: 20px; border-radius: 8px; background-color: #f9f9f9; }
                      .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                      .bold { font-weight: bold; }
                      .footer { margin-top: 50px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
                      .label { color: #555; }
                      .value { color: #000; font-weight: 500; }
                    </style>
                  </head>
                  <body>
                    <h1>דוח רווח והפסד - Finly</h1>
                    
                    <div class="header-info">
                        <p><strong>עסק:</strong> ${businessName} ${taxId ? `(ח.פ: ${taxId})` : ''}</p>
                        <p><strong>בעלים:</strong> ${name} | ${email}</p>
                        ${address ? `<p>${address}</p>` : ''}
                        <p><strong>תקופה:</strong> ${getPeriodLabel(selectedPeriod)}</p>
                    </div>
                    
                    <div class="card">
                        <div class="row"><span class="label">הכנסות:</span> <span class="value">₪${totalRevenue.toLocaleString()}</span></div>
                        <div class="row"><span class="label">הוצאות:</span> <span class="value">₪${totalExpenses.toLocaleString()}</span></div>
                        <hr style="border: 0; border-top: 1px solid #ccc; margin: 15px 0;">
                        <div class="row">
                            <span class="bold" style="color: #00d4aa; font-size: 20px;">רווח נקי:</span> 
                            <span style="color: #00d4aa; font-size: 20px; font-weight: bold;">₪${netProfit.toLocaleString()}</span>
                        </div>
                        <div class="row"><span class="label">מרווח:</span> <span class="value">${profitMargin}%</span></div>
                    </div>

                    <h2 style="margin-top: 30px; border-bottom: 2px solid #00d4aa; padding-bottom: 10px;">פירוט לפי פרויקט</h2>
                    ${projectsData.map(p => `
                        <div class="card" style="page-break-inside: avoid;">
                            <h3 style="margin-top: 0; color: #333;">${p.name}</h3>
                            <div class="row"><span class="label">הכנסה:</span> <span>₪${p.revenue.toLocaleString()}</span></div>
                            <div class="row"><span class="label">הוצאות:</span> <span>₪${p.expenses.toLocaleString()}</span></div>
                            <div class="row"><span class="label bold">רווח:</span> <span class="bold" style="color: #00d4aa">₪${p.profit.toLocaleString()} (${p.margin}%)</span></div>
                        </div>
                    `).join('')}
                    
                    <div class="footer">
                        <p>הופק ע״י אפליקציית Finly בתאריך ${new Date().toLocaleDateString('he-IL')}</p>
                    </div>
                  </body>
                </html>
            `;

            const { uri } = await Print.printToFileAsync({ html });
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } catch (error) {
            Alert.alert('שגיאה', 'נכשל ביצירת קובץ PDF');
        }
    };

    // Styles
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: COLORS.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
            backgroundColor: COLORS.background,
            zIndex: 10,
        },
        headerTitle: {
            color: COLORS.textPrimary,
            fontSize: 20,
            fontFamily: FONTS.medium,
        },
        backButton: {
            padding: 8,
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: 12,
        },

        // Time Selector
        periodContainer: {
            padding: 20,
        },
        periodTitle: {
            color: COLORS.textSecondary,
            fontSize: 14,
            fontFamily: FONTS.medium,
            marginBottom: 12,
            textAlign: 'left'
        },
        periodTabs: {
            flexDirection: 'row',
            backgroundColor: COLORS.surface,
            borderRadius: 16,
            padding: 4,
            justifyContent: 'space-between',
        },
        tab: {
            flex: 1,
            paddingVertical: 10,
            alignItems: 'center',
            borderRadius: 12,
        },
        activeTab: {
            backgroundColor: COLORS.primary,
        },
        tabText: {
            color: COLORS.textTertiary,
            fontSize: 13,
            fontFamily: FONTS.medium,
        },
        activeTabText: {
            color: COLORS.textPrimary,
        },
        currentPeriodLabel: {
            color: COLORS.textSecondary,
            fontSize: 14,
            marginTop: 12,
            fontFamily: FONTS.regular,
            textAlign: 'center'
        },

        // KPI Section
        kpiContainer: {
            paddingHorizontal: 20,
            marginBottom: 32,
        },
        kpiScroll: {
            gap: 12,
        },
        kpiCard: {
            backgroundColor: COLORS.surface,
            borderRadius: 12, // Changed from 20 to 12
            padding: 16,      // Changed from 20 to 16
            width: 160,
            borderWidth: 1,
            borderColor: COLORS.border,
            justifyContent: 'space-between',
            height: 150,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
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
            backgroundColor: 'rgba(16, 185, 129, 0.12)', // Same as income base for profit
            borderColor: COLORS.primary, // But distinct border
            borderWidth: 1.5,
            shadowColor: COLORS.primary,
            shadowOpacity: 0.2,
        },
        kpiLabel: {
            color: COLORS.textSecondary,
            fontSize: 12,
            fontFamily: FONTS.regular,
            marginBottom: 8,
            textAlign: 'left'
        },
        kpiAmount: {
            color: COLORS.textPrimary,
            fontSize: 24,
            fontFamily: FONTS.bold,
            textAlign: 'left'
        },
        kpiTrend: {
            fontSize: 12,
            fontFamily: FONTS.medium,
            marginTop: 4,
            textAlign: 'left'
        },

        // Detailed Sections
        sectionTitle: {
            color: COLORS.textPrimary,
            fontSize: 18,
            fontFamily: FONTS.bold,
            marginBottom: 16,
            marginTop: 24,
            paddingHorizontal: 20,
            textAlign: 'left'
        },
        card: {
            backgroundColor: COLORS.surface,
            marginHorizontal: 20,
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: COLORS.border,
            marginBottom: 16,
        },
        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        label: {
            color: COLORS.textSecondary,
            fontSize: 14,
            fontFamily: FONTS.regular,
        },
        value: {
            color: COLORS.textPrimary,
            fontSize: 16,
            fontFamily: FONTS.medium,
        },
        divider: {
            height: 1,
            backgroundColor: COLORS.border,
            marginVertical: 16,
        },
        thickDivider: {
            height: 4,
            backgroundColor: COLORS.border,
            marginVertical: 16,
            borderRadius: 2,
        },
        profitHighlight: {
            color: COLORS.primary,
            fontSize: 32,
            fontFamily: FONTS.bold,
        },

        // Projects Section
        projectItem: {
            backgroundColor: COLORS.surface,
            borderRadius: 16,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: COLORS.border,
        },
        projectTitle: {
            color: COLORS.textPrimary,
            fontSize: 16,
            fontFamily: FONTS.bold,
            marginBottom: 8,
            textAlign: 'left'
        },
        expenseRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 4,
        },
        expenseText: {
            color: COLORS.danger,
            fontSize: 12,
            fontFamily: FONTS.regular,
        },
        projectProfitRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
        },

        // Export Section
        exportButton: {
            backgroundColor: COLORS.surface,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            borderRadius: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: COLORS.border,
        },
        exportText: {
            color: COLORS.textPrimary,
            fontSize: 16,
            fontFamily: FONTS.medium,
            marginLeft: 12,
        }

    });

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowRight size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>דוח רווח והפסד</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Time Period Selector */}
                <View style={styles.periodContainer}>
                    <Text style={styles.periodTitle}>בחר תקופה</Text>
                    <View style={styles.periodTabs}>
                        {(['week', 'month', 'year', 'all'] as TimePeriod[]).map((p) => (
                            <TouchableOpacity
                                key={p}
                                style={[styles.tab, selectedPeriod === p && styles.activeTab]}
                                onPress={() => setSelectedPeriod(p)}
                            >
                                <Text style={[styles.tabText, selectedPeriod === p && styles.activeTabText]}>
                                    {p === 'week' ? 'שבוע' : p === 'month' ? 'חודש' : p === 'year' ? 'שנה' : 'הכל'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text style={styles.currentPeriodLabel}>דוח ל-{getPeriodLabel(selectedPeriod)}</Text>
                </View>

                {/* KPI Summary Cards */}
                <Animated.View style={[styles.kpiContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
                        {/* Revenue */}
                        <TouchableOpacity style={[styles.kpiCard, styles.kpiCardIncome]}>
                            <View>
                                <Text style={styles.kpiLabel}>סה״כ הכנסות</Text>
                                <TrendingUp size={24} color={COLORS.success} />
                            </View>
                            <View>
                                <Text style={styles.kpiAmount}>₪{totalRevenue.toLocaleString()}</Text>
                                <Text style={[styles.kpiTrend, { color: COLORS.success }]}>+18% מהחודש שעבר</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Expenses */}
                        <TouchableOpacity style={[styles.kpiCard, styles.kpiCardExpense]}>
                            <View>
                                <Text style={styles.kpiLabel}>סה״כ הוצאות</Text>
                                <TrendingDown size={24} color={COLORS.danger} />
                            </View>
                            <View>
                                <Text style={[styles.kpiAmount, { color: COLORS.danger }]}>₪{totalExpenses.toLocaleString()}</Text>
                                <Text style={[styles.kpiTrend, { color: COLORS.danger }]}>-5% מהחודש שעבר</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Profit - Main ONE */}
                        <TouchableOpacity style={[styles.kpiCard, styles.kpiCardProfit, { width: 200 }]}>
                            <View>
                                <Text style={[styles.kpiLabel, { color: COLORS.primary }]}>רווח נקי</Text>
                                <Wallet size={24} color={COLORS.primary} />
                            </View>
                            <View>
                                <Text style={[styles.kpiAmount, { color: COLORS.primary, fontSize: 28 }]}>₪{netProfit.toLocaleString()}</Text>
                                <Text style={[styles.kpiTrend, { color: COLORS.primary }]}>{profitMargin}% Margin</Text>
                            </View>
                        </TouchableOpacity>
                    </ScrollView>
                </Animated.View>

                {/* Profit Logic Section */}
                <Text style={styles.sectionTitle}>חישוב רווח (Profit Calculation)</Text>
                <View style={styles.card}>
                    <View style={styles.row}>
                        <Text style={styles.label}>הכנסות</Text>
                        <Text style={[styles.value, { color: COLORS.success }]}>₪ {totalRevenue.toLocaleString()}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>פחות הוצאות</Text>
                        <Text style={[styles.value, { color: COLORS.danger }]}>- ₪ {totalExpenses.toLocaleString()}</Text>
                    </View>
                    <View style={styles.thickDivider} />
                    <View style={styles.row}>
                        <Text style={[styles.label, { color: COLORS.textPrimary, fontFamily: FONTS.bold }]}>רווח נטו</Text>
                        <Text style={styles.profitHighlight}>₪ {netProfit.toLocaleString()}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                        <Text style={[styles.label, { fontSize: 12 }]}>שיעור רווח: </Text>
                        <Text style={[styles.value, { color: COLORS.primary, fontSize: 14 }]}>{profitMargin}%</Text>
                    </View>
                </View>

                {/* Expenses Breakdown */}
                <Text style={styles.sectionTitle}>הוצאות (Expenses)</Text>

                {/* Pie Chart */}
                {expensesByCategory.length > 0 && (
                    <View style={[styles.card, { alignItems: 'center', paddingHorizontal: 0 }]}>
                        <PieChartKit
                            data={expensesByCategory}
                            width={Dimensions.get('window').width - 40} // Full width minus margins
                            height={220}
                            chartConfig={{
                                backgroundColor: COLORS.surface,
                                backgroundGradientFrom: COLORS.surface,
                                backgroundGradientTo: COLORS.surface,
                                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            }}
                            accessor={"amount"}
                            backgroundColor={"transparent"}
                            paddingLeft={"85"} // Center the circle (since legend is gone/custom)
                            center={[0, 0]}
                            absolute={false}
                            hasLegend={false}
                        />
                        <Text style={{ position: 'absolute', top: 90, left: 0, right: 0, textAlign: 'center', color: COLORS.textSecondary, fontSize: 12 }}>
                            לחץ על הרשימה לפרטים
                        </Text>
                    </View>
                )}

                <View style={styles.card}>
                    {filteredData.periodExpenses.length === 0 && expensesFromInvoices === 0 ? (
                        <Text style={{ color: COLORS.textTertiary, textAlign: 'center' }}>אין הוצאות בתקופה זו</Text>
                    ) : (
                        expensesByCategory.map((exp, i) => (
                            <View key={i} style={styles.row}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: exp.color }} />
                                    <Text style={[styles.label, { flex: 1 }]}>{exp.name}</Text>
                                </View>
                                <Text style={styles.value}>₪{exp.amount.toLocaleString()}</Text>
                            </View>
                        ))
                    )}
                </View>

                {/* Profit By Project */}
                <Text style={styles.sectionTitle}>רווח לפי פרויקט (Profit By Project)</Text>
                {projectsData.length === 0 ? (
                    <Text style={{ color: COLORS.textTertiary, textAlign: 'center', marginBottom: 20 }}>אין נתונים</Text>
                ) : (
                    projectsData.map((project, index) => (
                        <View key={index} style={styles.projectItem}>
                            <Text style={styles.projectTitle}>{project.name}</Text>
                            <View style={[styles.row, { marginBottom: 8 }]}>
                                <Text style={{ color: COLORS.success, fontSize: 14 }}>הכנסה: ₪{project.revenue.toLocaleString()}</Text>
                            </View>

                            {/* Invoices List for this Project */}
                            {project.invoicesList.map((inv, i) => (
                                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>
                                        {new Date(inv.date).toLocaleDateString('he-IL')} - {inv.title}
                                    </Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <Text style={{
                                            fontSize: 10,
                                            color: inv.status === 'paid' ? COLORS.success : inv.status === 'pending' ? COLORS.warning : COLORS.danger
                                        }}>
                                            {inv.status === 'paid' ? 'שולם' : inv.status === 'pending' ? 'ממתין' : 'באיחור'}
                                        </Text>
                                        <Text style={{ color: COLORS.textTertiary, fontSize: 12 }}>₪{parseAmount(inv.amount)}</Text>
                                    </View>
                                </View>
                            ))}

                            {/* Detailed Expenses for this Project */}
                            {project.expenses > 0 && (
                                <View style={{ marginBottom: 8 }}>
                                    <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginBottom: 4 }}>הוצאות:</Text>
                                    {project.expensesList.map((exp, i) => (
                                        <Text key={i} style={styles.expenseText}>
                                            • {exp.category}: -₪{exp.amount}
                                        </Text>
                                    ))}
                                    <View style={{ height: 1, backgroundColor: COLORS.border, marginTop: 4, width: '50%' }} />
                                    <Text style={[styles.expenseText, { marginTop: 4 }]}>Total Expenses: -₪{project.expenses.toLocaleString()}</Text>
                                </View>
                            )}

                            <View style={styles.projectProfitRow}>
                                <Text style={{ color: COLORS.primary, fontFamily: FONTS.bold }}>רווח: ₪{project.profit.toLocaleString()}</Text>
                                <Text style={{ color: COLORS.primary }}>({project.margin}%)</Text>
                            </View>
                        </View>
                    ))
                )}


                {/* Export Actions */}
                <Text style={styles.sectionTitle}>ייצוא ושיתוף</Text>
                <View style={{ paddingHorizontal: 20 }}>
                    <TouchableOpacity style={styles.exportButton} onPress={handleExportPDF}>
                        <Printer size={20} color={COLORS.white} />
                        <Text style={styles.exportText}>ייצוא ל-PDF</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.exportButton}>
                        <Mail size={20} color={COLORS.white} />
                        <Text style={styles.exportText}>שלח בדוא״ל</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.exportButton}>
                        <ShareIcon size={20} color={COLORS.white} />
                        <Text style={styles.exportText}>שתף בוואטסאפ</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
