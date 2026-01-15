// src/api/payments.api.ts
import { mdl05Client } from './client';

const BASE = '/mdl05';

// ============================================
// TYPES
// ============================================
export interface ClubWeek {
    weekNumber: number;
    drawDate: string;
    paymentDate: string | null;
    status: 'paid' | 'unpaid' | 'late';
    amount: number;
}

export interface ClubDetail {
    clubId: string;
    contractNumber: string;
    customerId: string;
    customerName: string;
    customerIdentification: string;
    share: number;
    denomination: number;
    clubType: string;
    clubTypeName: string;
    statusName: string;
    balance: number;
    weeksPaid: number;
    weeksTotal: number;
    nextDrawDate: string;
    weeks: ClubWeek[];
}

export interface PaymentRequest {
    saaSId: number;
    clubId: string;
    transactionId: string;
    transactionTypeId: string;
    transactionNumber: string;
    date: string;
    amount: number;
    balanceAmount: number;
    comment: string;
}

export interface PaymentResponse {
    success: boolean;
    transactionId: string;
    message: string;
    newBalance: number;
}

// Transaction Type IDs (del Postman collection)
export const TRANSACTION_TYPES = {
    PAYMENT: '04d155a7-7dfc-4a9a-9814-64fb69488d4b',
    EXCHANGE: 'ED8C9F3F-929C-47F9-88FD-C5D65A703074',
} as const;

// ============================================
// MAPPERS
// ============================================
const mapWeekResponse = (w: any, denomination: number): ClubWeek => {
    const isPaid = w.PaymentDate || w.paymentDate || w.Estado === 'Pagada' || w.status === 'paid';
    const drawDate = w.DrawDate || w.drawDate || w.FechaSorteo || '';
    const today = new Date();
    const drawDateObj = new Date(drawDate);
    const isLate = !isPaid && drawDateObj < today;

    return {
        weekNumber: w.WeekNumber || w.weekNumber || w.Semana || 0,
        drawDate: drawDate,
        paymentDate: w.PaymentDate || w.paymentDate || w.FechaPago || null,
        status: isPaid ? 'paid' : isLate ? 'late' : 'unpaid',
        amount: w.Amount || w.amount || denomination || 0,
    };
};

const mapClubDetailResponse = (data: any): ClubDetail => {
    const club = data.Club || data.club || data;
    const weeksData = data.Weeks || data.weeks || data.Semanas || [];
    const denomination = club.Denomination || club.denomination || club.Denominacion || 5;

    return {
        clubId: club.ClubId || club.clubId || '',
        contractNumber: club.ContractNumber || club.contractNumber || '',
        customerId: club.CustomerId || club.customerId || '',
        customerName: club.CustomerName || club.customerName || 'Sin nombre',
        customerIdentification: club.NumberId || club.IDNumber || club.customerIdentification || '',
        share: club.Share || club.share || 0,
        denomination: denomination,
        clubType: club.ClubTypeId || club.clubTypeId || '',
        clubTypeName: club.ClubTypeName || club.clubTypeName || club.TipoClub || 'Club',
        statusName: club.StatusName || club.statusName || club.Estado || 'Activo',
        balance: club.BalanceAmount || club.balanceAmount || club.Balance || 0,
        weeksPaid: club.WeeksPaid || club.weeksPaid || 0,
        weeksTotal: 52,
        nextDrawDate: club.NextDrawDate || club.nextDrawDate || '',
        weeks: weeksData.map((w: any) => mapWeekResponse(w, denomination)),
    };
};

