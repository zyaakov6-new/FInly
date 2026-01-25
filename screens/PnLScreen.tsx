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
    Modal,
    Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowRight, ChevronDown, Calendar, TrendingUp, TrendingDown, Wallet, PieChart, Share as ShareIcon, Printer, Mail, Menu, X, Home, BarChart3, FileText, Settings, User, LogOut } from 'lucide-react-native';
import { useTransactions } from '../context/TransactionsContext';
import { useUserProfile } from '../context/UserProfileContext';
import { PieChart as PieChartKit } from 'react-native-chart-kit';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../constants/theme';

// Types
type TimePeriod = 'week' | 'month' | 'year' | 'all';

export default function PnLScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { userProfile: userProfileData } = useUserProfile();
    const { transactions, userProfile, businessSettings } = useTransactions();

    const { width } = Dimensions.get('window');

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
    const [menuVisible, setMenuVisible] = useState(false);

    // Animation
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(50)).current;
    const menuAnim = React.useRef(new Animated.Value(-width)).current;

    const openMenu = () => {
        setMenuVisible(true);
        Animated.spring(menuAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
        }).start();
    };

    const closeMenu = () => {
        Animated.timing(menuAnim, {
            toValue: -width,
            duration: 250,
            useNativeDriver: true,
        }).start(() => setMenuVisible(false));
    };

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
            backgroundColor: '#050505', // Deep black as requested
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 16,
            zIndex: 10,
        },
        headerTitle: {
            color: '#FFFFFF',
            fontSize: 18,
            fontFamily: FONTS.bold,
            textAlign: 'center',
            flex: 1,
        },
        headerButton: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'rgba(255,255,255,0.08)',
            alignItems: 'center',
            justifyContent: 'center',
        },

        // Hamburger Menu Styles
        menuOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
        },
        menuContainer: {
            width: width * 0.75,
            height: '100%',
            backgroundColor: '#0a0a1a',
            shadowColor: '#000',
            shadowOffset: { width: 5, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 15,
            elevation: 15,
        },
        menuGradient: {
            flex: 1,
            backgroundColor: '#0a0a1a',
        },
        menuHeader: {
            paddingTop: 80,
            paddingHorizontal: 24,
            paddingBottom: 30,
            backgroundColor: '#08201a',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255,255,255,0.05)',
        },
        closeButton: {
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 20,
            padding: 10,
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 12,
        },
        menuProfile: {
            alignItems: 'center',
        },
        menuAvatar: {
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: '#ff9a7a',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
            borderWidth: 2,
            borderColor: '#00ffdd',
        },
        menuAvatarText: {
            fontSize: 32,
        },
        menuName: {
            fontSize: 18,
            fontWeight: 'bold',
            color: '#ffffff',
            marginBottom: 4,
        },
        menuEmail: {
            fontSize: 13,
            color: 'rgba(255,255,255,0.6)',
        },
        menuItems: {
            flex: 1,
        },
        menuItemsContent: {
            padding: 24,
            paddingBottom: 40,
        },
        menuItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 15,
            borderRadius: 12,
            marginBottom: 10,
            backgroundColor: 'rgba(255,255,255,0.06)',
            height: 55,
        },
        menuItemText: {
            fontSize: 17,
            color: '#FFFFFF',
            fontWeight: 'bold',
            marginLeft: 15,
            textAlignVertical: 'center',
        },
        menuDivider: {
            height: 1,
            backgroundColor: 'rgba(255,255,255,0.05)',
            marginVertical: 12,
        },

        // Time Selector
        periodContainer: {
            paddingTop: 10,
            paddingHorizontal: 20,
            alignItems: 'center',
        },
        timelinePill: {
            flexDirection: 'row',
            backgroundColor: 'rgba(255,255,255,0.06)',
            borderRadius: 30,
            padding: 4,
            width: '100%',
        },
        timelineTab: {
            flex: 1,
            paddingVertical: 12,
            alignItems: 'center',
            borderRadius: 25,
        },
        activeTimelineTab: {
            backgroundColor: 'rgba(255,255,255,0.12)',
        },
        timelineTabText: {
            color: 'rgba(255,255,255,0.4)',
            fontSize: 14,
            fontFamily: FONTS.medium,
        },
        activeTimelineTabText: {
            color: '#FFFFFF',
        },
        currentPeriodLabel: {
            color: 'rgba(255,255,255,0.3)',
            fontSize: 13,
            marginTop: 15,
            marginBottom: 20,
            fontFamily: FONTS.regular,
        },

        // KPI Cards
        kpiRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            gap: 12,
            marginBottom: 25,
        },
        kpiCardItem: {
            flex: 1,
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: 24,
            padding: 20,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)',
        },
        kpiIconContainerRed: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: 'rgba(255,107,107,0.1)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
        },
        kpiIconContainerGreen: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: 'rgba(0,255,221,0.1)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
        },
        kpiItemLabel: {
            color: 'rgba(255,255,255,0.4)',
            fontSize: 11,
            fontFamily: FONTS.medium,
            marginBottom: 4,
        },
        kpiItemValue: {
            color: '#FFFFFF',
            fontSize: 22,
            fontFamily: FONTS.bold,
        },
        kpiPercentageRed: {
            color: '#ff6b6b',
            fontSize: 11,
            marginTop: 4,
            fontFamily: FONTS.bold,
        },
        kpiPercentageGreen: {
            color: '#00ffdd',
            fontSize: 11,
            marginTop: 4,
            fontFamily: FONTS.bold,
        },

        // Profit Centerpiece
        profitCenterpiece: {
            backgroundColor: '#0a0a1a', // Dark blueish
            marginHorizontal: 20,
            borderRadius: 32,
            padding: 30,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
            marginBottom: 40,
            shadowColor: '#00ffdd',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
        },
        profitCenterpieceLabel: {
            color: 'rgba(255,255,255,0.4)',
            fontSize: 14,
            fontFamily: FONTS.medium,
            marginBottom: 10,
        },
        profitCenterpieceValue: {
            color: '#FFFFFF',
            fontSize: 48,
            fontFamily: FONTS.bold,
            textShadowColor: 'rgba(255,255,255,0.3)',
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 15,
        },
        profitBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(0,255,221,0.1)',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            marginTop: 20,
        },
        profitBadgeDot: {
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: '#00ffdd',
            marginRight: 8,
        },
        profitBadgeText: {
            color: '#00ffdd',
            fontSize: 12,
            fontFamily: FONTS.bold,
        },

        // Sections
        sectionTitle: {
            color: '#FFFFFF',
            fontSize: 20,
            fontFamily: FONTS.bold,
            marginBottom: 20,
            paddingHorizontal: 20,
        },
        card: {
            backgroundColor: 'rgba(255,255,255,0.03)',
            marginHorizontal: 20,
            borderRadius: 24,
            padding: 20,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)',
            marginBottom: 40,
        },
        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        label: {
            color: 'rgba(255,255,255,0.4)',
            fontSize: 14,
            fontFamily: FONTS.regular,
        },
        value: {
            color: '#FFFFFF',
            fontSize: 16,
            fontFamily: FONTS.medium,
        },
        thickDivider: {
            height: 4,
            backgroundColor: 'rgba(255,255,255,0.05)',
            marginVertical: 16,
            borderRadius: 2,
        },
        profitHighlight: {
            color: '#FFFFFF',
            fontSize: 32,
            fontFamily: FONTS.bold,
        },

        // Chart & Legend Styles
        chartTitle: {
            fontSize: 12,
            fontFamily: FONTS.regular,
            color: 'rgba(255,255,255,0.3)',
            marginBottom: 20,
            textAlign: 'left',
            alignSelf: 'flex-start',
        },
        chartLegendRow: {
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
        },
        legendContainer: {
            flex: 1,
            gap: 15,
        },
        legendItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
        },
        legendDot: {
            width: 10,
            height: 10,
            borderRadius: 5,
        },
        legendText: {
            flex: 1,
            fontSize: 13,
            fontFamily: FONTS.medium,
            color: 'rgba(255,255,255,0.5)',
        },
        legendAmount: {
            fontSize: 13,
            fontFamily: FONTS.bold,
            color: '#FFFFFF',
        },

        // Projects Section
        projectItem: {
            backgroundColor: '#0a0a0a',
            borderRadius: 24,
            padding: 20,
            marginBottom: 16,
            marginHorizontal: 20,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)',
            borderLeftWidth: 4,
            borderLeftColor: '#00ffdd',
        },
        projectTitle: {
            color: '#FFFFFF',
            fontSize: 17,
            fontFamily: FONTS.bold,
            marginBottom: 4,
            textAlign: 'left',
        },
        projectSub: {
            color: 'rgba(255,255,255,0.3)',
            fontSize: 12,
            marginBottom: 15,
            textAlign: 'left',
        },
        projectLinks: {
            gap: 8,
            marginBottom: 20,
        },
        projectLink: {
            color: 'rgba(255,255,255,0.5)',
            fontSize: 13,
            textAlign: 'left',
        },
        projectStatusRow: {
            flexDirection: 'row',
            gap: 8,
            marginBottom: 20,
        },
        statusBadgePaid: {
            backgroundColor: 'rgba(37, 99, 235, 0.15)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
        },
        statusBadgePending: {
            backgroundColor: 'rgba(251, 191, 36, 0.15)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
        },
        statusBadgeTextPaid: {
            color: '#3b82f6',
            fontSize: 12,
            fontFamily: FONTS.bold,
        },
        statusBadgeTextPending: {
            color: '#fbbf24',
            fontSize: 12,
            fontFamily: FONTS.bold,
        },
        projectProfitRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
        },
        projectProfitLabel: {
            color: '#FFFFFF',
            fontSize: 22,
            fontFamily: FONTS.bold,
        },
        projectProfitExpenses: {
            color: '#ff6b6b',
            fontSize: 12,
            fontFamily: FONTS.medium,
        },

        // Export Actions
        exportButtonPrimary: {
            backgroundColor: '#2563eb', // Blue as in image
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 18,
            borderRadius: 20,
            marginBottom: 12,
            marginHorizontal: 20,
            shadowColor: '#2563eb',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 8,
        },
        exportButtonSecondary: {
            backgroundColor: 'transparent',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 18,
            borderRadius: 20,
            marginBottom: 12,
            marginHorizontal: 20,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
        },
        exportText: {
            color: '#FFFFFF',
            fontSize: 16,
            fontFamily: FONTS.bold,
            marginLeft: 12,
        },

        // FAB
        fab: {
            position: 'absolute',
            bottom: 40,
            alignSelf: 'center',
            width: 65,
            height: 65,
            borderRadius: 33,
            backgroundColor: '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#FFF',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 10,
            zIndex: 100,
        }
    });

    return (
        <View style={styles.container}>
            {/* Hamburger Menu Modal */}
            <Modal
                visible={menuVisible}
                transparent
                animationType="none"
                onRequestClose={closeMenu}
            >
                <TouchableOpacity
                    style={styles.menuOverlay}
                    activeOpacity={1}
                    onPress={() => { }}
                >
                    <Animated.View
                        style={[
                            styles.menuContainer,
                            { transform: [{ translateX: menuAnim }] }
                        ]}
                    >
                        <View style={styles.menuGradient}>
                            {/* Close Button */}
                            <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
                                <X size={24} color="#fff" />
                            </TouchableOpacity>

                            {/* Menu Header */}
                            <View style={styles.menuHeader}>
                                <View style={styles.menuProfile}>
                                    <View style={styles.menuAvatar}>
                                        <Text style={styles.menuAvatarText}>👤</Text>
                                    </View>
                                    <Text style={styles.menuName}>{userProfileData?.fullName || 'זיו המלך'}</Text>
                                    <Text style={styles.menuEmail}>{userProfileData?.email || 'user@finly.com'}</Text>
                                </View>
                            </View>

                            {/* Menu Items */}
                            <ScrollView
                                style={styles.menuItems}
                                contentContainerStyle={styles.menuItemsContent}
                                showsVerticalScrollIndicator={false}
                            >


                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => {
                                        closeMenu();
                                        navigation.navigate('Settings');
                                    }}
                                >
                                    <Settings size={24} color="#00ffdd" />
                                    <View style={{ flex: 1, paddingLeft: 10 }}>
                                        <Text style={styles.menuItemText}>הגדרות עסק</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => {
                                        closeMenu();
                                        navigation.navigate('Settings');
                                    }}
                                >
                                    <User size={24} color="#00ffdd" />
                                    <View style={{ flex: 1, paddingLeft: 10 }}>
                                        <Text style={styles.menuItemText}>הגדרות פרופיל</Text>
                                    </View>
                                </TouchableOpacity>

                                <View style={styles.menuDivider} />

                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => {
                                        closeMenu();
                                        navigation.navigate('Login');
                                    }}
                                >
                                    <LogOut size={24} color="#ff6b6b" />
                                    <View style={{ flex: 1, paddingLeft: 10 }}>
                                        <Text style={[styles.menuItemText, { color: '#ff6b6b' }]}>התנתק</Text>
                                    </View>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </Animated.View>
                </TouchableOpacity>
            </Modal>

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={openMenu} style={styles.headerButton}>
                    <Menu size={22} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>דוח רווח והפסד</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <Calendar size={22} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
                {/* Time Period Selector - Redesigned to match image */}
                <View style={styles.periodContainer}>
                    <View style={styles.timelinePill}>
                        {(['all', 'year', 'month', 'week'] as TimePeriod[]).map((p) => (
                            <TouchableOpacity
                                key={p}
                                style={[styles.timelineTab, selectedPeriod === p && styles.activeTimelineTab]}
                                onPress={() => setSelectedPeriod(p)}
                            >
                                <Text style={[styles.timelineTabText, selectedPeriod === p && styles.activeTimelineTabText]}>
                                    {p === 'week' ? 'שבוע' : p === 'month' ? 'חודש' : p === 'year' ? 'שנה' : 'הכל'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text style={styles.currentPeriodLabel}>ינואר 2026</Text>
                </View>

                {/* Main KPI Row - Income / Expense Cards */}
                <View style={styles.kpiRow}>
                    {/* Expense Card */}
                    <View style={styles.kpiCardItem}>
                        <View style={styles.kpiIconContainerRed}>
                            <TrendingDown size={18} color="#ff6b6b" />
                        </View>
                        <Text style={styles.kpiItemLabel}>סה"כ הוצאות</Text>
                        <Text style={styles.kpiItemValue}>₪{totalExpenses.toLocaleString()}</Text>
                        <Text style={styles.kpiPercentageRed}>-5%</Text>
                    </View>

                    {/* Income Card */}
                    <View style={styles.kpiCardItem}>
                        <View style={styles.kpiIconContainerGreen}>
                            <TrendingUp size={18} color="#00ffdd" />
                        </View>
                        <Text style={styles.kpiItemLabel}>סה"כ הכנסות</Text>
                        <Text style={styles.kpiItemValue}>₪{totalRevenue.toLocaleString()}</Text>
                        <Text style={styles.kpiPercentageGreen}>+15%</Text>
                    </View>
                </View>

                {/* Main Net Profit Centerpiece */}
                <View style={styles.profitCenterpiece}>
                    <Text style={styles.profitCenterpieceLabel}>רווח נטו זמין</Text>
                    <Text style={styles.profitCenterpieceValue}>₪{netProfit.toLocaleString()}</Text>
                    <View style={styles.profitBadge}>
                        <View style={styles.profitBadgeDot} />
                        <Text style={styles.profitBadgeText}>שיעור רווח: {profitMargin}%</Text>
                    </View>
                </View>



                {/* Expenses Breakdown Section */}
                <Text style={styles.sectionTitle}>פילוח הוצאות</Text>

                {expensesByCategory.length > 0 && (
                    <View style={styles.card}>
                        <Text style={styles.chartTitle}>ינואר 2026</Text>

                        <View style={styles.chartLegendRow}>
                            {/* Donut Chart */}
                            <PieChartKit
                                data={expensesByCategory}
                                width={180}
                                height={180}
                                chartConfig={{
                                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                }}
                                accessor={"amount"}
                                backgroundColor={"transparent"}
                                paddingLeft={"45"}
                                center={[0, 0]}
                                absolute={false}
                                hasLegend={false}
                            />

                            {/* Custom Legend */}
                            <View style={styles.legendContainer}>
                                {expensesByCategory.map((exp, i) => (
                                    <View key={i} style={styles.legendItem}>
                                        <View style={[styles.legendDot, { backgroundColor: exp.color }]} />
                                        <Text style={styles.legendText}>{exp.name}</Text>
                                        <Text style={styles.legendAmount}>₪{exp.amount.toLocaleString()}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                )}

                {/* Profit By Project Section */}
                <Text style={styles.sectionTitle}>רווח לפי פרויקט</Text>
                {projectsData.length === 0 ? (
                    <Text style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginBottom: 20 }}>אין נתונים</Text>
                ) : (
                    projectsData.map((project, index) => (
                        <View key={index} style={styles.projectItem}>
                            <Text style={styles.projectTitle}>{project.name}</Text>
                            <Text style={styles.projectSub}>2 עסקאות • עדכון חם</Text>

                            <Text style={{ color: '#00ffdd', fontSize: 18, fontFamily: FONTS.bold, marginBottom: 15 }}>
                                ₪{project.revenue.toLocaleString()}
                            </Text>

                            <View style={styles.projectLinks}>
                                {project.invoicesList.map((inv, i) => (
                                    <Text key={i} style={styles.projectLink}>• {inv.title}</Text>
                                ))}
                            </View>

                            <View style={styles.projectStatusRow}>
                                <View style={styles.statusBadgePaid}>
                                    <Text style={styles.statusBadgeTextPaid}>₪5,000 שולם</Text>
                                </View>
                                <View style={styles.statusBadgePending}>
                                    <Text style={styles.statusBadgeTextPending}>₪2,500 ממתין</Text>
                                </View>
                            </View>

                            <View style={styles.projectProfitRow}>
                                <Text style={styles.projectProfitLabel}>₪{project.profit.toLocaleString()} רווח</Text>
                                <Text style={styles.projectProfitExpenses}>הוצאות: -₪{project.expenses.toLocaleString()}</Text>
                            </View>
                        </View>
                    ))
                )}

                {/* Export Actions */}
                <View style={{ marginTop: 20 }}>
                    <TouchableOpacity style={styles.exportButtonPrimary} onPress={handleExportPDF}>
                        <FileText size={20} color="#FFFFFF" />
                        <Text style={styles.exportText}>ייצוא דוח PDF</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.exportButtonSecondary}>
                        <ShareIcon size={20} color="#FFFFFF" />
                        <Text style={styles.exportText}>שתף סיכום חודשי</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddExpense')}
            >
                <X size={32} color="#050505" style={{ transform: [{ rotate: '45deg' }] }} />
            </TouchableOpacity>
        </View>
    );
}

// STYLES OBJECT WAS ALREADY REWRITTEN IN PREVIOUS STEP OR WILL BE UPDATED TO RESOLVE LINTS
