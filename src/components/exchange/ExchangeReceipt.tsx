// src/components/exchange/ExchangeReceipt.tsx
// Componente modal para mostrar el recibo del consumo
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';


interface Props {
    visible: boolean;
    results: ExchangeResult[];
    amountPaid: number;
    onClose: () => void;
    onShare?: () => void;
}

export function ExchangeReceipt({ visible, results, amountPaid, onClose, onShare }: Props) {
    const totalUsed = results.reduce((sum, r) => sum + r.amountUsed, 0);
    const successfulResults = results.filter(r => r.amountUsed > 0);
    const now = new Date();

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.successIcon}>
                        <Ionicons name="checkmark-circle" size={64} color={COLORS.status.success} />
                    </View>
                    <Text style={styles.title}>¡Consumo Exitoso!</Text>
                    <Text style={styles.subtitle}>
                        {now.toLocaleDateString('es-PA', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </Text>
                </View>

                {/* Amount */}
                <View style={styles.amountSection}>
                    <Text style={styles.amountLabel}>Monto Utilizado</Text>
                    <Text style={styles.amountValue}>${totalUsed.toFixed(2)}</Text>
                </View>

                {/* Clubs Used */}
                <View style={styles.clubsSection}>
                    <Text style={styles.sectionTitle}>Clubs Utilizados</Text>

                    {successfulResults.map((result, index) => (
                        <View key={result.clubId} style={styles.clubRow}>
                            <View style={styles.clubInfo}>
                                <Text style={styles.clubNumber}>
                                    Club #{result.contractNumber}
                                </Text>
                                <Text style={styles.clubTransaction}>
                                    ID: {result.transactionId.slice(0, 8)}...
                                </Text>
                            </View>
                            <View style={styles.clubAmounts}>
                                <Text style={styles.clubUsed}>
                                    -${result.amountUsed.toFixed(2)}
                                </Text>
                                <Text style={styles.clubBalance}>
                                    Nuevo saldo: ${result.newBalance.toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Summary */}
                <View style={styles.summarySection}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total a pagar:</Text>
                        <Text style={styles.summaryValue}>${amountPaid.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Usado de clubs:</Text>
                        <Text style={[styles.summaryValue, styles.summarySuccess]}>
                            ${totalUsed.toFixed(2)}
                        </Text>
                    </View>
                    {totalUsed > amountPaid && (
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Excedente (queda en club):</Text>
                            <Text style={styles.summaryValue}>
                                ${(totalUsed - amountPaid).toFixed(2)}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    {onShare && (
                        <TouchableOpacity style={styles.shareBtn} onPress={onShare}>
                            <Ionicons name="share-outline" size={20} color={COLORS.accent.blue} />
                            <Text style={styles.shareBtnText}>Compartir</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Text style={styles.closeBtnText}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg.primary,
    },
    header: {
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 24,
        backgroundColor: COLORS.bg.card,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.default,
    },
    successIcon: {
        marginBottom: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text.primary,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.text.secondary,
        marginTop: 4,
    },
    amountSection: {
        alignItems: 'center',
        paddingVertical: 24,
        backgroundColor: COLORS.status.success + '10',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
    },
    amountLabel: {
        fontSize: 14,
        color: COLORS.text.secondary,
        marginBottom: 4,
    },
    amountValue: {
        fontSize: 40,
        fontWeight: '700',
        color: COLORS.status.success,
    },
    clubsSection: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text.secondary,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    clubRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.bg.card,
        padding: 12,
        borderRadius: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: COLORS.border.default,
    },
    clubInfo: {
        flex: 1,
    },
    clubNumber: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    clubTransaction: {
        fontSize: 11,
        color: COLORS.text.muted,
        marginTop: 2,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    clubAmounts: {
        alignItems: 'flex-end',
    },
    clubUsed: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.status.error,
    },
    clubBalance: {
        fontSize: 12,
        color: COLORS.text.secondary,
        marginTop: 2,
    },
    summarySection: {
        backgroundColor: COLORS.bg.card,
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border.default,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: COLORS.text.secondary,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    summarySuccess: {
        color: COLORS.status.success,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        padding: 16,
        paddingBottom: 32,
        marginTop: 'auto',
    },
    shareBtn: {
        flex: 1,
        flexDirection: 'row',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.accent.blue + '15',
        borderRadius: 12,
        gap: 8,
    },
    shareBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.accent.blue,
    },
    closeBtn: {
        flex: 2,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.accent.blue,
        borderRadius: 12,
    },
    closeBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.white,
    },
});

// Need to import Platform at the top
import { Platform } from 'react-native';
import { ExchangeResult } from '../../api/exchange.api';
