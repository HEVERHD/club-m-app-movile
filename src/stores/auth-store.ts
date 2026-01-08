// src/stores/auth-store.ts
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { loginUser, checkCompany, logout as apiLogout, LoginParams } from '../api/client';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'operator' | 'analyst';
    tenantId: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    tenantId: number | null;
    tenantName: string | null;
}

interface AuthActions {
    checkCompany: (companyName: string) => Promise<void>;
    login: (params: LoginParams) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
    loadStoredAuth: () => Promise<void>;
}

// Helper para normalizar roles
const normalizeRoles = (rawRoles: any[]): string[] => {
    if (!Array.isArray(rawRoles)) return [];
    return rawRoles.map((r) => {
        if (typeof r === 'string') return r;
        if (typeof r === 'object' && r !== null) {
            return r.Name || r.RoleName || r.name || String(r);
        }
        return String(r);
    }).filter(Boolean);
};

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    tenantId: null,
    tenantName: null,

    checkCompany: async (companyName: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await checkCompany(companyName);

            // client.ts ya devuelve data.Data que es un array
            const companyData = Array.isArray(response) ? response[0] : response;

            const tenantId = companyData?.SaaSId || companyData?.TenantId;
            const tenantName = companyData?.CompanyName || companyName;

            if (!tenantId) {
                throw new Error('Compañía no encontrada');
            }

            // Guardar en SecureStore ANTES de actualizar el state
            await SecureStore.setItemAsync('tenantId', String(tenantId));
            await SecureStore.setItemAsync('tenantName', tenantName);

            console.log('✅ Company guardada:', { tenantId, tenantName });

            set({
                tenantId,
                tenantName,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.message || 'Compañía no encontrada',
                tenantId: null,
                tenantName: null,
            });
            throw error;
        }
    },

    login: async (params: LoginParams) => {
        set({ isLoading: true, error: null });

        // Si tenantId no está en el state, intentar leerlo de SecureStore
        let currentTenantId = params.tenantId;
        if (!currentTenantId) {
            const storedTenantId = await SecureStore.getItemAsync('tenantId');
            if (storedTenantId) {
                currentTenantId = parseInt(storedTenantId);
                console.log('📖 TenantId leído de SecureStore:', currentTenantId);
            }
        }

        if (!currentTenantId) {
            set({ isLoading: false, error: 'Selecciona una compañía primero' });
            throw new Error('Selecciona una compañía primero');
        }

        try {
            const data = await loginUser({ ...params, tenantId: currentTenantId });

            // 🔍 DEBUG: Loguear toda la respuesta del login
            console.log('═══════════════════════════════════════');
            console.log('🔐 LOGIN RESPONSE - FULL DATA:');
            console.log('═══════════════════════════════════════');
            console.log(JSON.stringify(data, null, 2));
            console.log('═══════════════════════════════════════');
            console.log('📋 DESGLOSE:');
            console.log('→ userId:', data.userId);
            console.log('→ userName:', data.userName);
            console.log('→ token:', data.token ? '✅ Presente' : '❌ No presente');
            console.log('→ accessToken:', data.accessToken ? '✅ Presente' : '❌ No presente');
            console.log('→ userRoles:', data.userRoles);
            console.log('→ customerInfo:', data.customerInfo);
            console.log('═══════════════════════════════════════');

            const roles = normalizeRoles(data.userRoles || []);
            console.log('🎭 Roles normalizados:', roles);

            let role: User['role'] = 'operator';
            if (roles.some(r => r.toLowerCase().includes('admin'))) {
                role = 'admin';
            } else if (roles.some(r => r.toLowerCase().includes('analyst'))) {
                role = 'analyst';
            }

            const user: User = {
                id: data.userId || '',
                email: data.userName || params.email,
                name: data.customerInfo?.CustomerName || data.userName || params.email,
                role,
                tenantId: String(currentTenantId),
            };

            console.log('👤 Usuario final guardado:', user);

            // Guardar token en SecureStore
            if (data.accessToken) {
                await SecureStore.setItemAsync('accessToken', data.accessToken);
            }

            set({
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
                tenantId: currentTenantId,
            });

            console.log('✅ Login exitoso');
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.message || 'Error de autenticación',
                user: null,
                isAuthenticated: false,
            });
            throw error;
        }
    },

    logout: async () => {
        try {
            await apiLogout();
        } catch (e) {
            console.error('Logout API error:', e);
        }

        // Limpiar SecureStore
        await SecureStore.deleteItemAsync('tenantId');
        await SecureStore.deleteItemAsync('tenantName');
        await SecureStore.deleteItemAsync('accessToken');

        set({
            user: null,
            isAuthenticated: false,
            tenantId: null,
            tenantName: null,
            error: null,
        });
    },

    clearError: () => set({ error: null }),

    loadStoredAuth: async () => {
        try {
            const tenantId = await SecureStore.getItemAsync('tenantId');
            const tenantName = await SecureStore.getItemAsync('tenantName');
            const token = await SecureStore.getItemAsync('accessToken');

            console.log('📖 Cargando auth guardada:', { tenantId, tenantName, hasToken: !!token });

            if (tenantId) {
                set({
                    tenantId: parseInt(tenantId),
                    tenantName: tenantName || null,
                    isAuthenticated: !!token,
                });
            }
        } catch (e) {
            console.error('Error loading stored auth:', e);
        }
    },
}));