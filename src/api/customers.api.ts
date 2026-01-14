// src/api/customers.api.ts
import { apiClient, mdl03Client } from './client';
import {
    Customer,
    CreateCustomerDTO,
    UpdateCustomerDTO,
    CustomerFilters,
    PaginatedCustomers,
    CustomerStats,
    RegisterParticularDTO,
    RegisterEmpresaDTO,
    UpdateParticularDTO,
    UpdateEmpresaDTO,
} from '../types/clubs';
import { logCustomerList, logCustomerData } from '../utils/debugCustomers';

// Set to true para ver logs detallados
const DEBUG_MODE = __DEV__; // Solo en desarrollo

// ==========================================
// Mappers - Normalizar respuestas del API
// ==========================================

function mapApiCustomerToCustomer(apiCustomer: any): Customer {
    // Detectar si viene de GetCustomerGeneralInfo (tiene Data.CustomerInfo)
    let customerData: any;
    let phone: string | undefined;
    let email: string | undefined;

    if (apiCustomer.Data?.CustomerInfo) {
        // Respuesta de GetCustomerGeneralInfo
        customerData = apiCustomer.Data.CustomerInfo;
        phone = customerData.Telephone;
        email = customerData.Email;

        // Intentar obtener teléfono de la lista de teléfonos si existe
        if (apiCustomer.Data.TelephoneList && apiCustomer.Data.TelephoneList.length > 0) {
            const defaultPhone = apiCustomer.Data.TelephoneList.find((t: any) => t.DefaultMobile || t.DefaultHome);
            if (defaultPhone) {
                phone = `${defaultPhone.Prefix || ''}${defaultPhone.Number || ''}`.trim();
            }
        }

        // Intentar obtener email de la lista de emails si existe
        if (apiCustomer.Data.EmailList && apiCustomer.Data.EmailList.length > 0) {
            const defaultEmail = apiCustomer.Data.EmailList.find((e: any) => e.DefaultEmail);
            if (defaultEmail) {
                email = defaultEmail.Address;
            }
        }
    } else {
        // Respuesta de SearchCustomers (formato simple)
        customerData = apiCustomer;
        phone = customerData.PhoneNumber || customerData.Telephone || customerData.phone;
        email = customerData.Email || customerData.email;
    }

    return {
        customerId: customerData.CustomerId || customerData.customerId,
        firstName: customerData.FirstName || customerData.firstName || '',
        lastName: customerData.LastName || customerData.lastName || '',
        fullName: customerData.FullName || customerData.fullName || `${customerData.FirstName || ''} ${customerData.LastName || ''}`.trim(),
        email: email,
        phone: phone,
        identificationNumber: customerData.IDNumber || customerData.NumberId || customerData.identificationNumber,
        dateOfBirth: customerData.Birthdate || customerData.DateOfBirth || customerData.dateOfBirth,
        address: customerData.Address || customerData.address,
        city: customerData.City || customerData.city,
        state: customerData.State || customerData.state,
        zipCode: customerData.ZipCode || customerData.zipCode,
        country: customerData.Country || customerData.country || 'Panama',
        profileImage: customerData.ProfilePicture || customerData.ProfileImage || customerData.profileImage,
        customerTypeName: apiCustomer.Data?.CustomerType?.Description || customerData.CustomerTypeName || customerData.customerTypeName,
        tierName: customerData.TierName || customerData.tierName,
        systemCode: customerData.SystemCode || customerData.systemCode,
        registrationDate: customerData.RegistrationDate || customerData.registrationDate || customerData.CreatedDate,
        lastPurchaseDate: customerData.LastPurchaseDate || customerData.lastPurchaseDate,
        totalPurchases: customerData.TotalPurchases || customerData.totalPurchases || 0,
        status: (customerData.Status || customerData.status || 'active') as 'active' | 'suspended' | 'inactive',
        active: customerData.Status !== undefined ? customerData.Status : (customerData.Active !== undefined ? customerData.Active : customerData.active !== false),
        notes: customerData.Notes || customerData.notes,
    };
}

// ==========================================
// Cache simple en memoria
// ==========================================

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

function getCacheKey(prefix: string, params?: any): string {
    return `${prefix}_${JSON.stringify(params || {})}`;
}

function getFromCache<T>(key: string): T | null {
    const entry = cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > CACHE_TTL) {
        cache.delete(key);
        return null;
    }

    return entry.data;
}

