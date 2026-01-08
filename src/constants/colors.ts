// src/constants/colors.ts

export const COLORS = {
    // Brand Colors (from logo)
    brand: {
        blue: '#1a5fb4',
        blueLight: '#3b82f6',
        green: '#4caf50',
        greenLight: '#7cb342',
        cyan: '#00acc1',
        dark: '#37474f',
    },

    // Dark Theme - Backgrounds
    bg: {
        primary: '#1a1d24',      // Fondo principal
        secondary: '#242832',    // Fondo secundario
        card: '#2d323c',         // Cards
        cardHover: '#363c48',    // Cards hover
        elevated: '#383e4a',     // Elementos elevados
    },

    // Text Colors
    text: {
        primary: '#f1f5f9',      // Texto principal (casi blanco)
        secondary: '#94a3b8',    // Texto secundario
        muted: '#64748b',        // Texto apagado
        inverse: '#1a1d24',      // Texto inverso (para fondos claros)
    },

    // Accent Colors (basados en la marca pero más vibrantes)
    accent: {
        blue: '#3b82f6',
        blueGlow: '#60a5fa',
        green: '#22c55e',
        greenGlow: '#4ade80',
        cyan: '#06b6d4',
        cyanGlow: '#22d3ee',
        orange: '#f59e0b',
        orangeGlow: '#fbbf24',
        purple: '#8b5cf6',
        purpleGlow: '#a78bfa',
    },

    // Status Colors
    status: {
        success: '#22c55e',
        successBg: 'rgba(34, 197, 94, 0.15)',
        warning: '#f59e0b',
        warningBg: 'rgba(245, 158, 11, 0.15)',
        error: '#ef4444',
        errorBg: 'rgba(239, 68, 68, 0.15)',
        info: '#3b82f6',
        infoBg: 'rgba(59, 130, 246, 0.15)',
    },

    // Borders & Dividers
    border: {
        default: '#3a4150',
        light: '#4a5568',
        accent: 'rgba(59, 130, 246, 0.3)',
    },

    // Common
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',

    // Gradients (para uso con LinearGradient si se necesita)
    gradients: {
        primary: ['#1a5fb4', '#3b82f6'],
        secondary: ['#4caf50', '#22c55e'],
        dark: ['#1a1d24', '#242832'],
    },
};

// Alias útiles
export const PRIMARY = COLORS.accent.blue;
export const SECONDARY = COLORS.accent.green;
export const BACKGROUND = COLORS.bg.primary;
export const CARD = COLORS.bg.card;
export const TEXT = COLORS.text.primary;
export const TEXT_SECONDARY = COLORS.text.secondary;