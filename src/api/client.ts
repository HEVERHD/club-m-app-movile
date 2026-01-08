// src/api/client.ts - ACTUALIZADO
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { getBaseUrl, getApiKey, getMdl05Key, logApiConfig } from '../services/api.config';

export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    TENANT_ID: 'tenantId',
    USER_DATA: 'userData',
} as const;

const getAccessToken = async (): Promise<string | null> => {
    try {
        return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (e) {
        console.error('Error getting token:', e);
        return null;
    }
};

// ============================================
// Factory para crear clientes con config actual
// ============================================
const createApiClient = (): AxiosInstance => {
    const client = axios.create({
        baseURL: getBaseUrl(),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Ocp-Apim-Subscription-Key': getApiKey(),
        },
        timeout: 30000,
    });

    client.interceptors.request.use(
        async (config: InternalAxiosRequestConfig) => {
            // Actualizar baseURL y headers en cada request
            config.baseURL = getBaseUrl();
            config.headers['Ocp-Apim-Subscription-Key'] = getApiKey();

            const token = await getAccessToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    client.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
            if (error.response?.status === 401) {
                await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
                await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
            }
            return Promise.reject(error);
        }
    );

    return client;
};

const createMdl05Client = (): AxiosInstance => {
    const client = axios.create({
        baseURL: getBaseUrl(),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'api-key': getMdl05Key(),
        },
        timeout: 180000, // 3 minutos - endpoints lentos
    });

    client.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            // Actualizar baseURL y api-key en cada request
            config.baseURL = getBaseUrl();
            config.headers['api-key'] = getMdl05Key();

            console.log('📤 MDL05 REQUEST:', {
                url: config.url,
                method: config.method,
                baseURL: config.baseURL,
                hasApiKey: !!config.headers['api-key'],
            });

            return config;
        },
        (error) => Promise.reject(error)
    );

    client.interceptors.response.use(
        (response) => {
            console.log('📥 MDL05 RESPONSE:', response.status);
            return response;
        },
        async (error: AxiosError) => {
            console.error('❌ MDL05 ERROR:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
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

// Log inicial
logApiConfig();

export default apiClient;