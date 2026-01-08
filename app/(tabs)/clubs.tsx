// ============================================================
// ARCHIVO 10: app/(tabs)/clubs.tsx - PANTALLA REFACTORIZADA
// ============================================================

import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { CreateClubModal } from '../../src/components/clubs/CreateClubModal';
import { COLORS } from '../../src/constants/colors';
import type { Club, ClubFilters as IClubFilters } from '../../src/types/clubs';
import { useClubs } from '../../src/hooks/useClubs';
import { ClubFilters } from '../../src/components/clubs/ClubFilters';
import { ClubCard } from '../../src/components/clubs/ClubCard';

export default function ClubsScreen() {
    const [filters, setFilters] = useState<IClubFilters>({});
    const [page, setPage] = useState(1);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { data, isLoading, isFetching, refetch } = useClubs(filters, page, 20);

    const handleRefresh = useCallback(() => {
        setPage(1);
        refetch();
    }, [refetch]);

    const handleFilterChange = useCallback((newFilters: IClubFilters) => {
        setFilters(newFilters);
        setPage(1);
    }, []);

    const handleClubPress = useCallback((club: Club) => {
        router.push(`/club/${club.clubId}`);
    }, []);

    const handleLoadMore = useCallback(() => {
        if (data && page < data.totalPages && !isFetching) {
            setPage((p) => p + 1);
        }
    }, [data, page, isFetching]);

    const renderItem = useCallback(({ item }: { item: Club }) => (
        <ClubCard club={item} onPress={() => handleClubPress(item)} />
    ), [handleClubPress]);

    const keyExtractor = useCallback((item: Club) => item.clubId, []);

    if (isLoading && page === 1) {
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.loadingContent}>
                    <View style={styles.loadingIcon}>
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
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Mis Clubes</Text>
                    <Text style={styles.headerSubtitle}>
                        {data?.total || 0} clubes encontrados
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.refreshBtn, isFetching && styles.refreshBtnDisabled]}
                    onPress={handleRefresh}
                    disabled={isFetching}
                >
                    <Ionicons name="refresh" size={18} color={isFetching ? COLORS.text.muted : COLORS.accent.blue} />
                </TouchableOpacity>
            </View>

            {/* Filters */}
            <ClubFilters filters={filters} onChange={handleFilterChange} />

            {/* List */}
            <FlatList
                data={data?.data || []}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isFetching && page === 1}
                        onRefresh={handleRefresh}
                        tintColor={COLORS.accent.blue}
                    />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.3}
                ListFooterComponent={
                    isFetching && page > 1 ? (
                        <ActivityIndicator style={styles.footer} color={COLORS.accent.blue} />
                    ) : null
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIcon}>
                            <Ionicons name="folder-open-outline" size={40} color={COLORS.text.muted} />
                        </View>
                        <Text style={styles.emptyTitle}>No hay clubes</Text>
                        <Text style={styles.emptySubtitle}>Crea tu primer club para comenzar</Text>
                        <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowCreateModal(true)}>
                            <Ionicons name="add" size={18} color={COLORS.white} />
                            <Text style={styles.emptyBtnText}>Nuevo Club</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            {/* FAB */}
            <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)}>
                <Ionicons name="add" size={26} color={COLORS.white} />
            </TouchableOpacity>

            {/* Create Modal */}
            <CreateClubModal visible={showCreateModal} onClose={() => setShowCreateModal(false)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg.primary },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
    headerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.text.primary },
    headerSubtitle: { fontSize: 13, color: COLORS.text.secondary, marginTop: 4 },
    refreshBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: COLORS.bg.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border.default },
    refreshBtnDisabled: { opacity: 0.6 },
    listContent: { paddingHorizontal: 20, paddingBottom: 100 },
    footer: { paddingVertical: 20 },
    loadingContainer: { flex: 1, backgroundColor: COLORS.bg.primary, justifyContent: 'center', alignItems: 'center' },
    loadingContent: { alignItems: 'center' },
    loadingIcon: { width: 80, height: 80, borderRadius: 24, backgroundColor: COLORS.bg.card, justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: COLORS.border.default },
    loadingTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text.primary, marginBottom: 4 },
    loadingSubtitle: { fontSize: 13, color: COLORS.text.muted },
    emptyContainer: { alignItems: 'center', paddingVertical: 60 },
    emptyIcon: { width: 80, height: 80, borderRadius: 24, backgroundColor: COLORS.bg.card, justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: COLORS.border.default },
    emptyTitle: { fontSize: 17, fontWeight: '600', color: COLORS.text.primary, marginBottom: 4 },
    emptySubtitle: { fontSize: 14, color: COLORS.text.muted, marginBottom: 24 },
    emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.accent.blue, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
    emptyBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
    fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 16, backgroundColor: COLORS.accent.blue, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.accent.blue, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
});