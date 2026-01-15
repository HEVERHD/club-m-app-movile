// app/club/exchange.tsx - Pantalla de Consumo de Saldo
import { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput,
    StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/constants/colors';
import { useExchangeStore } from '../../src/stores/exchange-store';
import { ClubExchangeCard } from '../../src/components/exchange/ClubExchangeCard';
import { ExchangeSummary } from '../../src/components/exchange/ExchangeSummary';
import { CustomAlert } from '../../src/components/ui/CustomAlert';
import { useAlert } from '../../src/hooks/useAlert';

export default function ExchangeScreen() {
    const alert = useAlert();
    // Puede recibir un monto inicial y customerId (cédula) desde otra pantalla
    const { amount: initialAmount, customerId } = useLocalSearchParams<{ amount?: string; customerId?: string }>();
    const [inputAmount, setInputAmount] = useState(initialAmount || '');

    const {
        availableClubs,
        isLoadingClubs,
        clubsError,
        amountToPay,
        selectedClubs,
        isProcessing,
        processError,
        isSuccess,
        exchangeResults,
        totalAvailable,
        totalSelected,
        canCoverAmount,
        shortage,
        fetchAvailableClubs,
        setAmountToPay,
        toggleClubSelection,
        setClubAmount,
        autoSelectClubs,
        clearSelection,
        processExchange,
        reset,
    } = useExchangeStore();

    useEffect(() => {
        // Pasar customerId (cédula) para filtrar y acelerar la búsqueda
        fetchAvailableClubs(customerId);
        return () => reset();
    }, [customerId]);

    useEffect(() => {
        if (initialAmount) {
            const num = parseFloat(initialAmount);
            if (!isNaN(num)) {
                setAmountToPay(num);
            }
        }
    }, [initialAmount]);

    useEffect(() => {
        if (processError) {
            alert.showError('Error', processError);
        }
    }, [processError]);

    useEffect(() => {
        if (isSuccess && exchangeResults) {
            const totalUsed = exchangeResults.reduce((sum, r) => sum + r.amountUsed, 0);
            const clubsUsed = exchangeResults.filter(r => r.amountUsed > 0).length;

            alert.showSuccess(
                'Consumo Exitoso',
                `Se utilizaron $${totalUsed.toFixed(2)} de ${clubsUsed} club(s)`
            );
            setTimeout(() => router.back(), 2000);
        }
    }, [isSuccess, exchangeResults]);

    const handleAmountChange = (text: string) => {
        // Solo permitir números y un punto decimal
        const cleaned = text.replace(/[^0-9.]/g, '');
        const parts = cleaned.split('.');
        const formatted = parts.length > 2
            ? parts[0] + '.' + parts.slice(1).join('')
            : cleaned;

        setInputAmount(formatted);

        const num = parseFloat(formatted);
        if (!isNaN(num)) {
            setAmountToPay(num);
        } else {
            setAmountToPay(0);
        }
    };

    const handleAutoSelect = () => {
        if (amountToPay <= 0) {
            alert.showWarning('Atención', 'Ingresa un monto a pagar primero');
            return;
        }
        autoSelectClubs();
    };

    const handleProcess = () => {
        if (selectedClubs.length === 0) {
            alert.showWarning('Atención', 'Selecciona al menos un club');
            return;
        }

        if (!canCoverAmount) {
            alert.showWarning('Atención', 'El monto seleccionado no cubre el total a pagar');
            return;
        }

        alert.showConfirm(
            'Confirmar Consumo',
            `¿Usar $${totalSelected.toFixed(2)} de ${selectedClubs.length} club(s)?`,
            () => processExchange('Consumo desde app'),
            undefined,
            'Confirmar',
            'Cancelar'
        );
    };

    // ============================================
    // RENDER
    // ============================================

    if (isLoadingClubs) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.accent.blue} />
                <Text style={styles.loadingText}>Cargando clubs...</Text>
            </View>
        );
    }

    if (clubsError) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color={COLORS.status.error} />
                <Text style={styles.errorText}>{clubsError}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={() => fetchAvailableClubs(customerId)}>
                    <Text style={styles.retryText}>Reintentar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>Consumir Saldo</Text>
                    <Text style={styles.headerSubtitle}>
                        Disponible: ${totalAvailable.toFixed(2)}
                    </Text>
                </View>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Amount Input Section */}
                <View style={styles.amountCard}>
                    <Text style={styles.amountLabel}>Monto a Pagar</Text>
                    <View style={styles.amountInputRow}>
                        <Text style={styles.currencySymbol}>$</Text>
                        <TextInput
                            style={styles.amountInput}
                            value={inputAmount}
                            onChangeText={handleAmountChange}
                            placeholder="0.00"
                            placeholderTextColor={COLORS.text.muted}
                            keyboardType="decimal-pad"
                            autoFocus={!initialAmount}
                        />
                    </View>

                    {amountToPay > 0 && (
                        <TouchableOpacity
                            style={styles.autoSelectBtn}
                            onPress={handleAutoSelect}
                        >
                            <Ionicons name="flash" size={16} color={COLORS.accent.blue} />
                            <Text style={styles.autoSelectText}>Auto-seleccionar clubs</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Available Clubs */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Clubs Disponibles</Text>
                    {selectedClubs.length > 0 && (
                        <TouchableOpacity onPress={clearSelection}>
                            <Text style={styles.clearText}>Limpiar</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {availableClubs.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="wallet-outline" size={48} color={COLORS.text.muted} />
                        <Text style={styles.emptyText}>No hay clubs con saldo disponible</Text>
                    </View>
                ) : (
                    availableClubs.map((club) => {
                        const selected = selectedClubs.find(sc => sc.club.clubId === club.clubId);
                        return (
                            <ClubExchangeCard
                                key={club.clubId}
                                club={club}
                                isSelected={!!selected}
                                amountToUse={selected?.amountToUse || 0}
                                onToggle={() => toggleClubSelection(club)}
                                onAmountChange={(amount) => setClubAmount(club.clubId, amount)}
                            />
                        );
                    })
                )}

                {/* Spacer for bottom summary */}
                <View style={{ height: 200 }} />
            </ScrollView>

            {/* Bottom Summary */}
            {(selectedClubs.length > 0 || amountToPay > 0) && (
                <ExchangeSummary
                    amountToPay={amountToPay}
                    totalSelected={totalSelected}
                    clubsCount={selectedClubs.length}
                    canCover={canCoverAmount}
                    shortage={shortage}
                    isProcessing={isProcessing}
                    onProcess={handleProcess}
                    onCancel={clearSelection}
                />
            )}
            <CustomAlert
                visible={alert.visible}
                type={alert.config.type}
                title={alert.config.title}
                message={alert.config.message}
                buttons={alert.config.buttons}
                onDismiss={alert.hide}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg.primary,
    },
    // Loading & Error
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.bg.primary,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.text.secondary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.bg.primary,
        padding: 20,
    },
    errorText: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.text.secondary,
        textAlign: 'center',
    },
    retryBtn: {
        marginTop: 20,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: COLORS.accent.blue,
        borderRadius: 8,
    },
    retryText: {
        color: COLORS.white,
        fontWeight: '600',
    },
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 56,
        paddingBottom: 16,
        backgroundColor: COLORS.bg.card,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.default,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerInfo: {
        flex: 1,
        marginLeft: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text.primary,
    },
    headerSubtitle: {
        fontSize: 13,
        color: COLORS.status.success,
        fontWeight: '600',
        marginTop: 2,
    },
    // Content
    content: {
        flex: 1,
        padding: 16,
    },
    // Amount Card
    amountCard: {
        backgroundColor: COLORS.bg.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border.default,
        alignItems: 'center',
    },
    amountLabel: {
        fontSize: 14,
        color: COLORS.text.secondary,
        marginBottom: 12,
    },
    amountInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    currencySymbol: {
        fontSize: 32,
        fontWeight: '700',
        color: COLORS.text.primary,
        marginRight: 4,
    },
    amountInput: {
        fontSize: 40,
        fontWeight: '700',
        color: COLORS.text.primary,
        minWidth: 120,
        textAlign: 'center',
    },
    autoSelectBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: COLORS.accent.blue + '15',
        borderRadius: 20,
    },
    autoSelectText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.accent.blue,
    },
    // Section
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text.primary,
    },
    clearText: {
        fontSize: 14,
        color: COLORS.accent.blue,
        fontWeight: '600',
    },
    // Empty State
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.text.muted,
        textAlign: 'center',
    },
});