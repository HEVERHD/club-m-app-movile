// src/components/exchange/ExchangeSummary.tsx
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

interface Props {
    amountToPay: number;
    totalSelected: number;
    clubsCount: number;
    canCover: boolean;
    shortage: number;
    isProcessing: boolean;
    onProcess: () => void;
    onCancel: () => void;
}

export function ExchangeSummary({
    amountToPay,
    totalSelected,
    clubsCount,
    canCover,
    shortage,
    isProcessing,
    onProcess,
    onCancel,
}: Props) {
    const remaining = amountToPay - totalSelected;
    const hasExcess = totalSelected > amountToPay;
    const change = hasExcess ? totalSelected - amountToPay : 0;

    return (
        <View style={styles.container}>
            {/* Summary Info */}
            <View style={styles.summarySection}>
                <View style={styles.row}>
                    <Text style={styles.label}>A Pagar:</Text>
                    <Text style={styles.value}>${amountToPay.toFixed(2)}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>
                        Seleccionado ({clubsCount} club{clubsCount !== 1 ? 's' : ''}):
                    </Text>
                    <Text style={[styles.value, canCover && styles.valueSuccess]}>
                        ${totalSelected.toFixed(2)}
                    </Text>
                </View>

                {!canCover && remaining > 0 && (
                    <View style={styles.warningRow}>
                        <Ionicons name="warning" size={16} color={COLORS.status.warning} />
                        <Text style={styles.warningText}>
                            Faltan ${remaining.toFixed(2)} por cubrir
                        </Text>
                    </View>
                )}

                {shortage > 0 && (
                    <View style={styles.errorRow}>
                        <Ionicons name="alert-circle" size={16} color={COLORS.status.error} />
                        <Text style={styles.errorText}>
                            Saldo insuficiente. Faltan ${shortage.toFixed(2)}
                        </Text>
                    </View>
                )}

                {hasExcess && (
                    <View style={styles.infoRow}>
                        <Ionicons name="information-circle" size={16} color={COLORS.accent.blue} />
                        <Text style={styles.infoText}>
                            Cambio: ${change.toFixed(2)} (quedará en el club)
                        </Text>
                    </View>
                )}
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={onCancel}
                    disabled={isProcessing}
                >
                    <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.processBtn,
                        (!canCover || isProcessing) && styles.processBtnDisabled,
                    ]}
                    onPress={onProcess}
                    disabled={!canCover || isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                        <>
                            <Ionicons name="card" size={18} color={COLORS.white} />
                            <Text style={styles.processText}>
                                Usar Saldo
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.bg.card,
        borderTopWidth: 1,
        borderTopColor: COLORS.border.default,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 32, // Extra padding for safe area
    },
    summarySection: {
        gap: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        color: COLORS.text.secondary,
    },
    value: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text.primary,
    },
    valueSuccess: {
        color: COLORS.status.success,
    },
    warningRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: COLORS.status.warningBg,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        marginTop: 4,
    },
    warningText: {
        fontSize: 13,
        color: COLORS.status.warning,
        fontWeight: '500',
    },
    errorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: COLORS.status.errorBg,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        marginTop: 4,
    },
    errorText: {
        fontSize: 13,
        color: COLORS.status.error,
        fontWeight: '500',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: COLORS.accent.blue + '15',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        marginTop: 4,
    },
    infoText: {
        fontSize: 13,
        color: COLORS.accent.blue,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border.default,
        marginVertical: 16,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.bg.elevated,
        borderRadius: 12,
    },
    cancelText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text.secondary,
    },
    processBtn: {
        flex: 2,
        height: 48,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.status.success,
        borderRadius: 12,
        gap: 8,
    },
    processBtnDisabled: {
        backgroundColor: COLORS.text.muted,
    },
    processText: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.white,
    },
});