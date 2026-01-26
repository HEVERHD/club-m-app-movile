/**
 * Purchases API - Mock Implementation
 * Historial de compras y transacciones del cliente
 *
 * Este archivo contiene datos mock que simulan la respuesta del backend.
 * Cuando el backend esté disponible, reemplazar las funciones mock con llamadas reales.
 */

// ============ TYPES ============

export type PurchaseType = 'payment' | 'exchange' | 'penalty' | 'refund' | 'activation' | 'admin_fee';

export type PurchaseStatus = 'completed' | 'pending' | 'cancelled' | 'failed';

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'balance';

export interface Purchase {
    id: string;
    type: PurchaseType;
    amount: number;
    date: string; // ISO date string
    status: PurchaseStatus;
    description: string;
    // Related data
    clubId?: string;
    clubName?: string;
    contractNumber?: string;
    weekNumber?: number;
    // Payment details
    paymentMethod?: PaymentMethod;
    reference?: string;
    // Store info
    storeName?: string;
    storeId?: string;
}

export interface PurchasesSummary {
    totalTransactions: number;
    totalPaid: number; // Total amount paid
    totalRedeemed: number; // Total balance used/exchanged
    thisMonthAmount: number;
    lastMonthAmount: number;
}

export interface GetPurchasesResponse {
    summary: PurchasesSummary;
    purchases: Purchase[];
}

export interface PurchaseFilters {
    type?: PurchaseType;
    status?: PurchaseStatus;
    dateFrom?: string;
    dateTo?: string;
    clubId?: string;
}

// ============ MOCK DATA ============

