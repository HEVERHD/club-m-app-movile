// src/components/payments/WeekSelector.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import type { ClubWeek } from '../../api/payments.api';

interface WeekSelectorProps {
    weeks: ClubWeek[];
    selectedWeeks: number[];
    onToggleWeek: (weekNumber: number) => void;
    denomination: number;
}

export function WeekSelector({ weeks, selectedWeeks, onToggleWeek, denomination }: WeekSelectorProps) {
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-PA', { day: '2-digit', month: 'short' });
    };

    return (
        <View style={styles.container}>
            {weeks.map((week) => {
                const isSelected = selectedWeeks.includes(week.weekNumber);
                const isPaid = week.status === 'paid';
                const isLate = week.status === 'late';

                return (
                    <TouchableOpacity
                        key={week.weekNumber}
                        style={[
                            styles.weekCard,
                            isPaid && styles.weekPaid,
                            isLate && !isSelected && styles.weekLate,
                            isSelected && styles.weekSelected,
                        ]}
                        onPress={() => !isPaid && onToggleWeek(week.weekNumber)}
                        disabled={isPaid}
                        activeOpacity={isPaid ? 1 : 0.7}
                    >
                        {/* Checkbox / Status Icon */}
                        <View style={[
                            styles.checkbox,
                            isPaid && styles.checkboxPaid,
                            isSelected && styles.checkboxSelected,
                        ]}>
                            {isPaid ? (
                                <Ionicons name="checkmark" size={14} color={COLORS.status.success} />
                            ) : isSelected ? (
                                <Ionicons name="checkmark" size={14} color={COLORS.white} />
                            ) : null}
                        </View>

                        {/* Week Info */}
                        <View style={styles.weekInfo}>
                            <Text style={[styles.weekNumber, isPaid && styles.textPaid]}>
                                Semana {week.weekNumber}
                            </Text>
                            <Text style={[styles.weekDate, isPaid && styles.textPaid]}>
                                {formatDate(week.drawDate)}
                            </Text>
                        </View>

                        {/* Amount / Status */}
                        <View style={styles.weekRight}>
                            {isPaid ? (
                                <View style={styles.paidBadge}>
                                    <Text style={styles.paidText}>Pagada</Text>
                                </View>
                            ) : (
                                <>
                                    <Text style={[styles.weekAmount, isSelected && styles.amountSelected]}>
                                        ${denomination.toFixed(2)}
                                    </Text>
                                    {isLate && (
                                        <Text style={styles.lateText}>Atrasada</Text>
                                    )}
                                </>
                            )}
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { gap: 8, paddingBottom: 120 },

    weekCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bg.card,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: COLORS.border.default,
    },
    weekPaid: {
        backgroundColor: COLORS.bg.elevated,
        opacity: 0.7,
    },
    weekLate: {
        borderColor: COLORS.status.warning,
        backgroundColor: 'rgba(255, 159, 10, 0.05)',
    },
    weekSelected: {
        borderColor: COLORS.accent.blue,
        backgroundColor: COLORS.accent.blue + '10',
    },

    // Checkbox
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.border.default,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    checkboxPaid: {
        borderColor: COLORS.status.success,
        backgroundColor: COLORS.status.success + '20',
    },
    checkboxSelected: {
        borderColor: COLORS.accent.blue,
        backgroundColor: COLORS.accent.blue,
    },

    // Week Info
    weekInfo: { flex: 1 },
    weekNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    weekDate: {
        fontSize: 12,
        color: COLORS.text.secondary,
        marginTop: 2,
    },
    textPaid: {
        color: COLORS.text.muted,
    },

    // Right side
    weekRight: { alignItems: 'flex-end' },
    weekAmount: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.text.primary,
    },
    amountSelected: {
        color: COLORS.accent.blue,
    },
    lateText: {
        fontSize: 11,
        color: COLORS.status.warning,
        marginTop: 2,
    },

    // Paid badge
    paidBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: COLORS.status.success + '20',
        borderRadius: 8,
    },
    paidText: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.status.success,
    },
});