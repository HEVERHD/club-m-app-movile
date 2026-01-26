/**
 * PointsCard - Summary card showing available points
 */
import { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import type { PointsSummary } from '../../api/points.api';

interface Props {
    summary: PointsSummary | null;
    onPress?: () => void;
    compact?: boolean;
}

export const PointsCard = memo(function PointsCard({ summary, onPress, compact = false }: Props) {
    const { colors } = useTheme();

    const availablePoints = summary?.availablePoints ?? 0;
    const expiringSoon = summary?.expiringSoon ?? 0;

    if (compact) {
        return (
            <TouchableOpacity
                style={[
                    styles.compactCard,
                    {
                        backgroundColor: colors.bg.card,
                        borderColor: colors.border.default,
                    },
                ]}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <View style={[styles.compactIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                    <Ionicons name="star" size={24} color="#f59e0b" />
                </View>
                <View style={styles.compactContent}>
                    <Text style={[styles.compactLabel, { color: colors.text.secondary }]}>
                        Mis Puntos
                    </Text>
                    <Text style={[styles.compactValue, { color: colors.text.primary }]}>
                        {availablePoints.toLocaleString()}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            style={[
                styles.card,
                {
                    backgroundColor: colors.bg.card,
                    borderColor: colors.border.default,
                },
            ]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                    <Ionicons name="star" size={28} color="#f59e0b" />
                </View>
                <View style={styles.headerText}>
                    <Text style={[styles.title, { color: colors.text.primary }]}>Mis Puntos</Text>
                    <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
                        Acumula y canjea puntos
                    </Text>
                </View>
            </View>

            {/* Points Display */}
            <View style={styles.pointsContainer}>
                <Text style={[styles.pointsValue, { color: '#f59e0b' }]}>
                    {availablePoints.toLocaleString()}
                </Text>
                <Text style={[styles.pointsLabel, { color: colors.text.secondary }]}>
                    puntos disponibles
                </Text>
            </View>

            {/* Stats Row */}
            <View style={[styles.statsRow, { borderTopColor: colors.border.default }]}>
                <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: '#22c55e' }]}>
                        +{summary?.totalEarned?.toLocaleString() ?? 0}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>Ganados</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border.default }]} />
                <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: '#8b5cf6' }]}>
                        -{summary?.totalRedeemed?.toLocaleString() ?? 0}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>Canjeados</Text>
                </View>
                {expiringSoon > 0 && (
                    <>
                        <View style={[styles.statDivider, { backgroundColor: colors.border.default }]} />
                        <View style={styles.stat}>
                            <Text style={[styles.statValue, { color: '#ef4444' }]}>
                                {expiringSoon.toLocaleString()}
                            </Text>
                            <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>
                                Por vencer
                            </Text>
                        </View>
                    </>
                )}
            </View>

            {/* Warning if points expiring soon */}
            {expiringSoon > 0 && (
                <View style={[styles.warningBar, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                    <Ionicons name="alert-circle" size={16} color="#ef4444" />
                    <Text style={styles.warningText}>
                        {expiringSoon} puntos por vencer en los proximos 30 dias
                    </Text>
                </View>
            )}

            {/* CTA */}
            {onPress && (
                <View style={styles.ctaContainer}>
                    <Text style={[styles.ctaText, { color: '#f59e0b' }]}>Ver historial</Text>
                    <Ionicons name="arrow-forward" size={16} color="#f59e0b" />
                </View>
            )}
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 20,
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconBox: {
        width: 52,
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        marginLeft: 14,
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    pointsContainer: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    pointsValue: {
        fontSize: 48,
        fontWeight: '800',
        lineHeight: 52,
    },
    pointsLabel: {
        fontSize: 14,
        marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        paddingTop: 16,
        marginTop: 8,
    },
    stat: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 12,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 36,
    },
    warningBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 10,
        marginTop: 16,
    },
    warningText: {
        fontSize: 13,
        color: '#ef4444',
        flex: 1,
    },
    ctaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    ctaText: {
        fontSize: 15,
        fontWeight: '600',
    },
    // Compact styles
    compactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        borderWidth: 1,
        padding: 16,
    },
    compactIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    compactContent: {
        flex: 1,
        marginLeft: 14,
    },
    compactLabel: {
        fontSize: 13,
    },
    compactValue: {
        fontSize: 22,
        fontWeight: '700',
        marginTop: 2,
    },
});

export default PointsCard;