const generateMockPurchases = (): Purchase[] => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const hour = 60 * 60 * 1000;

    return [
        // Today
        {
            id: 'pur-001',
            type: 'payment',
            amount: 10,
            date: new Date(now - 3 * hour).toISOString(),
            status: 'completed',
            description: 'Pago semana 8',
            clubId: 'club-001',
            clubName: 'Club Miercoles #1234',
            contractNumber: 'C-2024-1234',
            weekNumber: 8,
            paymentMethod: 'cash',
            storeName: 'Sucursal Centro',
        },
        // Yesterday
        {
            id: 'pur-002',
            type: 'exchange',
            amount: -75,
            date: new Date(now - 1 * day - 5 * hour).toISOString(),
            status: 'completed',
            description: 'Canje de balance',
            clubId: 'club-001',
            clubName: 'Club Miercoles #1234',
            contractNumber: 'C-2024-1234',
            paymentMethod: 'balance',
            storeName: 'Sucursal Norte',
            reference: 'EXC-2024-001',
        },
        {
            id: 'pur-003',
            type: 'payment',
            amount: 5,
            date: new Date(now - 1 * day - 8 * hour).toISOString(),
            status: 'completed',
            description: 'Pago semana 12',
            clubId: 'club-002',
            clubName: 'Club Domingo #5678',
            contractNumber: 'C-2024-5678',
            weekNumber: 12,
            paymentMethod: 'card',
            storeName: 'Sucursal Centro',
        },
        // This week
        {
            id: 'pur-004',
            type: 'payment',
            amount: 10,
            date: new Date(now - 3 * day).toISOString(),
            status: 'completed',
            description: 'Pago semana 7',
            clubId: 'club-001',
            clubName: 'Club Miercoles #1234',
            contractNumber: 'C-2024-1234',
            weekNumber: 7,
            paymentMethod: 'cash',
            storeName: 'Sucursal Centro',
        },
        {
            id: 'pur-005',
            type: 'payment',
            amount: 5,
            date: new Date(now - 4 * day).toISOString(),
            status: 'completed',
            description: 'Pago semana 11',
            clubId: 'club-002',
            clubName: 'Club Domingo #5678',
            contractNumber: 'C-2024-5678',
            weekNumber: 11,
            paymentMethod: 'transfer',
            storeName: 'Sucursal Sur',
            reference: 'TRF-2024-456',
        },
        // Last week
        {
            id: 'pur-006',
            type: 'payment',
            amount: 10,
            date: new Date(now - 8 * day).toISOString(),
            status: 'completed',
            description: 'Pago semana 6',
            clubId: 'club-001',
            clubName: 'Club Miercoles #1234',
            contractNumber: 'C-2024-1234',
            weekNumber: 6,
            paymentMethod: 'cash',
            storeName: 'Sucursal Centro',
        },
        {
            id: 'pur-007',
            type: 'exchange',
            amount: -50,
            date: new Date(now - 10 * day).toISOString(),
            status: 'completed',
            description: 'Canje de balance',
            clubId: 'club-002',
            clubName: 'Club Domingo #5678',
            contractNumber: 'C-2024-5678',
            paymentMethod: 'balance',
            storeName: 'Sucursal Centro',
            reference: 'EXC-2024-002',
        },
        // Two weeks ago
        {
            id: 'pur-008',
            type: 'payment',
            amount: 10,
            date: new Date(now - 14 * day).toISOString(),
            status: 'completed',
            description: 'Pago semana 5',
            clubId: 'club-001',
            clubName: 'Club Miercoles #1234',
            contractNumber: 'C-2024-1234',
            weekNumber: 5,
            paymentMethod: 'cash',
            storeName: 'Sucursal Centro',
        },
        {
            id: 'pur-009',
            type: 'penalty',
            amount: -15,
            date: new Date(now - 15 * day).toISOString(),
            status: 'completed',
            description: 'Penalizacion por mora',
            clubId: 'club-003',
            clubName: 'Club Miercoles #9999',
            contractNumber: 'C-2024-9999',
        },
        // Last month
        {
            id: 'pur-010',
            type: 'payment',
            amount: 5,
            date: new Date(now - 20 * day).toISOString(),
            status: 'completed',
            description: 'Pago semana 10',
            clubId: 'club-002',
            clubName: 'Club Domingo #5678',
            contractNumber: 'C-2024-5678',
            weekNumber: 10,
            paymentMethod: 'cash',
            storeName: 'Sucursal Norte',
        },
        {
            id: 'pur-011',
            type: 'payment',
            amount: 10,
            date: new Date(now - 21 * day).toISOString(),
            status: 'completed',
            description: 'Pago semana 4',
            clubId: 'club-001',
            clubName: 'Club Miercoles #1234',
            contractNumber: 'C-2024-1234',
            weekNumber: 4,
            paymentMethod: 'cash',
            storeName: 'Sucursal Centro',
        },
        {
            id: 'pur-012',
            type: 'activation',
            amount: 25,
            date: new Date(now - 25 * day).toISOString(),
            status: 'completed',
            description: 'Activacion de club',
            clubId: 'club-001',
            clubName: 'Club Miercoles #1234',
            contractNumber: 'C-2024-1234',
            paymentMethod: 'cash',
            storeName: 'Sucursal Centro',
        },
        {
            id: 'pur-013',
            type: 'payment',
            amount: 10,
            date: new Date(now - 28 * day).toISOString(),
            status: 'completed',
            description: 'Pago semana 3',
            clubId: 'club-001',
            clubName: 'Club Miercoles #1234',
            contractNumber: 'C-2024-1234',
            weekNumber: 3,
            paymentMethod: 'cash',
            storeName: 'Sucursal Centro',
        },
        // Two months ago
        {
            id: 'pur-014',
            type: 'payment',
            amount: 10,
            date: new Date(now - 35 * day).toISOString(),
            status: 'completed',
            description: 'Pago semana 2',
            clubId: 'club-001',
            clubName: 'Club Miercoles #1234',
            contractNumber: 'C-2024-1234',
            weekNumber: 2,
            paymentMethod: 'card',
            storeName: 'Sucursal Centro',
        },
        {
            id: 'pur-015',
            type: 'refund',
            amount: 20,
            date: new Date(now - 40 * day).toISOString(),
            status: 'completed',
            description: 'Devolucion por error de cobro',
            clubId: 'club-002',
            clubName: 'Club Domingo #5678',
            contractNumber: 'C-2024-5678',
            reference: 'REF-2024-001',
        },
        {
            id: 'pur-016',
            type: 'payment',
            amount: 10,
            date: new Date(now - 42 * day).toISOString(),
            status: 'completed',
            description: 'Pago semana 1',
            clubId: 'club-001',
            clubName: 'Club Miercoles #1234',
            contractNumber: 'C-2024-1234',
            weekNumber: 1,
            paymentMethod: 'cash',
            storeName: 'Sucursal Centro',
        },
        {
            id: 'pur-017',
            type: 'activation',
            amount: 15,
            date: new Date(now - 45 * day).toISOString(),
            status: 'completed',
            description: 'Activacion de club',
            clubId: 'club-002',
            clubName: 'Club Domingo #5678',
            contractNumber: 'C-2024-5678',
            paymentMethod: 'cash',
            storeName: 'Sucursal Norte',
        },
        // Failed/Cancelled transactions
        {
            id: 'pur-018',
            type: 'payment',
            amount: 10,
            date: new Date(now - 5 * day).toISOString(),
            status: 'failed',
            description: 'Pago rechazado',
            clubId: 'club-001',
            clubName: 'Club Miercoles #1234',
            paymentMethod: 'card',
        },
    ];
};

const calculateSummary = (purchases: Purchase[]): PurchasesSummary => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    let totalPaid = 0;
    let totalRedeemed = 0;
    let thisMonthAmount = 0;
    let lastMonthAmount = 0;

    purchases
        .filter(p => p.status === 'completed')
        .forEach(p => {
            const purchaseDate = new Date(p.date);

            if (p.amount > 0) {
                totalPaid += p.amount;
            } else {
                totalRedeemed += Math.abs(p.amount);
            }

            if (purchaseDate >= thisMonthStart) {
                if (p.amount > 0) thisMonthAmount += p.amount;
            } else if (purchaseDate >= lastMonthStart && purchaseDate <= lastMonthEnd) {
                if (p.amount > 0) lastMonthAmount += p.amount;
            }
        });

    return {
        totalTransactions: purchases.length,
        totalPaid,
        totalRedeemed,
        thisMonthAmount,
        lastMonthAmount,
    };
};

