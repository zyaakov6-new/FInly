import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { getColors, FONTS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';
import { ValidationResult } from '../utils/validation';

interface ValidatedInputProps extends TextInputProps {
    label?: string;
    error?: string;
    validate?: (value: string) => ValidationResult;
    onValidationChange?: (isValid: boolean) => void;
    showErrorOnBlur?: boolean;
}

export function ValidatedInput({
    label,
    error: externalError,
    validate,
    onValidationChange,
    showErrorOnBlur = true,
    value,
    onChangeText,
    style,
    ...props
}: ValidatedInputProps) {
    const { resolvedTheme } = useTheme();
    const colors = getColors(resolvedTheme);
    const [touched, setTouched] = useState(false);
    const [internalError, setInternalError] = useState<string | undefined>();

    const error = externalError || (touched ? internalError : undefined);
    const hasError = !!error;

    const handleChangeText = (text: string) => {
        onChangeText?.(text);

        if (validate) {
            const result = validate(text);
            setInternalError(result.error);
            onValidationChange?.(result.isValid);
        }
    };

    const handleBlur = () => {
        if (showErrorOnBlur) {
            setTouched(true);
            if (validate && value !== undefined) {
                const result = validate(value as string);
                setInternalError(result.error);
                onValidationChange?.(result.isValid);
            }
        }
    };

    return (
        <View style={styles.container}>
            {label && (
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                    {label}
                </Text>
            )}
            <View style={styles.inputContainer}>
                <TextInput
                    style={[
                        styles.input,
                        {
                            backgroundColor: colors.surfaceSecondary,
                            borderColor: hasError ? colors.danger : colors.border,
                            color: colors.textPrimary,
                        },
                        style,
                    ]}
                    value={value}
                    onChangeText={handleChangeText}
                    onBlur={handleBlur}
                    placeholderTextColor={colors.textQuaternary}
                    {...props}
                />
                {hasError && (
                    <View style={styles.errorIcon}>
                        <AlertCircle size={16} color={colors.danger} />
                    </View>
                )}
            </View>
            {hasError && (
                <Text style={[styles.errorText, { color: colors.danger }]}>
                    {error}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.lg,
    },
    label: {
        ...TYPOGRAPHY.caption,
        marginBottom: SPACING.sm,
        textAlign: 'right',
    },
    inputContainer: {
        position: 'relative',
    },
    input: {
        height: 48,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        paddingHorizontal: SPACING.lg,
        ...TYPOGRAPHY.body,
        textAlign: 'right',
    },
    errorIcon: {
        position: 'absolute',
        left: SPACING.md,
        top: '50%',
        marginTop: -8,
    },
    errorText: {
        ...TYPOGRAPHY.captionSmall,
        marginTop: SPACING.xs,
        textAlign: 'right',
    },
});
