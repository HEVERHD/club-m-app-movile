// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// Tipos
// ============================================

export type ThemeMode = 'auto' | 'light' | 'dark';
export type ActiveTheme = 'light' | 'dark';

interface ThemeColors {
    // Colores de marca basados en el logo
    brand: {
        blue: string;       // Azul del escudo
        green: string;      // Verde del degradado
        lime: string;       // Lima/amarillo del círculo
        cyan: string;       // Cyan/turquesa del círculo superior
        slate: string;      // Gris oscuro de la base
    };
    bg: {
        primary: string;
        secondary: string;
        card: string;
        cardHover: string;
        elevated: string;
    };
    text: {
        primary: string;
        secondary: string;
        tertiary: string;
        muted: string;
        inverse: string;
    };
    accent: {
        // Colores principales de la marca
        blue: string;
        blueLight: string;
        green: string;
        greenLight: string;
        cyan: string;
        cyanLight: string;
        lime: string;
        // Colores secundarios/funcionales
        orange: string;
        purple: string;
        gold: string;
    };
    status: {
        success: string;
        successText: string;
        successBg: string;
        warning: string;
        warningText: string;
        warningBg: string;
        error: string;
        errorText: string;
        errorBg: string;
        info: string;
        infoText: string;
        infoBg: string;
    };
    border: {
        default: string;
        light: string;
        accent: string;
    };
    white: string;
    black: string;
    transparent: string;
    gradients: {
        brand: string[];      // Degradado del logo
        primary: string[];
        success: string[];
    };
}

interface ThemeContextType {
    mode: ThemeMode;
    activeTheme: ActiveTheme;
    colors: ThemeColors;
    setMode: (mode: ThemeMode) => void;
    toggleTheme: () => void;
    isDark: boolean;
}

// ============================================
// Colores de marca extraídos del logo
// ============================================
const BRAND = {
    blue: '#1E88E5',        // Azul principal del escudo
    blueDark: '#1565C0',    // Azul más oscuro
    blueLight: '#42A5F5',   // Azul más claro
    green: '#43A047',       // Verde del degradado
    greenLight: '#66BB6A',  // Verde claro
    lime: '#C0CA33',        // Lima/amarillo verdoso
    limeLight: '#D4E157',   // Lima claro
    cyan: '#26C6DA',        // Cyan/turquesa del círculo
    cyanLight: '#4DD0E1',   // Cyan claro
    slate: '#455A64',       // Gris azulado de la base
    slateDark: '#37474F',   // Gris más oscuro
};

// ============================================
// Paletas de colores
// ============================================

const darkTheme: ThemeColors = {
    brand: {
        blue: BRAND.blue,
        green: BRAND.green,
        lime: BRAND.lime,
        cyan: BRAND.cyan,
        slate: BRAND.slate,
    },
    bg: {
        primary: '#0f1419',
        secondary: '#1a1f27',
        card: '#242d38',
        cardHover: '#2d3848',
        elevated: '#323d4a',
    },
    text: {
        primary: '#f0f4f8',
        secondary: '#9ca3af',
        tertiary: '#6b7280',
        muted: '#4b5563',
        inverse: '#0f1419',
    },
    accent: {
        blue: BRAND.blue,
        blueLight: BRAND.blueLight,
        green: BRAND.green,
        greenLight: BRAND.greenLight,
        cyan: BRAND.cyan,
        cyanLight: BRAND.cyanLight,
        lime: BRAND.lime,
        orange: '#FB8C00',
        purple: '#7E57C2',
        gold: '#FFB300',
    },
    status: {
        success: BRAND.green,
        successText: BRAND.greenLight,
        successBg: 'rgba(67, 160, 71, 0.15)',
        warning: '#FB8C00',
        warningText: '#FFA726',
        warningBg: 'rgba(251, 140, 0, 0.15)',
        error: '#E53935',
        errorText: '#EF5350',
        errorBg: 'rgba(229, 57, 53, 0.15)',
        info: BRAND.blue,
        infoText: BRAND.blueLight,
        infoBg: 'rgba(30, 136, 229, 0.15)',
    },
    border: {
        default: '#374151',
        light: '#4b5563',
        accent: 'rgba(30, 136, 229, 0.3)',
    },
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
    gradients: {
        brand: [BRAND.blue, BRAND.green, BRAND.lime],
        primary: [BRAND.blue, BRAND.blueLight],
        success: [BRAND.green, BRAND.greenLight],
    },
};

