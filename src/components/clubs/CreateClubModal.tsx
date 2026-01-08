// src/components/clubs/CreateClubModal.tsx - CON BÚSQUEDA DE CLIENTES
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

export function CreateClubModal({ visible, onClose }: Props) {
    const { data: clubTypes, isLoading: loadingTypes } = useClubTypes();
    const { data: denominations, isLoading: loadingDenoms } = useDenominations();
    const createMutation = useCreateClub();

    // Estado para el cliente seleccionado (ahora usa el tipo de la API)
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerSearchResult | null>(null);

    const { control, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<CreateClubFormData>({
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
        }
    }, [visible, reset]);

    // Calcular montos
    const selectedDenom = denominations?.find((d) => d.denominationId === watchDenominationId);
    const weeklyAmount = selectedDenom?.value || 0;
    const totalAmount = weeklyAmount * 52;

    // Handler para cuando se selecciona un cliente del buscador
    const handleCustomerChange = (customerId: string, customer: CustomerSearchResult | null) => {
        setSelectedCustomer(customer);
        setValue('customerId', customerId, { shouldValidate: true });
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
            Alert.alert('Error', error?.message || 'No se pudo crear el club');
        }
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
                        {/* Cliente - AHORA CON BÚSQUEDA */}
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
                                <Text style={styles.label}>Share (1-99) *</Text>
                                <Controller
                                    control={control}
                                    name="share"
                                    render={({ field: { onChange, value } }) => (
                                        <TextInput
                                            style={[styles.input, styles.inputCenter, errors.share && styles.inputError]}
                                            value={String(value)}
                                            onChangeText={(t) => onChange(Number(t.replace(/[^0-9]/g, '')) || 0)}
                                            keyboardType="number-pad"
                                            maxLength={2}
                                        />
                                    )}
                                />
                                <Text style={styles.hint}>Límite: {getShareLimit(watchShare)}</Text>
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
                                    {/* Mostrar cliente seleccionado en el resumen */}
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
                                        <Text style={styles.summaryLabel}>Share</Text>
                                        <Text style={styles.summaryValue}>{watchShare}</Text>
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

                        {/* Alerta de share alto */}
                        {watchShare >= 40 && (
                            <View style={styles.alert}>
                                <Ionicons name="alert-circle" size={20} color={COLORS.accent.orange} />
                                <Text style={styles.alertText}>
                                    Shares 40-99 tienen límite de 300 participantes.
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
            </KeyboardAvoidingView>
        </Modal>
    );
}

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
    inputCenter: { textAlign: 'center', fontSize: 20, fontWeight: '700' },
    inputError: { borderColor: COLORS.status.error },
    error: { fontSize: 12, color: COLORS.status.error, marginTop: 6 },
    hint: { fontSize: 12, color: COLORS.text.muted, marginTop: 6, textAlign: 'center' },
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
        backgroundColor: COLORS.status.warningBg, borderRadius: 12, marginBottom: 20,
    },
    alertText: { flex: 1, fontSize: 13, color: COLORS.accent.orange, lineHeight: 18 },
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