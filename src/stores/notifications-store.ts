// src/stores/notifications-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppNotification, NotificationType } from '../services/notifications';

interface NotificationsState {
    notifications: AppNotification[];
    unreadCount: number;
    pushToken: string | null;
    isEnabled: boolean;
}

interface NotificationsActions {
    addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (id: string) => void;
    clearAll: () => void;
    setPushToken: (token: string | null) => void;
    setEnabled: (enabled: boolean) => void;
}

export const useNotificationsStore = create<NotificationsState & NotificationsActions>()(
    persist(
        (set, get) => ({
            notifications: [],
            unreadCount: 0,
            pushToken: null,
            isEnabled: true,

            addNotification: (notification) => {
                const newNotification: AppNotification = {
                    ...notification,
                    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    timestamp: Date.now(),
                    read: false,
                };

                set((state) => ({
                    notifications: [newNotification, ...state.notifications].slice(0, 100), // Max 100
                    unreadCount: state.unreadCount + 1,
                }));
            },

            markAsRead: (id) => {
                set((state) => {
                    const notifications = state.notifications.map((n) =>
                        n.id === id ? { ...n, read: true } : n
                    );
                    const unreadCount = notifications.filter((n) => !n.read).length;
                    return { notifications, unreadCount };
                });
            },

            markAllAsRead: () => {
                set((state) => ({
                    notifications: state.notifications.map((n) => ({ ...n, read: true })),
                    unreadCount: 0,
                }));
            },

            deleteNotification: (id) => {
                set((state) => {
                    const notification = state.notifications.find((n) => n.id === id);
                    const notifications = state.notifications.filter((n) => n.id !== id);
                    const unreadCount = notification && !notification.read
                        ? state.unreadCount - 1
                        : state.unreadCount;
                    return { notifications, unreadCount: Math.max(0, unreadCount) };
                });
            },

            clearAll: () => {
                set({ notifications: [], unreadCount: 0 });
            },

            setPushToken: (token) => {
                set({ pushToken: token });
            },

            setEnabled: (enabled) => {
                set({ isEnabled: enabled });
            },
        }),
        {
            name: 'notifications-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                notifications: state.notifications,
                unreadCount: state.unreadCount,
                isEnabled: state.isEnabled,
            }),
        }
    )
);

// Helper para crear notificaciones de prueba
export function createMockNotifications(): Omit<AppNotification, 'id' | 'timestamp' | 'read'>[] {
    return [
        {
            type: 'payment_reminder',
            title: 'Recordatorio de Pago',
            body: 'Tu pago semanal de $25.00 vence mañana. ¡No olvides realizarlo!',
            data: { clubId: '123', amount: 25 },
        },
        {
            type: 'draw_announcement',
            title: 'Sorteo Próximo',
            body: '¡El sorteo #15 será este viernes! Asegúrate de estar al día con tus pagos para participar.',
            data: { drawId: '456' },
        },
        {
            type: 'draw_result',
            title: '¡Felicidades!',
            body: 'Fuiste seleccionado como ganador del sorteo #14. Contacta a tu administrador.',
            data: { drawId: '455', prize: 'Premio Mayor' },
        },
        {
            type: 'monthly_summary',
            title: 'Resumen de Enero',
            body: 'Has pagado 4 semanas este mes. Balance actual: $100.00. ¡Sigue así!',
            data: { month: 'Enero', weeksPaid: 4, balance: 100 },
        },
        {
            type: 'benefit_expiring',
            title: 'Beneficio por Vencer',
            body: 'Tu cupón de 10% de descuento vence en 3 días. ¡Úsalo antes de que expire!',
            data: { couponId: '789', discount: 10 },
        },
    ];
}
