import { Alert } from 'react-native';
import { ERROR_MESSAGES, ErrorCode } from '../constants/errors';

export class AppError extends Error {
    code: ErrorCode;
    userMessage: string;

    constructor(code: ErrorCode, technicalMessage?: string) {
        super(technicalMessage || ERROR_MESSAGES[code]);
        this.code = code;
        this.userMessage = ERROR_MESSAGES[code];
        this.name = 'AppError';
    }
}

export const handleError = (error: any, showAlert: boolean = true): AppError => {
    console.error('Error occurred:', error);

    let appError: AppError;

    // If it's already an AppError, use it
    if (error instanceof AppError) {
        appError = error;
    }
    // Network errors
    else if (error.message?.includes('Network request failed') || error.message?.includes('fetch')) {
        appError = new AppError('NETWORK_ERROR', error.message);
    }
    // Timeout errors
    else if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
        appError = new AppError('TIMEOUT_ERROR', error.message);
    }
    // OCR specific errors
    else if (error.message?.includes('OCR') || error.message?.includes('Vision')) {
        if (error.message?.includes('quota') || error.message?.includes('limit')) {
            appError = new AppError('OCR_QUOTA_EXCEEDED', error.message);
        } else if (error.message?.includes('No text')) {
            appError = new AppError('OCR_NO_TEXT', error.message);
        } else if (error.message?.includes('API key')) {
            appError = new AppError('OCR_API_KEY_INVALID', error.message);
        } else {
            appError = new AppError('OCR_FAILED', error.message);
        }
    }
    // Permission errors
    else if (error.message?.includes('permission') || error.message?.includes('denied')) {
        if (error.message?.toLowerCase().includes('camera')) {
            appError = new AppError('CAMERA_PERMISSION_DENIED', error.message);
        } else if (error.message?.toLowerCase().includes('storage')) {
            appError = new AppError('STORAGE_PERMISSION_DENIED', error.message);
        } else {
            appError = new AppError('GALLERY_PERMISSION_DENIED', error.message);
        }
    }
    // Generic fallback
    else {
        appError = new AppError('UNKNOWN_ERROR', error.message || 'Unknown error');
    }

    // Show alert if requested
    if (showAlert) {
        Alert.alert(
            'שגיאה',
            appError.userMessage,
            [
                { text: ERROR_MESSAGES.OK, style: 'default' }
            ]
        );
    }

    return appError;
};

// Retry wrapper for async operations
export const withRetry = async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
): Promise<T> => {
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            console.log(`Attempt ${i + 1} failed, retrying...`);

            // Don't retry on certain errors
            if (error instanceof AppError) {
                if (['OCR_API_KEY_INVALID', 'CAMERA_PERMISSION_DENIED', 'STORAGE_PERMISSION_DENIED'].includes(error.code)) {
                    throw error; // Don't retry permission/auth errors
                }
            }

            // Wait before retrying
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
            }
        }
    }

    throw lastError;
};

// Network status checker
export const checkNetworkConnection = async (): Promise<boolean> => {
    try {
        const response = await fetch('https://www.google.com', {
            method: 'HEAD',
            cache: 'no-cache',
        });
        return response.ok;
    } catch {
        return false;
    }
};