function setCache<T>(key: string, data: T): void {
    cache.set(key, { data, timestamp: Date.now() });
}

function invalidateCache(pattern?: string): void {
    if (!pattern) {
        cache.clear();
        return;
    }

    const keys = Array.from(cache.keys());
    keys.forEach(key => {
        if (key.includes(pattern)) {
            cache.delete(key);
        }
    });
}

// ==========================================
// API Functions
// ==========================================

/**
 * Obtener lista paginada de clientes
 */
export async function getCustomers(
    filters?: CustomerFilters,
    page: number = 1,
    pageSize: number = 20
): Promise<PaginatedCustomers> {
    try {
        const cacheKey = getCacheKey('customers', { filters, page, pageSize });
        const cached = getFromCache<PaginatedCustomers>(cacheKey);
        if (cached) return cached;

        // Endpoint: POST /mdl03/SearchCustomers/Post
        const response = await mdl03Client.post('/mdl03/SearchCustomers/Post', {
            CompanyId: null,
            CompanyCode: null,
            GlobalExecution: true,
            SearchText: filters?.search || null,
            CustomerTypeId: null,
            CustomerCategoryId: null,
            AludraAPP: true,
            RoleName: 'CUSTOMER',
            PageNumber: page,
            PageSize: pageSize,
        });

        const apiData = response.data.Data || [];
        const total = apiData[0]?.TotalRegisters || 0;

        if (DEBUG_MODE && apiData.length > 0) {
            logCustomerList(apiData, 'getCustomers API Response');
        }

        const customers = apiData.map(mapApiCustomerToCustomer);

        const result: PaginatedCustomers = {
            data: customers,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };

        setCache(cacheKey, result);
        return result;
    } catch (error: any) {
        console.error('Error fetching customers:', error);
        throw new Error(error.response?.data?.message || 'Error al cargar clientes');
    }
}

/**
 * Obtener un cliente por ID
 * Busca en múltiples páginas hasta encontrar el cliente
 */
export async function getCustomerById(customerId: string): Promise<Customer> {
    try {
        const cacheKey = `customer_${customerId}`;
        const cached = getFromCache<Customer>(cacheKey);
        if (cached) {
            console.log('📦 Cliente encontrado en cache');
            return cached;
        }

        console.log(`🔍 Buscando cliente por ID: ${customerId}`);

        // OPCIÓN 1: Intentar primero con GetCustomerGeneralInfo que devuelve más datos
        try {
            console.log('📡 Intentando GetCustomerGeneralInfo...');
            const detailResponse = await mdl03Client.post('/mdl03/GetCustomerGeneralInfo/Post', {
                CustomerId: customerId,
                CustomerTypeId: '41ACBCF4-BE83-4F03-8B5E-5760FC92B59B', // Default Particular
                CountryId: '2d3d33c2-3401-40a1-858b-ae0140b0d376', // Panama
            });

            if (detailResponse.data) {
                console.log('✅ Cliente encontrado con GetCustomerGeneralInfo');
                console.log('📋 Raw detail data:', JSON.stringify(detailResponse.data, null, 2));

                const customer = mapApiCustomerToCustomer(detailResponse.data);
                console.log('📋 Mapped customer:', JSON.stringify(customer, null, 2));

                setCache(cacheKey, customer);
                return customer;
            }
        } catch (detailError) {
            console.log('⚠️ GetCustomerGeneralInfo falló, intentando búsqueda...');
        }

        // OPCIÓN 2: Buscar en las primeras 100 registros (5 páginas de 20)
        console.log('📡 Buscando en SearchCustomers...');
        for (let page = 1; page <= 5; page++) {
            const searchResponse = await mdl03Client.post('/mdl03/SearchCustomers/Post', {
                CompanyId: null,
                CompanyCode: null,
                GlobalExecution: true,
                SearchText: null, // Sin filtro de texto para obtener todos
                CustomerTypeId: null,
                CustomerCategoryId: null,
                AludraAPP: true,
                RoleName: 'CUSTOMER',
                PageNumber: page,
                PageSize: 20,
            });

            const searchData = searchResponse.data.Data || [];

            // Buscar el cliente exacto por CustomerId
            const customerData = searchData.find((c: any) => c.CustomerId === customerId);

            if (customerData) {
                console.log(`✅ Cliente encontrado en página ${page}`);
                console.log('📋 Raw customer data:', JSON.stringify(customerData, null, 2));

                if (DEBUG_MODE) {
                    logCustomerData(customerData, 'getCustomerById - Found');
                }

                const customer = mapApiCustomerToCustomer(customerData);
                console.log('📋 Mapped customer:', JSON.stringify(customer, null, 2));

                setCache(cacheKey, customer);
                return customer;
            }
        }

        // Si no se encuentra en las primeras 100, lanzar error
        throw new Error('Cliente no encontrado');
    } catch (error: any) {
        console.error('❌ Error fetching customer by ID:', error);
        throw new Error(error.response?.data?.message || 'Error al cargar cliente');
    }
}

