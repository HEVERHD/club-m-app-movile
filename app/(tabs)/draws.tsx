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
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDrawStore } from '../../src/stores/draw-store';
import { DrawCard } from '../../src/components/draws/DrawCard';
import { COLORS } from '../../src/constants/colors';
import type { DrawFilters } from '../../src/types/clubs';
// Importar funciones de debug para poder usarlas en consola
import '../../src/utils/debugDrawWinners';

export default function DrawsScreen() {
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

    const renderEmpty = () => {
        if (isLoading && draws.length === 0) {
            return null;
        }

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="trophy-outline" size={64} color={COLORS.text.muted} />
                <Text style={styles.emptyTitle}>No hay sorteos registrados</Text>
                <Text style={styles.emptySubtitle}>
                    {filters.status || filters.clubTypeId
                        ? 'No se encontraron sorteos con ese criterio'
                        : 'Ejecuta tu primer sorteo para comenzar'}
                </Text>
                {!filters.status && !filters.clubTypeId && (
                    <TouchableOpacity style={styles.emptyButton} onPress={handleExecuteDraw}>
                        <Text style={styles.emptyButtonText}>Ejecutar Sorteo</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderFooter = () => {
        if (!isLoading || draws.length === 0) return null;

        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color={COLORS.accent.blue} />
            </View>
        );
    };

    const activeFiltersCount = [filters.status, filters.clubTypeId].filter(Boolean).length;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.headerTitle}>Sorteos</Text>
                        <Text style={styles.headerSubtitle}>
                            {pagination.total} {pagination.total === 1 ? 'sorteo' : 'sorteos'} registrados
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.filterBtn}
                        onPress={() => setShowFilters(!showFilters)}
                    >
                        <Ionicons
                            name={showFilters ? 'close' : 'filter'}
                            size={20}
                            color={COLORS.text.primary}
                        />
                        {activeFiltersCount > 0 && (
                            <View style={styles.filterBadge}>
                                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Panel de filtros */}
                {showFilters && (
                    <View style={styles.filtersPanel}>
                        <View style={styles.filterSection}>
                            <Text style={styles.filterLabel}>Estado:</Text>
                            <View style={styles.filterButtons}>
                                <TouchableOpacity
                                    style={[
                                        styles.filterChip,
                                        !filters.status && styles.filterChipActive,
                                    ]}
                                    onPress={() => handleFilterStatus(undefined)}
                                >
                                    <Text
                                        style={[
                                            styles.filterChipText,
                                            !filters.status && styles.filterChipTextActive,
                                        ]}
                                    >
                                        Todos
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.filterChip,
                                        filters.status === 'completed' && styles.filterChipActive,
                                    ]}
                                    onPress={() => handleFilterStatus('completed')}
                                >
                                    <View
                                        style={[
                                            styles.filterDot,
                                            { backgroundColor: COLORS.status.successText },
                                        ]}
                                    />
                                    <Text
                                        style={[
                                            styles.filterChipText,
                                            filters.status === 'completed' &&
                                                styles.filterChipTextActive,
                                        ]}
                                    >
                                        Completados
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.filterChip,
                                        filters.status === 'pending' && styles.filterChipActive,
                                    ]}
                                    onPress={() => handleFilterStatus('pending')}
                                >
                                    <View
                                        style={[
                                            styles.filterDot,
                                            { backgroundColor: COLORS.status.warningText },
                                        ]}
                                    />
                                    <Text
                                        style={[
                                            styles.filterChipText,
                                            filters.status === 'pending' &&
                                                styles.filterChipTextActive,
                                        ]}
                                    >
                                        Pendientes
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.filterChip,
                                        filters.status === 'cancelled' && styles.filterChipActive,
                                    ]}
                                    onPress={() => handleFilterStatus('cancelled')}
                                >
                                    <View
                                        style={[
                                            styles.filterDot,
                                            { backgroundColor: COLORS.status.errorText },
                                        ]}
                                    />
                                    <Text
                                        style={[
                                            styles.filterChipText,
                                            filters.status === 'cancelled' &&
                                                styles.filterChipTextActive,
                                        ]}
                                    >
                                        Cancelados
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.filterSection}>
                            <Text style={styles.filterLabel}>Tipo de Club:</Text>
                            <View style={styles.filterButtons}>
                                <TouchableOpacity
                                    style={[
                                        styles.filterChip,
                                        !filters.clubTypeId && styles.filterChipActive,
                                    ]}
                                    onPress={() => handleFilterClubType(undefined)}
                                >
                                    <Text
                                        style={[
                                            styles.filterChipText,
                                            !filters.clubTypeId && styles.filterChipTextActive,
                                        ]}
                                    >
                                        Todos
                                    </Text>
                                </TouchableOpacity>

                                {/* Note: You'll need to add club types dynamically from an API or store */}
                                <TouchableOpacity
                                    style={[styles.filterChip]}
                                    onPress={() => Alert.alert('Info', 'Filtros por tipo próximamente')}
                                >
                                    <Text style={[styles.filterChipText]}>Miércoles</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.filterChip]}
                                    onPress={() => Alert.alert('Info', 'Filtros por tipo próximamente')}
                                >
                                    <Text style={[styles.filterChipText]}>Domingo</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {activeFiltersCount > 0 && (
                            <TouchableOpacity
                                style={styles.clearFiltersBtn}
                                onPress={handleClearFilters}
                            >
                                <Ionicons name="close-circle" size={16} color={COLORS.accent.blue} />
                                <Text style={styles.clearFiltersText}>Limpiar Filtros</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>

            {/* Error */}
            {error && (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={20} color={COLORS.status.error} />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={clearError}>
                        <Ionicons name="close" size={20} color={COLORS.status.error} />
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
                        tintColor={COLORS.accent.blue}
                    />
                }
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
            />

            {/* FAB - Ejecutar sorteo */}
            <TouchableOpacity
                style={styles.fab}
                onPress={handleExecuteDraw}
                activeOpacity={0.85}
            >
                <Ionicons name="dice" size={24} color={COLORS.white} />
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
        backgroundColor: COLORS.bg.card,
        paddingTop: 56,
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.default,
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
        color: COLORS.text.primary,
    },
    headerSubtitle: {
        fontSize: 14,
        color: COLORS.text.secondary,
        marginTop: 2,
    },
    filterBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: COLORS.bg.elevated,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    filterBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: COLORS.accent.blue,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.white,
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
        color: COLORS.text.secondary,
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
        backgroundColor: COLORS.bg.elevated,
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
        fontWeight: '500',
        color: COLORS.text.secondary,
    },
    filterChipTextActive: {
        color: COLORS.white,
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
        color: COLORS.accent.blue,
    },

    // Error
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: COLORS.status.errorBg,
        padding: 12,
        marginHorizontal: 20,
        marginTop: 16,
        borderRadius: 12,
    },
    errorText: {
        flex: 1,
        fontSize: 13,
        color: COLORS.status.error,
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
        color: COLORS.text.primary,
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.text.secondary,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    emptyButton: {
        marginTop: 24,
        backgroundColor: COLORS.accent.blue,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    emptyButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.white,
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
        backgroundColor: COLORS.accent.blue,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
