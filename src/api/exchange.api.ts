// src/api/exchange.api.ts
import { mdl05Client } from './client';

// ============================================
// TYPES - Exportados para usar en otros archivos
// ============================================

/** Club disponible para consumo de saldo */
export interface ClubForExchange {
    clubId: string;
    contractNumber: string;
    share: number;
    clubTypeName: string;
    denomination: number;
    balance: number;
    statusName: string;
    customerId: string;
    customerName: string;
}

/** Request para el endpoint de Exchange */
export interface ExchangeRequest {
    saaSId: number;
    clubId: string;
    transactionId: string;
    transactionTypeId: string;
    transactionNumber: string;
    date: string;
    amount: number;
    comment: string | null;
}

/** Respuesta del endpoint de Exchange */
export interface ExchangeResponse {
    success: boolean;
    transactionId: string;
    message: string;
    amountUsed: number;
    newBalance: number;
}

/** Resultado de un consumo (usado para el recibo) */
export interface ExchangeResult {
    clubId: string;
    contractNumber: string;
    amountUsed: number;
    previousBalance: number;
    newBalance: number;
    transactionId: string;
}

// Transaction Type for Exchange
export const EXCHANGE_TRANSACTION_TYPE = 'ED8C9F3F-929C-47F9-88FD-C5D65A703074';

// ============================================
// HELPERS
// ============================================
const generateTransactionId = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16).toUpperCase();
    });
};

const formatDateTime = (date: Date): string => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const pad3 = (n: number) => n.toString().padStart(3, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
        `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad3(date.getMilliseconds())}`;
};

// ============================================
// MAPPER
// ============================================
const mapClubForExchange = (club: any): ClubForExchange => ({
    clubId: club.ClubId || club.clubId || '',
    contractNumber: club.ContractNumber || club.contractNumber || '',
    share: club.Share || club.share || 0,
    clubTypeName: club.NameClubType || club.ClubTypeName || club.clubTypeName || 'Club',
    denomination: club.Denomination || club.denomination || club.DenominationAmount || 0,
    balance: club.BalanceAmount || club.balanceAmount || club.Balance || 0,
    statusName: club.NameStatus || club.StatusName || club.statusName || '',
    customerId: club.CustomerId || club.customerId || '',
    customerName: club.CustomerName || club.customerName || '',
});

// ============================================
// API METHODS
// ============================================
export const exchangeApi = {
    /**
     * Obtener clubs del cliente con balance disponible para consumo
     * Solo retorna clubs activos con balance > 0
     */
    async getClubsForExchange(customerId?: string): Promise<ClubForExchange[]> {
        try {
            const { data: response } = await mdl05Client.post('/mdl05/club/history', {
                SearchText: customerId || '',
                PageNumber: 1,
                PageSize: 100,
                Status: null,
            });

            const clubs = response.Data || response || [];

            // Filtrar solo clubs activos con balance positivo
            const availableClubs = clubs
                .map(mapClubForExchange)
                .filter((club: ClubForExchange) => {
                    const isActive = club.statusName?.toLowerCase() === 'activo' ||
                        club.statusName?.toLowerCase() === 'active' ||
                        club.statusName?.toLowerCase() === 'en juego';
                    const hasBalance = club.balance > 0;
                    return isActive && hasBalance;
                })
                .sort((a: ClubForExchange, b: ClubForExchange) => b.balance - a.balance); // Mayor balance primero

            console.log(`📦 Clubs disponibles para consumo: ${availableClubs.length}`);
            return availableClubs;
        } catch (error: any) {
            console.error('❌ Error obteniendo clubs para consumo:', error.message);
            throw error;
        }
    },

    /**
     * Realizar consumo/canje de saldo
     * POST /ClubTransaction/Exchange
     */
    async exchange(
        clubId: string,
        amount: number,
        comment?: string
    ): Promise<ExchangeResponse> {
        const payload: ExchangeRequest = {
            saaSId: 2,
            clubId: clubId,
            transactionId: generateTransactionId(),
            transactionTypeId: EXCHANGE_TRANSACTION_TYPE,
            transactionNumber: `EXC-${Date.now()}`,
            date: formatDateTime(new Date()),
            amount: amount,
            comment: comment || null,
        };

        console.log('💳 Procesando consumo:', JSON.stringify(payload, null, 2));

        const { data } = await mdl05Client.post('/ClubTransaction/Exchange', payload);

        console.log('✅ Respuesta consumo:', JSON.stringify(data, null, 2));

        // Verificar errores en respuesta
        if (data?.Status?.Code && data.Status.Code !== 200) {
            throw new Error(data.Status.Message || 'Error al procesar el consumo');
        }

        if (data?.Data?.code && data.Data.code !== 200) {
            throw new Error(data.Data.message || 'Error al procesar el consumo');
        }

        return {
            success: true,
            transactionId: data?.Data?.TransactionId || payload.transactionId,
            message: data?.Data?.Message || 'Consumo realizado exitosamente',
            amountUsed: amount,
            newBalance: data?.Data?.NewBalance || data?.Data?.BalanceAmount || 0,
        };
    },

    /**
     * Consumo múltiple - usa varios clubs para cubrir un monto
     * Útil cuando un solo club no tiene suficiente balance
     */
    async multiExchange(
        clubs: Array<{ clubId: string; amount: number; contractNumber: string; currentBalance: number }>,
        totalAmount: number,
        comment?: string
    ): Promise<ExchangeResult[]> {
        const results: ExchangeResult[] = [];
        let remainingAmount = totalAmount;

        for (const club of clubs) {
            if (remainingAmount <= 0) break;

            const amountToUse = Math.min(club.amount, remainingAmount);

            try {
                const response = await this.exchange(club.clubId, amountToUse, comment);

                results.push({
                    clubId: club.clubId,
                    contractNumber: club.contractNumber,
                    amountUsed: amountToUse,
                    previousBalance: club.currentBalance,
                    newBalance: response.newBalance,
                    transactionId: response.transactionId,
                });

                remainingAmount -= amountToUse;
            } catch (error: any) {
                console.error(`❌ Error en consumo del club ${club.contractNumber}:`, error.message);
                // Continuar con el siguiente club si falla uno
                results.push({
                    clubId: club.clubId,
                    contractNumber: club.contractNumber,
                    amountUsed: 0,
                    previousBalance: club.currentBalance,
                    newBalance: club.currentBalance,
                    transactionId: '',
                });
            }
        }

        return results;
    },

    /**
     * Validar si el monto puede ser cubierto por los clubs disponibles
     */
    validateAmount(clubs: ClubForExchange[], amount: number): {
        canCover: boolean;
        totalAvailable: number;
        shortage: number;
        suggestedClubs: Array<{ club: ClubForExchange; amountToUse: number }>;
    } {
        const totalAvailable = clubs.reduce((sum, c) => sum + c.balance, 0);
        const canCover = totalAvailable >= amount;

        // Calcular qué clubs usar (estrategia: usar los de mayor balance primero)
        const suggestedClubs: Array<{ club: ClubForExchange; amountToUse: number }> = [];
        let remaining = amount;

        for (const club of clubs) {
            if (remaining <= 0) break;
            const toUse = Math.min(club.balance, remaining);
            suggestedClubs.push({ club, amountToUse: toUse });
            remaining -= toUse;
        }

        return {
            canCover,
            totalAvailable,
            shortage: canCover ? 0 : amount - totalAvailable,
            suggestedClubs,
        };
    },
};