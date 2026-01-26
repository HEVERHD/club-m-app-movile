/**
 * PointsTransactionItem - Individual transaction row in history
 */
import { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import type { PointsTransaction } from '../../api/points.api';
import {
    getTransactionTypeIcon,
    getTransactionTypeColor,
    getTransactionTypeLabel,
    formatPointsAmount,
} from '../../api/points.api';

interface Props {
    transaction: PointsTransaction;
}

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} dias`;

    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
};

export const PointsTransactionItem = memo(function PointsTransactionItem({ transaction }: Props) {
    const { colors } = useTheme();

    const icon = getTransactionTypeIcon(transaction.type);
    const color = getTransactionTypeColor(transaction.type);
    const typeLabel = getTransactionTypeLabel(transaction.type);
    const isPositive = transaction.amount >= 0;

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.bg.card,
                    borderColor: colors.border.default,
                },
            ]}
        >
            {/* Icon */}
            <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon as any} size={22} color={color} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.topRow}>
                    <Text style={[styles.description, { color: colors.text.primary }]} numberOfLines={1}>
                        {transaction.description}
                    </Text>
                    <Text
                        style={[
                            styles.amount,
                            { color: isPositive ? '#22c55e' : transaction.type === 'redeemed' ? '#8b5cf6' : '#ef4444' },
                        ]}
                    >
                        {formatPointsAmount(transaction.amount)}
                    </Text>
                </View>

                <View style={styles.bottomRow}>
                    <View style={styles.metaRow}>
                        <View style={[styles.typeBadge, { backgroundColor: color + '15' }]}>
                            <Text style={[styles.typeText, { color }]}>{typeLabel}</Text>
                        </View>
                        {transaction.clubName && (
                            <Text style={[styles.clubName, { color: colors.text.tertiary }]} numberOfLines={1}>
                                {transaction.clubName}
                            </Text>
                        )}
                    </View>
                    <Text style={[styles.date, { color: colors.text.tertiary }]}>
                        {formatDate(transaction.date)}
                    </Text>
                </View>

                {/* Expiry warning for earned points */}
                {transaction.expiresAt && isPositive && (
                    <ExpiryIndicator expiresAt={transaction.expiresAt} colors={colors} />
                )}
            </View>
        </View>
    );
});

// Sub-component for expiry indicator
const ExpiryIndicator = memo(function ExpiryIndicator({
    expiresAt,
    colors,
}: {
    expiresAt: string;
    colors: any;
}) {
    const now = Date.now();
    const expiryDate = new Date(expiresAt).getTime();
    const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry > 30) return null;

    const isUrgent = daysUntilExpiry <= 7;

    return (
        <View
            style={[
                styles.expiryBar,
                { backgroundColor: isUrgent ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)' },
            ]}
        >
            <Ionicons
                name="time-outline"
                size={12}
                color={isUrgent ? '#ef4444' : '#f59e0b'}
            />
            <Text style={[styles.expiryText, { color: isUrgent ? '#ef4444' : '#f59e0b' }]}>
                {daysUntilExpiry <= 0
                    ? 'Vence hoy'
                    : daysUntilExpiry === 1
                    ? 'Vence manana'
                    : `Vence en ${daysUntilExpiry} dias`}
            </Text>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderRadius: 14,
        borderWidth: 1,
        padding: 14,
        marginBottom: 10,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        marginLeft: 12,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    description: {
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
        marginRight: 12,
    },
    amount: {
        fontSize: 16,
        fontWeight: '700',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 8,
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    typeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    clubName: {
        fontSize: 12,
        flex: 1,
    },
    date: {
        fontSize: 12,
    },
    expiryBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 10,
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 6,
    },
    expiryText: {
        fontSize: 11,
        fontWeight: '500',
    },
});

export default PointsTransactionItem;
