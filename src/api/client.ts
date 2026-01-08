// src/api/client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://qa-apim.aludra.cloud';
const API_KEY = 'f718d6d8af9848008b8f6a6f516cb7ba';
const MDL05_API_KEY = 'qvKwBcKm0SwzfwAIbjxxjjUMdgRLufDmCy3sXVC6mUgLCfEl0qxIOt2te9NiCe3zjTJPy1RCbZiHuhMgHz+zkt9aylZTHDnYdl3HDQzy8Du6cDPmPfdzXGD+eu34vR2HPeq50GfF3Z2AUsn7OlzYxy+7CpnOXMqiE+mIx0G0n97dofWvHoHteLswKuo4KvrQ6Toz9COJ7dblyySLGwcLMDCGgWAR8b9wu1hSH8L9OvhBcpbJ/wW003myYJb1C3cS6bVnvZdV3MbTNWxVDLsH9hrdYLq11TOwcBNjFc1vgSwbIZbxgkp15ndtOoNdZQxeO5GycQoTsprMX+4D3VXxtQ==';

// Helper para obtener token desde SecureStore
const getAccessToken = async (): Promise<string | null> => {
    try {
        return await SecureStore.getItemAsync('accessToken');
    } catch (e) {
        console.error('Error getting token:', e);
        return null;
    }
};

// Cliente principal (MDL03, Core)
export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Ocp-Apim-Subscription-Key': API_KEY,
    },
    timeout: 30000,
});

apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = await getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('tenantId');
        }
        return Promise.reject(error);
    }
);

// Cliente para MDL05 (Clubes)
export const mdl05Client = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'api-key': MDL05_API_KEY,
    },
    timeout: 180000, // 3 minutos - endpoint lento
});

// ============ Auth Functions ============

export interface LoginParams {
    email: string;
    password: string;
    tenantId: number;
}

export const checkCompany = async (companyName: string): Promise<any> => {
    const { data } = await apiClient.get(`/core/CheckCompany/companyname/${companyName}`);

    if (data?.Status?.Code === 404 || data?.Status?.Code === 400) {
        throw new Error(data?.Status?.Message || 'Compañía no encontrada');
    }

    if (!data?.Data) {
        throw new Error('Compañía no encontrada');
    }

    return data.Data;
};

export const loginUser = async (params: LoginParams): Promise<any> => {
    const { data } = await apiClient.post('/core/Login', {
        Email: params.email,
        userName: null,
        Password: params.password,
        RememberMe: true,
        Tenant: params.tenantId,
    });

    if (data?.Status?.Code === 401 || data?.Status?.Code === 404) {
        throw new Error(data?.Status?.Message || 'Credenciales inválidas');
    }

    if (!data?.Data) {
        throw new Error('Credenciales inválidas');
    }

    const responseData = data.Data;
    const token = responseData?.AuthenticationInfo?.Token;

    if (!token) {
        throw new Error('Error de autenticación');
    }

    // Guardar token en SecureStore
    await SecureStore.setItemAsync('accessToken', token);
    await SecureStore.setItemAsync('tenantId', String(params.tenantId));

    return {
        token,
        userId: responseData?.AuthenticationInfo?.UserId,
        userName: responseData?.AuthenticationInfo?.UserName,
        userRoles: responseData?.AuthenticationInfo?.UserRoles || [],
        customerInfo: responseData?.CustomerInfo,
    };
};

export const logout = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('tenantId');
};