/**
 * Points API - Mock Implementation
 * Sistema de puntos acumulados del cliente
 *
 * Este archivo contiene datos mock que simulan la respuesta del backend.
 * Cuando el backend esté disponible, reemplazar las funciones mock con llamadas reales.
 */

// ============ TYPES ============

export type PointsTransactionType = 'earned' | 'redeemed' | 'expired' | 'bonus' | 'adjustment';

export interface PointsTransaction {
    id: string;
    type: PointsTransactionType;
    amount: number;
    description: string;
    date: string; // ISO date string
    clubId?: string;
    clubName?: string;
    contractNumber?: string;
    expiresAt?: string; // ISO date string - when these points expire
}

export interface PointsSummary {
    totalEarned: number;
    totalRedeemed: number;
    availablePoints: number;
    expiringSoon: number; // Points expiring in next 30 days
    expiringDate?: string; // When the nearest points expire
}

export interface GetPointsResponse {
    summary: PointsSummary;
    transactions: PointsTransaction[];
}

export interface RedeemPointsResponse {
    success: boolean;
    message: string;
    transactionId?: string;
    newBalance?: number;
}

// ============ MOCK DATA ============

const generateMockTransactions = (): PointsTransaction[] => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    return [
        // Recent earnings
        {
            id: 'pt-001',
            type: 'earned',
            amount: 50,
            description: 'Pago semanal - Club Miercoles',
            date: new Date(now - 2 * day).toISOString(),
            clubId: 'club-001',
            clubName: 'Club Miercoles #1234',
            contractNumber: 'C-2024-1234',
            expiresAt: new Date(now + 365 * day).toISOString(),
        },
        {
            id: 'pt-002',
            type: 'earned',
            amount: 30,
            description: 'Pago semanal - Club Domingo',
            date: new Date(now - 5 * day).toISOString(),
            clubId: 'club-002',
            clubName: 'Club Domingo #5678',
            contractNumber: 'C-2024-5678',
            expiresAt: new Date(now + 365 * day).toISOString(),
        },
        {
            id: 'pt-003',
            type: 'bonus',
            amount: 100,
            description: 'Bono de bienvenida',
            date: new Date(now - 7 * day).toISOString(),
            expiresAt: new Date(now + 30 * day).toISOString(), // Expiring soon!
        },
        {
            id: 'pt-004',
            type: 'earned',
            amount: 25,
            description: 'Referido exitoso',
            date: new Date(now - 10 * day).toISOString(),
            expiresAt: new Date(now + 365 * day).toISOString(),
        },
        {
            id: 'pt-005',
            type: 'redeemed',
            amount: -150,
            description: 'Canje por descuento en tienda',
            date: new Date(now - 14 * day).toISOString(),
        },
        {
            id: 'pt-006',
            type: 'earned',
            amount: 50,
            description: 'Pago semanal - Club Miercoles',
            date: new Date(now - 16 * day).toISOString(),
            clubId: 'club-001',
            clubName: 'Club Miercoles #1234',
            contractNumber: 'C-2024-1234',
            expiresAt: new Date(now + 349 * day).toISOString(),
        },
        {
            id: 'pt-007',
            type: 'bonus',
            amount: 75,
            description: 'Promocion Navidad 2024',
            date: new Date(now - 20 * day).toISOString(),
            expiresAt: new Date(now + 25 * day).toISOString(), // Expiring soon!
        },
        {
            id: 'pt-008',
            type: 'earned',
            amount: 30,
            description: 'Pago semanal - Club Domingo',
            date: new Date(now - 21 * day).toISOString(),
            clubId: 'club-002',
            clubName: 'Club Domingo #5678',
            contractNumber: 'C-2024-5678',
            expiresAt: new Date(now + 344 * day).toISOString(),
        },
        {
            id: 'pt-009',
            type: 'redeemed',
            amount: -200,
            description: 'Canje por producto gratis',
            date: new Date(now - 30 * day).toISOString(),
        },
        {
            id: 'pt-010',
            type: 'expired',
            amount: -50,
            description: 'Puntos expirados',
            date: new Date(now - 35 * day).toISOString(),
        },
        {
            id: 'pt-011',
            type: 'earned',
            amount: 50,
            description: 'Pago semanal - Club Miercoles',
            date: new Date(now - 37 * day).toISOString(),
            clubId: 'club-001',
            clubName: 'Club Miercoles #1234',
            expiresAt: new Date(now + 328 * day).toISOString(),
        },
        {
            id: 'pt-012',
            type: 'adjustment',
            amount: 25,
            description: 'Ajuste por error en sistema',
            date: new Date(now - 40 * day).toISOString(),
            expiresAt: new Date(now + 325 * day).toISOString(),
        },
        {
            id: 'pt-013',
            type: 'earned',
            amount: 30,
            description: 'Pago semanal - Club Domingo',
            date: new Date(now - 42 * day).toISOString(),
            clubId: 'club-002',
            clubName: 'Club Domingo #5678',
            expiresAt: new Date(now + 323 * day).toISOString(),
        },
        {
            id: 'pt-014',
            type: 'bonus',
            amount: 50,
            description: 'Bono por pago adelantado',
            date: new Date(now - 45 * day).toISOString(),
            clubId: 'club-001',
            clubName: 'Club Miercoles #1234',
            expiresAt: new Date(now + 320 * day).toISOString(),
        },
        {
            id: 'pt-015',
            type: 'earned',
            amount: 50,
            description: 'Pago semanal - Club Miercoles',
            date: new Date(now - 51 * day).toISOString(),
            clubId: 'club-001',
            clubName: 'Club Miercoles #1234',
            expiresAt: new Date(now + 314 * day).toISOString(),
        },
    ];
};

