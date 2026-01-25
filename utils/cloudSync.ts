import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Transaction } from '../context/TransactionsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TRANSACTIONS_COLLECTION = 'transactions';
const USER_ID_KEY = '@user_id';

// Get or create user ID
export const getUserId = async (): Promise<string> => {
    try {
        let userId = await AsyncStorage.getItem(USER_ID_KEY);
        if (!userId) {
            // Generate a unique user ID
            userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await AsyncStorage.setItem(USER_ID_KEY, userId);
        }
        return userId;
    } catch (error) {
        console.error('Error getting user ID:', error);
        return `user_${Date.now()}`;
    }
};

// Sync transaction to cloud
export const syncTransactionToCloud = async (transaction: Transaction): Promise<void> => {
    try {
        const userId = await getUserId();
        const transactionRef = doc(db, TRANSACTIONS_COLLECTION, `${userId}_${transaction.id}`);

        // Convert Date objects to ISO strings for Firestore
        const transactionData: any = {
            ...transaction,
            date: transaction.date instanceof Date ? transaction.date.toISOString() : transaction.date,
            userId,
            syncedAt: new Date().toISOString(),
        };

        // Only add paidDate if it exists (Firestore doesn't allow undefined)
        if (transaction.paidDate) {
            transactionData.paidDate = transaction.paidDate instanceof Date
                ? transaction.paidDate.toISOString()
                : transaction.paidDate;
        }

        await setDoc(transactionRef, transactionData);
        console.log('✓ Synced transaction to cloud:', transaction.id);
    } catch (error) {
        console.error('Error syncing transaction:', error);
        // Don't throw - allow offline mode
    }
};

// Delete transaction from cloud
export const deleteTransactionFromCloud = async (transactionId: string): Promise<void> => {
    try {
        const userId = await getUserId();
        const transactionRef = doc(db, TRANSACTIONS_COLLECTION, `${userId}_${transactionId}`);
        await deleteDoc(transactionRef);
        console.log('✓ Deleted transaction from cloud:', transactionId);
    } catch (error) {
        console.error('Error deleting transaction:', error);
        // Don't throw - allow offline mode
    }
};

// Load all transactions from cloud
export const loadTransactionsFromCloud = async (): Promise<Transaction[]> => {
    try {
        const userId = await getUserId();
        const q = query(
            collection(db, TRANSACTIONS_COLLECTION),
            where('userId', '==', userId)
        );

        const querySnapshot = await getDocs(q);
        const transactions: Transaction[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            transactions.push({
                ...data,
                // Convert ISO strings back to Date objects
                date: new Date(data.date),
                paidDate: data.paidDate ? new Date(data.paidDate) : undefined,
            } as Transaction);
        });

        console.log(`✓ Loaded ${transactions.length} transactions from cloud`);
        return transactions;
    } catch (error) {
        console.error('Error loading transactions:', error);
        return []; // Return empty array on error
    }
};

// Sync all local transactions to cloud (initial sync)
export const syncAllToCloud = async (transactions: Transaction[]): Promise<void> => {
    try {
        console.log(`Syncing ${transactions.length} transactions to cloud...`);
        const promises = transactions.map(tx => syncTransactionToCloud(tx));
        await Promise.all(promises);
        console.log('✓ All transactions synced to cloud');
    } catch (error) {
        console.error('Error syncing all transactions:', error);
    }
};

// Merge local and cloud data (for initial load)
export const mergeTransactions = (local: Transaction[], cloud: Transaction[]): Transaction[] => {
    const merged = new Map<string, Transaction>();

    // Add all local transactions
    local.forEach(tx => merged.set(tx.id, tx));

    // Add cloud transactions (newer ones override)
    cloud.forEach(tx => {
        const existing = merged.get(tx.id);
        if (!existing || new Date(tx.date) > new Date(existing.date)) {
            merged.set(tx.id, tx);
        }
    });

    return Array.from(merged.values());
};
