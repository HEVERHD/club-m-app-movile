// app/(tabs)/profile.tsx
import { View, Text, TouchableOpacity, Alert, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/auth-store';
import { COLORS } from '../../src/constants/colors';

export default function ProfileScreen() {
    const { user, tenantName, logout } = useAuthStore();

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
                        router.replace('/(auth)/company');
                    },
                },
            ]
        );
    };

    const getInitials = (name: string) => {
        return name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'US';
    };

    const menuSections = [
        {
            title: 'Cuenta',
            items: [
                { icon: 'person-outline', label: 'Editar Perfil', color: COLORS.accent.blue },
                { icon: 'lock-closed-outline', label: 'Cambiar Contraseña', color: COLORS.accent.purple },
                { icon: 'notifications-outline', label: 'Notificaciones', color: COLORS.accent.orange },
            ],
        },
        {
            title: 'Soporte',
            items: [
                { icon: 'help-circle-outline', label: 'Centro de Ayuda', color: COLORS.accent.cyan },
                { icon: 'chatbubble-outline', label: 'Contactar Soporte', color: COLORS.accent.green },
                { icon: 'document-text-outline', label: 'Términos y Condiciones', color: COLORS.text.muted },
            ],
        },
        {
            title: 'Aplicación',
            items: [
                { icon: 'information-circle-outline', label: 'Acerca de', color: COLORS.accent.blue },
                { icon: 'star-outline', label: 'Calificar App', color: COLORS.accent.orange },
            ],
        },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.bg.primary} />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Mi Perfil</Text>
                </View>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{getInitials(user?.name || 'Usuario')}</Text>
                        </View>
                        <View style={styles.onlineIndicator} />
                    </View>

                    <View style={styles.profileInfo}>
                        <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
                        <Text style={styles.userEmail}>{user?.email}</Text>

                        <View style={styles.badgesContainer}>
                            <View style={styles.tenantBadge}>
                                <Ionicons name="business" size={12} color={COLORS.accent.cyan} />
                                <Text style={styles.tenantBadgeText}>{tenantName}</Text>
                            </View>
                            <View style={styles.roleBadge}>
                                <Ionicons name="shield-checkmark" size={12} color={COLORS.accent.green} />
                                <Text style={styles.roleBadgeText}>{user?.role || 'Usuario'}</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.editButton}>
                        <Ionicons name="create-outline" size={18} color={COLORS.accent.blue} />
                    </TouchableOpacity>
                </View>

                {/* Stats Card */}
                <View style={styles.statsCard}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Clubes</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Pagos</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Semanas</Text>
                    </View>
                </View>

                {/* Menu Sections */}
                {menuSections.map((section, sectionIndex) => (
                    <View key={sectionIndex} style={styles.menuSection}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <View style={styles.menuCard}>
                            {section.items.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.menuItem,
                                        index < section.items.length - 1 && styles.menuItemBorder
                                    ]}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.menuIconContainer, { backgroundColor: `${item.color}15` }]}>
                                        <Ionicons name={item.icon as any} size={20} color={item.color} />
                                    </View>
                                    <Text style={styles.menuLabel}>{item.label}</Text>
                                    <View style={styles.menuArrow}>
                                        <Ionicons name="chevron-forward" size={16} color={COLORS.text.muted} />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Logout Button */}
                <View style={styles.logoutSection}>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
                        <Ionicons name="log-out-outline" size={20} color={COLORS.status.error} />
                        <Text style={styles.logoutText}>Cerrar Sesión</Text>
                    </TouchableOpacity>
                </View>

                {/* Version */}
                <View style={styles.versionContainer}>
                    <Text style={styles.versionText}>Clubes de Mercancías</Text>
                    <Text style={styles.versionNumber}>Versión 1.0.0</Text>
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg.primary,
    },
    scrollView: {
        flex: 1,
    },

    // Header
    header: {
        paddingHorizontal: 20,
        paddingTop: 56,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text.primary,
        letterSpacing: -0.5,
    },

    // Profile Card
    profileCard: {
        marginHorizontal: 20,
        backgroundColor: COLORS.bg.card,
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border.default,
        marginBottom: 16,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: COLORS.accent.blue,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: COLORS.white,
        fontSize: 22,
        fontWeight: '700',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: COLORS.accent.green,
        borderWidth: 3,
        borderColor: COLORS.bg.card,
    },
    profileInfo: {
        flex: 1,
        marginLeft: 16,
    },
    userName: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text.primary,
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 13,
        color: COLORS.text.secondary,
        marginBottom: 10,
    },
    badgesContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    tenantBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(6, 182, 212, 0.12)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    tenantBadgeText: {
        fontSize: 11,
        color: COLORS.accent.cyan,
        fontWeight: '600',
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.status.successBg,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    roleBadgeText: {
        fontSize: 11,
        color: COLORS.accent.green,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    editButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: COLORS.bg.elevated,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Stats Card
    statsCard: {
        marginHorizontal: 20,
        backgroundColor: COLORS.bg.card,
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border.default,
        marginBottom: 24,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text.primary,
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.text.muted,
    },
    statDivider: {
        width: 1,
        height: 36,
        backgroundColor: COLORS.border.default,
    },

    // Menu Sections
    menuSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.text.muted,
        marginBottom: 10,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    menuCard: {
        backgroundColor: COLORS.bg.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border.default,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.default,
    },
    menuIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuLabel: {
        flex: 1,
        fontSize: 15,
        color: COLORS.text.primary,
        fontWeight: '500',
    },
    menuArrow: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: COLORS.bg.elevated,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Logout
    logoutSection: {
        paddingHorizontal: 20,
        marginTop: 8,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.status.errorBg,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
        borderRadius: 14,
        paddingVertical: 14,
        gap: 8,
    },
    logoutText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.status.error,
    },

    // Version
    versionContainer: {
        alignItems: 'center',
        marginTop: 32,
    },
    versionText: {
        fontSize: 13,
        color: COLORS.text.muted,
        marginBottom: 2,
    },
    versionNumber: {
        fontSize: 12,
        color: COLORS.text.muted,
    },

    bottomSpacer: {
        height: 100,
    },
});