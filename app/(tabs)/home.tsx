// app/(tabs)/home.tsx
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/auth-store';
import { useDashboardStore } from '../../src/stores/dashboard-store';
import { COLORS } from '../../src/constants/colors';
import { useResponsive } from '../../src/hooks/useResponsive';

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

export default function HomeScreen() {
    const { user, tenantName, logout } = useAuthStore();
    const { stats, recentActivity, isLoading, fetchDashboardData } = useDashboardStore();
    const { columns, cardWidth, spacing, isLarge } = useResponsive();
    const [refreshing, setRefreshing] = useState(false);

    // Cargar datos al montar
    useEffect(() => {
        fetchDashboardData();
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

    const getInitials = (name: string) => {
        return name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'US';
    };

    const actions = [
        { icon: 'add-circle', title: 'Nuevo Club', subtitle: 'Crear un club', color: COLORS.accent.blue, bg: COLORS.status.infoBg },
        { icon: 'card', title: 'Registrar Pago', subtitle: 'Pagar semana', color: COLORS.accent.green, bg: COLORS.status.successBg },
        { icon: 'search', title: 'Buscar Club', subtitle: 'Por contrato', color: COLORS.accent.purple, bg: 'rgba(139, 92, 246, 0.15)' },
        { icon: 'stats-chart', title: 'Reportes', subtitle: 'Estadísticas', color: COLORS.accent.cyan, bg: 'rgba(6, 182, 212, 0.15)' },
    ];

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'payment': return { name: 'card', color: COLORS.accent.green, bg: COLORS.status.successBg };
            case 'withdrawal': return { name: 'cash', color: COLORS.accent.orange, bg: COLORS.status.warningBg };
            default: return { name: 'add-circle', color: COLORS.accent.blue, bg: COLORS.status.infoBg };
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.bg.primary} />
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.accent.blue]}
                        tintColor={COLORS.accent.blue}
                        progressBackgroundColor={COLORS.bg.card}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
                            <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
                        </View>
                        <TouchableOpacity style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{getInitials(user?.name || 'Usuario')}</Text>
                            </View>
                            <View style={styles.onlineIndicator} />
                        </TouchableOpacity>
                    </View>

                    {/* Tenant Card */}
                    <TouchableOpacity style={styles.tenantCard} activeOpacity={0.7}>
                        <View style={styles.tenantIconContainer}>
                            <Ionicons name="business" size={18} color={COLORS.accent.cyan} />
                        </View>
                        <View style={styles.tenantInfo}>
                            <Text style={styles.tenantLabel}>COMPAÑÍA ACTIVA</Text>
                            <Text style={styles.tenantName}>{tenantName}</Text>
                        </View>
                        <View style={styles.tenantArrow}>
                            <Ionicons name="chevron-forward" size={18} color={COLORS.text.muted} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Stats Section - Con datos reales */}
                <View style={styles.statsSection}>
                    <View style={[styles.statsGrid, { gap: spacing }]}>
                        {[
                            { icon: 'people', value: stats.activeClubs.toString(), label: 'Clubes Activos', color: COLORS.accent.blue, bg: COLORS.status.infoBg },
                            { icon: 'wallet', value: formatCurrency(stats.totalAmount), label: 'Monto Total', color: COLORS.accent.green, bg: COLORS.status.successBg },
                            { icon: 'ticket', value: stats.averageShare.toString(), label: 'Número Prom.', color: COLORS.accent.orange, bg: COLORS.status.warningBg },
                        ].map((stat, index) => (
                            <View key={index} style={[styles.statCard, { minWidth: isLarge ? 120 : 100 }]}>
                                <View style={[styles.statIconBg, { backgroundColor: stat.bg }]}>
                                    <Ionicons name={stat.icon as any} size={22} color={stat.color} />
                                </View>
                                {isLoading ? (
                                    <ActivityIndicator size="small" color={stat.color} style={{ marginVertical: 8 }} />
                                ) : (
                                    <Text style={styles.statValue}>{stat.value}</Text>
                                )}
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Progress Card - Con datos reales */}
                <View style={styles.section}>
                    <View style={styles.progressCard}>
                        <View style={styles.progressHeader}>
                            <View style={styles.progressLeft}>
                                <View style={[styles.progressIconBg, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
                                    <Ionicons name="cash" size={20} color={COLORS.accent.cyan} />
                                </View>
                                <View>
                                    <Text style={styles.progressTitle}>Resumen Financiero</Text>
                                    <Text style={styles.progressSubtitle}>
                                        {stats.totalClubs} clubes registrados
                                    </Text>
                                </View>
                            </View>
                            <Text style={[
                                styles.progressPercent,
                                { color: stats.totalBalance >= 0 ? COLORS.accent.green : COLORS.accent.orange }
                            ]}>
                                {formatCurrency(Math.abs(stats.totalBalance))}
                            </Text>
                        </View>
                        <View style={styles.financeRow}>
                            <View style={styles.financeItem}>
                                <Text style={[styles.financeLabel, { fontSize: isLarge ? 10 : 9 }]}>Pagado</Text>
                                <Text style={[styles.financeValue, { color: COLORS.accent.green, fontSize: isLarge ? 14 : 13 }]}>
                                    {formatCurrency(stats.totalPaidAmount)}
                                </Text>
                            </View>
                            <View style={styles.financeDivider} />
                            <View style={styles.financeItem}>
                                <Text style={[styles.financeLabel, { fontSize: isLarge ? 10 : 9 }]}>Balance</Text>
                                <Text style={[styles.financeValue, { color: stats.totalBalance >= 0 ? COLORS.text.primary : COLORS.accent.orange, fontSize: isLarge ? 14 : 13 }]}>
                                    {formatCurrency(stats.totalBalance)}
                                </Text>
                            </View>
                            <View style={styles.financeDivider} />
                            <View style={styles.financeItem}>
                                <Text style={[styles.financeLabel, { fontSize: isLarge ? 10 : 9 }]} numberOfLines={1} adjustsFontSizeToFit>Comprometido</Text>
                                <Text style={[styles.financeValue, { color: COLORS.accent.blue, fontSize: isLarge ? 14 : 13 }]}>
                                    {formatCurrency(stats.totalAmount)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
                    <View style={[styles.actionsGrid, { gap: spacing }]}>
                        {actions.map((action, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.actionCard, { width: cardWidth, minHeight: isLarge ? 140 : 120 }]}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.actionIconBg, { backgroundColor: action.bg }]}>
                                    <Ionicons name={action.icon as any} size={24} color={action.color} />
                                </View>
                                <Text style={styles.actionTitle}>{action.title}</Text>
                                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                                <View style={styles.actionArrow}>
                                    <Ionicons name="arrow-forward" size={14} color={COLORS.text.muted} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Recent Activity - Con datos reales */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Actividad Reciente</Text>
                        <TouchableOpacity style={styles.seeAllBtn}>
                            <Text style={styles.seeAllText}>Ver todo</Text>
                            <Ionicons name="chevron-forward" size={14} color={COLORS.accent.blue} />
                        </TouchableOpacity>
                    </View>

                    {isLoading ? (
                        <View style={styles.loadingCard}>
                            <ActivityIndicator size="small" color={COLORS.accent.blue} />
                            <Text style={styles.loadingText}>Cargando actividad...</Text>
                        </View>
                    ) : recentActivity.length > 0 ? (
                        <View style={styles.activityList}>
                            {recentActivity.map((activity, index) => {
                                const iconConfig = getActivityIcon(activity.type);
                                return (
                                    <TouchableOpacity
                                        key={activity.id}
                                        style={[
                                            styles.activityItem,
                                            index === recentActivity.length - 1 && styles.activityItemLast
                                        ]}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.activityIcon, { backgroundColor: iconConfig.bg }]}>
                                            <Ionicons name={iconConfig.name as any} size={18} color={iconConfig.color} />
                                        </View>
                                        <View style={styles.activityInfo}>
                                            <Text style={styles.activityTitle} numberOfLines={1}>
                                                {activity.customerName}
                                            </Text>
                                            <Text style={styles.activitySubtitle}>
                                                {activity.contractNumber} • {formatRelativeDate(activity.date)}
                                            </Text>
                                        </View>
                                        {activity.amount !== undefined && activity.amount > 0 && (
                                            <Text style={styles.activityAmount}>
                                                {formatCurrency(activity.amount)}
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ) : (
                        <View style={styles.emptyCard}>
                            <View style={styles.emptyIconContainer}>
                                <Ionicons name="receipt-outline" size={28} color={COLORS.text.muted} />
                            </View>
                            <Text style={styles.emptyTitle}>Sin actividad reciente</Text>
                            <Text style={styles.emptySubtitle}>Tus transacciones aparecerán aquí</Text>
                        </View>
                    )}
                </View>

                {/* Logout */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.7}>
                        <Ionicons name="log-out-outline" size={18} color={COLORS.status.error} />
                        <Text style={styles.logoutText}>Cerrar Sesión</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg.primary },
    scrollView: { flex: 1 },

    // Header
    header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 8 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    greeting: { fontSize: 14, color: COLORS.text.secondary, marginBottom: 4 },
    userName: { fontSize: 24, fontWeight: '700', color: COLORS.text.primary, letterSpacing: -0.5 },
    avatarContainer: { position: 'relative' },
    avatar: { width: 48, height: 48, borderRadius: 14, backgroundColor: COLORS.bg.card, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.accent.blue },
    avatarText: { color: COLORS.accent.blue, fontSize: 15, fontWeight: '700' },
    onlineIndicator: { position: 'absolute', bottom: -1, right: -1, width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.accent.green, borderWidth: 2, borderColor: COLORS.bg.primary },

    // Tenant
    tenantCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bg.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border.default },
    tenantIconContainer: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(6, 182, 212, 0.12)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    tenantInfo: { flex: 1 },
    tenantLabel: { fontSize: 10, color: COLORS.text.muted, fontWeight: '600', letterSpacing: 0.8, marginBottom: 2 },
    tenantName: { fontSize: 15, fontWeight: '600', color: COLORS.text.primary },
    tenantArrow: { width: 28, height: 28, borderRadius: 8, backgroundColor: COLORS.bg.elevated, justifyContent: 'center', alignItems: 'center' },

    // Stats
    statsSection: { paddingHorizontal: 20, paddingVertical: 16 },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    statCard: { flex: 1, backgroundColor: COLORS.bg.card, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border.default },
    statIconBg: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    statValue: { fontSize: 22, fontWeight: '700', color: COLORS.text.primary, marginBottom: 2 },
    statLabel: { fontSize: 10, color: COLORS.text.secondary, textAlign: 'center' },

    // Progress / Finance Card
    progressCard: { backgroundColor: COLORS.bg.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border.default },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    progressLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    progressIconBg: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    progressTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary, marginBottom: 2 },
    progressSubtitle: { fontSize: 12, color: COLORS.text.secondary },
    progressPercent: { fontSize: 18, fontWeight: '700', color: COLORS.accent.cyan },
    financeRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bg.elevated, borderRadius: 12, padding: 14 },
    financeItem: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
    financeLabel: { fontSize: 10, color: COLORS.text.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },
    financeValue: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary },
    financeDivider: { width: 1, height: 30, backgroundColor: COLORS.border.default },

    // Section
    section: { paddingHorizontal: 20, marginBottom: 20 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text.primary, marginBottom: 14 },
    seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    seeAllText: { fontSize: 13, color: COLORS.accent.blue, fontWeight: '600' },

    // Actions
    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    actionCard: { backgroundColor: COLORS.bg.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border.default, position: 'relative' },
    actionIconBg: { width: 46, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    actionTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary, marginBottom: 4 },
    actionSubtitle: { fontSize: 12, color: COLORS.text.muted },
    actionArrow: { position: 'absolute', top: 14, right: 14, width: 26, height: 26, borderRadius: 8, backgroundColor: COLORS.bg.elevated, justifyContent: 'center', alignItems: 'center' },

    // Activity List
    activityList: { backgroundColor: COLORS.bg.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border.default, overflow: 'hidden' },
    activityItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border.default },
    activityItemLast: { borderBottomWidth: 0 },
    activityIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    activityInfo: { flex: 1 },
    activityTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary, marginBottom: 2 },
    activitySubtitle: { fontSize: 12, color: COLORS.text.muted },
    activityAmount: { fontSize: 14, fontWeight: '700', color: COLORS.accent.green },

    // Loading
    loadingCard: { backgroundColor: COLORS.bg.card, borderRadius: 16, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border.default, flexDirection: 'row', justifyContent: 'center', gap: 12 },
    loadingText: { fontSize: 14, color: COLORS.text.muted },

    // Empty
    emptyCard: { backgroundColor: COLORS.bg.card, borderRadius: 16, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border.default },
    emptyIconContainer: { width: 56, height: 56, borderRadius: 16, backgroundColor: COLORS.bg.elevated, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
    emptyTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary, marginBottom: 4 },
    emptySubtitle: { fontSize: 12, color: COLORS.text.muted, textAlign: 'center' },

    // Logout
    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, backgroundColor: COLORS.status.errorBg, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' },
    logoutText: { fontSize: 14, fontWeight: '600', color: COLORS.status.error },

    bottomSpacer: { height: 100 },
});