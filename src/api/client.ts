// src/api/client.ts - COMPLETO
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { getBaseUrl, getApiKey, getMdl05Key } from '../services/api.config';

export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    TENANT_ID: 'tenantId',
    USER_DATA: 'userData',
} as const;

// ============================================
// Login Params Interface
// ============================================
export interface LoginParams {
    email: string;
    password: string;
    tenantId: number;
}

// ============================================
// Helper para obtener token
// ============================================
const getAccessToken = async (): Promise<string | null> => {
    try {
        return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (e) {
        console.error('Error getting token:', e);
        return null;
    }
};

// ============================================
// API Client (con Bearer token)
// ============================================
const createApiClient = (): AxiosInstance => {
    const client = axios.create({
        baseURL: getBaseUrl(),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        timeout: 30000,
    });

    client.interceptors.request.use(
        async (config: InternalAxiosRequestConfig) => {
            config.baseURL = getBaseUrl();
            config.headers['Ocp-Apim-Subscription-Key'] = getApiKey();

            const token = await getAccessToken();
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }

            console.log('📤 API:', config.method?.toUpperCase(), config.url);
            return config;
        },
        (error) => Promise.reject(error)
    );

    client.interceptors.response.use(
        (response) => {
            console.log('📥 API OK:', response.status);
            return response;
        },
        async (error: AxiosError) => {
            console.log('❌ API ERROR:', error.response?.status, error.config?.url);
            if (error.response?.status === 401) {
                await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
                await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
            }
            return Promise.reject(error);
        }
    );

    return client;
};

// ============================================
// MDL05 Client (con api-key)
// ============================================
const createMdl05Client = (): AxiosInstance => {
    const client = axios.create({
        baseURL: getBaseUrl(),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        timeout: 180000,
    });

    client.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            config.baseURL = getBaseUrl();
            config.headers['api-key'] = getMdl05Key();
            console.log('📤 MDL05:', config.method?.toUpperCase(), config.url);
            return config;
        },
        (error) => Promise.reject(error)
    );

    client.interceptors.response.use(
        (response) => {
            console.log('📥 MDL05 OK:', response.status);
            return response;
        },
        async (error: AxiosError) => {
            console.log('❌ MDL05 ERROR:', error.response?.status, error.config?.url);
            return Promise.reject(error);
        }
    );

    return client;
};

// ============================================
// Exportar clientes
// ============================================
export const apiClient = createApiClient();
export const mdl05Client = createMdl05Client();

// ============================================
// AUTH FUNCTIONS
// ============================================

/**
 * Verificar compañía por nombre
 * GET /core/CheckCompany/companyname/{companyName}
 */
export async function checkCompany(companyName: string) {
    const response = await apiClient.get(`/core/CheckCompany/companyname/${encodeURIComponent(companyName)}`);
    return response.data?.Data || response.data;
}

/**
 * Login de usuario
 * POST /core/Login
 */
/**
 * Login de usuario
 * POST /core/Login
 */
export async function loginUser(params: LoginParams) {
    const { email, password, tenantId } = params;

    const response = await apiClient.post('/core/Login', {
        Email: email,
        userName: null,
        Password: password,
        RememberMe: false,
        Tenant: tenantId,
    });

    const data = response.data?.Data || response.data;

    // 🔍 Debug: ver estructura completa
    console.log('🔍 LOGIN DATA STRUCTURE:', JSON.stringify(data, null, 2));

    // ✅ VALIDAR LoginCode ANTES de continuar
    const loginCode = data?.CustomerInfo?.LoginCode;
    const loginMessage = data?.CustomerInfo?.LoginMessage;

    if (loginCode && loginCode !== 200) {
        // El API devolvió un error (404 = usuario no existe, etc.)
        throw new Error(loginMessage || 'Error de autenticación');
    }

    // Buscar token en múltiples ubicaciones posibles
    const token = data?.AuthenticationInfo?.Token
        || data?.Token
        || data?.token
        || data?.AccessToken
        || data?.accessToken;

    if (token) {
        await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, token);
        console.log('✅ Token guardado, length:', token.length);
    } else {
        // Si no hay token después de validar LoginCode, algo salió mal
        throw new Error(loginMessage || 'No se pudo autenticar. Verifica tus credenciales.');
    }

    return data;
}

/**
 * Logout
 */
export async function logout() {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.TENANT_ID);
}

// ============================================
// Storage helpers
// ============================================
export const storage = {
    async set(key: string, value: string): Promise<void> {
        await SecureStore.setItemAsync(key, value);
    },
    async get(key: string): Promise<string | null> {
        return SecureStore.getItemAsync(key);
    },
    async remove(key: string): Promise<void> {
        await SecureStore.deleteItemAsync(key);
    },
    async setObject<T>(key: string, value: T): Promise<void> {
        await SecureStore.setItemAsync(key, JSON.stringify(value));
    },
    async getObject<T>(key: string): Promise<T | null> {
        const value = await SecureStore.getItemAsync(key);
        return value ? JSON.parse(value) : null;
    },
};

// ============================================
// Error helper
// ============================================
export const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        if (data?.Status?.Message) return data.Status.Message;
        if (typeof data === 'string') return data;
        if (data?.message) return data.message;
        if (error.code === 'ECONNABORTED') return 'Tiempo de espera agotado';
        if (error.response?.status === 400) return 'Datos inválidos';
        if (error.response?.status === 401) return 'No autorizado';
        if (error.response?.status === 404) return 'No encontrado';
        if (!error.response) return 'Sin conexión';
        return error.message || 'Error de conexión';
    }
    if (error instanceof Error) return error.message;
    return 'Error desconocido';
};

export default apiClient;