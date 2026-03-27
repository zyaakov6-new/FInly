import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast, ToastType } from '../components/Toast';
import { AlertModal, AlertType, AlertButton } from '../components/AlertModal';

interface ToastState {
    visible: boolean;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    position?: 'top' | 'bottom';
}

interface AlertState {
    visible: boolean;
    type: AlertType;
    title: string;
    message: string;
    buttons: AlertButton[];
}

interface NotificationContextType {
    // Toast methods
    showToast: (options: {
        type: ToastType;
        title: string;
        message?: string;
        duration?: number;
        position?: 'top' | 'bottom';
    }) => void;
    showSuccess: (title: string, message?: string) => void;
    showError: (title: string, message?: string) => void;
    showWarning: (title: string, message?: string) => void;
    showInfo: (title: string, message?: string) => void;

    // Alert methods
    showAlert: (options: {
        type?: AlertType;
        title: string;
        message: string;
        buttons?: AlertButton[];
    }) => void;
    showConfirm: (
        title: string,
        message: string,
        onConfirm: () => void,
        onCancel?: () => void,
        confirmText?: string,
        cancelText?: string
    ) => void;
    showDeleteConfirm: (
        title: string,
        message: string,
        onConfirm: () => void
    ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [toast, setToast] = useState<ToastState>({
        visible: false,
        type: 'info',
        title: '',
    });

    const [alert, setAlert] = useState<AlertState>({
        visible: false,
        type: 'info',
        title: '',
        message: '',
        buttons: [],
    });

    // Toast methods
    const showToast = useCallback((options: {
        type: ToastType;
        title: string;
        message?: string;
        duration?: number;
        position?: 'top' | 'bottom';
    }) => {
        setToast({
            visible: true,
            ...options,
        });
    }, []);

    const showSuccess = useCallback((title: string, message?: string) => {
        showToast({ type: 'success', title, message, duration: 2500 });
    }, [showToast]);

    const showError = useCallback((title: string, message?: string) => {
        showToast({ type: 'error', title, message, duration: 4000 });
    }, [showToast]);

    const showWarning = useCallback((title: string, message?: string) => {
        showToast({ type: 'warning', title, message, duration: 3500 });
    }, [showToast]);

    const showInfo = useCallback((title: string, message?: string) => {
        showToast({ type: 'info', title, message, duration: 3000 });
    }, [showToast]);

    const dismissToast = useCallback(() => {
        setToast(prev => ({ ...prev, visible: false }));
    }, []);

    // Alert methods
    const showAlert = useCallback((options: {
        type?: AlertType;
        title: string;
        message: string;
        buttons?: AlertButton[];
    }) => {
        setAlert({
            visible: true,
            type: options.type || 'info',
            title: options.title,
            message: options.message,
            buttons: options.buttons || [{ text: 'אישור', style: 'default' }],
        });
    }, []);

    const showConfirm = useCallback((
        title: string,
        message: string,
        onConfirm: () => void,
        onCancel?: () => void,
        confirmText: string = 'אישור',
        cancelText: string = 'ביטול'
    ) => {
        setAlert({
            visible: true,
            type: 'confirm',
            title,
            message,
            buttons: [
                { text: cancelText, style: 'cancel', onPress: onCancel },
                { text: confirmText, style: 'default', onPress: onConfirm },
            ],
        });
    }, []);

    const showDeleteConfirm = useCallback((
        title: string,
        message: string,
        onConfirm: () => void
    ) => {
        setAlert({
            visible: true,
            type: 'delete',
            title,
            message,
            buttons: [
                { text: 'ביטול', style: 'cancel' },
                { text: 'מחק', style: 'destructive', onPress: onConfirm },
            ],
        });
    }, []);

    const dismissAlert = useCallback(() => {
        setAlert(prev => ({ ...prev, visible: false }));
    }, []);

    const value: NotificationContextType = {
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showAlert,
        showConfirm,
        showDeleteConfirm,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}

            <Toast
                visible={toast.visible}
                type={toast.type}
                title={toast.title}
                message={toast.message}
                duration={toast.duration}
                position={toast.position}
                onDismiss={dismissToast}
            />

            <AlertModal
                visible={alert.visible}
                type={alert.type}
                title={alert.title}
                message={alert.message}
                buttons={alert.buttons}
                onDismiss={dismissAlert}
            />
        </NotificationContext.Provider>
    );
};
