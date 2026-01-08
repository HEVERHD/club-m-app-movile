// app/(tabs)/home.tsx
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, StatusBar } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/auth-store';
import { COLORS } from '../../src/constants/colors';

export default function HomeScreen() {
    const { user, tenantName, logout, } = useAuthStore();
    console.log()
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
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

                {/* Stats Section */}
                <View style={styles.statsSection}>
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <View style={[styles.statIconBg, { backgroundColor: COLORS.status.infoBg }]}>
                                <Ionicons name="people" size={22} color={COLORS.accent.blue} />
                            </View>
                            <Text style={styles.statValue}>0</Text>
                            <Text style={styles.statLabel}>Clubes Activos</Text>
                        </View>

                        <View style={styles.statCard}>
                            <View style={[styles.statIconBg, { backgroundColor: COLORS.status.successBg }]}>
                                <Ionicons name="wallet" size={22} color={COLORS.accent.green} />
                            </View>
                            <Text style={styles.statValue}>$0</Text>
                            <Text style={styles.statLabel}>Balance Total</Text>
                        </View>

                        <View style={styles.statCard}>
                            <View style={[styles.statIconBg, { backgroundColor: COLORS.status.warningBg }]}>
                                <Ionicons name="calendar" size={22} color={COLORS.accent.orange} />
                            </View>
                            <Text style={styles.statValue}>0</Text>
                            <Text style={styles.statLabel}>Semanas</Text>
                        </View>
                    </View>
                </View>

                {/* Progress Card */}
                <View style={styles.section}>
                    <View style={styles.progressCard}>
                        <View style={styles.progressHeader}>
                            <View style={styles.progressLeft}>
                                <View style={[styles.progressIconBg, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
                                    <Ionicons name="trending-up" size={20} color={COLORS.accent.cyan} />
                                </View>
                                <View>
                                    <Text style={styles.progressTitle}>Progreso Semanal</Text>
                                    <Text style={styles.progressSubtitle}>0 de 52 semanas completadas</Text>
                                </View>
                            </View>
                            <Text style={styles.progressPercent}>0%</Text>
                        </View>
                        <View style={styles.progressBarContainer}>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: '0%' }]} />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
                    <View style={styles.actionsGrid}>
                        <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
                            <View style={[styles.actionIconBg, { backgroundColor: COLORS.status.infoBg }]}>
                                <Ionicons name="add-circle" size={24} color={COLORS.accent.blue} />
                            </View>
                            <Text style={styles.actionTitle}>Nuevo Club</Text>
                            <Text style={styles.actionSubtitle}>Crear un club</Text>
                            <View style={styles.actionArrow}>
                                <Ionicons name="arrow-forward" size={14} color={COLORS.text.muted} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
                            <View style={[styles.actionIconBg, { backgroundColor: COLORS.status.successBg }]}>
                                <Ionicons name="card" size={24} color={COLORS.accent.green} />
                            </View>
                            <Text style={styles.actionTitle}>Registrar Pago</Text>
                            <Text style={styles.actionSubtitle}>Pagar semana</Text>
                            <View style={styles.actionArrow}>
                                <Ionicons name="arrow-forward" size={14} color={COLORS.text.muted} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
                            <View style={[styles.actionIconBg, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                                <Ionicons name="search" size={24} color={COLORS.accent.purple} />
                            </View>
                            <Text style={styles.actionTitle}>Buscar Club</Text>
                            <Text style={styles.actionSubtitle}>Por contrato</Text>
                            <View style={styles.actionArrow}>
                                <Ionicons name="arrow-forward" size={14} color={COLORS.text.muted} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
                            <View style={[styles.actionIconBg, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
                                <Ionicons name="stats-chart" size={24} color={COLORS.accent.cyan} />
                            </View>
                            <Text style={styles.actionTitle}>Reportes</Text>
                            <Text style={styles.actionSubtitle}>Estadísticas</Text>
                            <View style={styles.actionArrow}>
                                <Ionicons name="arrow-forward" size={14} color={COLORS.text.muted} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Recent Activity */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Actividad Reciente</Text>
                        <TouchableOpacity style={styles.seeAllBtn}>
                            <Text style={styles.seeAllText}>Ver todo</Text>
                            <Ionicons name="chevron-forward" size={14} color={COLORS.accent.blue} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.emptyCard}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="receipt-outline" size={28} color={COLORS.text.muted} />
                        </View>
                        <Text style={styles.emptyTitle}>Sin actividad reciente</Text>
                        <Text style={styles.emptySubtitle}>Tus transacciones aparecerán aquí</Text>
                    </View>
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
    container: {
        flex: 1,
        backgroundColor: COLORS.bg.primary,
    },
    scrollView: {
        flex: 1,
    },

    // Header
    header: {
        paddingHorizontal: 20,
        paddingTop: 56,
        paddingBottom: 8,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    greeting: {
        fontSize: 14,
        color: COLORS.text.secondary,
        marginBottom: 4,
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text.primary,
        letterSpacing: -0.5,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: COLORS.bg.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.accent.blue,
    },
    avatarText: {
        color: COLORS.accent.blue,
        fontSize: 15,
        fontWeight: '700',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: -1,
        right: -1,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.accent.green,
        borderWidth: 2,
        borderColor: COLORS.bg.primary,
    },

    // Tenant Card
    tenantCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bg.card,
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: COLORS.border.default,
    },
    tenantIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: 'rgba(6, 182, 212, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    tenantInfo: {
        flex: 1,
    },
    tenantLabel: {
        fontSize: 10,
        color: COLORS.text.muted,
        fontWeight: '600',
        letterSpacing: 0.8,
        marginBottom: 2,
    },
    tenantName: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    tenantArrow: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: COLORS.bg.elevated,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Stats
    statsSection: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: COLORS.bg.card,
        borderRadius: 16,
        padding: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border.default,
    },
    statIconBg: {
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.text.primary,
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 10,
        color: COLORS.text.secondary,
        textAlign: 'center',
    },

    // Progress Card
    progressCard: {
        backgroundColor: COLORS.bg.card,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border.default,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    progressLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    progressIconBg: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: 2,
    },
    progressSubtitle: {
        fontSize: 12,
        color: COLORS.text.secondary,
    },
    progressPercent: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.accent.cyan,
    },
    progressBarContainer: {
        width: '100%',
    },
    progressBar: {
        height: 8,
        backgroundColor: COLORS.bg.elevated,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.accent.cyan,
        borderRadius: 4,
    },

    // Section
    section: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.text.primary,
        marginBottom: 14,
    },
    seeAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    seeAllText: {
        fontSize: 13,
        color: COLORS.accent.blue,
        fontWeight: '600',
    },

    // Actions Grid
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    actionCard: {
        width: '48.5%',
        backgroundColor: COLORS.bg.card,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border.default,
        position: 'relative',
    },
    actionIconBg: {
        width: 46,
        height: 46,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: 4,
    },
    actionSubtitle: {
        fontSize: 12,
        color: COLORS.text.muted,
    },
    actionArrow: {
        position: 'absolute',
        top: 14,
        right: 14,
        width: 26,
        height: 26,
        borderRadius: 8,
        backgroundColor: COLORS.bg.elevated,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Empty Card
    emptyCard: {
        backgroundColor: COLORS.bg.card,
        borderRadius: 16,
        padding: 28,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border.default,
    },
    emptyIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: COLORS.bg.elevated,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },
    emptyTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: 4,
    },
    emptySubtitle: {
        fontSize: 12,
        color: COLORS.text.muted,
        textAlign: 'center',
    },

    // Logout
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: COLORS.status.errorBg,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    logoutText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.status.error,
    },

    bottomSpacer: {
        height: 100,
    },
});