// src/api/clubs.api.ts - ACTUALIZADO
import { mdl05Client } from './client';
import type {
    Club, ClubFilters, PaginatedClubs, CreateClubDTO, UpdateClubDTO,
    ClubType, ClubStatus, Denomination, ClubWeek, ClubTransaction,
    ClubRule, Draw, LimitNumber, ClubStats, CreateTransactionDTO,
} from '../types/clubs';

const BASE = '/mdl05';

// Mock data para catálogos (mientras no haya endpoint real)
const mockClubTypes: ClubType[] = [
    { clubTypeId: '1', name: 'Miércoles', drawDay: 'wednesday', active: true },
    { clubTypeId: '2', name: 'Domingo', drawDay: 'sunday', active: true },
    { clubTypeId: '3', name: 'Combinado', drawDay: 'combined', active: true },
];

const mockDenominations: Denomination[] = [
    { denominationId: '1', value: 3, description: '$3 semanal', active: true },
    { denominationId: '2', value: 5, description: '$5 semanal', active: true },
    { denominationId: '3', value: 10, description: '$10 semanal', active: true },
];

const mockStatuses: ClubStatus[] = [
    { clubStatusId: '1', name: 'Activo', color: '#22c55e' },
    { clubStatusId: '2', name: 'Anulado', color: '#ef4444' },
    { clubStatusId: '3', name: 'Cerrado', color: '#6b7280' },
    { clubStatusId: '4', name: 'En Auditoría', color: '#f59e0b' },
];

// Mapper para transformar respuesta del API a nuestro tipo
const mapClubResponse = (c: any): Club => ({
    clubId: c.ClubId || c.clubId || '',
    contractNumber: c.ContractNumber || c.contractNumber || '',
    customerId: c.CustomerId || c.customerId || '',
    customerName: c.CustomerName || c.customerName || 'Sin nombre',
    customerNumber: c.CustomerNumber || c.customerNumber || '',
    externalCode: c.ExternalCode || c.externalCode || '',
    clubTypeId: c.ClubTypeId || c.clubTypeId || '',
    denominationId: c.DenominationId || c.denominationId || '',
    clubStatusId: c.ClubStatusId || c.clubStatusId || '',
    statusName: c.NameStatus || c.statusName || 'Desconocido',
    salesAgentId: c.SalesAgentId || c.salesAgentId || '',
    storeId: c.StoreId || c.storeId || '',
    saaSId: c.SaaSId || c.saaSId || 2,
    share: c.Share || c.share || 0,
    weeksPlayed: 52,
    weeksPaid: c.WeeksPaid || c.weeksPaid || 0,
    weeksLate: c.WeeksLate || c.weeksLate || 0,
    paidAmount: c.PaidAmount || c.paidAmount || 0,
    retiredAmount: c.RetiredAmount || c.retiredAmount || 0,
    balanceAmount: c.BalanceAmount || c.balanceAmount || 0,
    totalAmount: c.TotalAmount || c.totalAmount || 0,
    startDate: c.StartDate || c.startDate || '',
    finishDate: c.FinishDate || c.finishDate || '',
    prizeDate: c.PrizeDate || c.prizeDate || '',
    createdDate: c.CreatedDate || c.createdDate || '',
    cancellationDate: c.CancellationDate || c.cancellationDate || '',
    active: (c.NameStatus || c.statusName || '').toLowerCase() === 'activo',
});

