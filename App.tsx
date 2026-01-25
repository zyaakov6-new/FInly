import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { I18nManager, View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Rubik_400Regular, Rubik_500Medium, Rubik_700Bold } from '@expo-google-fonts/rubik';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import SignupScreen from './screens/SignupScreen';
import SignupStep2Screen from './screens/SignupStep2Screen';
import SignupStep3Screen from './screens/SignupStep3Screen';
import SignupStep4Screen from './screens/SignupStep4Screen';
import OnboardingScreen from './screens/OnboardingScreen';
import CreateInvoiceScreen from './screens/CreateInvoiceScreen';
import InvoiceDetailsScreen from './screens/InvoiceDetailsScreen';
import AllActivityScreen from './screens/AllActivityScreen';
import AddExpenseScreen from './screens/AddExpenseScreen';
import PnLScreen from './screens/PnLScreen';
import ExpensesListScreen from './screens/ExpensesListScreen';
import InvoicesListScreen from './screens/InvoicesListScreen';
import SettingsScreen from './screens/SettingsScreen';
import GoalsScreen from './screens/GoalsScreen';
import ClientsScreen from './screens/ClientsScreen';
import RecurringScreen from './screens/RecurringScreen';
import ExpenseTemplatesScreen from './screens/ExpenseTemplatesScreen';
import ReceiptGalleryScreen from './screens/ReceiptGalleryScreen';
import MainTabs from './navigation/MainTabs';
import { TransactionsProvider } from './context/TransactionsContext';
import { UserProfileProvider } from './context/UserProfileContext';
import { COLORS, FONTS } from './constants/theme';
import ErrorBoundary from './components/ErrorBoundary';

// Force RTL
try {
    if (!I18nManager.isRTL) {
        I18nManager.allowRTL(true);
        I18nManager.forceRTL(true);
    }
} catch (e) {
    console.warn("RTL Error", e);
}

const Stack = createStackNavigator();

const AppTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        primary: COLORS.primary,
        background: COLORS.background,
        card: COLORS.surface,
        text: COLORS.textPrimary,
        border: COLORS.border,
    },
};

export default function App() {
    const [fontsLoaded, fontError] = useFonts({
        Rubik_400Regular,
        Rubik_500Medium,
        Rubik_700Bold,
    });

    useEffect(() => {
        if (fontError) {
            console.error("Font loading error:", fontError);
        }
    }, [fontError]);

    if (!fontsLoaded && !fontError) {
        return (
            <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <ErrorBoundary>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <UserProfileProvider>
                    <TransactionsProvider>
                        <NavigationContainer theme={AppTheme}>
                            <StatusBar style="light" backgroundColor={COLORS.background} />
                            <Stack.Navigator
                                initialRouteName="Login"
                                screenOptions={{
                                    headerShown: false,
                                    cardStyle: { backgroundColor: COLORS.background },
                                }}
                            >
                                <Stack.Screen name="Login" component={LoginScreen} />
                                <Stack.Screen name="Main" component={MainTabs} />
                                <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
                                <Stack.Screen name="SignupStep2" component={SignupStep2Screen} options={{ headerShown: false }} />
                                <Stack.Screen name="SignupStep3" component={SignupStep3Screen} options={{ headerShown: false }} />
                                <Stack.Screen name="SignupStep4" component={SignupStep4Screen} options={{ headerShown: false }} />
                                <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
                                <Stack.Screen name="CreateInvoice" component={CreateInvoiceScreen} />
                                <Stack.Screen name="InvoiceDetails" component={InvoiceDetailsScreen} />
                                <Stack.Screen name="AllActivity" component={AllActivityScreen} />
                                <Stack.Screen name="ExpensesList" component={ExpensesListScreen} />
                                <Stack.Screen name="AddExpense" component={AddExpenseScreen} options={{ presentation: 'modal' }} />
                                <Stack.Screen name="Goals" component={GoalsScreen} />
                                <Stack.Screen name="Clients" component={ClientsScreen} />
                                <Stack.Screen name="Recurring" component={RecurringScreen} />
                                <Stack.Screen name="ExpenseTemplates" component={ExpenseTemplatesScreen} options={{ presentation: 'modal' }} />
                                <Stack.Screen name="ReceiptGallery" component={ReceiptGalleryScreen} />
                            </Stack.Navigator>
                        </NavigationContainer>
                    </TransactionsProvider>
                </UserProfileProvider>
            </GestureHandlerRootView>
        </ErrorBoundary>
    );
}
