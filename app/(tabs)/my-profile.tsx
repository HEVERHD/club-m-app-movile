// app/(tabs)/my-profile.tsx - Perfil del cliente
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuthStore } from '../../src/stores/auth-store';
import { ThemeSelector } from '../../src/components/ui/ThemeSelector';
import QRCode from 'react-native-qrcode-svg';

export default function MyProfileScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { user, logout, tenantName } = useAuthStore();

    const handleLogout = () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro que deseas cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Cerrar Sesión',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        router.replace('/');
                    },
                },
            ]
        );
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
                    onPress={handleLogout}
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
});
