// src/contexts/NetworkContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import { AppState, AppStateStatus } from 'react-native';

interface NetworkContextType {
    isConnected: boolean;
    isInternetReachable: boolean | null;
    connectionType: string | null;
    isOffline: boolean;
    lastOnlineAt: number | null;
    checkConnection: () => Promise<boolean>;
}

const NetworkContext = createContext<NetworkContextType>({
    isConnected: true,
    isInternetReachable: true,
    connectionType: null,
    isOffline: false,
    lastOnlineAt: null,
    checkConnection: async () => true,
});

export function NetworkProvider({ children }: { children: React.ReactNode }) {
    const [networkState, setNetworkState] = useState<{
        isConnected: boolean;
        isInternetReachable: boolean | null;
        connectionType: string | null;
    }>({
        isConnected: true,
        isInternetReachable: true,
        connectionType: null,
    });

    const [lastOnlineAt, setLastOnlineAt] = useState<number | null>(Date.now());
    const unsubscribeRef = useRef<NetInfoSubscription | null>(null);

    const updateNetworkState = useCallback((state: NetInfoState) => {
        const isConnected = state.isConnected ?? false;
        const isInternetReachable = state.isInternetReachable;

        setNetworkState({
            isConnected,
            isInternetReachable,
            connectionType: state.type,
        });

        // Update last online timestamp when connection is restored
        if (isConnected && isInternetReachable) {
            setLastOnlineAt(Date.now());
        }
    }, []);

    const checkConnection = useCallback(async (): Promise<boolean> => {
        try {
            const state = await NetInfo.fetch();
            updateNetworkState(state);
            return state.isConnected === true && state.isInternetReachable === true;
        } catch (error) {
            console.error('Error checking network connection:', error);
            return false;
        }
    }, [updateNetworkState]);

    useEffect(() => {
        // Initial fetch
        NetInfo.fetch().then(updateNetworkState);

        // Subscribe to network state changes
        unsubscribeRef.current = NetInfo.addEventListener(updateNetworkState);

        // Also check connection when app comes to foreground
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                checkConnection();
            }
        };

        const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
            appStateSubscription.remove();
        };
    }, [updateNetworkState, checkConnection]);

    const isOffline = !networkState.isConnected || networkState.isInternetReachable === false;

    return (
        <NetworkContext.Provider
            value={{
                isConnected: networkState.isConnected,
                isInternetReachable: networkState.isInternetReachable,
                connectionType: networkState.connectionType,
                isOffline,
                lastOnlineAt,
                checkConnection,
            }}
        >
            {children}
        </NetworkContext.Provider>
    );
}

export function useNetwork() {
    const context = useContext(NetworkContext);
    if (!context) {
        throw new Error('useNetwork must be used within a NetworkProvider');
    }
    return context;
}

export { NetworkContext };
