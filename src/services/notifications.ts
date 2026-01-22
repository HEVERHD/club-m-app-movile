// src/services/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const PUSH_TOKEN_KEY = 'push_token';
const NOTIFICATIONS_ENABLED_KEY = 'notifications_enabled';

// Configurar cómo se muestran las notificaciones cuando la app está en foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export interface PushNotificationState {
    token: string | null;
    isEnabled: boolean;
    hasPermission: boolean;
}

export type NotificationType =
    | 'payment_reminder'    // Recordatorio de pago
    | 'draw_announcement'   // Anuncio de sorteo
    | 'draw_result'         // Resultado de sorteo
    | 'welcome'             // Bienvenida
    | 'benefit_expiring'    // Beneficio por vencer
    | 'monthly_summary'     // Resumen mensual
    | 'promo'               // Promoción
    | 'general';            // General

export interface AppNotification {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, any>;
    timestamp: number;
    read: boolean;
}

/**
 * Registra el dispositivo para notificaciones push
 */
export async function registerForPushNotifications(): Promise<string | null> {
    // Solo funciona en dispositivos físicos
    if (!Device.isDevice) {
        console.log('Push notifications require a physical device');
        return null;
    }

    // Verificar permisos existentes
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Si no hay permisos, solicitarlos
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Push notification permission denied');
        return null;
    }

    // Configuración específica de Android
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#2d6a8a',
        });

        // Canal para recordatorios de pago
        await Notifications.setNotificationChannelAsync('payments', {
            name: 'Recordatorios de Pago',
            description: 'Notificaciones sobre pagos pendientes',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#f59e0b',
        });

        // Canal para sorteos
        await Notifications.setNotificationChannelAsync('draws', {
            name: 'Sorteos',
            description: 'Anuncios y resultados de sorteos',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 500, 200, 500],
            lightColor: '#22c55e',
        });
    }

    // Obtener el token
    try {
        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: 'your-project-id', // Reemplazar con tu projectId de Expo
        });
        const token = tokenData.data;

        // Guardar token localmente
        await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token);
        await SecureStore.setItemAsync(NOTIFICATIONS_ENABLED_KEY, 'true');

        console.log('Push token:', token);
        return token;
    } catch (error) {
        console.error('Error getting push token:', error);
        return null;
    }
}

/**
 * Obtiene el token guardado
 */
export async function getSavedPushToken(): Promise<string | null> {
    try {
        return await SecureStore.getItemAsync(PUSH_TOKEN_KEY);
    } catch {
        return null;
    }
}

/**
 * Verifica si las notificaciones están habilitadas
 */
export async function areNotificationsEnabled(): Promise<boolean> {
    try {
        const enabled = await SecureStore.getItemAsync(NOTIFICATIONS_ENABLED_KEY);
        return enabled === 'true';
    } catch {
        return false;
    }
}

/**
 * Deshabilita las notificaciones (solo localmente)
 */
export async function disableNotifications(): Promise<void> {
    await SecureStore.setItemAsync(NOTIFICATIONS_ENABLED_KEY, 'false');
    // Aquí podrías llamar a tu API para desregistrar el token
}

/**
 * Habilita las notificaciones
 */
export async function enableNotifications(): Promise<string | null> {
    const token = await registerForPushNotifications();
    if (token) {
        await SecureStore.setItemAsync(NOTIFICATIONS_ENABLED_KEY, 'true');
    }
    return token;
}

/**
 * Programa una notificación local (para pruebas o recordatorios)
 */
export async function scheduleLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
    trigger?: Notifications.NotificationTriggerInput
): Promise<string> {
    const id = await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            data,
            sound: true,
        },
        trigger: trigger || null, // null = inmediato
    });
    return id;
}

/**
 * Programa un recordatorio de pago
 */
export async function schedulePaymentReminder(
    clubName: string,
    dueDate: Date,
    amount: number
): Promise<string> {
    // Programar para 1 día antes
    const triggerDate = new Date(dueDate);
    triggerDate.setDate(triggerDate.getDate() - 1);
    triggerDate.setHours(9, 0, 0, 0); // 9 AM

    if (triggerDate <= new Date()) {
        // Si ya pasó, enviar inmediatamente
        return scheduleLocalNotification(
            'Recordatorio de Pago',
            `Tu pago de $${amount.toFixed(2)} para ${clubName} vence pronto.`,
            { type: 'payment_reminder', clubName, amount }
        );
    }

    return Notifications.scheduleNotificationAsync({
        content: {
            title: 'Recordatorio de Pago',
            body: `Tu pago de $${amount.toFixed(2)} para ${clubName} vence mañana.`,
            data: { type: 'payment_reminder', clubName, amount },
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate,
        },
    });
}

/**
 * Cancela todas las notificaciones programadas
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Obtiene el conteo de badge
 */
export async function getBadgeCount(): Promise<number> {
    return Notifications.getBadgeCountAsync();
}

/**
 * Establece el conteo de badge
 */
export async function setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
}

/**
 * Limpia el badge
 */
export async function clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
}

/**
 * Obtiene el ícono según el tipo de notificación
 */
export function getNotificationIcon(type: NotificationType): string {
    switch (type) {
        case 'payment_reminder':
            return 'wallet-outline';
        case 'draw_announcement':
        case 'draw_result':
            return 'gift-outline';
        case 'welcome':
            return 'hand-right-outline';
        case 'benefit_expiring':
            return 'time-outline';
        case 'monthly_summary':
            return 'bar-chart-outline';
        case 'promo':
            return 'pricetag-outline';
        default:
            return 'notifications-outline';
    }
}

/**
 * Obtiene el color según el tipo de notificación
 */
export function getNotificationColor(type: NotificationType): string {
    switch (type) {
        case 'payment_reminder':
            return '#f59e0b';
        case 'draw_announcement':
        case 'draw_result':
            return '#22c55e';
        case 'welcome':
            return '#3b82f6';
        case 'benefit_expiring':
            return '#ef4444';
        case 'monthly_summary':
            return '#8b5cf6';
        case 'promo':
            return '#ec4899';
        default:
            return '#6b7280';
    }
}
