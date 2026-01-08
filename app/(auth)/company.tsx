// app/(auth)/company.tsx
import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert,
    StyleSheet,
    StatusBar,
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
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" backgroundColor={COLORS.bg.primary} />
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logoOuter}>
                            <View style={styles.logoInner}>
                                <View style={styles.logoBlue} />
                                <View style={styles.logoGreen} />
                                <View style={styles.logoDark} />
                                <View style={styles.dot1} />
                                <View style={styles.dot2} />
                                <View style={styles.dot3} />
                            </View>
                        </View>
                    </View>

                    <Text style={styles.appName}>Clubes de Mercancías</Text>
                    <Text style={styles.subtitle}>Ingresa tu compañía para continuar</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nombre de la compañía</Text>
                        <View style={[
                            styles.inputContainer,
                            isFocused && styles.inputContainerFocused
                        ]}>
                            <View style={styles.inputIconContainer}>
                                <Ionicons
                                    name="business"
                                    size={18}
                                    color={isFocused ? COLORS.accent.blue : COLORS.text.muted}
                                />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Ej: Cochez"
                                placeholderTextColor={COLORS.text.muted}
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
                        </View>
                    </View>

                    {error && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={18} color={COLORS.status.error} />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.continueButton, isLoading && styles.continueButtonDisabled]}
                        onPress={handleContinue}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <>
                                <Text style={styles.continueButtonText}>Continuar</Text>
                                <View style={styles.buttonArrow}>
                                    <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
                                </View>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.infoCard}>
                        <View style={styles.infoIconContainer}>
                            <Ionicons name="information-circle" size={20} color={COLORS.accent.cyan} />
                        </View>
                        <Text style={styles.infoText}>
                            Ingresa el identificador único de tu empresa para acceder al sistema.
                        </Text>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg.primary,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },

    // Header
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        marginBottom: 24,
    },
    logoOuter: {
        width: 110,
        height: 110,
        borderRadius: 28,
        backgroundColor: COLORS.bg.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border.default,
    },
    logoInner: {
        width: 80,
        height: 80,
        position: 'relative',
    },
    logoBlue: {
        position: 'absolute',
        top: 2,
        left: 2,
        width: 36,
        height: 44,
        backgroundColor: COLORS.accent.blue,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 18,
        borderBottomLeftRadius: 4,
    },
    logoGreen: {
        position: 'absolute',
        top: 18,
        left: 22,
        width: 36,
        height: 44,
        backgroundColor: COLORS.accent.green,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 8,
        borderTopRightRadius: 4,
    },
    logoDark: {
        position: 'absolute',
        bottom: 2,
        right: 6,
        width: 32,
        height: 36,
        backgroundColor: COLORS.bg.elevated,
        borderRadius: 8,
        borderTopLeftRadius: 18,
    },
    dot1: {
        position: 'absolute',
        top: 10,
        right: 18,
        width: 10,
        height: 10,
        backgroundColor: COLORS.accent.cyan,
        borderRadius: 5,
    },
    dot2: {
        position: 'absolute',
        top: 26,
        right: 10,
        width: 7,
        height: 7,
        backgroundColor: COLORS.bg.card,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: COLORS.text.muted,
    },
    dot3: {
        position: 'absolute',
        top: 38,
        right: 22,
        width: 9,
        height: 9,
        backgroundColor: COLORS.accent.green,
        borderRadius: 5,
    },
    appName: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text.primary,
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.text.secondary,
        textAlign: 'center',
    },

    // Form
    form: {
        gap: 16,
    },
    inputGroup: {
        marginBottom: 4,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.text.secondary,
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bg.card,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: COLORS.border.default,
    },
    inputContainerFocused: {
        borderColor: COLORS.accent.blue,
        backgroundColor: COLORS.bg.secondary,
    },
    inputIconContainer: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 4,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        paddingRight: 16,
        fontSize: 16,
        color: COLORS.text.primary,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.status.errorBg,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        borderRadius: 12,
        padding: 12,
        gap: 10,
    },
    errorText: {
        color: COLORS.status.error,
        fontSize: 13,
        flex: 1,
    },
    continueButton: {
        backgroundColor: COLORS.accent.blue,
        borderRadius: 14,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 8,
    },
    continueButtonDisabled: {
        opacity: 0.6,
    },
    continueButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
    buttonArrow: {
        width: 24,
        height: 24,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Footer
    footer: {
        marginTop: 32,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bg.card,
        borderRadius: 12,
        padding: 14,
        gap: 12,
        borderWidth: 1,
        borderColor: COLORS.border.default,
    },
    infoIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(6, 182, 212, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        color: COLORS.text.secondary,
        fontSize: 13,
        lineHeight: 18,
    },
});