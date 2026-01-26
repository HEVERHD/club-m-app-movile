// app/(tabs)/profile.tsx
import { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    ActivityIndicator, Switch, Modal, TextInput, KeyboardAvoidingView, Platform, Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useAuthStore } from '../../src/stores/auth-store';
import { useDashboardStore } from '../../src/stores/dashboard-store';
import { EnvironmentSelector } from '../../src/components/settings/EnvironmentSelector';
import { ThemeSelector } from '../../src/components/ui/ThemeSelector';
import { clearClubsCache } from '../../src/api/clubs.api';
import { CustomAlert } from '../../src/components/ui/CustomAlert';
import { useAlert } from '../../src/hooks/useAlert';
import { useBiometrics, getBiometricIcon, getBiometricLabel } from '../../src/hooks/useBiometrics';
import { useNotifications } from '../../src/hooks/useNotifications';
import { useCouponsFiltered } from '../../src/stores/coupons-store';
import { useNotificationsStore } from '../../src/stores/notifications-store';

export default function ProfileScreen() {
    const alert = useAlert();
    const queryClient = useQueryClient();
    const { colors } = useTheme();
    const { environment } = useSettingsStore();
    const { user, tenantName, tenantId, logout } = useAuthStore();
    const resetDashboard = useDashboardStore((state) => state.fetchDashboardData);

    const [isSyncing, setIsSyncing] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Coupons count
    const { availableCount: couponsCount } = useCouponsFiltered();
    // Notifications count
    const unreadNotifications = useNotificationsStore((state) => state.unreadCount);

    // Biometrics
    const {
        isAvailable: biometricAvailable,
        isEnabled: biometricEnabled,
        biometricType,
        isLoading: biometricLoading,
        enableBiometrics,
        disableBiometrics,
    } = useBiometrics();

    // Notifications
    const {
        isEnabled: notificationsEnabled,
        isLoading: notificationsLoading,
        toggleNotifications,
        sendTestNotification,
    } = useNotifications();

    const handleToggleNotifications = async (value: boolean) => {
        try {
            await toggleNotifications(value);
            if (value) {
                alert.showSuccess('Activado', 'Recibirás notificaciones de pagos, sorteos y más');
            } else {
                alert.showSuccess('Desactivado', 'No recibirás notificaciones push');
            }
        } catch (error: any) {
            alert.showError('Error', error.message || 'No se pudo cambiar la configuración');
        }
    };

    // Password modal for biometric setup
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [isEnabling, setIsEnabling] = useState(false);

    const handleToggleBiometrics = async (value: boolean) => {
        if (value) {
            // Mostrar modal para pedir contraseña
            setPasswordInput('');
            setShowPasswordModal(true);
        } else {
            try {
                await disableBiometrics();
                alert.showSuccess('Desactivado', 'Autenticación biométrica deshabilitada');
            } catch (error: any) {
                alert.showError('Error', error.message || 'No se pudo desactivar');
            }
        }
    };

    const handleConfirmBiometricSetup = async () => {
        if (!passwordInput.trim()) {
            alert.showError('Error', 'Ingresa tu contraseña');
            return;
        }

        setIsEnabling(true);
        try {
            await enableBiometrics({
                email: user?.email || '',
                password: passwordInput,
                tenantId: tenantId || 0,
            });
            setShowPasswordModal(false);
            setPasswordInput('');
            alert.showSuccess('Activado', `${getBiometricLabel(biometricType)} habilitado para iniciar sesión`);
        } catch (error: any) {
            alert.showError('Error', error.message || 'No se pudo habilitar');
        } finally {
            setIsEnabling(false);
        }
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            setShowLogoutModal(false);
            router.replace('/(auth)/company');
        } catch (error) {
            console.error('Error logging out:', error);
            setIsLoggingOut(false);
        }
    };

    const handleSyncData = async () => {
        setIsSyncing(true);
        try {
            // Invalidar todas las queries para forzar refetch
            await queryClient.invalidateQueries();
            // Recargar dashboard
            await resetDashboard();

            alert.showSuccess('Sincronizado', 'Los datos se han actualizado correctamente');
        } catch (error) {
            alert.showError('Error', 'No se pudieron sincronizar los datos');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleClearCache = () => {
        alert.showConfirm(
            'Limpiar Cache',
            '¿Estás seguro? Esto eliminará los datos almacenados temporalmente y tendrás que volver a cargarlos.',
            async () => {
                setIsClearing(true);
                try {
                    // Limpiar cache de React Query
                    queryClient.clear();

                    // Limpiar cache de clubes
                    clearClubsCache();

                    alert.showSuccess('Cache Limpiado', 'El cache ha sido eliminado. Los datos se cargarán nuevamente.');
                } catch (error) {
                    alert.showError('Error', 'No se pudo limpiar el cache');
                } finally {
                    setIsClearing(false);
                }
            },
            undefined,
            'Limpiar',
            'Cancelar'
        );
    };

    const getInitials = (name: string) => {
        return name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'US';
    };

    const currentYear = new Date().getFullYear();

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.bg.primary }]} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Perfil</Text>
                <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>Configuración y preferencias</Text>
            </View>

            {/* User Info Card */}
            <View style={[styles.userCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                <View style={[styles.avatar, { backgroundColor: colors.brand.primary }]}>
                    <Text style={styles.avatarText}>{getInitials(user?.name || 'Usuario')}</Text>
                </View>
                <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: colors.text.primary }]}>{user?.name || 'Usuario'}</Text>
                    <Text style={[styles.userEmail, { color: colors.text.secondary }]}>{user?.email || 'sin email'}</Text>
                    {tenantName && (
                        <View style={[styles.tenantBadge, { backgroundColor: colors.brand.secondary + '20' }]}>
                            <Ionicons name="business" size={12} color={colors.brand.secondary} />
                            <Text style={[styles.tenantText, { color: colors.brand.secondary }]}>{tenantName}</Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity style={[styles.editBtn, { backgroundColor: colors.bg.elevated }]}>
                    <Ionicons name="pencil" size={18} color={colors.brand.primary} />
                </TouchableOpacity>
            </View>

            {/* Theme Selector */}
            <View style={styles.section}>
                <ThemeSelector />
            </View>

            {/* Environment Selector */}
            <View style={styles.section}>
                <View style={[styles.sectionHeader, { borderColor: colors.border.default }]}>
                    <Ionicons name="settings-outline" size={20} color={colors.text.muted} />
                    <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Configuración de Desarrollo</Text>
                </View>
                <View style={[styles.sectionContent, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                    <EnvironmentSelector />
                </View>
            </View>

            {/* App Info */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="information-circle-outline" size={20} color={colors.text.muted} />
                    <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>Información de la App</Text>
                </View>
                <View style={[styles.sectionContent, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                    <View style={[styles.infoRow, { borderBottomColor: colors.border.default }]}>
                        <Text style={[styles.infoLabel, { color: colors.text.secondary }]}>Versión</Text>
                        <Text style={[styles.infoValue, { color: colors.text.primary }]}>1.0.0</Text>
                    </View>
                    <View style={[styles.infoRow, { borderBottomColor: colors.border.default }]}>
                        <Text style={[styles.infoLabel, { color: colors.text.secondary }]}>Entorno</Text>
                        <View style={[styles.envBadge, { backgroundColor: getEnvColor(environment) + '20' }]}>
                            <Text style={[styles.envBadgeText, { color: getEnvColor(environment) }]}>
                                {environment.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                        <Text style={[styles.infoLabel, { color: colors.text.secondary }]}>Build</Text>
                        <Text style={[styles.infoValue, { color: colors.text.primary }]}>{__DEV__ ? 'Development' : 'Production'}</Text>
                    </View>
                </View>
            </View>

            {/* Security & Notifications Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="shield-checkmark-outline" size={20} color={colors.text.muted} />
                    <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>Seguridad y Notificaciones</Text>
                </View>
                <View style={[styles.sectionContent, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                    {/* Biometric toggle */}
                    {biometricAvailable && (
                        <View style={[styles.biometricRow, { borderBottomColor: colors.border.default, borderBottomWidth: 1 }]}>
                            <View style={[styles.actionIcon, { backgroundColor: colors.brand.primary + '15' }]}>
                                <Ionicons
                                    name={getBiometricIcon(biometricType) as any}
                                    size={20}
                                    color={colors.brand.primary}
                                />
                            </View>
                            <View style={styles.biometricInfo}>
                                <Text style={[styles.biometricTitle, { color: colors.text.primary }]}>
                                    {getBiometricLabel(biometricType)}
                                </Text>
                                <Text style={[styles.biometricSubtitle, { color: colors.text.secondary }]}>
                                    Inicia sesión con {biometricType === 'facial' ? 'tu rostro' : 'tu huella'}
                                </Text>
                            </View>
                            {biometricLoading ? (
                                <ActivityIndicator size="small" color={colors.brand.primary} />
                            ) : (
                                <Switch
                                    value={biometricEnabled}
                                    onValueChange={handleToggleBiometrics}
                                    trackColor={{ false: colors.border.default, true: colors.brand.primary + '50' }}
                                    thumbColor={biometricEnabled ? colors.brand.primary : colors.bg.elevated}
                                />
                            )}
                        </View>
                    )}

                    {/* Notifications toggle */}
                    <View style={[styles.biometricRow, { borderBottomWidth: 0 }]}>
                        <View style={[styles.actionIcon, { backgroundColor: colors.accent.purple + '15' }]}>
                            <Ionicons name="notifications-outline" size={20} color={colors.accent.purple} />
                        </View>
                        <View style={styles.biometricInfo}>
                            <Text style={[styles.biometricTitle, { color: colors.text.primary }]}>
                                Notificaciones Push
                            </Text>
                            <Text style={[styles.biometricSubtitle, { color: colors.text.secondary }]}>
                                Recordatorios de pago y avisos
                            </Text>
                        </View>
                        {notificationsLoading ? (
                            <ActivityIndicator size="small" color={colors.accent.purple} />
                        ) : (
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={handleToggleNotifications}
                                trackColor={{ false: colors.border.default, true: colors.accent.purple + '50' }}
                                thumbColor={notificationsEnabled ? colors.accent.purple : colors.bg.elevated}
                            />
                        )}
                    </View>
                </View>
            </View>

            {/* Mis Beneficios */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="gift-outline" size={20} color={colors.text.muted} />
                    <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>Mis Beneficios</Text>
                </View>
                <View style={[styles.sectionContent, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { borderBottomColor: colors.border.default }]}
                        onPress={() => router.push('/coupons')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: colors.status.successBg }]}>
                            <Ionicons name="ticket-outline" size={20} color={colors.status.success} />
                        </View>
                        <Text style={[styles.actionText, { color: colors.text.primary }]}>Mis Cupones</Text>
                        {couponsCount > 0 && (
                            <View style={[styles.countBadge, { backgroundColor: colors.status.success }]}>
                                <Text style={styles.countBadgeText}>{couponsCount}</Text>
                            </View>
                        )}
                        <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionBtn, { borderBottomWidth: 0 }]}
                        onPress={() => router.push('/notifications')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: colors.accent.purple + '15' }]}>
                            <Ionicons name="notifications-outline" size={20} color={colors.accent.purple} />
                        </View>
                        <Text style={[styles.actionText, { color: colors.text.primary }]}>Notificaciones</Text>
                        {unreadNotifications > 0 && (
                            <View style={[styles.countBadge, { backgroundColor: colors.accent.purple }]}>
                                <Text style={styles.countBadgeText}>{unreadNotifications}</Text>
                            </View>
                        )}
                        <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="flash-outline" size={20} color={colors.text.muted} />
                    <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>Acciones Rápidas</Text>
                </View>
                <View style={[styles.sectionContent, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { borderBottomColor: colors.border.default }]}
                        onPress={handleSyncData}
                        disabled={isSyncing}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: colors.status.infoBg }]}>
                            {isSyncing ? (
                                <ActivityIndicator size="small" color={colors.brand.primary} />
                            ) : (
                                <Ionicons name="refresh" size={20} color={colors.brand.primary} />
                            )}
                        </View>
                        <Text style={[styles.actionText, { color: colors.text.primary }]}>
                            {isSyncing ? 'Sincronizando...' : 'Sincronizar Datos'}
                        </Text>
                        <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionBtn, { borderBottomColor: colors.border.default }]}
                        onPress={handleClearCache}
                        disabled={isClearing}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: colors.status.warningBg }]}>
                            {isClearing ? (
                                <ActivityIndicator size="small" color={colors.accent.orange} />
                            ) : (
                                <Ionicons name="trash-outline" size={20} color={colors.accent.orange} />
                            )}
                        </View>
                        <Text style={[styles.actionText, { color: colors.text.primary }]}>
                            {isClearing ? 'Limpiando...' : 'Limpiar Cache'}
                        </Text>
                        <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionBtn, styles.logoutBtn]} onPress={() => setShowLogoutModal(true)}>
                        <View style={[styles.actionIcon, { backgroundColor: colors.status.errorBg }]}>
                            <Ionicons name="log-out-outline" size={20} color={colors.status.error} />
                        </View>
                        <Text style={[styles.actionText, { color: colors.status.error }]}>Cerrar Sesión</Text>
                        <Ionicons name="chevron-forward" size={18} color={colors.status.error} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: colors.text.muted }]}>Club de Mercancías © {currentYear}</Text>
                <Text style={[styles.footerText, { color: colors.text.muted }]}>Powered by Aludra</Text>
            </View>
            {/* Password Modal for Biometric Setup */}
            <Modal
                visible={showPasswordModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowPasswordModal(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={[styles.modalContent, { backgroundColor: colors.bg.card }]}>
                        <View style={[styles.modalIcon, { backgroundColor: colors.brand.primary + '15' }]}>
                            <Ionicons
                                name={getBiometricIcon(biometricType) as any}
                                size={32}
                                color={colors.brand.primary}
                            />
                        </View>
                        <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                            Habilitar {getBiometricLabel(biometricType)}
                        </Text>
                        <Text style={[styles.modalSubtitle, { color: colors.text.secondary }]}>
                            Ingresa tu contraseña para confirmar
                        </Text>

                        <TextInput
                            style={[styles.modalInput, {
                                backgroundColor: colors.bg.elevated,
                                borderColor: colors.border.default,
                                color: colors.text.primary
                            }]}
                            placeholder="Contraseña"
                            placeholderTextColor={colors.text.muted}
                            secureTextEntry
                            value={passwordInput}
                            onChangeText={setPasswordInput}
                            autoFocus
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnCancel, { borderColor: colors.border.default }]}
                                onPress={() => {
                                    setShowPasswordModal(false);
                                    setPasswordInput('');
                                }}
                            >
                                <Text style={[styles.modalBtnText, { color: colors.text.secondary }]}>
                                    Cancelar
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnConfirm, { backgroundColor: colors.brand.primary }]}
                                onPress={handleConfirmBiometricSetup}
                                disabled={isEnabling}
                            >
                                {isEnabling ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <Text style={[styles.modalBtnText, { color: '#ffffff' }]}>
                                        Confirmar
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            <CustomAlert
                visible={alert.visible}
                type={alert.config.type}
                title={alert.config.title}
                message={alert.config.message}
                buttons={alert.config.buttons}
                onDismiss={alert.hide}
            />

            {/* Modal de Cerrar Sesión - Premium */}
            <Modal
                visible={showLogoutModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowLogoutModal(false)}
            >
                <Pressable
                    style={styles.logoutModalOverlay}
                    onPress={() => !isLoggingOut && setShowLogoutModal(false)}
                >
                    <Pressable style={[styles.logoutModalContent, { backgroundColor: colors.bg.card }]}>
                        {/* Icon with gradient background */}
                        <LinearGradient
                            colors={['#fee2e2', '#fecaca']}
                            style={styles.logoutModalIconContainer}
                        >
                            <View style={styles.logoutModalIconInner}>
                                <Ionicons name="log-out-outline" size={32} color="#dc2626" />
                            </View>
                        </LinearGradient>

                        {/* Title */}
                        <Text style={[styles.logoutModalTitle, { color: colors.text.primary }]}>
                            ¿Cerrar sesión?
                        </Text>

                        {/* Description */}
                        <Text style={[styles.logoutModalDescription, { color: colors.text.secondary }]}>
                            Tendrás que volver a iniciar sesión para acceder al sistema.
                        </Text>

                        {/* User info pill */}
                        <View style={[styles.logoutModalUserPill, { backgroundColor: colors.bg.elevated }]}>
                            <View style={[styles.logoutModalUserAvatar, { backgroundColor: colors.brand.primary }]}>
                                <Text style={styles.logoutModalUserAvatarText}>
                                    {getInitials(user?.name || 'Usuario')}
                                </Text>
                            </View>
                            <View style={styles.logoutModalUserInfo}>
                                <Text style={[styles.logoutModalUserName, { color: colors.text.primary }]} numberOfLines={1}>
                                    {user?.name || 'Usuario'}
                                </Text>
                                <Text style={[styles.logoutModalUserEmail, { color: colors.text.muted }]} numberOfLines={1}>
                                    {user?.email}
                                </Text>
                            </View>
                        </View>

                        {/* Buttons */}
                        <View style={styles.logoutModalButtons}>
                            <TouchableOpacity
                                style={[styles.logoutModalBtnCancel, { backgroundColor: colors.bg.elevated }]}
                                onPress={() => setShowLogoutModal(false)}
                                disabled={isLoggingOut}
                            >
                                <Text style={[styles.logoutModalBtnCancelText, { color: colors.text.primary }]}>
                                    Cancelar
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.logoutModalBtnConfirm, isLoggingOut && styles.logoutModalBtnDisabled]}
                                onPress={handleLogout}
                                disabled={isLoggingOut}
                            >
                                <LinearGradient
                                    colors={isLoggingOut ? ['#9ca3af', '#9ca3af'] : ['#ef4444', '#dc2626']}
                                    style={styles.logoutModalBtnConfirmGradient}
                                >
                                    {isLoggingOut ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <>
                                            <Ionicons name="log-out-outline" size={18} color="white" />
                                            <Text style={styles.logoutModalBtnConfirmText}>Cerrar Sesión</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </ScrollView>
    );
}

