// app/(auth)/customer-lookup.tsx - Consulta pública de clubes (sin login)
import { useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { getClubsByCustomer } from '../../src/api/clubs.api';
import type { Club } from '../../src/types/clubs';
import QRCode from 'react-native-qrcode-svg';

export default function CustomerLookupScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [clubs, setClubs] = useState<Club[]>([]);
    const [customerInfo, setCustomerInfo] = useState<{ name: string; doc: string } | null>(null);
    const [isFocused, setIsFocused] = useState(false);

    const handleSearch = useCallback(async () => {
        const trimmed = searchQuery.trim();
        if (!trimmed || trimmed.length < 3) {
            return;
        }

        setIsLoading(true);
        setHasSearched(true);

        try {
            const results = await getClubsByCustomer(trimmed);
            setClubs(results);

            // Extraer info del cliente del primer resultado
            if (results.length > 0) {
                setCustomerInfo({
                    name: results[0].customerName,
                    doc: results[0].customerNumber,
                });
            } else {
                setCustomerInfo(null);
            }
        } catch (error) {
            console.error('Error buscando clubes:', error);
            setClubs([]);
            setCustomerInfo(null);
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery]);

    const handleBack = () => {
        if (hasSearched && clubs.length > 0) {
            // Volver a la búsqueda
            setHasSearched(false);
            setClubs([]);
            setCustomerInfo(null);
            setSearchQuery('');
        } else {
            router.back();
        }
    };

    // Calcular estadísticas
    const stats = {
        totalClubs: clubs.length,
        activeClubs: clubs.filter(c => c.statusName.toLowerCase() === 'activo').length,
        totalBalance: clubs.reduce((sum, c) => sum + (c.balanceAmount || 0), 0),
        totalWeeksPaid: clubs.reduce((sum, c) => sum + (c.weeksPaid || 0), 0),
    };

    // QR Value
    const qrValue = customerInfo ? JSON.stringify({
        type: 'CLUB_MEMBER',
        doc: customerInfo.doc,
        v: 1,
    }) : '';

    // Mostrar resultados si ya buscó
    if (hasSearched && !isLoading) {
        if (clubs.length === 0) {
            return (
                <LinearGradient
                    colors={['#1a4a6e', '#2d6a8a', '#3d8aa6']}
                    style={styles.container}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
                    <SafeAreaView style={styles.safeArea}>
                        <View style={styles.emptyHeader}>
                            <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                                <Ionicons name="arrow-back" size={24} color="#ffffff" />
                            </TouchableOpacity>
                            <Text style={styles.emptyHeaderTitle}>Consulta tu Club</Text>
                            <View style={{ width: 40 }} />
                        </View>

                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIcon}>
                                <Ionicons name="search-outline" size={48} color="#f59e0b" />
                            </View>
                            <Text style={styles.emptyTitle}>Sin resultados</Text>
                            <Text style={styles.emptyText}>
                                No encontramos clubes asociados a "{searchQuery}"
                            </Text>
                            <TouchableOpacity style={styles.retryBtnWrapper} onPress={handleBack}>
                                <LinearGradient
                                    colors={['#1a4a6e', '#2d6a8a', '#3d8aa6']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.retryBtn}
                                >
                                    <Text style={styles.retryBtnText}>Buscar de nuevo</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </LinearGradient>
            );
        }

        // Mostrar perfil y clubes del cliente
        return (
            <SafeAreaView style={[styles.resultsContainer, { backgroundColor: colors.bg.primary }]}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.resultsHeader}>
                        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.pageTitle, { color: colors.text.primary }]}>Mi Perfil</Text>

                    {/* Tarjeta de perfil con QR */}
                    <View style={[styles.profileCard, { backgroundColor: colors.brand.primary }]}>
                        <View style={styles.profileHeader}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {customerInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </Text>
                            </View>
                            <View style={styles.profileInfo}>
                                <Text style={styles.profileName}>
                                    {customerInfo?.name || 'Cliente'}
                                </Text>
                                <Text style={styles.profileDoc}>
                                    {customerInfo?.doc || searchQuery}
                                </Text>
                            </View>
                        </View>

                        {/* QR Code */}
                        <View style={styles.qrSection}>
                            <View style={styles.qrWrapper}>
                                <QRCode
                                    value={qrValue || 'N/A'}
                                    size={80}
                                    backgroundColor="#ffffff"
                                    color={colors.brand.primary}
                                />
                            </View>
                            <View style={styles.qrInfo}>
                                <Text style={styles.qrLabel}>Código de Miembro</Text>
                                <Text style={styles.qrId}>{customerInfo?.doc || 'N/A'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Estadísticas */}
                    <View style={styles.statsGrid}>
                        <View style={[styles.statCard, { backgroundColor: colors.bg.card }]}>
                            <View style={[styles.statIcon, { backgroundColor: colors.brand.primary + '15' }]}>
                                <Ionicons name="wallet" size={20} color={colors.brand.primary} />
                            </View>
                            <Text style={[styles.statValue, { color: colors.text.primary }]}>
                                {stats.activeClubs}
                            </Text>
                            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                                Clubes Activos
                            </Text>
                        </View>

                        <View style={[styles.statCard, { backgroundColor: colors.bg.card }]}>
                            <View style={[styles.statIcon, { backgroundColor: colors.status.success + '15' }]}>
                                <Ionicons name="cash" size={20} color={colors.status.success} />
                            </View>
                            <Text style={[styles.statValue, { color: colors.status.success }]}>
                                ${stats.totalBalance.toFixed(2)}
                            </Text>
                            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                                Balance Total
                            </Text>
                        </View>

                        <View style={[styles.statCard, { backgroundColor: colors.bg.card }]}>
                            <View style={[styles.statIcon, { backgroundColor: colors.accent.gold + '15' }]}>
                                <Ionicons name="calendar-number" size={20} color={colors.accent.gold} />
                            </View>
                            <Text style={[styles.statValue, { color: colors.text.primary }]}>
                                {stats.totalWeeksPaid}
                            </Text>
                            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                                Semanas Pagadas
                            </Text>
                        </View>
                    </View>

                    {/* Lista de Clubes */}
                    <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                        Mis Clubes ({stats.totalClubs})
                    </Text>

                    {clubs.map((club) => {
                        const isActive = club.statusName.toLowerCase() === 'activo';
                        const progressPercent = Math.min((club.weeksPaid / 52) * 100, 100);

                        return (
                            <View
                                key={club.clubId}
                                style={[styles.clubCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}
                            >
                                {/* Header */}
                                <View style={styles.clubHeader}>
                                    <View style={styles.clubTitleRow}>
                                        <Text style={[styles.clubContract, { color: colors.text.primary }]}>
                                            #{club.contractNumber}
                                        </Text>
                                        <View style={[
                                            styles.statusBadge,
                                            { backgroundColor: isActive ? colors.status.successBg : colors.status.warningBg }
                                        ]}>
                                            <View style={[
                                                styles.statusDot,
                                                { backgroundColor: isActive ? colors.status.success : colors.status.warning }
                                            ]} />
                                            <Text style={[
                                                styles.statusText,
                                                { color: isActive ? colors.status.success : colors.status.warning }
                                            ]}>
                                                {club.statusName}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={[styles.shareBox, { backgroundColor: colors.bg.elevated }]}>
                                        <Text style={[styles.shareLabel, { color: colors.text.muted }]}>Acción</Text>
                                        <Text style={[styles.shareValue, { color: colors.brand.primary }]}>{club.share}</Text>
                                    </View>
                                </View>

                                {/* Barra de progreso */}
                                <View style={styles.progressSection}>
                                    <View style={styles.progressHeader}>
                                        <Text style={[styles.progressLabel, { color: colors.text.secondary }]}>
                                            Progreso de pago
                                        </Text>
                                        <Text style={[styles.progressValue, { color: colors.text.primary }]}>
                                            {club.weeksPaid}/52 semanas
                                        </Text>
                                    </View>
                                    <View style={[styles.progressBar, { backgroundColor: colors.border.default }]}>
                                        <View
                                            style={[
                                                styles.progressFill,
                                                {
                                                    width: `${progressPercent}%`,
                                                    backgroundColor: colors.brand.primary
                                                }
                                            ]}
                                        />
                                    </View>
                                </View>

                                {/* Footer con balance */}
                                <View style={[styles.clubFooter, { borderTopColor: colors.border.light }]}>
                                    <View style={styles.footerItem}>
                                        <Ionicons name="cash-outline" size={16} color={colors.text.muted} />
                                        <Text style={[styles.footerLabel, { color: colors.text.muted }]}>
                                            Pagado: ${club.paidAmount.toFixed(2)}
                                        </Text>
                                    </View>
                                    <View style={styles.balanceSection}>
                                        <Text style={[styles.balanceLabel, { color: colors.text.muted }]}>Balance</Text>
                                        <Text style={[
                                            styles.balanceValue,
                                            { color: club.balanceAmount >= 0 ? colors.status.success : colors.status.error }
                                        ]}>
                                            ${club.balanceAmount.toFixed(2)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })}

                    {/* Botón para nueva búsqueda */}
                    <TouchableOpacity
                        style={[styles.newSearchBtn, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}
                        onPress={handleBack}
                    >
                        <Ionicons name="search" size={20} color={colors.brand.primary} />
                        <Text style={[styles.newSearchText, { color: colors.brand.primary }]}>
                            Buscar otra cédula
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        );
    }

    // Pantalla de búsqueda inicial con gradiente
    return (
        <LinearGradient
            colors={['#1a4a6e', '#2d6a8a', '#3d8aa6']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.searchContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header con logo */}
                    <View style={styles.headerSection}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#ffffff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.brandingSection}>
                        <View style={styles.logoWrapper}>
                            <Image
                                source={require('../../assets/icon.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.brandName}>Club de Mercancías</Text>
                        <Text style={styles.tagline}>Consulta el estado de tu club</Text>
                    </View>

                    {/* Card del formulario */}
                    <View style={styles.formCard}>
                        <Text style={styles.formTitle}>Consulta tu Club</Text>
                        <Text style={styles.formSubtitle}>Ingresa tu cédula o número de contrato</Text>

                        {/* Input */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Cédula o Contrato</Text>
                            <View style={[
                                styles.inputContainer,
                                isFocused && styles.inputContainerFocused
                            ]}>
                                <Ionicons
                                    name="search-outline"
                                    size={20}
                                    color={isFocused ? '#2d6a8a' : '#9ca3af'}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ej: 8-888-8888"
                                    placeholderTextColor="#9ca3af"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    onSubmitEditing={handleSearch}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    returnKeyType="search"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                        </View>

                        {/* Search Button con degradado */}
                        <TouchableOpacity
                            onPress={handleSearch}
                            disabled={!searchQuery.trim() || searchQuery.trim().length < 3 || isLoading}
                            activeOpacity={0.85}
                            style={[
                                styles.searchBtnWrapper,
                                (!searchQuery.trim() || searchQuery.trim().length < 3) && styles.searchBtnDisabled
                            ]}
                        >
                            <LinearGradient
                                colors={['#1a4a6e', '#2d6a8a', '#3d8aa6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.searchBtn}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#ffffff" size="small" />
                                ) : (
                                    <>
                                        <Text style={styles.searchBtnText}>Buscar</Text>
                                        <Ionicons name="arrow-forward" size={18} color="#ffffff" />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Link para volver al login */}
                    <TouchableOpacity
                        style={styles.loginLink}
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.loginLinkText}>
                            ¿Eres empleado? <Text style={styles.loginLinkHighlight}>Inicia sesión aquí</Text>
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Footer fijo abajo */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
                <Text style={styles.footerText}>
                    Powered by <Text style={styles.footerHighlight}>Hypernovalabs</Text>
                </Text>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    resultsContainer: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    searchContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },

    // Header Section
    headerSection: {
        width: '100%',
        marginBottom: 16,
    },
    resultsHeader: {
        marginBottom: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Branding
    brandingSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    logoWrapper: {
        marginBottom: 16,
        padding: 12,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    logo: {
        width: 70,
        height: 70,
    },
    brandName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 8,
        letterSpacing: -0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    tagline: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },

    // Form Card
    formCard: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        paddingHorizontal: 28,
        paddingTop: 28,
        paddingBottom: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 15,
        width: '100%',
        maxWidth: 400,
    },
    formTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 6,
        textAlign: 'center',
    },
    formSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 24,
        textAlign: 'center',
    },

    // Inputs
    inputWrapper: {
        width: '100%',
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    inputContainerFocused: {
        borderColor: '#2d6a8a',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1f2937',
        padding: 0,
    },

    // Search Button
    searchBtnWrapper: {
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
    },
    searchBtn: {
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    searchBtnDisabled: {
        opacity: 0.6,
    },
    searchBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },

    // Login Link
    loginLink: {
        alignItems: 'center',
        marginTop: 24,
        paddingVertical: 12,
    },
    loginLinkText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    loginLinkHighlight: {
        color: '#ffffff',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },

    // Footer
    footer: {
        alignItems: 'center',
        paddingTop: 16,
    },
    footerText: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    footerHighlight: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '600',
    },

    // Empty State
    emptyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    emptyHeaderTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 15,
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 24,
    },
    retryBtnWrapper: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    retryBtn: {
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
    },
    retryBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },

    // Results
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
        width: 56,
        height: 56,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 22,
        fontWeight: '700',
        color: '#ffffff',
    },
    profileInfo: {
        marginLeft: 16,
        flex: 1,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
    },
    profileDoc: {
        fontSize: 14,
        marginTop: 2,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    qrSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    qrWrapper: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: '#ffffff',
    },
    qrInfo: {
        flex: 1,
    },
    qrLabel: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.5,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    qrId: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 4,
        color: '#ffffff',
    },

    // Stats
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 10,
        marginTop: 4,
        textAlign: 'center',
    },

    // Section
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },

    // Club Card
    clubCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    clubHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    clubTitleRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    clubContract: {
        fontSize: 18,
        fontWeight: '700',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    shareBox: {
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
    },
    shareLabel: {
        fontSize: 10,
        marginBottom: 2,
    },
    shareValue: {
        fontSize: 20,
        fontWeight: '700',
    },

    // Progress
    progressSection: {
        marginBottom: 12,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    progressLabel: {
        fontSize: 12,
    },
    progressValue: {
        fontSize: 12,
        fontWeight: '600',
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },

    // Club Footer
    clubFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    footerLabel: {
        fontSize: 12,
    },
    balanceSection: {
        alignItems: 'flex-end',
    },
    balanceLabel: {
        fontSize: 11,
    },
    balanceValue: {
        fontSize: 18,
        fontWeight: '700',
    },

    // New Search Button
    newSearchBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginTop: 8,
    },
    newSearchText: {
        fontSize: 15,
        fontWeight: '600',
    },
});
