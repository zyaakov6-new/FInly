import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { I18nManager, View, ActivityIndicator, useColorScheme } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Rubik_400Regular, Rubik_500Medium, Rubik_600SemiBold, Rubik_700Bold } from '@expo-google-fonts/rubik';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
import { getColors, FONTS } from './constants/theme';
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

// Premium App Themes
const LightAppTheme = {
    ...DefaultTheme,
    dark: false,
    colors: {
        ...DefaultTheme.colors,
        primary: '#FF6B6B',
        background: '#FFF8F0',
        card: '#FFFFFF',
        text: '#1A1A2E',
        border: '#F0E6DD',
        notification: '#FF6B6B',
    },
};

const DarkAppTheme = {
    ...DarkTheme,
    dark: true,
    colors: {
        ...DarkTheme.colors,
        primary: '#FF6B6B',
        background: '#0D0D14',
        card: '#16161F',
        text: '#FFFFFF',
        border: 'rgba(255, 255, 255, 0.08)',
        notification: '#FF6B6B',
    },
};

export default function App() {
    const colorScheme = useColorScheme();
    const colors = getColors(colorScheme);
    const theme = colorScheme === 'light' ? LightAppTheme : DarkAppTheme;

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
            <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <ErrorBoundary>
            <SafeAreaProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <UserProfileProvider>
                        <TransactionsProvider>
                            <NavigationContainer theme={theme}>
                                <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
                                <Stack.Navigator
                                    initialRouteName="Login"
                                    screenOptions={{
                                        headerShown: false,
                                        cardStyle: { backgroundColor: colors.background },
                                        cardStyleInterpolator: ({ current, layouts }) => ({
                                            cardStyle: {
                                                transform: [
                                                    {
                                                        translateX: current.progress.interpolate({
                                                            inputRange: [0, 1],
                                                            outputRange: [-layouts.screen.width, 0],
                                                        }),
                                                    },
                                                ],
                                            },
                                        }),
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
                                    <Stack.Screen name="AllActivity" component={AllActivityScreen} />
                                    <Stack.Screen name="ExpensesList" component={ExpensesListScreen} />
                                    <Stack.Screen
                                        name="AddExpense"
                                        component={AddExpenseScreen}
                                        options={{
                                            presentation: 'modal',
                                            cardStyleInterpolator: ({ current, layouts }) => ({
                                                cardStyle: {
                                                    transform: [
                                                        {
                                                            translateY: current.progress.interpolate({
                                                                inputRange: [0, 1],
                                                                outputRange: [layouts.screen.height, 0],
                                                            }),
                                                        },
                                                    ],
                                                },
                                            }),
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
                                            cardStyleInterpolator: ({ current, layouts }) => ({
                                                cardStyle: {
                                                    transform: [
                                                        {
                                                            translateY: current.progress.interpolate({
                                                                inputRange: [0, 1],
                                                                outputRange: [layouts.screen.height, 0],
                                                            }),
                                                        },
                                                    ],
                                                },
                                            }),
                                        }}
                                    />
                                    <Stack.Screen name="ReceiptGallery" component={ReceiptGalleryScreen} />
                                    <Stack.Screen name="Settings" component={SettingsScreen} />
                                    <Stack.Screen name="PnL" component={PnLScreen} />
                                </Stack.Navigator>
                            </NavigationContainer>
                        </TransactionsProvider>
                    </UserProfileProvider>
                </GestureHandlerRootView>
            </SafeAreaProvider>
        </ErrorBoundary>
    );
}
