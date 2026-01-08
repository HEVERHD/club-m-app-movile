// src/store/settingsStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

// Storage adapter para Zustand + SecureStore
const secureStorage = {
    getItem: async (name: string) => {
        const value = await SecureStore.getItemAsync(name);
        return value ?? null;
    },
    setItem: async (name: string, value: string) => {
        await SecureStore.setItemAsync(name, value);
    },
    removeItem: async (name: string) => {
        await SecureStore.deleteItemAsync(name);
    },
};

export type Environment = 'dev' | 'qa' | 'prod';

interface SettingsState {
    environment: Environment;
    isInitialized: boolean;

    // Actions
    setEnvironment: (env: Environment) => void;
    initialize: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            environment: 'qa', // Default a QA
            isInitialized: false,

            setEnvironment: (environment) => {
                console.log('🔄 Cambiando entorno a:', environment);
                set({ environment });
            },

            initialize: () => {
                set({ isInitialized: true });
            },
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => secureStorage),
            onRehydrateStorage: () => (state) => {
                console.log('⚙️ Settings cargados:', state?.environment);
                state?.initialize();
            },
        }
    )
);