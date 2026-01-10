// src/stores/exchange-store.ts
import { create } from 'zustand';
import { exchangeApi, ClubForExchange, ExchangeResult } from '../api/exchange.api';

interface SelectedClub {
    club: ClubForExchange;
    amountToUse: number;
}

interface ExchangeState {
    // Available clubs
    availableClubs: ClubForExchange[];
    isLoadingClubs: boolean;
    clubsError: string | null;

    // Amount to pay
    amountToPay: number;

    // Selected clubs for payment
    selectedClubs: SelectedClub[];

    // Exchange process
    isProcessing: boolean;
    processError: string | null;
    exchangeResults: ExchangeResult[] | null;
    isSuccess: boolean;

    // Computed values (recalculated)
    totalAvailable: number;
    totalSelected: number;
    canCoverAmount: boolean;
    shortage: number;

    // Actions
    fetchAvailableClubs: (customerId?: string) => Promise<void>;
    setAmountToPay: (amount: number) => void;
    toggleClubSelection: (club: ClubForExchange) => void;
    setClubAmount: (clubId: string, amount: number) => void;
    autoSelectClubs: () => void;
    clearSelection: () => void;
    processExchange: (comment?: string) => Promise<boolean>;
    reset: () => void;
}

const initialState = {
    availableClubs: [],
    isLoadingClubs: false,
    clubsError: null,
    amountToPay: 0,
    selectedClubs: [],
    isProcessing: false,
    processError: null,
    exchangeResults: null,
    isSuccess: false,
    totalAvailable: 0,
    totalSelected: 0,
    canCoverAmount: false,
    shortage: 0,
};

// Helper para recalcular valores
const recalculate = (
    availableClubs: ClubForExchange[],
    selectedClubs: SelectedClub[],
    amountToPay: number
) => {
    const totalAvailable = availableClubs.reduce((sum, c) => sum + c.balance, 0);
    const totalSelected = selectedClubs.reduce((sum, sc) => sum + sc.amountToUse, 0);
    const canCoverAmount = totalSelected >= amountToPay;
    const shortage = amountToPay > totalAvailable ? amountToPay - totalAvailable : 0;

    return { totalAvailable, totalSelected, canCoverAmount, shortage };
};

export const useExchangeStore = create<ExchangeState>((set, get) => ({
    ...initialState,

    fetchAvailableClubs: async (customerId?: string) => {
        set({ isLoadingClubs: true, clubsError: null });

        try {
            const clubs = await exchangeApi.getClubsForExchange(customerId);
            const totalAvailable = clubs.reduce((sum, c) => sum + c.balance, 0);

            set({
                availableClubs: clubs,
                isLoadingClubs: false,
                totalAvailable,
            });
        } catch (error: any) {
            set({
                clubsError: error.message || 'Error al cargar clubs',
                isLoadingClubs: false,
            });
        }
    },

    setAmountToPay: (amount: number) => {
        const { availableClubs, selectedClubs } = get();
        const calculated = recalculate(availableClubs, selectedClubs, amount);

        set({
            amountToPay: amount,
            ...calculated,
        });
    },

    toggleClubSelection: (club: ClubForExchange) => {
        const { selectedClubs, amountToPay, availableClubs } = get();
        const isSelected = selectedClubs.some(sc => sc.club.clubId === club.clubId);

        let newSelected: SelectedClub[];

        if (isSelected) {
            newSelected = selectedClubs.filter(sc => sc.club.clubId !== club.clubId);
        } else {
            // Calcular cuánto falta por cubrir
            const currentTotal = selectedClubs.reduce((sum, sc) => sum + sc.amountToUse, 0);
            const remaining = Math.max(0, amountToPay - currentTotal);
            const amountToUse = Math.min(club.balance, remaining > 0 ? remaining : club.balance);

            newSelected = [...selectedClubs, { club, amountToUse }];
        }

        const calculated = recalculate(availableClubs, newSelected, amountToPay);
        set({ selectedClubs: newSelected, ...calculated });
    },

    setClubAmount: (clubId: string, amount: number) => {
        const { selectedClubs, amountToPay, availableClubs } = get();

        const newSelected = selectedClubs.map(sc => {
            if (sc.club.clubId === clubId) {
                // No permitir más del balance disponible
                const validAmount = Math.min(Math.max(0, amount), sc.club.balance);
                return { ...sc, amountToUse: validAmount };
            }
            return sc;
        });

        const calculated = recalculate(availableClubs, newSelected, amountToPay);
        set({ selectedClubs: newSelected, ...calculated });
    },

    autoSelectClubs: () => {
        const { availableClubs, amountToPay } = get();

        if (amountToPay <= 0) {
            set({ selectedClubs: [], totalSelected: 0, canCoverAmount: false });
            return;
        }

        const validation = exchangeApi.validateAmount(availableClubs, amountToPay);
        const newSelected: SelectedClub[] = validation.suggestedClubs.map(sc => ({
            club: sc.club,
            amountToUse: sc.amountToUse,
        }));

        const calculated = recalculate(availableClubs, newSelected, amountToPay);
        set({ selectedClubs: newSelected, ...calculated });
    },

    clearSelection: () => {
        const { amountToPay, availableClubs } = get();
        const calculated = recalculate(availableClubs, [], amountToPay);
        set({ selectedClubs: [], ...calculated });
    },

    processExchange: async (comment?: string) => {
        const { selectedClubs, amountToPay } = get();

        if (selectedClubs.length === 0) {
            set({ processError: 'Selecciona al menos un club' });
            return false;
        }

        const totalSelected = selectedClubs.reduce((sum, sc) => sum + sc.amountToUse, 0);
        if (totalSelected < amountToPay) {
            set({ processError: 'El monto seleccionado no cubre el total' });
            return false;
        }

        set({ isProcessing: true, processError: null });

        try {
            // Si es un solo club, usar exchange simple
            if (selectedClubs.length === 1) {
                const sc = selectedClubs[0];
                const result = await exchangeApi.exchange(
                    sc.club.clubId,
                    sc.amountToUse,
                    comment
                );

                set({
                    isProcessing: false,
                    isSuccess: true,
                    exchangeResults: [{
                        clubId: sc.club.clubId,
                        contractNumber: sc.club.contractNumber,
                        amountUsed: sc.amountToUse,
                        previousBalance: sc.club.balance,
                        newBalance: result.newBalance,
                        transactionId: result.transactionId,
                    }],
                });
            } else {
                // Múltiples clubs
                const clubsData = selectedClubs.map(sc => ({
                    clubId: sc.club.clubId,
                    amount: sc.amountToUse,
                    contractNumber: sc.club.contractNumber,
                    currentBalance: sc.club.balance,
                }));

                const results = await exchangeApi.multiExchange(
                    clubsData,
                    amountToPay,
                    comment
                );

                set({
                    isProcessing: false,
                    isSuccess: true,
                    exchangeResults: results,
                });
            }

            return true;
        } catch (error: any) {
            set({
                isProcessing: false,
                processError: error.message || 'Error al procesar el consumo',
            });
            return false;
        }
    },

    reset: () => {
        set(initialState);
    },
}));