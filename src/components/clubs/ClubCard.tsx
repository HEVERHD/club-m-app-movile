// src/components/clubs/ClubCard.tsx - ARREGLADO
import { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
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
    const status = getStatusConfig(club.statusName);
    const progressPercent = Math.min((club.weeksPaid / 52) * 100, 100);

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    {/* Contract + Status */}
                    <View style={styles.titleRow}>
                        <Text style={styles.contract}>#{club.contractNumber}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                            <View style={[styles.statusDot, { backgroundColor: status.dotColor }]} />
                            <Text style={[styles.statusText, { color: status.text }]}>
                                {club.statusName}
                            </Text>
                        </View>
                    </View>

                    {/* Customer Info */}
                    <Text style={styles.customerName} numberOfLines={1}>
                        {club.customerName}
                    </Text>
                    <Text style={styles.customerNumber}>{club.customerNumber}</Text>
                </View>

                {/* Share */}
                <View style={styles.shareBox}>
                    <Text style={styles.shareLabel}>Share</Text>
                    <Text style={styles.shareValue}>{club.share}</Text>
                </View>
            </View>

            {/* Progress */}
            <View style={styles.progressSection}>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                </View>
                <Text style={styles.progressText}>
                    {club.weeksPaid}/{52} semanas
                </Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <View>
                    <Text style={styles.balanceLabel}>Balance</Text>
                    <Text style={[
                        styles.balanceValue,
                        { color: club.balanceAmount < 0 ? COLORS.status.error : COLORS.accent.green }
                    ]}>
                        {formatCurrency(club.balanceAmount)}
                    </Text>
                </View>

                <TouchableOpacity style={styles.detailBtn} onPress={onPress}>
                    <Text style={styles.detailBtnText}>Ver detalle</Text>
                    <View style={styles.detailArrow}>
                        <Ionicons name="chevron-forward" size={14} color={COLORS.accent.blue} />
                    </View>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.bg.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border.default,
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
        color: COLORS.text.primary,
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
        color: COLORS.text.secondary,
        marginBottom: 2,
    },
    customerNumber: {
        fontSize: 13,
        color: COLORS.text.muted,
    },

    // Share
    shareBox: {
        alignItems: 'center',
        backgroundColor: COLORS.bg.elevated,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
    },
    shareLabel: {
        fontSize: 11,
        color: COLORS.text.muted,
        marginBottom: 2,
    },
    shareValue: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.accent.blue,
    },

    // Progress
    progressSection: {
        marginTop: 16,
        marginBottom: 16,
    },
    progressBar: {
        height: 6,
        backgroundColor: COLORS.border.default,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.accent.blue,
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        color: COLORS.text.muted,
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
        borderTopColor: COLORS.border.default,
    },
    balanceLabel: {
        fontSize: 12,
        color: COLORS.text.muted,
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
        color: COLORS.accent.blue,
        fontWeight: '600',
    },
    detailArrow: {
        width: 24,
        height: 24,
        borderRadius: 8,
        backgroundColor: COLORS.status.infoBg,
        justifyContent: 'center',
        alignItems: 'center',
    },
});