// src/components/ui/OfflineBanner.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useTheme } from '../../contexts/ThemeContext';

interface OfflineBannerProps {
    onRetry?: () => void;
}

export function OfflineBanner({ onRetry }: OfflineBannerProps) {
    const { colors } = useTheme();
    const { isOffline, pendingActions } = useNetworkStatus();

    if (!isOffline && pendingActions === 0) {
        return null;
    }

    return (
        <View style={[
            styles.container,
            { backgroundColor: isOffline ? colors.status.error : colors.accent.orange }
        ]}>
            <View style={styles.content}>
                <Ionicons
                    name={isOffline ? 'cloud-offline' : 'cloud-upload'}
                    size={18}
                    color={colors.white}
                />
                <Text style={[styles.text, { color: colors.white }]}>
                    {isOffline
                        ? 'Sin conexión - Modo offline'
                        : `${pendingActions} ${pendingActions === 1 ? 'acción pendiente' : 'acciones pendientes'}`
                    }
                </Text>
            </View>

            {!isOffline && onRetry && (
                <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
                    <Text style={[styles.retryText, { color: colors.white }]}>Sincronizar</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

// Componente para mostrar datos stale (desactualizados)
export function StaleDataIndicator({ isStale }: { isStale: boolean }) {
    const { colors } = useTheme();

    if (!isStale) return null;

    return (
        <View style={[styles.staleContainer, { backgroundColor: colors.accent.orange + '20' }]}>
            <Ionicons name="time-outline" size={14} color={colors.accent.orange} />
            <Text style={[styles.staleText, { color: colors.accent.orange }]}>Datos guardados localmente</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    text: {
        fontSize: 13,
        fontWeight: '600',
    },
    retryBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    retryText: {
        fontSize: 12,
        fontWeight: '600',
    },
    staleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    staleText: {
        fontSize: 12,
        fontWeight: '500',
    },
});
