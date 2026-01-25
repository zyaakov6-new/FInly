import { View, Text, StyleSheet, TextStyle, ViewStyle, StyleProp } from 'react-native';
import { formatCurrency } from '../utils/formatters';

interface AccessibleAmountProps {
    amount: number | string;
    label?: string;
    style?: StyleProp<TextStyle>;
    containerStyle?: StyleProp<ViewStyle>;
    type?: 'income' | 'expense' | 'neutral';
    colors: any;
}

/**
 * A component that wraps an amount in a View with accessibilityLabel
 * to ensure screen readers announce it correctly in Hebrew.
 */
export const AccessibleAmount: React.FC<AccessibleAmountProps> = ({
    amount,
    label,
    style,
    containerStyle,
    type = 'neutral',
    colors
}) => {
    const formattedAmount = formatCurrency(amount);

    // Clean amount for accessibility label (thousands etc)
    const numericValue = typeof amount === 'string'
        ? parseFloat(amount.replace(/[^\d.-]/g, '')) || 0
        : amount;

    const accessibilityLabel = `${label ? label + ': ' : ''}${numericValue.toLocaleString('he-IL')} שקלים`;

    return (
        <View
            style={containerStyle}
            accessible={true}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole="text"
        >
            <Text style={[
                style,
                { color: type === 'income' ? colors.success : type === 'expense' ? colors.danger : colors.textPrimary }
            ]}>
                {formattedAmount}
            </Text>
        </View>
    );
};
