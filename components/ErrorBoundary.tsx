import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error Boundary caught an error:', error, errorInfo);
        // TODO: Send to error reporting service (Sentry)
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Text style={styles.emoji}>😕</Text>
                    <Text style={styles.title}>משהו השתבש</Text>
                    <Text style={styles.message}>
                        אנחנו מצטערים, אבל משהו לא עבד כמו שצריך.
                        {'\n'}נסה שוב או צור קשר עם התמיכה.
                    </Text>
                    {__DEV__ && this.state.error && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>
                                {this.state.error.toString()}
                            </Text>
                        </View>
                    )}
                    <TouchableOpacity
                        style={styles.button}
                        onPress={this.handleReset}
                    >
                        <Text style={styles.buttonText}>נסה שוב</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emoji: {
        fontSize: 64,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    errorBox: {
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 8,
        marginBottom: 24,
        maxWidth: '100%',
    },
    errorText: {
        fontSize: 12,
        fontFamily: FONTS.regular,
        color: COLORS.danger,
        textAlign: 'left',
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
    },
    buttonText: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        color: COLORS.white,
    },
});

export default ErrorBoundary;
