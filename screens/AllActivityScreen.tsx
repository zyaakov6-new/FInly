import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { ChevronRight, FileText, CreditCard } from 'lucide-react-native';
import { useTransactions } from '../context/TransactionsContext';
import { COLORS, FONTS } from '../constants/theme';

export default function AllActivityScreen() {
    const navigation = useNavigation<any>();
    const { allTransactions } = useTransactions();

    const handleTransactionPress = (id: string) => {
        navigation.navigate('InvoiceDetails', { transactionId: id });
    };

    const renderItem = ({ item }: any) => {
        const timeAgo = () => {
            const days = Math.floor((Date.now() - new Date(item.date).getTime()) / (1000 * 60 * 60 * 24));
            if (days === 0) return 'היום';
            if (days === 1) return 'אתמול';
            return `${days} ימים אחורה`;
        };

        return (
            <TouchableOpacity style={styles.activityItem} onPress={() => handleTransactionPress(item.id)}>
                <View style={styles.activityLeft}>
                    <View style={styles.activityIconContainer}>
                        {item.type === 'invoice' ? (
                            <FileText size={18} color={COLORS.white} />
                        ) : (
                            <CreditCard size={18} color={COLORS.white} />
                        )}
                    </View>
                    <View>
                        <Text style={styles.activityTitle}>{item.title}</Text>
                        <Text style={styles.activityTime}>{timeAgo()} • {new Date(item.date).toLocaleDateString('he-IL')}</Text>
                    </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[
                        styles.activityAmount,
                        { color: item.isIncome ? COLORS.success : COLORS.warning }
                    ]}>
                        {item.isIncome ? '' : '-'}{item.amount}
                    </Text>
                    {item.type === 'invoice' && (
                        <Text style={[
                            styles.statusText,
                            { color: item.status === 'paid' ? COLORS.success : COLORS.warning }
                        ]}>
                            {item.status === 'paid' ? 'שולם' : 'ממתין'}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" backgroundColor={COLORS.background} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronRight size={28} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>כל הפעילות</Text>
                <View style={{ width: 28 }} />
            </View>

            <FlatList
                data={allTransactions}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTitle: {
        color: COLORS.textPrimary,
        fontSize: 18,
        fontFamily: FONTS.bold,
    },
    backButton: {
        padding: 4,
    },
    listContent: {
        padding: 20,
    },
    activityItem: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    activityLeft: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 12,
    },
    activityIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityTitle: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontFamily: FONTS.medium,
        textAlign: 'left',
    },
    activityTime: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontFamily: FONTS.regular,
        textAlign: 'left',
    },
    activityAmount: {
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    statusText: {
        fontSize: 10,
        fontFamily: FONTS.regular,
        marginTop: 4,
    }
});
