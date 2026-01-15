// app/club/[id].tsx - Pantalla de detalle del club con pagos y consumo
import { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/constants/colors';
import { usePaymentStore } from '../../src/stores/payment-store';
import { WeekSelector } from '../../src/components/payments/WeekSelector';
import { PaymentSummary } from '../../src/components/payments/PaymentSummary';
import { CustomAlert } from '../../src/components/ui/CustomAlert';
import { useAlert } from '../../src/hooks/useAlert';

export default function ClubDetailScreen() {
    const { id, clubData } = useLocalSearchParams<{ id: string; clubData?: string }>();
    const alert = useAlert();

    const {
        clubDetail,
        isLoadingDetail,
        detailError,
        selectedWeeks,
        isProcessingPayment,
        paymentSuccess,
        paymentError,
        lastPaymentResult,
        isCancelling,
        cancelError,
        fetchClubDetail,
        setClubDetailFromCache,
        toggleWeekSelection,
        selectAllUnpaidWeeks,
        clearSelection,
        processPayment,
        cancelClub,
        getSelectedAmount,
        reset,
    } = usePaymentStore();

    useEffect(() => {
        if (clubData) {
            // Si recibimos datos del club a través de la navegación, usarlos directamente
            try {
                const parsedClub = JSON.parse(clubData);
                setClubDetailFromCache(parsedClub);
            } catch (error) {
                console.error('Error parsing club data:', error);
                // Fallback a fetch si hay error
                if (id) {
                    fetchClubDetail(id);
                }
            }
        } else if (id) {
            // Fallback: si no hay datos pasados, hacer fetch normal
            fetchClubDetail(id);
        }
        return () => reset();
    }, [id, clubData]);

    useEffect(() => {
        if (paymentSuccess && lastPaymentResult) {
            alert.showSuccess(
                'Pago Exitoso',
                `Se registraron ${lastPaymentResult.weeksCount} semana(s)\nMonto: $${lastPaymentResult.amount.toFixed(2)}`
            );
        }
    }, [paymentSuccess]);

    useEffect(() => {
        if (paymentError) {
            alert.showError('Error', paymentError);
        }
    }, [paymentError]);

    useEffect(() => {
        if (cancelError) {
            alert.showError('Error', cancelError);
        }
    }, [cancelError]);

    const handlePayment = async () => {
        if (selectedWeeks.length === 0) {
            alert.showWarning('Atención', 'Selecciona al menos una semana para pagar');
            return;
        }

        alert.showConfirm(
            'Confirmar Pago',
            `¿Deseas pagar ${selectedWeeks.length} semana(s) por $${getSelectedAmount().toFixed(2)}?`,
            () => processPayment(id!),
            undefined,
            'Confirmar',
            'Cancelar'
        );
    };

    const handleCancelClub = () => {
        if (clubDetail?.statusName?.toLowerCase() === 'cancelado') {
            alert.showWarning('Aviso', 'Este club ya está cancelado');
            return;
        }

        alert.showConfirm(
            'Cancelar Club',
            `¿Estás seguro de que deseas cancelar el club #${clubDetail?.contractNumber}?\n\nEsta acción no se puede deshacer.`,
            async () => {
                const success = await cancelClub(id!);
                if (success) {
                    alert.showSuccess(
                        'Club Cancelado',
                        'El club ha sido cancelado exitosamente',
                        () => router.back()
                    );
                }
            },
            undefined,
            'Sí, Cancelar',
            'No'
        );
    };

    // Navegar a la pantalla de consumo de saldo
    const handleExchange = () => {
        router.push({
            pathname: '/club/exchange',
            params: { customerId: clubDetail?.customerIdentification || '' }
        });
    };

    if (isLoadingDetail) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.accent.blue} />
                <Text style={styles.loadingText}>Cargando club...</Text>
            </View>
        );
    }

    if (detailError || !clubDetail) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color={COLORS.status.error} />
                <Text style={styles.errorText}>{detailError || 'Club no encontrado'}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={() => fetchClubDetail(id!)}>
                    <Text style={styles.retryText}>Reintentar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const unpaidWeeks = clubDetail.weeks.filter(w => w.status !== 'paid');
    const progress = (clubDetail.weeksPaid / clubDetail.weeksTotal) * 100;
    const hasBalance = clubDetail.balance > 0;
    const isActive = clubDetail.statusName?.toLowerCase() !== 'cancelado';

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>Club #{clubDetail.contractNumber}</Text>
                    <Text style={styles.headerSubtitle}>{clubDetail.customerName}</Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={styles.cancelClubBtn}
                        onPress={handleCancelClub}
                        disabled={isCancelling || !isActive}
                    >
                        {isCancelling ? (
                            <ActivityIndicator size="small" color={COLORS.status.error} />
                        ) : (
                            <Ionicons name="close-circle-outline" size={22} color={isActive ? COLORS.status.error : COLORS.text.muted} />
                        )}
                    </TouchableOpacity>
                    <View style={[
                        styles.statusBadge,
                        isActive && styles.statusActive,
                        !isActive && styles.statusCancelled
                    ]}>
                        <Text style={[styles.statusText, !isActive && styles.statusTextCancelled]}>
                            {clubDetail.statusName}
                        </Text>
                    </View>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Club Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Número</Text>
                            <Text style={styles.infoValue}>{clubDetail.share}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Denominación</Text>
                            <Text style={styles.infoValue}>${clubDetail.denomination.toFixed(2)}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Tipo</Text>
                            <Text style={styles.infoValue}>{clubDetail.clubTypeName}</Text>
                        </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressSection}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Progreso</Text>
                            <Text style={styles.progressValue}>
                                {clubDetail.weeksPaid} / {clubDetail.weeksTotal} semanas
                            </Text>
                        </View>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${progress}%` }]} />
                        </View>
                    </View>

                    {/* Balance with Exchange Button */}
                    <View style={styles.balanceSection}>
                        <View>
                            <Text style={styles.balanceLabel}>Balance Disponible</Text>
                            <Text style={[styles.balanceValue, clubDetail.balance < 0 && styles.balanceNegative]}>
                                ${Math.abs(clubDetail.balance).toFixed(2)}
                            </Text>
                        </View>

                        {/* Botón de Usar Saldo */}
                        {hasBalance && isActive && (
                            <TouchableOpacity
                                style={styles.exchangeBtn}
                                onPress={handleExchange}
                            >
                                <Ionicons name="cart" size={18} color={COLORS.white} />
                                <Text style={styles.exchangeBtnText}>Usar Saldo</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Quick Actions */}
                {isActive && (
                    <View style={styles.quickActions}>
                        <TouchableOpacity
                            style={styles.quickActionBtn}
                            onPress={() => router.push(`/club/transactions?id=${id}`)}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: COLORS.accent.purple + '20' }]}>
                                <Ionicons name="list" size={20} color={COLORS.accent.purple} />
                            </View>
                            <Text style={styles.quickActionText}>Transacciones</Text>
                        </TouchableOpacity>

                        {hasBalance && (
                            <TouchableOpacity
                                style={styles.quickActionBtn}
                                onPress={handleExchange}
                            >
                                <View style={[styles.quickActionIcon, { backgroundColor: COLORS.status.success + '20' }]}>
                                    <Ionicons name="wallet" size={20} color={COLORS.status.success} />
                                </View>
                                <Text style={styles.quickActionText}>Consumir</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.quickActionBtn}
                            onPress={() => {/* Imprimir estado de cuenta */ }}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: COLORS.accent.blue + '20' }]}>
                                <Ionicons name="document-text" size={20} color={COLORS.accent.blue} />
                            </View>
                            <Text style={styles.quickActionText}>Estado Cta.</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Week Selector */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Semanas</Text>
                    <View style={styles.sectionActions}>
                        {selectedWeeks.length > 0 && (
                            <TouchableOpacity style={styles.clearBtn} onPress={clearSelection}>
                                <Text style={styles.clearBtnText}>Limpiar</Text>
                            </TouchableOpacity>
                        )}
                        {unpaidWeeks.length > 0 && isActive && (
                            <TouchableOpacity style={styles.selectAllBtn} onPress={selectAllUnpaidWeeks}>
                                <Text style={styles.selectAllText}>Seleccionar todas</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <WeekSelector
                    weeks={clubDetail.weeks}
                    selectedWeeks={selectedWeeks}
                    onToggleWeek={toggleWeekSelection}
                    denomination={clubDetail.denomination}
                />

                {/* Spacer for bottom bar */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Payment Summary - Fixed Bottom */}
            {selectedWeeks.length > 0 && isActive && (
                <PaymentSummary
                    selectedCount={selectedWeeks.length}
                    totalAmount={getSelectedAmount()}
                    isProcessing={isProcessingPayment}
                    onPay={handlePayment}
                    onCancel={clearSelection}
                />
            )}

            {/* Custom Alert */}
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
    container: { flex: 1, backgroundColor: COLORS.bg.primary },

    // Loading & Error
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg.primary },
    loadingText: { marginTop: 12, fontSize: 14, color: COLORS.text.secondary },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg.primary, padding: 20 },
    errorText: { marginTop: 12, fontSize: 14, color: COLORS.text.secondary, textAlign: 'center' },
    retryBtn: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: COLORS.accent.blue, borderRadius: 8 },
    retryText: { color: COLORS.white, fontWeight: '600' },

    // Header
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16, backgroundColor: COLORS.bg.card, borderBottomWidth: 1, borderBottomColor: COLORS.border.default },
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerInfo: { flex: 1, marginLeft: 8 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text.primary },
    headerSubtitle: { fontSize: 13, color: COLORS.text.secondary, marginTop: 2 },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    cancelClubBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.status.errorBg, justifyContent: 'center', alignItems: 'center' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: COLORS.bg.elevated },
    statusActive: { backgroundColor: 'rgba(52, 199, 89, 0.15)' },
    statusCancelled: { backgroundColor: COLORS.status.errorBg },
    statusText: { fontSize: 12, fontWeight: '600', color: COLORS.status.success },
    statusTextCancelled: { color: COLORS.status.error },

    // Content
    content: { flex: 1, padding: 16 },

    // Info Card
    infoCard: { backgroundColor: COLORS.bg.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border.default },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    infoItem: { alignItems: 'center' },
    infoLabel: { fontSize: 12, color: COLORS.text.muted, marginBottom: 4 },
    infoValue: { fontSize: 16, fontWeight: '700', color: COLORS.text.primary },

    // Progress
    progressSection: { marginBottom: 16 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressLabel: { fontSize: 13, color: COLORS.text.secondary },
    progressValue: { fontSize: 13, fontWeight: '600', color: COLORS.text.primary },
    progressBar: { height: 10, backgroundColor: COLORS.bg.primary, borderRadius: 5, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border.default },
    progressFill: { height: '100%', backgroundColor: COLORS.accent.blue, borderRadius: 5, minWidth: 4 },

    // Balance
    balanceSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.border.default },
    balanceLabel: { fontSize: 14, color: COLORS.text.secondary },
    balanceValue: { fontSize: 24, fontWeight: '700', color: COLORS.status.success, marginTop: 2 },
    balanceNegative: { color: COLORS.status.error },

    // Exchange Button
    exchangeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: COLORS.status.success,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10
    },
    exchangeBtnText: { color: COLORS.white, fontWeight: '600', fontSize: 14 },

    // Quick Actions
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: COLORS.bg.card,
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border.default,
    },
    quickActionBtn: { alignItems: 'center', flex: 1 },
    quickActionIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    quickActionText: { fontSize: 11, color: COLORS.text.secondary, fontWeight: '500' },

    // Section
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text.primary },
    sectionActions: { flexDirection: 'row', gap: 8 },
    clearBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: COLORS.bg.elevated, borderRadius: 8 },
    clearBtnText: { fontSize: 12, color: COLORS.text.secondary },
    selectAllBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: COLORS.accent.blue + '20', borderRadius: 8 },
    selectAllText: { fontSize: 12, color: COLORS.accent.blue, fontWeight: '600' },
});