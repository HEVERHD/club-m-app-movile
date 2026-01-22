// app/(tabs)/home.tsx
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, ActivityIndicator, Animated, Alert } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/auth-store';
import { useDashboardStore } from '../../src/stores/dashboard-store';
import { useTheme } from '../../src/contexts/ThemeContext';
import { router } from 'expo-router';
import { QRScanner, QRData } from '../../src/components/scanner/QRScanner';
import { useNotificationsStore } from '../../src/stores/notifications-store';
import { useCouponsFiltered } from '../../src/stores/coupons-store';

// Helper para formatear moneda
const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
        return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(0)}`;
};

// Helper para formatear fecha relativa
const formatRelativeDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem`;
    return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
};

// Helper para obtener el día de la semana
const getDayName = (): string => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[new Date().getDay()];
};

// Helper para obtener fecha formateada
const getFormattedDate = (): string => {
    return new Date().toLocaleDateString('es-PA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

export default function HomeScreen() {
    const { user, tenantName, logout } = useAuthStore();
    const { stats, recentActivity, isLoading, fetchDashboardData } = useDashboardStore();
    const { colors } = useTheme();
    const [refreshing, setRefreshing] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const unreadNotifications = useNotificationsStore((state) => state.unreadCount);
    const { availableCount: couponsCount } = useCouponsFiltered();

    // Animaciones
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    // Cargar datos al montar
    useEffect(() => {
        fetchDashboardData();
        // Animación de entrada
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchDashboardData();
        setRefreshing(false);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 18) return 'Buenas tardes';
        return 'Buenas noches';
    };

    // Manejar escaneo de QR
    const handleQRScan = (data: QRData) => {
        setShowScanner(false);

        if (data.type === 'CLUB_MEMBER' && (data.id || data.doc)) {
            // Buscar cliente por ID o cédula
            const searchTerm = data.doc || data.id || '';
            router.push({
                pathname: '/search',
                params: { query: searchTerm, autoSearch: 'true' },
            });
        } else if (data.type === 'TEXT' && data.doc) {
            // Tratar como cédula
            router.push({
                pathname: '/search',
                params: { query: data.doc, autoSearch: 'true' },
            });
        } else {
            Alert.alert(
                'QR No Reconocido',
                'Este código QR no corresponde a un miembro del club.',
                [{ text: 'OK' }]
            );
        }
    };

    const getInitials = (name: string) => {
        return name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'US';
    };

    // Stats cards con tendencias
    const statsCards = [
        {
            icon: 'layers',
            value: stats.activeClubs.toString(),
            label: 'Clubes Activos',
            color: colors.brand.primary,
            bg: colors.status.infoBg,
            trend: stats.activeClubs > 0 ? 'up' : null,
        },
        {
            icon: 'wallet',
            value: formatCurrency(stats.totalPaidAmount),
            label: 'Total Pagado',
            color: colors.brand.secondary,
            bg: colors.status.successBg,
            trend: stats.totalPaidAmount > 0 ? 'up' : null,
        },
        {
            icon: 'calendar',
            value: stats.totalWeeksPaid.toString(),
            label: 'Semanas',
            color: colors.brand.secondary,
            bg: colors.brand.secondary + '20',
            trend: null,
        },
        {
            icon: 'people',
            value: stats.totalClubs.toString(),
            label: 'Total Clubes',
            color: colors.accent.purple,
            bg: colors.accent.purple + '20',
            trend: null,
        },
    ];

    const actions = [
        {
            icon: 'qr-code',
            title: 'Escanear QR',
            subtitle: 'Buscar cliente',
            color: colors.brand.secondary,
            bg: colors.brand.secondary + '20',
            onPress: () => setShowScanner(true),
            badge: null,
        },
        {
            icon: 'ticket-outline',
            title: 'Mis Cupones',
            subtitle: couponsCount > 0 ? `${couponsCount} disponibles` : 'Ver cupones',
            color: '#22c55e',
            bg: 'rgba(34, 197, 94, 0.15)',
            onPress: () => router.push('/coupons'),
            badge: couponsCount > 0 ? couponsCount : null,
        },
        {
            icon: 'trophy',
            title: 'Ejecutar Sorteo',
            subtitle: 'Nuevo sorteo',
            color: colors.accent.gold,
            bg: colors.accent.gold + '20',
            onPress: () => router.push('/draw/execute'),
            badge: null,
        },
        {
            icon: 'document-text',
            title: 'Reporte',
            subtitle: 'Ver ganadores',
            color: colors.accent.orange,
            bg: colors.status.warningBg,
            onPress: () => router.push('/draw/winners-report'),
            badge: null,
        },
    ];

    // Calcular progreso general
    const totalProgress = stats.totalClubs > 0
        ? Math.round((stats.totalPaidAmount / (stats.totalAmount || 1)) * 100)
        : 0;

    // Alertas simuladas (en producción vendrían del backend)
    const alerts = stats.totalWeeksLate > 0 ? [
        {
            id: '1',
            type: 'warning',
            icon: 'alert-circle',
            title: `${stats.totalWeeksLate} semanas vencidas`,
            subtitle: 'Revisa los clubes con pagos pendientes',
            color: colors.accent.orange,
            bg: colors.status.warningBg,
        }
    ] : [];

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'payment': return { name: 'card', color: colors.brand.secondary, bg: colors.status.successBg };
            case 'withdrawal': return { name: 'cash', color: colors.accent.orange, bg: colors.status.warningBg };
            default: return { name: 'add-circle', color: colors.brand.primary, bg: colors.status.infoBg };
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg.primary }]}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.brand.primary]}
                        tintColor={colors.brand.primary}
                        progressBackgroundColor={colors.bg.card}
                    />
                }
            >
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    {/* Header mejorado */}
                    <View style={styles.header}>
                        <View style={styles.headerTop}>
                            <View style={styles.headerLeft}>
                                <Text style={[styles.dateText, { color: colors.text.muted }]}>
                                    {getDayName()}, {getFormattedDate()}
                                </Text>
                                <Text style={[styles.greeting, { color: colors.text.secondary }]}>
                                    {getGreeting()}
                                </Text>
                                <Text style={[styles.userName, { color: colors.text.primary }]}>
                                    {user?.name || 'Usuario'}
                                </Text>
                            </View>
                            <View style={styles.headerRight}>
                                <TouchableOpacity
                                    style={[styles.notificationBtn, { backgroundColor: colors.bg.card }]}
                                    onPress={() => router.push('/notifications')}
                                >
                                    <Ionicons name="notifications-outline" size={22} color={colors.text.secondary} />
                                    {unreadNotifications > 0 && (
                                        <View style={[styles.notificationBadge, { backgroundColor: colors.status.error }]}>
                                            <Text style={styles.notificationBadgeText}>
                                                {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.avatarContainer} onPress={() => router.push('/(tabs)/profile')}>
                                    <View style={[styles.avatar, { backgroundColor: colors.brand.primary }]}>
                                        <Text style={[styles.avatarText, { color: colors.white }]}>
                                            {getInitials(user?.name || 'Usuario')}
                                        </Text>
                                    </View>
                                    <View style={[styles.onlineIndicator, { backgroundColor: colors.brand.secondary, borderColor: colors.bg.primary }]} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Tenant Card */}
                        <TouchableOpacity
                            style={[styles.tenantCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.tenantIconContainer, { backgroundColor: colors.brand.secondary + '20' }]}>
                                <Ionicons name="business" size={18} color={colors.brand.secondary} />
                            </View>
                            <View style={styles.tenantInfo}>
                                <Text style={[styles.tenantLabel, { color: colors.text.muted }]}>COMPAÑÍA ACTIVA</Text>
                                <Text style={[styles.tenantName, { color: colors.text.primary }]}>{tenantName}</Text>
                            </View>
                            <View style={[styles.tenantArrow, { backgroundColor: colors.bg.elevated }]}>
                                <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Alertas */}
                    {alerts.length > 0 && (
                        <View style={styles.alertsSection}>
                            {alerts.map((alert) => (
                                <TouchableOpacity
                                    key={alert.id}
                                    style={[styles.alertCard, { backgroundColor: alert.bg, borderColor: alert.color + '30' }]}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.alertIconBg, { backgroundColor: alert.color + '20' }]}>
                                        <Ionicons name={alert.icon as any} size={20} color={alert.color} />
                                    </View>
                                    <View style={styles.alertContent}>
                                        <Text style={[styles.alertTitle, { color: colors.text.primary }]}>{alert.title}</Text>
                                        <Text style={[styles.alertSubtitle, { color: colors.text.secondary }]}>{alert.subtitle}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Stats Section - 4 cards */}
                    <View style={styles.statsSection}>
                        <View style={styles.statsGrid}>
                            {statsCards.map((stat, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.statCard,
                                        { backgroundColor: colors.bg.card, borderColor: colors.border.default }
                                    ]}
                                >
                                    <View style={[styles.statIconBg, { backgroundColor: stat.bg }]}>
                                        <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                                    </View>
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color={stat.color} style={{ marginTop: 12 }} />
                                    ) : (
                                        <Text style={[styles.statValue, { color: colors.text.primary }]}>{stat.value}</Text>
                                    )}
                                    <Text style={[styles.statLabel, { color: colors.text.secondary }]}>{stat.label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Progress Card - Con barra de progreso */}
                    <View style={styles.section}>
                        <View style={[styles.progressCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                            <View style={styles.progressHeader}>
                                <View style={styles.progressLeft}>
                                    <View style={[styles.progressIconBg, { backgroundColor: colors.brand.secondary + '20' }]}>
                                        <Ionicons name="stats-chart" size={20} color={colors.brand.secondary} />
                                    </View>
                                    <View>
                                        <Text style={[styles.progressTitle, { color: colors.text.primary }]}>Resumen Financiero</Text>
                                        <Text style={[styles.progressSubtitle, { color: colors.text.secondary }]}>
                                            {stats.totalClubs} clubes • {totalProgress}% completado
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Barra de progreso */}
                            <View style={styles.progressBarContainer}>
                                <View style={[styles.progressBarBg, { backgroundColor: colors.bg.elevated }]}>
                                    <View
                                        style={[
                                            styles.progressBarFill,
                                            {
                                                width: `${Math.min(totalProgress, 100)}%`,
                                                backgroundColor: colors.brand.secondary
                                            }
                                        ]}
                                    />
                                </View>
                                <View style={styles.progressLabels}>
                                    <Text style={[styles.progressLabelText, { color: colors.text.muted }]}>
                                        {formatCurrency(stats.totalPaidAmount)}
                                    </Text>
                                    <Text style={[styles.progressLabelText, { color: colors.text.muted }]}>
                                        {formatCurrency(stats.totalAmount)}
                                    </Text>
                                </View>
                            </View>

                            {/* Finance Row */}
                            <View style={[styles.financeRow, { backgroundColor: colors.bg.elevated }]}>
                                <View style={styles.financeItem}>
                                    <View style={[styles.financeIconSmall, { backgroundColor: colors.status.successBg }]}>
                                        <Ionicons name="arrow-up" size={12} color={colors.brand.secondary} />
                                    </View>
                                    <View>
                                        <Text style={[styles.financeLabel, { color: colors.text.muted }]}>Pagado</Text>
                                        <Text style={[styles.financeValue, { color: colors.brand.secondary }]}>
                                            {formatCurrency(stats.totalPaidAmount)}
                                        </Text>
                                    </View>
                                </View>
                                <View style={[styles.financeDivider, { backgroundColor: colors.border.default }]} />
                                <View style={styles.financeItem}>
                                    <View style={[styles.financeIconSmall, { backgroundColor: colors.status.infoBg }]}>
                                        <Ionicons name="wallet" size={12} color={colors.brand.primary} />
                                    </View>
                                    <View>
                                        <Text style={[styles.financeLabel, { color: colors.text.muted }]}>Balance</Text>
                                        <Text style={[styles.financeValue, { color: stats.totalBalance >= 0 ? colors.text.primary : colors.accent.orange }]}>
                                            {formatCurrency(stats.totalBalance)}
                                        </Text>
                                    </View>
                                </View>
                                <View style={[styles.financeDivider, { backgroundColor: colors.border.default }]} />
                                <View style={styles.financeItem}>
                                    <View style={[styles.financeIconSmall, { backgroundColor: colors.status.warningBg }]}>
                                        <Ionicons name="flag" size={12} color={colors.accent.orange} />
                                    </View>
                                    <View>
                                        <Text style={[styles.financeLabel, { color: colors.text.muted }]}>Meta</Text>
                                        <Text style={[styles.financeValue, { color: colors.text.primary }]}>
                                            {formatCurrency(stats.totalAmount)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Quick Actions */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Acciones Rápidas</Text>
                        <View style={styles.actionsGrid}>
                            {actions.map((action, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.actionCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}
                                    activeOpacity={0.7}
                                    onPress={action.onPress}
                                >
                                    <View style={styles.actionCardHeader}>
                                        <View style={[styles.actionIconBg, { backgroundColor: action.bg }]}>
                                            <Ionicons name={action.icon as any} size={24} color={action.color} />
                                        </View>
                                        {action.badge && (
                                            <View style={[styles.actionBadge, { backgroundColor: action.color }]}>
                                                <Text style={styles.actionBadgeText}>{action.badge}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={[styles.actionTitle, { color: colors.text.primary }]}>{action.title}</Text>
                                    <Text style={[styles.actionSubtitle, { color: colors.text.muted }]}>{action.subtitle}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Próximo Sorteo */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.text.primary, marginBottom: 0 }]}>Próximo Sorteo</Text>
                            <TouchableOpacity
                                style={styles.seeAllBtn}
                                onPress={() => router.push('/(tabs)/draws')}
                            >
                                <Text style={[styles.seeAllText, { color: colors.brand.primary }]}>Ver todos</Text>
                                <Ionicons name="chevron-forward" size={14} color={colors.brand.primary} />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={[styles.nextDrawCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}
                            activeOpacity={0.7}
                            onPress={() => router.push('/(tabs)/draws')}
                        >
                            <View style={[styles.nextDrawIconBg, { backgroundColor: colors.accent.gold + '20' }]}>
                                <Ionicons name="trophy" size={28} color={colors.accent.gold} />
                            </View>
                            <View style={styles.nextDrawContent}>
                                <Text style={[styles.nextDrawTitle, { color: colors.text.primary }]}>
                                    {getDayName() === 'Miércoles' || getDayName() === 'Domingo' ? 'Hoy' : getDayName() === 'Martes' || getDayName() === 'Sábado' ? 'Mañana' : 'Esta semana'}
                                </Text>
                                <Text style={[styles.nextDrawSubtitle, { color: colors.text.secondary }]}>
                                    Sorteos programados para Miércoles y Domingo
                                </Text>
                            </View>
                            <View style={[styles.nextDrawBadge, { backgroundColor: colors.brand.primary }]}>
                                <Ionicons name="chevron-forward" size={18} color={colors.white} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Recent Activity */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.text.primary, marginBottom: 0 }]}>Actividad Reciente</Text>
                            <TouchableOpacity style={styles.seeAllBtn}>
                                <Text style={[styles.seeAllText, { color: colors.brand.primary }]}>Ver todo</Text>
                                <Ionicons name="chevron-forward" size={14} color={colors.brand.primary} />
                            </TouchableOpacity>
                        </View>

                        {isLoading ? (
                            <View style={[styles.loadingCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                                <ActivityIndicator size="small" color={colors.brand.primary} />
                                <Text style={[styles.loadingText, { color: colors.text.muted }]}>Cargando actividad...</Text>
                            </View>
                        ) : recentActivity.length > 0 ? (
                            <View style={[styles.activityList, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                                {recentActivity.slice(0, 4).map((activity, index) => {
                                    const iconConfig = getActivityIcon(activity.type);
                                    return (
                                        <TouchableOpacity
                                            key={activity.id}
                                            style={[
                                                styles.activityItem,
                                                { borderBottomColor: colors.border.default },
                                                index === Math.min(recentActivity.length, 4) - 1 && styles.activityItemLast
                                            ]}
                                            activeOpacity={0.7}
                                        >
                                            <View style={[styles.activityIcon, { backgroundColor: iconConfig.bg }]}>
                                                <Ionicons name={iconConfig.name as any} size={18} color={iconConfig.color} />
                                            </View>
                                            <View style={styles.activityInfo}>
                                                <Text style={[styles.activityTitle, { color: colors.text.primary }]} numberOfLines={1}>
                                                    {activity.customerName}
                                                </Text>
                                                <Text style={[styles.activitySubtitle, { color: colors.text.muted }]}>
                                                    {activity.contractNumber} • {formatRelativeDate(activity.date)}
                                                </Text>
                                            </View>
                                            {activity.amount !== undefined && activity.amount > 0 && (
                                                <Text style={[styles.activityAmount, { color: colors.brand.secondary }]}>
                                                    +{formatCurrency(activity.amount)}
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ) : (
                            <View style={[styles.emptyCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                                <View style={[styles.emptyIconContainer, { backgroundColor: colors.bg.elevated }]}>
                                    <Ionicons name="receipt-outline" size={28} color={colors.text.muted} />
                                </View>
                                <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>Sin actividad reciente</Text>
                                <Text style={[styles.emptySubtitle, { color: colors.text.muted }]}>Tus transacciones aparecerán aquí</Text>
                            </View>
                        )}
                    </View>

                    {/* Logout */}
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={[styles.logoutButton, { backgroundColor: colors.status.errorBg, borderColor: colors.status.error + '30' }]}
                            onPress={logout}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="log-out-outline" size={18} color={colors.status.error} />
                            <Text style={[styles.logoutText, { color: colors.status.error }]}>Cerrar Sesión</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.bottomSpacer} />
                </Animated.View>
            </ScrollView>

            {/* QR Scanner Modal */}
            <QRScanner
                visible={showScanner}
                onClose={() => setShowScanner(false)}
                onScan={handleQRScan}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollView: { flex: 1 },

    // Header
    header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 8 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    headerLeft: { flex: 1 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    dateText: { fontSize: 12, marginBottom: 4, textTransform: 'capitalize' },
    greeting: { fontSize: 14, marginBottom: 2 },
    userName: { fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },

    // Notifications
    notificationBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', position: 'relative' },
    notificationBadge: { position: 'absolute', top: 6, right: 6, minWidth: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
    notificationBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

    // Avatar
    avatarContainer: { position: 'relative' },
    avatar: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 15, fontWeight: '700' },
    onlineIndicator: { position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderRadius: 6, borderWidth: 2 },

    // Tenant
    tenantCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, borderWidth: 1 },
    tenantIconContainer: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    tenantInfo: { flex: 1 },
    tenantLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.8, marginBottom: 2 },
    tenantName: { fontSize: 15, fontWeight: '600' },
    tenantArrow: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },

    // Alerts
    alertsSection: { paddingHorizontal: 20, marginBottom: 8 },
    alertCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 14, borderWidth: 1, marginBottom: 8 },
    alertIconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    alertContent: { flex: 1 },
    alertTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
    alertSubtitle: { fontSize: 12 },

    // Stats
    statsSection: { paddingHorizontal: 20, paddingVertical: 12 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    statCard: { width: '48%', flexGrow: 1, borderRadius: 16, padding: 16, borderWidth: 1, alignItems: 'center' },
    statIconBg: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    statValue: { fontSize: 26, fontWeight: '700', marginTop: 12, marginBottom: 4 },
    statLabel: { fontSize: 12, fontWeight: '500', textAlign: 'center' },

    // Progress Card
    progressCard: { borderRadius: 16, padding: 16, borderWidth: 1 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    progressLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    progressIconBg: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    progressTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
    progressSubtitle: { fontSize: 12 },

    // Progress Bar
    progressBarContainer: { marginBottom: 16 },
    progressBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 4 },
    progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
    progressLabelText: { fontSize: 11 },

    // Finance Row
    financeRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12 },
    financeItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
    financeIconSmall: { width: 24, height: 24, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
    financeLabel: { fontSize: 10, marginBottom: 1, textTransform: 'uppercase', letterSpacing: 0.3 },
    financeValue: { fontSize: 13, fontWeight: '700' },
    financeDivider: { width: 1, height: 28, marginHorizontal: 8 },

    // Section
    section: { paddingHorizontal: 20, marginBottom: 20 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 14 },
    seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    seeAllText: { fontSize: 13, fontWeight: '600' },

    // Actions
    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    actionCard: { width: '48%', flexGrow: 1, borderRadius: 14, padding: 14, borderWidth: 1 },
    actionCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    actionIconBg: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    actionBadge: { minWidth: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
    actionBadgeText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
    actionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
    actionSubtitle: { fontSize: 12 },

    // Next Draw Card
    nextDrawCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 16, borderWidth: 1 },
    nextDrawIconBg: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    nextDrawContent: { flex: 1 },
    nextDrawTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    nextDrawSubtitle: { fontSize: 13 },
    nextDrawBadge: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

    // Activity List
    activityList: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
    activityItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1 },
    activityItemLast: { borderBottomWidth: 0 },
    activityIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    activityInfo: { flex: 1 },
    activityTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
    activitySubtitle: { fontSize: 12 },
    activityAmount: { fontSize: 14, fontWeight: '700' },

    // Loading
    loadingCard: { borderRadius: 14, padding: 28, alignItems: 'center', borderWidth: 1, flexDirection: 'row', justifyContent: 'center', gap: 12 },
    loadingText: { fontSize: 14 },

    // Empty
    emptyCard: { borderRadius: 14, padding: 28, alignItems: 'center', borderWidth: 1 },
    emptyIconContainer: { width: 56, height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
    emptyTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
    emptySubtitle: { fontSize: 12, textAlign: 'center' },

    // Logout
    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1 },
    logoutText: { fontSize: 14, fontWeight: '600' },

    bottomSpacer: { height: 100 },
});
