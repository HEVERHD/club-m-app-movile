// app/(auth)/company.tsx
import { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ActivityIndicator,
    KeyboardAvoidingView, Platform, StyleSheet, StatusBar, Image,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/auth-store';
import { CustomAlert } from '../../src/components/ui/CustomAlert';
import { useAlert } from '../../src/hooks/useAlert';

export default function CompanyScreen() {
    const insets = useSafeAreaInsets();
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
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Card del formulario */}
                    <View style={styles.formCard}>
                        {/* Logo */}
                        <View style={styles.logoWrapper}>
                            <Image
                                source={require('../../assets/icon.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>

                        {/* Título */}
                        <Text style={styles.brandName}>Club de Mercancías</Text>
                        <Text style={styles.tagline}>Ingresa el nombre de tu compañía</Text>

                        {/* Input */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Nombre de la compañía</Text>
                            <View style={[
                                styles.inputContainer,
                                isFocused && styles.inputContainerFocused
                            ]}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="cochez"
                                    placeholderTextColor="#9ca3af"
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
                                <Ionicons name="search" size={20} color="#9ca3af" />
                            </View>
                        </View>

                        {/* Error */}
                        {error && (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle" size={18} color="#ef4444" />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        {/* Continue Button con degradado */}
                        <TouchableOpacity
                            onPress={handleContinue}
                            disabled={isLoading}
                            activeOpacity={0.85}
                            style={[styles.continueBtnWrapper, isLoading && styles.continueBtnDisabled]}
                        >
                            <LinearGradient
                                colors={['#1a4a6e', '#2d6a8a', '#3d8aa6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.continueBtn}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#ffffff" size="small" />
                                ) : (
                                    <>
                                        <Text style={styles.continueBtnText}>Continuar</Text>
                                        <Ionicons name="arrow-forward" size={18} color="#ffffff" />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Customer Lookup Link */}
                    <TouchableOpacity
                        style={styles.customerLookupLink}
                        onPress={() => router.push('/(auth)/customer-lookup')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.customerLookupText}>
                            ¿Eres cliente? <Text style={styles.customerLookupHighlight}>Consulta tu club aquí</Text>
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
            <CustomAlert
                visible={alert.visible}
                type={alert.config.type}
                title={alert.config.title}
                message={alert.config.message}
                buttons={alert.config.buttons}
                onDismiss={alert.hide}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Form Card
    formCard: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        paddingHorizontal: 28,
        paddingTop: 32,
        paddingBottom: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 15,
        alignItems: 'center',
        width: '100%',
        maxWidth: 400,
    },

    // Logo dentro de la card
    logoWrapper: {
        marginBottom: 20,
    },
    logo: {
        width: 70,
        height: 70,
    },

    // Títulos dentro de la card
    brandName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 6,
        letterSpacing: -0.5,
        textAlign: 'center',
    },
    tagline: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 28,
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

    // Error
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef2f2',
        padding: 12,
        borderRadius: 12,
        gap: 10,
        marginBottom: 16,
        width: '100%',
    },
    errorText: {
        fontSize: 13,
        color: '#ef4444',
        flex: 1,
    },

    // Continue Button
    continueBtnWrapper: {
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
    },
    continueBtn: {
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    continueBtnDisabled: {
        opacity: 0.6,
    },
    continueBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },

    // Customer lookup link
    customerLookupLink: {
        alignItems: 'center',
        marginTop: 24,
        paddingVertical: 12,
    },
    customerLookupText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    customerLookupHighlight: {
        color: '#ffffff',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },

    // Footer fijo abajo
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
});
