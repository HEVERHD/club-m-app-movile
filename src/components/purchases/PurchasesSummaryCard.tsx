/**
 * PurchasesSummaryCard Component
 * Displays summary of customer's purchases/payments
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import type { PurchasesSummary } from '../../api/purchases.api';

interface PurchasesSummaryCardProps {
    summary: PurchasesSummary | null;
    variant?: 'full' | 'compact';
}

export function PurchasesSummaryCard({ summary, variant = 'full' }: PurchasesSummaryCardProps) {
    const { colors } = useTheme();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (variant === 'compact') {
        return (
            <View style={[styles.compactContainer, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                <View style={[styles.compactIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                    <Ionicons name="receipt" size={20} color="#10b981" />
                </View>
                <View style={styles.compactContent}>
                    <Text style={[styles.compactLabel, { color: colors.text.tertiary }]}>Total Pagado</Text>
                    <Text style={[styles.compactValue, { color: colors.text.primary }]}>
                        {formatCurrency(summary?.totalPaid ?? 0)}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </View>
        );
    }

    return (
        <LinearGradient
            colors={['#10b981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            {/* Main Amount */}
            <View style={styles.mainSection}>
                <View style={styles.labelRow}>
                    <View style={styles.iconBadge}>
                        <Ionicons name="receipt" size={16} color="white" />
                    </View>
                    <Text style={styles.mainLabel}>Total Pagado</Text>
                </View>
                <Text style={styles.mainAmount}>{formatCurrency(summary?.totalPaid ?? 0)}</Text>
                <Text style={styles.subtitle}>
                    {summary?.totalTransactions ?? 0} transacciones totales
                </Text>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <View style={styles.statIcon}>
                        <Ionicons name="calendar" size={14} color="rgba(255,255,255,0.9)" />
                    </View>
                    <View>
                        <Text style={styles.statValue}>{formatCurrency(summary?.thisMonthAmount ?? 0)}</Text>
                        <Text style={styles.statLabel}>Este mes</Text>
                    </View>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                    <View style={styles.statIcon}>
                        <Ionicons name="time" size={14} color="rgba(255,255,255,0.9)" />
                    </View>
                    <View>
                        <Text style={styles.statValue}>{formatCurrency(summary?.lastMonthAmount ?? 0)}</Text>
                        <Text style={styles.statLabel}>Mes pasado</Text>
                    </View>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                    <View style={styles.statIcon}>
                        <Ionicons name="swap-horizontal" size={14} color="rgba(255,255,255,0.9)" />
                    </View>
                    <View>
                        <Text style={styles.statValue}>{summary?.exchangesCount ?? 0}</Text>
                        <Text style={styles.statLabel}>Canjes</Text>
                    </View>
                </View>
            </View>

            {/* Decorative elements */}
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        overflow: 'hidden',
    },
    mainSection: {
        marginBottom: 20,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    iconBadge: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainLabel: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontWeight: '500',
    },
    mainAmount: {
        color: 'white',
        fontSize: 36,
        fontWeight: '800',
        letterSpacing: -1,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 14,
        padding: 14,
    },
    statItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statValue: {
        color: 'white',
        fontSize: 14,
        fontWeight: '700',
    },
    statLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 11,
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginHorizontal: 8,
    },
    decorCircle1: {
        position: 'absolute',
        top: -30,
        right: -30,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    decorCircle2: {
        position: 'absolute',
        bottom: -40,
        left: -20,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    // Compact variant styles
    compactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
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
    compactLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    compactValue: {
        fontSize: 18,
        fontWeight: '700',
    },
});
