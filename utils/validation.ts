// Validation utilities for form inputs

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
    if (!email.trim()) {
        return { isValid: false, error: 'נדרש אימייל' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, error: 'כתובת אימייל לא תקינה' };
    }
    return { isValid: true };
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
    if (!password) {
        return { isValid: false, error: 'נדרשת סיסמה' };
    }
    if (password.length < 6) {
        return { isValid: false, error: 'סיסמה חייבת להכיל לפחות 6 תווים' };
    }
    return { isValid: true };
};

// Phone validation (Israeli format)
export const validatePhone = (phone: string): ValidationResult => {
    if (!phone.trim()) {
        return { isValid: true }; // Phone is optional
    }
    // Remove spaces and dashes
    const cleanPhone = phone.replace(/[\s-]/g, '');
    // Israeli phone format: 05X-XXXXXXX or +972-5X-XXXXXXX
    const phoneRegex = /^(\+972|0)5\d{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
        return { isValid: false, error: 'מספר טלפון לא תקין' };
    }
    return { isValid: true };
};

// Required field validation
export const validateRequired = (value: string, fieldName: string = 'שדה'): ValidationResult => {
    if (!value || !value.trim()) {
        return { isValid: false, error: `${fieldName} הוא שדה חובה` };
    }
    return { isValid: true };
};

// Amount validation
export const validateAmount = (amount: string): ValidationResult => {
    if (!amount.trim()) {
        return { isValid: false, error: 'נדרש סכום' };
    }
    // Remove currency symbols and commas
    const cleanAmount = amount.replace(/[₪$,\s]/g, '');
    const numericAmount = parseFloat(cleanAmount);
    if (isNaN(numericAmount)) {
        return { isValid: false, error: 'סכום לא תקין' };
    }
    if (numericAmount <= 0) {
        return { isValid: false, error: 'הסכום חייב להיות גדול מ-0' };
    }
    if (numericAmount > 10000000) {
        return { isValid: false, error: 'הסכום גבוה מדי' };
    }
    return { isValid: true };
};

// Tax ID validation (Israeli format: 9 digits)
export const validateTaxId = (taxId: string): ValidationResult => {
    if (!taxId.trim()) {
        return { isValid: true }; // Optional field
    }
    const cleanTaxId = taxId.replace(/[\s-]/g, '');
    if (!/^\d{9}$/.test(cleanTaxId)) {
        return { isValid: false, error: 'מספר עוסק מורשה חייב להכיל 9 ספרות' };
    }
    return { isValid: true };
};

// Date validation
export const validateDate = (date: Date | string | null): ValidationResult => {
    if (!date) {
        return { isValid: false, error: 'נדרש תאריך' };
    }
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
        return { isValid: false, error: 'תאריך לא תקין' };
    }
    return { isValid: true };
};

// Future date validation
export const validateFutureDate = (date: Date | string): ValidationResult => {
    const baseValidation = validateDate(date);
    if (!baseValidation.isValid) return baseValidation;

    const dateObj = date instanceof Date ? date : new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateObj < today) {
        return { isValid: false, error: 'התאריך חייב להיות בעתיד' };
    }
    return { isValid: true };
};

// Combine multiple validations
export const combineValidations = (...validations: ValidationResult[]): ValidationResult => {
    for (const validation of validations) {
        if (!validation.isValid) {
            return validation;
        }
    }
    return { isValid: true };
};

// Form validation helper
export const validateForm = (fields: { [key: string]: ValidationResult }): { isValid: boolean; errors: { [key: string]: string } } => {
    const errors: { [key: string]: string } = {};
    let isValid = true;

    for (const [fieldName, validation] of Object.entries(fields)) {
        if (!validation.isValid && validation.error) {
            errors[fieldName] = validation.error;
            isValid = false;
        }
    }

    return { isValid, errors };
};
