// app/draw/winners-report.tsx
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { WebView } from 'react-native-webview';
import { useTheme } from '../../src/contexts/ThemeContext';
import { CustomAlert } from '../../src/components/ui/CustomAlert';
import { useAlert } from '../../src/hooks/useAlert';
import { drawsApi } from '../../src/api/draws.api';

export default function WinnersReportScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const alert = useAlert();

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [pdfBase64, setPdfBase64] = useState<string | null>(null);
    const [pdfUri, setPdfUri] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleBack = () => {
        if (pdfBase64) {
            setPdfBase64(null);
            setPdfUri(null);
            setError(null);
        } else {
            router.back();
        }
    };

    const handleDateChange = (_event: DateTimePickerEvent, date?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (date) {
            setSelectedDate(date);
        }
    };

    const handleDownloadReport = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            setPdfBase64(null);
            setPdfUri(null);

            console.log('Descargando reporte para fecha:', selectedDate);

            // Obtener el PDF y su base64
            const result = await drawsApi.getWinnersReportPdfWithBase64(selectedDate);
            console.log('PDF descargado, base64 length:', result.base64.length);

            setPdfBase64(result.base64);
            setPdfUri(result.uri);
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

    // HTML que renderiza el PDF usando PDF.js de Mozilla
    const getPdfHtml = (base64: string) => `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=4.0, user-scalable=yes">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                html, body {
                    width: 100%;
                    height: 100%;
                    background-color: ${isDark ? '#242832' : '#f5f5f5'};
                    overflow-x: hidden;
                    overflow-y: auto;
                }
                #pdf-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 10px;
                    gap: 10px;
                }
                canvas {
                    display: block;
                    margin: 0 auto;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                    background: white;
                }
                #loading {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: ${isDark ? '#94a3b8' : '#64748b'};
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 16px;
                    text-align: center;
                }
                #loading .spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid ${isDark ? '#3a4150' : '#e2e8f0'};
                    border-top-color: #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 15px;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                #error {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: #ef4444;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 14px;
                    text-align: center;
                    padding: 20px;
                    display: none;
                }
                #page-info {
                    position: fixed;
                    bottom: 10px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0,0,0,0.7);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 12px;
                    z-index: 100;
                }
            </style>
        </head>
        <body>
            <div id="loading">
                <div class="spinner"></div>
                Cargando PDF...
            </div>
            <div id="error"></div>
            <div id="pdf-container"></div>
            <div id="page-info" style="display:none;"></div>

            <script>
                const pdfData = atob('${base64}');
                const pdfjsLib = window['pdfjs-dist/build/pdf'];
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

                const loadingEl = document.getElementById('loading');
                const errorEl = document.getElementById('error');
                const container = document.getElementById('pdf-container');
                const pageInfo = document.getElementById('page-info');

                async function renderPDF() {
                    try {
                        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
                        const pdf = await loadingTask.promise;

                        loadingEl.style.display = 'none';
                        const totalPages = pdf.numPages;
                        pageInfo.textContent = totalPages + ' página' + (totalPages > 1 ? 's' : '');
                        pageInfo.style.display = 'block';

                        const screenWidth = window.innerWidth - 20;
                        // Factor de alta resolución para mejor calidad al hacer zoom
                        const pixelRatio = window.devicePixelRatio || 2;
                        const hiResScale = Math.max(pixelRatio, 2.5);

                        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
                            const page = await pdf.getPage(pageNum);
                            const viewport = page.getViewport({ scale: 1 });

                            // Calcular escala para ajustar al ancho de pantalla
                            const displayScale = screenWidth / viewport.width;
                            // Viewport de alta resolución para renderizar
                            const hiResViewport = page.getViewport({ scale: displayScale * hiResScale });
                            // Viewport para display
                            const displayViewport = page.getViewport({ scale: displayScale });

                            const canvas = document.createElement('canvas');
                            const context = canvas.getContext('2d');

                            // Canvas en alta resolución
                            canvas.height = hiResViewport.height;
                            canvas.width = hiResViewport.width;

                            // Mostrar en tamaño de pantalla (CSS)
                            canvas.style.width = displayViewport.width + 'px';
                            canvas.style.height = displayViewport.height + 'px';

                            await page.render({
                                canvasContext: context,
                                viewport: hiResViewport
                            }).promise;

                            container.appendChild(canvas);
                        }

                        // Ocultar info de páginas después de 3 segundos
                        setTimeout(() => {
                            pageInfo.style.opacity = '0';
                            pageInfo.style.transition = 'opacity 0.5s';
                        }, 3000);

                    } catch (error) {
                        console.error('Error rendering PDF:', error);
                        loadingEl.style.display = 'none';
                        errorEl.style.display = 'block';
                        errorEl.textContent = 'Error al cargar el PDF: ' + error.message;
                    }
                }

                renderPDF();
            </script>
        </body>
        </html>
    `;

    return (
        <View style={[styles.container, { backgroundColor: colors.bg.primary }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.bg.card, borderBottomColor: colors.border.default }]}>
                <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.bg.elevated }]} onPress={handleBack}>
                    <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
                        {pdfBase64 ? 'Reporte de Ganadores' : 'Seleccionar Fecha'}
                    </Text>
                    {pdfBase64 && (
                        <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>
                            {formatShortDate(selectedDate)}
                        </Text>
                    )}
                </View>
                {pdfBase64 ? (
                    <TouchableOpacity style={[styles.shareBtn, { backgroundColor: colors.bg.elevated }]} onPress={handleShareReport}>
                        <Ionicons name="share-outline" size={24} color={colors.brand.primary} />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 40 }} />
                )}
            </View>

            {/* Content */}
            {!pdfBase64 ? (
                // Date Selector View
                <View style={styles.selectorContainer}>
                    <View style={[styles.card, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.accent.orange + '25' }]}>
                            <Ionicons name="trophy" size={48} color={colors.accent.orange} />
                        </View>

                        <Text style={[styles.title, { color: colors.text.primary }]}>Ganadores de Club de Mercancía</Text>
                        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
                            Selecciona la fecha del sorteo para ver el reporte de ganadores
                        </Text>

                        {/* Date Picker Button */}
                        <TouchableOpacity
                            style={[styles.dateButton, { backgroundColor: colors.bg.elevated }]}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Ionicons name="calendar" size={20} color={colors.brand.primary} />
                            <Text style={[styles.dateButtonText, { color: colors.text.primary }]}>
                                {formatDate(selectedDate)}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
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
                            style={[styles.downloadButton, { backgroundColor: colors.brand.primary }, isLoading && styles.downloadButtonDisabled]}
                            onPress={handleDownloadReport}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <ActivityIndicator size="small" color={colors.white} />
                                    <Text style={[styles.downloadButtonText, { color: colors.white }]}>Descargando...</Text>
                                </>
                            ) : (
                                <>
                                    <Ionicons name="document-text" size={20} color={colors.white} />
                                    <Text style={[styles.downloadButtonText, { color: colors.white }]}>Ver Reporte</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Error Message */}
                        {error && (
                            <View style={[styles.errorContainer, { backgroundColor: colors.status.errorBg }]}>
                                <Ionicons name="alert-circle" size={16} color={colors.status.error} />
                                <Text style={[styles.errorText, { color: colors.status.error }]}>{error}</Text>
                            </View>
                        )}
                    </View>

                    {/* Info Card */}
                    <View style={[styles.infoCard, { backgroundColor: colors.status.infoBg }]}>
                        <Ionicons name="information-circle" size={20} color={colors.brand.primary} />
                        <Text style={[styles.infoText, { color: colors.text.secondary }]}>
                            El reporte muestra todos los ganadores del sorteo de la fecha seleccionada,
                            incluyendo número de contrato, cliente y premio.
                        </Text>
                    </View>
                </View>
            ) : (
                // PDF Viewer con WebView
                <View style={styles.pdfContainer}>
                    <WebView
                        source={{ html: getPdfHtml(pdfBase64) }}
                        style={[styles.webview, { backgroundColor: colors.bg.secondary }]}
                        originWhitelist={['*']}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        startInLoadingState={true}
                        scalesPageToFit={true}
                        allowFileAccess={true}
                        allowFileAccessFromFileURLs={true}
                        allowUniversalAccessFromFileURLs={true}
                        mixedContentMode="always"
                        renderLoading={() => (
                            <View style={[styles.loadingOverlay, { backgroundColor: colors.bg.primary }]}>
                                <ActivityIndicator size="large" color={colors.brand.primary} />
                                <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Cargando PDF...</Text>
                            </View>
                        )}
                        onError={(syntheticEvent) => {
                            const { nativeEvent } = syntheticEvent;
                            console.error('WebView error:', nativeEvent);
                        }}
                    />

                    {/* Bottom Actions */}
                    <View style={[styles.bottomActions, { backgroundColor: colors.bg.card, borderTopColor: colors.border.default }]}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.brand.primary }]}
                            onPress={handleShareReport}
                        >
                            <Ionicons name="share-outline" size={20} color={colors.white} />
                            <Text style={[styles.actionButtonText, { color: colors.white }]}>Compartir</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.actionButtonSecondary, { borderColor: colors.brand.primary }]}
                            onPress={() => {
                                setPdfBase64(null);
                                setPdfUri(null);
                                setError(null);
                            }}
                        >
                            <Ionicons name="calendar-outline" size={20} color={colors.brand.primary} />
                            <Text style={[styles.actionButtonText, { color: colors.brand.primary }]}>
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
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 56,
        paddingHorizontal: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shareBtn: {
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
    headerSubtitle: {
        fontSize: 12,
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
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },

    // Date Button
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        width: '100%',
        marginBottom: 16,
    },
    dateButtonText: {
        flex: 1,
        fontSize: 15,
        textTransform: 'capitalize',
    },

    // Download Button
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
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
    },

    // Error
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 16,
        padding: 12,
        borderRadius: 8,
        width: '100%',
    },
    errorText: {
        flex: 1,
        fontSize: 13,
    },

    // Info Card
    infoCard: {
        flexDirection: 'row',
        gap: 12,
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },

    // PDF Container
    pdfContainer: {
        flex: 1,
    },
    webview: {
        flex: 1,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
    },

    // Bottom Actions
    bottomActions: {
        flexDirection: 'row',
        gap: 12,
        padding: 16,
        paddingBottom: 24,
        borderTopWidth: 1,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 12,
        paddingVertical: 14,
    },
    actionButtonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
    },
    actionButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
});
