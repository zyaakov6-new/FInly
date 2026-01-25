import * as Haptics from 'expo-haptics';

export const hapticFeedback = {
    // Light tap - for button presses
    light: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },

    // Medium tap - for selections
    medium: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },

    // Heavy tap - for important actions
    heavy: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    },

    // Success - for completed actions
    success: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },

    // Warning - for warnings
    warning: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    },

    // Error - for errors
    error: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },

    // Selection changed - for scrolling/swiping
    selection: () => {
        Haptics.selectionAsync();
    }
};
