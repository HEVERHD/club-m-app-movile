/**
 * Purchases Store - Zustand State Management
 * Manages customer purchase/transaction history with persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    Purchase,
    PurchasesSummary,
    PurchaseFilters,
    PurchaseType,
    getPurchases,
} from '../api/purchases.api';

// ============ TYPES ============

interface PurchasesState {
    // Data
    summary: PurchasesSummary | null;
    purchases: Purchase[];
    filters: PurchaseFilters;

    // UI State
    isLoading: boolean;
    error: string | null;
    lastFetched: number | null;

    // Actions
    fetchPurchases: (customerId?: string) => Promise<void>;
    setFilters: (filters: Partial<PurchaseFilters>) => void;
    clearFilters: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

// ============ INITIAL STATE ============

const initialFilters: PurchaseFilters = {};

const initialState = {
    summary: null,
    purchases: [],
    filters: initialFilters,
    isLoading: false,
    error: null,
    lastFetched: null,
};

// ============ STORE ============

export const usePurchasesStore = create<PurchasesState>()(
    persist(
        (set, get) => ({
            ...initialState,

            fetchPurchases: async (customerId?: string) => {
                set({ isLoading: true, error: null });

                try {
                    const filters = get().filters;
                    const response = await getPurchases(customerId, filters);

                    set({
                        summary: response.summary,
                        purchases: response.purchases,
                        isLoading: false,
                        lastFetched: Date.now(),
                    });
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Error al cargar historial';
                    set({ error: message, isLoading: false });
                }
            },

            setFilters: (newFilters: Partial<PurchaseFilters>) => {
                set(state => ({
                    filters: { ...state.filters, ...newFilters },
                }));
            },

            clearFilters: () => {
                set({ filters: initialFilters });
            },

            setLoading: (loading: boolean) => {
                set({ isLoading: loading });
            },

            setError: (error: string | null) => {
                set({ error });
            },

            reset: () => {
                set(initialState);
            },
        }),
        {
            name: 'purchases-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: state => ({
                summary: state.summary,
                purchases: state.purchases,
                lastFetched: state.lastFetched,
            }),
        }
    )
);

// ============ SELECTORS ============

export const selectTotalPaid = (state: PurchasesState) => state.summary?.totalPaid ?? 0;

export const selectThisMonthAmount = (state: PurchasesState) => state.summary?.thisMonthAmount ?? 0;

export const selectPurchasesByType = (state: PurchasesState, type: PurchaseType) =>
    state.purchases.filter(p => p.type === type);

export const selectPayments = (state: PurchasesState) =>
    state.purchases.filter(p => p.type === 'payment');

export const selectExchanges = (state: PurchasesState) =>
    state.purchases.filter(p => p.type === 'exchange');

export const selectRecentPurchases = (state: PurchasesState, limit: number = 5) =>
    state.purchases.slice(0, limit);

// ============ HOOKS ============

/**
 * Hook to get filtered purchases by type
 */
export function usePurchasesFiltered() {
    const purchases = usePurchasesStore(state => state.purchases);
    const summary = usePurchasesStore(state => state.summary);

    const all = purchases;
    const payments = purchases.filter(p => p.type === 'payment' || p.type === 'activation');
    const exchanges = purchases.filter(p => p.type === 'exchange' || p.type === 'refund');
    const others = purchases.filter(p => p.type === 'penalty' || p.type === 'admin_fee');

    return {
        all,
        payments,
        exchanges,
        others,
        summary,
        paymentsCount: payments.length,
        exchangesCount: exchanges.length,
    };
}
