// src/data/mockData.ts
// IDs REALES de la base de datos MDL05

// ==========================================
// Valores por defecto para crear clubs
// ==========================================
export const DEFAULT_VALUES = {
    saaSId: 2,
    salesAgentId: '89D7A9C0-DA6A-454A-A2AC-325B373D8885',
    storeId: '9BE47D58-1B51-419C-8A84-6E3FD435650F',
};

// ==========================================
// Denominaciones (pltblDenomination)
// ==========================================
export const mockDenominations = [
    {
        denominationId: 'ACA4A32E-B52C-4859-9313-DDCE870F3A09',
        value: 3,
        description: '$3.00 semanal',
        active: true,
    },
    {
        denominationId: 'D13640D2-2F66-4DEB-BC06-EF2C314F35F2',
        value: 5,
        description: '$5.00 semanal',
        active: true,
    },
    {
        denominationId: '95EEA86E-A596-43C7-96FF-4FE2FA793D3F',
        value: 10,
        description: '$10.00 semanal',
        active: true,
    },
];

// ==========================================
// Tipos de Club (pltblClubType)
// ==========================================
export const mockClubTypes = [
    {
        clubTypeId: '1A04396C-CC15-4BD1-912D-7975E5130CF7',
        name: 'Miércoles',
        description: 'MIERCOLES',
        drawDay: 'wednesday',
        weeksCount: 52,
        active: true,
    },
    {
        clubTypeId: 'AB64C298-B6DB-40D6-8E85-9C1E336BF069',
        name: 'Domingo',
        description: 'DOMINGO',
        drawDay: 'sunday',
        weeksCount: 52,
        active: true,
    },
];

// ==========================================
// Estados de Club (tblClubStatus)
// ==========================================
export const mockClubStatuses = [
    {
        clubStatusId: '42748F33-71C3-42B4-B73E-47C27F1E61DF',
        name: 'Activo',
        description: 'Club activo',
        color: '#22c55e',
        active: true,
    },
    {
        clubStatusId: '0D4382DA-2457-46BC-8676-3CF48E84EA1B',
        name: 'Anulado',
        description: 'Club anulado',
        color: '#ef4444',
        active: true,
    },
    {
        clubStatusId: '62898CE2-ADBF-44A6-9FA4-5387FB70DBFB',
        name: 'Vencido',
        description: 'Club vencido',
        color: '#f59e0b',
        active: true,
    },
    {
        clubStatusId: 'ADD6344C-3123-4A31-B623-64E2A8882AD2',
        name: 'Mora 13S',
        description: 'Club en mora 13 semanas',
        color: '#f97316',
        active: true,
    },
    {
        clubStatusId: '27792CE6-F463-445F-A9EA-BB3754A7A3D8',
        name: 'En auditoría',
        description: 'Club en auditoría',
        color: '#8b5cf6',
        active: true,
    },
];

// ==========================================
// Tipos de Transacción (pltblTransactionType)
// ==========================================
export const mockTransactionTypes = [
    {
        transactionTypeId: '04D155A7-7DFC-4A9A-9814-64FB69488D4B',
        name: 'Pago a Club',
        description: 'Pago a Club',
        isCredit: true,
        active: true,
    },
    {
        transactionTypeId: '50B55639-0C97-40C0-B6A5-552D59A17D87',
        name: 'Activación de club',
        description: 'Activación de club bloqueado / cancelado',
        isCredit: false,
        active: true,
    },
    {
        transactionTypeId: '63396D0A-3907-470F-B447-28AB73947AF1',
        name: 'Penalización',
        description: 'Penalizacion por Pendiente o Cancelacion',
        isCredit: false,
        active: true,
    },
    {
        transactionTypeId: '3F1FE760-7670-4934-9D48-7BD610C1B1AB',
        name: 'Gasto Administrativo',
        description: 'Gasto Administrativo',
        isCredit: false,
        active: true,
    },
    {
        transactionTypeId: '77D70A45-D32F-4745-9024-A584145A4407',
        name: 'Retorno de Pagos',
        description: 'Retorno de Pagos Adelantados',
        isCredit: true,
        active: true,
    },
];

// ==========================================
// Cliente demo (para pruebas)
// ==========================================
export const mockClientes = [
    {
        customerId: '663E9341-B3AC-4EAE-86FB-5BF1A5EAC8A6',
        firstName: 'Cliente',
        lastName: 'Demo',
        fullName: 'Cliente Demo',
        email: 'demo@example.com',
        phone: '+507 6000-0001',
        identificationNumber: '8-800-1234',
    },
];