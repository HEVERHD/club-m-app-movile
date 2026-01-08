// src/services/api.config.ts

import { Environment, useSettingsStore } from "../stores/settingsStore";


// ============================================
// API Keys por entorno
// ============================================
const API_KEYS: Record<Environment, { apiKey: string; mdl05Key: string }> = {
    dev: {
        apiKey: 'f718d6d8af9848008b8f6a6f516cb7ba',
        mdl05Key: 'qvKwBcKm0SwzfwAIbjxxjjUMdgRLufDmCy3sXVC6mUgLCfEl0qxIOt2te9NiCe3zjTJPy1RCbZiHuhMgHz+zkt9aylZTHDnYdl3HDQzy8Du6cDPmPfdzXGD+eu34vR2HPeq50GfF3Z2AUsn7OlzYxy+7CpnOXMqiE+mIx0G0n97dofWvHoHteLswKuo4KvrQ6Toz9COJ7dblyySLGwcLMDCGgWAR8b9wu1hSH8L9OvhBcpbJ/wW003myYJb1C3cS6bVnvZdV3MbTNWxVDLsH9hrdYLq11TOwcBNjFc1vgSwbIZbxgkp15ndtOoNdZQxeO5GycQoTsprMX+4D3VXxtQ==',
    },
    qa: {
        apiKey: 'f718d6d8af9848008b8f6a6f516cb7ba',
        mdl05Key: 'qvKwBcKm0SwzfwAIbjxxjjUMdgRLufDmCy3sXVC6mUgLCfEl0qxIOt2te9NiCe3zjTJPy1RCbZiHuhMgHz+zkt9aylZTHDnYdl3HDQzy8Du6cDPmPfdzXGD+eu34vR2HPeq50GfF3Z2AUsn7OlzYxy+7CpnOXMqiE+mIx0G0n97dofWvHoHteLswKuo4KvrQ6Toz9COJ7dblyySLGwcLMDCGgWAR8b9wu1hSH8L9OvhBcpbJ/wW003myYJb1C3cS6bVnvZdV3MbTNWxVDLsH9hrdYLq11TOwcBNjFc1vgSwbIZbxgkp15ndtOoNdZQxeO5GycQoTsprMX+4D3VXxtQ==',
    },
    prod: {
        apiKey: '', // TODO: Agregar key de producción
        mdl05Key: '', // TODO: Agregar key de producción
    },
};

// ============================================
// URLs base por entorno
// ============================================
export const getBaseUrl = (): string => {
    const environment = useSettingsStore.getState().environment;

    if (environment === 'prod') {
        return 'https://apim.aludra.cloud';
    }

    return `https://${environment}-apim.aludra.cloud`;
};

// ============================================
// Obtener API Keys
// ============================================
export const getApiKey = (): string => {
    const environment = useSettingsStore.getState().environment;
    return API_KEYS[environment].apiKey;
};

export const getMdl05Key = (): string => {
    const environment = useSettingsStore.getState().environment;
    return API_KEYS[environment].mdl05Key;
};

// ============================================
// Módulos disponibles
// ============================================
export const MODULES = {
    CORE: 'core',
    MDL01: 'mdl01',
    MDL03: 'mdl03',
    MDL04: 'mdl04',
    MDL05: 'mdl05', // Clubes de Mercancía
    MDL06: 'mdl06',
    MDL07: 'mdl07',
    MDL10: 'mdl10',
    MDL11: 'mdl11',
    MDL12: 'mdl12',
    MDL14: 'mdl14',
    MDL15: 'mdl15',
    MDL17: 'mdl17',
    MDL21: 'mdl21',
    MDL22: 'mdl22',
    MDL24: 'mdl24',
    MDL30: 'mdl30',
    MDL32: 'mdl32',
    MDL38: 'mdl38',
} as const;

export type ModuleKey = keyof typeof MODULES;

// ============================================
// Generador de URLs de API
// ============================================
export const API = {
    url: (module: ModuleKey, endpoint: string): string => {
        const base = getBaseUrl();
        const mdl = MODULES[module];
        return `${base}/${mdl}/${endpoint}`;
    },

    // Shortcuts para módulos comunes
    core: (endpoint: string) => API.url('CORE', endpoint),
    mdl05: (endpoint: string) => API.url('MDL05', endpoint),
};

// ============================================
// Debug helper
// ============================================
export const logApiConfig = () => {
    const env = useSettingsStore.getState().environment;
    console.log('🔧 API CONFIG:', {
        environment: env,
        baseUrl: getBaseUrl(),
        apiKey: getApiKey() ? '✅ Presente' : '❌ Falta',
        mdl05Key: getMdl05Key() ? '✅ Presente' : '❌ Falta',
    });
};