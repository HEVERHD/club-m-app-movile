// app/(tabs)/customers.tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    RefreshControl,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCustomerStore } from '../../src/stores/customer-store';
import { CustomerCard } from '../../src/components/customers/CustomerCard';
import { COLORS } from '../../src/constants/colors';
import { CustomerStatus } from '../../src/types/clubs';

export default function CustomersScreen() {
    const {
        customers,
        total,
        page,
        totalPages,
        isLoading,
        error,
        filters,
        fetchCustomers,
        setFilters,
        clearFilters,
        refreshCustomers,
        setPage,
    } = useCustomerStore();

    const [searchText, setSearchText] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleSearch = () => {
        setFilters({ search: searchText });
    };

    const handleClearSearch = () => {
        setSearchText('');
        setFilters({ search: '' });
    };

    const handleRefresh = async () => {
        await refreshCustomers();
    };

    const handleLoadMore = () => {
        if (page < totalPages && !isLoading) {
            setPage(page + 1);
        }
    };

    const handleFilterStatus = (status?: CustomerStatus) => {
        setFilters({ status });
        setShowFilters(false);
    };

    const handleCreateCustomer = () => {
        router.push('/customer/create');
    };

    const renderEmpty = () => {
        if (isLoading && customers.length === 0) {
            return null;
        }

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={64} color={COLORS.text.muted} />
                <Text style={styles.emptyTitle}>No hay clientes</Text>
                <Text style={styles.emptySubtitle}>
                    {filters.search
                        ? 'No se encontraron clientes con ese criterio'
                        : 'Comienza agregando tu primer cliente'}
                </Text>
                {!filters.search && (
                    <TouchableOpacity style={styles.emptyButton} onPress={handleCreateCustomer}>
                        <Text style={styles.emptyButtonText}>Agregar Cliente</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderFooter = () => {
        if (!isLoading || customers.length === 0) return null;

        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color={COLORS.accent.blue} />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.headerTitle}>Clientes</Text>
                        <Text style={styles.headerSubtitle}>
                            {total} {total === 1 ? 'cliente' : 'clientes'} registrados
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
                    </TouchableOpacity>
                </View>

                {/* Barra de búsqueda */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputContainer}>
                        <Ionicons name="search" size={20} color={COLORS.text.muted} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar por nombre, email o documento..."
                            placeholderTextColor={COLORS.text.muted}
                            value={searchText}
                            onChangeText={setSearchText}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                        />
                        {searchText.length > 0 && (
                            <TouchableOpacity onPress={handleClearSearch}>
                                <Ionicons name="close-circle" size={20} color={COLORS.text.muted} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Panel de filtros */}
                {showFilters && (
                    <View style={styles.filtersPanel}>
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
                                    filters.status === 'active' && styles.filterChipActive,
                                ]}
                                onPress={() => handleFilterStatus('active')}
                            >
                                <View
                                    style={[styles.filterDot, { backgroundColor: COLORS.status.success }]}
                                />
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        filters.status === 'active' && styles.filterChipTextActive,
                                    ]}
                                >
                                    Activos
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.filterChip,
                                    filters.status === 'suspended' && styles.filterChipActive,
                                ]}
                                onPress={() => handleFilterStatus('suspended')}
                            >
                                <View
                                    style={[styles.filterDot, { backgroundColor: COLORS.status.warning }]}
                                />
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        filters.status === 'suspended' && styles.filterChipTextActive,
                                    ]}
                                >
                                    Suspendidos
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.filterChip,
                                    filters.status === 'inactive' && styles.filterChipActive,
                                ]}
                                onPress={() => handleFilterStatus('inactive')}
                            >
                                <View
                                    style={[styles.filterDot, { backgroundColor: COLORS.text.muted }]}
                                />
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        filters.status === 'inactive' && styles.filterChipTextActive,
                                    ]}
                                >
                                    Inactivos
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>

            {/* Error */}
            {error && (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={20} color={COLORS.status.error} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {/* Lista */}
            <FlatList
                data={customers}
                renderItem={({ item }) => <CustomerCard customer={item} />}
                keyExtractor={(item) => item.customerId}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading && page === 1}
                        onRefresh={handleRefresh}
                        tintColor={COLORS.accent.blue}
                    />
                }
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
            />

            {/* FAB - Agregar cliente */}
            <TouchableOpacity
                style={styles.fab}
                onPress={handleCreateCustomer}
                activeOpacity={0.85}
            >
                <Ionicons name="person-add" size={24} color={COLORS.white} />
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
    },

    // Search
    searchContainer: {
        marginBottom: 12,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bg.elevated,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: COLORS.text.primary,
    },

    // Filters
    filtersPanel: {
        paddingTop: 12,
        paddingBottom: 4,
    },
    filterLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.text.secondary,
        marginBottom: 10,
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
