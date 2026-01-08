// app/(tabs)/profile.tsx
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../../src/constants/colors';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { EnvironmentSelector } from '../../src/components/settings/EnvironmentSelector';

// import { useAuthStore } from '../../src/store/authStore'; // Si tienes auth store

export default function ProfileScreen() {
    const { environment } = useSettingsStore();
    // const { user, logout } = useAuthStore();

    const handleLogout = () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro de que deseas cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Cerrar Sesión',
                    style: 'destructive',
                    onPress: () => {
                        // logout();
                        router.replace('/(auth)/login');
                    },
                },
            ]
        );
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Perfil</Text>
                <Text style={styles.headerSubtitle}>Configuración y preferencias</Text>
            </View>

            {/* User Info Card */}
            <View style={styles.userCard}>
                <View style={styles.avatar}>
                    <Ionicons name="person" size={32} color={COLORS.accent.blue} />
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>Usuario Demo</Text>
                    <Text style={styles.userEmail}>demo@aludra.com</Text>
                </View>
                <TouchableOpacity style={styles.editBtn}>
                    <Ionicons name="pencil" size={18} color={COLORS.accent.blue} />
                </TouchableOpacity>
            </View>

            {/* Environment Selector */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="settings-outline" size={20} color={COLORS.text.muted} />
                    <Text style={styles.sectionTitle}>Configuración de Desarrollo</Text>
                </View>
                <View style={styles.sectionContent}>
                    <EnvironmentSelector />
                </View>
            </View>

            {/* App Info */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="information-circle-outline" size={20} color={COLORS.text.muted} />
                    <Text style={styles.sectionTitle}>Información de la App</Text>
                </View>
                <View style={styles.sectionContent}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Versión</Text>
                        <Text style={styles.infoValue}>1.0.0</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Entorno</Text>
                        <View style={[styles.envBadge, { backgroundColor: getEnvColor(environment) + '20' }]}>
                            <Text style={[styles.envBadgeText, { color: getEnvColor(environment) }]}>
                                {environment.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Build</Text>
                        <Text style={styles.infoValue}>{__DEV__ ? 'Development' : 'Production'}</Text>
                    </View>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="flash-outline" size={20} color={COLORS.text.muted} />
                    <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
                </View>
                <View style={styles.sectionContent}>
                    <TouchableOpacity style={styles.actionBtn}>
                        <View style={styles.actionIcon}>
                            <Ionicons name="refresh" size={20} color={COLORS.accent.blue} />
                        </View>
                        <Text style={styles.actionText}>Sincronizar Datos</Text>
                        <Ionicons name="chevron-forward" size={18} color={COLORS.text.muted} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn}>
                        <View style={styles.actionIcon}>
                            <Ionicons name="trash-outline" size={20} color={COLORS.accent.orange} />
                        </View>
                        <Text style={styles.actionText}>Limpiar Cache</Text>
                        <Ionicons name="chevron-forward" size={18} color={COLORS.text.muted} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionBtn, styles.logoutBtn]} onPress={handleLogout}>
                        <View style={[styles.actionIcon, { backgroundColor: COLORS.status.errorBg }]}>
                            <Ionicons name="log-out-outline" size={20} color={COLORS.status.error} />
                        </View>
                        <Text style={[styles.actionText, { color: COLORS.status.error }]}>Cerrar Sesión</Text>
                        <Ionicons name="chevron-forward" size={18} color={COLORS.status.error} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Club de Mercancías © 2024</Text>
                <Text style={styles.footerText}>Powered by Aludra</Text>
            </View>
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
    container: { flex: 1, backgroundColor: COLORS.bg.primary },

    header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20 },
    headerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.text.primary },
    headerSubtitle: { fontSize: 13, color: COLORS.text.secondary, marginTop: 4 },

    userCard: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: 20, padding: 16,
        backgroundColor: COLORS.bg.card, borderRadius: 16,
        borderWidth: 1, borderColor: COLORS.border.default,
    },
    avatar: {
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: COLORS.status.infoBg,
        justifyContent: 'center', alignItems: 'center',
    },
    userInfo: { flex: 1, marginLeft: 14 },
    userName: { fontSize: 17, fontWeight: '600', color: COLORS.text.primary },
    userEmail: { fontSize: 13, color: COLORS.text.muted, marginTop: 2 },
    editBtn: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: COLORS.status.infoBg,
        justifyContent: 'center', alignItems: 'center',
    },

    section: { marginTop: 24 },
    sectionHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 20, marginBottom: 12,
    },
    sectionTitle: { fontSize: 13, fontWeight: '600', color: COLORS.text.muted, textTransform: 'uppercase' },
    sectionContent: {
        marginHorizontal: 20, backgroundColor: COLORS.bg.card,
        borderRadius: 16, borderWidth: 1, borderColor: COLORS.border.default,
        overflow: 'hidden',
    },

    infoRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border.default,
    },
    infoLabel: { fontSize: 15, color: COLORS.text.secondary },
    infoValue: { fontSize: 15, color: COLORS.text.primary, fontWeight: '500' },
    envBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    envBadgeText: { fontSize: 12, fontWeight: '700' },

    actionBtn: {
        flexDirection: 'row', alignItems: 'center', padding: 16,
        borderBottomWidth: 1, borderBottomColor: COLORS.border.default,
    },
    actionIcon: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: COLORS.status.infoBg,
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    actionText: { flex: 1, fontSize: 15, color: COLORS.text.primary },
    logoutBtn: { borderBottomWidth: 0 },

    footer: { alignItems: 'center', paddingVertical: 32 },
    footerText: { fontSize: 12, color: COLORS.text.muted },
});