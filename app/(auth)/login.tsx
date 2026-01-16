// app/(auth)/login.tsx
import { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ActivityIndicator,
    KeyboardAvoidingView, Platform, StyleSheet, StatusBar, Image,
    ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../../src/stores/auth-store';
import { useTheme } from '../../src/contexts/ThemeContext';
import { CustomAlert } from '../../src/components/ui/CustomAlert';
import { useAlert } from '../../src/hooks/useAlert';

export default function LoginScreen() {
    const { colors, isDark } = useTheme();
    const alert = useAlert();
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
            alert.showError('Error', 'Completa todos los campos');
            return;
        }
        if (!currentTenantId) {
            alert.showError('Error', 'Selecciona una compañía primero');
            router.replace('/(auth)/company');
            return;
        }
        try {
            await login({ email: email.trim(), password, tenantId: currentTenantId });
            router.replace('/(tabs)/home');
        } catch (e: any) {
            alert.showError('Error', e.message || 'Credenciales inválidas');
        }
    };

    const handleChangeCompany = () => {
        router.replace('/(auth)/company');
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

                        <TouchableOpacity
                            onPress={handleChangeCompany}
                            style={[styles.tenantPill, { backgroundColor: colors.bg.elevated, borderColor: colors.border.default }]}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.tenantDot, { backgroundColor: colors.accent.green }]} />
                            <Text style={[styles.tenantText, { color: colors.text.primary }]}>{currentTenantName || 'Seleccionar empresa'}</Text>
                            <Ionicons name="chevron-down" size={16} color={colors.text.muted} />
                        </TouchableOpacity>
                    </View>

                    {/* Card del formulario */}
                    <View style={[styles.formCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                        <Text style={[styles.formTitle, { color: colors.text.primary }]}>Iniciar Sesión</Text>
                        <Text style={[styles.formSubtitle, { color: colors.text.muted }]}>Ingresa tus credenciales para acceder</Text>

                        {/* Email */}
                        <View style={styles.inputWrapper}>
                            <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Email</Text>
                            <View style={[
                                styles.inputContainer,
                                { backgroundColor: colors.bg.elevated, borderColor: colors.border.default },
                                focusedInput === 'email' && { borderColor: colors.accent.blue, backgroundColor: colors.accent.blue + '10' }
                            ]}>
                                <Ionicons
                                    name="mail-outline"
                                    size={20}
                                    color={focusedInput === 'email' ? colors.accent.blue : colors.text.muted}
                                />
                                <TextInput
                                    style={[styles.input, { color: colors.text.primary }]}
                                    placeholder="correo@ejemplo.com"
                                    placeholderTextColor={colors.text.muted}
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
                            <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Contraseña</Text>
                            <View style={[
                                styles.inputContainer,
                                { backgroundColor: colors.bg.elevated, borderColor: colors.border.default },
                                focusedInput === 'password' && { borderColor: colors.accent.blue, backgroundColor: colors.accent.blue + '10' }
                            ]}>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={20}
                                    color={focusedInput === 'password' ? colors.accent.blue : colors.text.muted}
                                />
                                <TextInput
                                    style={[styles.input, { color: colors.text.primary }]}
                                    placeholder="••••••••"
                                    placeholderTextColor={colors.text.muted}
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
                                        color={colors.text.muted}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Error */}
                        {error && (
                            <View style={[styles.errorBox, { backgroundColor: colors.status.errorBg }]}>
                                <Ionicons name="alert-circle" size={18} color={colors.status.error} />
                                <Text style={[styles.errorText, { color: colors.status.error }]}>{error}</Text>
                            </View>
                        )}

                        {/* Forgot password */}
                        <TouchableOpacity style={styles.forgotBtn}>
                            <Text style={[styles.forgotText, { color: colors.accent.blue }]}>¿Olvidaste tu contraseña?</Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[styles.loginBtn, { backgroundColor: colors.accent.blue }, isLoading && styles.loginBtnDisabled]}
                            onPress={handleLogin}
                            disabled={isLoading}
                            activeOpacity={0.85}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={colors.white} size="small" />
                            ) : (
                                <>
                                    <Text style={[styles.loginBtnText, { color: colors.white }]}>Entrar</Text>
                                    <View style={styles.loginBtnIcon}>
                                        <Ionicons name="arrow-forward" size={18} color={colors.white} />
                                    </View>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <View style={styles.securityIndicator}>
                            <View style={[styles.securityDot, { backgroundColor: colors.accent.green }]} />
                            <Text style={[styles.securityText, { color: colors.text.muted }]}>HypernovaLabs</Text>
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
        marginBottom: 16,
        letterSpacing: -0.3,
    },
    tenantPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 100,
        gap: 8,
        borderWidth: 1,
    },
    tenantDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    tenantText: {
        fontSize: 14,
        fontWeight: '500',
    },

    // Form Card
    formCard: {
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
    },
    formTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 6,
    },
    formSubtitle: {
        fontSize: 14,
        marginBottom: 28,
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

    // Forgot
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotText: {
        fontSize: 13,
        fontWeight: '500',
    },

    // Login Button
    loginBtn: {
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
    },
    securityText: {
        fontSize: 12,
        fontWeight: '500',
    },
});
