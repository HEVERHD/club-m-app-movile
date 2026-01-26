// app/notifications.tsx
import { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../src/contexts/ThemeContext';
import { useNotifications } from '../src/hooks/useNotifications';
import { useNotificationsStore, createMockNotifications } from '../src/stores/notifications-store';
import { getNotificationIcon, getNotificationColor, type AppNotification, type NotificationType } from '../src/services/notifications';
import { SafeAreaView } from 'react-native-safe-area-context';

// Helper para obtener etiqueta del tipo de notificación
const getNotificationTypeLabel = (type: NotificationType): string => {
    const labels: Record<NotificationType, string> = {
        payment_reminder: 'Recordatorio de Pago',
        draw_announcement: 'Sorteo',
        draw_result: 'Resultado de Sorteo',
        welcome: 'Bienvenida',
        benefit_expiring: 'Beneficio por Vencer',
        monthly_summary: 'Resumen Mensual',
        promo: 'Promoción',
        general: 'General',
    };
    return labels[type] || 'Notificación';
};

export default function NotificationsScreen() {
    const { colors } = useTheme();
    const [refreshing, setRefreshing] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

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
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setRefreshing(false);
    };

    const handleNotificationPress = (notification: AppNotification) => {
        markAsRead(notification.id);
        setSelectedNotification(notification);
        setShowDetailModal(true);
    };

    const handleNavigateFromDetail = () => {
        if (!selectedNotification) return;

        setShowDetailModal(false);

        // Navegar según el tipo después de cerrar el modal
        setTimeout(() => {
            if (selectedNotification.data?.drawId) {
                router.push(`/draw/${selectedNotification.data.drawId}`);
            } else if (selectedNotification.data?.clubId) {
                router.push(`/club/${selectedNotification.data.clubId}`);
            }
        }, 300);
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

    const formatFullDate = (timestamp: number): string => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('es', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

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
                                            borderColor: notification.read
                                                ? colors.border.default
                                                : iconColor + '40',
                                            borderLeftWidth: notification.read ? 1 : 4,
                                            borderLeftColor: notification.read
                                                ? colors.border.default
                                                : iconColor,
                                        },
                                    ]}
                                    onPress={() => handleNotificationPress(notification)}
                                    activeOpacity={0.7}
                                >
                                    {/* Unread indicator glow */}
                                    {!notification.read && (
                                        <View
                                            style={[
                                                styles.unreadGlow,
                                                { backgroundColor: iconColor + '08' }
                                            ]}
                                        />
                                    )}

                                    <View
                                        style={[
                                            styles.notificationIcon,
                                            {
                                                backgroundColor: notification.read
                                                    ? iconColor + '15'
                                                    : iconColor + '25',
                                            },
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
                                            {!notification.read && (
                                                <View style={[styles.newBadge, { backgroundColor: iconColor }]}>
                                                    <Text style={styles.newBadgeText}>Nueva</Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text
                                            style={[styles.notificationBody, { color: colors.text.secondary }]}
                                            numberOfLines={2}
                                        >
                                            {notification.body}
                                        </Text>
                                        <Text style={[styles.timestamp, { color: colors.text.muted }]}>
                                            {formatTimestamp(notification.timestamp)}
                                        </Text>
                                    </View>

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

            {/* Notification Detail Modal */}
            <Modal
                visible={showDetailModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowDetailModal(false)}
            >
                <NotificationDetailModal
                    notification={selectedNotification}
                    onClose={() => setShowDetailModal(false)}
                    onNavigate={handleNavigateFromDetail}
                    onDelete={() => {
                        if (selectedNotification) {
                            deleteNotification(selectedNotification.id);
                            setShowDetailModal(false);
                        }
                    }}
                    formatFullDate={formatFullDate}
                />
            </Modal>
        </SafeAreaView>
    );
}

interface NotificationDetailModalProps {
    notification: AppNotification | null;
    onClose: () => void;
    onNavigate: () => void;
    onDelete: () => void;
    formatFullDate: (timestamp: number) => string;
}

function NotificationDetailModal({
    notification,
    onClose,
    onNavigate,
    onDelete,
    formatFullDate,
}: NotificationDetailModalProps) {
    const { colors } = useTheme();

    if (!notification) return null;

    const iconName = getNotificationIcon(notification.type);
    const iconColor = getNotificationColor(notification.type);
    const typeLabel = getNotificationTypeLabel(notification.type);
    const hasNavigation = notification.data?.drawId || notification.data?.clubId;

    const getNavigationLabel = () => {
        if (notification.data?.drawId) return 'Ver Sorteo';
        if (notification.data?.clubId) return 'Ver Club';
        return '';
    };

    return (
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.bg.primary }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border.default }]}>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <Ionicons name="close" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: colors.text.primary }]}>Detalle</Text>
                <TouchableOpacity onPress={onDelete} style={styles.deleteModalBtn}>
                    <Ionicons name="trash-outline" size={22} color={colors.status.error} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                {/* Icon and Type */}
                <View style={styles.modalIconSection}>
                    <View style={[styles.modalIcon, { backgroundColor: iconColor + '15' }]}>
                        <Ionicons name={iconName as any} size={36} color={iconColor} />
                    </View>
                    <View style={[styles.typeBadge, { backgroundColor: iconColor + '20' }]}>
                        <Text style={[styles.typeBadgeText, { color: iconColor }]}>{typeLabel}</Text>
                    </View>
                </View>

                {/* Title */}
                <Text style={[styles.modalNotifTitle, { color: colors.text.primary }]}>
                    {notification.title}
                </Text>

                {/* Body */}
                <View style={[styles.bodyContainer, { backgroundColor: colors.bg.card }]}>
                    <Text style={[styles.modalBody, { color: colors.text.secondary }]}>
                        {notification.body}
                    </Text>
                </View>

                {/* Timestamp */}
                <View style={styles.timestampSection}>
                    <Ionicons name="time-outline" size={18} color={colors.text.muted} />
                    <Text style={[styles.fullTimestamp, { color: colors.text.muted }]}>
                        {formatFullDate(notification.timestamp)}
                    </Text>
                </View>

                {/* Additional Data */}
                {notification.data && Object.keys(notification.data).length > 0 && (
                    <View style={[styles.dataSection, { backgroundColor: colors.bg.card }]}>
                        <Text style={[styles.dataSectionTitle, { color: colors.text.tertiary }]}>
                            Información adicional
                        </Text>
                        {Object.entries(notification.data).map(([key, value]) => (
                            <View key={key} style={styles.dataRow}>
                                <Text style={[styles.dataKey, { color: colors.text.muted }]}>
                                    {key}:
                                </Text>
                                <Text style={[styles.dataValue, { color: colors.text.secondary }]}>
                                    {String(value)}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Read Status */}
                <View style={styles.statusSection}>
                    <View style={[
                        styles.statusIndicator,
                        { backgroundColor: notification.read ? colors.status.success + '20' : colors.brand.primary + '20' }
                    ]}>
                        <Ionicons
                            name={notification.read ? 'checkmark-circle' : 'ellipse'}
                            size={16}
                            color={notification.read ? colors.status.success : colors.brand.primary}
                        />
                        <Text style={[
                            styles.statusText,
                            { color: notification.read ? colors.status.success : colors.brand.primary }
                        ]}>
                            {notification.read ? 'Leída' : 'No leída'}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Action Button */}
            {hasNavigation && (
                <View style={[styles.modalFooter, { borderTopColor: colors.border.default }]}>
                    <TouchableOpacity
                        style={[styles.navigateBtn, { backgroundColor: iconColor }]}
                        onPress={onNavigate}
                    >
                        <Text style={styles.navigateBtnText}>{getNavigationLabel()}</Text>
                        <Ionicons name="arrow-forward" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            )}
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
        overflow: 'hidden',
        position: 'relative',
    },
    unreadGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    notificationIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        zIndex: 1,
    },
    notificationContent: {
        flex: 1,
        marginRight: 8,
        zIndex: 1,
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
    newBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    newBadgeText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    timestamp: {
        fontSize: 11,
        marginTop: 6,
    },
    notificationBody: {
        fontSize: 13,
        lineHeight: 18,
    },
    deleteBtn: {
        padding: 4,
        zIndex: 1,
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

    // Modal styles
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    closeBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    deleteModalBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    modalIconSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    modalIcon: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    typeBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    typeBadgeText: {
        fontSize: 13,
        fontWeight: '600',
    },
    modalNotifTitle: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 20,
    },
    bodyContainer: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    modalBody: {
        fontSize: 16,
        lineHeight: 24,
    },
    timestampSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 20,
    },
    fullTimestamp: {
        fontSize: 14,
    },
    dataSection: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    dataSectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    dataRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    dataKey: {
        fontSize: 14,
        marginRight: 8,
    },
    dataValue: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    statusSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
    },
    modalFooter: {
        padding: 16,
        borderTopWidth: 1,
    },
    navigateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 14,
    },
    navigateBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
});