// ============================================
// API METHODS
// ============================================
export const paymentsApi = {
    /**
     * Obtener detalle del club con semanas
     * Intenta primero el endpoint de detalle, si falla usa getClub + genera semanas
     * @param clubId - ID del club a buscar
     * @param customerIdentification - Cédula del cliente para filtrar y acelerar la búsqueda
     */
    async getClubDetail(clubId: string, customerIdentification?: string): Promise<ClubDetail> {
        try {
            // Usar el endpoint de history para buscar el club por ID
            // Si tenemos la cédula, filtrar por ella para acelerar la búsqueda
            const { data: response } = await mdl05Client.post(`${BASE}/club/history`, {
                SearchText: customerIdentification || '',
                PageNumber: 1,
                PageSize: 100,
                Status: null,
            });

            const clubs = response.Data || response || [];
            const club = clubs.find((c: any) =>
                (c.ClubId || c.clubId) === clubId
            );

            if (!club) {
                throw new Error('Club no encontrado');
            }

            console.log('📦 Club encontrado:', JSON.stringify(club, null, 2));

            // Mapear datos del club
            const denomination = club.Denomination || club.denomination ||
                club.DenominationAmount || 5;
            const weeksPaid = club.WeeksPaid || club.weeksPaid || 0;
            const startDate = new Date(club.StartDate || club.startDate || new Date());

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

            return {
                clubId: club.ClubId || club.clubId || clubId,
                contractNumber: club.ContractNumber || club.contractNumber || '',
                customerId: club.CustomerId || club.customerId || '',
                customerName: club.CustomerName || club.customerName || 'Sin nombre',
                customerIdentification: club.NumberId || club.IDNumber || club.customerIdentification || '',
                share: club.Share || club.share || 0,
                denomination,
                clubType: club.ClubTypeId || club.clubTypeId || '',
                clubTypeName: club.ClubTypeName || club.NameClubType || 'Club',
                statusName: club.NameStatus || club.statusName || 'Activo',
                balance: club.BalanceAmount || club.balanceAmount || 0,
                weeksPaid,
                weeksTotal: 52,
                nextDrawDate: '',
                weeks,
            };
        } catch (error: any) {
            console.error('❌ Error en getClubDetail:', error.message);
            throw error;
        }
    },

    /**
     * Registrar pago de semanas
     * POST /mdl05/ClubTransaction/Payment
     */
    async registerPayment(
        clubId: string,
        amount: number,
        weeksCount: number,
        comment?: string
    ): Promise<PaymentResponse> {
        // Formato exacto del curl que funciona
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        const payload = {
            saaSId: 2,
            clubId: clubId,
            transactionId: "",
            transactionTypeId: TRANSACTION_TYPES.PAYMENT,
            transactionNumber: weeksCount.toString(),
            date: today,
            amount: amount,
            balanceAmount: 0.0,
            comment: comment || `${weeksCount} pagos`,
        };

        console.log('💳 Registrando pago:', JSON.stringify(payload, null, 2));

        const { data } = await mdl05Client.post(`${BASE}/ClubTransaction/Payment`, payload);

        console.log('✅ Respuesta pago:', JSON.stringify(data, null, 2));

        // Verificar si hay error dentro de Data
        if (data?.Data?.code && data.Data.code !== 200) {
            throw new Error(data.Data.message || 'Error al procesar el pago');
        }

        return {
            success: true,
            transactionId: data?.Data?.TransactionId || data?.Data?.transactionId || '',
            message: data?.Data?.message || 'Pago registrado exitosamente',
            newBalance: data?.Data?.NewBalance || data?.Data?.newBalance || data?.Data?.BalanceAmount || 0,
        };
    },

    /**
     * Obtener transacciones del club
     */
    async getTransactions(clubId: string): Promise<any[]> {
        try {
            const { data } = await mdl05Client.get(`${BASE}/club/transactions/${clubId}`);
            return data?.Data || data || [];
        } catch (error) {
            console.error('Error obteniendo transacciones:', error);
            return [];
        }
    },

    /**
     * Cancelar club
     * POST /MDL05/club/cancel
     */
    async cancelClub(clubId: string): Promise<{ success: boolean; message: string }> {
        console.log('🚫 Cancelando club:', clubId);

        const { data } = await mdl05Client.post(`${BASE}/club/cancel`, {
            clubId: clubId
        });

        console.log('✅ Respuesta cancelación:', JSON.stringify(data, null, 2));

        // Verificar si hay error
        if (data?.Status?.Code !== 200) {
            throw new Error(data?.Status?.Message || 'Error al cancelar el club');
        }

        return {
            success: true,
            message: data?.Data || 'Club cancelado exitosamente',
        };
    },

    /**
     * Registrar sorteo
     * POST /mdl05/Club/RegisterDraw
     */
    async registerDraw(params: {
        share: number | null;
        drawDate: string;
        alternativeHour?: string | null;
        alternativeDate?: string;
        comment?: string;
    }): Promise<{
        success: boolean;
        message: string;
        drawId: string;
        date: string;
    }> {
        const payload = {
            Share: params.share,
            DrawDate: params.drawDate,
            AlternativeHour: params.alternativeHour || null,
            AlternativeDate: params.alternativeDate || '',
            Comment: params.comment || '',
        };

        console.log('🎰 Registrando sorteo:', JSON.stringify(payload, null, 2));

        const { data } = await mdl05Client.post(`${BASE}/Club/RegisterDraw`, payload);

        console.log('✅ Respuesta sorteo:', JSON.stringify(data, null, 2));

        if (data?.Status?.Code !== 200 && data?.Data?.Status !== 200) {
            throw new Error(data?.Data?.Message || data?.Status?.Message || 'Error al registrar sorteo');
        }

        return {
            success: true,
            message: data?.Data?.Message || 'Sorteo registrado exitosamente',
            drawId: data?.Data?.DrawId || '',
            date: data?.Data?.Date || params.drawDate,
        };
    },
};