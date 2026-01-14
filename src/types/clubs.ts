// src/types/club.ts - ACTUALIZADO

// ==========================================
// Entidades principales
// ==========================================

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

// ==========================================
// Catálogos
// ==========================================

export interface ClubType {
    clubTypeId: string;
    name: string;
    description?: string;
    drawDay?: string;
    weeksCount?: number;
    active: boolean;
}

export interface ClubStatus {
    clubStatusId: string;
    name: string;
    description?: string;
    color?: string;
    active?: boolean;
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
    description?: string;
    isCredit: boolean;
    active?: boolean;
}

// ==========================================
// Reglas y Configuración
// ==========================================

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

// ==========================================
// Sorteos
// ==========================================

export interface Draw {
    drawId: string;
    clubTypeId: string;
    clubTypeName?: string; // "Miércoles" o "Domingo"
    date: string;
    numberPlayed: number;
    winners?: DrawWinner[];
    totalWinners?: number;
    totalPrizeAmount?: number;
    status: 'pending' | 'completed' | 'cancelled';
    executedBy?: string;
    executedDate?: string;
    notes?: string;
}

export interface DrawWinner {
    clubId: string;
    contractNumber: string;
    customerId: string;
    customerName: string;
    customerNumber?: string;
    share: number; // Número de acción ganador
    prizeAmount: number;
    denominationId: string;
    denominationValue?: number;
    notified?: boolean;
    claimed?: boolean;
    claimDate?: string;
}

export interface CreateDrawDTO {
    clubTypeId: string;
    manualNumber: number; // Número ganador (0-99) - Share
}

export interface DrawFilters {
    clubTypeId?: string;
    status?: 'pending' | 'completed' | 'cancelled';
    dateFrom?: string;
    dateTo?: string;
}

