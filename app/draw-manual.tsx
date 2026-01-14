// app/draw.tsx
import { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    StyleSheet, Alert, ActivityIndicator, Platform, KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../src/constants/colors';
import { paymentsApi } from '../src/api/payments.api';

export default function DrawScreen() {
    const [share, setShare] = useState('');
    const [comment, setComment] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [alternativeHour, setAlternativeHour] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [lastResult, setLastResult] = useState<{
        success: boolean;
        message: string;
        drawId?: string;
    } | null>(null);

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('es-PA', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatDateForApi = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day} 00:00:00.000`;
    };

    const handleDateChange = (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);
    };

    const setToday = () => {
        setSelectedDate(new Date());
    };

    const handleRegisterDraw = async () => {
        // Validar número si se ingresó
        if (share && (isNaN(Number(share)) || Number(share) < 0 || Number(share) > 99)) {
            Alert.alert('Error', 'El número debe estar entre 00 y 99');
            return;
        }

        Alert.alert(
            '🎰 Confirmar Sorteo',
            `¿Registrar sorteo para ${formatDate(selectedDate)}?\n\n${share ? `Número ganador: ${share}` : 'Sin número asignado'}`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Registrar',
                    onPress: async () => {
                        setIsLoading(true);
                        setLastResult(null);

                        try {
                            const result = await paymentsApi.registerDraw({
                                share: share ? Number(share) : null,
                                drawDate: formatDateForApi(selectedDate),
                                alternativeHour: alternativeHour || null,
                                comment: comment || `Sorteo ${formatDate(selectedDate)}`,
                            });

                            setLastResult({
                                success: true,
                                message: result.message,
                                drawId: result.drawId,
                            });

                            // Limpiar formulario
                            setShare('');
                            setComment('');
                            setAlternativeHour('');

                        } catch (error: any) {
                            setLastResult({
                                success: false,
                                message: error.message || 'Error al registrar sorteo',
                            });
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>Registro de Sorteo</Text>
                    <Text style={styles.headerSubtitle}>Registrar número ganador</Text>
                </View>
                <View style={styles.headerIcon}>
                    <Ionicons name="trophy" size={24} color={COLORS.accent.orange} />
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: 120 }}
                >
                        {/* Resultado del último registro */}
                    {lastResult && (
                        <View style={[
                            styles.resultCard,
                            lastResult.success ? styles.resultSuccess : styles.resultError
                        ]}>
                            <Ionicons
                                name={lastResult.success ? 'checkmark-circle' : 'alert-circle'}
                                size={24}
                                color={lastResult.success ? COLORS.status.success : COLORS.status.error}
                            />
                            <View style={styles.resultInfo}>
                                <Text style={[
                                    styles.resultText,
                                    { color: lastResult.success ? COLORS.status.success : COLORS.status.error }
                                ]}>
                                    {lastResult.message}
                                </Text>
                                {lastResult.drawId && (
                                    <Text style={styles.resultId}>ID: {lastResult.drawId}</Text>
                                )}
                            </View>
                            <TouchableOpacity onPress={() => setLastResult(null)}>
                                <Ionicons name="close" size={20} color={COLORS.text.muted} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Selector de Fecha */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Fecha del Sorteo</Text>
                        <View style={styles.dateCard}>
                            <TouchableOpacity
                                style={styles.dateArrow}
                                onPress={() => handleDateChange(-1)}
                            >
                                <Ionicons name="chevron-back" size={24} color={COLORS.accent.blue} />
                            </TouchableOpacity>

                            <View style={styles.dateInfo}>
                                <Text style={styles.dateDay}>
                                    {selectedDate.toLocaleDateString('es-PA', { weekday: 'long' })}
                                </Text>
                                <Text style={styles.dateNumber}>
                                    {selectedDate.getDate()}
                                </Text>
                                <Text style={styles.dateMonth}>
                                    {selectedDate.toLocaleDateString('es-PA', { month: 'long', year: 'numeric' })}
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={styles.dateArrow}
                                onPress={() => handleDateChange(1)}
                            >
                                <Ionicons name="chevron-forward" size={24} color={COLORS.accent.blue} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.todayBtn} onPress={setToday}>
                            <Ionicons name="today" size={16} color={COLORS.accent.blue} />
                            <Text style={styles.todayText}>Hoy</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Número Ganador */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Número Ganador (Opcional)</Text>
                        <View style={styles.numberInputContainer}>
                            <TextInput
                                style={styles.numberInput}
                                value={share}
                                onChangeText={(text) => {
                                    // Solo permitir números de hasta 2 dígitos
                                    if (/^\d{0,2}$/.test(text)) {
                                        setShare(text);
                                    }
                                }}
                                placeholder="00"
                                placeholderTextColor={COLORS.text.muted}
                                keyboardType="number-pad"
                                maxLength={2}
                                textAlign="center"
                            />
                            <Text style={styles.numberHint}>Ingresa el número del 00 al 99</Text>
                        </View>
                    </View>

                    {/* Hora Alternativa */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Hora Alternativa (Opcional)</Text>
                        <TextInput
                            style={styles.input}
                            value={alternativeHour}
                            onChangeText={setAlternativeHour}
                            placeholder="Ej: 15:00:00"
                            placeholderTextColor={COLORS.text.muted}
                        />
                    </View>

                    {/* Comentario */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Comentario (Opcional)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={comment}
                            onChangeText={setComment}
                            placeholder="Agregar comentario..."
                            placeholderTextColor={COLORS.text.muted}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Botón Registrar */}
                    <TouchableOpacity
                        style={[styles.registerBtn, isLoading && styles.registerBtnDisabled]}
                        onPress={handleRegisterDraw}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <>
                                <Ionicons name="trophy" size={20} color={COLORS.white} />
                                <Text style={styles.registerBtnText}>Registrar Sorteo</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg.primary },

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
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerInfo: { flex: 1, marginLeft: 8 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text.primary },
    headerSubtitle: { fontSize: 13, color: COLORS.text.secondary, marginTop: 2 },
    headerIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: COLORS.status.warningBg,
        justifyContent: 'center',
        alignItems: 'center',
    },

    content: { flex: 1, padding: 20 },

    // Result Card
    resultCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        marginBottom: 20,
        gap: 12,
    },
    resultSuccess: {
        backgroundColor: COLORS.status.successBg,
        borderWidth: 1,
        borderColor: COLORS.status.success + '30',
    },
    resultError: {
        backgroundColor: COLORS.status.errorBg,
        borderWidth: 1,
        borderColor: COLORS.status.error + '30',
    },
    resultInfo: { flex: 1 },
    resultText: { fontSize: 14, fontWeight: '600' },
    resultId: { fontSize: 12, color: COLORS.text.muted, marginTop: 2 },

    // Section
    section: { marginBottom: 24 },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text.secondary,
        marginBottom: 12,
    },

    // Date Selector
    dateCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bg.card,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border.default,
    },
    dateArrow: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: COLORS.bg.elevated,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateInfo: {
        flex: 1,
        alignItems: 'center',
    },
    dateDay: {
        fontSize: 14,
        color: COLORS.text.secondary,
        textTransform: 'capitalize',
    },
    dateNumber: {
        fontSize: 48,
        fontWeight: '700',
        color: COLORS.text.primary,
        lineHeight: 56,
    },
    dateMonth: {
        fontSize: 14,
        color: COLORS.text.secondary,
        textTransform: 'capitalize',
    },
    todayBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 12,
        paddingVertical: 8,
    },
    todayText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.accent.blue,
    },

    // Number Input
    numberInputContainer: {
        alignItems: 'center',
    },
    numberInput: {
        width: 120,
        height: 80,
        backgroundColor: COLORS.bg.card,
        borderRadius: 16,
        fontSize: 36,
        fontWeight: '700',
        color: COLORS.text.primary,
        borderWidth: 2,
        borderColor: COLORS.border.default,
    },
    numberHint: {
        fontSize: 12,
        color: COLORS.text.muted,
        marginTop: 8,
    },

    // Input
    input: {
        backgroundColor: COLORS.bg.card,
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: COLORS.text.primary,
        borderWidth: 1,
        borderColor: COLORS.border.default,
    },
    textArea: {
        minHeight: 80,
        paddingTop: 14,
    },

    // Register Button
    registerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: COLORS.accent.orange,
        paddingVertical: 16,
        borderRadius: 14,
        marginTop: 8,
    },
    registerBtnDisabled: {
        opacity: 0.7,
    },
    registerBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.white,
    },
});