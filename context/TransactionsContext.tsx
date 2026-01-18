import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Types ---
export type TransactionType = 'invoice' | 'expense';
export type TransactionStatus = 'pending' | 'paid' | 'overdue';

export interface Transaction {
    id: string;
    type: TransactionType;
    title: string;
    amount: string; // "₪ 5,000"
    date: Date;
    category?: string;
    isIncome: boolean;
    cost?: string; // "₪ 500"
    status?: TransactionStatus; // New: status field
    notes?: string;
    clientName?: string;
    clientId?: string; // Link to Client
    // New Expense Fields
    supplier?: string;
    paymentMethod?: 'cash' | 'credit' | 'transfer' | 'check' | 'other';
    isDeductible?: boolean;
    taxAmount?: number;
    receiptImageUri?: string;
    paidDate?: Date; // New: Track when marked as paid
}

export interface UserProfile {
    name: string;
    email: string;
    phone: string;
    industry: string;
    avatarUri?: string;
}

export interface BusinessSettings {
    name: string;
    currency: string;
    taxId: string;
    address: string;
}

export interface PriceSettings {
    defaultServicePrice: string;
    hourlyRate: string;
    taxRate: number;
    defaultDiscount: number;
    discountType: 'none' | 'fixed' | 'percent';
}

export interface Goals {
    monthlyIncomeTarget: number;
    monthlyExpenseLimit: number;
    profitMarginTarget: number; // Percentage
    projectCountGoal: number;
}

export interface Client {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: string;
    notes?: string;
    createdAt: Date;
}

export interface RecurringTransaction {
    id: string;
    templateTransaction: Omit<Transaction, 'id' | 'date'>;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    startDate: Date;
    endDate?: Date;
    nextOccurrence: Date;
    isActive: boolean;
}

interface TransactionsContextType {
    transactions: Transaction[];
    categories: string[];
    addTransaction: (tx: Transaction) => void;
    updateTransaction: (id: string, updates: Partial<Transaction>) => void;
    deleteTransaction: (id: string) => void;
    addCategory: (category: string) => void;
    deleteCategory: (category: string) => void;
    updateCategory: (oldCategory: string, newCategory: string) => void;

    // Dashboard Helpers
    getDailyStats: (date: Date) => { revenue: number, expenses: number, profit: number };
    getLast7DaysTrend: () => { date: Date, dayName: string, profit: number, revenue: number }[];
    getTopExpenseCategory: (period: 'month' | 'week' | 'year' | 'all') => { category: string, amount: number, percentage: string, count: number } | null;
    getPendingInvoicesStats: () => { count: number, totalAmount: number, overdueCount: number, maxOverdueDays: number };

    // Settings
    userProfile: UserProfile;
    updateUserProfile: (updates: Partial<UserProfile>) => void;
    businessSettings: BusinessSettings;
    updateBusinessSettings: (updates: Partial<BusinessSettings>) => void;
    priceSettings: PriceSettings;
    updatePriceSettings: (updates: Partial<PriceSettings>) => void;

    // Goals
    goals: Goals;
    updateGoals: (updates: Partial<Goals>) => void;
    getMonthlyIncomeProgress: () => { current: number, target: number, percentage: number };
    getMonthlyExpenseProgress: () => { current: number, limit: number, percentage: number };
    getProfitMarginProgress: () => { current: number, target: number };
    getProjectCountProgress: () => { current: number, target: number, percentage: number };

    recentActivity: Transaction[];
    allTransactions: Transaction[]; // New: Full list sorted
    getPriceHistoryByCategory: (category: string) => Transaction[];

    // KPIs
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    projectsCount: number;

    // Clients
    clients: Client[];
    addClient: (client: Client) => void;
    updateClient: (id: string, updates: Partial<Client>) => void;
    deleteClient: (id: string) => void;
    getClientTransactions: (clientId: string) => Transaction[];

