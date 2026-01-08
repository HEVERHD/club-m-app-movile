// app/(tabs)/clubs.tsx
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { mdl05Client } from '../../src/api/client';
import { COLORS } from '../../src/constants/colors';

interface Club {
    clubId: string;
    contractNumber: string;
    customerName: string;
    customerNumber: string;
    share: number;
    balanceAmount: number;
    statusName: string;
    createdDate: string;
}

const fetchClubs = async (): Promise<Club[]> => {
    const { data } = await mdl05Client.post('/mdl05/club/history', {
        SearchText: '',
        PageNumber: 1,
        PageSize: 20,
        Status: null,
    });

    return (data.Data || []).map((c: any) => ({
        clubId: c.ClubId,
        contractNumber: c.ContractNumber || '',
        customerName: c.CustomerName || 'Sin nombre',
        customerNumber: c.CustomerNumber || '',
        share: c.Share || 0,
        balanceAmount: c.BalanceAmount || 0,
        statusName: c.NameStatus || 'Desconocido',
        createdDate: c.CreatedDate || '',
    }));
};

const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'activo') return { bg: COLORS.status.successBg, text: COLORS.status.success, border: 'rgba(34, 197, 94, 0.3)' };
    if (s === 'anulado') return { bg: COLORS.status.errorBg, text: COLORS.status.error, border: 'rgba(239, 68, 68, 0.3)' };
    if (s === 'vencido') return { bg: COLORS.status.warningBg, text: COLORS.status.warning, border: 'rgba(245, 158, 11, 0.3)' };
    return { bg: COLORS.status.infoBg, text: COLORS.status.info, border: 'rgba(59, 130, 246, 0.3)' };
};

