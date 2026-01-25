// Hebrew Error Messages
export const ERROR_MESSAGES = {
    // Network Errors
    NETWORK_ERROR: 'בעיית חיבור לאינטרנט. אנא בדוק את החיבור ונסה שוב.',
    TIMEOUT_ERROR: 'הפעולה ארכה יותר מדי. נסה שוב.',
    SERVER_ERROR: 'שגיאת שרת. נסה שוב מאוחר יותר.',

    // OCR Errors
    OCR_NO_TEXT: 'לא זוהה טקסט בקבלה. נסה לצלם שוב עם תאורה טובה יותר.',
    OCR_QUOTA_EXCEEDED: 'הגעת למגבלת הסריקות החודשית.',
    OCR_INVALID_IMAGE: 'התמונה לא ברורה מספיק. נסה שוב.',
    OCR_FAILED: 'שגיאה בסריקת הקבלה. נסה שוב.',
    OCR_API_KEY_INVALID: 'מפתח API לא תקין. פנה לתמיכה.',

    // Data Errors
    SAVE_FAILED: 'שגיאה בשמירת הנתונים. נסה שוב.',
    LOAD_FAILED: 'שגיאה בטעינת הנתונים.',
    DELETE_FAILED: 'שגיאה במחיקה. נסה שוב.',
    EXPORT_FAILED: 'שגיאה בייצוא הנתונים.',

    // Validation Errors
    REQUIRED_FIELD: 'שדה חובה',
    INVALID_AMOUNT: 'הסכום חייב להיות גדול מ-0',
    INVALID_DATE: 'תאריך לא תקין',
    INVALID_EMAIL: 'כתובת אימייל לא תקינה',
    INVALID_PHONE: 'מספר טלפון לא תקין',

    // Permission Errors
    CAMERA_PERMISSION_DENIED: 'נדרשת הרשאת מצלמה. עבור להגדרות האפליקציה.',
    STORAGE_PERMISSION_DENIED: 'נדרשת הרשאת אחסון.',
    GALLERY_PERMISSION_DENIED: 'נדרשת הרשאת גלריה.',

    // Auth Errors
    AUTH_INVALID_CREDENTIALS: 'שם משתמש או סיסמה שגויים',
    AUTH_NETWORK_ERROR: 'בעיית חיבור לשרת',
    AUTH_ACCOUNT_LOCKED: 'החשבון נחסם זמנית',

    // Generic
    UNKNOWN_ERROR: 'אירעה שגיאה. נסה שוב.',
    TRY_AGAIN: 'נסה שוב',
    CANCEL: 'ביטול',
    OK: 'אישור',
};

export type ErrorCode = keyof typeof ERROR_MESSAGES;
