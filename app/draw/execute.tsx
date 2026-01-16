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
import { useTheme } from '../../src/contexts/ThemeContext';
import { CustomAlert } from '../../src/components/ui/CustomAlert';
import { useAlert } from '../../src/hooks/useAlert';
import type { ClubType } from '../../src/types/clubs';

export default function ExecuteDrawScreen() {
    const router = useRouter();
    const { colors } = useTheme();
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

    if (isLoadingTypes) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.bg.primary }]}>
                <ActivityIndicator size="large" color={colors.accent.blue} />
                <Text style={[styles.loadingText, { color: colors.text.primary }]}>Cargando tipos de club...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.bg.primary }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.bg.card, borderBottomColor: colors.border.default }]}>
                <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.bg.elevated }]} onPress={handleBack}>
                    <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Ejecutar Sorteo</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Información */}
                <View style={[styles.infoCard, { backgroundColor: colors.status.infoBg }]}>
                    <View style={styles.infoHeader}>
                        <Ionicons name="information-circle" size={24} color={colors.accent.blue} />
                        <Text style={[styles.infoTitle, { color: colors.accent.blue }]}>Importante</Text>
                    </View>
                    <Text style={[styles.infoText, { color: colors.text.primary }]}>
                        Ingresa el número ganador del sorteo (0-99). El sistema buscará todos los clubes que tengan ese número de acción asignado.
                    </Text>
                </View>

                {/* Formulario */}
                <View style={[styles.formCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                    {/* Tipo de Club */}
                    <View style={styles.formSection}>
                        <Text style={[styles.formLabel, { color: colors.text.primary }]}>
                            Tipo de Club <Text style={[styles.required, { color: colors.status.error }]}>*</Text>
                        </Text>
                        <Text style={[styles.formHint, { color: colors.text.secondary }]}>
                            Selecciona el tipo de club para el sorteo
                        </Text>

                        <View style={styles.clubTypesList}>
                            {clubTypes.map((type) => (
                                <TouchableOpacity
                                    key={type.clubTypeId}
                                    style={[
                                        styles.clubTypeCard,
                                        { backgroundColor: colors.bg.elevated, borderColor: colors.border.default },
                                        selectedClubTypeId === type.clubTypeId && {
                                            borderColor: colors.accent.blue,
                                            backgroundColor: colors.accent.blue + '10',
                                        },
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
                                                        ? colors.accent.blue
                                                        : colors.text.tertiary
                                                }
                                            />
                                        </View>
                                        <View style={styles.clubTypeInfo}>
                                            <Text style={[styles.clubTypeName, { color: colors.text.primary }]}>{type.name}</Text>
                                            {type.description && (
                                                <Text style={[styles.clubTypeDescription, { color: colors.text.secondary }]}>
                                                    {type.description}
                                                </Text>
                                            )}
                                            {type.drawDay && (
                                                <View style={styles.clubTypeDetail}>
                                                    <Ionicons
                                                        name="calendar"
                                                        size={14}
                                                        color={colors.text.tertiary}
                                                    />
                                                    <Text style={[styles.clubTypeDetailText, { color: colors.text.secondary }]}>
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
                                <Ionicons name="alert-circle" size={32} color={colors.text.muted} />
                                <Text style={[styles.emptyTypesText, { color: colors.text.secondary }]}>
                                    No hay tipos de club disponibles
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Número Ganador */}
                    <View style={styles.formSection}>
                        <Text style={[styles.formLabel, { color: colors.text.primary }]}>
                            Número Ganador <Text style={[styles.required, { color: colors.status.error }]}>*</Text>
                        </Text>
                        <Text style={[styles.formHint, { color: colors.text.secondary }]}>
                            Ingresa el número ganador del sorteo (0-99)
                        </Text>

                        <TextInput
                            style={[styles.numberInput, { backgroundColor: colors.bg.elevated, color: colors.text.primary, borderColor: colors.accent.blue }]}
                            placeholder="Ej: 42"
                            placeholderTextColor={colors.text.muted}
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
                    <View style={[styles.summaryCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                        <Text style={[styles.summaryTitle, { color: colors.text.primary }]}>Resumen</Text>

                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: colors.text.secondary }]}>Tipo de Club:</Text>
                            <Text style={[styles.summaryValue, { color: colors.text.primary }]}>
                                {clubTypes.find(t => t.clubTypeId === selectedClubTypeId)?.name}
                            </Text>
                        </View>

                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: colors.text.secondary }]}>Número Ganador:</Text>
                            <Text style={[styles.summaryValue, { color: colors.text.primary }]}>
                                {winningNumber}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Botón de Ejecutar */}
                <TouchableOpacity
                    style={[
                        styles.executeButton,
                        { backgroundColor: colors.accent.blue },
                        (!selectedClubTypeId || isExecuting) && { backgroundColor: colors.text.muted, opacity: 0.6 },
                    ]}
                    onPress={handleExecute}
                    disabled={!selectedClubTypeId || isExecuting}
                >
                    {isExecuting ? (
                        <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                        <>
                            <Ionicons name="dice" size={24} color={colors.white} />
                            <Text style={[styles.executeButtonText, { color: colors.white }]}>Ejecutar Sorteo</Text>
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
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 56,
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },

    // Loading
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 17,
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
    },
    infoText: {
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '500',
    },

    // Form Card
    formCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        gap: 24,
    },
    formSection: {
        gap: 8,
    },
    formLabel: {
        fontSize: 16,
        fontWeight: '700',
    },
    required: {
        fontWeight: '700',
    },
    formHint: {
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '500',
        lineHeight: 20,
    },

    // Club Types
    clubTypesList: {
        gap: 12,
    },
    clubTypeCard: {
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
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
    },
    clubTypeDescription: {
        fontSize: 14,
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
        fontWeight: '500',
    },
    emptyTypes: {
        alignItems: 'center',
        padding: 40,
        gap: 12,
    },
    emptyTypesText: {
        fontSize: 15,
        fontWeight: '600',
    },

    // Number Input
    numberInput: {
        borderRadius: 12,
        padding: 16,
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        borderWidth: 2,
    },

    // Summary Card
    summaryCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        gap: 12,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    summaryRow: {
        gap: 4,
    },
    summaryLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '600',
    },

    // Execute Button
    executeButton: {
        borderRadius: 12,
        padding: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    executeButtonText: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
