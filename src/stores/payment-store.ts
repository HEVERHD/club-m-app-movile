// src/stores/payment-store.ts
// Crear este archivo en: src/stores/payment-store.ts

import { create } from 'zustand';
import { paymentsApi, ClubDetail, ClubWeek } from '../api/payments.api';

interface PaymentState {
    // Club detail
    clubDetail: ClubDetail | null;
    isLoadingDetail: boolean;
    detailError: string | null;

    // Customer identification (cédula) para filtrar búsquedas
    currentCustomerIdentification: string | null;

    // Selected weeks for payment
    selectedWeeks: number[];

    // Payment process
    isProcessingPayment: boolean;
    paymentError: string | null;
    paymentSuccess: boolean;
    lastPaymentResult: {
        transactionId: string;
        amount: number;
        weeksCount: number;
    } | null;

    // Cancel process
    isCancelling: boolean;
    cancelError: string | null;

    // Actions
    fetchClubDetail: (clubId: string, customerIdentification?: string) => Promise<void>;
    setClubDetailFromCache: (club: any) => void;
    toggleWeekSelection: (weekNumber: number) => void;
    selectAllUnpaidWeeks: () => void;
    selectWeeksUpTo: (weekNumber: number) => void;
    clearSelection: () => void;
    processPayment: (clubId: string, comment?: string) => Promise<boolean>;
    cancelClub: (clubId: string) => Promise<boolean>;
    reset: () => void;

    // Computed (helpers)
    getSelectedAmount: () => number;
    getUnpaidWeeks: () => ClubWeek[];
}

const MAX_WEEKS_ADVANCE = 25; // Máximo semanas por adelantado permitidas

const initialState = {
    clubDetail: null,
    isLoadingDetail: false,
    detailError: null,
    currentCustomerIdentification: null,
    selectedWeeks: [],
    isProcessingPayment: false,
    paymentError: null,
    paymentSuccess: false,
    lastPaymentResult: null,
    isCancelling: false,
    cancelError: null,
};

