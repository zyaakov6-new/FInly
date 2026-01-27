import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, useColorScheme, TouchableOpacity, Text } from 'react-native';
import { Home, BarChart3, Receipt, User, Plus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import DashboardScreen from '../screens/DashboardScreen';
import PnLScreen from '../screens/PnLScreen';
import ExpensesListScreen from '../screens/ExpensesListScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { getColors, FONTS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../constants/theme';

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
    const colorScheme = useColorScheme();
    const colors = getColors(colorScheme);
    const insets = useSafeAreaInsets();
    const mainNav = useNavigation<any>();

    return (
        <View style={[
            styles.tabBarContainer,
            { paddingBottom: insets.bottom > 0 ? insets.bottom : SPACING.lg }
        ]}>
            <View style={[styles.tabBar, { backgroundColor: colors.surface }, SHADOWS.lg]}>
                {state.routes.map((route: any, index: number) => {
                    const { options } = descriptors[route.key];
                    const label = options.tabBarLabel ?? options.title ?? route.name;
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const getIcon = () => {
                        const iconColor = isFocused ? colors.primary : colors.textTertiary;
                        const iconSize = 22;
                        const strokeWidth = isFocused ? 2 : 1.5;

                        switch (route.name) {
                            case 'Dashboard':
                                return <Home size={iconSize} color={iconColor} strokeWidth={strokeWidth} />;
                            case 'Expenses':
                                return <Receipt size={iconSize} color={iconColor} strokeWidth={strokeWidth} />;
                            case 'Insights':
                                return <BarChart3 size={iconSize} color={iconColor} strokeWidth={strokeWidth} />;
                            case 'Profile':
                                return <User size={iconSize} color={iconColor} strokeWidth={strokeWidth} />;
                            default:
                                return null;
                        }
                    };

                    // Insert FAB before the third tab (index 2)
                    if (index === 2) {
                        return (
                            <React.Fragment key="fab-and-tab">
                                {/* FAB */}
                                <TouchableOpacity
                                    style={[styles.fab, { backgroundColor: colors.primary }]}
                                    onPress={() => mainNav.navigate('AddExpense')}
                                    activeOpacity={0.8}
                                >
                                    <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
                                </TouchableOpacity>

                                {/* Tab */}
                                <TouchableOpacity
                                    key={route.key}
                                    accessibilityRole="button"
                                    accessibilityState={isFocused ? { selected: true } : {}}
                                    onPress={onPress}
                                    style={styles.tabItem}
                                    activeOpacity={0.7}
                                >
                                    {getIcon()}
                                    <Text style={[
                                        styles.tabLabel,
                                        { color: isFocused ? colors.primary : colors.textTertiary }
                                    ]}>
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            </React.Fragment>
                        );
                    }

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            onPress={onPress}
                            style={styles.tabItem}
                            activeOpacity={0.7}
                        >
                            {getIcon()}
                            <Text style={[
                                styles.tabLabel,
                                { color: isFocused ? colors.primary : colors.textTertiary }
                            ]}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

export default function MainTabs() {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ tabBarLabel: 'ראשי' }}
            />
            <Tab.Screen
                name="Expenses"
                component={ExpensesListScreen}
                options={{ tabBarLabel: 'הוצאות' }}
            />
            <Tab.Screen
                name="Insights"
                component={PnLScreen}
                options={{ tabBarLabel: 'תובנות' }}
            />
            <Tab.Screen
                name="Profile"
                component={SettingsScreen}
                options={{ tabBarLabel: 'הגדרות' }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBarContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: SPACING.lg,
    },
    tabBar: {
        flexDirection: 'row',
        borderRadius: RADIUS.xl,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.sm,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.sm,
    },
    tabLabel: {
        ...TYPOGRAPHY.captionSmall,
        fontFamily: FONTS.medium,
        marginTop: SPACING.xs,
    },
    fab: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: SPACING.xs,
        marginTop: -SPACING.lg,
    },
});
