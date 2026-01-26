/**
 * Points Store - Zustand State Management
 * Manages customer points data with persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    PointsTransaction,
    PointsSummary,
    PointsTransactionType,
    getPoints,
    redeemPoints as apiRedeemPoints,
} from '../api/points.api';

// ============ TYPES ============

interface PointsState {
    // Data
    summary: PointsSummary | null;
    transactions: PointsTransaction[];

    // UI State
    isLoading: boolean;
    error: string | null;
    lastFetched: number | null;

    // Actions
    fetchPoints: (customerId?: string) => Promise<void>;
    redeemPoints: (amount: number, reason: string, customerId?: string) => Promise<boolean>;
    addTransaction: (transaction: PointsTransaction) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

// ============ INITIAL STATE ============

const initialState = {
    summary: null,
    transactions: [],
    isLoading: false,
    error: null,
    lastFetched: null,
};

// ============ STORE ============

export const usePointsStore = create<PointsState>()(
    persist(
        (set, get) => ({
            ...initialState,

            fetchPoints: async (customerId?: string) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await getPoints(customerId);

                    set({
                        summary: response.summary,
                        transactions: response.transactions,
                        isLoading: false,
                        lastFetched: Date.now(),
                    });
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Error al cargar puntos';
                    set({ error: message, isLoading: false });
                }
            },

            redeemPoints: async (amount: number, reason: string, customerId?: string) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await apiRedeemPoints(amount, reason, customerId);

                    if (response.success) {
                        // Add the redemption to transactions
                        const newTransaction: PointsTransaction = {
                            id: response.transactionId || `redeem-${Date.now()}`,
                            type: 'redeemed',
                            amount: -amount,
                            description: reason,
                            date: new Date().toISOString(),
                        };

                        const currentSummary = get().summary;

                        set(state => ({
                            transactions: [newTransaction, ...state.transactions],
                            summary: currentSummary
                                ? {
                                      ...currentSummary,
                                      availablePoints: response.newBalance ?? currentSummary.availablePoints - amount,
                                      totalRedeemed: currentSummary.totalRedeemed + amount,
                                  }
                                : null,
                            isLoading: false,
                        }));

                        return true;
                    } else {
                        set({ error: response.message, isLoading: false });
                        return false;
                    }
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Error al canjear puntos';
                    set({ error: message, isLoading: false });
                    return false;
                }
            },

            addTransaction: (transaction: PointsTransaction) => {
                set(state => ({
                    transactions: [transaction, ...state.transactions],
                }));
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
            name: 'points-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: state => ({
                summary: state.summary,
                transactions: state.transactions,
                lastFetched: state.lastFetched,
            }),
        }
    )
);

// ============ SELECTORS ============

export const selectAvailablePoints = (state: PointsState) => state.summary?.availablePoints ?? 0;

export const selectExpiringSoon = (state: PointsState) => state.summary?.expiringSoon ?? 0;

export const selectTransactionsByType = (state: PointsState, type: PointsTransactionType) =>
    state.transactions.filter(tx => tx.type === type);

export const selectEarnedTransactions = (state: PointsState) =>
    state.transactions.filter(tx => tx.type === 'earned' || tx.type === 'bonus');

export const selectRedeemedTransactions = (state: PointsState) =>
    state.transactions.filter(tx => tx.type === 'redeemed');

export const selectRecentTransactions = (state: PointsState, limit: number = 5) =>
    state.transactions.slice(0, limit);

// ============ HOOKS ============

/**
 * Hook to get filtered transactions by type
 */
export function usePointsFiltered() {
    const transactions = usePointsStore(state => state.transactions);
    const summary = usePointsStore(state => state.summary);

    const earned = transactions.filter(tx => tx.type === 'earned' || tx.type === 'bonus');
    const redeemed = transactions.filter(tx => tx.type === 'redeemed');
    const expired = transactions.filter(tx => tx.type === 'expired');
    const all = transactions;

    return {
        all,
        earned,
        redeemed,
        expired,
        summary,
        earnedCount: earned.length,
        redeemedCount: redeemed.length,
    };
}
