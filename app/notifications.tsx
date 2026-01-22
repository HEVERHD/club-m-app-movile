// app/notifications.tsx
import { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../src/contexts/ThemeContext';
import { useNotifications } from '../src/hooks/useNotifications';
import { useNotificationsStore, createMockNotifications } from '../src/stores/notifications-store';
import { getNotificationIcon, getNotificationColor, type AppNotification } from '../src/services/notifications';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
    const { colors } = useTheme();
    const [refreshing, setRefreshing] = useState(false);

    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
    } = useNotifications();

    const addNotification = useNotificationsStore((state) => state.addNotification);

    const handleRefresh = async () => {
        setRefreshing(true);
        // Simular refresh - en producción aquí cargarías del servidor
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setRefreshing(false);
    };

    const handleNotificationPress = (notification: AppNotification) => {
        // Marcar como leída
        markAsRead(notification.id);

        // Navegar según el tipo
        if (notification.data?.drawId) {
            router.push(`/draw/${notification.data.drawId}`);
        } else if (notification.data?.clubId) {
            router.push(`/club/${notification.data.clubId}`);
        }
    };

    const formatTimestamp = (timestamp: number): string => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Ahora';
        if (minutes < 60) return `Hace ${minutes} min`;
        if (hours < 24) return `Hace ${hours}h`;
        if (days < 7) return `Hace ${days}d`;
        return new Date(timestamp).toLocaleDateString('es', { day: 'numeric', month: 'short' });
    };

    // Función para agregar notificaciones de prueba (solo desarrollo)
    const addTestNotifications = () => {
        const mockNotifs = createMockNotifications();
        mockNotifs.forEach((n, i) => {
            setTimeout(() => addNotification(n), i * 100);
        });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.primary }]} edges={['top']}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <View style={styles.headerTitle}>
                    <Text style={[styles.title, { color: colors.text.primary }]}>Notificaciones</Text>
                    {unreadCount > 0 && (
                        <View style={[styles.badge, { backgroundColor: colors.status.error }]}>
                            <Text style={styles.badgeText}>{unreadCount}</Text>
                        </View>
                    )}
                </View>
                {notifications.length > 0 && (
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={markAllAsRead}
                    >
                        <Ionicons name="checkmark-done" size={22} color={colors.brand.primary} />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.brand.primary}
                    />
                }
            >
                {notifications.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIcon, { backgroundColor: colors.bg.elevated }]}>
                            <Ionicons name="notifications-off-outline" size={48} color={colors.text.muted} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
                            Sin notificaciones
                        </Text>
                        <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                            Cuando recibas notificaciones aparecerán aquí
                        </Text>

                        {/* Botón de prueba - solo en desarrollo */}
                        {__DEV__ && (
                            <TouchableOpacity
                                style={[styles.testBtn, { backgroundColor: colors.brand.primary }]}
                                onPress={addTestNotifications}
                            >
                                <Text style={styles.testBtnText}>Agregar notificaciones de prueba</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <>
                        {notifications.map((notification) => {
                            const iconName = getNotificationIcon(notification.type);
                            const iconColor = getNotificationColor(notification.type);

                            return (
                                <TouchableOpacity
                                    key={notification.id}
                                    style={[
                                        styles.notificationCard,
                                        {
                                            backgroundColor: notification.read
                                                ? colors.bg.card
                                                : colors.bg.elevated,
                                            borderColor: colors.border.default,
                                        },
                                    ]}
                                    onPress={() => handleNotificationPress(notification)}
                                    activeOpacity={0.7}
                                >
                                    <View
                                        style={[
                                            styles.notificationIcon,
                                            { backgroundColor: iconColor + '15' },
                                        ]}
                                    >
                                        <Ionicons
                                            name={iconName as any}
                                            size={22}
                                            color={iconColor}
                                        />
                                    </View>

                                    <View style={styles.notificationContent}>
                                        <View style={styles.notificationHeader}>
                                            <Text
                                                style={[
                                                    styles.notificationTitle,
                                                    {
                                                        color: colors.text.primary,
                                                        fontWeight: notification.read ? '500' : '700',
                                                    },
                                                ]}
                                                numberOfLines={1}
                                            >
                                                {notification.title}
                                            </Text>
                                            <Text style={[styles.timestamp, { color: colors.text.muted }]}>
                                                {formatTimestamp(notification.timestamp)}
                                            </Text>
                                        </View>
                                        <Text
                                            style={[styles.notificationBody, { color: colors.text.secondary }]}
                                            numberOfLines={2}
                                        >
                                            {notification.body}
                                        </Text>
                                    </View>

                                    {!notification.read && (
                                        <View style={[styles.unreadDot, { backgroundColor: colors.brand.primary }]} />
                                    )}

                                    <TouchableOpacity
                                        style={styles.deleteBtn}
                                        onPress={() => deleteNotification(notification.id)}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <Ionicons name="close" size={18} color={colors.text.muted} />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            );
                        })}

                        {/* Botón para limpiar todas */}
                        <TouchableOpacity
                            style={[styles.clearAllBtn, { borderColor: colors.border.default }]}
                            onPress={clearAll}
                        >
                            <Ionicons name="trash-outline" size={18} color={colors.text.muted} />
                            <Text style={[styles.clearAllText, { color: colors.text.muted }]}>
                                Borrar todas
                            </Text>
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    headerTitle: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    badge: {
        minWidth: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '700',
    },
    actionBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },

    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 100,
    },

    // Empty state
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 80,
    },
    emptyIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        maxWidth: 250,
    },
    testBtn: {
        marginTop: 24,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
    },
    testBtnText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },

    // Notification card
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
    },
    notificationIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
        marginRight: 8,
    },
    notificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    notificationTitle: {
        fontSize: 15,
        flex: 1,
        marginRight: 8,
    },
    timestamp: {
        fontSize: 12,
    },
    notificationBody: {
        fontSize: 13,
        lineHeight: 18,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        position: 'absolute',
        top: 16,
        right: 36,
    },
    deleteBtn: {
        padding: 4,
    },

    // Clear all
    clearAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 8,
    },
    clearAllText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
