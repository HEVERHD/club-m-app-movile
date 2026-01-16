// src/utils/storage.ts
// Servicio de almacenamiento offline con AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StateStorage } from 'zustand/middleware';

// Adaptador para Zustand persist middleware
export const zustandStorage: StateStorage = {
    getItem: async (name: string) => {
        const value = await AsyncStorage.getItem(name);
        return value ?? null;
    },
    setItem: async (name: string, value: string) => {
        await AsyncStorage.setItem(name, value);
    },
    removeItem: async (name: string) => {
        await AsyncStorage.removeItem(name);
    },
};

// ============================================
// Funciones de Cache Genéricas
// ============================================

interface CacheItem<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos por defecto

/**
 * Guardar datos en cache con TTL
 */
export async function setCache<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL): Promise<void> {
    const now = Date.now();
    const cacheItem: CacheItem<T> = {
        data,
        timestamp: now,
        expiresAt: now + ttlMs,
    };
    await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
}

/**
 * Obtener datos del cache (null si expiró o no existe)
 */
export async function getCache<T>(key: string): Promise<T | null> {
    try {
        const raw = await AsyncStorage.getItem(key);
        if (!raw) return null;

        const cacheItem: CacheItem<T> = JSON.parse(raw);

        // Verificar si expiró
        if (Date.now() > cacheItem.expiresAt) {
            await AsyncStorage.removeItem(key);
            return null;
        }

        return cacheItem.data;
    } catch {
        return null;
    }
}

/**
 * Obtener datos del cache sin verificar expiración (para modo offline)
 */
export async function getCacheForOffline<T>(key: string): Promise<{ data: T; isStale: boolean } | null> {
    try {
        const raw = await AsyncStorage.getItem(key);
        if (!raw) return null;

        const cacheItem: CacheItem<T> = JSON.parse(raw);
        const isStale = Date.now() > cacheItem.expiresAt;

        return {
            data: cacheItem.data,
            isStale,
        };
    } catch {
        return null;
    }
}

/**
 * Eliminar item del cache
 */
export async function removeCache(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
}

/**
 * Limpiar todo el cache
 */
export async function clearAllCache(): Promise<void> {
    await AsyncStorage.clear();
}

/**
 * Obtener todas las keys del cache
 */
export async function getAllCacheKeys(): Promise<string[]> {
    return await AsyncStorage.getAllKeys() as string[];
}

// ============================================
// Keys de Cache específicas
// ============================================

export const CACHE_KEYS = {
    // Auth
    AUTH_TOKEN: 'auth_token',
    AUTH_USER: 'auth_user',

    // Clientes
    CUSTOMERS_LIST: 'customers_list',
    CUSTOMER_DETAIL: (id: string) => `customer_${id}`,
    CUSTOMER_STATS: (id: string) => `customer_stats_${id}`,

    // Clubes
    CLUBS_LIST: 'clubs_list',
    CLUB_DETAIL: (id: string) => `club_${id}`,
    CLUB_WEEKS: (id: string) => `club_weeks_${id}`,

    // Catálogos (larga duración)
    CLUB_TYPES: 'club_types',
    CLUB_STATUSES: 'club_statuses',
    DENOMINATIONS: 'denominations',

    // Sorteos
    DRAWS_LIST: 'draws_list',
    DRAW_DETAIL: (id: string) => `draw_${id}`,

    // Configuración
    LAST_SYNC: 'last_sync',
    OFFLINE_QUEUE: 'offline_queue',
};

// TTLs específicos por tipo de datos
export const CACHE_TTL = {
    SHORT: 2 * 60 * 1000,       // 2 minutos - datos que cambian frecuentemente
    MEDIUM: 5 * 60 * 1000,      // 5 minutos - datos normales
    LONG: 30 * 60 * 1000,       // 30 minutos - datos que cambian poco
    CATALOG: 24 * 60 * 60 * 1000, // 24 horas - catálogos estáticos
};

// ============================================
// Utilidad para modo offline
// ============================================

interface OfflineAction {
    id: string;
    type: 'CREATE' | 'UPDATE' | 'DELETE';
    entity: 'customer' | 'club' | 'payment';
    data: any;
    timestamp: number;
}

/**
 * Agregar acción a la cola offline (para sincronizar cuando haya conexión)
 */
export async function queueOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp'>): Promise<void> {
    const queue = await getOfflineQueue();
    const newAction: OfflineAction = {
        ...action,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
    };
    queue.push(newAction);
    await AsyncStorage.setItem(CACHE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
}

/**
 * Obtener cola de acciones offline pendientes
 */
export async function getOfflineQueue(): Promise<OfflineAction[]> {
    try {
        const raw = await AsyncStorage.getItem(CACHE_KEYS.OFFLINE_QUEUE);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

/**
 * Limpiar cola offline después de sincronizar
 */
export async function clearOfflineQueue(): Promise<void> {
    await AsyncStorage.removeItem(CACHE_KEYS.OFFLINE_QUEUE);
}

/**
 * Remover una acción específica de la cola
 */
export async function removeFromOfflineQueue(actionId: string): Promise<void> {
    const queue = (await getOfflineQueue()).filter(a => a.id !== actionId);
    await AsyncStorage.setItem(CACHE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
}
