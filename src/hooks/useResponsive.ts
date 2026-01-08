// src/hooks/useResponsive.ts
import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

type ScreenSize = 'sm' | 'md' | 'lg';

interface ResponsiveInfo {
    width: number;
    height: number;
    screenSize: ScreenSize;
    isSmall: boolean;   // < 375px (iPhone SE, pequeños)
    isMedium: boolean;  // 375-414px (iPhone standard)
    isLarge: boolean;   // > 414px (iPhone Pro Max, tablets)
    // Helpers para grids
    columns: 2 | 3 | 4;
    cardWidth: number;
    spacing: number;
}

const BREAKPOINTS = {
    sm: 375,
    md: 414,
};

const getScreenSize = (width: number): ScreenSize => {
    if (width < BREAKPOINTS.sm) return 'sm';
    if (width < BREAKPOINTS.md) return 'md';
    return 'lg';
};

const getResponsiveValues = (width: number, height: number): ResponsiveInfo => {
    const screenSize = getScreenSize(width);
    const isSmall = screenSize === 'sm';
    const isMedium = screenSize === 'md';
    const isLarge = screenSize === 'lg';

    // Calcular columnas según ancho
    let columns: 2 | 3 | 4 = 2;
    if (width >= 500) columns = 3;
    if (width >= 700) columns = 4;

    // Spacing responsivo
    const spacing = isSmall ? 8 : isLarge ? 12 : 10;

    // Ancho de card calculado
    const horizontalPadding = 40; // 20 cada lado
    const totalSpacing = spacing * (columns - 1);
    const cardWidth = (width - horizontalPadding - totalSpacing) / columns;

    return {
        width,
        height,
        screenSize,
        isSmall,
        isMedium,
        isLarge,
        columns,
        cardWidth,
        spacing,
    };
};

export function useResponsive(): ResponsiveInfo {
    const [dimensions, setDimensions] = useState(() => {
        const { width, height } = Dimensions.get('window');
        return getResponsiveValues(width, height);
    });

    useEffect(() => {
        const subscription = Dimensions.addEventListener(
            'change',
            ({ window }: { window: ScaledSize }) => {
                setDimensions(getResponsiveValues(window.width, window.height));
            }
        );

        return () => subscription?.remove();
    }, []);

    return dimensions;
}

// Helper para escalar valores según pantalla
export function useScaledSize() {
    const { width } = useResponsive();
    const baseWidth = 390; // iPhone 14 como base

    return (size: number) => {
        const scale = width / baseWidth;
        const newSize = size * scale;
        // Limitar el escalado para no crecer demasiado
        return Math.round(Math.min(newSize, size * 1.3));
    };
}