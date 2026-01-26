import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { I18nManager, View, ActivityIndicator, useColorScheme } from 'react-native';
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
import AllActivityScreen from './screens/AllActivityScreen';
import AddExpenseScreen from './screens/AddExpenseScreen';
import PnLScreen from './screens/PnLScreen';
import ExpensesListScreen from './screens/ExpensesListScreen';
import SettingsScreen from './screens/SettingsScreen';
import GoalsScreen from './screens/GoalsScreen';
import ClientsScreen from './screens/ClientsScreen';
import RecurringScreen from './screens/RecurringScreen';
import ExpenseTemplatesScreen from './screens/ExpenseTemplatesScreen';
import ReceiptGalleryScreen from './screens/ReceiptGalleryScreen';
import MainTabs from './navigation/MainTabs';
import { TransactionsProvider } from './context/TransactionsContext';
import { UserProfileProvider } from './context/UserProfileContext';
import { getColors } from './constants/theme';
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

// Clean, iOS-native themes
const LightTheme = {
    ...DefaultTheme,
    dark: false,
    colors: {
        ...DefaultTheme.colors,
        primary: '#007AFF',
        background: '#F2F2F7',
        card: '#FFFFFF',
        text: '#000000',
        border: 'rgba(60, 60, 67, 0.1)',
        notification: '#FF3B30',
    },
};

const DarkThemeCustom = {
    ...DarkTheme,
    dark: true,
    colors: {
        ...DarkTheme.colors,
        primary: '#0A84FF',
        background: '#000000',
        card: '#1C1C1E',
        text: '#FFFFFF',
        border: 'rgba(84, 84, 88, 0.65)',
        notification: '#FF453A',
    },
};

export default function App() {
    const colorScheme = useColorScheme();
    const colors = getColors(colorScheme);
    const theme = colorScheme === 'light' ? LightTheme : DarkThemeCustom;

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
