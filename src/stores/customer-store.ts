// src/stores/customer-store.ts
import { create } from 'zustand';
import {
    Customer,
    CustomerFilters,
    PaginatedCustomers,
    CustomerStats,
    CreateCustomerDTO,
    UpdateCustomerDTO,
} from '../types/clubs';
import { customersApi } from '../api/customers.api';

interface CustomerState {
    // Lista de clientes
    customers: Customer[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    isLoading: boolean;
    error: string | null;

    // Filtros
    filters: CustomerFilters;

    // Cliente seleccionado (detalle)
    selectedCustomer: Customer | null;
    customerStats: CustomerStats | null;
    isLoadingDetail: boolean;
    detailError: string | null;

    // Estados de operaciones
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    operationError: string | null;

    // Acciones - Lista
    fetchCustomers: (page?: number) => Promise<void>;
    setFilters: (filters: Partial<CustomerFilters>) => void;
    clearFilters: () => void;
    refreshCustomers: () => Promise<void>;
    setPage: (page: number) => void;

    // Acciones - Detalle
    fetchCustomerDetail: (customerId: string) => Promise<void>;
    clearSelectedCustomer: () => void;

    // Acciones - CRUD
    createCustomer: (data: CreateCustomerDTO) => Promise<Customer>;
    updateCustomer: (customerId: string, data: UpdateCustomerDTO) => Promise<Customer>;
    deleteCustomer: (customerId: string) => Promise<void>;

    // Búsqueda rápida
    searchCustomers: (searchText: string) => Promise<Customer[]>;

    // Helpers
    clearError: () => void;
}

const defaultFilters: CustomerFilters = {
    search: '',
    status: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    hasActiveClubs: undefined,
};

export const useCustomerStore = create<CustomerState>((set, get) => ({
    // Estado inicial
    customers: [],
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0,
    isLoading: false,
    error: null,

    filters: defaultFilters,

    selectedCustomer: null,
    customerStats: null,
    isLoadingDetail: false,
    detailError: null,

    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    operationError: null,

    // ==========================================
    // Acciones - Lista
    // ==========================================

    fetchCustomers: async (page?: number) => {
        const state = get();
        const currentPage = page || state.page;

        set({ isLoading: true, error: null });

        try {
            const result: PaginatedCustomers = await customersApi.getCustomers(
                state.filters,
                currentPage,
                state.pageSize
            );

            set({
                customers: result.data,
                total: result.total,
                page: result.page,
                totalPages: result.totalPages,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.message || 'Error al cargar clientes',
                isLoading: false,
            });
        }
    },

    setFilters: (newFilters: Partial<CustomerFilters>) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters },
            page: 1, // Reset a página 1 al cambiar filtros
        }));

        // Recargar automáticamente
        get().fetchCustomers(1);
    },

    clearFilters: () => {
        set({ filters: defaultFilters, page: 1 });
        get().fetchCustomers(1);
    },

    refreshCustomers: async () => {
        customersApi.refreshCustomersCache();
        await get().fetchCustomers();
    },

    setPage: (page: number) => {
        set({ page });
        get().fetchCustomers(page);
    },

    // ==========================================
    // Acciones - Detalle
    // ==========================================

    fetchCustomerDetail: async (customerId: string) => {
        set({ isLoadingDetail: true, detailError: null });

        try {
            const state = get();

            // OPTIMIZACIÓN: Primero buscar en la lista ya cargada
            let customer = state.customers.find(c => c.customerId === customerId);

            // Si no está en la lista, buscar en el API
            if (!customer) {
                console.log('Cliente no encontrado en cache local, buscando en API...');
                customer = await customersApi.getCustomerById(customerId);
            } else {
                console.log('✅ Cliente encontrado en cache local!');
            }

            // Primero mostrar el cliente (sin bloquear por estadísticas)
            set({
                selectedCustomer: customer,
                isLoadingDetail: false,
            });

            // Cargar estadísticas en segundo plano (opcional)
            try {
                console.log('📊 Cargando estadísticas del cliente...');
                const stats = await customersApi.getCustomerStats(customerId);
                set({ customerStats: stats });
                console.log('✅ Estadísticas cargadas');
            } catch (statsError: any) {
                console.warn('⚠️ No se pudieron cargar las estadísticas:', statsError.message);
                // No bloqueamos el detalle si fallan las estadísticas
                set({
                    customerStats: {
                        totalClubs: 0,
                        activeClubs: 0,
                        totalInvested: 0,
                        totalBalance: 0,
                        totalRedeemed: 0,
                        averageShare: 0,
                    },
                });
            }
        } catch (error: any) {
            console.error('❌ Error cargando cliente:', error);
            set({
                detailError: error.message || 'Error al cargar detalles del cliente',
                isLoadingDetail: false,
            });
        }
    },

    clearSelectedCustomer: () => {
        set({
            selectedCustomer: null,
            customerStats: null,
            detailError: null,
        });
    },

    // ==========================================
    // Acciones - CRUD
    // ==========================================

    createCustomer: async (data: CreateCustomerDTO) => {
        set({ isCreating: true, operationError: null });

        try {
            const newCustomer = await customersApi.createCustomer(data);

            // Refrescar lista
            await get().refreshCustomers();

            set({ isCreating: false });
            return newCustomer;
        } catch (error: any) {
            set({
                operationError: error.message || 'Error al crear cliente',
                isCreating: false,
            });
            throw error;
        }
    },

    updateCustomer: async (customerId: string, data: UpdateCustomerDTO) => {
        set({ isUpdating: true, operationError: null });

        try {
            const updatedCustomer = await customersApi.updateCustomer(customerId, data);

            // Actualizar en lista si existe
            set((state) => ({
                customers: state.customers.map(c =>
                    c.customerId === customerId ? updatedCustomer : c
                ),
                selectedCustomer: state.selectedCustomer?.customerId === customerId
                    ? updatedCustomer
                    : state.selectedCustomer,
                isUpdating: false,
            }));

            return updatedCustomer;
        } catch (error: any) {
            set({
                operationError: error.message || 'Error al actualizar cliente',
                isUpdating: false,
            });
            throw error;
        }
    },

    deleteCustomer: async (customerId: string) => {
        set({ isDeleting: true, operationError: null });

        try {
            await customersApi.deleteCustomer(customerId);

            // Remover de lista
            set((state) => ({
                customers: state.customers.filter(c => c.customerId !== customerId),
                total: state.total - 1,
                isDeleting: false,
            }));
        } catch (error: any) {
            set({
                operationError: error.message || 'Error al eliminar cliente',
                isDeleting: false,
            });
            throw error;
        }
    },

    // ==========================================
    // Búsqueda rápida
    // ==========================================

    searchCustomers: async (searchText: string) => {
        try {
            return await customersApi.searchCustomers(searchText);
        } catch (error: any) {
            console.error('Error searching customers:', error);
            return [];
        }
    },

    // ==========================================
    // Helpers
    // ==========================================

    clearError: () => {
        set({ error: null, detailError: null, operationError: null });
    },
}));
