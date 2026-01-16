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
import { useTheme } from '../../src/contexts/ThemeContext';
import { CustomerStatus } from '../../src/types/clubs';
import { SkeletonList } from '../../src/components/ui/Skeleton';

export default function CustomersScreen() {
    const { colors } = useTheme();
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
            return <SkeletonList count={6} type="customer" />;
        }

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={64} color={colors.text.muted} />
                <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>No hay clientes</Text>
                <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
                    {filters.search
                        ? 'No se encontraron clientes con ese criterio'
                        : 'Comienza agregando tu primer cliente'}
                </Text>
                {!filters.search && (
                    <TouchableOpacity style={[styles.emptyButton, { backgroundColor: colors.accent.blue }]} onPress={handleCreateCustomer}>
                        <Text style={[styles.emptyButtonText, { color: colors.white }]}>Agregar Cliente</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderFooter = () => {
        if (!isLoading || customers.length === 0) return null;

        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color={colors.accent.blue} />
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg.primary }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.bg.card, borderBottomColor: colors.border.default }]}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Clientes</Text>
                        <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>
                            {total} {total === 1 ? 'cliente' : 'clientes'} registrados
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
                    </TouchableOpacity>
                </View>

                {/* Barra de búsqueda */}
                <View style={styles.searchContainer}>
                    <View style={[styles.searchInputContainer, { backgroundColor: colors.bg.elevated }]}>
                        <Ionicons name="search" size={20} color={colors.text.muted} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text.primary }]}
                            placeholder="Buscar por nombre, email o documento..."
                            placeholderTextColor={colors.text.muted}
                            value={searchText}
                            onChangeText={setSearchText}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                        />
                        {searchText.length > 0 && (
                            <TouchableOpacity onPress={handleClearSearch}>
                                <Ionicons name="close-circle" size={20} color={colors.text.muted} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Panel de filtros */}
                {showFilters && (
                    <View style={styles.filtersPanel}>
                        <Text style={[styles.filterLabel, { color: colors.text.secondary }]}>Estado:</Text>
                        <View style={styles.filterButtons}>
                            <TouchableOpacity
                                style={[
                                    styles.filterChip,
                                    { backgroundColor: colors.bg.elevated, borderColor: colors.border.default },
                                    !filters.status && { backgroundColor: colors.accent.blue, borderColor: colors.accent.blue },
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
                                    filters.status === 'active' && { backgroundColor: colors.accent.blue, borderColor: colors.accent.blue },
                                ]}
                                onPress={() => handleFilterStatus('active')}
                            >
                                <View
                                    style={[styles.filterDot, { backgroundColor: colors.status.success }]}
                                />
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        { color: colors.text.secondary },
                                        filters.status === 'active' && { color: colors.white },
                                    ]}
                                >
                                    Activos
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.filterChip,
                                    { backgroundColor: colors.bg.elevated, borderColor: colors.border.default },
                                    filters.status === 'suspended' && { backgroundColor: colors.accent.blue, borderColor: colors.accent.blue },
                                ]}
                                onPress={() => handleFilterStatus('suspended')}
                            >
                                <View
                                    style={[styles.filterDot, { backgroundColor: colors.status.warning }]}
                                />
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        { color: colors.text.secondary },
                                        filters.status === 'suspended' && { color: colors.white },
                                    ]}
                                >
                                    Suspendidos
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.filterChip,
                                    { backgroundColor: colors.bg.elevated, borderColor: colors.border.default },
                                    filters.status === 'inactive' && { backgroundColor: colors.accent.blue, borderColor: colors.accent.blue },
                                ]}
                                onPress={() => handleFilterStatus('inactive')}
                            >
                                <View
                                    style={[styles.filterDot, { backgroundColor: colors.text.muted }]}
                                />
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        { color: colors.text.secondary },
                                        filters.status === 'inactive' && { color: colors.white },
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
                <View style={[styles.errorContainer, { backgroundColor: colors.status.errorBg }]}>
                    <Ionicons name="alert-circle" size={20} color={colors.status.error} />
                    <Text style={[styles.errorText, { color: colors.status.error }]}>{error}</Text>
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
                        tintColor={colors.accent.blue}
                    />
                }
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
            />

            {/* FAB - Agregar cliente */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.accent.blue }]}
                onPress={handleCreateCustomer}
                activeOpacity={0.85}
            >
                <Ionicons name="person-add" size={24} color={colors.white} />
            </TouchableOpacity>
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
    },

    // Search
    searchContainer: {
        marginBottom: 12,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
    },

    // Filters
    filtersPanel: {
        paddingTop: 12,
        paddingBottom: 4,
    },
    filterLabel: {
        fontSize: 13,
        fontWeight: '600',
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
});