/**
 * Crear nuevo cliente
 * TODO: Implementar cuando el endpoint esté disponible
 */
export async function createCustomer(data: CreateCustomerDTO): Promise<Customer> {
    try {
        // TODO: Endpoint real cuando esté disponible
        // const response = await mdl03Client.post('/mdl03/customers', { ... });

        throw new Error('Funcionalidad de crear cliente aún no disponible en el API');

        // invalidateCache('customers');
        // return mapApiCustomerToCustomer(response.data);
    } catch (error: any) {
        console.error('Error creating customer:', error);
        throw new Error(error.response?.data?.message || 'Error al crear cliente');
    }
}

/**
 * Actualizar cliente existente
 * TODO: Implementar cuando el endpoint esté disponible
 */
export async function updateCustomer(customerId: string, data: UpdateCustomerDTO): Promise<Customer> {
    try {
        // TODO: Endpoint real cuando esté disponible
        // const response = await mdl03Client.patch(`/mdl03/customers/${customerId}`, { ... });

        throw new Error('Funcionalidad de actualizar cliente aún no disponible en el API');

        // invalidateCache('customers');
        // invalidateCache(`customer_${customerId}`);
        // return mapApiCustomerToCustomer(response.data);
    } catch (error: any) {
        console.error('Error updating customer:', error);
        throw new Error(error.response?.data?.message || 'Error al actualizar cliente');
    }
}

/**
 * Eliminar/desactivar cliente
 * TODO: Implementar cuando el endpoint esté disponible
 */
export async function deleteCustomer(customerId: string): Promise<void> {
    try {
        // TODO: Endpoint real cuando esté disponible
        // await mdl03Client.patch(`/mdl03/customers/${customerId}`, { ... });

        throw new Error('Funcionalidad de eliminar cliente aún no disponible en el API');

        // invalidateCache('customers');
        // invalidateCache(`customer_${customerId}`);
    } catch (error: any) {
        console.error('Error deleting customer:', error);
        throw new Error(error.response?.data?.message || 'Error al eliminar cliente');
    }
}

/**
 * Obtener información general detallada del cliente
 * Requiere CustomerTypeId y CountryId
 */
export async function getCustomerGeneralInfo(customerId: string, customerTypeId?: string, countryId?: string): Promise<any> {
    try {
        // Endpoint: POST /mdl03/GetCustomerGeneralInfo/Post
        const response = await mdl03Client.post('/mdl03/GetCustomerGeneralInfo/Post', {
            CustomerId: customerId,
            CustomerTypeId: customerTypeId || '41ACBCF4-BE83-4F03-8B5E-5760FC92B59B', // Default
            CountryId: countryId || '2d3d33c2-3401-40a1-858b-ae0140b0d376', // Default Panama
        });

        return response.data;
    } catch (error: any) {
        console.error('Error fetching customer general info:', error);
        throw new Error('Error al cargar información general del cliente');
    }
}

/**
 * Obtener estadísticas de un cliente
 * Delega al clubsApi para evitar dependencia circular
 */
export async function getCustomerStats(customerId: string): Promise<CustomerStats> {
    try {
        console.log('📊 [customers.api] Obteniendo estadísticas para cliente:', customerId);

        // Usar la función del clubsApi para evitar dependencia circular
        const { clubApi } = await import('./clubs.api');
        const stats = await clubApi.getCustomerClubStats(customerId);

        console.log(`✅ [customers.api] Estadísticas obtenidas correctamente`);

        return stats;
    } catch (error: any) {
        console.error('❌ [customers.api] Error fetching customer stats:', error);
        // Retornar stats vacías en lugar de lanzar error
        return {
            totalClubs: 0,
            activeClubs: 0,
            totalInvested: 0,
            totalBalance: 0,
            totalRedeemed: 0,
            averageShare: 0,
        };
    }
}

