// src/components/draws/DrawCard.tsx
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import type { Draw } from '../../types/clubs';

interface DrawCardProps {
    draw: Draw;
}

export function DrawCard({ draw }: DrawCardProps) {
    const router = useRouter();
    const { colors } = useTheme();

    const handlePress = () => {
        // Pasar datos del sorteo a través de la navegación para evitar re-fetch
        router.push({
            pathname: `/draw/${draw.drawId}`,
            params: { drawData: JSON.stringify(draw) },
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-PA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return colors.status.successText;
            case 'pending':
                return colors.status.warningText;
            case 'cancelled':
                return colors.status.errorText;
            default:
                return colors.text.secondary;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed':
                return 'Completado';
            case 'pending':
                return 'Pendiente';
            case 'cancelled':
                return 'Cancelado';
            default:
                return status;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return 'checkmark-circle';
            case 'pending':
                return 'time';
            case 'cancelled':
                return 'close-circle';
            default:
                return 'help-circle';
        }
    };

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            {/* Status Badge - Más prominente en la esquina superior derecha */}
            <View
                style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(draw.status) },
                ]}
            >
                <Ionicons
                    name={getStatusIcon(draw.status) as any}
                    size={16}
                    color={colors.white}
                />
                <Text style={[styles.statusText, { color: colors.white }]}>
                    {getStatusLabel(draw.status).toUpperCase()}
                </Text>
            </View>

            <View style={styles.content}>
                {/* Header con tipo de club */}
                <View style={styles.typeRow}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.brand.primary + '15' }]}>
                        <Ionicons name="calendar" size={22} color={colors.brand.primary} />
                    </View>
                    <Text style={[styles.clubType, { color: colors.text.primary }]}>
                        {draw.clubTypeName || 'Club'}
                    </Text>
                </View>

                {/* Fecha */}
                <View style={[styles.dateRow, { backgroundColor: colors.bg.elevated }]}>
                    <Ionicons name="calendar-outline" size={18} color={colors.text.secondary} />
                    <Text style={[styles.date, { color: colors.text.secondary }]}>
                        {formatDate(draw.date)}
                    </Text>
                </View>

                {/* Número ganador - Solo para sorteos completados */}
                {draw.status === 'completed' && (
                    <View style={[styles.winningSection, { backgroundColor: colors.brand.primary + '08', borderColor: colors.brand.primary + '20' }]}>
                        <Text style={[styles.winningLabel, { color: colors.text.secondary }]}>NÚMERO GANADOR</Text>
                        <View style={[styles.winningBadge, { backgroundColor: colors.brand.primary }]}>
                            <Text style={[styles.winningNumber, { color: colors.white }]}>{draw.numberPlayed}</Text>
                        </View>
                    </View>
                )}

                {/* Estadísticas */}
                {draw.status === 'completed' && draw.totalWinners !== undefined && draw.totalWinners > 0 && (
                    <View style={styles.statsRow}>
                        <View style={[styles.statItem, { backgroundColor: colors.bg.elevated }]}>
                            <View style={[styles.statIconCircle, { backgroundColor: colors.accent.gold + '15' }]}>
                                <Ionicons name="trophy" size={18} color={colors.accent.gold} />
                            </View>
                            <View>
                                <Text style={[styles.statValue, { color: colors.text.primary }]}>{draw.totalWinners}</Text>
                                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                                    {draw.totalWinners === 1 ? 'Ganador' : 'Ganadores'}
                                </Text>
                            </View>
                        </View>
                        {draw.totalPrizeAmount !== undefined && (
                            <View style={[styles.statItem, { backgroundColor: colors.bg.elevated }]}>
                                <View style={[styles.statIconCircle, { backgroundColor: colors.status.success + '15' }]}>
                                    <Ionicons name="cash" size={18} color={colors.status.success} />
                                </View>
                                <View>
                                    <Text style={[styles.statValue, { color: colors.text.primary }]}>${draw.totalPrizeAmount.toFixed(2)}</Text>
                                    <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Premios</Text>
                                </View>
                            </View>
                        )}
                    </View>
                )}
            </View>

            {/* Footer con flecha */}
            <View style={styles.footer}>
                <View style={[styles.arrowCircle, { backgroundColor: colors.brand.primary + '15' }]}>
                    <Ionicons name="chevron-forward" size={20} color={colors.brand.primary} />
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        marginBottom: 16,
        padding: 0,
        borderWidth: 1,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },

    // Status Badge - Esquina superior derecha
    statusBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderBottomLeftRadius: 12,
        zIndex: 10,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    // Content
    content: {
        padding: 20,
        paddingTop: 16,
        gap: 14,
    },

    // Type Row
    typeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 8,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clubType: {
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
    },

    // Date Row
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    date: {
        fontSize: 14,
        fontWeight: '500',
        textTransform: 'capitalize',
    },

    // Winning Number Section
    winningSection: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        gap: 10,
        borderWidth: 1,
    },
    winningLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
    },
    winningBadge: {
        borderRadius: 24,
        paddingHorizontal: 28,
        paddingVertical: 10,
        minWidth: 80,
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    winningNumber: {
        fontSize: 32,
        fontWeight: '900',
    },

    // Stats Row
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    statItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 12,
        borderRadius: 10,
    },
    statIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '500',
    },

    // Footer
    footer: {
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    arrowCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
