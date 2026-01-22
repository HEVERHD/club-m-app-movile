// src/hooks/useBiometrics.ts
import { useState, useEffect, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const BIOMETRIC_USER_KEY = 'biometric_user_email';
const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';

export type BiometricType = 'fingerprint' | 'facial' | 'iris' | 'none';

export interface SavedCredentials {
    email: string;
    password: string;
    tenantId: number;
}

interface BiometricState {
    isAvailable: boolean;
    isEnabled: boolean;
    biometricType: BiometricType;
    isLoading: boolean;
}

interface UseBiometricsReturn extends BiometricState {
    authenticate: (options?: { promptMessage?: string }) => Promise<boolean>;
    enableBiometrics: (credentials: SavedCredentials) => Promise<void>;
    disableBiometrics: () => Promise<void>;
    getSavedUserEmail: () => Promise<string | null>;
    getSavedCredentials: () => Promise<SavedCredentials | null>;
    checkBiometricAvailability: () => Promise<void>;
}

export function useBiometrics(): UseBiometricsReturn {
    const [state, setState] = useState<BiometricState>({
        isAvailable: false,
        isEnabled: false,
        biometricType: 'none',
        isLoading: true,
    });

    const getBiometricType = async (): Promise<BiometricType> => {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            return 'facial';
        }
        if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            return 'fingerprint';
        }
        if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
            return 'iris';
        }
        return 'none';
    };

    const checkBiometricAvailability = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true }));

            // Verificar si el hardware soporta biometría
            const hasHardware = await LocalAuthentication.hasHardwareAsync();

            // Verificar si hay datos biométricos registrados
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            // Verificar si el usuario habilitó biometría en la app
            const enabledValue = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
            const isEnabled = enabledValue === 'true';

            // Obtener tipo de biometría
            const biometricType = await getBiometricType();

            setState({
                isAvailable: hasHardware && isEnrolled,
                isEnabled,
                biometricType,
                isLoading: false,
            });
        } catch (error) {
            console.error('Error checking biometric availability:', error);
            setState(prev => ({
                ...prev,
                isAvailable: false,
                isLoading: false
            }));
        }
    }, []);

    useEffect(() => {
        checkBiometricAvailability();
    }, [checkBiometricAvailability]);

    const authenticate = useCallback(async (options?: { promptMessage?: string }): Promise<boolean> => {
        try {
            if (!state.isAvailable) {
                return false;
            }

            const promptMessage = options?.promptMessage || getBiometricPromptMessage(state.biometricType);

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage,
                cancelLabel: 'Cancelar',
                disableDeviceFallback: false,
                fallbackLabel: 'Usar contraseña',
            });

            return result.success;
        } catch (error) {
            console.error('Biometric authentication error:', error);
            return false;
        }
    }, [state.isAvailable, state.biometricType]);

    const enableBiometrics = useCallback(async (credentials: SavedCredentials) => {
        try {
            // Primero verificar que la biometría funciona
            const authResult = await authenticate({
                promptMessage: 'Confirma tu identidad para habilitar el acceso biométrico',
            });

            if (!authResult) {
                throw new Error('Autenticación biométrica fallida');
            }

            // Guardar preferencia, email y credenciales encriptadas
            await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
            await SecureStore.setItemAsync(BIOMETRIC_USER_KEY, credentials.email);
            await SecureStore.setItemAsync(BIOMETRIC_CREDENTIALS_KEY, JSON.stringify(credentials));

            setState(prev => ({ ...prev, isEnabled: true }));
        } catch (error) {
            console.error('Error enabling biometrics:', error);
            throw error;
        }
    }, [authenticate]);

    const disableBiometrics = useCallback(async () => {
        try {
            await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
            await SecureStore.deleteItemAsync(BIOMETRIC_USER_KEY);
            await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);

            setState(prev => ({ ...prev, isEnabled: false }));
        } catch (error) {
            console.error('Error disabling biometrics:', error);
            throw error;
        }
    }, []);

    const getSavedUserEmail = useCallback(async (): Promise<string | null> => {
        try {
            return await SecureStore.getItemAsync(BIOMETRIC_USER_KEY);
        } catch (error) {
            console.error('Error getting saved user email:', error);
            return null;
        }
    }, []);

    const getSavedCredentials = useCallback(async (): Promise<SavedCredentials | null> => {
        try {
            const credentialsStr = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
            if (credentialsStr) {
                return JSON.parse(credentialsStr) as SavedCredentials;
            }
            return null;
        } catch (error) {
            console.error('Error getting saved credentials:', error);
            return null;
        }
    }, []);

    return {
        ...state,
        authenticate,
        enableBiometrics,
        disableBiometrics,
        getSavedUserEmail,
        getSavedCredentials,
        checkBiometricAvailability,
    };
}

function getBiometricPromptMessage(type: BiometricType): string {
    switch (type) {
        case 'facial':
            return 'Usa Face ID para iniciar sesión';
        case 'fingerprint':
            return 'Usa tu huella digital para iniciar sesión';
        case 'iris':
            return 'Usa reconocimiento de iris para iniciar sesión';
        default:
            return 'Autentícate para continuar';
    }
}

export function getBiometricIcon(type: BiometricType): string {
    switch (type) {
        case 'facial':
            return 'scan-outline';
        case 'fingerprint':
            return 'finger-print-outline';
        case 'iris':
            return 'eye-outline';
        default:
            return 'lock-closed-outline';
    }
}

export function getBiometricLabel(type: BiometricType): string {
    switch (type) {
        case 'facial':
            return 'Face ID';
        case 'fingerprint':
            return 'Huella digital';
        case 'iris':
            return 'Reconocimiento de iris';
        default:
            return 'Biometría';
    }
}
