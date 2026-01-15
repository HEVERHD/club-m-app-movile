// app/draw/execute.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDrawStore } from '../../src/stores/draw-store';
import { clubApi } from '../../src/api/clubs.api';
import { COLORS } from '../../src/constants/colors';
import { CustomAlert } from '../../src/components/ui/CustomAlert';
import { useAlert } from '../../src/hooks/useAlert';
import type { ClubType } from '../../src/types/clubs';

export default function ExecuteDrawScreen() {
    const router = useRouter();
    const { executeDraw } = useDrawStore();
    const alert = useAlert();

    const [clubTypes, setClubTypes] = useState<ClubType[]>([]);
    const [selectedClubTypeId, setSelectedClubTypeId] = useState<string>('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [isLoadingTypes, setIsLoadingTypes] = useState(true);
    const [winningNumber, setWinningNumber] = useState<string>('');

    useEffect(() => {
        loadClubTypes();
    }, []);

    const loadClubTypes = async () => {
        try {
            setIsLoadingTypes(true);
            const types = await clubApi.getClubTypes();
            setClubTypes(types.filter(t => t.active));

            // Auto-seleccionar el primero si existe
            if (types.length > 0 && types[0].active) {
                setSelectedClubTypeId(types[0].clubTypeId);
            }
        } catch (error: any) {
            alert.showError('Error', 'No se pudieron cargar los tipos de club');
            console.error(error);
        } finally {
            setIsLoadingTypes(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    const handleExecute = async () => {
        // Validaciones
        if (!selectedClubTypeId) {
            alert.showError('Error', 'Debes seleccionar un tipo de club');
            return;
        }

        // Validar número ganador
        const number = parseInt(winningNumber);
        if (!winningNumber || isNaN(number)) {
            alert.showError('Error', 'Debes ingresar el número ganador');
            return;
        }
        if (number < 0 || number > 99) {
            alert.showError('Error', 'El número debe estar entre 0 y 99');
            return;
        }

        // Confirmar ejecución
        const selectedType = clubTypes.find(t => t.clubTypeId === selectedClubTypeId);
        const confirmMessage = `¿Estás seguro de que deseas ejecutar el sorteo para ${selectedType?.name || 'este tipo de club'}?\n\nNúmero ganador: ${winningNumber}`;

        alert.showConfirm(
            'Confirmar Sorteo',
            confirmMessage,
            async () => {
                        try {
                            setIsExecuting(true);

                            console.log('🎯 ANTES DE EJECUTAR - winningNumber:', winningNumber);
                            console.log('🎯 ANTES DE EJECUTAR - clubTypeId:', selectedClubTypeId);

                            const draw = await executeDraw({
                                clubTypeId: selectedClubTypeId,
                                manualNumber: parseInt(winningNumber),
                            });

                            console.log('🎯 DESPUÉS DE executeDraw - draw completo:', JSON.stringify(draw, null, 2));
                            console.log('🎯 DESPUÉS DE executeDraw - draw.numberPlayed:', draw.numberPlayed);
                            console.log('🎯 DESPUÉS DE executeDraw - typeof draw.numberPlayed:', typeof draw.numberPlayed);
                            console.log('🎯 DESPUÉS DE executeDraw - draw.drawId:', draw.drawId);
                            console.log('🎯 DESPUÉS DE executeDraw - draw.status:', draw.status);

                            const successMessage = `El sorteo se ha ejecutado exitosamente.\n\nNúmero ganador: ${draw.numberPlayed}${draw.totalWinners ? `\nGanadores: ${draw.totalWinners}` : ''}`;
                            console.log('🎯 MENSAJE DEL ALERT:', successMessage);

                            alert.show(
                                'Sorteo Ejecutado',
                                successMessage,
                                [
                                    {
                                        text: 'Volver a Sorteos',
                                        style: 'cancel',
                                        onPress: () => router.back(),
                                    },
                                    {
                                        text: 'Ver Detalles',
                                        onPress: () => router.replace(`/draw/${draw.drawId}`),
                                    },
                                ],
                                'success'
                            );
                        } catch (error: any) {
                            alert.showError(
                                'Error al Ejecutar Sorteo',
                                error.message || 'Ocurrió un error inesperado'
                            );
                        } finally {
                            setIsExecuting(false);
                        }
            },
            undefined,
            'Ejecutar',
            'Cancelar'
        );
    };

    const formatDateForDisplay = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-PA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (isLoadingTypes) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.accent.blue} />
                <Text style={styles.loadingText}>Cargando tipos de club...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ejecutar Sorteo</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Información */}
                <View style={styles.infoCard}>
                    <View style={styles.infoHeader}>
                        <Ionicons name="information-circle" size={24} color={COLORS.accent.blue} />
                        <Text style={styles.infoTitle}>Importante</Text>
                    </View>
                    <Text style={styles.infoText}>
                        Ingresa el número ganador del sorteo (0-99). El sistema buscará todos los clubes que tengan ese número de acción asignado.
                    </Text>
                </View>

                {/* Formulario */}
                <View style={styles.formCard}>
                    {/* Tipo de Club */}
                    <View style={styles.formSection}>
                        <Text style={styles.formLabel}>
                            Tipo de Club <Text style={styles.required}>*</Text>
                        </Text>
                        <Text style={styles.formHint}>
                            Selecciona el tipo de club para el sorteo
                        </Text>

                        <View style={styles.clubTypesList}>
                            {clubTypes.map((type) => (
                                <TouchableOpacity
                                    key={type.clubTypeId}
                                    style={[
                                        styles.clubTypeCard,
                                        selectedClubTypeId === type.clubTypeId &&
                                            styles.clubTypeCardSelected,
                                    ]}
                                    onPress={() => setSelectedClubTypeId(type.clubTypeId)}
                                >
                                    <View style={styles.clubTypeHeader}>
                                        <View style={styles.clubTypeIcon}>
                                            <Ionicons
                                                name={
                                                    selectedClubTypeId === type.clubTypeId
                                                        ? 'radio-button-on'
                                                        : 'radio-button-off'
                                                }
                                                size={24}
                                                color={
                                                    selectedClubTypeId === type.clubTypeId
                                                        ? COLORS.accent.blue
                                                        : COLORS.text.tertiary
                                                }
                                            />
                                        </View>
                                        <View style={styles.clubTypeInfo}>
                                            <Text style={styles.clubTypeName}>{type.name}</Text>
                                            {type.description && (
                                                <Text style={styles.clubTypeDescription}>
                                                    {type.description}
                                                </Text>
                                            )}
                                            {type.drawDay && (
                                                <View style={styles.clubTypeDetail}>
                                                    <Ionicons
                                                        name="calendar"
                                                        size={14}
                                                        color={COLORS.text.tertiary}
                                                    />
                                                    <Text style={styles.clubTypeDetailText}>
                                                        Día de sorteo: {type.drawDay}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {clubTypes.length === 0 && (
                            <View style={styles.emptyTypes}>
                                <Ionicons name="alert-circle" size={32} color={COLORS.text.muted} />
                                <Text style={styles.emptyTypesText}>
                                    No hay tipos de club disponibles
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Número Ganador */}
                    <View style={styles.formSection}>
                        <Text style={styles.formLabel}>
                            Número Ganador <Text style={styles.required}>*</Text>
                        </Text>
                        <Text style={styles.formHint}>
                            Ingresa el número ganador del sorteo (0-99)
                        </Text>

                        <TextInput
                            style={styles.numberInput}
                            placeholder="Ej: 42"
                            placeholderTextColor={COLORS.text.muted}
                            value={winningNumber}
                            onChangeText={(text) => {
                                // Solo permitir números
                                const cleaned = text.replace(/[^0-9]/g, '');
                                // Limitar a 2 dígitos
                                if (cleaned.length <= 2) {
                                    setWinningNumber(cleaned);
                                }
                            }}
                            keyboardType="number-pad"
                            maxLength={2}
                        />
                    </View>
                </View>

                {/* Resumen */}
                {selectedClubTypeId && winningNumber && (
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>Resumen</Text>

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tipo de Club:</Text>
                            <Text style={styles.summaryValue}>
                                {clubTypes.find(t => t.clubTypeId === selectedClubTypeId)?.name}
                            </Text>
                        </View>

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Número Ganador:</Text>
                            <Text style={styles.summaryValue}>
                                {winningNumber}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Botón de Ejecutar */}
                <TouchableOpacity
                    style={[
                        styles.executeButton,
                        (!selectedClubTypeId || isExecuting) && styles.executeButtonDisabled,
                    ]}
                    onPress={handleExecute}
                    disabled={!selectedClubTypeId || isExecuting}
                >
                    {isExecuting ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                        <>
                            <Ionicons name="dice" size={24} color={COLORS.white} />
                            <Text style={styles.executeButtonText}>Ejecutar Sorteo</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>

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
    container: {
        flex: 1,
        backgroundColor: COLORS.bg.primary,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 56,
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: COLORS.bg.card,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.default,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: COLORS.bg.elevated,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text.primary,
    },

    // Loading
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.bg.primary,
        gap: 16,
    },
    loadingText: {
        fontSize: 17,
        color: COLORS.text.primary,
        fontWeight: '600',
    },

    // Content
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },

    // Info Card
    infoCard: {
        backgroundColor: COLORS.status.infoBg,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        gap: 12,
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.accent.blue,
    },
    infoText: {
        fontSize: 15,
        color: COLORS.text.primary,
        lineHeight: 22,
        fontWeight: '500',
    },

    // Form Card
    formCard: {
        backgroundColor: COLORS.bg.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: 24,
    },
    formSection: {
        gap: 8,
    },
    formLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text.primary,
    },
    required: {
        color: COLORS.status.error,
        fontWeight: '700',
    },
    formHint: {
        fontSize: 14,
        color: COLORS.text.secondary,
        marginBottom: 8,
        fontWeight: '500',
        lineHeight: 20,
    },

    // Club Types
    clubTypesList: {
        gap: 12,
    },
    clubTypeCard: {
        backgroundColor: COLORS.bg.elevated,
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
        borderColor: COLORS.border.default,
    },
    clubTypeCardSelected: {
        borderColor: COLORS.accent.blue,
        backgroundColor: `${COLORS.accent.blue}10`,
    },
    clubTypeHeader: {
        flexDirection: 'row',
        gap: 12,
    },
    clubTypeIcon: {
        paddingTop: 2,
    },
    clubTypeInfo: {
        flex: 1,
        gap: 4,
    },
    clubTypeName: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.text.primary,
    },
    clubTypeDescription: {
        fontSize: 14,
        color: COLORS.text.secondary,
        lineHeight: 20,
        fontWeight: '500',
    },
    clubTypeDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    clubTypeDetailText: {
        fontSize: 13,
        color: COLORS.text.secondary,
        fontWeight: '500',
    },
    emptyTypes: {
        alignItems: 'center',
        padding: 40,
        gap: 12,
    },
    emptyTypesText: {
        fontSize: 15,
        color: COLORS.text.secondary,
        fontWeight: '600',
    },

    // Date
    dateDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: COLORS.bg.elevated,
        borderRadius: 12,
        padding: 16,
    },
    dateText: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text.primary,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    dateSubtext: {
        fontSize: 13,
        color: COLORS.text.secondary,
        marginTop: 4,
        fontWeight: '500',
    },

    // Time Picker
    timePickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: COLORS.bg.elevated,
        borderRadius: 12,
        padding: 16,
        justifyContent: 'center',
    },
    timeInputWrapper: {
        alignItems: 'center',
        gap: 6,
    },
    timeInputLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.text.secondary,
        letterSpacing: 0.5,
    },
    timeInput: {
        backgroundColor: COLORS.bg.card,
        borderRadius: 8,
        width: 60,
        height: 60,
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text.primary,
        textAlign: 'center',
        borderWidth: 2,
        borderColor: COLORS.accent.blue,
    },
    timeSeparator: {
        fontSize: 32,
        fontWeight: '700',
        color: COLORS.text.primary,
        marginTop: 20,
    },
    periodSelector: {
        flexDirection: 'column',
        gap: 8,
        marginLeft: 8,
    },
    periodButton: {
        backgroundColor: COLORS.bg.card,
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderWidth: 2,
        borderColor: COLORS.border.default,
        minWidth: 50,
        alignItems: 'center',
    },
    periodButtonActive: {
        backgroundColor: COLORS.accent.blue,
        borderColor: COLORS.accent.blue,
    },
    periodText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text.secondary,
    },
    periodTextActive: {
        color: COLORS.white,
    },

    // Number Input
    numberInput: {
        backgroundColor: COLORS.bg.elevated,
        borderRadius: 12,
        padding: 16,
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.text.primary,
        textAlign: 'center',
        borderWidth: 2,
        borderColor: COLORS.accent.blue,
    },

    // Notes
    notesInput: {
        backgroundColor: COLORS.bg.elevated,
        borderRadius: 12,
        padding: 16,
        fontSize: 15,
        color: COLORS.text.primary,
        minHeight: 100,
    },
    charCount: {
        fontSize: 13,
        color: COLORS.text.secondary,
        textAlign: 'right',
        marginTop: 4,
        fontWeight: '500',
    },

    // Summary Card
    summaryCard: {
        backgroundColor: COLORS.bg.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: 12,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text.primary,
        marginBottom: 8,
    },
    summaryRow: {
        gap: 4,
    },
    summaryLabel: {
        fontSize: 14,
        color: COLORS.text.secondary,
        fontWeight: '600',
    },
    summaryValue: {
        fontSize: 16,
        color: COLORS.text.primary,
        fontWeight: '600',
    },

    // Execute Button
    executeButton: {
        backgroundColor: COLORS.accent.blue,
        borderRadius: 12,
        padding: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    executeButtonDisabled: {
        backgroundColor: COLORS.text.muted,
        opacity: 0.6,
    },
    executeButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.white,
        letterSpacing: 0.5,
    },
});
