/**
 * PurchaseItem Component
 * Displays individual purchase/transaction in the history list
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import {
    Purchase,
    getPurchaseTypeLabel,
    getPurchaseTypeIcon,
    getPurchaseTypeColor,
    getPaymentMethodLabel,
    getPaymentMethodIcon,
    getStatusLabel,
    getStatusColor,
    formatPurchaseAmount,
} from '../../api/purchases.api';

interface PurchaseItemProps {
    purchase: Purchase;
    onPress?: (purchase: Purchase) => void;
}

export function PurchaseItem({ purchase, onPress }: PurchaseItemProps) {
    const { colors } = useTheme();

    const typeIcon = getPurchaseTypeIcon(purchase.type);
    const typeColor = getPurchaseTypeColor(purchase.type);
    const typeLabel = getPurchaseTypeLabel(purchase.type);
    const statusColor = getStatusColor(purchase.status);
    const statusLabel = getStatusLabel(purchase.status);
    const formattedAmount = formatPurchaseAmount(purchase.amount, purchase.type);
    const isPositive = purchase.type === 'refund';

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'short',
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}
            onPress={() => onPress?.(purchase)}
            activeOpacity={0.7}
            disabled={!onPress}
        >
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: `${typeColor}15` }]}>
                <Ionicons name={typeIcon as any} size={22} color={typeColor} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.topRow}>
                    <Text style={[styles.description, { color: colors.text.primary }]} numberOfLines={1}>
                        {purchase.description}
                    </Text>
                    <Text style={[styles.amount, { color: isPositive ? '#22c55e' : colors.text.primary }]}>
                        {formattedAmount}
                    </Text>
                </View>

                <View style={styles.middleRow}>
                    {/* Type Badge */}
                    <View style={[styles.typeBadge, { backgroundColor: `${typeColor}15` }]}>
                        <Text style={[styles.typeBadgeText, { color: typeColor }]}>{typeLabel}</Text>
                    </View>

                    {/* Club Name if available */}
                    {purchase.clubName && (
                        <View style={styles.clubContainer}>
                            <Ionicons name="business-outline" size={12} color={colors.text.tertiary} />
                            <Text style={[styles.clubText, { color: colors.text.tertiary }]} numberOfLines={1}>
                                {purchase.clubName}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.bottomRow}>
                    {/* Date and Time */}
                    <View style={styles.dateContainer}>
                        <Ionicons name="calendar-outline" size={12} color={colors.text.tertiary} />
                        <Text style={[styles.dateText, { color: colors.text.tertiary }]}>
                            {formatDate(purchase.date)}
                        </Text>
                        <Text style={[styles.timeText, { color: colors.text.quaternary }]}>
                            {formatTime(purchase.date)}
                        </Text>
                    </View>

                    {/* Payment Method */}
                    {purchase.paymentMethod && (
                        <View style={styles.paymentContainer}>
                            <Ionicons
                                name={getPaymentMethodIcon(purchase.paymentMethod) as any}
                                size={12}
                                color={colors.text.tertiary}
                            />
                            <Text style={[styles.paymentText, { color: colors.text.tertiary }]}>
                                {getPaymentMethodLabel(purchase.paymentMethod)}
                            </Text>
                        </View>
                    )}

                    {/* Status Badge (if not completed) */}
                    {purchase.status !== 'completed' && (
                        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
                        </View>
                    )}
                </View>

                {/* Contract/Week info if available */}
                {(purchase.contractNumber || purchase.weekNumber) && (
                    <View style={styles.extraInfo}>
                        {purchase.contractNumber && (
                            <Text style={[styles.extraText, { color: colors.text.quaternary }]}>
                                Contrato: {purchase.contractNumber}
                            </Text>
                        )}
                        {purchase.weekNumber && (
                            <Text style={[styles.extraText, { color: colors.text.quaternary }]}>
                                Semana {purchase.weekNumber}
                            </Text>
                        )}
                    </View>
                )}
            </View>

            {/* Chevron */}
            {onPress && (
                <Ionicons name="chevron-forward" size={18} color={colors.text.quaternary} />
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 10,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    description: {
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
        marginRight: 8,
    },
    amount: {
        fontSize: 16,
        fontWeight: '700',
    },
    middleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    typeBadgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    clubContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        flex: 1,
    },
    clubText: {
        fontSize: 12,
        flex: 1,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        fontSize: 12,
    },
    timeText: {
        fontSize: 11,
    },
    paymentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    paymentText: {
        fontSize: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        gap: 4,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '500',
    },
    extraInfo: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 6,
        paddingTop: 6,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    extraText: {
        fontSize: 11,
    },
});
