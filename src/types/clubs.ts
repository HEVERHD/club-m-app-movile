// ============================================================
// ARCHIVO 1: src/types/club.ts
// ============================================================

export interface Club {
    clubId: string;
    contractNumber: string;
    customerId: string;
    customerName: string;
    customerNumber: string;
    externalCode: string;
    clubTypeId: string;
    denominationId: string;
    clubStatusId: string;
    statusName: string;
    salesAgentId: string;
    storeId: string;
    saaSId: number;
    share: number;
    weeksPlayed: number;
    weeksPaid: number;
    weeksLate: number;
    paidAmount: number;
    retiredAmount: number;
    balanceAmount: number;
    totalAmount: number;
    startDate: string;
    finishDate: string;
    prizeDate: string;
    createdDate: string;
    cancellationDate: string;
    active: boolean;
}

export interface ClubWeek {
    weekId: string;
    clubId: string;
    weekNumber: number;
    dueDate: string;
    paidDate?: string;
    amount: number;
    status: 'pending' | 'paid' | 'late';
}

export interface ClubTransaction {
    transactionId: string;
    clubId: string;
    transactionTypeId: string;
    typeName: string;
    amount: number;
    balance: number;
    description: string;
    createdDate: string;
    createdBy: string;
}

export interface ClubType {
    clubTypeId: string;
    name: string;
    description?: string;
    drawDay: string;
    active: boolean;
}

export interface ClubStatus {
    clubStatusId: string;
    name: string;
    description?: string;
    color?: string;
}

export interface Denomination {
    denominationId: string;
    value: number;
    description?: string;
    active: boolean;
}

export interface TransactionType {
    transactionTypeId: string;
    name: string;
    isCredit: boolean;
}

export interface ClubRule {
    ruleId: string;
    name: string;
    description?: string;
    ruleType: 'commission' | 'prize' | 'penalty' | 'limit';
    value: number;
    isPercentage: boolean;
    active: boolean;
}

export interface LimitNumber {
    number: number;
    limit: number;
    currentCount: number;
}

export interface Draw {
    drawId: string;
    clubTypeId: string;
    date: string;
    numberPlayed: number;
    winners?: DrawWinner[];
    status: 'pending' | 'completed' | 'cancelled';
}

export interface DrawWinner {
    clubId: string;
    contractNumber: string;
    customerName: string;
    prizeAmount: number;
}

export interface ClubFilters {
    search?: string;
    status?: string;
    clubTypeId?: string;
    denominationId?: string;
    dateFrom?: string;
    dateTo?: string;
    customerId?: string;
}

export interface PaginatedClubs {
    data: Club[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface CreateClubDTO {
    customerId: string;
    clubTypeId: string;
    denominationId: string;
    share: number;
    startDate: string;
    saaSId?: number;
    salesAgentId?: string;
    storeId?: string;
}

export interface UpdateClubDTO {
    clubStatusId?: string;
    share?: number;
    salesAgentId?: string;
}

export interface PayWeekDTO {
    clubId: string;
    weekNumber: number;
    amount: number;
    paymentMethod?: string;
}

export interface CreateTransactionDTO {
    transactionTypeId: string;
    amount: number;
    description?: string;
}

export interface ClubStats {
    totalPaid: number;
    totalRetired: number;
    balance: number;
    weeksPaid: number;
    weeksLate: number;
    weeksPending: number;
    nextPaymentDate?: string;
    estimatedPrize?: number;
}