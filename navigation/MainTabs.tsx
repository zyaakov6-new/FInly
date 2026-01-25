import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Platform, StyleSheet } from 'react-native';
import { Home, PieChart, Users, Settings, Briefcase, Target } from 'lucide-react-native';
import DashboardScreen from '../screens/DashboardScreen';
import PnLScreen from '../screens/PnLScreen';
import InvoicesListScreen from '../screens/InvoicesListScreen';
import GoalsScreen from '../screens/GoalsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { COLORS, FONTS } from '../constants/theme';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarShowLabel: true,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.4)',
                tabBarLabelStyle: styles.tabLabel,
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    tabBarLabel: 'ראשי',
                    tabBarIcon: ({ color, size }: { color: string, size: number }) => <Home color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Reports"
                component={PnLScreen}
                options={{
                    tabBarLabel: 'דוחות',
                    tabBarIcon: ({ color, size }: { color: string, size: number }) => <PieChart color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Goals"
                component={GoalsScreen}
                options={{
                    tabBarLabel: 'יעדים',
                    tabBarIcon: ({ color, size }: { color: string, size: number }) => <Target color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Customers"
                component={InvoicesListScreen}
                options={{
                    tabBarLabel: 'לקוחות',
                    tabBarIcon: ({ color, size }: { color: string, size: number }) => <Users color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarLabel: 'הגדרות',
                    tabBarIcon: ({ color, size }: { color: string, size: number }) => <Settings color={color} size={size} />,
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
