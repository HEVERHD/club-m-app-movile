// src/components/customers/QRCodeCard.tsx
import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Dimensions,
    Share,
    Platform,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface QRCodeCardProps {
    customerId: string;
    identificationNumber: string;
    customerName: string;
}

export function QRCodeCard({ customerId, identificationNumber, customerName }: QRCodeCardProps) {
    const { colors, isDark } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);
    const qrRef = useRef<any>(null);

    // Generar el valor del QR con datos del cliente
    const qrValue = JSON.stringify({
        type: 'CLUB_MEMBER',
        id: customerId,
        doc: identificationNumber,
        v: 1, // versión del formato
    });

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Código de miembro: ${identificationNumber}\nCliente: ${customerName}`,
                title: 'Código de Miembro - Club de Mercancías',
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <>
            {/* Card compacta */}
            <View style={[styles.card, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                <View style={styles.cardHeader}>
                    <View style={styles.titleRow}>
                        <Ionicons name="qr-code" size={20} color={colors.accent.blue} />
                        <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Código de Miembro</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.expandBtn, { backgroundColor: colors.accent.blue + '15' }]}
                        onPress={() => setModalVisible(true)}
                    >
                        <Ionicons name="expand-outline" size={20} color={colors.accent.blue} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.qrContainer}
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.8}
                >
                    <View style={[styles.qrWrapper, { backgroundColor: colors.white }]}>
                        <QRCode
                            value={qrValue}
                            size={120}
                            backgroundColor={colors.white}
                            color={isDark ? colors.bg.primary : '#1a1d24'}
                        />
                    </View>
                    <View style={styles.qrInfo}>
                        <Text style={[styles.docLabel, { color: colors.text.secondary }]}>Cédula</Text>
                        <Text style={[styles.docNumber, { color: colors.text.primary }]}>{identificationNumber}</Text>
                        <Text style={[styles.tapHint, { color: colors.accent.blue }]}>Toca para ampliar</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Modal con QR grande */}
            <Modal
                visible={modalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.bg.card }]}>
                        {/* Header del modal */}
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text.primary }]}>Código de Miembro</Text>
                            <TouchableOpacity
                                style={[styles.closeBtn, { backgroundColor: colors.bg.elevated }]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Ionicons name="close" size={24} color={colors.text.primary} />
                            </TouchableOpacity>
                        </View>

                        {/* Nombre del cliente */}
                        <Text style={[styles.customerName, { color: colors.text.secondary }]}>{customerName}</Text>

                        {/* QR Grande */}
                        <View style={[styles.qrLargeWrapper, { backgroundColor: colors.white }]}>
                            <QRCode
                                value={qrValue}
                                size={SCREEN_WIDTH * 0.6}
                                backgroundColor={colors.white}
                                color={isDark ? colors.bg.primary : '#1a1d24'}
                                getRef={(ref) => (qrRef.current = ref)}
                            />
                        </View>

                        {/* Cédula */}
                        <View style={styles.docContainer}>
                            <Text style={[styles.docLabelLarge, { color: colors.text.secondary }]}>Cédula</Text>
                            <Text style={[styles.docNumberLarge, { color: colors.text.primary }]}>{identificationNumber}</Text>
                        </View>

                        {/* Instrucciones */}
                        <View style={[styles.instructions, { backgroundColor: colors.bg.elevated }]}>
                            <Ionicons name="scan-outline" size={20} color={colors.text.secondary} />
                            <Text style={[styles.instructionsText, { color: colors.text.secondary }]}>
                                Presenta este código en el punto de venta para identificarte como miembro del club
                            </Text>
                        </View>

                        {/* Botones de acción */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.shareBtn, { backgroundColor: colors.accent.blue + '15' }]}
                                onPress={handleShare}
                            >
                                <Ionicons name="share-outline" size={20} color={colors.accent.blue} />
                                <Text style={[styles.shareBtnText, { color: colors.accent.blue }]}>Compartir</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    // Card compacta
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    expandBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qrContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    qrWrapper: {
        padding: 10,
        borderRadius: 12,
    },
    qrInfo: {
        flex: 1,
    },
    docLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    docNumber: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    tapHint: {
        fontSize: 12,
        fontStyle: 'italic',
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    customerName: {
        fontSize: 16,
        marginBottom: 24,
    },
    qrLargeWrapper: {
        padding: 20,
        borderRadius: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    docContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    docLabelLarge: {
        fontSize: 14,
        marginBottom: 4,
    },
    docNumberLarge: {
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: 2,
    },
    instructions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 14,
        borderRadius: 12,
        marginBottom: 20,
    },
    instructionsText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    shareBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
    },
    shareBtnText: {
        fontSize: 15,
        fontWeight: '600',
    },
});
