// app/(tabs)/my-profile.tsx - Perfil del cliente
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuthStore } from '../../src/stores/auth-store';
import { ThemeSelector } from '../../src/components/ui/ThemeSelector';
import QRCode from 'react-native-qrcode-svg';

export default function MyProfileScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { user, logout, tenantName } = useAuthStore();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            setShowLogoutModal(false);
            router.replace('/');
        } catch (error) {
            console.error('Error logging out:', error);
            setIsLoggingOut(false);
        }
    };

    const qrValue = JSON.stringify({
        type: 'CLUB_MEMBER',
        id: user?.customerId || user?.id,
        doc: user?.identificationNumber,
        v: 1,
    });

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.primary }]} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <Text style={[styles.pageTitle, { color: colors.text.primary }]}>Mi Perfil</Text>

                {/* Tarjeta de perfil */}
                <View style={[styles.profileCard, { backgroundColor: colors.brand.primary }]}>
                    <View style={styles.profileHeader}>
                        <View style={[styles.avatar, { backgroundColor: colors.white + '20' }]}>
                            <Text style={[styles.avatarText, { color: colors.white }]}>
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </Text>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={[styles.profileName, { color: colors.white }]}>
                                {user?.name || 'Usuario'}
                            </Text>
                            <Text style={[styles.profileEmail, { color: colors.white + '90' }]}>
                                {user?.email}
                            </Text>
                        </View>
                    </View>

                    {/* QR Code */}
                    <View style={styles.qrSection}>
                        <View style={[styles.qrWrapper, { backgroundColor: colors.white }]}>
                            <QRCode
                                value={qrValue}
                                size={100}
                                backgroundColor={colors.white}
                                color={colors.brand.primary}
                            />
                        </View>
                        <View style={styles.qrInfo}>
                            <Text style={[styles.qrLabel, { color: colors.white + '80' }]}>
                                Código de Miembro
                            </Text>
                            <Text style={[styles.qrId, { color: colors.white }]}>
                                {user?.identificationNumber || 'N/A'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Información personal */}
                <View style={[styles.section, { backgroundColor: colors.bg.card }]}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="person" size={20} color={colors.brand.primary} />
                        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                            Información Personal
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: colors.text.muted }]}>Nombre</Text>
                        <Text style={[styles.infoValue, { color: colors.text.primary }]}>
                            {user?.name || 'No disponible'}
                        </Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border.light }]} />

                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: colors.text.muted }]}>Email</Text>
                        <Text style={[styles.infoValue, { color: colors.text.primary }]}>
                            {user?.email || 'No disponible'}
                        </Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border.light }]} />

                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: colors.text.muted }]}>Identificación</Text>
                        <Text style={[styles.infoValue, { color: colors.text.primary }]}>
                            {user?.identificationNumber || 'No disponible'}
                        </Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border.light }]} />

                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: colors.text.muted }]}>Empresa</Text>
                        <Text style={[styles.infoValue, { color: colors.text.primary }]}>
                            {tenantName || 'No disponible'}
                        </Text>
                    </View>
                </View>

                {/* Selector de tema */}
                <ThemeSelector />

                {/* Opciones */}
                <View style={[styles.section, { backgroundColor: colors.bg.card }]}>
                    <TouchableOpacity
                        style={styles.optionRow}
                        onPress={() => {/* TODO: Notificaciones */ }}
                    >
                        <View style={[styles.optionIcon, { backgroundColor: colors.status.info + '15' }]}>
                            <Ionicons name="notifications" size={20} color={colors.status.info} />
                        </View>
                        <Text style={[styles.optionText, { color: colors.text.primary }]}>
                            Notificaciones
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                    </TouchableOpacity>

                    <View style={[styles.divider, { backgroundColor: colors.border.light }]} />

                    <TouchableOpacity
                        style={styles.optionRow}
                        onPress={() => {/* TODO: Ayuda */ }}
                    >
                        <View style={[styles.optionIcon, { backgroundColor: colors.brand.primary + '15' }]}>
                            <Ionicons name="help-circle" size={20} color={colors.brand.primary} />
                        </View>
                        <Text style={[styles.optionText, { color: colors.text.primary }]}>
                            Ayuda y Soporte
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                    </TouchableOpacity>

                    <View style={[styles.divider, { backgroundColor: colors.border.light }]} />

                    <TouchableOpacity
                        style={styles.optionRow}
                        onPress={() => {/* TODO: Términos */ }}
                    >
                        <View style={[styles.optionIcon, { backgroundColor: colors.accent.purple + '15' }]}>
                            <Ionicons name="document-text" size={20} color={colors.accent.purple} />
                        </View>
                        <Text style={[styles.optionText, { color: colors.text.primary }]}>
                            Términos y Condiciones
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                    </TouchableOpacity>
                </View>

                {/* Botón de cerrar sesión */}
                <TouchableOpacity
                    style={[styles.logoutBtn, { backgroundColor: colors.status.error + '15' }]}
                    onPress={() => setShowLogoutModal(true)}
                >
                    <Ionicons name="log-out" size={20} color={colors.status.error} />
                    <Text style={[styles.logoutText, { color: colors.status.error }]}>
                        Cerrar Sesión
                    </Text>
                </TouchableOpacity>

                {/* Versión */}
                <Text style={[styles.version, { color: colors.text.muted }]}>
                    Club de Mercancías v1.0.0
                </Text>
            </ScrollView>

            {/* Modal de Cerrar Sesión - Premium */}
            <Modal
                visible={showLogoutModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowLogoutModal(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => !isLoggingOut && setShowLogoutModal(false)}
                >
                    <Pressable style={[styles.modalContent, { backgroundColor: colors.bg.card }]}>
                        {/* Icon with gradient background */}
                        <LinearGradient
                            colors={['#fee2e2', '#fecaca']}
                            style={styles.modalIconContainer}
                        >
                            <View style={styles.modalIconInner}>
                                <Ionicons name="log-out-outline" size={32} color="#dc2626" />
                            </View>
                        </LinearGradient>

                        {/* Title */}
                        <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                            ¿Cerrar sesión?
                        </Text>

                        {/* Description */}
                        <Text style={[styles.modalDescription, { color: colors.text.secondary }]}>
                            Tendrás que volver a iniciar sesión para acceder a tu cuenta y ver tus clubes.
                        </Text>

                        {/* User info pill */}
                        <View style={[styles.modalUserPill, { backgroundColor: colors.bg.elevated }]}>
                            <View style={[styles.modalUserAvatar, { backgroundColor: colors.brand.primary }]}>
                                <Text style={styles.modalUserAvatarText}>
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </Text>
                            </View>
                            <View style={styles.modalUserInfo}>
                                <Text style={[styles.modalUserName, { color: colors.text.primary }]} numberOfLines={1}>
                                    {user?.name || 'Usuario'}
                                </Text>
                                <Text style={[styles.modalUserEmail, { color: colors.text.muted }]} numberOfLines={1}>
                                    {user?.email}
                                </Text>
                            </View>
                        </View>

                        {/* Buttons */}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtnCancel, { backgroundColor: colors.bg.elevated }]}
                                onPress={() => setShowLogoutModal(false)}
                                disabled={isLoggingOut}
                            >
                                <Text style={[styles.modalBtnCancelText, { color: colors.text.primary }]}>
                                    Cancelar
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalBtnConfirm, isLoggingOut && styles.modalBtnDisabled]}
                                onPress={handleLogout}
                                disabled={isLoggingOut}
                            >
                                <LinearGradient
                                    colors={isLoggingOut ? ['#9ca3af', '#9ca3af'] : ['#ef4444', '#dc2626']}
                                    style={styles.modalBtnConfirmGradient}
                                >
                                    {isLoggingOut ? (
                                        <Text style={styles.modalBtnConfirmText}>Cerrando...</Text>
                                    ) : (
                                        <>
                                            <Ionicons name="log-out-outline" size={18} color="white" />
                                            <Text style={styles.modalBtnConfirmText}>Cerrar Sesión</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 20,
    },

    // Profile Card
    profileCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '700',
    },
    profileInfo: {
        marginLeft: 16,
        flex: 1,
    },
    profileName: {
        fontSize: 20,
        fontWeight: '700',
    },
    profileEmail: {
        fontSize: 14,
        marginTop: 2,
    },
    qrSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    qrWrapper: {
        padding: 8,
        borderRadius: 12,
    },
    qrInfo: {
        flex: 1,
    },
    qrLabel: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    qrId: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 4,
    },

    // Section
    section: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
    },

    // Info Row
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    infoLabel: {
        fontSize: 14,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        marginVertical: 4,
    },

    // Option Row
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    optionIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    optionText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
    },

    // Logout
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        borderRadius: 16,
        marginTop: 8,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
    },

    // Version
    version: {
        textAlign: 'center',
        fontSize: 12,
        marginTop: 24,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    modalIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalIconInner: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#dc2626',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalDescription: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        marginBottom: 20,
    },
    modalUserPill: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        marginBottom: 24,
        width: '100%',
    },
    modalUserAvatar: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalUserAvatarText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    modalUserInfo: {
        marginLeft: 12,
        flex: 1,
    },
    modalUserName: {
        fontSize: 14,
        fontWeight: '600',
    },
    modalUserEmail: {
        fontSize: 12,
        marginTop: 2,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    modalBtnCancel: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    modalBtnCancelText: {
        fontSize: 15,
        fontWeight: '600',
    },
    modalBtnConfirm: {
        flex: 1,
        borderRadius: 14,
        overflow: 'hidden',
    },
    modalBtnConfirmGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 6,
    },
    modalBtnConfirmText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
    },
    modalBtnDisabled: {
        opacity: 0.7,
    },
});
