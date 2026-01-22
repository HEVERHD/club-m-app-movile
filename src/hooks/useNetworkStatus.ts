// src/hooks/useNetworkStatus.ts
import { useEffect, useState, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { getOfflineQueue } from '../utils/storage';

interface NetworkStatus {
    isConnected: boolean;
    isInternetReachable: boolean | null;
    connectionType: string | null;
    pendingActions: number;
}

export function useNetworkStatus() {
    const [status, setStatus] = useState<NetworkStatus>({
        isConnected: true,
        isInternetReachable: true,
        connectionType: null,
        pendingActions: 0,
    });

    const updatePendingActions = useCallback(async () => {
        const queue = await getOfflineQueue();
        setStatus(prev => ({ ...prev, pendingActions: queue.length }));
    }, []);

    const checkConnection = useCallback(async (): Promise<boolean> => {
        try {
            const state = await NetInfo.fetch();
            const queue = await getOfflineQueue();
            setStatus({
                isConnected: state.isConnected ?? false,
                isInternetReachable: state.isInternetReachable,
                connectionType: state.type,
                pendingActions: queue.length,
            });
            return state.isConnected === true && state.isInternetReachable === true;
        } catch (error) {
            console.error('Error checking network:', error);
            return false;
        }
    }, []);

    useEffect(() => {
        // Verificar estado inicial
        NetInfo.fetch().then(async (state: NetInfoState) => {
            const queue = await getOfflineQueue();
            setStatus({
                isConnected: state.isConnected ?? false,
                isInternetReachable: state.isInternetReachable,
                connectionType: state.type,
                pendingActions: queue.length,
            });
        });

        // Suscribirse a cambios
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            setStatus(prev => ({
                ...prev,
                isConnected: state.isConnected ?? false,
                isInternetReachable: state.isInternetReachable,
                connectionType: state.type,
            }));
        });

        return () => unsubscribe();
    }, []);

    // Verificar cola de acciones pendientes periódicamente
    useEffect(() => {
        updatePendingActions();
        const interval = setInterval(updatePendingActions, 5000);
        return () => clearInterval(interval);
    }, [updatePendingActions]);

    return {
        ...status,
        isOffline: !status.isConnected || status.isInternetReachable === false,
        updatePendingActions,
        checkConnection,
    };
}
