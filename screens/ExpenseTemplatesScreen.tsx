import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowRight, Plus, Trash2, Edit } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useTransactions } from '../context/TransactionsContext';
import { COLORS, FONTS } from '../constants/theme';

interface ExpenseTemplate {
    id: string;
    name: string;
    amount: string;
    category: string;
    description?: string;
}

// Default templates
const DEFAULT_TEMPLATES: ExpenseTemplate[] = [
    { id: '1', name: 'Netflix', amount: '55', category: 'Bills', description: 'מנוי חודשי' },
    { id: '2', name: 'Spotify', amount: '20', category: 'Bills', description: 'מנוי חודשי' },
    { id: '3', name: 'קפה בוקר', amount: '18', category: 'Food', description: 'קפה יומי' },
    { id: '4', name: 'חניה', amount: '25', category: 'Transport', description: 'חניה יומית' },
];

export default function ExpenseTemplatesScreen() {
    const navigation = useNavigation();
    const { addTransaction } = useTransactions();
    const [templates, setTemplates] = useState<ExpenseTemplate[]>(DEFAULT_TEMPLATES);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newTemplate, setNewTemplate] = useState({
        name: '',
        amount: '',
        category: 'Other',
    });

    const handleUseTemplate = (template: ExpenseTemplate) => {
        // Add expense from template
        const newExpense = {
            id: Date.now().toString(),
            type: 'expense' as const,
            title: template.name,
            amount: template.amount,
            date: new Date().toISOString(),
            category: template.category,
            isIncome: false,
            status: 'paid' as const,
            notes: template.description || '',
        };

        addTransaction(newExpense);
        Alert.alert('הוצאה נוספה', `${template.name} - ₪${template.amount}`);
        navigation.goBack();
    };

    const handleAddTemplate = () => {
        if (!newTemplate.name || !newTemplate.amount) {
            Alert.alert('שגיאה', 'נא למלא שם וסכום');
            return;
        }

        const template: ExpenseTemplate = {
            id: Date.now().toString(),
            ...newTemplate,
        };

        setTemplates([...templates, template]);
        setNewTemplate({ name: '', amount: '', category: 'Other' });
        setShowAddForm(false);
    };

    const handleDeleteTemplate = (id: string) => {
        Alert.alert(
            'מחיקת תבנית',
            'האם למחוק תבנית זו?',
            [
                { text: 'ביטול', style: 'cancel' },
                {
                    text: 'מחק',
                    style: 'destructive',
                    onPress: () => setTemplates(templates.filter(t => t.id !== id)),
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" backgroundColor={COLORS.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ArrowRight size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>תבניות הוצאות</Text>
                <TouchableOpacity onPress={() => setShowAddForm(!showAddForm)}>
                    <Plus size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {/* Add Template Form */}
                {showAddForm && (
                    <View style={styles.addForm}>
                        <Text style={styles.formTitle}>תבנית חדשה</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="שם התבנית"
                            placeholderTextColor={COLORS.textSecondary}
                            value={newTemplate.name}
                            onChangeText={(text) => setNewTemplate({ ...newTemplate, name: text })}
                            textAlign="right"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="סכום"
                            placeholderTextColor={COLORS.textSecondary}
                            value={newTemplate.amount}
                            onChangeText={(text) => setNewTemplate({ ...newTemplate, amount: text })}
                            keyboardType="numeric"
                            textAlign="right"
                        />
                        <TouchableOpacity style={styles.addButton} onPress={handleAddTemplate}>
                            <Text style={styles.addButtonText}>הוסף תבנית</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Templates List */}
                <Text style={styles.sectionTitle}>תבניות שמורות</Text>
                {templates.map((template) => (
                    <View key={template.id} style={styles.templateCard}>
                        <View style={styles.templateInfo}>
                            <Text style={styles.templateName}>{template.name}</Text>
                            <Text style={styles.templateAmount}>₪{template.amount}</Text>
                            {template.description && (
                                <Text style={styles.templateDesc}>{template.description}</Text>
                            )}
                        </View>
                        <View style={styles.templateActions}>
                            <TouchableOpacity
                                style={styles.useButton}
                                onPress={() => handleUseTemplate(template)}
                            >
                                <Text style={styles.useButtonText}>השתמש</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => handleDeleteTemplate(template.id)}
                            >
                                <Trash2 size={18} color={COLORS.danger} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>
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
    content: {
        flex: 1,
        padding: 16,
    },
    addForm: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    formTitle: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    input: {
        backgroundColor: COLORS.background,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        color: COLORS.textPrimary,
        fontFamily: FONTS.regular,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    addButtonText: {
        color: COLORS.white,
        fontFamily: FONTS.bold,
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: FONTS.medium,
        color: COLORS.textSecondary,
        marginBottom: 12,
    },
    templateCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    templateInfo: {
        flex: 1,
    },
    templateName: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
    },
    templateAmount: {
        fontSize: 14,
        color: COLORS.primary,
        marginTop: 4,
        fontFamily: FONTS.medium,
    },
    templateDesc: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    templateActions: {
        flexDirection: 'row',
        gap: 8,
    },
    useButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    useButtonText: {
        color: COLORS.white,
        fontFamily: FONTS.bold,
        fontSize: 12,
    },
    deleteButton: {
        padding: 8,
    },
});
