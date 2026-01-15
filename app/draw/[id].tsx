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
import { COLORS } from '../../src/constants/colors';
import { CustomAlert } from '../../src/components/ui/CustomAlert';
import { useAlert } from '../../src/hooks/useAlert';

export default function DrawDetailScreen() {
    const router = useRouter();
    const alert = useAlert();
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
                return COLORS.status.successText;
            case 'pending':
                return COLORS.status.warningText;
            case 'cancelled':
                return COLORS.status.errorText;
            default:
                return COLORS.text.secondary;
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
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.accent.blue} />
                <Text style={styles.loadingText}>Cargando sorteo...</Text>
            </View>
        );
    }

    if (!selectedDraw) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={64} color={COLORS.status.error} />
                <Text style={styles.errorTitle}>Sorteo no encontrado</Text>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Text style={styles.backButtonText}>Volver</Text>
                </TouchableOpacity>
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
                <Text style={styles.headerTitle}>Detalle del Sorteo</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Error */}
            {error && (
                <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle" size={20} color={COLORS.status.error} />
                    <Text style={styles.errorBannerText}>{error}</Text>
                    <TouchableOpacity onPress={clearError}>
                        <Ionicons name="close" size={20} color={COLORS.status.error} />
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Card de Información Principal */}
                <View style={styles.mainCard}>
                    <View style={styles.mainCardHeader}>
                        <View style={styles.typeContainer}>
                            <Ionicons name="calendar" size={24} color={COLORS.accent.blue} />
                            <Text style={styles.clubType}>{selectedDraw.clubTypeName || 'Club'}</Text>
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
                        <Ionicons name="calendar-outline" size={18} color={COLORS.text.secondary} />
                        <Text style={styles.dateText}>{formatDate(selectedDraw.date)}</Text>
                    </View>

                    {selectedDraw.status === 'completed' && (
                        <View style={styles.winningNumberSection}>
                            <Text style={styles.winningNumberLabel}>Número Ganador</Text>
                            <View style={styles.winningNumberBadge}>
                                <Text style={styles.winningNumber}>{selectedDraw.numberPlayed}</Text>
                            </View>
                        </View>
                    )}

                    {selectedDraw.notes && (
                        <View style={styles.notesContainer}>
                            <Ionicons name="document-text" size={16} color={COLORS.text.secondary} />
                            <Text style={styles.notesText}>{selectedDraw.notes}</Text>
                        </View>
                    )}
                </View>

                {/* Card de Estadísticas */}
                {selectedDraw.status === 'completed' && (
                    <View style={styles.statsCard}>
                        <Text style={styles.statsTitle}>Resumen del Sorteo</Text>

                        <View style={styles.statsGrid}>
                            <View style={styles.statBox}>
                                <Ionicons name="trophy" size={24} color={COLORS.accent.gold} />
                                <Text style={styles.statValue}>
                                    {selectedDraw.totalWinners || 0}
                                </Text>
                                <Text style={styles.statLabel}>
                                    {selectedDraw.totalWinners === 1 ? 'Ganador' : 'Ganadores'}
                                </Text>
                            </View>

                            <View style={styles.statBox}>
                                <Ionicons name="cash" size={24} color={COLORS.accent.green} />
                                <Text style={styles.statValue}>
                                    ${(selectedDraw.totalPrizeAmount || 0).toFixed(2)}
                                </Text>
                                <Text style={styles.statLabel}>Total Premios</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Card de Información del Sistema */}
                <View style={styles.systemCard}>
                    <Text style={styles.systemTitle}>Información del Sistema</Text>

                    {selectedDraw.executedBy && (
                        <View style={styles.systemRow}>
                            <Ionicons name="person" size={16} color={COLORS.text.secondary} />
                            <Text style={styles.systemLabel}>Ejecutado por:</Text>
                            <Text style={styles.systemValue}>{selectedDraw.executedBy}</Text>
                        </View>
                    )}

                    {selectedDraw.executedDate && (
                        <View style={styles.systemRow}>
                            <Ionicons name="time" size={16} color={COLORS.text.secondary} />
                            <Text style={styles.systemLabel}>Fecha de ejecución:</Text>
                            <Text style={styles.systemValue}>
                                {new Date(selectedDraw.executedDate).toLocaleString('es-PA')}
                            </Text>
                        </View>
                    )}

                    <View style={styles.systemRow}>
                        <Ionicons name="key" size={16} color={COLORS.text.secondary} />
                        <Text style={styles.systemLabel}>ID del Sorteo:</Text>
                        <Text style={styles.systemValue} selectable>
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
                    <View style={styles.infoCard}>
                        <Ionicons name="information-circle" size={24} color={COLORS.accent.blue} />
                        <Text style={styles.infoText}>
                            No hay ganadores registrados para este sorteo. Los ganadores se mostrarán
                            cuando estén disponibles en el sistema.
                        </Text>
                    </View>
                )}

                {/* Botón de Cancelar (deshabilitado temporalmente) */}
                {/* {selectedDraw.status === 'pending' && (
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancelDraw}
                        disabled={isCancelling}
                    >
                        {isCancelling ? (
                            <ActivityIndicator size="small" color={COLORS.white} />
                        ) : (
                            <>
                                <Ionicons name="close-circle" size={20} color={COLORS.white} />
                                <Text style={styles.cancelButtonText}>Cancelar Sorteo</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )} */}
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
        fontSize: 18,
        fontWeight: '600',
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
        fontSize: 16,
        color: COLORS.text.secondary,
    },

    // Error
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.bg.primary,
        padding: 40,
        gap: 16,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    backButton: {
        marginTop: 16,
        backgroundColor: COLORS.accent.blue,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    backButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.white,
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: COLORS.status.errorBg,
        padding: 12,
        marginHorizontal: 20,
        marginTop: 16,
        borderRadius: 12,
    },
    errorBannerText: {
        flex: 1,
        fontSize: 13,
        color: COLORS.status.error,
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
        backgroundColor: COLORS.bg.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
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
        color: COLORS.text.primary,
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
        color: COLORS.text.secondary,
        textTransform: 'capitalize',
    },
    winningNumberSection: {
        backgroundColor: COLORS.status.infoBg,
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        gap: 12,
    },
    winningNumberLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.text.secondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    winningNumberBadge: {
        backgroundColor: COLORS.accent.blue,
        borderRadius: 28,
        paddingHorizontal: 32,
        paddingVertical: 12,
    },
    winningNumber: {
        fontSize: 36,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    notesContainer: {
        flexDirection: 'row',
        gap: 10,
        padding: 12,
        backgroundColor: COLORS.bg.elevated,
        borderRadius: 8,
    },
    notesText: {
        flex: 1,
        fontSize: 14,
        color: COLORS.text.secondary,
        lineHeight: 20,
    },

    // Stats Card
    statsCard: {
        backgroundColor: COLORS.bg.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    statBox: {
        flex: 1,
        backgroundColor: COLORS.bg.elevated,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        gap: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text.primary,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.text.secondary,
        textAlign: 'center',
    },

    // System Card
    systemCard: {
        backgroundColor: COLORS.bg.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: 12,
    },
    systemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: 8,
    },
    systemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    systemLabel: {
        fontSize: 13,
        color: COLORS.text.secondary,
    },
    systemValue: {
        flex: 1,
        fontSize: 13,
        color: COLORS.text.primary,
        fontWeight: '500',
    },

    // Winners Section
    winnersSection: {
        marginBottom: 16,
    },

    // Info Card
    infoCard: {
        backgroundColor: COLORS.status.infoBg,
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
        color: COLORS.text.secondary,
        lineHeight: 20,
    },

    // Cancel Button
    cancelButton: {
        backgroundColor: COLORS.status.error,
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
        color: COLORS.white,
    },
});
