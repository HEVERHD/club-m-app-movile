// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// Tipos
// ============================================

export type ThemeMode = 'auto' | 'light' | 'dark';
export type ActiveTheme = 'light' | 'dark';

interface ThemeColors {
    // Colores de marca oficiales ClubMercancias
    brand: {
        primary: string;        // Azul profundo
        primaryGlow: string;    // Azul profundo glow
        secondary: string;      // Teal
        secondaryGlow: string;  // Teal glow
        accent: string;         // Dorado
        accentGlow: string;     // Dorado glow
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
        muted: string;
        inverse: string;
    };
    accent: {
        primary: string;        // Azul profundo
        primaryGlow: string;
        secondary: string;      // Teal
        secondaryGlow: string;
        gold: string;           // Dorado/Accent
        goldGlow: string;
        // Colores funcionales adicionales
        orange: string;
        purple: string;
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
        primary: string[];      // Gradiente principal de la marca
        secondary: string[];    // Gradiente secundario (teal)
        accent: string[];       // Gradiente dorado
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
// Paleta Oficial ClubMercancias
// ============================================
const BRAND = {
    // Colores principales de marca
    primary: '#0A3D62',         // Azul profundo - Navegación, headers, sidebars, botones principales
    primaryGlow: '#1565a0',     // Azul profundo glow
    secondary: '#17BEBB',       // Teal - Botones secundarios, interacciones UI, indicadores de éxito
    secondaryGlow: '#4dd0e1',   // Teal glow
    accent: '#F6C85F',          // Dorado - Highlights, badges premium, sorteos, números ganadores
    accentGlow: '#ffd54f',      // Dorado glow
    neutralLight: '#F7F7F7',    // Blanco hueso - Fondos de secciones, formularios
    neutralDark: '#2E2E2E',     // Gris antracita - Texto principal, iconos
    // Status
    error: '#e74c3c',           // Rojo error
};

// ============================================
// Paletas de colores
// ============================================

const darkTheme: ThemeColors = {
    brand: {
        primary: BRAND.primary,
        primaryGlow: BRAND.primaryGlow,
        secondary: BRAND.secondary,
        secondaryGlow: BRAND.secondaryGlow,
        accent: BRAND.accent,
        accentGlow: BRAND.accentGlow,
    },
    bg: {
        primary: '#0f1419',         // Fondo principal oscuro
        secondary: '#1a1f27',       // Fondo secundario
        card: '#242d38',            // Cards
        cardHover: '#2d3848',       // Cards hover
        elevated: '#323d4a',        // Elementos elevados
    },
    text: {
        primary: '#f0f4f8',         // Texto principal (casi blanco)
        secondary: '#9ca3af',       // Texto secundario
        muted: '#6b7280',           // Texto apagado
        inverse: '#0f1419',         // Texto inverso
    },
    accent: {
        primary: BRAND.primary,
        primaryGlow: BRAND.primaryGlow,
        secondary: BRAND.secondary,
        secondaryGlow: BRAND.secondaryGlow,
        gold: BRAND.accent,
        goldGlow: BRAND.accentGlow,
        orange: '#FB8C00',
        purple: '#7E57C2',
    },
    status: {
        success: BRAND.secondary,
        successText: BRAND.secondaryGlow,
        successBg: 'rgba(23, 190, 187, 0.15)',
        warning: BRAND.accent,
        warningText: BRAND.accentGlow,
        warningBg: 'rgba(246, 200, 95, 0.15)',
        error: BRAND.error,
        errorText: '#ef5350',
        errorBg: 'rgba(231, 76, 60, 0.15)',
        info: BRAND.primary,
        infoText: BRAND.primaryGlow,
        infoBg: 'rgba(10, 61, 98, 0.15)',
    },
    border: {
        default: '#374151',
        light: '#4b5563',
        accent: 'rgba(10, 61, 98, 0.3)',
    },
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
    gradients: {
        primary: [BRAND.primary, '#0d4d7a', BRAND.secondary, '#2dd4d1'],
        secondary: [BRAND.secondary, BRAND.secondaryGlow],
        accent: [BRAND.accent, BRAND.accentGlow],
    },
};

const lightTheme: ThemeColors = {
    brand: {
        primary: BRAND.primary,
        primaryGlow: BRAND.primaryGlow,
        secondary: BRAND.secondary,
        secondaryGlow: BRAND.secondaryGlow,
        accent: BRAND.accent,
        accentGlow: BRAND.accentGlow,
    },
    bg: {
        primary: BRAND.neutralLight,    // #F7F7F7 - Blanco hueso
        secondary: '#ffffff',           // Blanco puro
        card: '#ffffff',                // Cards blancas
        cardHover: '#f0f0f0',           // Cards hover
        elevated: '#fafafa',            // Elementos elevados
    },
    text: {
        primary: BRAND.neutralDark,     // #2E2E2E - Gris antracita
        secondary: '#5a5a5a',           // Texto secundario
        muted: '#8a8a8a',               // Texto apagado
        inverse: '#ffffff',             // Texto inverso
    },
    accent: {
        primary: BRAND.primary,
        primaryGlow: BRAND.primaryGlow,
        secondary: BRAND.secondary,
        secondaryGlow: BRAND.secondaryGlow,
        gold: BRAND.accent,
        goldGlow: BRAND.accentGlow,
        orange: '#EF6C00',
        purple: '#5E35B1',
    },
    status: {
        success: BRAND.secondary,
        successText: '#0f9d9a',
        successBg: 'rgba(23, 190, 187, 0.15)',
        warning: BRAND.accent,
        warningText: '#d4a84a',
        warningBg: 'rgba(246, 200, 95, 0.15)',
        error: BRAND.error,
        errorText: '#c0392b',
        errorBg: 'rgba(231, 76, 60, 0.15)',
        info: BRAND.primary,
        infoText: '#083352',
        infoBg: 'rgba(10, 61, 98, 0.15)',
    },
    border: {
        default: '#e0e0e0',
        light: '#f0f0f0',
        accent: 'rgba(10, 61, 98, 0.3)',
    },
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
    gradients: {
        primary: [BRAND.primary, '#0d4d7a', BRAND.secondary, '#2dd4d1'],
        secondary: [BRAND.secondary, BRAND.secondaryGlow],
        accent: [BRAND.accent, BRAND.accentGlow],
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
    const [mode, setModeState] = useState<ThemeMode>('auto');
    const [isLoaded, setIsLoaded] = useState(false);
    const [, forceUpdate] = useState(0);

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
            forceUpdate(n => n + 1);
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