const calculateSummary = (transactions: PointsTransaction[]): PointsSummary => {
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    let totalEarned = 0;
    let totalRedeemed = 0;
    let expiringSoon = 0;
    let nearestExpiry: string | undefined;

    transactions.forEach(tx => {
        if (tx.type === 'earned' || tx.type === 'bonus' || tx.type === 'adjustment') {
            if (tx.amount > 0) totalEarned += tx.amount;
        }
        if (tx.type === 'redeemed') {
            totalRedeemed += Math.abs(tx.amount);
        }
        if (tx.type === 'expired') {
            // Already deducted from available
        }

        // Check expiring soon (only for positive amounts with expiry)
        if (tx.expiresAt && tx.amount > 0) {
            const expiryDate = new Date(tx.expiresAt).getTime();
            if (expiryDate > now && expiryDate < now + thirtyDays) {
                expiringSoon += tx.amount;
                if (!nearestExpiry || expiryDate < new Date(nearestExpiry).getTime()) {
                    nearestExpiry = tx.expiresAt;
                }
            }
        }
    });

    // Calculate expired amount
    const expiredAmount = transactions
        .filter(tx => tx.type === 'expired')
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    const availablePoints = totalEarned - totalRedeemed - expiredAmount;

    return {
        totalEarned,
        totalRedeemed,
        availablePoints,
        expiringSoon,
        expiringDate: nearestExpiry,
    };
};

// ============ API FUNCTIONS ============

/**
 * Get points summary and transaction history for a customer
 * @param customerId - Customer ID (not used in mock, but will be needed for real API)
 */
export async function getPoints(customerId?: string): Promise<GetPointsResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const transactions = generateMockTransactions();
    const summary = calculateSummary(transactions);

    return {
        summary,
        transactions,
    };
}

/**
 * Get only the points summary (lighter call)
 */
export async function getPointsSummary(customerId?: string): Promise<PointsSummary> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const transactions = generateMockTransactions();
    return calculateSummary(transactions);
}

/**
 * Get transaction history with optional filters
 */
export async function getPointsHistory(
    customerId?: string,
    options?: {
        type?: PointsTransactionType;
        limit?: number;
        offset?: number;
    }
): Promise<PointsTransaction[]> {
    await new Promise(resolve => setTimeout(resolve, 600));

    let transactions = generateMockTransactions();

    // Apply type filter
    if (options?.type) {
        transactions = transactions.filter(tx => tx.type === options.type);
    }

    // Apply pagination
    const offset = options?.offset || 0;
    const limit = options?.limit || transactions.length;
    transactions = transactions.slice(offset, offset + limit);

    return transactions;
}

/**
 * Redeem points for a reward
 * @param amount - Amount of points to redeem
 * @param reason - Description of what the points are being used for
 */
export async function redeemPoints(
    amount: number,
    reason: string,
    customerId?: string
): Promise<RedeemPointsResponse> {
    // Simulate network delay (longer for transaction)
    await new Promise(resolve => setTimeout(resolve, 1200));

    const transactions = generateMockTransactions();
    const summary = calculateSummary(transactions);

    // Validate
    if (amount <= 0) {
        return {
            success: false,
            message: 'La cantidad de puntos debe ser mayor a 0',
        };
    }

    if (amount > summary.availablePoints) {
        return {
            success: false,
            message: `No tienes suficientes puntos. Disponibles: ${summary.availablePoints}`,
        };
    }

    // Mock successful redemption
    const transactionId = `redeem-${Date.now()}`;

    return {
        success: true,
        message: `Has canjeado ${amount} puntos exitosamente`,
        transactionId,
        newBalance: summary.availablePoints - amount,
    };
}

// ============ HELPER FUNCTIONS ============

export function getTransactionTypeLabel(type: PointsTransactionType): string {
    const labels: Record<PointsTransactionType, string> = {
        earned: 'Ganados',
        redeemed: 'Canjeados',
        expired: 'Expirados',
        bonus: 'Bonus',
        adjustment: 'Ajuste',
    };
    return labels[type];
}

export function getTransactionTypeIcon(type: PointsTransactionType): string {
    const icons: Record<PointsTransactionType, string> = {
        earned: 'add-circle',
        redeemed: 'gift',
        expired: 'time',
        bonus: 'star',
        adjustment: 'swap-horizontal',
    };
    return icons[type];
}

export function getTransactionTypeColor(type: PointsTransactionType): string {
    const colors: Record<PointsTransactionType, string> = {
        earned: '#22c55e', // green
        redeemed: '#8b5cf6', // purple
        expired: '#ef4444', // red
        bonus: '#f59e0b', // amber
        adjustment: '#3b82f6', // blue
    };
    return colors[type];
}

export function formatPointsAmount(amount: number): string {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}${amount.toLocaleString()} pts`;
}
