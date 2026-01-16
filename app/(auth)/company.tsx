// app/(auth)/company.tsx
import { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ActivityIndicator,
    KeyboardAvoidingView, Platform, StyleSheet, StatusBar, Image,
    ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/auth-store';
import { useTheme } from '../../src/contexts/ThemeContext';
import { CustomAlert } from '../../src/components/ui/CustomAlert';
import { useAlert } from '../../src/hooks/useAlert';

export default function CompanyScreen() {
    const { colors, isDark } = useTheme();
    const alert = useAlert();
    const [company, setCompany] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const { checkCompany, isLoading, error, clearError } = useAuthStore();

    const handleContinue = async () => {
        if (!company.trim()) {
            alert.showError('Error', 'Ingresa el nombre de la compañía');
            return;
        }
        try {
            await checkCompany(company.trim());
            router.push('/(auth)/login');
        } catch (e: any) {
            alert.showError('Error', e.message || 'Compañía no encontrada');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg.primary }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.bg.primary} />

            {/* Fondo con gradiente sutil */}
            <View style={[styles.backgroundGlow, { backgroundColor: colors.accent.blue + '15' }]} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header / Branding */}
                    <View style={styles.brandingSection}>
                        <View style={styles.logoWrapper}>
                            <Image
                                source={require('../../assets/icon.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>

                        <Text style={[styles.brandName, { color: colors.text.primary }]}>Clubes de Mercancías</Text>
                        <Text style={[styles.tagline, { color: colors.text.muted }]}>Sistema de gestión empresarial</Text>
                    </View>

                    {/* Card del formulario */}
                    <View style={[styles.formCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                        <View style={styles.formHeader}>
                            <View style={[styles.stepIndicator, { backgroundColor: colors.accent.blue }]}>
                                <Text style={[styles.stepNumber, { color: colors.white }]}>1</Text>
                            </View>
                            <View>
                                <Text style={[styles.formTitle, { color: colors.text.primary }]}>Identifica tu empresa</Text>
                                <Text style={[styles.formSubtitle, { color: colors.text.muted }]}>Ingresa el código de tu compañía</Text>
                            </View>
                        </View>

                        {/* Input */}
                        <View style={styles.inputWrapper}>
                            <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Código de empresa</Text>
                            <View style={[
                                styles.inputContainer,
                                { backgroundColor: colors.bg.elevated, borderColor: colors.border.default },
                                isFocused && { borderColor: colors.accent.blue, backgroundColor: colors.accent.blue + '10' }
                            ]}>
                                <Ionicons
                                    name="business-outline"
                                    size={20}
                                    color={isFocused ? colors.accent.blue : colors.text.muted}
                                />
                                <TextInput
                                    style={[styles.input, { color: colors.text.primary }]}
                                    placeholder="Ej: cochez"
                                    placeholderTextColor={colors.text.muted}
                                    value={company}
                                    onChangeText={(text) => {
                                        setCompany(text);
                                        if (error) clearError();
                                    }}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                {company.length > 0 && (
                                    <TouchableOpacity onPress={() => setCompany('')}>
                                        <Ionicons name="close-circle" size={20} color={colors.text.muted} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Error */}
                        {error && (
                            <View style={[styles.errorBox, { backgroundColor: colors.status.errorBg }]}>
                                <Ionicons name="alert-circle" size={18} color={colors.status.error} />
                                <Text style={[styles.errorText, { color: colors.status.error }]}>{error}</Text>
                            </View>
                        )}

                        {/* Continue Button */}
                        <TouchableOpacity
                            style={[styles.continueBtn, { backgroundColor: colors.accent.blue }, isLoading && styles.continueBtnDisabled]}
                            onPress={handleContinue}
                            disabled={isLoading}
                            activeOpacity={0.85}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={colors.white} size="small" />
                            ) : (
                                <>
                                    <Text style={[styles.continueBtnText, { color: colors.white }]}>Continuar</Text>
                                    <View style={styles.continueBtnIcon}>
                                        <Ionicons name="arrow-forward" size={18} color={colors.white} />
                                    </View>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Info tip */}
                        <View style={styles.infoTip}>
                            <Ionicons name="information-circle-outline" size={16} color={colors.text.muted} />
                            <Text style={[styles.infoTipText, { color: colors.text.muted }]}>
                                El código fue proporcionado por tu administrador
                            </Text>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <View style={styles.securityIndicator}>
                            <View style={[styles.securityDot, { backgroundColor: colors.accent.green }]} />
                            <Text style={[styles.securityText, { color: colors.text.muted }]}>Conexión cifrada SSL</Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
    backgroundGlow: {
        position: 'absolute',
        top: -100,
        left: '50%',
        marginLeft: -200,
        width: 400,
        height: 400,
        borderRadius: 200,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },

    // Branding
    brandingSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoWrapper: {
        marginBottom: 16,
    },
    logo: {
        width: 100,
        height: 100,
    },
    brandName: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 6,
        letterSpacing: -0.3,
    },
    tagline: {
        fontSize: 14,
    },

    // Form Card
    formCard: {
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
    },
    formHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 28,
    },
    stepIndicator: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepNumber: {
        fontSize: 16,
        fontWeight: '700',
    },
    formTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 2,
    },
    formSubtitle: {
        fontSize: 13,
    },

    // Inputs
    inputWrapper: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
        borderWidth: 1.5,
    },
    input: {
        flex: 1,
        fontSize: 16,
        padding: 0,
    },

    // Error
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 10,
        marginBottom: 8,
    },
    errorText: {
        fontSize: 13,
        flex: 1,
    },

    // Continue Button
    continueBtn: {
        borderRadius: 14,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 16,
    },
    continueBtnDisabled: {
        opacity: 0.6,
    },
    continueBtnText: {
        fontSize: 16,
        fontWeight: '600',
    },
    continueBtnIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Info tip
    infoTip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    infoTipText: {
        fontSize: 12,
    },

    // Footer
    footer: {
        alignItems: 'center',
        marginTop: 32,
    },
    securityIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    securityDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    securityText: {
        fontSize: 12,
        fontWeight: '500',
    },
});
