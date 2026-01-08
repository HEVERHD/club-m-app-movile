// app/(auth)/login.tsx
import { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ActivityIndicator,
    KeyboardAvoidingView, Platform, Alert, StyleSheet, StatusBar,
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

    // Cambiar compañía - usar replace en lugar de back
    const handleChangeCompany = () => {
        router.replace('/(auth)/company');
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
                    <View style={styles.tenantBadge}>
                        <View style={styles.tenantIcon}>
                            <Ionicons name="business" size={14} color={COLORS.accent.cyan} />
                        </View>
                        <Text style={styles.tenantName}>{currentTenantName || 'Club'}</Text>
                        <TouchableOpacity onPress={handleChangeCompany} style={styles.changeTenant}>
                            <Ionicons name="swap-horizontal" size={14} color={COLORS.accent.blue} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.title}>Bienvenido 👋</Text>
                    <Text style={styles.subtitle}>Ingresa tus credenciales para continuar</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {/* Email Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Correo electrónico</Text>
                        <View style={[styles.inputContainer, focusedInput === 'email' && styles.inputContainerFocused]}>
                            <View style={styles.inputIconContainer}>
                                <Ionicons name="mail" size={18} color={focusedInput === 'email' ? COLORS.accent.blue : COLORS.text.muted} />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="correo@ejemplo.com"
                                placeholderTextColor={COLORS.text.muted}
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

                    {/* Password Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Contraseña</Text>
                        <View style={[styles.inputContainer, focusedInput === 'password' && styles.inputContainerFocused]}>
                            <View style={styles.inputIconContainer}>
                                <Ionicons name="lock-closed" size={18} color={focusedInput === 'password' ? COLORS.accent.blue : COLORS.text.muted} />
                            </View>
                            <TextInput
                                style={[styles.input, { paddingRight: 50 }]}
                                placeholder="••••••••"
                                placeholderTextColor={COLORS.text.muted}
                                value={password}
                                onChangeText={(text) => { setPassword(text); if (error) clearError(); }}
                                onFocus={() => setFocusedInput('password')}
                                onBlur={() => setFocusedInput(null)}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={COLORS.text.muted} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {error && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={18} color={COLORS.status.error} />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    <TouchableOpacity style={styles.forgotButton}>
                        <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <>
                                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                                <View style={styles.buttonArrow}>
                                    <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
                                </View>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <View style={styles.securityBadge}>
                        <Ionicons name="shield-checkmark" size={16} color={COLORS.accent.green} />
                        <Text style={styles.securityText}>Conexión segura</Text>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg.primary },
    content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
    header: { marginBottom: 32 },
    tenantBadge: {
        flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
        backgroundColor: COLORS.bg.card, borderRadius: 12,
        paddingVertical: 8, paddingHorizontal: 12, marginBottom: 24,
        borderWidth: 1, borderColor: COLORS.border.default, gap: 8,
    },
    tenantIcon: {
        width: 28, height: 28, borderRadius: 8,
        backgroundColor: 'rgba(6, 182, 212, 0.12)',
        justifyContent: 'center', alignItems: 'center',
    },
    tenantName: { color: COLORS.text.primary, fontSize: 14, fontWeight: '600' },
    changeTenant: {
        width: 28, height: 28, borderRadius: 8,
        backgroundColor: COLORS.bg.elevated,
        justifyContent: 'center', alignItems: 'center', marginLeft: 4,
    },
    title: { fontSize: 28, fontWeight: '700', color: COLORS.text.primary, marginBottom: 8, letterSpacing: -0.5 },
    subtitle: { fontSize: 15, color: COLORS.text.secondary },
    form: { gap: 16 },
    inputGroup: { marginBottom: 4 },
    label: {
        fontSize: 13, fontWeight: '600', color: COLORS.text.secondary,
        marginBottom: 8, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5,
    },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.bg.card, borderRadius: 14,
        borderWidth: 1.5, borderColor: COLORS.border.default,
    },
    inputContainerFocused: { borderColor: COLORS.accent.blue, backgroundColor: COLORS.bg.secondary },
    inputIconContainer: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
    input: { flex: 1, paddingVertical: 16, paddingRight: 16, fontSize: 16, color: COLORS.text.primary },
    eyeButton: {
        position: 'absolute', right: 14, width: 36, height: 36, borderRadius: 10,
        backgroundColor: COLORS.bg.elevated, justifyContent: 'center', alignItems: 'center',
    },
    errorContainer: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.status.errorBg, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)',
        borderRadius: 12, padding: 12, gap: 10,
    },
    errorText: { color: COLORS.status.error, fontSize: 13, flex: 1 },
    forgotButton: { alignSelf: 'flex-end', marginTop: 4 },
    forgotText: { color: COLORS.accent.blue, fontSize: 13, fontWeight: '600' },
    loginButton: {
        backgroundColor: COLORS.accent.blue, borderRadius: 14, paddingVertical: 16,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 8,
    },
    loginButtonDisabled: { opacity: 0.6 },
    loginButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
    buttonArrow: {
        width: 24, height: 24, borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center',
    },
    footer: { marginTop: 32, alignItems: 'center' },
    securityBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    securityText: { color: COLORS.text.muted, fontSize: 12, fontWeight: '500' },
});