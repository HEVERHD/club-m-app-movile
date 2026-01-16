// src/components/clubs/ClubCard.tsx - ARREGLADO
import { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import type { Club } from '../../types/clubs';

interface Props {
    club: Club;
    onPress: () => void;
}

const getStatusConfig = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'activo' || s === 'active') {
        return {
            bg: 'rgba(34, 197, 94, 0.15)',
            text: '#22c55e',
            dotColor: '#22c55e',
        };
    }
    if (s === 'anulado' || s === 'cancelled' || s === 'cancelado') {
        return {
            bg: 'rgba(239, 68, 68, 0.15)',
            text: '#ef4444',
            dotColor: '#ef4444',
        };
    }
    if (s === 'vencido' || s === 'late' || s === 'cerrado') {
        return {
            bg: 'rgba(245, 158, 11, 0.15)',
            text: '#f59e0b',
            dotColor: '#f59e0b',
        };
    }
    return {
        bg: 'rgba(59, 130, 246, 0.15)',
        text: '#3b82f6',
        dotColor: '#3b82f6',
    };
};

const formatCurrency = (n: number) => {
    const formatted = Math.abs(n).toFixed(2);
    return n < 0 ? `-$${formatted}` : `$${formatted}`;
};

export const ClubCard = memo(function ClubCard({ club, onPress }: Props) {
    const { colors } = useTheme();
    const status = getStatusConfig(club.statusName);
    const progressPercent = Math.min((club.weeksPaid / 52) * 100, 100);

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    {/* Contract + Status */}
                    <View style={styles.titleRow}>
                        <Text style={[styles.contract, { color: colors.text.primary }]}>#{club.contractNumber}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                            <View style={[styles.statusDot, { backgroundColor: status.dotColor }]} />
                            <Text style={[styles.statusText, { color: status.text }]}>
                                {club.statusName}
                            </Text>
                        </View>
                    </View>

                    {/* Customer Info */}
                    <Text style={[styles.customerName, { color: colors.text.secondary }]} numberOfLines={1}>
                        {club.customerName}
                    </Text>
                    <Text style={[styles.customerNumber, { color: colors.text.muted }]}>{club.customerNumber}</Text>
                </View>

                {/* Share */}
                <View style={[styles.shareBox, { backgroundColor: colors.bg.elevated }]}>
                    <Text style={[styles.shareLabel, { color: colors.text.muted }]}>Share</Text>
                    <Text style={[styles.shareValue, { color: colors.accent.blue }]}>{club.share}</Text>
                </View>
            </View>

            {/* Progress */}
            <View style={styles.progressSection}>
                <View style={[styles.progressBar, { backgroundColor: colors.border.default }]}>
                    <View style={[styles.progressFill, { width: `${progressPercent}%`, backgroundColor: colors.accent.blue }]} />
                </View>
                <Text style={[styles.progressText, { color: colors.text.muted }]}>
                    {club.weeksPaid}/{52} semanas
                </Text>
            </View>

            {/* Footer */}
            <View style={[styles.footer, { borderTopColor: colors.border.default }]}>
                <View>
                    <Text style={[styles.balanceLabel, { color: colors.text.muted }]}>Balance</Text>
                    <Text style={[
                        styles.balanceValue,
                        { color: club.balanceAmount < 0 ? colors.status.error : colors.accent.green }
                    ]}>
                        {formatCurrency(club.balanceAmount)}
                    </Text>
                </View>

                <TouchableOpacity style={styles.detailBtn} onPress={onPress}>
                    <Text style={[styles.detailBtnText, { color: colors.accent.blue }]}>Ver detalle</Text>
                    <View style={[styles.detailArrow, { backgroundColor: colors.status.infoBg }]}>
                        <Ionicons name="chevron-forward" size={14} color={colors.accent.blue} />
                    </View>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerLeft: {
        flex: 1,
        marginRight: 12,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 8,
    },
    contract: {
        fontSize: 18,
        fontWeight: '700',
    },

    // Status Badge
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },

    // Customer
    customerName: {
        fontSize: 14,
        marginBottom: 2,
    },
    customerNumber: {
        fontSize: 13,
    },

    // Share
    shareBox: {
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
    },
    shareLabel: {
        fontSize: 11,
        marginBottom: 2,
    },
    shareValue: {
        fontSize: 22,
        fontWeight: '700',
    },

    // Progress
    progressSection: {
        marginTop: 16,
        marginBottom: 16,
    },
    progressBar: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        marginTop: 6,
        textAlign: 'right',
    },

    // Footer
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingTop: 16,
        borderTopWidth: 1,
    },
    balanceLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    balanceValue: {
        fontSize: 18,
        fontWeight: '700',
    },

    // Detail Button
    detailBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailBtnText: {
        fontSize: 14,
        fontWeight: '600',
    },
    detailArrow: {
        width: 24,
        height: 24,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
