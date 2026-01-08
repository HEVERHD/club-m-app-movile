// app/(auth)/company.tsx
import { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ActivityIndicator,
    KeyboardAvoidingView, Platform, Alert, StyleSheet, StatusBar, Image,
    ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/auth-store';
import { COLORS } from '../../src/constants/colors';

export default function CompanyScreen() {
    const [company, setCompany] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const { checkCompany, isLoading, error, clearError } = useAuthStore();

    const handleContinue = async () => {
        if (!company.trim()) {
            Alert.alert('Error', 'Ingresa el nombre de la compañía');
            return;
        }
        try {
            await checkCompany(company.trim());
            router.push('/(auth)/login');
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Compañía no encontrada');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />

            {/* Fondo con gradiente sutil */}
            <View style={styles.backgroundGlow} />

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

                        <Text style={styles.brandName}>Clubes de Mercancías</Text>
                        <Text style={styles.tagline}>Sistema de gestión empresarial</Text>
                    </View>

                    {/* Card del formulario */}
                    <View style={styles.formCard}>
                        <View style={styles.formHeader}>
                            <View style={styles.stepIndicator}>
                                <Text style={styles.stepNumber}>1</Text>
                            </View>
                            <View>
                                <Text style={styles.formTitle}>Identifica tu empresa</Text>
                                <Text style={styles.formSubtitle}>Ingresa el código de tu compañía</Text>
                            </View>
                        </View>

                        {/* Input */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Código de empresa</Text>
                            <View style={[
                                styles.inputContainer,
                                isFocused && styles.inputFocused
                            ]}>
                                <Ionicons
                                    name="business-outline"
                                    size={20}
                                    color={isFocused ? COLORS.accent.blue : COLORS.text.muted}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ej: cochez"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
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
                                        <Ionicons name="close-circle" size={20} color={COLORS.text.muted} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Error */}
                        {error && (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle" size={18} color="#ef4444" />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        {/* Continue Button */}
                        <TouchableOpacity
                            style={[styles.continueBtn, isLoading && styles.continueBtnDisabled]}
                            onPress={handleContinue}
                            disabled={isLoading}
                            activeOpacity={0.85}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <>
                                    <Text style={styles.continueBtnText}>Continuar</Text>
                                    <View style={styles.continueBtnIcon}>
                                        <Ionicons name="arrow-forward" size={18} color="#fff" />
                                    </View>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Info tip */}
                        <View style={styles.infoTip}>
                            <Ionicons name="information-circle-outline" size={16} color={COLORS.text.muted} />
                            <Text style={styles.infoTipText}>
                                El código fue proporcionado por tu administrador
                            </Text>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <View style={styles.securityIndicator}>
                            <View style={styles.securityDot} />
                            <Text style={styles.securityText}>Conexión cifrada SSL</Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0f1a',
    },
    backgroundGlow: {
        position: 'absolute',
        top: -100,
        left: '50%',
        marginLeft: -200,
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
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
        color: '#fff',
        marginBottom: 6,
        letterSpacing: -0.3,
    },
    tagline: {
        fontSize: 14,
        color: COLORS.text.muted,
    },

    // Form Card
    formCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
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
        backgroundColor: COLORS.accent.blue,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepNumber: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    formTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 2,
    },
    formSubtitle: {
        fontSize: 13,
        color: COLORS.text.muted,
    },

    // Inputs
    inputWrapper: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: COLORS.text.secondary,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    inputFocused: {
        borderColor: COLORS.accent.blue,
        backgroundColor: 'rgba(59, 130, 246, 0.06)',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#fff',
        padding: 0,
    },

    // Error
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        padding: 12,
        borderRadius: 12,
        gap: 10,
        marginBottom: 8,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 13,
        flex: 1,
    },

    // Continue Button
    continueBtn: {
        backgroundColor: COLORS.accent.blue,
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
        color: '#fff',
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
        color: COLORS.text.muted,
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
        backgroundColor: COLORS.accent.green,
    },
    securityText: {
        color: COLORS.text.muted,
        fontSize: 12,
        fontWeight: '500',
    },
});