// src/components/draws/WinnersList.tsx
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import type { DrawWinner } from '../../types/clubs';
import { useDrawStore } from '../../stores/draw-store';
import { CustomAlert } from '../ui/CustomAlert';
import { useAlert } from '../../hooks/useAlert';

interface WinnersListProps {
    winners: DrawWinner[];
    drawId: string;
    canMarkActions?: boolean; // Permite marcar como notificado/reclamado
}

export function WinnersList({ winners, drawId, canMarkActions = false }: WinnersListProps) {
    const { colors } = useTheme();
    const alert = useAlert();
    const router = useRouter();
    const { markWinnerNotified, markPrizeClaimed } = useDrawStore();

    if (winners.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="trophy-outline" size={64} color={colors.text.tertiary} />
                <Text style={[styles.emptyText, { color: colors.text.secondary }]}>No hay ganadores registrados</Text>
            </View>
        );
    }

    const handleViewCustomer = (customerId: string) => {
        router.push(`/customer/${customerId}`);
    };

    const handleViewClub = (clubId: string) => {
        router.push(`/club/${clubId}`);
    };

    const handleMarkNotified = async (clubId: string, customerName: string) => {
        alert.showConfirm(
            'Marcar como Notificado',
            `¿Confirmas que ${customerName} ha sido notificado de su premio?`,
            async () => {
                try {
                    await markWinnerNotified(drawId, clubId);
                    alert.showSuccess('Éxito', 'Ganador marcado como notificado');
                } catch (error: any) {
                    alert.showError('Error', error.message);
                }
            },
            undefined,
            'Confirmar',
            'Cancelar'
        );
    };

    const handleMarkClaimed = async (clubId: string, customerName: string) => {
        alert.showConfirm(
            'Marcar Premio Reclamado',
            `¿Confirmas que ${customerName} ha reclamado su premio?`,
            async () => {
                try {
                    await markPrizeClaimed(drawId, clubId);
                    alert.showSuccess('Éxito', 'Premio marcado como reclamado');
                } catch (error: any) {
                    alert.showError('Error', error.message);
                }
            },
            undefined,
            'Confirmar',
            'Cancelar'
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="trophy" size={24} color={colors.accent.gold} />
                <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
                    {winners.length} {winners.length === 1 ? 'Ganador' : 'Ganadores'}
                </Text>
            </View>

            {winners.map((winner, index) => (
                <View key={winner.clubId} style={[styles.winnerCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                    <View style={styles.winnerHeader}>
                        <View style={[styles.rankBadge, { backgroundColor: colors.accent.gold }]}>
                            <Text style={[styles.rankText, { color: colors.white }]}>#{index + 1}</Text>
                        </View>
                        <View style={styles.winnerInfo}>
                            <TouchableOpacity onPress={() => handleViewCustomer(winner.customerId)}>
                                <Text style={[styles.winnerName, { color: colors.text.primary }]}>{winner.customerName}</Text>
                            </TouchableOpacity>
                            <Text style={[styles.contractNumber, { color: colors.text.secondary }]}>
                                Contrato: {winner.contractNumber}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.winnerDetails}>
                        <View style={styles.detailRow}>
                            <Ionicons name="shield" size={16} color={colors.accent.blue} />
                            <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>Número de Acción:</Text>
                            <View style={[styles.shareBadge, { backgroundColor: colors.accent.blue }]}>
                                <Text style={[styles.shareText, { color: colors.white }]}>{winner.share}</Text>
                            </View>
                        </View>

                        <View style={styles.detailRow}>
                            <Ionicons name="cash" size={16} color={colors.accent.green} />
                            <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>Premio:</Text>
                            <Text style={[styles.prizeAmount, { color: colors.accent.green }]}>
                                ${winner.prizeAmount.toFixed(2)}
                            </Text>
                        </View>

                        {winner.denominationValue && (
                            <View style={styles.detailRow}>
                                <Ionicons name="ticket" size={16} color={colors.accent.purple} />
                                <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>Denominación:</Text>
                                <Text style={[styles.detailValue, { color: colors.text.primary }]}>
                                    ${winner.denominationValue.toFixed(2)}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.statusContainer}>
                        <View
                            style={[
                                styles.statusChip,
                                { backgroundColor: winner.notified ? colors.status.successText + '20' : colors.status.warningText + '20' },
                            ]}
                        >
                            <Ionicons
                                name={winner.notified ? 'checkmark-circle' : 'time'}
                                size={14}
                                color={winner.notified ? colors.status.successText : colors.status.warningText}
                            />
                            <Text
                                style={[
                                    styles.statusChipText,
                                    { color: winner.notified ? colors.status.successText : colors.status.warningText },
                                ]}
                            >
                                {winner.notified ? 'Notificado' : 'Sin Notificar'}
                            </Text>
                        </View>

                        <View
                            style={[
                                styles.statusChip,
                                { backgroundColor: winner.claimed ? colors.status.successText + '20' : colors.status.warningText + '20' },
                            ]}
                        >
                            <Ionicons
                                name={winner.claimed ? 'gift' : 'gift-outline'}
                                size={14}
                                color={winner.claimed ? colors.status.successText : colors.status.warningText}
                            />
                            <Text
                                style={[
                                    styles.statusChipText,
                                    { color: winner.claimed ? colors.status.successText : colors.status.warningText },
                                ]}
                            >
                                {winner.claimed ? 'Reclamado' : 'Pendiente'}
                            </Text>
                        </View>
                    </View>

                    {canMarkActions && (
                        <View style={styles.actionsContainer}>
                            {!winner.notified && (
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: colors.accent.blue }]}
                                    onPress={() => handleMarkNotified(winner.clubId, winner.customerName)}
                                >
                                    <Ionicons name="mail" size={16} color={colors.white} />
                                    <Text style={[styles.actionButtonText, { color: colors.white }]}>Marcar Notificado</Text>
                                </TouchableOpacity>
                            )}

                            {!winner.claimed && winner.notified && (
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: colors.accent.green }]}
                                    onPress={() => handleMarkClaimed(winner.clubId, winner.customerName)}
                                >
                                    <Ionicons name="checkmark" size={16} color={colors.white} />
                                    <Text style={[styles.actionButtonText, { color: colors.white }]}>Marcar Reclamado</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: colors.bg.secondary, borderWidth: 1, borderColor: colors.accent.blue }]}
                                onPress={() => handleViewClub(winner.clubId)}
                            >
                                <Ionicons name="eye" size={16} color={colors.accent.blue} />
                                <Text style={[styles.actionButtonText, { color: colors.accent.blue }]}>
                                    Ver Club
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {winner.claimDate && (
                        <View style={styles.claimDateContainer}>
                            <Ionicons name="calendar" size={12} color={colors.text.tertiary} />
                            <Text style={[styles.claimDateText, { color: colors.text.tertiary }]}>
                                Reclamado: {new Date(winner.claimDate).toLocaleDateString('es-PA')}
                            </Text>
                        </View>
                    )}
                </View>
            ))}
            <CustomAlert
                visible={alert.visible}
                type={alert.config.type}
                title={alert.config.title}
                message={alert.config.message}
                buttons={alert.config.buttons}
                onDismiss={alert.hide}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    winnerCard: {
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        gap: 12,
    },
    winnerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    rankBadge: {
        borderRadius: 20,
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    winnerInfo: {
        flex: 1,
    },
    winnerName: {
        fontSize: 16,
        fontWeight: '600',
    },
    contractNumber: {
        fontSize: 12,
        marginTop: 2,
    },
    winnerDetails: {
        gap: 8,
        paddingLeft: 44,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailLabel: {
        fontSize: 14,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    shareBadge: {
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    shareText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    prizeAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    statusContainer: {
        flexDirection: 'row',
        gap: 8,
        paddingLeft: 44,
    },
    statusChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusChipText: {
        fontSize: 12,
        fontWeight: '600',
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: 8,
        paddingLeft: 44,
        flexWrap: 'wrap',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
    claimDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingLeft: 44,
    },
    claimDateText: {
        fontSize: 11,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
});
