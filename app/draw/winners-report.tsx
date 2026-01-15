// app/draw/winners-report.tsx
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Pdf from 'react-native-pdf';
import { COLORS } from '../../src/constants/colors';
import { CustomAlert } from '../../src/components/ui/CustomAlert';
import { useAlert } from '../../src/hooks/useAlert';
import { drawsApi } from '../../src/api/draws.api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function WinnersReportScreen() {
    const router = useRouter();
    const alert = useAlert();

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [pdfUri, setPdfUri] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const handleBack = () => {
        if (pdfUri) {
            setPdfUri(null);
            setError(null);
            setCurrentPage(1);
            setTotalPages(0);
        } else {
            router.back();
        }
    };

    const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (date) {
            setSelectedDate(date);
        }
    };

    const handleDownloadReport = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            setPdfUri(null);

            console.log('Descargando reporte para fecha:', selectedDate);

            const fileUri = await drawsApi.getWinnersReportPdf(selectedDate);
            console.log('PDF descargado en:', fileUri);

            setPdfUri(fileUri);
        } catch (err: any) {
            console.error('Error descargando reporte:', err);
            setError(err.message || 'Error al descargar el reporte');
            alert.showError('Error', err.message || 'No se pudo descargar el reporte de ganadores');
        } finally {
            setIsLoading(false);
        }
    }, [selectedDate, alert]);

    const handleShareReport = useCallback(async () => {
        if (!pdfUri) return;

        try {
            await drawsApi.shareWinnersReport(pdfUri);
        } catch (err: any) {
            alert.showError('Error', err.message || 'No se pudo compartir el reporte');
        }
    }, [pdfUri, alert]);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('es-PA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatShortDate = (date: Date) => {
        return date.toLocaleDateString('es-PA', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>
                        {pdfUri ? 'Reporte de Ganadores' : 'Seleccionar Fecha'}
                    </Text>
                    {pdfUri && totalPages > 0 && (
                        <Text style={styles.headerSubtitle}>
                            {formatShortDate(selectedDate)} - Pág. {currentPage}/{totalPages}
                        </Text>
                    )}
                </View>
                {pdfUri ? (
                    <TouchableOpacity style={styles.shareBtn} onPress={handleShareReport}>
                        <Ionicons name="share-outline" size={24} color={COLORS.accent.blue} />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 40 }} />
                )}
            </View>

            {/* Content */}
            {!pdfUri ? (
                // Date Selector View
                <View style={styles.selectorContainer}>
                    <View style={styles.card}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="trophy" size={48} color={COLORS.accent.orange} />
                        </View>

                        <Text style={styles.title}>Ganadores de Club de Mercancía</Text>
                        <Text style={styles.subtitle}>
                            Selecciona la fecha del sorteo para ver el reporte de ganadores
                        </Text>

                        {/* Date Picker Button */}
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Ionicons name="calendar" size={20} color={COLORS.accent.blue} />
                            <Text style={styles.dateButtonText}>
                                {formatDate(selectedDate)}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color={COLORS.text.secondary} />
                        </TouchableOpacity>

                        {/* Date Picker Modal */}
                        {showDatePicker && (
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={handleDateChange}
                                maximumDate={new Date()}
                            />
                        )}

                        {/* Download Button */}
                        <TouchableOpacity
                            style={[styles.downloadButton, isLoading && styles.downloadButtonDisabled]}
                            onPress={handleDownloadReport}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <ActivityIndicator size="small" color={COLORS.white} />
                                    <Text style={styles.downloadButtonText}>Descargando...</Text>
                                </>
                            ) : (
                                <>
                                    <Ionicons name="document-text" size={20} color={COLORS.white} />
                                    <Text style={styles.downloadButtonText}>Ver Reporte</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Error Message */}
                        {error && (
                            <View style={styles.errorContainer}>
                                <Ionicons name="alert-circle" size={16} color={COLORS.status.error} />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}
                    </View>

                    {/* Info Card */}
                    <View style={styles.infoCard}>
                        <Ionicons name="information-circle" size={20} color={COLORS.accent.blue} />
                        <Text style={styles.infoText}>
                            El reporte muestra todos los ganadores del sorteo de la fecha seleccionada,
                            incluyendo número de contrato, cliente y premio.
                        </Text>
                    </View>
                </View>
            ) : (
                // PDF Viewer
                <View style={styles.pdfContainer}>
                    {pdfLoading && (
                        <View style={styles.pdfLoadingOverlay}>
                            <ActivityIndicator size="large" color={COLORS.accent.blue} />
                            <Text style={styles.pdfLoadingText}>Cargando PDF...</Text>
                        </View>
                    )}

                    <Pdf
                        source={{ uri: pdfUri }}
                        style={styles.pdf}
                        onLoadComplete={(numberOfPages) => {
                            console.log(`PDF cargado: ${numberOfPages} páginas`);
                            setTotalPages(numberOfPages);
                            setPdfLoading(false);
                        }}
                        onPageChanged={(page) => {
                            console.log(`Página actual: ${page}`);
                            setCurrentPage(page);
                        }}
                        onError={(error) => {
                            console.error('Error cargando PDF:', error);
                            setPdfLoading(false);
                            setError('Error al mostrar el PDF');
                            alert.showError('Error', 'No se pudo cargar el PDF. Intenta de nuevo.');
                        }}
                        onLoadProgress={(percent) => {
                            if (percent < 1) {
                                setPdfLoading(true);
                            }
                        }}
                        enablePaging={true}
                        horizontal={false}
                        fitPolicy={0}
                        spacing={10}
                        enableAntialiasing={true}
                        enableAnnotationRendering={true}
                    />

                    {/* Bottom Actions */}
                    <View style={styles.bottomActions}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleShareReport}
                        >
                            <Ionicons name="share-outline" size={20} color={COLORS.white} />
                            <Text style={styles.actionButtonText}>Compartir</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.actionButtonSecondary]}
                            onPress={() => {
                                setPdfUri(null);
                                setError(null);
                                setCurrentPage(1);
                                setTotalPages(0);
                            }}
                        >
                            <Ionicons name="calendar-outline" size={20} color={COLORS.accent.blue} />
                            <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
                                Otra Fecha
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
        paddingBottom: 12,
        backgroundColor: COLORS.bg.card,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.default,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: COLORS.bg.elevated,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shareBtn: {
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
    headerSubtitle: {
        fontSize: 12,
        color: COLORS.text.secondary,
        marginTop: 2,
    },

    // Selector Container
    selectorContainer: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },

    // Card
    card: {
        backgroundColor: COLORS.bg.card,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border.default,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text.primary,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.text.secondary,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },

    // Date Button
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: COLORS.bg.elevated,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        width: '100%',
        marginBottom: 16,
    },
    dateButtonText: {
        flex: 1,
        fontSize: 15,
        color: COLORS.text.primary,
        textTransform: 'capitalize',
    },

    // Download Button
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: COLORS.accent.blue,
        borderRadius: 12,
        paddingVertical: 16,
        width: '100%',
    },
    downloadButtonDisabled: {
        opacity: 0.7,
    },
    downloadButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.white,
    },

    // Error
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 16,
        padding: 12,
        backgroundColor: COLORS.status.errorBg,
        borderRadius: 8,
        width: '100%',
    },
    errorText: {
        flex: 1,
        fontSize: 13,
        color: COLORS.status.error,
    },

    // Info Card
    infoCard: {
        flexDirection: 'row',
        gap: 12,
        backgroundColor: COLORS.status.infoBg,
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: COLORS.text.secondary,
        lineHeight: 18,
    },

    // PDF Container
    pdfContainer: {
        flex: 1,
    },
    pdf: {
        flex: 1,
        width: SCREEN_WIDTH,
        backgroundColor: COLORS.bg.secondary,
    },
    pdfLoadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.bg.primary,
        zIndex: 10,
    },
    pdfLoadingText: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.text.secondary,
    },

    // Bottom Actions
    bottomActions: {
        flexDirection: 'row',
        gap: 12,
        padding: 16,
        paddingBottom: 24,
        backgroundColor: COLORS.bg.card,
        borderTopWidth: 1,
        borderTopColor: COLORS.border.default,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: COLORS.accent.blue,
        borderRadius: 12,
        paddingVertical: 14,
    },
    actionButtonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.accent.blue,
    },
    actionButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.white,
    },
    actionButtonTextSecondary: {
        color: COLORS.accent.blue,
    },
});
