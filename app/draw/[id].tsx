// app/draw/[id].tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDrawStore } from '../../src/stores/draw-store';
import { WinnersList } from '../../src/components/draws/WinnersList';
import { useTheme } from '../../src/contexts/ThemeContext';
import { CustomAlert } from '../../src/components/ui/CustomAlert';
import { useAlert } from '../../src/hooks/useAlert';

export default function DrawDetailScreen() {
    const router = useRouter();
    const alert = useAlert();
    const { colors } = useTheme();
    const { id, drawData } = useLocalSearchParams<{ id: string; drawData?: string }>();

    const {
        selectedDraw,
        winners,
        isLoading,
        error,
        fetchDrawById,
        fetchDrawWinners,
        cancelDraw,
        clearSelectedDraw,
        clearError,
        setSelectedDraw,
    } = useDrawStore();

    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        if (drawData) {
            // Si recibimos los datos del sorteo a través de la navegación, usarlos directamente
            // (optimización para evitar llamadas API innecesarias)
            try {
                const parsedDraw = JSON.parse(drawData);
                setSelectedDraw(parsedDraw);
                // Aún necesitamos buscar ganadores ya que no vienen en la lista
                if (parsedDraw.status === 'completed') {
                    fetchDrawWinners(id!);
                }
            } catch (error) {
                console.error('Error parsing draw data:', error);
                // Fallback a fetch si hay error
                if (id) {
                    fetchDrawById(id);
                    fetchDrawWinners(id);
                }
            }
        } else if (id) {
            // Fallback: si no hay datos pasados, hacer fetch normal
            fetchDrawById(id);
            fetchDrawWinners(id);
        }

        return () => {
            clearSelectedDraw();
        };
    }, [id, drawData]);

    const handleBack = () => {
        router.back();
    };

    const handleCancelDraw = () => {
        alert.showConfirm(
            'Cancelar Sorteo',
            '¿Estás seguro de que deseas cancelar este sorteo? Esta acción no se puede deshacer.\n\nSe cancelará con motivo: "Cancelado desde la aplicación"',
            async () => {
                try {
                    setIsCancelling(true);
                    await cancelDraw(id!, 'Cancelado desde la aplicación');
                    alert.showSuccess(
                        'Sorteo Cancelado',
                        'El sorteo ha sido cancelado correctamente',
                        () => router.back()
                    );
                } catch (error: any) {
                    alert.showError('Error', error.message);
                } finally {
                    setIsCancelling(false);
                }
            },
            undefined,
            'Sí, Cancelar',
            'No'
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-PA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return colors.status.successText;
            case 'pending':
                return colors.status.warningText;
            case 'cancelled':
                return colors.status.errorText;
            default:
                return colors.text.secondary;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed':
                return 'Completado';
            case 'pending':
                return 'Pendiente';
            case 'cancelled':
                return 'Cancelado';
            default:
                return status;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return 'checkmark-circle';
            case 'pending':
                return 'time';
            case 'cancelled':
                return 'close-circle';
            default:
                return 'help-circle';
        }
    };

    if (isLoading && !selectedDraw) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.bg.primary }]}>
                <ActivityIndicator size="large" color={colors.brand.primary} />
                <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Cargando sorteo...</Text>
            </View>
        );
    }

    if (!selectedDraw) {
        return (
            <View style={[styles.errorContainer, { backgroundColor: colors.bg.primary }]}>
                <Ionicons name="alert-circle" size={64} color={colors.status.error} />
                <Text style={[styles.errorTitle, { color: colors.text.primary }]}>Sorteo no encontrado</Text>
                <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.brand.primary }]} onPress={handleBack}>
                    <Text style={[styles.backButtonText, { color: colors.white }]}>Volver</Text>
                </TouchableOpacity>
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
                <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Detalle del Sorteo</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Error */}
            {error && (
                <View style={[styles.errorBanner, { backgroundColor: colors.status.errorBg }]}>
                    <Ionicons name="alert-circle" size={20} color={colors.status.error} />
                    <Text style={[styles.errorBannerText, { color: colors.status.error }]}>{error}</Text>
                    <TouchableOpacity onPress={clearError}>
                        <Ionicons name="close" size={20} color={colors.status.error} />
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Card de Información Principal */}
                <View style={[styles.mainCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                    <View style={styles.mainCardHeader}>
                        <View style={styles.typeContainer}>
                            <Ionicons name="calendar" size={24} color={colors.brand.primary} />
                            <Text style={[styles.clubType, { color: colors.text.primary }]}>{selectedDraw.clubTypeName || 'Club'}</Text>
                        </View>
                        <View
                            style={[
                                styles.statusBadge,
                                { backgroundColor: `${getStatusColor(selectedDraw.status)}20` },
                            ]}
                        >
                            <Ionicons
                                name={getStatusIcon(selectedDraw.status) as any}
                                size={16}
                                color={getStatusColor(selectedDraw.status)}
                            />
                            <Text
                                style={[
                                    styles.statusText,
                                    { color: getStatusColor(selectedDraw.status) },
                                ]}
                            >
                                {getStatusLabel(selectedDraw.status)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.dateContainer}>
                        <Ionicons name="calendar-outline" size={18} color={colors.text.secondary} />
                        <Text style={[styles.dateText, { color: colors.text.secondary }]}>{formatDate(selectedDraw.date)}</Text>
                    </View>

                    {selectedDraw.status === 'completed' && (
                        <View style={[styles.winningNumberSection, { backgroundColor: colors.status.infoBg }]}>
                            <Text style={[styles.winningNumberLabel, { color: colors.text.secondary }]}>Número Ganador</Text>
                            <View style={[styles.winningNumberBadge, { backgroundColor: colors.brand.primary }]}>
                                <Text style={[styles.winningNumber, { color: colors.white }]}>{selectedDraw.numberPlayed}</Text>
                            </View>
                        </View>
                    )}

                    {selectedDraw.notes && (
                        <View style={[styles.notesContainer, { backgroundColor: colors.bg.elevated }]}>
                            <Ionicons name="document-text" size={16} color={colors.text.secondary} />
                            <Text style={[styles.notesText, { color: colors.text.secondary }]}>{selectedDraw.notes}</Text>
                        </View>
                    )}
                </View>

                {/* Card de Estadísticas */}
                {selectedDraw.status === 'completed' && (
                    <View style={[styles.statsCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                        <Text style={[styles.statsTitle, { color: colors.text.primary }]}>Resumen del Sorteo</Text>

                        <View style={styles.statsGrid}>
                            <View style={[styles.statBox, { backgroundColor: colors.bg.elevated }]}>
                                <Ionicons name="trophy" size={24} color={colors.accent.gold} />
                                <Text style={[styles.statValue, { color: colors.text.primary }]}>
                                    {selectedDraw.totalWinners || 0}
                                </Text>
                                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                                    {selectedDraw.totalWinners === 1 ? 'Ganador' : 'Ganadores'}
                                </Text>
                            </View>

                            <View style={[styles.statBox, { backgroundColor: colors.bg.elevated }]}>
                                <Ionicons name="cash" size={24} color={colors.status.success} />
                                <Text style={[styles.statValue, { color: colors.text.primary }]}>
                                    ${(selectedDraw.totalPrizeAmount || 0).toFixed(2)}
                                </Text>
                                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Total Premios</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Card de Información del Sistema */}
                <View style={[styles.systemCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                    <Text style={[styles.systemTitle, { color: colors.text.primary }]}>Información del Sistema</Text>

                    {selectedDraw.executedBy && (
                        <View style={styles.systemRow}>
                            <Ionicons name="person" size={16} color={colors.text.secondary} />
                            <Text style={[styles.systemLabel, { color: colors.text.secondary }]}>Ejecutado por:</Text>
                            <Text style={[styles.systemValue, { color: colors.text.primary }]}>{selectedDraw.executedBy}</Text>
                        </View>
                    )}

                    {selectedDraw.executedDate && (
                        <View style={styles.systemRow}>
                            <Ionicons name="time" size={16} color={colors.text.secondary} />
                            <Text style={[styles.systemLabel, { color: colors.text.secondary }]}>Fecha de ejecución:</Text>
                            <Text style={[styles.systemValue, { color: colors.text.primary }]}>
                                {new Date(selectedDraw.executedDate).toLocaleString('es-PA')}
                            </Text>
                        </View>
                    )}

                    <View style={styles.systemRow}>
                        <Ionicons name="key" size={16} color={colors.text.secondary} />
                        <Text style={[styles.systemLabel, { color: colors.text.secondary }]}>ID del Sorteo:</Text>
                        <Text style={[styles.systemValue, { color: colors.text.primary }]} selectable>
                            {selectedDraw.drawId}
                        </Text>
                    </View>
                </View>

                {/* Lista de Ganadores */}
                {selectedDraw.status === 'completed' && winners.length > 0 && (
                    <View style={styles.winnersSection}>
                        <WinnersList
                            winners={winners}
                            drawId={selectedDraw.drawId}
                            canMarkActions={false}
                        />
                    </View>
                )}

                {/* Mensaje si no hay ganadores */}
                {selectedDraw.status === 'completed' && winners.length === 0 && (
                    <View style={[styles.infoCard, { backgroundColor: colors.status.infoBg }]}>
                        <Ionicons name="information-circle" size={24} color={colors.brand.primary} />
                        <Text style={[styles.infoText, { color: colors.text.secondary }]}>
                            No hay ganadores registrados para este sorteo. Los ganadores se mostrarán
                            cuando estén disponibles en el sistema.
                        </Text>
                    </View>
                )}
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
        fontSize: 18,
        fontWeight: '600',
    },

    // Loading
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
    },

    // Error
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        gap: 16,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    backButton: {
        marginTop: 16,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    backButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 12,
        marginHorizontal: 20,
        marginTop: 16,
        borderRadius: 12,
    },
    errorBannerText: {
        flex: 1,
        fontSize: 13,
    },

    // Content
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },

    // Main Card
    mainCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        gap: 16,
    },
    mainCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    typeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    clubType: {
        fontSize: 20,
        fontWeight: '700',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dateText: {
        fontSize: 15,
        textTransform: 'capitalize',
    },
    winningNumberSection: {
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        gap: 12,
    },
    winningNumberLabel: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    winningNumberBadge: {
        borderRadius: 28,
        paddingHorizontal: 32,
        paddingVertical: 12,
    },
    winningNumber: {
        fontSize: 36,
        fontWeight: 'bold',
    },
    notesContainer: {
        flexDirection: 'row',
        gap: 10,
        padding: 12,
        borderRadius: 8,
    },
    notesText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },

    // Stats Card
    statsCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
    },
    statsTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    statBox: {
        flex: 1,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        gap: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
        textAlign: 'center',
    },

    // System Card
    systemCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        gap: 12,
    },
    systemTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    systemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    systemLabel: {
        fontSize: 13,
    },
    systemValue: {
        flex: 1,
        fontSize: 13,
        fontWeight: '500',
    },

    // Winners Section
    winnersSection: {
        marginBottom: 16,
    },

    // Info Card
    infoCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },

    // Cancel Button
    cancelButton: {
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