const lightTheme: ThemeColors = {
    brand: {
        blue: BRAND.blue,
        green: BRAND.green,
        lime: BRAND.lime,
        cyan: BRAND.cyan,
        slate: BRAND.slate,
    },
    bg: {
        primary: '#f8fafc',
        secondary: '#f1f5f9',
        card: '#ffffff',
        cardHover: '#f8fafc',
        elevated: '#ffffff',
    },
    text: {
        primary: '#1e293b',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8',
        inverse: '#f0f4f8',
    },
    accent: {
        blue: BRAND.blueDark,
        blueLight: BRAND.blue,
        green: '#2E7D32',
        greenLight: BRAND.green,
        cyan: '#00ACC1',
        cyanLight: BRAND.cyan,
        lime: '#9E9D24',
        orange: '#EF6C00',
        purple: '#5E35B1',
        gold: '#FF8F00',
    },
    status: {
        success: '#2E7D32',
        successText: '#1B5E20',
        successBg: 'rgba(46, 125, 50, 0.1)',
        warning: '#EF6C00',
        warningText: '#E65100',
        warningBg: 'rgba(239, 108, 0, 0.1)',
        error: '#C62828',
        errorText: '#B71C1C',
        errorBg: 'rgba(198, 40, 40, 0.1)',
        info: BRAND.blueDark,
        infoText: '#0D47A1',
        infoBg: 'rgba(21, 101, 192, 0.1)',
    },
    border: {
        default: '#e2e8f0',
        light: '#cbd5e1',
        accent: 'rgba(30, 136, 229, 0.2)',
    },
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
    gradients: {
        brand: [BRAND.blueDark, BRAND.green, BRAND.lime],
        primary: [BRAND.blueDark, BRAND.blue],
        success: ['#2E7D32', BRAND.green],
    },
};

// ============================================
// Utilidades
// ============================================

const STORAGE_KEY = 'theme_mode';

// Determina si debería ser oscuro basado en la hora
// Oscuro: 6pm - 6am
function shouldBeDarkByTime(): boolean {
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6;
}

// ============================================
// Context
// ============================================

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = useColorScheme();
    const [mode, setModeState] = useState<ThemeMode>('auto');
    const [isLoaded, setIsLoaded] = useState(false);

    // Cargar preferencia guardada
    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY).then((savedMode) => {
            if (savedMode && ['auto', 'light', 'dark'].includes(savedMode)) {
                setModeState(savedMode as ThemeMode);
            }
            setIsLoaded(true);
        });
    }, []);

    // Guardar preferencia cuando cambia
    const setMode = useCallback((newMode: ThemeMode) => {
        setModeState(newMode);
        AsyncStorage.setItem(STORAGE_KEY, newMode);
    }, []);

    // Alternar entre modos
    const toggleTheme = useCallback(() => {
        setMode(mode === 'auto' ? 'light' : mode === 'light' ? 'dark' : 'auto');
    }, [mode, setMode]);

    // Determinar tema activo
    const activeTheme: ActiveTheme = useMemo(() => {
        if (mode === 'light') return 'light';
        if (mode === 'dark') return 'dark';

        // Modo auto: usar hora del día
        return shouldBeDarkByTime() ? 'dark' : 'light';
    }, [mode]);

    // Actualizar tema automático cada minuto cuando está en modo auto
    useEffect(() => {
        if (mode !== 'auto') return;

        const interval = setInterval(() => {
            // Forzar re-render para actualizar el tema
            setModeState((prev) => prev);
        }, 60000); // Cada minuto

        return () => clearInterval(interval);
    }, [mode]);

    const colors = activeTheme === 'dark' ? darkTheme : lightTheme;

    const value = useMemo(() => ({
        mode,
        activeTheme,
        colors,
        setMode,
        toggleTheme,
        isDark: activeTheme === 'dark',
    }), [mode, activeTheme, colors, setMode, toggleTheme]);

    if (!isLoaded) {
        return null; // O un loading spinner
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

// ============================================
// Hook
// ============================================

export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

// ============================================
// Exportar colores por defecto (para compatibilidad)
// ============================================

export const COLORS = darkTheme;
