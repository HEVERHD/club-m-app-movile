// src/api/clubs.api.ts - OPTIMIZADO PARA LENTITUD DEL BACKEND
import { mdl05Client } from './client';
import {
    mockClubTypes,
    mockDenominations,
    mockClubStatuses,
    mockTransactionTypes,
    DEFAULT_VALUES,
} from '../data/mockData';
import type {
    Club, ClubFilters, PaginatedClubs, CreateClubDTO, UpdateClubDTO,
    ClubType, ClubStatus, Denomination, ClubWeek, ClubTransaction,
    ClubRule, Draw, LimitNumber, ClubStats, CreateTransactionDTO,
} from '../types/clubs';

const BASE = '/mdl05';

// ============================================
// CACHE LOCAL EN MEMORIA
// ============================================
interface ClubCache {
    data: Club[];
    timestamp: number;
    totalRegisters: number;
}

let clubsCache: ClubCache | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const isCacheValid = (): boolean => {
    if (!clubsCache) return false;
    return Date.now() - clubsCache.timestamp < CACHE_DURATION;
};

export const clearClubsCache = () => {
    clubsCache = null;
    console.log('🗑️ Cache de clubes limpiado');
};

// ============================================
// MAPPER
// ============================================
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

// ============================================
// HELPER: Retry con backoff
// ============================================
const fetchWithRetry = async <T>(
    fn: () => Promise<T>,
    retries = 2,
    delay = 2000
): Promise<T> => {
    try {
        return await fn();
    } catch (error: any) {
        if (retries > 0 && (!error.response || error.code === 'ECONNABORTED')) {
            console.log(`🔄 Reintentando... (${retries} intentos restantes)`);
            await new Promise(r => setTimeout(r, delay));
            return fetchWithRetry(fn, retries - 1, delay * 1.5);
        }
        throw error;
    }
};