    // Recurring Transactions
    recurringTransactions: RecurringTransaction[];
    addRecurringTransaction: (recurring: RecurringTransaction) => void;
    updateRecurringTransaction: (id: string, updates: Partial<RecurringTransaction>) => void;
    deleteRecurringTransaction: (id: string) => void;
    toggleRecurringActive: (id: string) => void;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export const useTransactions = () => {
    const context = useContext(TransactionsContext);
    if (!context) {
        throw new Error('useTransactions must be used within a TransactionsProvider');
    }
    return context;
};

// --- Mock Data ---
const INITIAL_TRANSACTIONS: Transaction[] = [
    {
        id: '1',
        type: 'invoice',
        title: 'חשבונית: "אירוע חתונה"',
        amount: '₪ 5,000',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        category: 'ניהול אירוע',
        isIncome: true,
        cost: '₪ 1,200',
        status: 'paid', // Counted in Revenue
    },
    {
        id: '2',
        type: 'expense',
        title: 'הוצאה: "קייטרינג"',
        amount: '₪ 800',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        category: 'מזון',
        isIncome: false,
        status: 'paid',
    },
    {
        id: '3',
        type: 'invoice',
        title: 'חשבונית: "ייעוץ פרויקט"',
        amount: '₪ 2,500',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        category: 'ייעוץ',
        isIncome: true,
        cost: '₪ 0',
        status: 'pending', // NOT counted in Revenue yet
    },
];

const INITIAL_CATEGORIES = [
    // Services
    'עיצוב גרפי',
    'פיתוח אתרים',
    'ייעוץ',
    'ניהול אירוע',
    'הדרכה',
    // Expenses
    'חומרי גלם',
    'ציוד וכלים',
    'משרדי',
    'קבלן משנה',
    'בנזין / דלק',
    'חניה',
    'תחבורה ציבורית',
    'טיסות / מלונות',
    'שכר דירה / משרד',
    'ביטוח',
    'רישיונות',
    'טלפון / אינטרנט',
    'פרסום',
    'אתר / דומיין',
    'ארוחות עובדים',
    'אירוח',
    'קורסים / הכשרה',
    'אחר...'
];

// Helper to parse "₪ 5,000" -> 5000
const parseAmount = (amountStr?: string) => {
    if (!amountStr) return 0;
    return parseFloat(amountStr.replace(/[^0-9.-]+/g, "")) || 0;
};

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
    const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
    const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);


    const [userProfile, setUserProfile] = useState<UserProfile>({
        name: 'ישראל ישראלי',
        email: 'israel@example.com',
        phone: '050-1234567',
        industry: 'עיצוב גרפי',
        avatarUri: undefined
    });

    const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
        name: 'העסק שלי בע״מ',
        currency: 'NIS',
        taxId: '',
        address: ''
    });

    const [priceSettings, setPriceSettings] = useState<PriceSettings>({
        defaultServicePrice: '0',
        hourlyRate: '0',
        taxRate: 17,
        defaultDiscount: 0,
        discountType: 'none'
    });

    const [goals, setGoals] = useState<Goals>({
        monthlyIncomeTarget: 50000,
        monthlyExpenseLimit: 20000,
        profitMarginTarget: 30, // 30%
        projectCountGoal: 10
    });

    const updateUserProfile = (updates: Partial<UserProfile>) => setUserProfile(prev => ({ ...prev, ...updates }));
    const updateBusinessSettings = (updates: Partial<BusinessSettings>) => setBusinessSettings(prev => ({ ...prev, ...updates }));
    const updatePriceSettings = (updates: Partial<PriceSettings>) => setPriceSettings(prev => ({ ...prev, ...updates }));
    const updateGoals = (updates: Partial<Goals>) => setGoals(prev => ({ ...prev, ...updates }));

    // Clients State
    const [clients, setClients] = useState<Client[]>([]);

    const addClient = (client: Client) => setClients(prev => [client, ...prev]);
    const updateClient = (id: string, updates: Partial<Client>) =>
        setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    const deleteClient = (id: string) => setClients(prev => prev.filter(c => c.id !== id));
    const getClientTransactions = (clientId: string) =>
        transactions.filter(t => t.clientId === clientId);

    // Recurring Transactions State
    const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);

    const addRecurringTransaction = (recurring: RecurringTransaction) =>
        setRecurringTransactions(prev => [recurring, ...prev]);
    const updateRecurringTransaction = (id: string, updates: Partial<RecurringTransaction>) =>
        setRecurringTransactions(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    const deleteRecurringTransaction = (id: string) =>
        setRecurringTransactions(prev => prev.filter(r => r.id !== id));
    const toggleRecurringActive = (id: string) =>
        setRecurringTransactions(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));

    // Persistence: Load Data
    useEffect(() => {
        const loadData = async () => {
            try {
                const storedTx = await AsyncStorage.getItem('@finly_transactions');
                if (storedTx) {
                    const parsedTx = JSON.parse(storedTx);
                    // Restore Dates
                    const fixedTx = parsedTx.map((t: any) => ({
                        ...t,
                        date: new Date(t.date),
                        paidDate: t.paidDate ? new Date(t.paidDate) : undefined
                    }));
                    setTransactions(fixedTx);
                }

                const storedCats = await AsyncStorage.getItem('@finly_categories');
                if (storedCats) setCategories(JSON.parse(storedCats));

                const storedProfile = await AsyncStorage.getItem('@finly_profile');
                if (storedProfile) setUserProfile(JSON.parse(storedProfile));

                const storedBiz = await AsyncStorage.getItem('@finly_business');
                if (storedBiz) setBusinessSettings(JSON.parse(storedBiz));

                const storedPrice = await AsyncStorage.getItem('@finly_prices');
                if (storedPrice) setPriceSettings(JSON.parse(storedPrice));

                const storedGoals = await AsyncStorage.getItem('@finly_goals');
                if (storedGoals) setGoals(JSON.parse(storedGoals));

            } catch (e) {
                console.error('Failed to load persistence data:', e);
            }
        };
        loadData();
    }, []);

    // Persistence: Save Data (Effects)
    useEffect(() => {
        AsyncStorage.setItem('@finly_transactions', JSON.stringify(transactions));
    }, [transactions]);

    useEffect(() => {
        AsyncStorage.setItem('@finly_categories', JSON.stringify(categories));
    }, [categories]);

    useEffect(() => {
        AsyncStorage.setItem('@finly_profile', JSON.stringify(userProfile));
    }, [userProfile]);

    useEffect(() => {
        AsyncStorage.setItem('@finly_business', JSON.stringify(businessSettings));
    }, [businessSettings]);

    useEffect(() => {
        AsyncStorage.setItem('@finly_prices', JSON.stringify(priceSettings));
    }, [priceSettings]);

    useEffect(() => {
        AsyncStorage.setItem('@finly_goals', JSON.stringify(goals));
    }, [goals]);

    const addTransaction = (tx: Transaction) => {
        setTransactions(prev => [tx, ...prev]);
    };

    const updateTransaction = (id: string, updates: Partial<Transaction>) => {
        setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    const addCategory = (category: string) => {
        if (!categories.includes(category)) {
            // Keep "Other..." at the end
            const newCats = [...categories.filter(c => c !== 'אחר...'), category, 'אחר...'];
            setCategories(newCats);
        }
    };

    const deleteCategory = (category: string) => {
        setCategories(prev => prev.filter(c => c !== category));
    };

    const updateCategory = (oldCategory: string, newCategory: string) => {
        setCategories(prev => prev.map(c => c === oldCategory ? newCategory : c));
        // Also update transactions that use this category? 
        // For simplicity in Phase 1, we might not cascade updates or we could:
        setTransactions(prev => prev.map(t => t.category === oldCategory ? { ...t, category: newCategory } : t));
    };

    // New: Delete Transaction
    const deleteTransaction = (id: string) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const getPriceHistoryByCategory = (category: string) => {
        return transactions.filter(t => t.category === category && t.isIncome);
    };

    // --- Dashboard Helpers ---
    const getDailyStats = (date: Date) => {
        const start = new Date(date); start.setHours(0, 0, 0, 0);
        const end = new Date(date); end.setHours(23, 59, 59, 999);

        let revenue = 0;
        let expenses = 0;

        transactions.forEach(t => {
            const tDate = new Date(t.date);
            if (tDate >= start && tDate <= end) {
                const amount = parseAmount(t.amount);
                if (t.type === 'invoice') {
                    revenue += amount;
                    if (t.cost) expenses += parseAmount(t.cost);
                } else if (t.type === 'expense') {
                    expenses += amount;
                }
            }
        });
        return { revenue, expenses, profit: revenue - expenses };
    };

    const getLast7DaysTrend = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const { profit, revenue } = getDailyStats(d);
            // He-IL requires polyfill or Intl, we assume Intl exists in RN usually, or we use simple map
            const dayNames = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
            days.push({
                date: d,
                dayName: dayNames[d.getDay()],
                profit,
                revenue
            });
        }
        return days;
    };

    const getTopExpenseCategory = (period: 'month' | 'week' | 'year' | 'all') => {
        const now = new Date();
        const start = new Date(now);
        if (period === 'month') start.setDate(1);
        else if (period === 'year') start.setMonth(0, 1);
        else if (period === 'week') start.setDate(now.getDate() - 7);
        else start.setTime(0); // All time

        if (period !== 'week') start.setHours(0, 0, 0, 0);

        const expenses = transactions.filter(t => t.type === 'expense' && new Date(t.date) >= start);
        if (expenses.length === 0) return null;

        const groups: Record<string, { amount: number, count: number }> = {};
        let total = 0;

        expenses.forEach(e => {
            const val = parseAmount(e.amount);
            if (!groups[e.category!]) groups[e.category!] = { amount: 0, count: 0 };
            groups[e.category!].amount += val;
            groups[e.category!].count += 1;
            total += val;
        });

        const sorted = Object.entries(groups).sort((a, b) => b[1].amount - a[1].amount);
        if (sorted.length === 0) return null;

        const top = sorted[0];
        return {
            category: top[0],
            amount: top[1].amount,
            percentage: ((top[1].amount / total) * 100).toFixed(0),
            count: top[1].count
        };
    };

    const getPendingInvoicesStats = () => {
        const pending = transactions.filter(t => t.type === 'invoice' && t.status !== 'paid');
        const count = pending.length;
        const totalAmount = pending.reduce((sum, t) => sum + parseAmount(t.amount), 0);

        const now = new Date();
        let overdueCount = 0;
        let maxOverdueDays = 0;

        pending.forEach(t => {
            if (t.status === 'overdue' || (t.status === 'pending' && new Date(t.date) < now)) {
                overdueCount++;
                const diffTime = Math.abs(now.getTime() - new Date(t.date).getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > maxOverdueDays) maxOverdueDays = diffDays;
            }
        });

        return { count, totalAmount, overdueCount, maxOverdueDays };
    };

    // --- KPI Calculations ---
    const kpis = useMemo(() => {
        let revenue = 0;
        let expenses = 0;
        let pCount = 0;

        transactions.forEach(tx => {
            const val = parseAmount(tx.amount);

            if (tx.isIncome) {
                // Logic: Only add to Revenue if PAID
                if (tx.status === 'paid') {
                    revenue += val;
                }

                // Always count projects? Or only active/paid? 
                // Let's count all invoices as projects for now.
                pCount++;

                // Add Cost to Expenses
                // Should cost be added only if paid? 
                // "Cost of Service" implies we paid for it.
                if (tx.cost) {
                    expenses += parseAmount(tx.cost);
                }
            } else {
                // Regular Expense
                expenses += val;
            }
        });

        const profit = revenue - expenses;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

        return {
            totalRevenue: revenue,
            totalExpenses: expenses,
            netProfit: profit,
            profitMargin: parseFloat(margin.toFixed(1)),
            projectsCount: pCount
        };
    }, [transactions]);

    // Goals Progress Helpers
    const getMonthlyIncomeProgress = () => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyIncome = transactions
            .filter(tx => {
                const txDate = new Date(tx.date);
                return tx.isIncome &&
                    tx.status === 'paid' &&
                    txDate.getMonth() === currentMonth &&
                    txDate.getFullYear() === currentYear;
            })
            .reduce((sum, tx) => sum + parseAmount(tx.amount), 0);

        const percentage = goals.monthlyIncomeTarget > 0
            ? Math.min((monthlyIncome / goals.monthlyIncomeTarget) * 100, 100)
            : 0;

        return {
            current: monthlyIncome,
            target: goals.monthlyIncomeTarget,
            percentage: parseFloat(percentage.toFixed(1))
        };
    };

    const getMonthlyExpenseProgress = () => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyExpenses = transactions
            .filter(tx => {
                const txDate = new Date(tx.date);
                return !tx.isIncome &&
                    txDate.getMonth() === currentMonth &&
                    txDate.getFullYear() === currentYear;
            })
            .reduce((sum, tx) => sum + parseAmount(tx.amount), 0);

        const percentage = goals.monthlyExpenseLimit > 0
            ? Math.min((monthlyExpenses / goals.monthlyExpenseLimit) * 100, 100)
            : 0;

        return {
            current: monthlyExpenses,
            limit: goals.monthlyExpenseLimit,
            percentage: parseFloat(percentage.toFixed(1))
        };
    };

    const getProfitMarginProgress = () => {
        return {
            current: kpis.profitMargin,
            target: goals.profitMarginTarget
        };
    };

    const getProjectCountProgress = () => {
        const percentage = goals.projectCountGoal > 0
            ? Math.min((kpis.projectsCount / goals.projectCountGoal) * 100, 100)
            : 0;

        return {
            current: kpis.projectsCount,
            target: goals.projectCountGoal,
            percentage: parseFloat(percentage.toFixed(1))
        };
    };

    return (
        <TransactionsContext.Provider value={{
            transactions,
            categories,
            addTransaction,
            updateTransaction,
            deleteTransaction,
            addCategory,
            deleteCategory,
            updateCategory,

            userProfile,
            updateUserProfile,
            businessSettings,
            updateBusinessSettings,
            priceSettings,
            updatePriceSettings,

            goals,
            updateGoals,
            getMonthlyIncomeProgress,
            getMonthlyExpenseProgress,
            getProfitMarginProgress,
            getProjectCountProgress,

            recentActivity: transactions.slice(0, 5),
            allTransactions: transactions,
            getPriceHistoryByCategory,
            getDailyStats,
            getLast7DaysTrend,
            getTopExpenseCategory,
            getPendingInvoicesStats,

            // Clients
            clients,
            addClient,
            updateClient,
            deleteClient,
            getClientTransactions,

            // Recurring Transactions
            recurringTransactions,
            addRecurringTransaction,
            updateRecurringTransaction,
            deleteRecurringTransaction,
            toggleRecurringActive,

            ...kpis
        }}>
            {children}
        </TransactionsContext.Provider>
    );
};
