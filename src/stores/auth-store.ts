// src/stores/auth-store.ts
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { loginUser, checkCompany, logout as apiLogout, LoginParams, STORAGE_KEYS } from '../api/client';

export type UserRole = 'admin' | 'operator' | 'analyst' | 'customer';

interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    tenantId: string;
    // Datos adicionales para clientes
    customerId?: string;
    identificationNumber?: string;
}

// Helper para determinar si es staff (admin/operator/analyst) o cliente
export const isStaffRole = (role: UserRole): boolean => {
    return ['admin', 'operator', 'analyst'].includes(role);
};

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

// Helper para normalizar roles desde UserRoles[]
const normalizeRoles = (userRoles: any[]): string[] => {
    if (!Array.isArray(userRoles)) return [];
    return userRoles.map((r) => {
        if (typeof r === 'string') return r;
        if (typeof r === 'object' && r !== null) {
            // La API devuelve { RoleName: "Super Admin", ... }
            return r.RoleName || r.Name || r.name || String(r);
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
            const companyData = Array.isArray(response) ? response[0] : response;
            const tenantId = companyData?.SaaSId || companyData?.TenantId;
            const tenantName = companyData?.CompanyName || companyName;

            if (!tenantId) {
                throw new Error('Compañía no encontrada');
            }

            await SecureStore.setItemAsync('tenantId', String(tenantId));
            await SecureStore.setItemAsync('tenantName', tenantName);

            console.log('✅ Company guardada:', { tenantId, tenantName });

            set({ tenantId, tenantName, isLoading: false });
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
        const { useSettingsStore } = await import('./settingsStore');
        const env = useSettingsStore.getState().environment;
        const { getBaseUrl } = await import('../services/api.config');

        console.log('════════════════════════════════════════');
        console.log('🌍 AMBIENTE:', env);
        console.log('🔗 BASE URL:', getBaseUrl());
        console.log('📧 EMAIL:', params.email);
        console.log('🏢 TENANT ID:', params.tenantId);
        console.log('════════════════════════════════════════');
        set({ isLoading: true, error: null });

        let currentTenantId = params.tenantId;
        if (!currentTenantId) {
            const storedTenantId = await SecureStore.getItemAsync('tenantId');
            if (storedTenantId) {
                currentTenantId = parseInt(storedTenantId);
            }
        }

        if (!currentTenantId) {
            set({ isLoading: false, error: 'Selecciona una compañía primero' });
            throw new Error('Selecciona una compañía primero');
        }

        try {
            const data = await loginUser({ ...params, tenantId: currentTenantId });

            // ✅ CORREGIDO: Acceder a las propiedades correctas (PascalCase)
            const authInfo = data?.AuthenticationInfo;
            const customerInfo = data?.CustomerInfo;

            console.log('═══════════════════════════════════════');
            console.log('🔐 LOGIN RESPONSE:');
            console.log('→ Token:', authInfo?.Token ? '✅ Presente' : '❌ No presente');
            console.log('→ UserId:', authInfo?.UserId);
            console.log('→ UserName:', authInfo?.UserName);
            console.log('→ FullName:', customerInfo?.FullName);
            console.log('→ UserRoles:', authInfo?.UserRoles?.length, 'roles');
            console.log('═══════════════════════════════════════');

            // Normalizar roles desde AuthenticationInfo.UserRoles
            const roles = normalizeRoles(authInfo?.UserRoles || []);
            console.log('🎭 Roles normalizados:', roles);

            // ⚠️ FLAG DE DESARROLLO: Cambiar a true para forzar modo cliente
            const FORCE_CUSTOMER_MODE = false;

            // Determinar rol de la app
            // Si no tiene roles de staff, es un cliente
            let role: UserRole = 'customer';
            if (FORCE_CUSTOMER_MODE) {
                console.log('⚠️ MODO CLIENTE FORZADO (desarrollo)');
                role = 'customer';
            } else if (roles.some(r => r.toLowerCase().includes('admin') || r.toLowerCase().includes('super'))) {
                role = 'admin';
            } else if (roles.some(r => r.toLowerCase().includes('operator') || r.toLowerCase().includes('operador'))) {
                role = 'operator';
            } else if (roles.some(r => r.toLowerCase().includes('analyst') || r.toLowerCase().includes('analista'))) {
                role = 'analyst';
            }
            // Si tiene algún rol de staff pero no matchea los anteriores, es operator
            else if (roles.length > 0 && roles.some(r =>
                r.toLowerCase().includes('staff') ||
                r.toLowerCase().includes('employee') ||
                r.toLowerCase().includes('empleado')
            )) {
                role = 'operator';
            }

            console.log('🎯 Rol determinado:', role);

            const user: User = {
                id: authInfo?.UserId || '',
                email: authInfo?.Email || authInfo?.UserName || params.email,
                name: customerInfo?.FullName || authInfo?.UserName || params.email,
                role,
                tenantId: String(currentTenantId),
                // Datos de cliente si aplica
                customerId: customerInfo?.CustomerId || undefined,
                identificationNumber: customerInfo?.IdentificationNumber || undefined,
            };

            console.log('👤 Usuario final:', user);

            // El token ya se guarda en client.ts loginUser(), pero por si acaso:
            if (authInfo?.Token) {
                await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, authInfo.Token);
                console.log('✅ Token guardado en SecureStore');
            }

            // Guardar datos del usuario para restaurar sesión
            await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify({
                userId: user.id,
                email: user.email,
                fullName: user.name,
                role: user.role,
                customerId: user.customerId,
                identificationNumber: user.identificationNumber,
            }));
            console.log('✅ User data guardado en SecureStore');

            set({
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
                tenantId: currentTenantId,
            });

            console.log('✅ Login exitoso');
        } catch (error: any) {
            console.error('❌ Login error:', error);
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

        await SecureStore.deleteItemAsync('tenantId');
        await SecureStore.deleteItemAsync('tenantName');
        await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);

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
            const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
            const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);

            console.log('📖 Cargando auth guardada:', {
                tenantId,
                tenantName,
                hasToken: !!token,
                hasUserData: !!userData
            });

            if (tenantId) {
                let user: User | null = null;

                if (userData && token) {
                    try {
                        const parsed = JSON.parse(userData);
                        user = {
                            id: parsed.userId || parsed.customerId || '',
                            email: parsed.email || '',
                            name: parsed.fullName || parsed.email || '',
                            role: parsed.role || 'customer', // Default a customer si no hay rol guardado
                            tenantId: tenantId,
                            customerId: parsed.customerId,
                            identificationNumber: parsed.identificationNumber,
                        };
                    } catch (e) {
                        console.error('Error parsing userData:', e);
                    }
                }

                set({
                    tenantId: parseInt(tenantId),
                    tenantName: tenantName || null,
                    isAuthenticated: !!token && !!user,
                    user,
                });
            }
        } catch (e) {
            console.error('Error loading stored auth:', e);
        }
    },
}));