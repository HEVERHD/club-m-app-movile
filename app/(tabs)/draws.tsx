// app/(tabs)/draws.tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    RefreshControl,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDrawStore } from '../../src/stores/draw-store';
import { DrawCard } from '../../src/components/draws/DrawCard';
import { useTheme } from '../../src/contexts/ThemeContext';
import { CustomAlert } from '../../src/components/ui/CustomAlert';
import { useAlert } from '../../src/hooks/useAlert';
import type { DrawFilters } from '../../src/types/clubs';
// Importar funciones de debug para poder usarlas en consola
import '../../src/utils/debugDrawWinners';

export default function DrawsScreen() {
    const { colors } = useTheme();
    const alert = useAlert();
    const {
        draws,
        pagination,
        isLoading,
        error,
        filters,
        fetchDraws,
        setFilters,
        clearError,
    } = useDrawStore();

    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchDraws();
    }, []);

    useEffect(() => {
        if (filters) {
            fetchDraws(filters, 1);
        }
    }, [filters]);

    const handleRefresh = async () => {
        await fetchDraws(filters, 1);
    };

    const handleLoadMore = () => {
        if (pagination.page < pagination.totalPages && !isLoading) {
            fetchDraws(filters, pagination.page + 1);
        }
    };

    const handleFilterStatus = (status?: 'pending' | 'completed' | 'cancelled') => {
        setFilters({ ...filters, status });
        setShowFilters(false);
    };

    const handleFilterClubType = (clubTypeId?: string) => {
        setFilters({ ...filters, clubTypeId });
        setShowFilters(false);
    };

    const handleClearFilters = () => {
        setFilters({});
        setShowFilters(false);
    };

    const handleExecuteDraw = () => {
        router.push('/draw/execute');
    };

    const handleViewWinnersReport = () => {
        router.push('/draw/winners-report');
    };

    const renderEmpty = () => {
        if (isLoading && draws.length === 0) {
            return null;
        }

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="trophy-outline" size={64} color={colors.text.muted} />
                <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>No hay sorteos registrados</Text>
                <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
                    {filters.status || filters.clubTypeId
                        ? 'No se encontraron sorteos con ese criterio'
                        : 'Ejecuta tu primer sorteo para comenzar'}
                </Text>
                {!filters.status && !filters.clubTypeId && (
                    <TouchableOpacity style={[styles.emptyButton, { backgroundColor: colors.brand.primary }]} onPress={handleExecuteDraw}>
                        <Text style={[styles.emptyButtonText, { color: colors.white }]}>Ejecutar Sorteo</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderFooter = () => {
        if (!isLoading || draws.length === 0) return null;

        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color={colors.brand.primary} />
            </View>
        );
    };

    const activeFiltersCount = [filters.status, filters.clubTypeId].filter(Boolean).length;

    return (
        <View style={[styles.container, { backgroundColor: colors.bg.primary }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.bg.card, borderBottomColor: colors.border.default }]}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Sorteos</Text>
                        <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>
                            {pagination.total} {pagination.total === 1 ? 'sorteo' : 'sorteos'} registrados
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.filterBtn, { backgroundColor: colors.bg.elevated }]}
                        onPress={() => setShowFilters(!showFilters)}
                    >
                        <Ionicons
                            name={showFilters ? 'close' : 'filter'}
                            size={20}
                            color={colors.text.primary}
                        />
                        {activeFiltersCount > 0 && (
                            <View style={[styles.filterBadge, { backgroundColor: colors.brand.primary }]}>
                                <Text style={[styles.filterBadgeText, { color: colors.white }]}>{activeFiltersCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Panel de filtros */}
                {showFilters && (
                    <View style={styles.filtersPanel}>
                        <View style={styles.filterSection}>
                            <Text style={[styles.filterLabel, { color: colors.text.secondary }]}>Estado:</Text>
                            <View style={styles.filterButtons}>
                                <TouchableOpacity
                                    style={[
                                        styles.filterChip,
                                        { backgroundColor: colors.bg.elevated, borderColor: colors.border.default },
                                        !filters.status && { backgroundColor: colors.brand.primary, borderColor: colors.brand.primary },
                                    ]}
                                    onPress={() => handleFilterStatus(undefined)}
                                >
                                    <Text
                                        style={[
                                            styles.filterChipText,
                                            { color: colors.text.secondary },
                                            !filters.status && { color: colors.white },
                                        ]}
                                    >
                                        Todos
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.filterChip,
                                        { backgroundColor: colors.bg.elevated, borderColor: colors.border.default },
                                        filters.status === 'completed' && { backgroundColor: colors.brand.primary, borderColor: colors.brand.primary },
                                    ]}
                                    onPress={() => handleFilterStatus('completed')}
                                >
                                    <View
                                        style={[
                                            styles.filterDot,
                                            { backgroundColor: colors.status.success },
                                        ]}
                                    />
                                    <Text
                                        style={[
                                            styles.filterChipText,
                                            { color: colors.text.secondary },
                                            filters.status === 'completed' && { color: colors.white },
                                        ]}
                                    >
                                        Completados
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.filterChip,
                                        { backgroundColor: colors.bg.elevated, borderColor: colors.border.default },
                                        filters.status === 'pending' && { backgroundColor: colors.brand.primary, borderColor: colors.brand.primary },
                                    ]}
                                    onPress={() => handleFilterStatus('pending')}
                                >
                                    <View
                                        style={[
                                            styles.filterDot,
                                            { backgroundColor: colors.status.warning },
                                        ]}
                                    />
                                    <Text
                                        style={[
                                            styles.filterChipText,
                                            { color: colors.text.secondary },
                                            filters.status === 'pending' && { color: colors.white },
                                        ]}
                                    >
                                        Pendientes
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.filterChip,
                                        { backgroundColor: colors.bg.elevated, borderColor: colors.border.default },
                                        filters.status === 'cancelled' && { backgroundColor: colors.brand.primary, borderColor: colors.brand.primary },
                                    ]}
                                    onPress={() => handleFilterStatus('cancelled')}
                                >
                                    <View
                                        style={[
                                            styles.filterDot,
                                            { backgroundColor: colors.status.error },
                                        ]}
                                    />
                                    <Text
                                        style={[
                                            styles.filterChipText,
                                            { color: colors.text.secondary },
                                            filters.status === 'cancelled' && { color: colors.white },
                                        ]}
                                    >
                                        Cancelados
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.filterSection}>
                            <Text style={[styles.filterLabel, { color: colors.text.secondary }]}>Tipo de Club:</Text>
                            <View style={styles.filterButtons}>
                                <TouchableOpacity
                                    style={[
                                        styles.filterChip,
                                        { backgroundColor: colors.bg.elevated, borderColor: colors.border.default },
                                        !filters.clubTypeId && { backgroundColor: colors.brand.primary, borderColor: colors.brand.primary },
                                    ]}
                                    onPress={() => handleFilterClubType(undefined)}
                                >
                                    <Text
                                        style={[
                                            styles.filterChipText,
                                            { color: colors.text.secondary },
                                            !filters.clubTypeId && { color: colors.white },
                                        ]}
                                    >
                                        Todos
                                    </Text>
                                </TouchableOpacity>

                                {/* Note: You'll need to add club types dynamically from an API or store */}
                                <TouchableOpacity
                                    style={[styles.filterChip, { backgroundColor: colors.bg.elevated, borderColor: colors.border.default }]}
                                    onPress={() => alert.show('Info', 'Filtros por tipo próximamente', undefined, 'info')}
                                >
                                    <Text style={[styles.filterChipText, { color: colors.text.secondary }]}>Miércoles</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.filterChip, { backgroundColor: colors.bg.elevated, borderColor: colors.border.default }]}
                                    onPress={() => alert.show('Info', 'Filtros por tipo próximamente', undefined, 'info')}
                                >
                                    <Text style={[styles.filterChipText, { color: colors.text.secondary }]}>Domingo</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {activeFiltersCount > 0 && (
                            <TouchableOpacity
                                style={styles.clearFiltersBtn}
                                onPress={handleClearFilters}
                            >
                                <Ionicons name="close-circle" size={16} color={colors.brand.primary} />
                                <Text style={[styles.clearFiltersText, { color: colors.brand.primary }]}>Limpiar Filtros</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>

            {/* Error */}
            {error && (
                <View style={[styles.errorContainer, { backgroundColor: colors.status.errorBg }]}>
                    <Ionicons name="alert-circle" size={20} color={colors.status.error} />
                    <Text style={[styles.errorText, { color: colors.status.error }]}>{error}</Text>
                    <TouchableOpacity onPress={clearError}>
                        <Ionicons name="close" size={20} color={colors.status.error} />
                    </TouchableOpacity>
                </View>
            )}

            {/* Lista */}
            <FlatList
                data={draws}
                renderItem={({ item }) => <DrawCard draw={item} />}
                keyExtractor={(item, index) => item.drawId || `draw-${index}-${item.date}`}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading && pagination.page === 1}
                        onRefresh={handleRefresh}
                        tintColor={colors.brand.primary}
                    />
                }
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
            />

            {/* FAB - Reporte de Ganadores */}
            <TouchableOpacity
                style={[styles.fabSecondary, { backgroundColor: colors.bg.card, borderColor: colors.accent.orange }]}
                onPress={handleViewWinnersReport}
                activeOpacity={0.85}
            >
                <Ionicons name="trophy" size={22} color={colors.accent.orange} />
            </TouchableOpacity>

            {/* FAB - Ejecutar sorteo */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.brand.primary }]}
                onPress={handleExecuteDraw}
                activeOpacity={0.85}
            >
                <Ionicons name="dice" size={24} color={colors.white} />
            </TouchableOpacity>

            {/* Custom Alert */}
            <CustomAlert
                visible={alert.visible}
                type={alert.config.type}
                title={alert.config.title}
                message={alert.config.message}
                buttons={alert.config.buttons}
                onDismiss={alert.hide}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    // Header
    header: {
        paddingTop: 56,
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    filterBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    filterBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterBadgeText: {
        fontSize: 10,
        fontWeight: '700',
    },

    // Filters
    filtersPanel: {
        paddingTop: 12,
        paddingBottom: 4,
        gap: 16,
    },
    filterSection: {
        gap: 10,
    },
    filterLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    filterButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        gap: 6,
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: '500',
    },
    filterDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    clearFiltersBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        paddingVertical: 8,
    },
    clearFiltersText: {
        fontSize: 13,
        fontWeight: '600',
    },

    // Error
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 12,
        marginHorizontal: 20,
        marginTop: 16,
        borderRadius: 12,
    },
    errorText: {
        flex: 1,
        fontSize: 13,
    },

    // List
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },

    // Empty
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    emptyButton: {
        marginTop: 24,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    emptyButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },

    // Footer
    footer: {
        paddingVertical: 20,
        alignItems: 'center',
    },

    // FAB
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 90,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    fabSecondary: {
        position: 'absolute',
        right: 20,
        bottom: 160,
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
});
