// src/stores/coupons-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Coupon, CouponRedemption } from '../types/coupons';

interface CouponsState {
    coupons: Coupon[];
    redemptions: CouponRedemption[];
    isLoading: boolean;
    lastFetched: number | null;
}

interface CouponsActions {
    setCoupons: (coupons: Coupon[]) => void;
    addCoupon: (coupon: Coupon) => void;
    redeemCoupon: (couponId: string, clubId?: string) => void;
    updateCouponStatus: (couponId: string, status: Coupon['status']) => void;
    setLoading: (loading: boolean) => void;
    clearExpiredCoupons: () => void;
    reset: () => void;
}

// Contadores computados
interface CouponsComputed {
    availableCoupons: Coupon[];
    usedCoupons: Coupon[];
    expiredCoupons: Coupon[];
    availableCount: number;
}

const initialState: CouponsState = {
    coupons: [],
    redemptions: [],
    isLoading: false,
    lastFetched: null,
};

export const useCouponsStore = create<CouponsState & CouponsActions>() (
    persist(
        (set, get) => ({
            ...initialState,

            setCoupons: (coupons) => {
                set({
                    coupons,
                    lastFetched: Date.now(),
                    isLoading: false,
                });
            },

            addCoupon: (coupon) => {
                set((state) => ({
                    coupons: [coupon, ...state.coupons],
                }));
            },

            redeemCoupon: (couponId, clubId) => {
                const redemption: CouponRedemption = {
                    couponId,
                    redeemedAt: new Date().toISOString(),
                    clubId,
                    transactionId: `txn_${Date.now()}`,
                };

                set((state) => ({
                    coupons: state.coupons.map((c) =>
                        c.id === couponId
                            ? { ...c, status: 'used' as const, usedAt: redemption.redeemedAt }
                            : c
                    ),
                    redemptions: [redemption, ...state.redemptions],
                }));
            },

            updateCouponStatus: (couponId, status) => {
                set((state) => ({
                    coupons: state.coupons.map((c) =>
                        c.id === couponId ? { ...c, status } : c
                    ),
                }));
            },

            setLoading: (isLoading) => {
                set({ isLoading });
            },

            clearExpiredCoupons: () => {
                const now = new Date();
                set((state) => ({
                    coupons: state.coupons.map((c) => {
                        if (c.status === 'available' && new Date(c.expiresAt) < now) {
                            return { ...c, status: 'expired' as const };
                        }
                        return c;
                    }),
                }));
            },

            reset: () => {
                set(initialState);
            },
        }),
        {
            name: 'coupons-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                coupons: state.coupons,
                redemptions: state.redemptions,
                lastFetched: state.lastFetched,
            }),
        }
    )
);

// Selectores para datos computados
export const selectAvailableCoupons = (state: CouponsState): Coupon[] =>
    state.coupons.filter((c) => c.status === 'available');

export const selectUsedCoupons = (state: CouponsState): Coupon[] =>
    state.coupons.filter((c) => c.status === 'used');

export const selectExpiredCoupons = (state: CouponsState): Coupon[] =>
    state.coupons.filter((c) => c.status === 'expired');

export const selectAvailableCount = (state: CouponsState): number =>
    state.coupons.filter((c) => c.status === 'available').length;

// Hook helper para obtener cupones filtrados
export function useCouponsFiltered() {
    const coupons = useCouponsStore((state) => state.coupons);

    return {
        available: coupons.filter((c) => c.status === 'available'),
        used: coupons.filter((c) => c.status === 'used'),
        expired: coupons.filter((c) => c.status === 'expired'),
        availableCount: coupons.filter((c) => c.status === 'available').length,
    };
}
