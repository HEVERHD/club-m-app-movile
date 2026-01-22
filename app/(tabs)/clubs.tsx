// ============================================================
// ARCHIVO 10: app/(tabs)/clubs.tsx - PANTALLA REFACTORIZADA
// ============================================================

import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, RefreshControl, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { CreateClubModal } from '../../src/components/clubs/CreateClubModal';
import { useTheme } from '../../src/contexts/ThemeContext';
import type { Club, ClubFilters as IClubFilters } from '../../src/types/clubs';
import { useClubs } from '../../src/hooks/useClubs';
import { ClubFilters } from '../../src/components/clubs/ClubFilters';
import { ClubCard } from '../../src/components/clubs/ClubCard';
import { SkeletonList } from '../../src/components/ui/Skeleton';

export default function ClubsScreen() {
    const { colors } = useTheme();
    // Inicializar sin filtro de status para mostrar todos los clubes
    const [filters, setFilters] = useState<IClubFilters>({});
    const [page, setPage] = useState(1);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchText, setSearchText] = useState('');

    const { data, isLoading, isFetching, refetch } = useClubs(filters, page, 20);

    const handleRefresh = useCallback(() => {
        setPage(1);
        refetch();
    }, [refetch]);

    const handleFilterChange = useCallback((newFilters: IClubFilters) => {
        setFilters(newFilters);
        setPage(1);
    }, []);

    const handleSearch = useCallback((text: string) => {
        setSearchText(text);
        setFilters(prev => ({ ...prev, search: text.trim() || undefined }));
        setPage(1);
    }, []);

    const handleClubPress = useCallback((club: Club) => {
        // Pasar datos del club para evitar re-fetch innecesario
        router.push({
            pathname: `/club/${club.clubId}`,
            params: { clubData: JSON.stringify(club) },
        });
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
            <View style={[styles.container, { backgroundColor: colors.bg.primary }]}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Mis Clubes</Text>
                        <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>Cargando...</Text>
                    </View>
                </View>

                {/* Search Bar placeholder */}
                <View style={[styles.searchContainer, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                    <Ionicons name="search" size={20} color={colors.text.secondary} style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text.primary }]}
                        placeholder="Buscar por cédula, nombre, contrato..."
                        placeholderTextColor={colors.text.muted}
                        editable={false}
                    />
                </View>

                {/* Filters placeholder */}
                <ClubFilters filters={filters} onChange={handleFilterChange} />

                {/* Skeleton List */}
                <SkeletonList count={6} type="club" />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.bg.primary }]}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Mis Clubes</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>
                        {data?.total || 0} clubes encontrados
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.refreshBtn, { backgroundColor: colors.bg.card, borderColor: colors.border.default }, isFetching && styles.refreshBtnDisabled]}
                    onPress={handleRefresh}
                    disabled={isFetching}
                >
                    <Ionicons name="refresh" size={18} color={isFetching ? colors.text.muted : colors.brand.primary} />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                <Ionicons name="search" size={20} color={colors.text.secondary} style={styles.searchIcon} />
                <TextInput
                    style={[styles.searchInput, { color: colors.text.primary }]}
                    placeholder="Buscar por cédula, nombre, contrato..."
                    placeholderTextColor={colors.text.muted}
                    value={searchText}
                    onChangeText={handleSearch}
                    returnKeyType="search"
                />
                {searchText.length > 0 && (
                    <TouchableOpacity
                        onPress={() => handleSearch('')}
                        style={styles.clearButton}
                    >
                        <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
                    </TouchableOpacity>
                )}
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
                        tintColor={colors.brand.primary}
                    />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.3}
                ListFooterComponent={
                    isFetching && page > 1 ? (
                        <ActivityIndicator style={styles.footer} color={colors.brand.primary} />
                    ) : null
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={[styles.emptyIcon, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                            <Ionicons name="folder-open-outline" size={40} color={colors.text.muted} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>No hay clubes</Text>
                        <Text style={[styles.emptySubtitle, { color: colors.text.muted }]}>Crea tu primer club para comenzar</Text>
                        <TouchableOpacity style={[styles.emptyBtn, { backgroundColor: colors.brand.primary }]} onPress={() => setShowCreateModal(true)}>
                            <Ionicons name="add" size={18} color={colors.white} />
                            <Text style={[styles.emptyBtnText, { color: colors.white }]}>Nuevo Club</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            {/* FAB */}
            <TouchableOpacity style={[styles.fab, { backgroundColor: colors.brand.primary, shadowColor: colors.brand.primary }]} onPress={() => setShowCreateModal(true)}>
                <Ionicons name="add" size={26} color={colors.white} />
            </TouchableOpacity>

            {/* Create Modal */}
            <CreateClubModal visible={showCreateModal} onClose={() => setShowCreateModal(false)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
    headerTitle: { fontSize: 24, fontWeight: '700' },
    headerSubtitle: { fontSize: 13, marginTop: 4 },
    refreshBtn: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    refreshBtnDisabled: { opacity: 0.6 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 4, marginBottom: 12, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1 },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 15, paddingVertical: 12, fontWeight: '500' },
    clearButton: { marginLeft: 8, padding: 4 },
    listContent: { paddingHorizontal: 20, paddingBottom: 100 },
    footer: { paddingVertical: 20 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingContent: { alignItems: 'center' },
    loadingIcon: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1 },
    loadingTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    loadingSubtitle: { fontSize: 13 },
    emptyContainer: { alignItems: 'center', paddingVertical: 60 },
    emptyIcon: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1 },
    emptyTitle: { fontSize: 17, fontWeight: '600', marginBottom: 4 },
    emptySubtitle: { fontSize: 14, marginBottom: 24 },
    emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
    emptyBtnText: { fontSize: 14, fontWeight: '600' },
    fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
});