const getEnvColor = (env: string) => {
    switch (env) {
        case 'dev': return '#f59e0b';
        case 'qa': return '#3b82f6';
        case 'prod': return '#22c55e';
        default: return '#6b7280';
    }
};

const styles = StyleSheet.create({
    container: { flex: 1 },

    header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20 },
    headerTitle: { fontSize: 24, fontWeight: '700' },
    headerSubtitle: { fontSize: 13, marginTop: 4 },

    userCard: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: 20, padding: 16,
        borderRadius: 16, borderWidth: 1,
    },
    avatar: {
        width: 56, height: 56, borderRadius: 28,
        justifyContent: 'center', alignItems: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
    },
    userInfo: { flex: 1, marginLeft: 14 },
    userName: { fontSize: 17, fontWeight: '600' },
    userEmail: { fontSize: 13, marginTop: 2 },
    tenantBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    tenantText: {
        fontSize: 11,
        fontWeight: '600',
    },
    editBtn: {
        width: 36, height: 36, borderRadius: 10,
        justifyContent: 'center', alignItems: 'center',
    },

    section: { marginTop: 24, marginHorizontal: 20 },
    sectionHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        marginBottom: 12,
    },
    sectionTitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase' },
    sectionContent: {
        borderRadius: 16, borderWidth: 1,
        overflow: 'hidden',
    },

    infoRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 16, borderBottomWidth: 1,
    },
    infoLabel: { fontSize: 15 },
    infoValue: { fontSize: 15, fontWeight: '500' },
    envBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    envBadgeText: { fontSize: 12, fontWeight: '700' },

    actionBtn: {
        flexDirection: 'row', alignItems: 'center', padding: 16,
        borderBottomWidth: 1,
    },
    actionIcon: {
        width: 36, height: 36, borderRadius: 10,
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    actionText: { flex: 1, fontSize: 15 },
    logoutBtn: { borderBottomWidth: 0 },
    countBadge: {
        minWidth: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
        marginRight: 8,
    },
    countBadgeText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '700',
    },

    // Biometric styles
    biometricRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 0,
    },
    biometricInfo: {
        flex: 1,
    },
    biometricTitle: {
        fontSize: 15,
        fontWeight: '500',
    },
    biometricSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },

    footer: { alignItems: 'center', paddingVertical: 32, paddingBottom: 100 },
    footerText: { fontSize: 12 },

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
    },
    modalIcon: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
    },
    modalInput: {
        width: '100%',
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    modalBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBtnCancel: {
        borderWidth: 1,
    },
    modalBtnConfirm: {},
    modalBtnText: {
        fontSize: 16,
        fontWeight: '600',
    },

    // Logout Modal Styles
    logoutModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    logoutModalContent: {
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
    logoutModalIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    logoutModalIconInner: {
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
    logoutModalTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    logoutModalDescription: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        marginBottom: 20,
    },
    logoutModalUserPill: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        marginBottom: 24,
        width: '100%',
    },
    logoutModalUserAvatar: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutModalUserAvatarText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '700',
    },
    logoutModalUserInfo: {
        marginLeft: 12,
        flex: 1,
    },
    logoutModalUserName: {
        fontSize: 14,
        fontWeight: '600',
    },
    logoutModalUserEmail: {
        fontSize: 12,
        marginTop: 2,
    },
    logoutModalButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    logoutModalBtnCancel: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    logoutModalBtnCancelText: {
        fontSize: 15,
        fontWeight: '600',
    },
    logoutModalBtnConfirm: {
        flex: 1,
        borderRadius: 14,
        overflow: 'hidden',
    },
    logoutModalBtnConfirmGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 6,
    },
    logoutModalBtnConfirmText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
    },
    logoutModalBtnDisabled: {
        opacity: 0.7,
    },
});