// ============ API FUNCTIONS ============

/**
 * Get purchases summary and history for a customer
 */
export async function getPurchases(
    customerId?: string,
    filters?: PurchaseFilters
): Promise<GetPurchasesResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 700));

    let purchases = generateMockPurchases();

    // Apply filters
    if (filters) {
        if (filters.type) {
            purchases = purchases.filter(p => p.type === filters.type);
        }
        if (filters.status) {
            purchases = purchases.filter(p => p.status === filters.status);
        }
        if (filters.clubId) {
            purchases = purchases.filter(p => p.clubId === filters.clubId);
        }
        if (filters.dateFrom) {
            const from = new Date(filters.dateFrom).getTime();
            purchases = purchases.filter(p => new Date(p.date).getTime() >= from);
        }
        if (filters.dateTo) {
            const to = new Date(filters.dateTo).getTime();
            purchases = purchases.filter(p => new Date(p.date).getTime() <= to);
        }
    }

    const summary = calculateSummary(generateMockPurchases()); // Always calculate from full data

    return {
        summary,
        purchases,
    };
}

/**
 * Get only the summary (lighter call)
 */
export async function getPurchasesSummary(customerId?: string): Promise<PurchasesSummary> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const purchases = generateMockPurchases();
    return calculateSummary(purchases);
}

/**
 * Get a single purchase detail
 */
export async function getPurchaseDetail(purchaseId: string): Promise<Purchase | null> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const purchases = generateMockPurchases();
    return purchases.find(p => p.id === purchaseId) || null;
}

// ============ HELPER FUNCTIONS ============

export function getPurchaseTypeLabel(type: PurchaseType): string {
    const labels: Record<PurchaseType, string> = {
        payment: 'Pago',
        exchange: 'Canje',
        penalty: 'Penalizacion',
        refund: 'Devolucion',
        activation: 'Activacion',
        admin_fee: 'Gasto Admin',
    };
    return labels[type];
}

export function getPurchaseTypeIcon(type: PurchaseType): string {
    const icons: Record<PurchaseType, string> = {
        payment: 'card',
        exchange: 'swap-horizontal',
        penalty: 'alert-circle',
        refund: 'arrow-undo',
        activation: 'checkmark-circle',
        admin_fee: 'document-text',
    };
    return icons[type];
}

export function getPurchaseTypeColor(type: PurchaseType): string {
    const colors: Record<PurchaseType, string> = {
        payment: '#22c55e', // green
        exchange: '#8b5cf6', // purple
        penalty: '#ef4444', // red
        refund: '#3b82f6', // blue
        activation: '#06b6d4', // cyan
        admin_fee: '#f59e0b', // amber
    };
    return colors[type];
}

export function getPaymentMethodLabel(method?: PaymentMethod): string {
    if (!method) return '';
    const labels: Record<PaymentMethod, string> = {
        cash: 'Efectivo',
        card: 'Tarjeta',
        transfer: 'Transferencia',
        balance: 'Balance',
    };
    return labels[method];
}

export function getPaymentMethodIcon(method?: PaymentMethod): string {
    if (!method) return 'help-circle';
    const icons: Record<PaymentMethod, string> = {
        cash: 'cash',
        card: 'card',
        transfer: 'swap-horizontal',
        balance: 'wallet',
    };
    return icons[method];
}

export function getStatusLabel(status: PurchaseStatus): string {
    const labels: Record<PurchaseStatus, string> = {
        completed: 'Completado',
        pending: 'Pendiente',
        cancelled: 'Cancelado',
        failed: 'Fallido',
    };
    return labels[status];
}

export function getStatusColor(status: PurchaseStatus): string {
    const colors: Record<PurchaseStatus, string> = {
        completed: '#22c55e',
        pending: '#f59e0b',
        cancelled: '#6b7280',
        failed: '#ef4444',
    };
    return colors[status];
}

export function formatPurchaseAmount(amount: number): string {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}$${Math.abs(amount).toFixed(2)}`;
}

export function groupPurchasesByDate(purchases: Purchase[]): { title: string; data: Purchase[] }[] {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const thisWeekStart = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
    const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);

    const groups: { [key: string]: Purchase[] } = {
        Hoy: [],
        Ayer: [],
        'Esta semana': [],
        'Semana pasada': [],
        Anteriores: [],
    };

    purchases.forEach(purchase => {
        const date = new Date(purchase.date);
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        if (dateOnly.getTime() === today.getTime()) {
            groups['Hoy'].push(purchase);
        } else if (dateOnly.getTime() === yesterday.getTime()) {
            groups['Ayer'].push(purchase);
        } else if (dateOnly >= thisWeekStart) {
            groups['Esta semana'].push(purchase);
        } else if (dateOnly >= lastWeekStart) {
            groups['Semana pasada'].push(purchase);
        } else {
            groups['Anteriores'].push(purchase);
        }
    });

    return Object.entries(groups)
        .filter(([_, data]) => data.length > 0)
        .map(([title, data]) => ({ title, data }));
}
