// app/(tabs)/home.tsx
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/auth-store';
import { useDashboardStore } from '../../src/stores/dashboard-store';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useResponsive } from '../../src/hooks/useResponsive';
import { router } from 'expo-router';
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
    const { colors, isDark } = useTheme();
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
        {
            icon: 'add-circle',
            title: 'Nuevo Club',
            subtitle: 'Crear un club',
            color: colors.accent.blue,
            bg: colors.status.infoBg,
            onPress: () => router.push('/(tabs)/clubs'),
        },
        {
            icon: 'card',
            title: 'Registrar Pago',
            subtitle: 'Pagar semana',
            color: colors.accent.green,
            bg: colors.status.successBg,
            onPress: () => router.push('/(tabs)/clubs'),
        },
        {
            icon: 'search',
            title: 'Buscar Club',
            subtitle: 'Por contrato',
            color: colors.accent.purple,
            bg: 'rgba(139, 92, 246, 0.15)',
            onPress: () => router.push('/search'),
        },
        {
            icon: 'trophy',
            title: 'Sorteos',
            subtitle: 'Registrar sorteo',
            color: colors.accent.orange,
            bg: colors.status.warningBg,
            onPress: () => router.push('/draw'),
        },
    ];

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'payment': return { name: 'card', color: colors.accent.green, bg: colors.status.successBg };
            case 'withdrawal': return { name: 'cash', color: colors.accent.orange, bg: colors.status.warningBg };
            default: return { name: 'add-circle', color: colors.accent.blue, bg: colors.status.infoBg };
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
                        colors={[colors.accent.blue]}
                        tintColor={colors.accent.blue}
                        progressBackgroundColor={colors.bg.card}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={[styles.greeting, { color: colors.text.secondary }]}>{getGreeting()} 👋</Text>
                            <Text style={[styles.userName, { color: colors.text.primary }]}>{user?.name || 'Usuario'}</Text>
                        </View>
                        <TouchableOpacity style={styles.avatarContainer}>
                            <View style={[styles.avatar, { backgroundColor: colors.bg.card, borderColor: colors.accent.blue }]}>
                                <Text style={[styles.avatarText, { color: colors.accent.blue }]}>{getInitials(user?.name || 'Usuario')}</Text>
                            </View>
                            <View style={[styles.onlineIndicator, { backgroundColor: colors.accent.green, borderColor: colors.bg.primary }]} />
                        </TouchableOpacity>
                    </View>

                    {/* Tenant Card */}
                    <TouchableOpacity style={[styles.tenantCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]} activeOpacity={0.7}>
                        <View style={styles.tenantIconContainer}>
                            <Ionicons name="business" size={18} color={colors.accent.cyan} />
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

                {/* Stats Section - Con datos reales */}
                <View style={styles.statsSection}>
                    <View style={[styles.statsGrid, { gap: spacing }]}>
                        {[
                            { icon: 'people', value: stats.activeClubs.toString(), label: 'Clubes Activos', color: colors.accent.blue, bg: colors.status.infoBg },
                            { icon: 'wallet', value: formatCurrency(stats.totalAmount), label: 'Monto Total', color: colors.accent.green, bg: colors.status.successBg },
                            { icon: 'ticket', value: stats.averageShare.toString(), label: 'Número Prom.', color: colors.accent.orange, bg: colors.status.warningBg },
                        ].map((stat, index) => (
                            <View key={index} style={[styles.statCard, { minWidth: isLarge ? 120 : 100, backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                                <View style={[styles.statIconBg, { backgroundColor: stat.bg }]}>
                                    <Ionicons name={stat.icon as any} size={22} color={stat.color} />
                                </View>
                                {isLoading ? (
                                    <ActivityIndicator size="small" color={stat.color} style={{ marginVertical: 8 }} />
                                ) : (
                                    <Text style={[styles.statValue, { color: colors.text.primary }]}>{stat.value}</Text>
                                )}
                                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>{stat.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Progress Card - Con datos reales */}
                <View style={styles.section}>
                    <View style={[styles.progressCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                        <View style={styles.progressHeader}>
                            <View style={styles.progressLeft}>
                                <View style={[styles.progressIconBg, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
                                    <Ionicons name="cash" size={20} color={colors.accent.cyan} />
                                </View>
                                <View>
                                    <Text style={[styles.progressTitle, { color: colors.text.primary }]}>Resumen Financiero</Text>
                                    <Text style={[styles.progressSubtitle, { color: colors.text.secondary }]}>
                                        {stats.totalClubs} clubes registrados
                                    </Text>
                                </View>
                            </View>
                            <Text style={[
                                styles.progressPercent,
                                { color: stats.totalBalance >= 0 ? colors.accent.green : colors.accent.orange }
                            ]}>
                                {formatCurrency(Math.abs(stats.totalBalance))}
                            </Text>
                        </View>
                        <View style={[styles.financeRow, { backgroundColor: colors.bg.elevated }]}>
                            <View style={styles.financeItem}>
                                <Text style={[styles.financeLabel, { fontSize: isLarge ? 10 : 9, color: colors.text.muted }]}>Pagado</Text>
                                <Text style={[styles.financeValue, { color: colors.accent.green, fontSize: isLarge ? 14 : 13 }]}>
                                    {formatCurrency(stats.totalPaidAmount)}
                                </Text>
                            </View>
                            <View style={[styles.financeDivider, { backgroundColor: colors.border.default }]} />
                            <View style={styles.financeItem}>
                                <Text style={[styles.financeLabel, { fontSize: isLarge ? 10 : 9, color: colors.text.muted }]}>Balance</Text>
                                <Text style={[styles.financeValue, { color: stats.totalBalance >= 0 ? colors.text.primary : colors.accent.orange, fontSize: isLarge ? 14 : 13 }]}>
                                    {formatCurrency(stats.totalBalance)}
                                </Text>
                            </View>
                            <View style={[styles.financeDivider, { backgroundColor: colors.border.default }]} />
                            <View style={styles.financeItem}>
                                <Text style={[styles.financeLabel, { fontSize: isLarge ? 10 : 9, color: colors.text.muted }]} numberOfLines={1} adjustsFontSizeToFit>Comprometido</Text>
                                <Text style={[styles.financeValue, { color: colors.accent.blue, fontSize: isLarge ? 14 : 13 }]}>
                                    {formatCurrency(stats.totalAmount)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Acciones Rápidas</Text>
                    <View style={[styles.actionsGrid, { gap: spacing }]}>
                        {actions.map((action, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.actionCard, { width: cardWidth, minHeight: isLarge ? 140 : 120, backgroundColor: colors.bg.card, borderColor: colors.border.default }]}
                                activeOpacity={0.7}
                                onPress={action.onPress}
                            >
                                <View style={[styles.actionIconBg, { backgroundColor: action.bg }]}>
                                    <Ionicons name={action.icon as any} size={24} color={action.color} />
                                </View>
                                <Text style={[styles.actionTitle, { color: colors.text.primary }]}>{action.title}</Text>
                                <Text style={[styles.actionSubtitle, { color: colors.text.muted }]}>{action.subtitle}</Text>
                                <View style={[styles.actionArrow, { backgroundColor: colors.bg.elevated }]}>
                                    <Ionicons name="arrow-forward" size={14} color={colors.text.muted} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Recent Activity - Con datos reales */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Actividad Reciente</Text>
                        <TouchableOpacity style={styles.seeAllBtn}>
                            <Text style={[styles.seeAllText, { color: colors.accent.blue }]}>Ver todo</Text>
                            <Ionicons name="chevron-forward" size={14} color={colors.accent.blue} />
                        </TouchableOpacity>
                    </View>

                    {isLoading ? (
                        <View style={[styles.loadingCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                            <ActivityIndicator size="small" color={colors.accent.blue} />
                            <Text style={[styles.loadingText, { color: colors.text.muted }]}>Cargando actividad...</Text>
                        </View>
                    ) : recentActivity.length > 0 ? (
                        <View style={[styles.activityList, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                            {recentActivity.map((activity, index) => {
                                const iconConfig = getActivityIcon(activity.type);
                                return (
                                    <TouchableOpacity
                                        key={activity.id}
                                        style={[
                                            styles.activityItem,
                                            { borderBottomColor: colors.border.default },
                                            index === recentActivity.length - 1 && styles.activityItemLast
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
                                            <Text style={[styles.activityAmount, { color: colors.accent.green }]}>
                                                {formatCurrency(activity.amount)}
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
                    <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.status.errorBg }]} onPress={logout} activeOpacity={0.7}>
                        <Ionicons name="log-out-outline" size={18} color={colors.status.error} />
                        <Text style={[styles.logoutText, { color: colors.status.error }]}>Cerrar Sesión</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollView: { flex: 1 },

    // Header
    header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 8 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    greeting: { fontSize: 14, marginBottom: 4 },
    userName: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
    avatarContainer: { position: 'relative' },
    avatar: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
    avatarText: { fontSize: 15, fontWeight: '700' },
    onlineIndicator: { position: 'absolute', bottom: -1, right: -1, width: 12, height: 12, borderRadius: 6, borderWidth: 2 },

    // Tenant
    tenantCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, borderWidth: 1 },
    tenantIconContainer: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(6, 182, 212, 0.12)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    tenantInfo: { flex: 1 },
    tenantLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.8, marginBottom: 2 },
    tenantName: { fontSize: 15, fontWeight: '600' },
    tenantArrow: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },

    // Stats
    statsSection: { paddingHorizontal: 20, paddingVertical: 16 },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    statCard: { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1 },
    statIconBg: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    statValue: { fontSize: 22, fontWeight: '700', marginBottom: 2 },
    statLabel: { fontSize: 10, textAlign: 'center' },

    // Progress / Finance Card
    progressCard: { borderRadius: 16, padding: 16, borderWidth: 1 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    progressLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    progressIconBg: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    progressTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
    progressSubtitle: { fontSize: 12 },
    progressPercent: { fontSize: 18, fontWeight: '700' },
    financeRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 14 },
    financeItem: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
    financeLabel: { fontSize: 10, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },
    financeValue: { fontSize: 14, fontWeight: '700' },
    financeDivider: { width: 1, height: 30 },

    // Section
    section: { paddingHorizontal: 20, marginBottom: 20 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 14 },
    seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    seeAllText: { fontSize: 13, fontWeight: '600' },

    // Actions
    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    actionCard: { borderRadius: 16, padding: 16, borderWidth: 1, position: 'relative' },
    actionIconBg: { width: 46, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    actionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
    actionSubtitle: { fontSize: 12 },
    actionArrow: { position: 'absolute', top: 14, right: 14, width: 26, height: 26, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },

    // Activity List
    activityList: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
    activityItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1 },
    activityItemLast: { borderBottomWidth: 0 },
    activityIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    activityInfo: { flex: 1 },
    activityTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
    activitySubtitle: { fontSize: 12 },
    activityAmount: { fontSize: 14, fontWeight: '700' },

    // Loading
    loadingCard: { borderRadius: 16, padding: 28, alignItems: 'center', borderWidth: 1, flexDirection: 'row', justifyContent: 'center', gap: 12 },
    loadingText: { fontSize: 14 },

    // Empty
    emptyCard: { borderRadius: 16, padding: 28, alignItems: 'center', borderWidth: 1 },
    emptyIconContainer: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
    emptyTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
    emptySubtitle: { fontSize: 12, textAlign: 'center' },

    // Logout
    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' },
    logoutText: { fontSize: 14, fontWeight: '600' },

    bottomSpacer: { height: 100 },
});