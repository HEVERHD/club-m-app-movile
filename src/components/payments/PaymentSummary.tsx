// src/components/payments/PaymentSummary.tsx
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

interface PaymentSummaryProps {
    selectedCount: number;
    totalAmount: number;
    isProcessing: boolean;
    onPay: () => void;
    onCancel: () => void;
}

export function PaymentSummary({
    selectedCount,
    totalAmount,
    isProcessing,
    onPay,
    onCancel,
}: PaymentSummaryProps) {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Summary Info */}
                <View style={styles.info}>
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>{selectedCount}</Text>
                    </View>
                    <View style={styles.details}>
                        <Text style={styles.label}>
                            {selectedCount === 1 ? 'semana seleccionada' : 'semanas seleccionadas'}
                        </Text>
                        <Text style={styles.amount}>${totalAmount.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={onCancel}
                        disabled={isProcessing}
                    >
                        <Ionicons name="close" size={20} color={COLORS.text.secondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.payBtn, isProcessing && styles.payBtnDisabled]}
                        onPress={onPay}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <ActivityIndicator size="small" color={COLORS.white} />
                        ) : (
                            <>
                                <Ionicons name="card" size={18} color={COLORS.white} />
                                <Text style={styles.payBtnText}>Pagar</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.bg.card,
        borderTopWidth: 1,
        borderTopColor: COLORS.border.default,
        paddingBottom: 34, // Safe area
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },

    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },

    // Info
    info: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    countBadge: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: COLORS.accent.blue + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    countText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.accent.blue,
    },
    details: {},
    label: {
        fontSize: 12,
        color: COLORS.text.secondary,
    },
    amount: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text.primary,
        marginTop: 2,
    },

    // Actions
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    cancelBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: COLORS.bg.elevated,
        justifyContent: 'center',
        alignItems: 'center',
    },
    payBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: COLORS.accent.blue,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
    },
    payBtnDisabled: {
        opacity: 0.7,
    },
    payBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.white,
    },
});