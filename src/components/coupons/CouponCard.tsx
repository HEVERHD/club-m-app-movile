// src/components/coupons/CouponCard.tsx
import { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import type { Coupon } from '../../types/coupons';
import {
    getCouponIcon,
    getCouponColor,
    formatCouponValue,
    getDaysUntilExpiry,
} from '../../types/coupons';

interface Props {
    coupon: Coupon;
    onPress: () => void;
    compact?: boolean;
}

const getStatusConfig = (status: Coupon['status'], daysLeft: number) => {
    if (status === 'used') {
        return {
            label: 'Usado',
            bg: 'rgba(107, 114, 128, 0.15)',
            text: '#6b7280',
        };
    }
    if (status === 'expired') {
        return {
            label: 'Expirado',
            bg: 'rgba(239, 68, 68, 0.15)',
            text: '#ef4444',
        };
    }
    if (status === 'locked') {
        return {
            label: 'Bloqueado',
            bg: 'rgba(107, 114, 128, 0.15)',
            text: '#6b7280',
        };
    }
    // Available
    if (daysLeft <= 3) {
        return {
            label: `${daysLeft}d restantes`,
            bg: 'rgba(239, 68, 68, 0.15)',
            text: '#ef4444',
        };
    }
    if (daysLeft <= 7) {
        return {
            label: `${daysLeft}d restantes`,
            bg: 'rgba(245, 158, 11, 0.15)',
            text: '#f59e0b',
        };
    }
    return {
        label: `${daysLeft}d restantes`,
        bg: 'rgba(34, 197, 94, 0.15)',
        text: '#22c55e',
    };
};

export const CouponCard = memo(function CouponCard({ coupon, onPress, compact = false }: Props) {
    const { colors } = useTheme();
    const daysLeft = getDaysUntilExpiry(coupon.expiresAt);
    const statusConfig = getStatusConfig(coupon.status, daysLeft);
    const couponColor = getCouponColor(coupon.type);
    const couponIcon = getCouponIcon(coupon.type);
    const valueText = formatCouponValue(coupon);
    const isAvailable = coupon.status === 'available';

    if (compact) {
        return (
            <TouchableOpacity
                style={[
                    styles.compactCard,
                    {
                        backgroundColor: colors.bg.card,
                        borderColor: colors.border.default,
                        opacity: isAvailable ? 1 : 0.6,
                    },
                ]}
                onPress={onPress}
                activeOpacity={0.7}
                disabled={!isAvailable}
            >
                <View style={[styles.compactIcon, { backgroundColor: couponColor + '15' }]}>
                    <Ionicons name={couponIcon as any} size={20} color={couponColor} />
                </View>
                <View style={styles.compactContent}>
                    <Text style={[styles.compactValue, { color: couponColor }]} numberOfLines={1}>
                        {valueText}
                    </Text>
                    <Text style={[styles.compactTitle, { color: colors.text.secondary }]} numberOfLines={1}>
                        {coupon.title}
                    </Text>
                </View>
                <View style={[styles.compactBadge, { backgroundColor: statusConfig.bg }]}>
                    <Text style={[styles.compactBadgeText, { color: statusConfig.text }]}>
                        {statusConfig.label}
                    </Text>
                </View>
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
                    opacity: isAvailable ? 1 : 0.7,
                },
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* Decorative ticket edge */}
            <View style={[styles.ticketEdge, { backgroundColor: couponColor }]} />

            {/* Header */}
            <View style={styles.header}>
                <View style={[styles.iconBox, { backgroundColor: couponColor + '15' }]}>
                    <Ionicons name={couponIcon as any} size={28} color={couponColor} />
                </View>

                <View style={styles.headerContent}>
                    <Text style={[styles.valueText, { color: couponColor }]}>{valueText}</Text>
                    <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={1}>
                        {coupon.title}
                    </Text>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                    <Text style={[styles.statusText, { color: statusConfig.text }]}>
                        {statusConfig.label}
                    </Text>
                </View>
            </View>

            {/* Description */}
            <Text style={[styles.description, { color: colors.text.secondary }]} numberOfLines={2}>
                {coupon.description}
            </Text>

            {/* Club badge if specific */}
            {coupon.clubName && (
                <View style={[styles.clubBadge, { backgroundColor: colors.bg.elevated }]}>
                    <Ionicons name="storefront-outline" size={14} color={colors.text.muted} />
                    <Text style={[styles.clubText, { color: colors.text.muted }]}>
                        Solo en: {coupon.clubName}
                    </Text>
                </View>
            )}

            {/* Footer */}
            <View style={[styles.footer, { borderTopColor: colors.border.default }]}>
                <View style={styles.codeContainer}>
                    <Text style={[styles.codeLabel, { color: colors.text.muted }]}>Código:</Text>
                    <View style={[styles.codeBox, { backgroundColor: colors.bg.elevated }]}>
                        <Text style={[styles.codeText, { color: colors.text.primary }]}>
                            {coupon.code}
                        </Text>
                    </View>
                </View>

                {isAvailable && (
                    <TouchableOpacity
                        style={[styles.useBtn, { backgroundColor: couponColor }]}
                        onPress={onPress}
                    >
                        <Text style={styles.useBtnText}>Usar</Text>
                        <Ionicons name="arrow-forward" size={16} color="#ffffff" />
                    </TouchableOpacity>
                )}

                {coupon.status === 'used' && coupon.usedAt && (
                    <Text style={[styles.usedDate, { color: colors.text.muted }]}>
                        Usado el {new Date(coupon.usedAt).toLocaleDateString('es', {
                            day: 'numeric',
                            month: 'short',
                        })}
                    </Text>
                )}
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
        overflow: 'hidden',
    },
    ticketEdge: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    iconBox: {
        width: 52,
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerContent: {
        flex: 1,
    },
    valueText: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 2,
    },
    title: {
        fontSize: 14,
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },

    // Description
    description: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 12,
    },

    // Club
    clubBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 6,
        marginBottom: 12,
    },
    clubText: {
        fontSize: 12,
    },

    // Footer
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    codeLabel: {
        fontSize: 12,
    },
    codeBox: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    codeText: {
        fontSize: 13,
        fontWeight: '600',
        fontFamily: 'monospace',
    },
    useBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    useBtnText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    usedDate: {
        fontSize: 12,
    },

    // Compact variant
    compactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 8,
    },
    compactIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    compactContent: {
        flex: 1,
    },
    compactValue: {
        fontSize: 15,
        fontWeight: '700',
    },
    compactTitle: {
        fontSize: 12,
    },
    compactBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    compactBadgeText: {
        fontSize: 10,
        fontWeight: '600',
    },
});
