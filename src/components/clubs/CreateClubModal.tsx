// ============================================================
// ARCHIVO 9: src/components/clubs/CreateClubModal.tsx
// ============================================================

import { useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateClub, useClubTypes, useDenominations } from '../../hooks/useClubs';
import { createClubSchema, CreateClubFormData, getShareLimit } from '../../schemas/club.schema';
import { COLORS } from '../../constants/colors';

interface Props {
    visible: boolean;
    onClose: () => void;
}

const DEFAULT_VALUES = {
    saaSId: 2,
    salesAgentId: 'default-agent-id',
    storeId: 'default-store-id',
};

export function CreateClubModal({ visible, onClose }: Props) {
    const { data: clubTypes, isLoading: loadingTypes } = useClubTypes();
    const { data: denominations, isLoading: loadingDenoms } = useDenominations();
    const createMutation = useCreateClub();

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

    useEffect(() => {
        if (!visible) reset();
    }, [visible, reset]);

    const selectedDenom = denominations?.find((d) => d.denominationId === watchDenominationId);
    const weeklyAmount = selectedDenom?.value || 0;
    const totalAmount = weeklyAmount * 52;

    const onSubmit = async (data: CreateClubFormData) => {
        try {
            const now = new Date();
            const timeStr = now.toTimeString().split(' ')[0] + '.000';
            const formattedDate = `${data.startDate} ${timeStr}`;

            await createMutation.mutateAsync({
                ...data,
                startDate: formattedDate,
                saaSId: DEFAULT_VALUES.saaSId,
                salesAgentId: DEFAULT_VALUES.salesAgentId,
                storeId: DEFAULT_VALUES.storeId,
            });

            Alert.alert('Éxito', 'Club creado exitosamente');
            reset();
            onClose();
        } catch (error: any) {
            Alert.alert('Error', error?.message || 'No se pudo crear el club');
        }
    };

    const isLoading = loadingTypes || loadingDenoms;

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <View style={styles.field}>
                            <Text style={styles.label}>ID del Cliente *</Text>
                            <Controller control={control} name="customerId"
                                render={({ field: { onChange, value } }) => (
                                    <TextInput style={[styles.input, errors.customerId && styles.inputError]}
                                        value={value} onChangeText={onChange}
                                        placeholder="Ingrese el ID del cliente" placeholderTextColor={COLORS.text.muted}
                                    />
                                )}
                            />
                            {errors.customerId && <Text style={styles.error}>{errors.customerId.message}</Text>}
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Tipo de Club *</Text>
                            <Controller control={control} name="clubTypeId"
                                render={({ field: { value } }) => (
                                    <View style={styles.optionsRow}>
                                        {clubTypes?.map((type) => (
                                            <TouchableOpacity key={type.clubTypeId}
                                                style={[styles.optionBtn, value === type.clubTypeId && styles.optionBtnActive]}
                                                onPress={() => setValue('clubTypeId', type.clubTypeId, { shouldValidate: true })}>
                                                <Text style={[styles.optionText, value === type.clubTypeId && styles.optionTextActive]}>{type.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            />
                            {errors.clubTypeId && <Text style={styles.error}>{errors.clubTypeId.message}</Text>}
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Denominación *</Text>
                            <Controller control={control} name="denominationId"
                                render={({ field: { value } }) => (
                                    <View style={styles.optionsRow}>
                                        {denominations?.map((d) => (
                                            <TouchableOpacity key={d.denominationId}
                                                style={[styles.optionBtn, styles.denomBtn, value === d.denominationId && styles.optionBtnActive]}
                                                onPress={() => setValue('denominationId', d.denominationId, { shouldValidate: true })}>
                                                <Text style={[styles.denomValue, value === d.denominationId && styles.optionTextActive]}>${d.value}</Text>
                                                <Text style={[styles.denomLabel, value === d.denominationId && styles.optionTextActive]}>/semana</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            />
                            {errors.denominationId && <Text style={styles.error}>{errors.denominationId.message}</Text>}
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Share (1-99) *</Text>
                            <Controller control={control} name="share"
                                render={({ field: { onChange, value } }) => (
                                    <TextInput style={[styles.input, errors.share && styles.inputError]}
                                        value={String(value)} onChangeText={(t) => onChange(Number(t) || 0)}
                                        keyboardType="number-pad" maxLength={2}
                                    />
                                )}
                            />
                            <Text style={styles.hint}>Límite: {getShareLimit(watchShare)} participantes</Text>
                            {errors.share && <Text style={styles.error}>{errors.share.message}</Text>}
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Fecha de Inicio *</Text>
                            <Controller control={control} name="startDate"
                                render={({ field: { onChange, value } }) => (
                                    <TextInput style={[styles.input, errors.startDate && styles.inputError]}
                                        value={value} onChangeText={onChange}
                                        placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.text.muted}
                                    />
                                )}
                            />
                            {errors.startDate && <Text style={styles.error}>{errors.startDate.message}</Text>}
                        </View>

                        {watchDenominationId && (
                            <View style={styles.summary}>
                                <Text style={styles.summaryTitle}>Resumen</Text>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Pago semanal:</Text>
                                    <Text style={styles.summaryValue}>${weeklyAmount}</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Total (52 sem):</Text>
                                    <Text style={styles.summaryValueBig}>${totalAmount}</Text>
                                </View>
                            </View>
                        )}

                        {watchShare >= 40 && (
                            <View style={styles.alert}>
                                <Ionicons name="alert-circle" size={18} color={COLORS.accent.orange} />
                                <Text style={styles.alertText}>Shares 40-99 tienen límite de 300 participantes.</Text>
                            </View>
                        )}

                        <View style={styles.buttons}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                                <Text style={styles.cancelBtnText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.submitBtn, createMutation.isPending && styles.submitBtnDisabled]}
                                onPress={handleSubmit(onSubmit)} disabled={createMutation.isPending}>
                                {createMutation.isPending ? (
                                    <ActivityIndicator size="small" color={COLORS.white} />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark" size={18} color={COLORS.white} />
                                        <Text style={styles.submitBtnText}>Crear Club</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                )}
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg.primary },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border.default },
    closeBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 17, fontWeight: '600', color: COLORS.text.primary },
    placeholder: { width: 40 },
    content: { flex: 1, padding: 20 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: COLORS.text.muted },
    field: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '500', color: COLORS.text.primary, marginBottom: 8 },
    input: { backgroundColor: COLORS.bg.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: COLORS.text.primary, borderWidth: 1, borderColor: COLORS.border.default },
    inputError: { borderColor: COLORS.status.error },
    error: { fontSize: 12, color: COLORS.status.error, marginTop: 4 },
    hint: { fontSize: 12, color: COLORS.text.muted, marginTop: 4 },
    optionsRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
    optionBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: COLORS.bg.card, borderWidth: 1, borderColor: COLORS.border.default },
    optionBtnActive: { backgroundColor: COLORS.accent.blue, borderColor: COLORS.accent.blue },
    optionText: { fontSize: 14, fontWeight: '500', color: COLORS.text.secondary },
    optionTextActive: { color: COLORS.white },
    denomBtn: { alignItems: 'center', minWidth: 80 },
    denomValue: { fontSize: 18, fontWeight: '700', color: COLORS.text.primary },
    denomLabel: { fontSize: 11, color: COLORS.text.muted },
    summary: { backgroundColor: COLORS.bg.card, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border.default },
    summaryTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary, marginBottom: 12 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryLabel: { fontSize: 14, color: COLORS.text.muted },
    summaryValue: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary },
    summaryValueBig: { fontSize: 18, fontWeight: '700', color: COLORS.accent.blue },
    alert: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: COLORS.status.warningBg, borderRadius: 10, marginBottom: 20 },
    alertText: { flex: 1, fontSize: 13, color: COLORS.accent.orange },
    buttons: { flexDirection: 'row', gap: 12, paddingBottom: 40 },
    cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: COLORS.bg.card, borderWidth: 1, borderColor: COLORS.border.default, alignItems: 'center' },
    cancelBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.text.secondary },
    submitBtn: { flex: 1, flexDirection: 'row', gap: 8, paddingVertical: 14, borderRadius: 12, backgroundColor: COLORS.accent.blue, alignItems: 'center', justifyContent: 'center' },
    submitBtnDisabled: { opacity: 0.6 },
    submitBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.white },
});