// app/(tabs)/my-home.tsx - Home para clientes
import { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuthStore } from '../../src/stores/auth-store';
import { getClubsByCustomer } from '../../src/api/clubs.api';
import type { Club } from '../../src/types/clubs';
import QRCode from 'react-native-qrcode-svg';
import { useNotificationsStore } from '../../src/stores/notifications-store';

export default function MyHomeScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const unreadNotifications = useNotificationsStore((state) => state.unreadCount);

    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [clubs, setClubs] = useState<Club[]>([]);
    const [stats, setStats] = useState({
        totalClubs: 0,
        activeClubs: 0,
        totalBalance: 0,
        weeksPaid: 0,
    });

    const loadData = useCallback(async () => {
        if (!user?.customerId) return;

        try {
            const customerClubs = await getClubsByCustomer(user.customerId);
            setClubs(customerClubs);

            // Calcular estadísticas
            const activeClubs = customerClubs.filter(c =>
                c.statusName.toLowerCase() === 'activo' || c.statusName.toLowerCase() === 'active'
            );
            const totalBalance = customerClubs.reduce((sum, c) => sum + (c.balanceAmount || 0), 0);
            const totalWeeksPaid = customerClubs.reduce((sum, c) => sum + (c.weeksPaid || 0), 0);

            setStats({
                totalClubs: customerClubs.length,
                activeClubs: activeClubs.length,
                totalBalance,
                weeksPaid: totalWeeksPaid,
            });
        } catch (error) {
            console.error('Error loading customer data:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [user?.customerId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, [loadData]);

    const qrValue = JSON.stringify({
        type: 'CLUB_MEMBER',
        id: user?.customerId || user?.id,
        doc: user?.identificationNumber,
        v: 1,
    });

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.primary }]} edges={['top']}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.brand.primary}
                    />
                }
            >
                {/* Header con saludo */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.greeting, { color: colors.text.secondary }]}>
                            Hola,
                        </Text>
                        <Text style={[styles.userName, { color: colors.text.primary }]}>
                            {user?.name || 'Miembro'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.notificationBtn, { backgroundColor: colors.bg.card }]}
                        onPress={() => router.push('/notifications')}
                    >
                        <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
                        {unreadNotifications > 0 && (
                            <View style={[styles.notificationBadge, { backgroundColor: colors.status.error }]}>
                                <Text style={styles.notificationBadgeText}>
                                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Tarjeta QR de Miembro */}
                <View style={[styles.memberCard, { backgroundColor: colors.brand.primary }]}>
                    <View style={styles.memberCardContent}>
                        <View style={styles.memberInfo}>
                            <Text style={[styles.memberLabel, { color: colors.white + '80' }]}>
                                TARJETA DE MIEMBRO
                            </Text>
                            <Text style={[styles.memberName, { color: colors.white }]}>
                                {user?.name}
                            </Text>
                            <Text style={[styles.memberId, { color: colors.white + '90' }]}>
                                {user?.identificationNumber || 'Sin cédula'}
                            </Text>
                        </View>
                        <View style={[styles.qrContainer, { backgroundColor: colors.white }]}>
                            <QRCode
                                value={qrValue}
                                size={80}
                                backgroundColor={colors.white}
                                color={colors.brand.primary}
                            />
                        </View>
                    </View>
                    <Text style={[styles.memberHint, { color: colors.white + '70' }]}>
                        Presenta este código en el punto de venta
                    </Text>
                </View>

                {/* Estadísticas rápidas */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: colors.bg.card }]}>
                        <View style={[styles.statIcon, { backgroundColor: colors.brand.primary + '15' }]}>
                            <Ionicons name="wallet" size={20} color={colors.brand.primary} />
                        </View>
                        <Text style={[styles.statValue, { color: colors.text.primary }]}>
                            {stats.activeClubs}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                            Clubes Activos
                        </Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: colors.bg.card }]}>
                        <View style={[styles.statIcon, { backgroundColor: colors.status.success + '15' }]}>
                            <Ionicons name="cash" size={20} color={colors.status.success} />
                        </View>
                        <Text style={[styles.statValue, { color: colors.status.success }]}>
                            ${stats.totalBalance.toFixed(2)}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                            Balance Total
                        </Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: colors.bg.card }]}>
                        <View style={[styles.statIcon, { backgroundColor: colors.accent.gold + '15' }]}>
                            <Ionicons name="calendar-number" size={20} color={colors.accent.gold} />
                        </View>
                        <Text style={[styles.statValue, { color: colors.text.primary }]}>
                            {stats.weeksPaid}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                            Semanas Pagadas
                        </Text>
                    </View>
                </View>

                {/* Acciones rápidas */}
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                    Acciones Rápidas
                </Text>
                <View style={styles.actionsRow}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: colors.bg.card }]}
                        onPress={() => router.push('/(tabs)/my-clubs')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: colors.brand.primary + '15' }]}>
                            <Ionicons name="wallet" size={24} color={colors.brand.primary} />
                        </View>
                        <Text style={[styles.actionText, { color: colors.text.primary }]}>
                            Ver Clubes
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: colors.bg.card }]}
                        onPress={() => router.push('/(tabs)/my-draws')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: colors.accent.gold + '15' }]}>
                            <Ionicons name="trophy" size={24} color={colors.accent.gold} />
                        </View>
                        <Text style={[styles.actionText, { color: colors.text.primary }]}>
                            Mis Sorteos
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: colors.bg.card }]}
                        onPress={() => router.push('/(tabs)/my-profile')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: colors.status.success + '15' }]}>
                            <Ionicons name="person" size={24} color={colors.status.success} />
                        </View>
                        <Text style={[styles.actionText, { color: colors.text.primary }]}>
                            Mi Perfil
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Clubes recientes */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                        Mis Clubes
                    </Text>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/my-clubs')}>
                        <Text style={[styles.seeAll, { color: colors.brand.primary }]}>
                            Ver todos
                        </Text>
                    </TouchableOpacity>
                </View>

                {clubs.length === 0 && !isLoading ? (
                    <View style={[styles.emptyCard, { backgroundColor: colors.bg.card }]}>
                        <Ionicons name="wallet-outline" size={48} color={colors.text.muted} />
                        <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                            No tienes clubes registrados
                        </Text>
                    </View>
                ) : (
                    clubs.slice(0, 3).map((club) => (
                        <TouchableOpacity
                            key={club.clubId}
                            style={[styles.clubCard, { backgroundColor: colors.bg.card }]}
                            onPress={() => router.push(`/club/${club.clubId}`)}
                        >
                            <View style={styles.clubHeader}>
                                <Text style={[styles.clubContract, { color: colors.text.primary }]}>
                                    #{club.contractNumber}
                                </Text>
                                <View style={[
                                    styles.clubStatus,
                                    {
                                        backgroundColor: club.statusName.toLowerCase() === 'activo'
                                            ? colors.status.successBg
                                            : colors.status.warningBg
                                    }
                                ]}>
                                    <Text style={[
                                        styles.clubStatusText,
                                        {
                                            color: club.statusName.toLowerCase() === 'activo'
                                                ? colors.status.success
                                                : colors.status.warning
                                        }
                                    ]}>
                                        {club.statusName}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.clubDetails}>
                                <View style={styles.clubDetail}>
                                    <Text style={[styles.clubDetailLabel, { color: colors.text.muted }]}>
                                        Acción
                                    </Text>
                                    <Text style={[styles.clubDetailValue, { color: colors.brand.primary }]}>
                                        {club.share}
                                    </Text>
                                </View>
                                <View style={styles.clubDetail}>
                                    <Text style={[styles.clubDetailLabel, { color: colors.text.muted }]}>
                                        Semanas
                                    </Text>
                                    <Text style={[styles.clubDetailValue, { color: colors.text.primary }]}>
                                        {club.weeksPaid}/52
                                    </Text>
                                </View>
                                <View style={styles.clubDetail}>
                                    <Text style={[styles.clubDetailLabel, { color: colors.text.muted }]}>
                                        Balance
                                    </Text>
                                    <Text style={[
                                        styles.clubDetailValue,
                                        { color: club.balanceAmount >= 0 ? colors.status.success : colors.status.error }
                                    ]}>
                                        ${club.balanceAmount.toFixed(2)}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    greeting: {
        fontSize: 14,
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
    },
    notificationBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    notificationBadgeText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: '700',
    },

    // Member Card
    memberCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
    },
    memberCardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    memberInfo: {
        flex: 1,
    },
    memberLabel: {
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 8,
    },
    memberName: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    memberId: {
        fontSize: 14,
    },
    qrContainer: {
        padding: 8,
        borderRadius: 12,
    },
    memberHint: {
        fontSize: 11,
        textAlign: 'center',
        marginTop: 16,
    },

    // Stats
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 11,
        marginTop: 4,
        textAlign: 'center',
    },

    // Actions
    actionsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    actionBtn: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionText: {
        fontSize: 12,
        fontWeight: '600',
    },

    // Section
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    seeAll: {
        fontSize: 14,
        fontWeight: '600',
    },

    // Empty
    emptyCard: {
        padding: 32,
        borderRadius: 16,
        alignItems: 'center',
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
    },

    // Club Card
    clubCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    clubHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    clubContract: {
        fontSize: 16,
        fontWeight: '700',
    },
    clubStatus: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    clubStatusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    clubDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    clubDetail: {
        alignItems: 'center',
    },
    clubDetailLabel: {
        fontSize: 11,
        marginBottom: 4,
    },
    clubDetailValue: {
        fontSize: 16,
        fontWeight: '700',
    },
});