export const clubApi = {
    // ==========================================
    // CLUBES
    // ==========================================
    async getClubs(filters: ClubFilters = {}, page = 1, pageSize = 20): Promise<PaginatedClubs> {
        try {
            const payload = {
                SearchText: filters.search || '',
                PageNumber: page,
                PageSize: pageSize,
                Status: filters.status || null,
            };

            console.log('📤 Buscando clubes:', payload);

            const { data: response } = await mdl05Client.post(`${BASE}/club/history`, payload);

            console.log('📥 Respuesta recibida:', {
                hasData: !!response.Data,
                length: response.Data?.length || 0,
            });

            const dataArray = response.Data || response || [];
            const clubs: Club[] = dataArray.map(mapClubResponse);
            const total = dataArray[0]?.TotalRegisters || response.TotalRegisters || clubs.length;

            return {
                data: clubs,
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            };
        } catch (error: any) {
            console.error('❌ Error en getClubs:', error.message);

            // Si es error 400, loguear más detalles
            if (error.response?.status === 400) {
                console.error('📋 Detalles del error 400:', error.response?.data);
            }

            return { data: [], total: 0, page, pageSize, totalPages: 0 };
        }
    },

    async getClubById(clubId: string): Promise<Club | null> {
        try {
            const { data } = await mdl05Client.get(`${BASE}/getClub/${clubId}`);
            return data ? mapClubResponse(data) : null;
        } catch (error) {
            console.error('Error en getClubById:', error);
            return null;
        }
    },

    async createClub(dto: CreateClubDTO): Promise<Club> {
        const payload = {
            saaSId: dto.saaSId || 2,
            ClubTypeId: dto.clubTypeId,
            CustomerId: dto.customerId,
            SalesAgentId: dto.salesAgentId,
            DenominationId: dto.denominationId,
            StoreId: dto.storeId,
            Share: dto.share,
            StartDate: dto.startDate,
        };
        console.log('📤 Creando club:', payload);
        const { data } = await mdl05Client.post(`${BASE}/createClub`, payload);
        return mapClubResponse(data);
    },

    async updateClub(clubId: string, dto: UpdateClubDTO): Promise<Club> {
        const { data } = await mdl05Client.patch(`${BASE}/updateClub/${clubId}`, dto);
        return mapClubResponse(data);
    },

    async deleteClub(clubId: string): Promise<void> {
        await mdl05Client.delete(`${BASE}/deleteClub/${clubId}`);
    },

    // ==========================================
    // SEMANAS
    // ==========================================
    async getClubWeeks(clubId: string): Promise<ClubWeek[]> {
        const { data } = await mdl05Client.get(`${BASE}/getClubWeeks/${clubId}`);
        return data || [];
    },

    async payWeek(clubId: string, weekNumber: number, amount: number): Promise<ClubWeek> {
        const { data } = await mdl05Client.post(`${BASE}/payClubWeek`, { clubId, weekNumber, amount });
        return data;
    },

    // ==========================================
    // TRANSACCIONES
    // ==========================================
    async getClubTransactions(clubId: string): Promise<ClubTransaction[]> {
        const { data } = await mdl05Client.get(`${BASE}/getClubTransactions/${clubId}`);
        return data || [];
    },

    async createTransaction(clubId: string, dto: CreateTransactionDTO): Promise<ClubTransaction> {
        const { data } = await mdl05Client.post(`${BASE}/createClubTransaction`, { clubId, ...dto });
        return data;
    },

    // ==========================================
    // CATÁLOGOS
    // ==========================================
    async getClubTypes(): Promise<ClubType[]> {
        // TODO: Reemplazar con endpoint real cuando esté disponible
        return Promise.resolve(mockClubTypes);
    },

    async getClubStatuses(): Promise<ClubStatus[]> {
        return Promise.resolve(mockStatuses);
    },

    async getDenominations(): Promise<Denomination[]> {
        return Promise.resolve(mockDenominations);
    },

    // ==========================================
    // STATS
    // ==========================================
    async getClubStats(clubId: string): Promise<ClubStats> {
        const { data } = await mdl05Client.get(`${BASE}/getClubStats/${clubId}`);
        return data;
    },

    async getClubHistory(clubId: string): Promise<any[]> {
        const { data } = await mdl05Client.get(`${BASE}/getClubHistory/${clubId}`);
        return data || [];
    },

    // ==========================================
    // REGLAS
    // ==========================================
    async getClubRules(): Promise<ClubRule[]> {
        const { data } = await mdl05Client.get(`${BASE}/getClubRules`);
        return data || [];
    },

    async createRule(dto: Partial<ClubRule>): Promise<ClubRule> {
        const { data } = await mdl05Client.post(`${BASE}/createClubRule`, dto);
        return data;
    },

    async updateRule(ruleId: string, dto: Partial<ClubRule>): Promise<ClubRule> {
        const { data } = await mdl05Client.patch(`${BASE}/updateClubRule/${ruleId}`, dto);
        return data;
    },

    async deleteRule(ruleId: string): Promise<void> {
        await mdl05Client.delete(`${BASE}/deleteClubRule/${ruleId}`);
    },

    // ==========================================
    // SORTEOS
    // ==========================================
    async getDraws(clubTypeId?: string, dateFrom?: string, dateTo?: string): Promise<Draw[]> {
        const params = new URLSearchParams();
        if (clubTypeId) params.append('clubTypeId', clubTypeId);
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);
        const { data } = await mdl05Client.get(`${BASE}/getDraws?${params}`);
        return data || [];
    },

    async registerDraw(dto: { date: string; numberPlayed: number; clubTypeId: string }): Promise<Draw> {
        const { data } = await mdl05Client.post(`${BASE}/registerDraw`, dto);
        return data;
    },

    // ==========================================
    // LÍMITES
    // ==========================================
    async getLimitNumbers(): Promise<LimitNumber[]> {
        const { data } = await mdl05Client.get(`${BASE}/getLimitNumbers`);
        return data || [];
    },

    async updateLimitNumber(number: number, limit: number): Promise<LimitNumber> {
        const { data } = await mdl05Client.patch(`${BASE}/updateLimitNumber/${number}`, { limit });
        return data;
    },
};