// src/components/clubs/CreateClubModal.tsx
import { useEffect, useState } from 'react';
import {
    View, Text, Modal, TouchableOpacity, ScrollView, TextInput,
    ActivityIndicator, StyleSheet, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateClub, useClubTypes, useDenominations } from '../../hooks/useClubs';
import { createClubSchema, CreateClubFormData, getShareLimit } from '../../schemas/club.schema';
import { COLORS } from '../../constants/colors';
import { DEFAULT_VALUES } from '../../data/mockData';
import { CustomerSearchSelect } from './CustomerSearchSelect';
import { CustomerSearchResult } from '../../services/customerSearch';

interface Props {
    visible: boolean;
    onClose: () => void;
}

// Componente de alerta personalizada para errores específicos
function ShareLimitAlert({ share, onClose, onChangeShare }: {
    share: number;
    onClose: () => void;
    onChangeShare: () => void;
}) {
    const limit = share >= 40 ? 300 : 100;
    const range = share >= 40 ? '40-99' : '1-39';

    return (
        <View style={alertStyles.overlay}>
            <View style={alertStyles.container}>
                <View style={alertStyles.iconContainer}>
                    <Ionicons name="warning" size={48} color={COLORS.accent.orange} />
                </View>

                <Text style={alertStyles.title}>Número No Disponible</Text>

                <Text style={alertStyles.message}>
                    El número <Text style={alertStyles.highlight}>{share}</Text> ha alcanzado
                    el límite máximo de <Text style={alertStyles.highlight}>{limit} clubes</Text> activos.
                </Text>

                <View style={alertStyles.infoBox}>
                    <Ionicons name="information-circle" size={20} color={COLORS.accent.blue} />
                    <Text style={alertStyles.infoText}>
                        Los números del rango {range} tienen un límite de {limit} participantes
                        para garantizar la equidad en los sorteos.
                    </Text>
                </View>

                <Text style={alertStyles.suggestion}>
                    💡 Sugerencia: Intenta con otro número de acción
                </Text>

                <View style={alertStyles.buttons}>
                    <TouchableOpacity style={alertStyles.secondaryBtn} onPress={onClose}>
                        <Text style={alertStyles.secondaryBtnText}>Cerrar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={alertStyles.primaryBtn} onPress={onChangeShare}>
                        <Ionicons name="refresh" size={18} color={COLORS.white} />
                        <Text style={alertStyles.primaryBtnText}>Cambiar Número</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

export function CreateClubModal({ visible, onClose }: Props) {
    const { data: clubTypes, isLoading: loadingTypes } = useClubTypes();
    const { data: denominations, isLoading: loadingDenoms } = useDenominations();
    const createMutation = useCreateClub();

    const [selectedCustomer, setSelectedCustomer] = useState<CustomerSearchResult | null>(null);
    const [showShareLimitError, setShowShareLimitError] = useState(false);
    const [errorShare, setErrorShare] = useState<number>(0);

    const { control, handleSubmit, watch, reset, setValue, setFocus, formState: { errors } } = useForm<CreateClubFormData>({
        resolver: zodResolver(createClubSchema),
        defaultValues: {
            customerId: '',
            clubTypeId: '',
            denominationId: '',
            share: 1,
            startDate: new Date().toISOString().split('T')[0],
        },
    });

    const watchShare = watch('share');
    const watchDenominationId = watch('denominationId');
    const watchClubTypeId = watch('clubTypeId');

    useEffect(() => {
        if (!visible) {
            reset();
            setSelectedCustomer(null);
            setShowShareLimitError(false);
        }
    }, [visible, reset]);

    const selectedDenom = denominations?.find((d) => d.denominationId === watchDenominationId);
    const weeklyAmount = selectedDenom?.value || 0;
    const totalAmount = weeklyAmount * 52;

    const handleCustomerChange = (customerId: string, customer: CustomerSearchResult | null) => {
        setSelectedCustomer(customer);
        setValue('customerId', customerId, { shouldValidate: true });
    };

    // Función para parsear errores de la API
    const parseApiError = (error: any): { type: string; message: string } => {
        const errorMessage = error?.message || error?.response?.data?.Status?.Message || '';

        // Detectar error de límite de share
        if (errorMessage.includes('limite permitido') ||
            errorMessage.includes('limit') ||
            errorMessage.includes('superado')) {
            return { type: 'SHARE_LIMIT', message: errorMessage };
        }

        // Otros errores conocidos
        if (errorMessage.includes('cliente') || errorMessage.includes('customer')) {
            return { type: 'CUSTOMER_ERROR', message: 'Error con los datos del cliente' };
        }

        return { type: 'GENERIC', message: errorMessage || 'Error desconocido al crear el club' };
    };

    const onSubmit = async (data: CreateClubFormData) => {
        try {
            const now = new Date();
            const pad = (n: number) => n.toString().padStart(2, '0');
            const formattedDate = `${data.startDate} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${now.getMilliseconds().toString().padStart(3, '0')}`;

            const payload = {
                customerId: data.customerId,
                clubTypeId: data.clubTypeId,
                denominationId: data.denominationId,
                share: data.share,
                startDate: formattedDate,
                saaSId: DEFAULT_VALUES.saaSId,
                salesAgentId: DEFAULT_VALUES.salesAgentId,
                storeId: DEFAULT_VALUES.storeId,
            };

            console.log('📤 Enviando payload:', JSON.stringify(payload, null, 2));

            await createMutation.mutateAsync(payload);

            Alert.alert('✅ Éxito', 'Club creado exitosamente', [
                { text: 'OK', onPress: onClose }
            ]);

            reset();
            setSelectedCustomer(null);
        } catch (error: any) {
            console.error('❌ Error creando club:', error);

            const parsedError = parseApiError(error);

            if (parsedError.type === 'SHARE_LIMIT') {
                // Mostrar alerta personalizada para límite de share
                setErrorShare(data.share);
                setShowShareLimitError(true);
            } else {
                // Mostrar alerta genérica para otros errores
                Alert.alert('Error', parsedError.message);
            }
        }
    };

    const handleChangeShare = () => {
        setShowShareLimitError(false);
        setValue('share', 0);
        // Intentar hacer focus en el campo share
        setTimeout(() => {
            // El focus se manejará visualmente
        }, 100);
    };

    const isLoading = loadingTypes || loadingDenoms;

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Ionicons name="close" size={24} color={COLORS.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Crear Nuevo Club</Text>
                    <View style={styles.placeholder} />
                </View>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.accent.blue} />
                        <Text style={styles.loadingText}>Cargando catálogos...</Text>
                    </View>
                ) : (
                    <ScrollView
                        style={styles.content}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled={true}
                    >
                        {/* Cliente */}
                        <View style={[styles.field, { zIndex: 100 }]}>
                            <Text style={styles.label}>Cliente *</Text>
                            <CustomerSearchSelect
                                value={watch('customerId')}
                                onChange={handleCustomerChange}
                                error={errors.customerId?.message}
                                selectedCustomer={selectedCustomer}
                            />
                        </View>

                        {/* Tipo de Club */}
                        <View style={styles.field}>
                            <Text style={styles.label}>Tipo de Club *</Text>
                            <Controller
                                control={control}
                                name="clubTypeId"
                                render={({ field: { value } }) => (
                                    <View style={styles.optionsRow}>
                                        {clubTypes?.map((type) => (
                                            <TouchableOpacity
                                                key={type.clubTypeId}
                                                style={[styles.typeBtn, value === type.clubTypeId && styles.typeBtnActive]}
                                                onPress={() => setValue('clubTypeId', type.clubTypeId, { shouldValidate: true })}
                                            >
                                                <Ionicons
                                                    name={type.name === 'Miércoles' ? 'calendar' : 'sunny'}
                                                    size={20}
                                                    color={value === type.clubTypeId ? COLORS.white : COLORS.text.secondary}
                                                />
                                                <Text style={[styles.typeText, value === type.clubTypeId && styles.typeTextActive]}>
                                                    {type.name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            />
                            {errors.clubTypeId && <Text style={styles.error}>{errors.clubTypeId.message}</Text>}
                        </View>

                        {/* Denominación */}
                        <View style={styles.field}>
                            <Text style={styles.label}>Denominación *</Text>
                            <Controller
                                control={control}
                                name="denominationId"
                                render={({ field: { value } }) => (
                                    <View style={styles.denomRow}>
                                        {denominations?.map((d) => (
                                            <TouchableOpacity
                                                key={d.denominationId}
                                                style={[styles.denomBtn, value === d.denominationId && styles.denomBtnActive]}
                                                onPress={() => setValue('denominationId', d.denominationId, { shouldValidate: true })}
                                            >
                                                <Text style={[styles.denomValue, value === d.denominationId && styles.denomValueActive]}>
                                                    ${d.value}
                                                </Text>
                                                <Text style={[styles.denomLabel, value === d.denominationId && styles.denomLabelActive]}>
                                                    /semana
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            />
                            {errors.denominationId && <Text style={styles.error}>{errors.denominationId.message}</Text>}
                        </View>

                        {/* Share y Fecha */}
                        <View style={styles.row}>
                            <View style={[styles.field, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>Número de Acción (1-99) *</Text>
                                <Controller
                                    control={control}
                                    name="share"
                                    render={({ field: { onChange, value } }) => (
                                        <TextInput
                                            style={[
                                                styles.input,
                                                styles.inputCenter,
                                                errors.share && styles.inputError,
                                                showShareLimitError && styles.inputWarning
                                            ]}
                                            value={value ? String(value) : ''}
                                            onChangeText={(t) => onChange(Number(t.replace(/[^0-9]/g, '')) || 0)}
                                            keyboardType="number-pad"
                                            maxLength={2}
                                            placeholder="##"
                                            placeholderTextColor={COLORS.text.muted}
                                        />
                                    )}
                                />
                                <View style={styles.shareInfo}>
                                    <Ionicons name="people" size={14} color={COLORS.text.muted} />
                                    <Text style={styles.hint}>
                                        Límite: {getShareLimit(watchShare)} participantes
                                    </Text>
                                </View>
                                {errors.share && <Text style={styles.error}>{errors.share.message}</Text>}
                            </View>

                            <View style={[styles.field, { flex: 1, marginLeft: 10 }]}>
                                <Text style={styles.label}>Fecha Inicio *</Text>
                                <Controller
                                    control={control}
                                    name="startDate"
                                    render={({ field: { onChange, value } }) => (
                                        <TextInput
                                            style={[styles.input, errors.startDate && styles.inputError]}
                                            value={value}
                                            onChangeText={onChange}
                                            placeholder="YYYY-MM-DD"
                                            placeholderTextColor={COLORS.text.muted}
                                        />
                                    )}
                                />
                                {errors.startDate && <Text style={styles.error}>{errors.startDate.message}</Text>}
                            </View>
                        </View>

                        {/* Resumen */}
                        {watchDenominationId && watchClubTypeId && (
                            <View style={styles.summary}>
                                <Text style={styles.summaryTitle}>📋 Resumen del Club</Text>
                                <View style={styles.summaryGrid}>
                                    {selectedCustomer && (
                                        <View style={[styles.summaryItem, { width: '100%' }]}>
                                            <Text style={styles.summaryLabel}>Cliente</Text>
                                            <Text style={styles.summaryValue} numberOfLines={1}>
                                                {selectedCustomer.FullName}
                                            </Text>
                                        </View>
                                    )}
                                    <View style={styles.summaryItem}>
                                        <Text style={styles.summaryLabel}>Tipo</Text>
                                        <Text style={styles.summaryValue}>
                                            {clubTypes?.find(t => t.clubTypeId === watchClubTypeId)?.name}
                                        </Text>
                                    </View>
                                    <View style={styles.summaryItem}>
                                        <Text style={styles.summaryLabel}>Número</Text>
                                        <Text style={styles.summaryValue}>{watchShare || '-'}</Text>
                                    </View>
                                    <View style={styles.summaryItem}>
                                        <Text style={styles.summaryLabel}>Semanal</Text>
                                        <Text style={styles.summaryValue}>${weeklyAmount}</Text>
                                    </View>
                                    <View style={styles.summaryItem}>
                                        <Text style={styles.summaryLabel}>Total (52 sem)</Text>
                                        <Text style={[styles.summaryValue, styles.summaryTotal]}>${totalAmount}</Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Alerta informativa de share */}
                        {watchShare >= 40 && watchShare <= 99 && (
                            <View style={styles.alert}>
                                <Ionicons name="information-circle" size={20} color={COLORS.accent.blue} />
                                <Text style={styles.alertTextInfo}>
                                    Los números 40-99 tienen mayor disponibilidad (300 participantes).
                                </Text>
                            </View>
                        )}

                        {watchShare >= 1 && watchShare <= 39 && (
                            <View style={[styles.alert, styles.alertWarning]}>
                                <Ionicons name="alert-circle" size={20} color={COLORS.accent.orange} />
                                <Text style={styles.alertText}>
                                    Los números 1-39 tienen disponibilidad limitada (100 participantes).
                                </Text>
                            </View>
                        )}

                        {/* Botones */}
                        <View style={styles.buttons}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                                <Text style={styles.cancelBtnText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.submitBtn, createMutation.isPending && styles.submitBtnDisabled]}
                                onPress={handleSubmit(onSubmit)}
                                disabled={createMutation.isPending}
                            >
                                {createMutation.isPending ? (
                                    <ActivityIndicator size="small" color={COLORS.white} />
                                ) : (
                                    <>
                                        <Ionicons name="add-circle" size={20} color={COLORS.white} />
                                        <Text style={styles.submitBtnText}>Crear Club</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        <View style={{ height: 40 }} />
                    </ScrollView>
                )}

                {/* Modal de error de límite de share */}
                {showShareLimitError && (
                    <ShareLimitAlert
                        share={errorShare}
                        onClose={() => setShowShareLimitError(false)}
                        onChangeShare={handleChangeShare}
                    />
                )}
            </KeyboardAvoidingView>
        </Modal>
    );
}

// Estilos para la alerta personalizada
const alertStyles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    container: {
        backgroundColor: COLORS.bg.primary,
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
    },
    iconContainer: {
        width: 80, height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.accent.orange + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text.primary,
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: COLORS.text.secondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 16,
    },
    highlight: {
        fontWeight: '700',
        color: COLORS.accent.orange,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: COLORS.accent.blue + '10',
        borderRadius: 12,
        padding: 14,
        gap: 10,
        marginBottom: 16,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: COLORS.accent.blue,
        lineHeight: 18,
    },
    suggestion: {
        fontSize: 14,
        color: COLORS.text.primary,
        fontWeight: '500',
        marginBottom: 20,
    },
    buttons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    secondaryBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: COLORS.bg.card,
        borderWidth: 1,
        borderColor: COLORS.border.default,
    },
    secondaryBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text.secondary,
    },
    primaryBtn: {
        flex: 1,
        flexDirection: 'row',
        gap: 6,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.accent.blue,
    },
    primaryBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.white,
    },
});

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg.primary },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12,
        borderBottomWidth: 1, borderBottomColor: COLORS.border.default,
    },
    closeBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 18, fontWeight: '700', color: COLORS.text.primary },
    placeholder: { width: 40 },
    content: { flex: 1, padding: 20 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: COLORS.text.muted, fontSize: 14 },
    field: { marginBottom: 24 },
    label: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary, marginBottom: 10 },
    input: {
        backgroundColor: COLORS.bg.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
        fontSize: 16, color: COLORS.text.primary, borderWidth: 1, borderColor: COLORS.border.default,
    },
    inputCenter: { textAlign: 'center', fontSize: 24, fontWeight: '700' },
    inputError: { borderColor: COLORS.status.error },
    inputWarning: { borderColor: COLORS.accent.orange, backgroundColor: COLORS.accent.orange + '10' },
    error: { fontSize: 12, color: COLORS.status.error, marginTop: 6 },
    shareInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 8 },
    hint: { fontSize: 12, color: COLORS.text.muted },
    row: { flexDirection: 'row' },
    optionsRow: { flexDirection: 'row', gap: 12 },
    typeBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        paddingVertical: 16, borderRadius: 12,
        backgroundColor: COLORS.bg.card, borderWidth: 1, borderColor: COLORS.border.default,
    },
    typeBtnActive: { backgroundColor: COLORS.accent.blue, borderColor: COLORS.accent.blue },
    typeText: { fontSize: 15, fontWeight: '600', color: COLORS.text.secondary },
    typeTextActive: { color: COLORS.white },
    denomRow: { flexDirection: 'row', gap: 10 },
    denomBtn: {
        flex: 1, alignItems: 'center', paddingVertical: 16, borderRadius: 12,
        backgroundColor: COLORS.bg.card, borderWidth: 2, borderColor: COLORS.border.default,
    },
    denomBtnActive: { backgroundColor: COLORS.accent.green + '15', borderColor: COLORS.accent.green },
    denomValue: { fontSize: 24, fontWeight: '700', color: COLORS.text.primary },
    denomValueActive: { color: COLORS.accent.green },
    denomLabel: { fontSize: 12, color: COLORS.text.muted, marginTop: 2 },
    denomLabelActive: { color: COLORS.accent.green },
    summary: {
        backgroundColor: COLORS.bg.card, borderRadius: 16, padding: 16, marginBottom: 16,
        borderWidth: 1, borderColor: COLORS.border.default,
    },
    summaryTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text.primary, marginBottom: 16 },
    summaryGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    summaryItem: { width: '50%', marginBottom: 12 },
    summaryLabel: { fontSize: 12, color: COLORS.text.muted, marginBottom: 4 },
    summaryValue: { fontSize: 16, fontWeight: '600', color: COLORS.text.primary },
    summaryTotal: { color: COLORS.accent.blue, fontSize: 20 },
    alert: {
        flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14,
        backgroundColor: COLORS.accent.blue + '10', borderRadius: 12, marginBottom: 20,
    },
    alertWarning: {
        backgroundColor: COLORS.status.warningBg,
    },
    alertText: { flex: 1, fontSize: 13, color: COLORS.accent.orange, lineHeight: 18 },
    alertTextInfo: { flex: 1, fontSize: 13, color: COLORS.accent.blue, lineHeight: 18 },
    buttons: { flexDirection: 'row', gap: 12 },
    cancelBtn: {
        flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center',
        backgroundColor: COLORS.bg.card, borderWidth: 1, borderColor: COLORS.border.default,
    },
    cancelBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.text.secondary },
    submitBtn: {
        flex: 1, flexDirection: 'row', gap: 8, paddingVertical: 16, borderRadius: 12,
        backgroundColor: COLORS.accent.blue, alignItems: 'center', justifyContent: 'center',
    },
    submitBtnDisabled: { opacity: 0.6 },
    submitBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
});