export interface PaginatedDraws {
    data: Draw[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// ==========================================
// DTOs y Filtros
// ==========================================

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

// ==========================================
// Stats
// ==========================================

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

// ==========================================
// Customer (para búsqueda)
// ==========================================

export interface Customer {
    customerId: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email?: string;
    phone?: string;
    identificationNumber?: string;
    dateOfBirth?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    profileImage?: string | null;
    customerTypeName?: string;
    tierName?: string;
    systemCode?: string;
    registrationDate?: string;
    lastPurchaseDate?: string;
    totalPurchases?: number;
    status: CustomerStatus;
    active: boolean;
    notes?: string;
}

export type CustomerStatus = 'active' | 'suspended' | 'inactive';

export interface CustomerStats {
    totalClubs: number;
    activeClubs: number;
    totalInvested: number;
    totalBalance: number;
    totalRedeemed: number;
    averageShare: number;
    lastActivity?: string;
}

export interface CreateCustomerDTO {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    identificationNumber?: string;
    dateOfBirth?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    notes?: string;
}

export interface UpdateCustomerDTO {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    identificationNumber?: string;
    dateOfBirth?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    status?: CustomerStatus;
    active?: boolean;
    notes?: string;
}

export interface CustomerFilters {
    search?: string;
    status?: CustomerStatus;
    dateFrom?: string;
    dateTo?: string;
    hasActiveClubs?: boolean;
}

export interface PaginatedCustomers {
    data: Customer[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// ==========================================
// Customer Registration Types
// ==========================================

export interface GeneralTelephone {
    CustomerId?: string | null;
    StoreId?: string | null;
    DefaultHome?: boolean;
    DefaultMobile?: boolean;
    DefaultWork?: boolean;
    Number: string;
    Status: boolean;
    Prefix: string;
    TelephoneId?: string | null;
    TelephoneTypeId: string;
}

export interface GeneralEmail {
    Address: string;
    CustomerId?: string | null;
    StoreId?: string | null;
    DefaultEmail: boolean;
    EmailId?: string | null;
    EmailTypeId: string;
    Status: boolean;
}

export interface GeneralAddress {
    AddressDetail?: string | null;
    AddressId?: string | null;
    AddressTypeId: string;
    BuildingId?: string | null;
    BuildingTypeId: string;
    CountryId: string;
    CustomerId?: string | null;
    DefaultBillingAddress: boolean;
    DefaultHomeAddress: boolean;
    DefaultShippingAddress: boolean;
    IsfirstFloor: boolean;
    HasElevator: boolean;
    DistanceOverFiveMts: boolean;
    AccessibleBuildingProject: boolean;
    DistrictId: string;
    HomeOrFloorNumber?: string | null;
    Latitude?: number | null;
    Longitude?: number | null;
    Name: string;
    NeighborhoodId?: string | null;
    ProvinceId: string;
    Status: boolean;
    Street?: string | null;
    TownshipId: string;
}

export interface GeneralStore {
    AdministrativeLocation: boolean;
    CountryId: string;
    CustomerId?: string | null;
    GeneralAddress: GeneralAddress[];
    GeneralStoreHours: any[];
    GeneralTelephone: GeneralTelephone[];
    GeneralEmail: GeneralEmail[];
    GeneralImage: any[];
    Manager?: string | null;
    Name: string;
    Status: boolean;
    StoreId?: string | null;
    Supervisor?: string | null;
}

// Registro de Cliente Natural/Particular
export interface RegisterParticularDTO {
    AludraAPP: boolean;
    Birthdate: string;
    CountryId: string;
    CustomerId?: string | null;
    CustomerStatusId: string;
    CustomerTypeId: string; // 41acbcf4-be83-4f03-8b5e-5760fc92b59b
    EducationalLevelId: string;
    Email?: string | null;
    FirstName: string;
    DocumentTypeId: string;
    DV?: string | null;
    GeneralExternalCode: any[];
    GeneralStore: any[];
    GeneralAddress: any[];
    GeneralTelephone: GeneralTelephone[];
    GeneralEmail: GeneralEmail[];
    Latitude?: number | null;
    FullName?: string | null;
    Longitude?: number | null;
    Tenant: number;
    HasChildren: boolean;
    IdNumber: string;
    IsWorking: boolean;
    LastName: string;
    MaritalStatusId: string;
    NationalityId: string;
    SystemCode?: string | null;
    RolesName: string[];
    FrequencyCode?: string | null;
    GenderId: string;
    UserName: string;
    Status: boolean;
    WorkId?: string | null;
}

// Registro de Cliente Empresa
export interface RegisterEmpresaDTO {
    AludraAPP: boolean;
    BusinessActivity?: string | null;
    ComercialName: string;
    CountryId: string;
    CustomerId?: string | null;
    CustomerStatusId: string;
    CustomerTypeId: string; // 52acbcf4-be83-4f03-8b5e-5760fc92b59b
    Dv: string;
    Email?: string | null;
    FundationYear?: number | null;
    GeneralExternalCode: any[];
    GeneralStore: GeneralStore[];
    DocumentTypeId: string;
    GeneralAddress: any[];
    GeneralTelephone: any[];
    GeneralEmail: any[];
    Latitude?: number | null;
    LegalName: string;
    Longitude?: number | null;
    Tenant: number;
    RolesName: string[];
    FrequencyCode?: string | null;
    Ruc: string;
    OperationNoticeNumber?: string | null;
    UserName: string;
    Status: boolean;
    Website?: string | null;
}

// Constants
export const CUSTOMER_TYPE_IDS = {
    PARTICULAR: '41acbcf4-be83-4f03-8b5e-5760fc92b59b',
    EMPRESA: '52acbcf4-be83-4f03-8b5e-5760fc92b59b',
} as const;

export const CUSTOMER_STATUS_IDS = {
    ACTIVE: '081e533e-be36-4b79-87a9-d6336eab5aaf',
} as const;

export const DOCUMENT_TYPE_IDS = {
    CEDULA: '62f94b64-d874-4b74-91d1-2c623ec93016',
    RUC: '4d582f7f-c981-4ed4-9364-708452802303',
} as const;

export const COUNTRY_IDS = {
    PANAMA: '2d3d33c2-3401-40a1-858b-ae0140b0d376',
} as const;

export const GENDER_IDS = {
    MALE: '55acbcf4-be83-4f03-8b5e-5760fc92b59b',
    FEMALE: '66acbcf4-be83-4f03-8b5e-5760fc92b59b',
} as const;

export const TELEPHONE_TYPE_IDS = {
    HOME: '26acbcf4-be83-4f03-8b5e-5760fc92b59b',
    MOBILE: '34acbcf4-be83-4f03-8b5e-5760fc92b59b',
    WORK: '44acbcf4-be83-4f03-8b5e-5760fc92b59b',
} as const;

export const EMAIL_TYPE_IDS = {
    PERSONAL: '24acbcf4-be83-4f03-8b5e-5760fc92b59b',
} as const;

export const ADDRESS_TYPE_IDS = {
    HOME: '42acbcf4-be83-4f03-8b5e-5760fc92b59b',
} as const;

export const BUILDING_TYPE_IDS = {
    HOUSE: '5ec0434d-f36c-4fc9-944c-2c1bf627cc4b',
} as const;

// ==========================================
// Update Customer Types
// ==========================================

// Actualización de Cliente Natural/Particular
export interface UpdateParticularDTO {
    AludraAPP: boolean;
    Birthdate: string;
    CountryId: string;
    CustomerId: string;
    CustomerStatusId: string;
    CustomerTypeId: string;
    EducationalLevelId: string;
    Email?: string | null;
    FirstName: string;
    DocumentTypeId: string;
    DV?: string | null;
    GeneralExternalCode: any[];
    GeneralStore: any[];
    GeneralAddress: GeneralAddress[];
    GeneralTelephone: GeneralTelephone[];
    GeneralEmail: GeneralEmail[];
    Latitude?: number | null;
    FullName?: string | null;
    Longitude?: number | null;
    Tenant: number;
    HasChildren: boolean;
    IdNumber: string;
    IsWorking: boolean;
    LastName: string;
    MaritalStatusId: string;
    NationalityId: string;
    SystemCode?: string | null;
    RolesName: string[];
    FrequencyCode?: string | null;
    GenderId: string;
    UserName: string;
    Status: boolean;
    WorkId?: string | null;
}

// Actualización de Cliente Empresa
export interface UpdateEmpresaDTO {
    AludraAPP: boolean;
    BusinessActivity?: string | null;
    ComercialName: string;
    CountryId: string;
    CustomerId: string;
    CustomerStatusId: string;
    CustomerTypeId: string;
    Dv: string;
    Email?: string | null;
    FundationYear?: number | null;
    GeneralExternalCode: any[];
    GeneralStore: GeneralStore[];
    DocumentTypeId: string;
    GeneralAddress: GeneralAddress[];
    GeneralTelephone: GeneralTelephone[];
    GeneralEmail: GeneralEmail[];
    Latitude?: number | null;
    LegalName: string;
    Longitude?: number | null;
    Tenant: number;
    RolesName: string[];
    FrequencyCode?: string | null;
    Ruc: string;
    OperationNoticeNumber?: string | null;
    UserName: string;
    Status: boolean;
    Website?: string | null;
}