// app/(tabs)/my-clubs.tsx - Clubes del cliente
import { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuthStore } from '../../src/stores/auth-store';
import { getClubsByCustomer } from '../../src/api/clubs.api';
import type { Club } from '../../src/types/clubs';

export default function MyClubsScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const user = useAuthStore((state) => state.user);

    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [clubs, setClubs] = useState<Club[]>([]);
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

    const loadClubs = useCallback(async () => {
        if (!user?.customerId) {
            setIsLoading(false);
            return;
        }

        try {
            const customerClubs = await getClubsByCustomer(user.customerId);
            setClubs(customerClubs);
        } catch (error) {
            console.error('Error loading clubs:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [user?.customerId]);

    useEffect(() => {
        loadClubs();
    }, [loadClubs]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadClubs();
    }, [loadClubs]);

    const filteredClubs = clubs.filter((club) => {
        if (filter === 'all') return true;
        const isActive = club.statusName.toLowerCase() === 'activo' || club.statusName.toLowerCase() === 'active';
        return filter === 'active' ? isActive : !isActive;
    });

    const renderClubCard = ({ item: club }: { item: Club }) => {
        const isActive = club.statusName.toLowerCase() === 'activo' || club.statusName.toLowerCase() === 'active';
        const progressPercent = Math.min((club.weeksPaid / 52) * 100, 100);

        return (
            <TouchableOpacity
                style={[styles.clubCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}
                onPress={() => router.push(`/club/${club.clubId}`)}
                activeOpacity={0.7}
            >
                {/* Header */}
                <View style={styles.clubHeader}>
                    <View style={styles.clubTitleRow}>
                        <Text style={[styles.clubContract, { color: colors.text.primary }]}>
                            #{club.contractNumber}
                        </Text>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: isActive ? colors.status.successBg : colors.status.warningBg }
                        ]}>
                            <View style={[
                                styles.statusDot,
                                { backgroundColor: isActive ? colors.status.success : colors.status.warning }
                            ]} />
                            <Text style={[
                                styles.statusText,
                                { color: isActive ? colors.status.success : colors.status.warning }
                            ]}>
                                {club.statusName}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.shareBox, { backgroundColor: colors.bg.elevated }]}>
                        <Text style={[styles.shareLabel, { color: colors.text.muted }]}>Acción</Text>
                        <Text style={[styles.shareValue, { color: colors.brand.primary }]}>{club.share}</Text>
                    </View>
                </View>

                {/* Tipo de club */}
                <Text style={[styles.clubType, { color: colors.text.secondary }]}>
                    Club de Mercancías
                </Text>

                {/* Barra de progreso */}
                <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                        <Text style={[styles.progressLabel, { color: colors.text.secondary }]}>
                            Progreso de pago
                        </Text>
                        <Text style={[styles.progressValue, { color: colors.text.primary }]}>
                            {club.weeksPaid}/52 semanas
                        </Text>
                    </View>
                    <View style={[styles.progressBar, { backgroundColor: colors.border.default }]}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${progressPercent}%`,
                                    backgroundColor: colors.brand.primary
                                }
                            ]}
                        />
                    </View>
                </View>

                {/* Footer con balance */}
                <View style={[styles.clubFooter, { borderTopColor: colors.border.light }]}>
                    <View style={styles.footerItem}>
                        <Ionicons name="calendar" size={16} color={colors.text.muted} />
                        <Text style={[styles.footerLabel, { color: colors.text.muted }]}>
                            Pagado: ${club.paidAmount.toFixed(2)}
                        </Text>
                    </View>
                    <View style={styles.balanceSection}>
                        <Text style={[styles.balanceLabel, { color: colors.text.muted }]}>Balance</Text>
                        <Text style={[
                            styles.balanceValue,
                            { color: club.balanceAmount >= 0 ? colors.status.success : colors.status.error }
                        ]}>
                            ${club.balanceAmount.toFixed(2)}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderHeader = () => (
        <View style={styles.headerSection}>
            {/* Título */}
            <Text style={[styles.pageTitle, { color: colors.text.primary }]}>Mis Clubes</Text>
            <Text style={[styles.pageSubtitle, { color: colors.text.secondary }]}>
                {clubs.length} {clubs.length === 1 ? 'club registrado' : 'clubes registrados'}
            </Text>

            {/* Filtros */}
            <View style={styles.filterRow}>
                {(['all', 'active', 'inactive'] as const).map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[
                            styles.filterBtn,
                            { backgroundColor: colors.bg.card, borderColor: colors.border.default },
                            filter === f && { backgroundColor: colors.brand.primary, borderColor: colors.brand.primary }
                        ]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[
                            styles.filterText,
                            { color: colors.text.secondary },
                            filter === f && { color: colors.white }
                        ]}>
                            {f === 'all' ? 'Todos' : f === 'active' ? 'Activos' : 'Inactivos'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View style={[styles.emptyContainer, { backgroundColor: colors.bg.card }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.brand.primary + '15' }]}>
                <Ionicons name="wallet-outline" size={48} color={colors.brand.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
                No tienes clubes
            </Text>
            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                {filter === 'all'
                    ? 'Aún no tienes clubes registrados'
                    : filter === 'active'
                        ? 'No tienes clubes activos'
                        : 'No tienes clubes inactivos'
                }
            </Text>
        </View>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.primary }]} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.brand.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.primary }]} edges={['top']}>
            <FlatList
                data={filteredClubs}
                keyExtractor={(item) => item.clubId}
                renderItem={renderClubCard}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.brand.primary}
                    />
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },

    // Header
    headerSection: {
        marginBottom: 20,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: '700',
    },
    pageSubtitle: {
        fontSize: 14,
        marginTop: 4,
        marginBottom: 16,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 10,
    },
    filterBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '500',
    },

    // Club Card
    clubCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    clubHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    clubTitleRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    clubContract: {
        fontSize: 18,
        fontWeight: '700',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    shareBox: {
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
    },
    shareLabel: {
        fontSize: 10,
        marginBottom: 2,
    },
    shareValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    clubType: {
        fontSize: 13,
        marginBottom: 12,
    },

    // Progress
    progressSection: {
        marginBottom: 12,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    progressLabel: {
        fontSize: 12,
    },
    progressValue: {
        fontSize: 12,
        fontWeight: '600',
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },

    // Footer
    clubFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    footerLabel: {
        fontSize: 12,
    },
    balanceSection: {
        alignItems: 'flex-end',
    },
    balanceLabel: {
        fontSize: 11,
    },
    balanceValue: {
        fontSize: 18,
        fontWeight: '700',
    },

    // Empty
    emptyContainer: {
        padding: 40,
        borderRadius: 20,
        alignItems: 'center',
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
    },
});
