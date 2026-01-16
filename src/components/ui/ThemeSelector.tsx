// src/components/ui/ThemeSelector.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeMode } from '../../contexts/ThemeContext';

interface ThemeOption {
    mode: ThemeMode;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    description: string;
}

const options: ThemeOption[] = [
    {
        mode: 'auto',
        icon: 'sunny-outline',
        label: 'Automático',
        description: 'Claro de día, oscuro de noche',
    },
    {
        mode: 'light',
        icon: 'sunny',
        label: 'Claro',
        description: 'Siempre modo claro',
    },
    {
        mode: 'dark',
        icon: 'moon',
        label: 'Oscuro',
        description: 'Siempre modo oscuro',
    },
];

export function ThemeSelector() {
    const { mode, setMode, colors, isDark } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
            <View style={styles.header}>
                <Ionicons name="color-palette-outline" size={20} color={colors.accent.blue} />
                <Text style={[styles.title, { color: colors.text.primary }]}>Apariencia</Text>
            </View>

            <View style={styles.options}>
                {options.map((option) => {
                    const isActive = mode === option.mode;
                    return (
                        <TouchableOpacity
                            key={option.mode}
                            style={[
                                styles.option,
                                { backgroundColor: colors.bg.elevated, borderColor: colors.border.default },
                                isActive && { borderColor: colors.accent.blue, backgroundColor: colors.accent.blue + '15' },
                            ]}
                            onPress={() => setMode(option.mode)}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.iconContainer,
                                { backgroundColor: isActive ? colors.accent.blue : colors.bg.card },
                            ]}>
                                <Ionicons
                                    name={option.icon}
                                    size={20}
                                    color={isActive ? colors.white : colors.text.secondary}
                                />
                            </View>
                            <View style={styles.optionText}>
                                <Text style={[
                                    styles.optionLabel,
                                    { color: isActive ? colors.accent.blue : colors.text.primary },
                                ]}>
                                    {option.label}
                                </Text>
                                <Text style={[styles.optionDescription, { color: colors.text.muted }]}>
                                    {option.description}
                                </Text>
                            </View>
                            {isActive && (
                                <Ionicons name="checkmark-circle" size={22} color={colors.accent.blue} />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Indicador del tema actual */}
            <View style={[styles.currentTheme, { backgroundColor: colors.bg.elevated }]}>
                <Ionicons
                    name={isDark ? 'moon' : 'sunny'}
                    size={16}
                    color={isDark ? colors.accent.purple : colors.accent.orange}
                />
                <Text style={[styles.currentThemeText, { color: colors.text.secondary }]}>
                    Tema actual: {isDark ? 'Oscuro' : 'Claro'}
                </Text>
            </View>
        </View>
    );
}

// Versión compacta para usar en headers
export function ThemeToggleButton() {
    const { toggleTheme, isDark, colors, mode } = useTheme();

    const getIcon = (): keyof typeof Ionicons.glyphMap => {
        if (mode === 'auto') return 'sync-outline';
        return isDark ? 'moon' : 'sunny';
    };

    return (
        <TouchableOpacity
            style={[styles.toggleButton, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
        >
            <Ionicons
                name={getIcon()}
                size={20}
                color={mode === 'auto' ? colors.accent.cyan : isDark ? colors.accent.purple : colors.accent.orange}
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
    },
    options: {
        gap: 10,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionText: {
        flex: 1,
    },
    optionLabel: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    optionDescription: {
        fontSize: 12,
    },
    currentTheme: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 16,
        padding: 10,
        borderRadius: 8,
    },
    currentThemeText: {
        fontSize: 13,
    },
    toggleButton: {
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
});
