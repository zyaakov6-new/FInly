import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Platform, StyleSheet, useColorScheme } from 'react-native';
import { Home, BarChart3, ShoppingCart, User } from 'lucide-react-native';
import DashboardScreen from '../screens/DashboardScreen';
import PnLScreen from '../screens/PnLScreen';
import ExpensesListScreen from '../screens/ExpensesListScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { COLORS, FONTS, getColors } from '../constants/theme';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
    const colorScheme = useColorScheme();
    const colors = getColors(colorScheme);

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: [styles.tabBar, { backgroundColor: colors.surface, borderColor: colors.border }],
                tabBarShowLabel: true,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textTertiary,
                tabBarLabelStyle: styles.tabLabel,
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    tabBarLabel: 'ראשי',
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Expenses"
                component={ExpensesListScreen}
                options={{
                    tabBarLabel: 'הוצאות',
                    tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Insights"
                component={PnLScreen}
                options={{
                    tabBarLabel: 'תובנות',
                    tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={SettingsScreen}
                options={{
                    tabBarLabel: 'פרופיל',
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
                }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#0a0a0a', // Dark theme
        borderRadius: 24,
        borderTopWidth: 0,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        height: 70,
        paddingBottom: 10,
        paddingTop: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    tabLabel: {
        fontFamily: FONTS.medium,
        fontSize: 12,
        paddingBottom: 4
    }
});
