// src/stores/draw-store.ts
import { create } from 'zustand';
import type { Draw, DrawWinner, DrawFilters, CreateDrawDTO } from '../types/clubs';
import { drawsApi } from '../api/draws.api';

interface DrawState {
    // State
    draws: Draw[];
    selectedDraw: Draw | null;
    winners: DrawWinner[];
    upcomingDraws: Draw[];
    isLoading: boolean;
    error: string | null;
    filters: DrawFilters;
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };

    // Actions
    fetchDraws: (filters?: DrawFilters, page?: number) => Promise<void>;
    fetchDrawById: (drawId: string) => Promise<void>;
    fetchDrawWinners: (drawId: string) => Promise<void>;
    fetchUpcomingDraws: (clubTypeId?: string) => Promise<void>;
    executeDraw: (dto: CreateDrawDTO) => Promise<Draw>;
    cancelDraw: (drawId: string, reason: string) => Promise<void>;
    markWinnerNotified: (drawId: string, clubId: string) => Promise<void>;
    markPrizeClaimed: (drawId: string, clubId: string) => Promise<void>;
    setFilters: (filters: DrawFilters) => void;
    setSelectedDraw: (draw: Draw) => void;
    clearSelectedDraw: () => void;
    clearError: () => void;
}

export const useDrawStore = create<DrawState>((set, get) => ({
    // Initial state
    draws: [],
    selectedDraw: null,
    winners: [],
    upcomingDraws: [],
    isLoading: false,
    error: null,
    filters: {},
    pagination: {
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 0,
    },

    // Actions
    fetchDraws: async (filters = {}, page = 1) => {
        set({ isLoading: true, error: null });
        try {
            const result = await drawsApi.getDraws(filters, page, get().pagination.pageSize);
            set({
                draws: result.data,
                pagination: {
                    page: result.page,
                    pageSize: result.pageSize,
                    total: result.total,
                    totalPages: result.totalPages,
                },
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.message || 'Error al cargar sorteos',
                isLoading: false,
            });
        }
    },

    fetchDrawById: async (drawId: string) => {
        set({ isLoading: true, error: null });
        try {
            const draw = await drawsApi.getDrawById(drawId);
            if (!draw) {
                throw new Error('Sorteo no encontrado');
            }
            set({ selectedDraw: draw, isLoading: false });
        } catch (error: any) {
            set({
                error: error.message || 'Error al cargar sorteo',
                isLoading: false,
            });
        }
    },

    fetchDrawWinners: async (drawId: string) => {
        set({ isLoading: true, error: null });
        try {
            const winners = await drawsApi.getDrawWinners(drawId);
            set({ winners, isLoading: false });
        } catch (error: any) {
            set({
                error: error.message || 'Error al cargar ganadores',
                isLoading: false,
            });
        }
    },

    fetchUpcomingDraws: async (clubTypeId?: string) => {
        set({ isLoading: true, error: null });
        try {
            const upcomingDraws = await drawsApi.getUpcomingDraws(clubTypeId);
            set({ upcomingDraws, isLoading: false });
        } catch (error: any) {
            set({
                error: error.message || 'Error al cargar próximos sorteos',
                isLoading: false,
            });
        }
    },

    executeDraw: async (dto: CreateDrawDTO) => {
        set({ isLoading: true, error: null });
        try {
            console.log('🏪 STORE - DTO recibido:', JSON.stringify(dto, null, 2));

            const draw = await drawsApi.executeDraw(dto);

            console.log('🏪 STORE - draw retornado de API:', JSON.stringify(draw, null, 2));
            console.log('🏪 STORE - draw.numberPlayed:', draw.numberPlayed);
            console.log('🏪 STORE - typeof draw.numberPlayed:', typeof draw.numberPlayed);

            // Actualizar la lista de sorteos
            const { draws } = get();
            set({
                draws: [draw, ...draws],
                selectedDraw: draw,
                isLoading: false,
            });

            console.log('🏪 STORE - draw que se va a retornar:', JSON.stringify(draw, null, 2));
            console.log('🏪 STORE - draw.numberPlayed final:', draw.numberPlayed);

            return draw;
        } catch (error: any) {
            set({
                error: error.message || 'Error al ejecutar sorteo',
                isLoading: false,
            });
            throw error;
        }
    },

    cancelDraw: async (drawId: string, reason: string) => {
        set({ isLoading: true, error: null });
        try {
            await drawsApi.cancelDraw(drawId, reason);

            // Actualizar el sorteo en la lista
            const { draws, selectedDraw } = get();
            const updatedDraws = draws.map(d =>
                d.drawId === drawId ? { ...d, status: 'cancelled' as const } : d
            );

            set({
                draws: updatedDraws,
                selectedDraw: selectedDraw?.drawId === drawId
                    ? { ...selectedDraw, status: 'cancelled' as const }
                    : selectedDraw,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.message || 'Error al cancelar sorteo',
                isLoading: false,
            });
            throw error;
        }
    },

    markWinnerNotified: async (drawId: string, clubId: string) => {
        set({ isLoading: true, error: null });
        try {
            await drawsApi.markWinnerNotified(drawId, clubId);

            // Actualizar ganador en la lista
            const { winners } = get();
            const updatedWinners = winners.map(w =>
                w.clubId === clubId ? { ...w, notified: true } : w
            );

            set({ winners: updatedWinners, isLoading: false });
        } catch (error: any) {
            set({
                error: error.message || 'Error al marcar notificación',
                isLoading: false,
            });
            throw error;
        }
    },

    markPrizeClaimed: async (drawId: string, clubId: string) => {
        set({ isLoading: true, error: null });
        try {
            await drawsApi.markPrizeClaimed(drawId, clubId);

            // Actualizar ganador en la lista
            const { winners } = get();
            const updatedWinners = winners.map(w =>
                w.clubId === clubId ? { ...w, claimed: true, claimDate: new Date().toISOString() } : w
            );

            set({ winners: updatedWinners, isLoading: false });
        } catch (error: any) {
            set({
                error: error.message || 'Error al marcar reclamación',
                isLoading: false,
            });
            throw error;
        }
    },

    setFilters: (filters: DrawFilters) => {
        set({ filters });
    },

    setSelectedDraw: (draw: Draw) => {
        set({ selectedDraw: draw });
    },

    clearSelectedDraw: () => {
        set({ selectedDraw: null, winners: [] });
    },

    clearError: () => {
        set({ error: null });
    },
}));
