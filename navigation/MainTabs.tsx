import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Platform, StyleSheet, useColorScheme, Animated, TouchableOpacity, Text } from 'react-native';
import { Home, BarChart3, ShoppingCart, User, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import DashboardScreen from '../screens/DashboardScreen';
import PnLScreen from '../screens/PnLScreen';
import ExpensesListScreen from '../screens/ExpensesListScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { FONTS, getColors, SHADOWS, GRADIENTS } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
    const colorScheme = useColorScheme();
    const colors = getColors(colorScheme);
    const mainNav = useNavigation<any>();

    return (
        <View style={styles.tabBarContainer}>
            {/* Main Tab Bar */}
            <View style={[
                styles.tabBar,
                {
                    backgroundColor: colorScheme === 'dark' ? 'rgba(22, 22, 31, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    borderColor: colors.border,
                }
            ]}>
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

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    // Get icon based on route
                    const getIcon = () => {
                        const iconColor = isFocused ? colors.primary : colors.textTertiary;
                        const iconSize = 24;

                        switch (route.name) {
                            case 'Dashboard':
                                return <Home size={iconSize} color={iconColor} />;
                            case 'Expenses':
                                return <ShoppingCart size={iconSize} color={iconColor} />;
                            case 'Insights':
                                return <BarChart3 size={iconSize} color={iconColor} />;
                            case 'Profile':
                                return <User size={iconSize} color={iconColor} />;
                            default:
                                return null;
                        }
                    };

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={styles.tabItem}
                            activeOpacity={0.7}
                        >
                            <View style={styles.tabItemContent}>
                                {isFocused && (
                                    <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />
                                )}
                                <View style={[
                                    styles.iconContainer,
                                    isFocused && { backgroundColor: `${colors.primary}15` }
                                ]}>
                                    {getIcon()}
                                </View>
                                <Text style={[
                                    styles.tabLabel,
                                    {
                                        color: isFocused ? colors.primary : colors.textTertiary,
                                        fontFamily: isFocused ? FONTS.semiBold : FONTS.medium,
                                    }
                                ]}>
                                    {label}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fabContainer}
                onPress={() => mainNav.navigate('AddExpense')}
                activeOpacity={0.9}
            >
                <LinearGradient
                    colors={GRADIENTS.primary}
                    style={styles.fab}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Plus size={28} color="#fff" strokeWidth={2.5} />
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
};

export default function MainTabs() {
    const colorScheme = useColorScheme();
    const colors = getColors(colorScheme);

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
                options={{
                    tabBarLabel: 'ראשי',
                }}
            />
            <Tab.Screen
                name="Expenses"
                component={ExpensesListScreen}
                options={{
                    tabBarLabel: 'הוצאות',
                }}
            />
            <Tab.Screen
                name="Insights"
                component={PnLScreen}
                options={{
                    tabBarLabel: 'תובנות',
                }}
            />
            <Tab.Screen
                name="Profile"
                component={SettingsScreen}
                options={{
                    tabBarLabel: 'פרופיל',
                }}
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
        alignItems: 'center',
        paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    },
    tabBar: {
        flexDirection: 'row',
        marginHorizontal: 20,
        borderRadius: 28,
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderWidth: 1,
        ...SHADOWS.large,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabItemContent: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        position: 'relative',
    },
    activeIndicator: {
        position: 'absolute',
        top: -6,
        width: 24,
        height: 3,
        borderRadius: 2,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
    tabLabel: {
        fontSize: 11,
        marginTop: 2,
    },
    fabContainer: {
        position: 'absolute',
        top: -28,
        alignSelf: 'center',
        ...SHADOWS.xlarge,
        shadowColor: '#FF6B6B',
    },
    fab: {
        width: 60,
        height: 60,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.2)',
    },
});
