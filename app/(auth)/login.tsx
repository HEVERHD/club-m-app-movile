// app/(auth)/login.tsx
import { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ActivityIndicator,
    KeyboardAvoidingView, Platform, Alert, StyleSheet, StatusBar, Image,
    ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../../src/stores/auth-store';
import { COLORS } from '../../src/constants/colors';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localTenantId, setLocalTenantId] = useState<number | null>(null);
    const [localTenantName, setLocalTenantName] = useState<string | null>(null);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);

    const { login, isLoading, error, clearError, tenantId, tenantName } = useAuthStore();

    useEffect(() => {
        const loadTenant = async () => {
            const storedId = await SecureStore.getItemAsync('tenantId');
            const storedName = await SecureStore.getItemAsync('tenantName');
            if (storedId) {
                setLocalTenantId(parseInt(storedId));
                setLocalTenantName(storedName);
            }
        };
        loadTenant();
    }, []);

    const currentTenantId = tenantId || localTenantId;
    const currentTenantName = tenantName || localTenantName;

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Completa todos los campos');
            return;
        }
        if (!currentTenantId) {
            Alert.alert('Error', 'Selecciona una compañía primero');
            router.replace('/(auth)/company');
            return;
        }
        try {
            await login({ email: email.trim(), password, tenantId: currentTenantId });
            router.replace('/(tabs)/home');
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Credenciales inválidas');
        }
    };

    const handleChangeCompany = () => {
        router.replace('/(auth)/company');
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

                        <TouchableOpacity
                            onPress={handleChangeCompany}
                            style={styles.tenantPill}
                            activeOpacity={0.7}
                        >
                            <View style={styles.tenantDot} />
                            <Text style={styles.tenantText}>{currentTenantName || 'Seleccionar empresa'}</Text>
                            <Ionicons name="chevron-down" size={16} color={COLORS.text.muted} />
                        </TouchableOpacity>
                    </View>

                    {/* Card del formulario */}
                    <View style={styles.formCard}>
                        <Text style={styles.formTitle}>Iniciar Sesión</Text>
                        <Text style={styles.formSubtitle}>Ingresa tus credenciales para acceder</Text>

                        {/* Email */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Email</Text>
                            <View style={[
                                styles.inputContainer,
                                focusedInput === 'email' && styles.inputFocused
                            ]}>
                                <Ionicons
                                    name="mail-outline"
                                    size={20}
                                    color={focusedInput === 'email' ? COLORS.accent.blue : COLORS.text.muted}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="correo@ejemplo.com"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    value={email}
                                    onChangeText={(text) => { setEmail(text); if (error) clearError(); }}
                                    onFocus={() => setFocusedInput('email')}
                                    onBlur={() => setFocusedInput(null)}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>

                        {/* Password */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Contraseña</Text>
                            <View style={[
                                styles.inputContainer,
                                focusedInput === 'password' && styles.inputFocused
                            ]}>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={20}
                                    color={focusedInput === 'password' ? COLORS.accent.blue : COLORS.text.muted}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    value={password}
                                    onChangeText={(text) => { setPassword(text); if (error) clearError(); }}
                                    onFocus={() => setFocusedInput('password')}
                                    onBlur={() => setFocusedInput(null)}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={COLORS.text.muted}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Error */}
                        {error && (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle" size={18} color="#ef4444" />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        {/* Forgot password */}
                        <TouchableOpacity style={styles.forgotBtn}>
                            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
                            onPress={handleLogin}
                            disabled={isLoading}
                            activeOpacity={0.85}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <>
                                    <Text style={styles.loginBtnText}>Entrar</Text>
                                    <View style={styles.loginBtnIcon}>
                                        <Ionicons name="arrow-forward" size={18} color="#fff" />
                                    </View>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <View style={styles.securityIndicator}>
                            <View style={styles.securityDot} />
                            <Text style={styles.securityText}>HypernovaLabs</Text>
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
        paddingBottom: Platform.OS === 'ios' ? 100 : 80,
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
        width: 88,
        height: 88,
    },
    brandName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 16,
        letterSpacing: -0.3,
    },
    tenantPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.06)',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 100,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    tenantDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.accent.green,
    },
    tenantText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },

    // Form Card
    formCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    formTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 6,
    },
    formSubtitle: {
        fontSize: 14,
        color: COLORS.text.muted,
        marginBottom: 28,
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

    // Forgot
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotText: {
        color: COLORS.accent.blue,
        fontSize: 13,
        fontWeight: '500',
    },

    // Login Button
    loginBtn: {
        backgroundColor: COLORS.accent.blue,
        borderRadius: 14,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    loginBtnDisabled: {
        opacity: 0.6,
    },
    loginBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    loginBtnIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
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