// src/hooks/useAlert.tsx
import { useState, useCallback } from 'react';
import { AlertButton, AlertType } from '../components/ui/CustomAlert';

interface AlertConfig {
    type?: AlertType;
    title: string;
    message?: string;
    buttons?: AlertButton[];
}

export function useAlert() {
    const [visible, setVisible] = useState(false);
    const [config, setConfig] = useState<AlertConfig>({
        title: '',
        type: 'info',
    });

    const show = useCallback(
        (
            title: string,
            message?: string,
            buttons?: AlertButton[],
            type?: AlertType
        ) => {
            setConfig({ title, message, buttons, type });
            setVisible(true);
        },
        []
    );

    const showSuccess = useCallback(
        (title: string, message?: string, onOk?: () => void) => {
            setConfig({
                title,
                message,
                type: 'success',
                buttons: [{ text: 'OK', onPress: onOk }],
            });
            setVisible(true);
        },
        []
    );

    const showError = useCallback(
        (title: string, message?: string, onOk?: () => void) => {
            setConfig({
                title,
                message,
                type: 'error',
                buttons: [{ text: 'OK', onPress: onOk }],
            });
            setVisible(true);
        },
        []
    );

    const showWarning = useCallback(
        (title: string, message?: string, onOk?: () => void) => {
            setConfig({
                title,
                message,
                type: 'warning',
                buttons: [{ text: 'OK', onPress: onOk }],
            });
            setVisible(true);
        },
        []
    );

    const showConfirm = useCallback(
        (
            title: string,
            message?: string,
            onConfirm?: () => void,
            onCancel?: () => void,
            confirmText = 'Confirmar',
            cancelText = 'Cancelar'
        ) => {
            setConfig({
                title,
                message,
                type: 'confirm',
                buttons: [
                    { text: cancelText, style: 'cancel', onPress: onCancel },
                    { text: confirmText, onPress: onConfirm },
                ],
            });
            setVisible(true);
        },
        []
    );

    const hide = useCallback(() => {
        setVisible(false);
    }, []);

    return {
        visible,
        config,
        show,
        showSuccess,
        showError,
        showWarning,
        showConfirm,
        hide,
    };
}