export const usePaymentStore = create<PaymentState>((set, get) => ({
    ...initialState,

    fetchClubDetail: async (clubId: string, customerIdentification?: string) => {
        set({ isLoadingDetail: true, detailError: null });

        // Usar la cédula proporcionada o la guardada anteriormente
        const { currentCustomerIdentification } = get();
        const identificationToUse = customerIdentification || currentCustomerIdentification || undefined;

        try {
            const detail = await paymentsApi.getClubDetail(clubId, identificationToUse);
            set({
                clubDetail: detail,
                isLoadingDetail: false,
                selectedWeeks: [], // Reset selection when loading new club
                // Guardar la cédula del club cargado para futuras recargas
                currentCustomerIdentification: detail.customerIdentification || identificationToUse || null,
            });
        } catch (error: any) {
            console.error('❌ Error fetching club detail:', error);
            set({
                detailError: error.message || 'Error al cargar el club',
                isLoadingDetail: false,
            });
        }
    },

    setClubDetailFromCache: (club: any) => {
        // Convertir datos del club de la lista al formato ClubDetail
        const denomination = club.denominationValue || club.denomination || 5;
        const weeksPaid = club.weeksPaid || 0;
        const startDate = new Date(club.startDate || new Date());

        // Generar 52 semanas basadas en la fecha de inicio
        const weeks: ClubWeek[] = [];
        for (let i = 1; i <= 52; i++) {
            const drawDate = new Date(startDate);
            drawDate.setDate(drawDate.getDate() + (i - 1) * 7);

            weeks.push({
                weekNumber: i,
                drawDate: drawDate.toISOString(),
                paymentDate: i <= weeksPaid ? drawDate.toISOString() : null,
                status: i <= weeksPaid ? 'paid' : drawDate < new Date() ? 'late' : 'unpaid',
                amount: denomination,
            });
        }

        const customerIdentification = club.customerIdentification || club.numberId || club.NumberId || '';

        const clubDetail: ClubDetail = {
            clubId: club.clubId,
            contractNumber: club.contractNumber || '',
            customerId: club.customerId || '',
            customerName: club.customerName || 'Sin nombre',
            customerIdentification,
            share: club.share || 0,
            denomination,
            clubType: club.clubTypeId || '',
            clubTypeName: club.clubTypeName || 'Club',
            statusName: club.statusName || 'Activo',
            balance: club.balanceAmount || 0,
            weeksPaid,
            weeksTotal: 52,
            nextDrawDate: '',
            weeks,
        };

        set({
            clubDetail,
            isLoadingDetail: false,
            detailError: null,
            selectedWeeks: [],
            // Guardar la cédula para futuras recargas
            currentCustomerIdentification: customerIdentification || null,
        });
    },

    toggleWeekSelection: (weekNumber: number) => {
        const { selectedWeeks, clubDetail } = get();

        // Verificar que la semana no esté pagada
        const week = clubDetail?.weeks.find(w => w.weekNumber === weekNumber);
        if (week?.status === 'paid') return;

        if (selectedWeeks.includes(weekNumber)) {
            set({ selectedWeeks: selectedWeeks.filter(w => w !== weekNumber) });
        } else {
            // Verificar límite de 25 semanas
            if (selectedWeeks.length >= MAX_WEEKS_ADVANCE) {
                return; // No permitir más de 25
            }
            set({ selectedWeeks: [...selectedWeeks, weekNumber].sort((a, b) => a - b) });
        }
    },

    selectAllUnpaidWeeks: () => {
        const { clubDetail } = get();
        if (!clubDetail) return;

        // Limitar a MAX_WEEKS_ADVANCE semanas
        const unpaidWeekNumbers = clubDetail.weeks
            .filter(w => w.status !== 'paid')
            .slice(0, MAX_WEEKS_ADVANCE)
            .map(w => w.weekNumber);

        set({ selectedWeeks: unpaidWeekNumbers });
    },

    selectWeeksUpTo: (weekNumber: number) => {
        const { clubDetail } = get();
        if (!clubDetail) return;

        const weeksToSelect = clubDetail.weeks
            .filter(w => w.status !== 'paid' && w.weekNumber <= weekNumber)
            .map(w => w.weekNumber);

        set({ selectedWeeks: weeksToSelect });
    },

    clearSelection: () => {
        set({ selectedWeeks: [] });
    },

    processPayment: async (clubId: string, comment?: string) => {
        const { selectedWeeks, clubDetail } = get();

        if (selectedWeeks.length === 0 || !clubDetail) {
            set({ paymentError: 'Selecciona al menos una semana' });
            return false;
        }

        const amount = selectedWeeks.length * clubDetail.denomination;

        set({ isProcessingPayment: true, paymentError: null, paymentSuccess: false });

        try {
            const result = await paymentsApi.registerPayment(
                clubId,
                amount,
                selectedWeeks.length,
                comment
            );

            set({
                isProcessingPayment: false,
                paymentSuccess: true,
                lastPaymentResult: {
                    transactionId: result.transactionId,
                    amount,
                    weeksCount: selectedWeeks.length,
                },
                selectedWeeks: [],
            });

            // Recargar detalle del club para actualizar semanas
            await get().fetchClubDetail(clubId);

            return true;
        } catch (error: any) {
            console.error('❌ Error processing payment:', error);
            set({
                isProcessingPayment: false,
                paymentError: error.message || 'Error al procesar el pago',
            });
            return false;
        }
    },

    reset: () => {
        set(initialState);
    },

    cancelClub: async (clubId: string) => {
        set({ isCancelling: true, cancelError: null });

        try {
            const result = await paymentsApi.cancelClub(clubId);

            set({ isCancelling: false });

            return true;
        } catch (error: any) {
            console.error('❌ Error cancelling club:', error);
            set({
                isCancelling: false,
                cancelError: error.message || 'Error al cancelar el club',
            });
            return false;
        }
    },

    getSelectedAmount: () => {
        const { selectedWeeks, clubDetail } = get();
        if (!clubDetail) return 0;
        return selectedWeeks.length * clubDetail.denomination;
    },

    getUnpaidWeeks: () => {
        const { clubDetail } = get();
        if (!clubDetail) return [];
        return clubDetail.weeks.filter(w => w.status !== 'paid');
    },
}));