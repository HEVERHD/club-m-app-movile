// src/components/scanner/QRScanner.tsx
import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface QRScannerProps {
    visible: boolean;
    onClose: () => void;
    onScan: (data: QRData) => void;
}

export interface QRData {
    type: string;
    id?: string;
    doc?: string;
    v?: number;
    raw: string;
}

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

export function QRScanner({ visible, onClose, onScan }: QRScannerProps) {
    const { colors } = useTheme();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        if (visible) {
            setScanned(false);
        }
    }, [visible]);

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        if (scanned) return;
        setScanned(true);

        try {
            // Intentar parsear como JSON (formato de QR de miembro)
            const parsed = JSON.parse(data);

            if (parsed.type === 'CLUB_MEMBER') {
                onScan({
                    type: parsed.type,
                    id: parsed.id,
                    doc: parsed.doc,
                    v: parsed.v,
                    raw: data,
                });
            } else {
                // Otro tipo de QR
                onScan({
                    type: 'UNKNOWN',
                    raw: data,
                });
            }
        } catch {
            // No es JSON, tratar como texto plano (podría ser cédula)
            onScan({
                type: 'TEXT',
                doc: data,
                raw: data,
            });
        }
    };

    const renderContent = () => {
        if (!permission) {
            return (
                <View style={styles.centeredContent}>
                    <ActivityIndicator size="large" color={colors.brand.primary} />
                    <Text style={[styles.messageText, { color: colors.text.primary }]}>
                        Cargando cámara...
                    </Text>
                </View>
            );
        }

        if (!permission.granted) {
            return (
                <View style={styles.centeredContent}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.status.warning + '20' }]}>
                        <Ionicons name="camera-outline" size={48} color={colors.status.warning} />
                    </View>
                    <Text style={[styles.messageTitle, { color: colors.text.primary }]}>
                        Permiso de Cámara
                    </Text>
                    <Text style={[styles.messageText, { color: colors.text.secondary }]}>
                        Necesitamos acceso a la cámara para escanear códigos QR de miembros
                    </Text>
                    <TouchableOpacity
                        style={[styles.permissionBtn, { backgroundColor: colors.brand.primary }]}
                        onPress={requestPermission}
                    >
                        <Text style={[styles.permissionBtnText, { color: colors.white }]}>
                            Permitir Acceso
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <CameraView
                style={StyleSheet.absoluteFillObject}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            >
                {/* Overlay oscuro con hueco central */}
                <View style={styles.overlay}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={[styles.closeBtn, { backgroundColor: colors.white + '20' }]}
                            onPress={onClose}
                        >
                            <Ionicons name="close" size={28} color={colors.white} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: colors.white }]}>
                            Escanear QR de Miembro
                        </Text>
                        <View style={{ width: 44 }} />
                    </View>

                    {/* Área de escaneo */}
                    <View style={styles.scanAreaContainer}>
                        <View style={styles.scanArea}>
                            {/* Esquinas del área de escaneo */}
                            <View style={[styles.corner, styles.cornerTL, { borderColor: colors.brand.secondary }]} />
                            <View style={[styles.corner, styles.cornerTR, { borderColor: colors.brand.secondary }]} />
                            <View style={[styles.corner, styles.cornerBL, { borderColor: colors.brand.secondary }]} />
                            <View style={[styles.corner, styles.cornerBR, { borderColor: colors.brand.secondary }]} />
                        </View>
                    </View>

                    {/* Instrucciones */}
                    <View style={styles.footer}>
                        <Text style={[styles.instructions, { color: colors.white }]}>
                            Apunta la cámara al código QR del cliente
                        </Text>
                        {scanned && (
                            <TouchableOpacity
                                style={[styles.rescanBtn, { backgroundColor: colors.brand.primary }]}
                                onPress={() => setScanned(false)}
                            >
                                <Ionicons name="refresh" size={20} color={colors.white} />
                                <Text style={[styles.rescanBtnText, { color: colors.white }]}>
                                    Escanear de nuevo
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </CameraView>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor: colors.black }]}>
                {renderContent()}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centeredContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    messageTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    messageText: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    permissionBtn: {
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
    },
    permissionBtnText: {
        fontSize: 16,
        fontWeight: '600',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 20,
    },
    closeBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    scanAreaContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanArea: {
        width: SCAN_AREA_SIZE,
        height: SCAN_AREA_SIZE,
        backgroundColor: 'transparent',
        borderRadius: 20,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderWidth: 4,
    },
    cornerTL: {
        top: 0,
        left: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderTopLeftRadius: 20,
    },
    cornerTR: {
        top: 0,
        right: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
        borderTopRightRadius: 20,
    },
    cornerBL: {
        bottom: 0,
        left: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
        borderBottomLeftRadius: 20,
    },
    cornerBR: {
        bottom: 0,
        right: 0,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderBottomRightRadius: 20,
    },
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 60,
        alignItems: 'center',
    },
    instructions: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 20,
    },
    rescanBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    rescanBtnText: {
        fontSize: 15,
        fontWeight: '600',
    },
});
