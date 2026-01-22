// src/services/syncService.ts
// Servicio para sincronizar datos cuando se recupera la conexión

import {
    getOfflineQueue,
    removeFromOfflineQueue,
    clearOfflineQueue,
    setCache,
    CACHE_KEYS,
    CACHE_TTL,
} from '../utils/storage';
import { useAuthStore } from '../stores/auth-store';

interface SyncResult {
    success: boolean;
    synced: number;
    failed: number;
    errors: string[];
}

interface SyncStatus {
    isSyncing: boolean;
    lastSyncAt: number | null;
    pendingCount: number;
}

let syncStatus: SyncStatus = {
    isSyncing: false,
    lastSyncAt: null,
    pendingCount: 0,
};

const syncListeners: Set<(status: SyncStatus) => void> = new Set();

export function subscribeSyncStatus(listener: (status: SyncStatus) => void): () => void {
    syncListeners.add(listener);
    listener(syncStatus);
    return () => {
        syncListeners.delete(listener);
    };
}

function notifyListeners() {
    syncListeners.forEach((listener) => listener(syncStatus));
}

function updateSyncStatus(updates: Partial<SyncStatus>) {
    syncStatus = { ...syncStatus, ...updates };
    notifyListeners();
}

/**
 * Sincroniza las acciones pendientes cuando hay conexión
 */
export async function syncOfflineActions(): Promise<SyncResult> {
    if (syncStatus.isSyncing) {
        return { success: false, synced: 0, failed: 0, errors: ['Sincronización en progreso'] };
    }

    updateSyncStatus({ isSyncing: true });

    const result: SyncResult = {
        success: true,
        synced: 0,
        failed: 0,
        errors: [],
    };

    try {
        const queue = await getOfflineQueue();
        updateSyncStatus({ pendingCount: queue.length });

        if (queue.length === 0) {
            updateSyncStatus({
                isSyncing: false,
                lastSyncAt: Date.now(),
            });
            return { ...result, success: true };
        }

        // Procesar cada acción en orden
        for (const action of queue) {
            try {
                await processOfflineAction(action);
                await removeFromOfflineQueue(action.id);
                result.synced++;
                updateSyncStatus({ pendingCount: syncStatus.pendingCount - 1 });
            } catch (error: any) {
                result.failed++;
                result.errors.push(`${action.type} ${action.entity}: ${error.message}`);
                // No removemos de la cola si falló - se reintentará
            }
        }

        result.success = result.failed === 0;
        updateSyncStatus({
            isSyncing: false,
            lastSyncAt: Date.now(),
            pendingCount: result.failed,
        });

        return result;
    } catch (error: any) {
        updateSyncStatus({ isSyncing: false });
        return {
            success: false,
            synced: result.synced,
            failed: result.failed,
            errors: [error.message],
        };
    }
}

/**
 * Procesa una acción offline individual
 */
async function processOfflineAction(action: {
    type: 'CREATE' | 'UPDATE' | 'DELETE';
    entity: 'customer' | 'club' | 'payment';
    data: any;
}): Promise<void> {
    const { getApiClient } = useAuthStore.getState();
    const client = getApiClient();

    if (!client) {
        throw new Error('No hay cliente API disponible');
    }

    // Por ahora solo logueamos - en producción aquí irían las llamadas API
    console.log(`Syncing offline action: ${action.type} ${action.entity}`, action.data);

    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 500));

    // En producción, aquí harías las llamadas API según el tipo de acción:
    // switch (action.entity) {
    //     case 'payment':
    //         if (action.type === 'CREATE') {
    //             await client.post('/payments', action.data);
    //         }
    //         break;
    //     case 'club':
    //         // etc...
    //         break;
    // }
}

/**
 * Precarga datos críticos para modo offline
 */
export async function prefetchOfflineData(): Promise<void> {
    const { getApiClient, token } = useAuthStore.getState();

    if (!token) return;

    const client = getApiClient();
    if (!client) return;

    try {
        // Cargar tipos de club (catálogo estático)
        const clubTypesResponse = await client.get('/club/type');
        if (clubTypesResponse.data) {
            await setCache(CACHE_KEYS.CLUB_TYPES, clubTypesResponse.data, CACHE_TTL.CATALOG);
        }

        // Cargar estatus de club
        const clubStatusesResponse = await client.get('/club/status');
        if (clubStatusesResponse.data) {
            await setCache(CACHE_KEYS.CLUB_STATUSES, clubStatusesResponse.data, CACHE_TTL.CATALOG);
        }

        // Cargar denominaciones
        const denominationsResponse = await client.get('/denomination');
        if (denominationsResponse.data) {
            await setCache(CACHE_KEYS.DENOMINATIONS, denominationsResponse.data, CACHE_TTL.CATALOG);
        }

        console.log('Offline data prefetched successfully');
    } catch (error) {
        console.error('Error prefetching offline data:', error);
    }
}

/**
 * Obtiene el estado actual de sincronización
 */
export function getSyncStatus(): SyncStatus {
    return syncStatus;
}

/**
 * Limpia toda la cola de sincronización (usar con cuidado)
 */
export async function clearPendingSync(): Promise<void> {
    await clearOfflineQueue();
    updateSyncStatus({ pendingCount: 0 });
}
