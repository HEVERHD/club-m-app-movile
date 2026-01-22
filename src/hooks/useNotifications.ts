// src/hooks/useNotifications.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { useNotificationsStore } from '../stores/notifications-store';
import {
    registerForPushNotifications,
    areNotificationsEnabled,
    enableNotifications,
    disableNotifications,
    clearBadge,
    scheduleLocalNotification,
    type NotificationType,
} from '../services/notifications';
import { AppState, AppStateStatus } from 'react-native';

interface UseNotificationsReturn {
    // State
    notifications: ReturnType<typeof useNotificationsStore>['notifications'];
    unreadCount: number;
    isEnabled: boolean;
    pushToken: string | null;
    isLoading: boolean;

    // Actions
    initialize: () => Promise<void>;
    toggleNotifications: (enabled: boolean) => Promise<void>;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (id: string) => void;
    clearAll: () => void;
    sendTestNotification: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
    const [isLoading, setIsLoading] = useState(true);

    const {
        notifications,
        unreadCount,
        pushToken,
        isEnabled,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        setPushToken,
        setEnabled,
    } = useNotificationsStore();

    // Refs para los listeners
    const notificationListener = useRef<Notifications.EventSubscription>();
    const responseListener = useRef<Notifications.EventSubscription>();

    // Inicializar notificaciones
    const initialize = useCallback(async () => {
        setIsLoading(true);
        try {
            const enabled = await areNotificationsEnabled();
            setEnabled(enabled);

            if (enabled) {
                const token = await registerForPushNotifications();
                setPushToken(token);
            }
        } catch (error) {
            console.error('Error initializing notifications:', error);
        } finally {
            setIsLoading(false);
        }
    }, [setEnabled, setPushToken]);

    // Toggle notificaciones
    const toggleNotifications = useCallback(async (enabled: boolean) => {
        setIsLoading(true);
        try {
            if (enabled) {
                const token = await enableNotifications();
                setPushToken(token);
                setEnabled(true);
            } else {
                await disableNotifications();
                setPushToken(null);
                setEnabled(false);
            }
        } catch (error) {
            console.error('Error toggling notifications:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [setPushToken, setEnabled]);

    // Enviar notificación de prueba
    const sendTestNotification = useCallback(async () => {
        await scheduleLocalNotification(
            '¡Notificación de Prueba!',
            'Las notificaciones están funcionando correctamente.',
            { type: 'general' as NotificationType }
        );
    }, []);

    // Configurar listeners
    useEffect(() => {
        // Listener para notificaciones recibidas (foreground)
        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
            const { title, body, data } = notification.request.content;

            addNotification({
                type: (data?.type as NotificationType) || 'general',
                title: title || 'Notificación',
                body: body || '',
                data: data as Record<string, any>,
            });
        });

        // Listener para cuando el usuario toca la notificación
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            const { data } = response.notification.request.content;

            // Aquí puedes manejar la navegación según el tipo de notificación
            console.log('Notification tapped:', data);

            // Ejemplo de navegación según tipo:
            // if (data?.type === 'draw_result') {
            //     router.push(`/draw/${data.drawId}`);
            // }
        });

        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, [addNotification]);

    // Limpiar badge cuando la app está en foreground
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                clearBadge();
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
        };
    }, []);

    // Inicializar al montar
    useEffect(() => {
        initialize();
    }, [initialize]);

    return {
        notifications,
        unreadCount,
        isEnabled,
        pushToken,
        isLoading,
        initialize,
        toggleNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        sendTestNotification,
    };
}