// ============================================
// API
// ============================================
export const clubApi = {
    // ==========================================
    // CLUBES - CON CACHE
    // ==========================================
    async getClubs(filters: ClubFilters = {}, page = 1, pageSize = 20, forceRefresh = false): Promise<PaginatedClubs> {
        try {
            const hasFilters = filters.search || filters.status;

            // Usar cache si es válido y no hay filtros y no es refresh forzado
            if (!forceRefresh && !hasFilters && isCacheValid() && clubsCache) {
                console.log('📦 Usando cache de clubes');
                const start = (page - 1) * pageSize;
                const paginatedData = clubsCache.data.slice(start, start + pageSize);

                return {
                    data: paginatedData,
                    total: clubsCache.totalRegisters,
                    page,
                    pageSize,
                    totalPages: Math.ceil(clubsCache.totalRegisters / pageSize),
                };
            }

            const payload = {
                SearchText: filters.search || '',
                PageNumber: 1, // Siempre pedir desde el inicio para cache
                PageSize: 100, // Pedir más para cachear
                Status: filters.status || null,
            };

            console.log('📤 Buscando clubes (puede tardar)...', payload);

            const { data: response } = await fetchWithRetry(() =>
                mdl05Client.post(`${BASE}/club/history`, payload)
            );

            const dataArray = response.Data || response || [];
            const clubs: Club[] = dataArray.map(mapClubResponse);
            const total = dataArray[0]?.TotalRegisters || response.TotalRegisters || clubs.length;

            // Guardar en cache si no hay filtros
            if (!hasFilters) {
                clubsCache = {
                    data: clubs,
                    timestamp: Date.now(),
                    totalRegisters: total,
                };
                console.log(`✅ Cache actualizado: ${clubs.length} clubes`);
            }

            // Paginar desde cache
            const start = (page - 1) * pageSize;
            const paginatedData = clubs.slice(start, start + pageSize);

            console.log(`✅ Clubes obtenidos: ${paginatedData.length} de ${total}`);

            return {
                data: paginatedData,
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize)
            };
        } catch (error: any) {
            console.error('❌ Error en getClubs:', error.message);

            // Si falla pero hay cache, usar cache aunque esté expirado
            if (clubsCache && clubsCache.data.length > 0) {
                console.log('⚠️ Usando cache expirado por error de red');
                const start = (page - 1) * pageSize;
                const paginatedData = clubsCache.data.slice(start, start + pageSize);

                return {
                    data: paginatedData,
                    total: clubsCache.totalRegisters,
                    page,
                    pageSize,
                    totalPages: Math.ceil(clubsCache.totalRegisters / pageSize),
                };
            }

            return { data: [], total: 0, page, pageSize, totalPages: 0 };
        }
    },

    // Obtener club por ID desde cache o API
    async getClubById(clubId: string): Promise<Club | null> {
        // Primero buscar en cache
        if (clubsCache?.data) {
            const cached = clubsCache.data.find(c => c.clubId === clubId);
            if (cached) {
                console.log('📦 Club encontrado en cache');
                return cached;
            }
        }

        // Si no está en cache, buscar en API
        try {
            const result = await this.getClubs({ search: '' }, 1, 100);
            return result.data.find(c => c.clubId === clubId) || null;
        } catch (error) {
            console.error('Error en getClubById:', error);
            return null;
        }
    },

    // Forzar recarga del cache
    async refreshClubs(): Promise<PaginatedClubs> {
        clearClubsCache();
        return this.getClubs({}, 1, 20, true);
    },

    async createClub(dto: CreateClubDTO): Promise<Club> {
        const payload = {
            saaSId: dto.saaSId || DEFAULT_VALUES.saaSId,
            ClubTypeId: dto.clubTypeId,
            CustomerId: dto.customerId,
            SalesAgentId: dto.salesAgentId || DEFAULT_VALUES.salesAgentId,
            DenominationId: dto.denominationId,
            StoreId: dto.storeId || DEFAULT_VALUES.storeId,
            Share: dto.share,
            StartDate: dto.startDate,
        };

        console.log('🚀 Creando club con payload:', JSON.stringify(payload, null, 2));

        const { data } = await mdl05Client.post(`${BASE}/createClub`, payload);

        // Limpiar cache para que recargue con el nuevo club
        clearClubsCache();

        console.log('✅ Club creado:', data);
        return mapClubResponse(data);
    },

    async updateClub(clubId: string, dto: UpdateClubDTO): Promise<Club> {
        const { data } = await mdl05Client.patch(`${BASE}/updateClub/${clubId}`, dto);
        clearClubsCache();
        return mapClubResponse(data);
    },

    async deleteClub(clubId: string): Promise<void> {
        await mdl05Client.delete(`${BASE}/deleteClub/${clubId}`);
        clearClubsCache();
    },

    // ==========================================
    // CATÁLOGOS - Usando datos locales (rápido)
    // ==========================================
    async getClubTypes(): Promise<ClubType[]> {
        return Promise.resolve(mockClubTypes);
    },

    async getClubStatuses(): Promise<ClubStatus[]> {
        return Promise.resolve(mockClubStatuses);
    },

    async getDenominations(): Promise<Denomination[]> {
        return Promise.resolve(mockDenominations);
    },

    async getTransactionTypes(): Promise<any[]> {
        return Promise.resolve(mockTransactionTypes);
    },

    // ==========================================
    // OTROS ENDPOINTS
    // ==========================================
    async getClubWeeks(clubId: string): Promise<ClubWeek[]> {
        const { data } = await mdl05Client.get(`${BASE}/getClubWeeks/${clubId}`);
        return data || [];
    },

    async getClubTransactions(clubId: string): Promise<ClubTransaction[]> {
        const { data } = await mdl05Client.get(`${BASE}/getClubTransactions/${clubId}`);
        return data || [];
    },

    async searchCustomers(searchText: string): Promise<any[]> {
        try {
            const { data } = await mdl05Client.post(`/core/searchCustomers/post`, {
                SearchText: searchText,
                PageNumber: 1,
                PageSize: 20,
            });
            return data?.Data || [];
        } catch (error) {
            console.error('Error buscando clientes:', error);
            return [];
        }
    },

    /**
     * Obtener estadísticas de clubs de un cliente por su cédula
     * @param identificationNumber - Cédula del cliente (ej: "9-777-7777")
     */
    async getCustomerClubStats(identificationNumber: string): Promise<{
        totalClubs: number;
        activeClubs: number;
        totalInvested: number;
        totalBalance: number;
        totalRedeemed: number;
        averageShare: number;
        lastActivity?: string;
    }> {
        try {
            console.log('📊 [clubs.api] Obteniendo estadísticas para cédula:', identificationNumber);

            // Buscar clubes por cédula usando SearchText
            const { data } = await mdl05Client.post('/mdl05/club/history', {
                SearchText: identificationNumber,
                PageNumber: 1,
                PageSize: 100,
                Status: null,
            });

            const clubs = data?.Data || [];
            const activeClubs = clubs.filter((c: any) => c.NameStatus === 'Activo');

            console.log(`✅ [clubs.api] Se encontraron ${clubs.length} clubs para cédula ${identificationNumber}`);

            return {
                totalClubs: clubs.length,
                activeClubs: activeClubs.length,
                totalInvested: clubs.reduce((sum: number, c: any) => sum + Math.abs(c.BalanceAmount || 0), 0),
                totalBalance: clubs.reduce((sum: number, c: any) => sum + (c.BalanceAmount || 0), 0),
                totalRedeemed: 0, // No disponible en este endpoint
                averageShare: clubs.length > 0
                    ? clubs.reduce((sum: number, c: any) => sum + (c.Share || 0), 0) / clubs.length
                    : 0,
                lastActivity: clubs.length > 0
                    ? clubs.sort((a: any, b: any) =>
                        new Date(b.CreatedDate).getTime() - new Date(a.CreatedDate).getTime()
                      )[0].CreatedDate
                    : undefined,
            };
        } catch (error: any) {
            console.error('❌ [clubs.api] Error obteniendo estadísticas:', error);
            return {
                totalClubs: 0,
                activeClubs: 0,
                totalInvested: 0,
                totalBalance: 0,
                totalRedeemed: 0,
                averageShare: 0,
            };
        }
    },
};