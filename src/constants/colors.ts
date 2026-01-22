// src/constants/colors.ts
// Paleta Oficial ClubMercancias

export const BRAND_COLORS = {
    // Colores principales de marca
    primary: '#0A3D62',         // Azul profundo - Navegación, headers, sidebars, botones principales
    primaryGlow: '#1565a0',     // Azul profundo glow
    secondary: '#17BEBB',       // Teal - Botones secundarios, interacciones UI, indicadores de éxito
    secondaryGlow: '#4dd0e1',   // Teal glow
    accent: '#F6C85F',          // Dorado - Highlights, badges premium, sorteos, números ganadores
    accentGlow: '#ffd54f',      // Dorado glow
    neutralLight: '#F7F7F7',    // Blanco hueso - Fondos de secciones, formularios
    neutralDark: '#2E2E2E',     // Gris antracita - Texto principal, iconos
};

export const COLORS = {
    // Brand Colors (Paleta Oficial ClubMercancias)
    brand: {
        primary: BRAND_COLORS.primary,
        primaryGlow: BRAND_COLORS.primaryGlow,
        secondary: BRAND_COLORS.secondary,
        secondaryGlow: BRAND_COLORS.secondaryGlow,
        accent: BRAND_COLORS.accent,
        accentGlow: BRAND_COLORS.accentGlow,
    },

    // Backgrounds (Light Theme by default)
    bg: {
        primary: BRAND_COLORS.neutralLight,  // #F7F7F7
        secondary: '#ffffff',
        card: '#ffffff',
        cardHover: '#f0f0f0',
        elevated: '#fafafa',
    },

    // Text Colors
    text: {
        primary: BRAND_COLORS.neutralDark,   // #2E2E2E
        secondary: '#5a5a5a',
        muted: '#8a8a8a',
        inverse: '#ffffff',
        // Alias para compatibilidad
        tertiary: '#8a8a8a',
    },

    // Accent Colors
    accent: {
        primary: BRAND_COLORS.primary,
        primaryGlow: BRAND_COLORS.primaryGlow,
        secondary: BRAND_COLORS.secondary,
        secondaryGlow: BRAND_COLORS.secondaryGlow,
        gold: BRAND_COLORS.accent,
        goldGlow: BRAND_COLORS.accentGlow,
        orange: '#EF6C00',
        purple: '#5E35B1',
        // Aliases para compatibilidad
        blue: BRAND_COLORS.primary,
        blueGlow: BRAND_COLORS.primaryGlow,
        green: BRAND_COLORS.secondary,
        greenGlow: BRAND_COLORS.secondaryGlow,
        cyan: BRAND_COLORS.secondary,
        cyanGlow: BRAND_COLORS.secondaryGlow,
    },

    // Status Colors
    status: {
        success: BRAND_COLORS.secondary,
        successBg: 'rgba(23, 190, 187, 0.15)',
        warning: BRAND_COLORS.accent,
        warningBg: 'rgba(246, 200, 95, 0.15)',
        error: '#e74c3c',
        errorBg: 'rgba(231, 76, 60, 0.15)',
        info: BRAND_COLORS.primary,
        infoBg: 'rgba(10, 61, 98, 0.15)',
    },

    // Borders & Dividers
    border: {
        default: '#e0e0e0',
        light: '#f0f0f0',
        accent: 'rgba(10, 61, 98, 0.3)',
    },

    // Common
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',

    // Gradients
    gradients: {
        primary: [BRAND_COLORS.primary, '#0d4d7a', BRAND_COLORS.secondary, '#2dd4d1'],
        secondary: [BRAND_COLORS.secondary, BRAND_COLORS.secondaryGlow],
        accent: [BRAND_COLORS.accent, BRAND_COLORS.accentGlow],
    },
};

// Alias útiles
export const PRIMARY = BRAND_COLORS.primary;
export const SECONDARY = BRAND_COLORS.secondary;
export const ACCENT = BRAND_COLORS.accent;
export const BACKGROUND = COLORS.bg.primary;
export const CARD = COLORS.bg.card;
export const TEXT = COLORS.text.primary;
export const TEXT_SECONDARY = COLORS.text.secondary;
