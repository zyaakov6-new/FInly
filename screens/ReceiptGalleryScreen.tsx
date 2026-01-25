import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowRight, Trash2 } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useTransactions } from '../context/TransactionsContext';
import { COLORS, FONTS } from '../constants/theme';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 48) / 2; // 2 columns with padding

export default function ReceiptGalleryScreen() {
    const navigation = useNavigation();
    const { transactions } = useTransactions();

    // Get all transactions with receipt images
    const receiptsWithImages = transactions.filter(t => t.receiptImageUri);

    const renderReceipt = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.receiptCard}
            onPress={() => {
                // Navigate to expense details or show full image
            }}
        >
            <Image
                source={{ uri: item.receiptImageUri }}
                style={styles.receiptImage}
                resizeMode="cover"
            />
            <View style={styles.receiptInfo}>
                <Text style={styles.receiptAmount}>₪{item.amount}</Text>
                <Text style={styles.receiptDate}>
                    {new Date(item.date).toLocaleDateString('he-IL')}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="light" backgroundColor={COLORS.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ArrowRight size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>גלריית קבלות</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Gallery Grid */}
            {receiptsWithImages.length > 0 ? (
                <FlatList
                    data={receiptsWithImages}
                    renderItem={renderReceipt}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.grid}
                    columnWrapperStyle={styles.row}
                />
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>אין קבלות עדיין</Text>
                    <Text style={styles.emptySubtext}>
                        קבלות שתסרוק יופיעו כאן
                    </Text>
                </View>
            )}
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
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
    },
    grid: {
        padding: 16,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    receiptCard: {
        width: ITEM_SIZE,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    receiptImage: {
        width: '100%',
        height: ITEM_SIZE,
    },
    receiptInfo: {
        padding: 12,
    },
    receiptAmount: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
    },
    receiptDate: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
});
