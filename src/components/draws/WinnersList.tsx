// src/components/draws/WinnersList.tsx
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/colors';
import type { DrawWinner } from '../../types/clubs';
import { useDrawStore } from '../../stores/draw-store';

interface WinnersListProps {
    winners: DrawWinner[];
    drawId: string;
    canMarkActions?: boolean; // Permite marcar como notificado/reclamado
}

export function WinnersList({ winners, drawId, canMarkActions = false }: WinnersListProps) {
    const router = useRouter();
    const { markWinnerNotified, markPrizeClaimed } = useDrawStore();

    if (winners.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="trophy-outline" size={64} color={COLORS.text.tertiary} />
                <Text style={styles.emptyText}>No hay ganadores registrados</Text>
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
        Alert.alert(
            'Marcar como Notificado',
            `¿Confirmas que ${customerName} ha sido notificado de su premio?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        try {
                            await markWinnerNotified(drawId, clubId);
                            Alert.alert('Éxito', 'Ganador marcado como notificado');
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        }
                    },
                },
            ]
        );
    };

    const handleMarkClaimed = async (clubId: string, customerName: string) => {
        Alert.alert(
            'Marcar Premio Reclamado',
            `¿Confirmas que ${customerName} ha reclamado su premio?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        try {
                            await markPrizeClaimed(drawId, clubId);
                            Alert.alert('Éxito', 'Premio marcado como reclamado');
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="trophy" size={24} color={COLORS.accent.gold} />
                <Text style={styles.headerTitle}>
                    {winners.length} {winners.length === 1 ? 'Ganador' : 'Ganadores'}
                </Text>
            </View>

            {winners.map((winner, index) => (
                <View key={winner.clubId} style={styles.winnerCard}>
                    <View style={styles.winnerHeader}>
                        <View style={styles.rankBadge}>
                            <Text style={styles.rankText}>#{index + 1}</Text>
                        </View>
                        <View style={styles.winnerInfo}>
                            <TouchableOpacity onPress={() => handleViewCustomer(winner.customerId)}>
                                <Text style={styles.winnerName}>{winner.customerName}</Text>
                            </TouchableOpacity>
                            <Text style={styles.contractNumber}>
                                Contrato: {winner.contractNumber}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.winnerDetails}>
                        <View style={styles.detailRow}>
                            <Ionicons name="shield" size={16} color={COLORS.accent.blue} />
                            <Text style={styles.detailLabel}>Número de Acción:</Text>
                            <View style={styles.shareBadge}>
                                <Text style={styles.shareText}>{winner.share}</Text>
                            </View>
                        </View>

                        <View style={styles.detailRow}>
                            <Ionicons name="cash" size={16} color={COLORS.accent.green} />
                            <Text style={styles.detailLabel}>Premio:</Text>
                            <Text style={styles.prizeAmount}>
                                ${winner.prizeAmount.toFixed(2)}
                            </Text>
                        </View>

                        {winner.denominationValue && (
                            <View style={styles.detailRow}>
                                <Ionicons name="ticket" size={16} color={COLORS.accent.purple} />
                                <Text style={styles.detailLabel}>Denominación:</Text>
                                <Text style={styles.detailValue}>
                                    ${winner.denominationValue.toFixed(2)}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.statusContainer}>
                        <View
                            style={[
                                styles.statusChip,
                                winner.notified
                                    ? styles.statusChipSuccess
                                    : styles.statusChipPending,
                            ]}
                        >
                            <Ionicons
                                name={winner.notified ? 'checkmark-circle' : 'time'}
                                size={14}
                                color={winner.notified ? COLORS.status.successText : COLORS.status.warningText}
                            />
                            <Text
                                style={[
                                    styles.statusChipText,
                                    winner.notified
                                        ? { color: COLORS.status.successText }
                                        : { color: COLORS.status.warningText },
                                ]}
                            >
                                {winner.notified ? 'Notificado' : 'Sin Notificar'}
                            </Text>
                        </View>

                        <View
                            style={[
                                styles.statusChip,
                                winner.claimed
                                    ? styles.statusChipSuccess
                                    : styles.statusChipPending,
                            ]}
                        >
                            <Ionicons
                                name={winner.claimed ? 'gift' : 'gift-outline'}
                                size={14}
                                color={winner.claimed ? COLORS.status.successText : COLORS.status.warningText}
                            />
                            <Text
                                style={[
                                    styles.statusChipText,
                                    winner.claimed
                                        ? { color: COLORS.status.successText }
                                        : { color: COLORS.status.warningText },
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
                                    style={[styles.actionButton, styles.notifyButton]}
                                    onPress={() => handleMarkNotified(winner.clubId, winner.customerName)}
                                >
                                    <Ionicons name="mail" size={16} color={COLORS.white} />
                                    <Text style={styles.actionButtonText}>Marcar Notificado</Text>
                                </TouchableOpacity>
                            )}

                            {!winner.claimed && winner.notified && (
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.claimButton]}
                                    onPress={() => handleMarkClaimed(winner.clubId, winner.customerName)}
                                >
                                    <Ionicons name="checkmark" size={16} color={COLORS.white} />
                                    <Text style={styles.actionButtonText}>Marcar Reclamado</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={[styles.actionButton, styles.viewButton]}
                                onPress={() => handleViewClub(winner.clubId)}
                            >
                                <Ionicons name="eye" size={16} color={COLORS.accent.blue} />
                                <Text style={[styles.actionButtonText, { color: COLORS.accent.blue }]}>
                                    Ver Club
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {winner.claimDate && (
                        <View style={styles.claimDateContainer}>
                            <Ionicons name="calendar" size={12} color={COLORS.text.tertiary} />
                            <Text style={styles.claimDateText}>
                                Reclamado: {new Date(winner.claimDate).toLocaleDateString('es-PA')}
                            </Text>
                        </View>
                    )}
                </View>
            ))}
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
        color: COLORS.text.primary,
    },
    winnerCard: {
        backgroundColor: COLORS.bg.card,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: 12,
    },
    winnerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    rankBadge: {
        backgroundColor: COLORS.accent.gold,
        borderRadius: 20,
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    winnerInfo: {
        flex: 1,
    },
    winnerName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    contractNumber: {
        fontSize: 12,
        color: COLORS.text.secondary,
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
        color: COLORS.text.secondary,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.text.primary,
    },
    shareBadge: {
        backgroundColor: COLORS.accent.blue,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    shareText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    prizeAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.accent.green,
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
    statusChipSuccess: {
        backgroundColor: `${COLORS.status.successText}20`,
    },
    statusChipPending: {
        backgroundColor: `${COLORS.status.warningText}20`,
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
    notifyButton: {
        backgroundColor: COLORS.accent.blue,
    },
    claimButton: {
        backgroundColor: COLORS.accent.green,
    },
    viewButton: {
        backgroundColor: COLORS.bg.secondary,
        borderWidth: 1,
        borderColor: COLORS.accent.blue,
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.white,
    },
    claimDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingLeft: 44,
    },
    claimDateText: {
        fontSize: 11,
        color: COLORS.text.tertiary,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.text.secondary,
        textAlign: 'center',
    },
});
