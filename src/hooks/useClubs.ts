// ============================================================
// ARCHIVO 4: src/hooks/useClubs.ts
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import type { ClubFilters, CreateClubDTO, UpdateClubDTO, ClubRule, CreateTransactionDTO } from '../types/club';
import { clubApi } from '../api/clubs.api';

// Query Keys
export const clubKeys = {
    all: ['clubs'] as const,
    lists: () => [...clubKeys.all, 'list'] as const,
    list: (filters: ClubFilters, page: number, pageSize: number) =>
        [...clubKeys.lists(), { filters, page, pageSize }] as const,
    details: () => [...clubKeys.all, 'detail'] as const,
    detail: (id: string) => [...clubKeys.details(), id] as const,
    weeks: (clubId: string) => [...clubKeys.all, 'weeks', clubId] as const,
    transactions: (clubId: string) => [...clubKeys.all, 'transactions', clubId] as const,
    stats: (clubId: string) => [...clubKeys.all, 'stats', clubId] as const,
    history: (clubId: string) => [...clubKeys.all, 'history', clubId] as const,
    types: ['club-types'] as const,
    statuses: ['club-statuses'] as const,
    denominations: ['denominations'] as const,
    rules: ['club-rules'] as const,
    draws: (clubTypeId?: string, dateFrom?: string, dateTo?: string) =>
        ['draws', { clubTypeId, dateFrom, dateTo }] as const,
};

// Queries - Clubes
export function useClubs(filters: ClubFilters = {}, page = 1, pageSize = 20) {
    // Usar el filtro tal como viene, sin optimización de status
    const optimizedFilters: ClubFilters = {
        ...filters,
    };

    return useQuery({
        queryKey: clubKeys.list(optimizedFilters, page, pageSize),
        queryFn: () => clubApi.getClubs(optimizedFilters, page, pageSize),
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        placeholderData: (prev) => prev,
        retry: 1,
    });
}

export function useClub(clubId: string) {
    return useQuery({
        queryKey: clubKeys.detail(clubId),
        queryFn: () => clubApi.getClubById(clubId),
        enabled: !!clubId,
    });
}

export function useClubWeeks(clubId: string) {
    return useQuery({
        queryKey: clubKeys.weeks(clubId),
        queryFn: () => clubApi.getClubWeeks(clubId),
        enabled: !!clubId,
    });
}

export function useClubTransactions(clubId: string) {
    return useQuery({
        queryKey: clubKeys.transactions(clubId),
        queryFn: () => clubApi.getClubTransactions(clubId),
        enabled: !!clubId,
    });
}

export function useClubStats(clubId: string) {
    return useQuery({
        queryKey: clubKeys.stats(clubId),
        queryFn: () => clubApi.getClubStats(clubId),
        enabled: !!clubId,
    });
}

export function useClubHistory(clubId: string) {
    return useQuery({
        queryKey: clubKeys.history(clubId),
        queryFn: () => clubApi.getClubHistory(clubId),
        enabled: !!clubId,
    });
}

// Queries - Catálogos
export function useClubTypes() {
    return useQuery({
        queryKey: clubKeys.types,
        queryFn: clubApi.getClubTypes,
        staleTime: Infinity,
    });
}

export function useClubStatuses() {
    return useQuery({
        queryKey: clubKeys.statuses,
        queryFn: clubApi.getClubStatuses,
        staleTime: Infinity,
    });
}

export function useDenominations() {
    return useQuery({
        queryKey: clubKeys.denominations,
        queryFn: clubApi.getDenominations,
        staleTime: Infinity,
    });
}

export function useClubRules() {
    return useQuery({
        queryKey: clubKeys.rules,
        queryFn: clubApi.getClubRules,
        staleTime: 5 * 60 * 1000,
    });
}

export function useDraws(clubTypeId?: string, dateFrom?: string, dateTo?: string) {
    return useQuery({
        queryKey: clubKeys.draws(clubTypeId, dateFrom, dateTo),
        queryFn: () => clubApi.getDraws(clubTypeId, dateFrom, dateTo),
    });
}

// Mutations - Clubes
export function useCreateClub() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateClubDTO) => clubApi.createClub(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: clubKeys.lists() });
        },
    });
}

export function useUpdateClub() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ clubId, data }: { clubId: string; data: UpdateClubDTO }) =>
            clubApi.updateClub(clubId, data),
        onSuccess: (_, { clubId }) => {
            qc.invalidateQueries({ queryKey: clubKeys.detail(clubId) });
            qc.invalidateQueries({ queryKey: clubKeys.lists() });
        },
    });
}

export function useDeleteClub() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (clubId: string) => clubApi.deleteClub(clubId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: clubKeys.lists() });
        },
    });
}

// Mutations - Semanas
export function usePayWeek() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ clubId, weekNumber, amount }: { clubId: string; weekNumber: number; amount: number }) =>
            clubApi.payWeek(clubId, weekNumber, amount),
        onSuccess: (_, { clubId }) => {
            qc.invalidateQueries({ queryKey: clubKeys.weeks(clubId) });
            qc.invalidateQueries({ queryKey: clubKeys.detail(clubId) });
            qc.invalidateQueries({ queryKey: clubKeys.transactions(clubId) });
            qc.invalidateQueries({ queryKey: clubKeys.stats(clubId) });
        },
    });
}

// Mutations - Transacciones
export function useCreateTransaction() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ clubId, data }: { clubId: string; data: CreateTransactionDTO }) =>
            clubApi.createTransaction(clubId, data),
        onSuccess: (_, { clubId }) => {
            qc.invalidateQueries({ queryKey: clubKeys.transactions(clubId) });
            qc.invalidateQueries({ queryKey: clubKeys.detail(clubId) });
        },
    });
}

// Mutations - Reglas
export function useCreateRule() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<ClubRule>) => clubApi.createRule(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: clubKeys.rules }),
    });
}

export function useUpdateRule() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ ruleId, data }: { ruleId: string; data: Partial<ClubRule> }) =>
            clubApi.updateRule(ruleId, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: clubKeys.rules }),
    });
}

export function useDeleteRule() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (ruleId: string) => clubApi.deleteRule(ruleId),
        onSuccess: () => qc.invalidateQueries({ queryKey: clubKeys.rules }),
    });
}

// Mutations - Sorteos
export function useRegisterDraw() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: { date: string; numberPlayed: number; clubTypeId: string }) =>
            clubApi.registerDraw(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['draws'] }),
    });
}