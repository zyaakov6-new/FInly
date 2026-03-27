import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { I18nManager, View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Rubik_400Regular, Rubik_500Medium, Rubik_600SemiBold, Rubik_700Bold } from '@expo-google-fonts/rubik';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import SignupStep2Screen from './screens/SignupStep2Screen';
import SignupStep3Screen from './screens/SignupStep3Screen';
import SignupStep4Screen from './screens/SignupStep4Screen';
import OnboardingScreen from './screens/OnboardingScreen';
import CreateInvoiceScreen from './screens/CreateInvoiceScreen';
import InvoiceDetailsScreen from './screens/InvoiceDetailsScreen';
import InvoicesListScreen from './screens/InvoicesListScreen';
import AllActivityScreen from './screens/AllActivityScreen';
import AddExpenseScreen from './screens/AddExpenseScreen';
import PnLScreen from './screens/PnLScreen';
import ExpensesListScreen from './screens/ExpensesListScreen';
import SettingsScreen from './screens/SettingsScreen';
import GoalsScreen from './screens/GoalsScreen';
import ClientsScreen from './screens/ClientsScreen';
import RecurringScreen from './screens/RecurringScreen';
import ExpenseTemplatesScreen from './screens/ExpenseTemplatesScreen';
import InvoiceTemplatesScreen from './screens/InvoiceTemplatesScreen';
import ReceiptGalleryScreen from './screens/ReceiptGalleryScreen';
import FreelancerScoreScreen from './screens/FreelancerScoreScreen';
import MainTabs from './navigation/MainTabs';
import { TransactionsProvider } from './context/TransactionsContext';
import { UserProfileProvider } from './context/UserProfileContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { getColors, COLORS } from './constants/theme';
import ErrorBoundary from './components/ErrorBoundary';

// Force RTL for Hebrew
try {
    if (!I18nManager.isRTL) {
        I18nManager.allowRTL(true);
        I18nManager.forceRTL(true);
    }
} catch (e) {
    console.warn("RTL Error", e);
}

const Stack = createStackNavigator();

// Modern themes matching our new design system
const LightTheme = {
    ...DefaultTheme,
    dark: false,
    colors: {
        ...DefaultTheme.colors,
        primary: COLORS.light.primary,
        background: COLORS.light.background,
        card: COLORS.light.surface,
        text: COLORS.light.textPrimary,
        border: COLORS.light.border,
        notification: COLORS.light.danger,
    },
};

const DarkThemeCustom = {
    ...DarkTheme,
    dark: true,
    colors: {
        ...DarkTheme.colors,
        primary: COLORS.dark.primary,
        background: COLORS.dark.background,
        card: COLORS.dark.surface,
        text: COLORS.dark.textPrimary,
        border: COLORS.dark.border,
        notification: COLORS.dark.danger,
    },
};

function AppContent() {
    const { resolvedTheme, isDark } = useTheme();
    const colors = getColors(resolvedTheme);
    const theme = isDark ? DarkThemeCustom : LightTheme;

    return (
        <NavigationContainer theme={theme}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{
                    headerShown: false,
                    cardStyle: { backgroundColor: colors.background },
                    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                    gestureEnabled: true,
                    gestureDirection: 'horizontal',
                }}
            >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Main" component={MainTabs} />
                <Stack.Screen name="Signup" component={SignupScreen} />
                <Stack.Screen name="SignupStep2" component={SignupStep2Screen} />
                <Stack.Screen name="SignupStep3" component={SignupStep3Screen} />
                <Stack.Screen name="SignupStep4" component={SignupStep4Screen} />
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="CreateInvoice" component={CreateInvoiceScreen} />
                <Stack.Screen name="InvoiceDetails" component={InvoiceDetailsScreen} />
                <Stack.Screen name="InvoicesList" component={InvoicesListScreen} />
                <Stack.Screen name="AllActivity" component={AllActivityScreen} />
                <Stack.Screen name="ExpensesList" component={ExpensesListScreen} />
                <Stack.Screen
                    name="AddExpense"
                    component={AddExpenseScreen}
                    options={{
                        presentation: 'modal',
                        cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
                        gestureEnabled: true,
                        gestureDirection: 'vertical',
                    }}
                />
                <Stack.Screen name="Goals" component={GoalsScreen} />
                <Stack.Screen name="Clients" component={ClientsScreen} />
                <Stack.Screen name="Recurring" component={RecurringScreen} />
                <Stack.Screen
                    name="ExpenseTemplates"
                    component={ExpenseTemplatesScreen}
                    options={{
                        presentation: 'modal',
                        cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
                    }}
                />
                <Stack.Screen name="InvoiceTemplates" component={InvoiceTemplatesScreen} />
                <Stack.Screen name="ReceiptGallery" component={ReceiptGalleryScreen} />
                <Stack.Screen name="FreelancerScore" component={FreelancerScoreScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="PnL" component={PnLScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default function App() {
    const [fontsLoaded, fontError] = useFonts({
        'Rubik-Regular': Rubik_400Regular,
        'Rubik-Medium': Rubik_500Medium,
        'Rubik-SemiBold': Rubik_600SemiBold,
        'Rubik-Bold': Rubik_700Bold,
    });

    useEffect(() => {
        if (fontError) {
            console.error("Font loading error:", fontError);
        }
    }, [fontError]);

    if (!fontsLoaded && !fontError) {
        return (
            <View style={{ flex: 1, backgroundColor: '#FAFAFA', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    return (
        <ErrorBoundary>
            <SafeAreaProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <ThemeProvider>
                        <AuthProvider>
                            <UserProfileProvider>
                                <TransactionsProvider>
                                    <NotificationProvider>
                                        <AppContent />
                                    </NotificationProvider>
                                </TransactionsProvider>
                            </UserProfileProvider>
                        </AuthProvider>
                    </ThemeProvider>
                </GestureHandlerRootView>
            </SafeAreaProvider>
        </ErrorBoundary>
    );
}
