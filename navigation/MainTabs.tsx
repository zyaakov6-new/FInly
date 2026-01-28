import React, { useState, useRef, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, TouchableOpacity, Text, Animated, Modal, Pressable } from 'react-native';
import { Home, BarChart3, Receipt, User, Plus, X, FileText, Wallet, Users } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import DashboardScreen from '../screens/DashboardScreen';
import PnLScreen from '../screens/PnLScreen';
import ExpensesListScreen from '../screens/ExpensesListScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { useTheme } from '../context/ThemeContext';
import { getColors, FONTS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../constants/theme';

const Tab = createBottomTabNavigator();

// Quick Action Menu Component
const QuickActionMenu = ({ visible, onClose, onSelectAction, colors, isDark }: any) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(scaleAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const actions = [
        { id: 'expense', label: 'הוספת הוצאה', icon: Wallet, color: colors.danger, screen: 'AddExpense' },
        { id: 'invoice', label: 'יצירת חשבונית', icon: FileText, color: colors.success, screen: 'CreateInvoice' },
        { id: 'client', label: 'הוספת לקוח', icon: Users, color: colors.info, screen: 'Clients' },
    ];

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
        >
            <Pressable style={styles.menuOverlay} onPress={onClose}>
                <Animated.View
                    style={[
                        styles.menuBackdrop,
                        { opacity: opacityAnim }
                    ]}
                />
                <Animated.View
                    style={[
                        styles.menuContainer,
                        {
                            backgroundColor: colors.surface,
                            transform: [{ scale: scaleAnim }],
                            opacity: opacityAnim,
                        },
                        SHADOWS.xl,
                    ]}
                >
                    <View style={styles.menuHeader}>
                        <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>
                            פעולה מהירה
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.menuCloseBtn}>
                            <X size={20} color={colors.textTertiary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.menuActions}>
                        {actions.map((action, index) => (
                            <TouchableOpacity
                                key={action.id}
                                style={[styles.menuAction, { borderBottomColor: colors.border }]}
                                onPress={() => onSelectAction(action.screen)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.menuActionIcon, { backgroundColor: action.color + '20' }]}>
                                    <action.icon size={22} color={action.color} />
                                </View>
                                <Text style={[styles.menuActionLabel, { color: colors.textPrimary }]}>
                                    {action.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>
            </Pressable>
        </Modal>
    );
};

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
    const { resolvedTheme, isDark } = useTheme();
    const colors = getColors(resolvedTheme);
    const insets = useSafeAreaInsets();
    const mainNav = useNavigation<any>();
    const [menuVisible, setMenuVisible] = useState(false);
    const rotateAnim = useRef(new Animated.Value(0)).current;

    const handleFabPress = () => {
        setMenuVisible(true);
        Animated.spring(rotateAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
        }).start();
    };

    const handleMenuClose = () => {
        Animated.spring(rotateAnim, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
        }).start();
        setMenuVisible(false);
    };

    const handleSelectAction = (screen: string) => {
        handleMenuClose();
        setTimeout(() => {
            mainNav.navigate(screen);
        }, 150);
    };

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '45deg'],
    });

    return (
        <>
            <QuickActionMenu
                visible={menuVisible}
                onClose={handleMenuClose}
                onSelectAction={handleSelectAction}
                colors={colors}
                isDark={isDark}
            />
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
                                        onPress={handleFabPress}
                                        activeOpacity={0.8}
                                    >
                                        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                                            <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
                                        </Animated.View>
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
        </>
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
    // Menu Styles
    menuOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    menuContainer: {
        width: '80%',
        maxWidth: 320,
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
    },
    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.lg,
        paddingBottom: SPACING.md,
    },
    menuTitle: {
        ...TYPOGRAPHY.h4,
    },
    menuCloseBtn: {
        padding: SPACING.xs,
    },
    menuActions: {
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.lg,
    },
    menuAction: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.sm,
    },
    menuActionIcon: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    menuActionLabel: {
        ...TYPOGRAPHY.body,
        fontFamily: FONTS.medium,
    },
});