/**
 * Buscar clientes (búsqueda rápida)
 */
export async function searchCustomers(searchText: string, limit: number = 10): Promise<Customer[]> {
    try {
        const response = await mdl03Client.post('/mdl03/SearchCustomers/Post', {
            CompanyId: null,
            CompanyCode: null,
            GlobalExecution: true,
            SearchText: searchText,
            CustomerTypeId: null,
            CustomerCategoryId: null,
            AludraAPP: true,
            RoleName: 'CUSTOMER',
            PageNumber: 1,
            PageSize: limit,
        });

        const apiData = response.data.Data || [];
        return apiData.map(mapApiCustomerToCustomer);
    } catch (error: any) {
        console.error('Error searching customers:', error);
        throw new Error('Error al buscar clientes');
    }
}

/**
 * Refrescar cache de clientes
 */
export function refreshCustomersCache(): void {
    invalidateCache('customers');
}

/**
 * Registrar nuevo cliente Particular
 * POST /core/Register/v2
 */
export async function registerParticular(data: RegisterParticularDTO): Promise<any> {
    try {
        console.log('📤 Registrando cliente particular:', data.FirstName, data.LastName);

        const response = await apiClient.post('/core/Register/v2', data);

        console.log('✅ Cliente particular registrado exitosamente');

        // Invalidar cache para que se actualice la lista
        invalidateCache('customers');

        return response.data?.Data || response.data;
    } catch (error: any) {
        console.error('❌ Error registrando cliente particular:', error);
        const errorMessage = error.response?.data?.Status?.Message
            || error.response?.data?.message
            || 'Error al registrar cliente particular';
        throw new Error(errorMessage);
    }
}

/**
 * Registrar nuevo cliente Empresa
 * POST /core/Register/v2
 */
export async function registerEmpresa(data: RegisterEmpresaDTO): Promise<any> {
    try {
        console.log('📤 Registrando cliente empresa:', data.ComercialName);

        const response = await apiClient.post('/core/Register/v2', data);

        console.log('✅ Cliente empresa registrado exitosamente');

        // Invalidar cache para que se actualice la lista
        invalidateCache('customers');

        return response.data?.Data || response.data;
    } catch (error: any) {
        console.error('❌ Error registrando cliente empresa:', error);
        const errorMessage = error.response?.data?.Status?.Message
            || error.response?.data?.message
            || 'Error al registrar cliente empresa';
        throw new Error(errorMessage);
    }
}

/**
 * Actualizar cliente Particular
 * POST /core/Update/v2
 */
export async function updateParticular(data: UpdateParticularDTO): Promise<any> {
    try {
        console.log('📤 Actualizando cliente particular:', data.FirstName, data.LastName);

        const response = await apiClient.post('/core/Update/v2', data);

        console.log('✅ Cliente particular actualizado exitosamente');

        // Invalidar cache para que se actualice la lista
        invalidateCache('customers');
        invalidateCache(`customer_${data.CustomerId}`);

        return response.data?.Data || response.data;
    } catch (error: any) {
        console.error('❌ Error actualizando cliente particular:', error);
        const errorMessage = error.response?.data?.Status?.Message
            || error.response?.data?.message
            || 'Error al actualizar cliente particular';
        throw new Error(errorMessage);
    }
}

/**
 * Actualizar cliente Empresa
 * POST /core/Update/v2
 */
export async function updateEmpresa(data: UpdateEmpresaDTO): Promise<any> {
    try {
        console.log('📤 Actualizando cliente empresa:', data.ComercialName);

        const response = await apiClient.post('/core/Update/v2', data);

        console.log('✅ Cliente empresa actualizado exitosamente');

        // Invalidar cache para que se actualice la lista
        invalidateCache('customers');
        invalidateCache(`customer_${data.CustomerId}`);

        return response.data?.Data || response.data;
    } catch (error: any) {
        console.error('❌ Error actualizando cliente empresa:', error);
        const errorMessage = error.response?.data?.Status?.Message
            || error.response?.data?.message
            || 'Error al actualizar cliente empresa';
        throw new Error(errorMessage);
    }
}

export const customersApi = {
    getCustomers,
    getCustomerById,
    getCustomerGeneralInfo,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerStats,
    searchCustomers,
    refreshCustomersCache,
    registerParticular,
    registerEmpresa,
    updateParticular,
    updateEmpresa,
};
