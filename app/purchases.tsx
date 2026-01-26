// app/purchases.tsx
import { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../src/contexts/ThemeContext';
import { usePurchasesStore, usePurchasesFiltered } from '../src/stores/purchases-store';
import { PurchasesSummaryCard } from '../src/components/purchases/PurchasesSummaryCard';
import { PurchaseItem } from '../src/components/purchases/PurchaseItem';
import type { PurchaseType } from '../src/api/purchases.api';

type FilterTab = 'all' | 'payments' | 'exchanges';

export default function PurchasesScreen() {
    const { colors } = useTheme();
    const [activeTab, setActiveTab] = useState<FilterTab>('all');
    const [refreshing, setRefreshing] = useState(false);

    const { fetchPurchases, isLoading, error } = usePurchasesStore();
    const { all, payments, exchanges, others, summary, paymentsCount, exchangesCount } = usePurchasesFiltered();

    const loadPurchases = useCallback(async () => {
        await fetchPurchases();
    }, [fetchPurchases]);

    useEffect(() => {
        loadPurchases();
    }, [loadPurchases]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadPurchases();
        setRefreshing(false);
    };

    const getFilteredPurchases = () => {
        switch (activeTab) {
            case 'all':
                return all;
            case 'payments':
                return payments;
            case 'exchanges':
                return exchanges;
            default:
                return all;
        }
    };

    const filteredPurchases = getFilteredPurchases();

    const tabs: { key: FilterTab; label: string; count: number }[] = [
        { key: 'all', label: 'Todos', count: all.length },
        { key: 'payments', label: 'Pagos', count: paymentsCount },
        { key: 'exchanges', label: 'Canjes', count: exchangesCount },
    ];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.primary }]} edges={['top']}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <View style={styles.headerTitle}>
                    <Text style={[styles.title, { color: colors.text.primary }]}>Historial</Text>
                    {(summary?.totalTransactions ?? 0) > 0 && (
                        <View style={[styles.badge, { backgroundColor: '#10b981' }]}>
                            <Text style={styles.badgeText}>{summary?.totalTransactions}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.brand.primary}
                        colors={[colors.brand.primary]}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Summary Card */}
                <PurchasesSummaryCard summary={summary} />

                {/* Quick Stats */}
                <View style={styles.quickStats}>
                    <View style={[styles.quickStatCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                        <View style={[styles.quickStatIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                            <Ionicons name="wallet" size={20} color="#10b981" />
                        </View>
                        <Text style={[styles.quickStatValue, { color: '#10b981' }]}>
                            {paymentsCount}
                        </Text>
                        <Text style={[styles.quickStatLabel, { color: colors.text.tertiary }]}>
                            Pagos
                        </Text>
                    </View>
                    <View style={[styles.quickStatCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                        <View style={[styles.quickStatIcon, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                            <Ionicons name="swap-horizontal" size={20} color="#8b5cf6" />
                        </View>
                        <Text style={[styles.quickStatValue, { color: '#8b5cf6' }]}>
                            {exchangesCount}
                        </Text>
                        <Text style={[styles.quickStatLabel, { color: colors.text.tertiary }]}>
                            Canjes
                        </Text>
                    </View>
                    <View style={[styles.quickStatCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                        <View style={[styles.quickStatIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                            <Ionicons name="calendar" size={20} color="#f59e0b" />
                        </View>
                        <Text style={[styles.quickStatValue, { color: '#f59e0b' }]}>
                            {formatCurrency(summary?.thisMonthAmount ?? 0)}
                        </Text>
                        <Text style={[styles.quickStatLabel, { color: colors.text.tertiary }]}>
                            Este mes
                        </Text>
                    </View>
                </View>

                {/* Section Title */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                        Historial de Transacciones
                    </Text>
                </View>

                {/* Tabs */}
                <View style={[styles.tabsContainer, { backgroundColor: colors.bg.elevated }]}>
                    {tabs.map(tab => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[
                                styles.tab,
                                activeTab === tab.key && [styles.activeTab, { backgroundColor: colors.bg.card }],
                            ]}
                            onPress={() => setActiveTab(tab.key)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    { color: activeTab === tab.key ? colors.text.primary : colors.text.tertiary },
                                ]}
                            >
                                {tab.label}
                            </Text>
                            <View
                                style={[
                                    styles.tabBadge,
                                    {
                                        backgroundColor:
                                            activeTab === tab.key
                                                ? 'rgba(16, 185, 129, 0.15)'
                                                : colors.bg.elevated,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.tabBadgeText,
                                        { color: activeTab === tab.key ? '#10b981' : colors.text.tertiary },
                                    ]}
                                >
                                    {tab.count}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Loading State */}
                {isLoading && !refreshing && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.brand.primary} />
                        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
                            Cargando historial...
                        </Text>
                    </View>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <View style={[styles.emptyContainer, { backgroundColor: colors.bg.card }]}>
                        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
                        <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>Error</Text>
                        <Text style={[styles.emptyText, { color: colors.text.secondary }]}>{error}</Text>
                        <TouchableOpacity
                            style={[styles.retryButton, { backgroundColor: colors.brand.primary }]}
                            onPress={loadPurchases}
                        >
                            <Text style={styles.retryButtonText}>Reintentar</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Empty State */}
                {!isLoading && !error && filteredPurchases.length === 0 && (
                    <View style={[styles.emptyContainer, { backgroundColor: colors.bg.card }]}>
                        <Ionicons name="receipt-outline" size={48} color={colors.text.tertiary} />
                        <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
                            Sin transacciones
                        </Text>
                        <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                            {activeTab === 'all'
                                ? 'Aun no tienes transacciones registradas'
                                : activeTab === 'payments'
                                ? 'Aun no tienes pagos registrados'
                                : 'Aun no tienes canjes registrados'}
                        </Text>
                    </View>
                )}

                {/* Purchases List */}
                {!isLoading && !error && filteredPurchases.length > 0 && (
                    <View style={styles.listContainer}>
                        {filteredPurchases.map(purchase => (
                            <PurchaseItem key={purchase.id} purchase={purchase} />
                        ))}
                    </View>
                )}

                {/* Bottom Padding */}
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '700',
    },
    placeholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    quickStats: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    quickStatCard: {
        flex: 1,
        borderRadius: 14,
        borderWidth: 1,
        padding: 14,
        alignItems: 'center',
    },
    quickStatIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickStatValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    quickStatLabel: {
        fontSize: 11,
        marginTop: 2,
    },
    sectionHeader: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
    },
    tabsContainer: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 6,
    },
    activeTab: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    tabBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    tabBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 14,
    },
    emptyContainer: {
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: '600',
        marginTop: 16,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
    },
    retryButton: {
        marginTop: 20,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    listContainer: {
        gap: 0,
    },
});