export default function ClubsScreen() {
    const { data: clubs, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['clubs'],
        queryFn: fetchClubs,
        staleTime: 5 * 60 * 1000,
    });

    const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

    const renderClubItem = ({ item }: { item: Club }) => {
        const status = getStatusStyle(item.statusName);

        return (
            <TouchableOpacity style={styles.clubCard} activeOpacity={0.7}>
                <View style={styles.clubHeader}>
                    <View style={styles.clubInfo}>
                        <View style={styles.contractRow}>
                            <Text style={styles.contractNumber}>#{item.contractNumber}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: status.bg, borderColor: status.border }]}>
                                <View style={[styles.statusDot, { backgroundColor: status.text }]} />
                                <Text style={[styles.statusText, { color: status.text }]}>
                                    {item.statusName}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.customerName} numberOfLines={1}>
                            {item.customerName}
                        </Text>
                        <Text style={styles.customerNumber}>{item.customerNumber}</Text>
                    </View>
                    <View style={styles.shareContainer}>
                        <Text style={styles.shareLabel}>Share</Text>
                        <Text style={styles.shareValue}>{item.share}</Text>
                    </View>
                </View>

                <View style={styles.clubFooter}>
                    <View>
                        <Text style={styles.balanceLabel}>Balance</Text>
                        <Text style={[
                            styles.balanceValue,
                            { color: item.balanceAmount < 0 ? COLORS.status.error : COLORS.accent.green }
                        ]}>
                            {formatCurrency(item.balanceAmount)}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.detailButton}>
                        <Text style={styles.detailButtonText}>Ver detalle</Text>
                        <View style={styles.detailArrow}>
                            <Ionicons name="chevron-forward" size={14} color={COLORS.accent.blue} />
                        </View>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.bg.primary} />
                <View style={styles.loadingContent}>
                    <View style={styles.loadingIconContainer}>
                        <ActivityIndicator size="large" color={COLORS.accent.blue} />
                    </View>
                    <Text style={styles.loadingTitle}>Cargando clubes...</Text>
                    <Text style={styles.loadingSubtitle}>Esto puede tardar un momento</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.bg.primary} />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Mis Clubes</Text>
                    <Text style={styles.headerSubtitle}>
                        {clubs?.length || 0} clubes encontrados
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.refreshButton, isRefetching && styles.refreshButtonDisabled]}
                    onPress={() => refetch()}
                    disabled={isRefetching}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="refresh"
                        size={18}
                        color={isRefetching ? COLORS.text.muted : COLORS.accent.blue}
                    />
                </TouchableOpacity>
            </View>

            {/* Filters */}
            <View style={styles.filtersContainer}>
                <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
                    <Text style={styles.filterChipTextActive}>Todos</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterChip}>
                    <View style={[styles.filterDot, { backgroundColor: COLORS.accent.green }]} />
                    <Text style={styles.filterChipText}>Activos</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterChip}>
                    <View style={[styles.filterDot, { backgroundColor: COLORS.accent.orange }]} />
                    <Text style={styles.filterChipText}>Vencidos</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterChip}>
                    <View style={[styles.filterDot, { backgroundColor: COLORS.status.error }]} />
                    <Text style={styles.filterChipText}>Anulados</Text>
                </TouchableOpacity>
            </View>

            {/* Club List */}
            <FlatList
                data={clubs}
                keyExtractor={(item) => item.clubId}
                renderItem={renderClubItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="folder-open-outline" size={40} color={COLORS.text.muted} />
                        </View>
                        <Text style={styles.emptyTitle}>No hay clubes</Text>
                        <Text style={styles.emptySubtitle}>Crea tu primer club para comenzar</Text>
                        <TouchableOpacity style={styles.emptyButton}>
                            <Ionicons name="add" size={18} color={COLORS.white} />
                            <Text style={styles.emptyButtonText}>Nuevo Club</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            {/* FAB */}
            <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
                <Ionicons name="add" size={26} color={COLORS.white} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg.primary,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 56,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text.primary,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 13,
        color: COLORS.text.secondary,
        marginTop: 4,
    },
    refreshButton: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: COLORS.bg.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border.default,
    },
    refreshButtonDisabled: {
        opacity: 0.6,
    },

    // Filters
    filtersContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 16,
        gap: 8,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.bg.card,
        borderWidth: 1,
        borderColor: COLORS.border.default,
        gap: 6,
    },
    filterChipActive: {
        backgroundColor: COLORS.accent.blue,
        borderColor: COLORS.accent.blue,
    },
    filterChipText: {
        fontSize: 13,
        color: COLORS.text.secondary,
        fontWeight: '500',
    },
    filterChipTextActive: {
        fontSize: 13,
        color: COLORS.white,
        fontWeight: '600',
    },
    filterDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },

    // List
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },

    // Club Card
    clubCard: {
        backgroundColor: COLORS.bg.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border.default,
    },
    clubHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    clubInfo: {
        flex: 1,
        marginRight: 12,
    },
    contractRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 6,
    },
    contractNumber: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.text.primary,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        gap: 5,
    },
    statusDot: {
        width: 5,
        height: 5,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    customerName: {
        fontSize: 14,
        color: COLORS.text.secondary,
        marginBottom: 2,
    },
    customerNumber: {
        fontSize: 12,
        color: COLORS.text.muted,
    },
    shareContainer: {
        alignItems: 'flex-end',
    },
    shareLabel: {
        fontSize: 11,
        color: COLORS.text.muted,
        marginBottom: 2,
    },
    shareValue: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.accent.blue,
    },
    clubFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 14,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: COLORS.border.default,
    },
    balanceLabel: {
        fontSize: 11,
        color: COLORS.text.muted,
        marginBottom: 2,
    },
    balanceValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    detailButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailButtonText: {
        fontSize: 13,
        color: COLORS.accent.blue,
        fontWeight: '600',
    },
    detailArrow: {
        width: 22,
        height: 22,
        borderRadius: 6,
        backgroundColor: COLORS.status.infoBg,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Loading
    loadingContainer: {
        flex: 1,
        backgroundColor: COLORS.bg.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContent: {
        alignItems: 'center',
    },
    loadingIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: COLORS.bg.card,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border.default,
    },
    loadingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: 4,
    },
    loadingSubtitle: {
        fontSize: 13,
        color: COLORS.text.muted,
    },

    // Empty
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: COLORS.bg.card,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border.default,
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: 4,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.text.muted,
        marginBottom: 24,
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.accent.blue,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    emptyButtonText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '600',
    },

    // FAB
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: COLORS.accent.blue,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.accent.blue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
});