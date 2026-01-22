// src/components/ui/OfflineBanner.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useTheme } from '../../contexts/ThemeContext';
import { syncOfflineActions, getSyncStatus, subscribeSyncStatus } from '../../services/syncService';

interface OfflineBannerProps {
    onRetry?: () => void;
}

export function OfflineBanner({ onRetry }: OfflineBannerProps) {
    const { colors } = useTheme();
    const { isOffline, pendingActions, isConnected } = useNetworkStatus();
    const [isSyncing, setIsSyncing] = useState(false);
    const [showBanner, setShowBanner] = useState(false);
    const slideAnim = React.useRef(new Animated.Value(-60)).current;

    // Determinar si mostrar el banner
    useEffect(() => {
        const shouldShow = isOffline || pendingActions > 0;
        setShowBanner(shouldShow);

        Animated.spring(slideAnim, {
            toValue: shouldShow ? 0 : -60,
            useNativeDriver: true,
            tension: 80,
            friction: 12,
        }).start();
    }, [isOffline, pendingActions, slideAnim]);

    // Auto-sincronizar cuando vuelve la conexión
    useEffect(() => {
        if (isConnected && pendingActions > 0 && !isSyncing) {
            handleSync();
        }
    }, [isConnected, pendingActions]);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const result = await syncOfflineActions();
            if (result.success && onRetry) {
                onRetry();
            }
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    if (!showBanner) {
        return null;
    }

    const bannerColor = isOffline ? colors.status.error : colors.accent.orange;
    const bannerIcon = isOffline ? 'cloud-offline' : 'cloud-upload';
    const bannerText = isOffline
        ? 'Sin conexión a internet'
        : `${pendingActions} ${pendingActions === 1 ? 'cambio pendiente' : 'cambios pendientes'}`;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: bannerColor,
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name={bannerIcon} size={18} color="#ffffff" />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.text}>{bannerText}</Text>
                    {isOffline && (
                        <Text style={styles.subtext}>Usando datos guardados</Text>
                    )}
                </View>
            </View>

            {!isOffline && pendingActions > 0 && (
                <TouchableOpacity
                    style={[styles.syncBtn, isSyncing && styles.syncBtnDisabled]}
                    onPress={handleSync}
                    disabled={isSyncing}
                >
                    {isSyncing ? (
                        <Ionicons name="sync" size={16} color="#ffffff" />
                    ) : (
                        <Text style={styles.syncText}>Sincronizar</Text>
                    )}
                </TouchableOpacity>
            )}
        </Animated.View>
    );
}

// Indicador compacto para headers
export function OfflineIndicator() {
    const { colors } = useTheme();
    const { isOffline } = useNetworkStatus();

    if (!isOffline) return null;

    return (
        <View style={[styles.indicator, { backgroundColor: colors.status.warning }]}>
            <Ionicons name="cloud-offline" size={12} color="#ffffff" />
            <Text style={styles.indicatorText}>Offline</Text>
        </View>
    );
}

// Badge para mostrar que los datos son locales
export function StaleDataIndicator({ isStale }: { isStale: boolean }) {
    const { colors } = useTheme();

    if (!isStale) return null;

    return (
        <View style={[styles.staleContainer, { backgroundColor: colors.accent.orange + '20' }]}>
            <Ionicons name="time-outline" size={14} color={colors.accent.orange} />
            <Text style={[styles.staleText, { color: colors.accent.orange }]}>
                Datos guardados localmente
            </Text>
        </View>
    );
}

// Pantalla de error de conexión para casos críticos
export function OfflineScreen({ onRetry }: { onRetry?: () => void }) {
    const { colors } = useTheme();
    const { isOffline, checkConnection } = useNetworkStatus();
    const [checking, setChecking] = React.useState(false);

    const handleRetry = async () => {
        setChecking(true);
        // Forzar verificación de conexión
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setChecking(false);
        if (onRetry) {
            onRetry();
        }
    };

    return (
        <View style={[styles.offlineScreen, { backgroundColor: colors.bg.primary }]}>
            <View style={[styles.offlineIconBg, { backgroundColor: colors.status.error + '15' }]}>
                <Ionicons name="cloud-offline-outline" size={64} color={colors.status.error} />
            </View>
            <Text style={[styles.offlineTitle, { color: colors.text.primary }]}>
                Sin conexión
            </Text>
            <Text style={[styles.offlineMessage, { color: colors.text.secondary }]}>
                Verifica tu conexión a internet e intenta de nuevo
            </Text>
            <TouchableOpacity
                style={[styles.retryBtn, { backgroundColor: colors.brand.primary }]}
                onPress={handleRetry}
                disabled={checking}
            >
                {checking ? (
                    <Ionicons name="sync" size={20} color="#ffffff" />
                ) : (
                    <>
                        <Ionicons name="refresh-outline" size={20} color="#ffffff" />
                        <Text style={styles.retryBtnText}>Reintentar</Text>
                    </>
                )}
            </TouchableOpacity>
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
        flex: 1,
    },
    iconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
    },
    text: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '600',
    },
    subtext: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 11,
        marginTop: 1,
    },
    syncBtn: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 8,
    },
    syncBtnDisabled: {
        opacity: 0.6,
    },
    syncText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
    },

    // Indicator
    indicator: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    indicatorText: {
        color: '#ffffff',
        fontSize: 11,
        fontWeight: '600',
    },

    // Stale data
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

    // Offline screen
    offlineScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    offlineIconBg: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    offlineTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 8,
    },
    offlineMessage: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 32,
        maxWidth: 280,
    },
    retryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
    },
    retryBtnText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});
