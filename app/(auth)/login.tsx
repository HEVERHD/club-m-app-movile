// app/(auth)/login.tsx
import { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ActivityIndicator,
    KeyboardAvoidingView, Platform, StyleSheet, StatusBar, Image,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore, isStaffRole } from '../../src/stores/auth-store';
import { CustomAlert } from '../../src/components/ui/CustomAlert';
import { useAlert } from '../../src/hooks/useAlert';
import { useBiometrics, getBiometricIcon, getBiometricLabel } from '../../src/hooks/useBiometrics';

export default function LoginScreen() {
    const insets = useSafeAreaInsets();
    const alert = useAlert();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localTenantId, setLocalTenantId] = useState<number | null>(null);
    const [localTenantName, setLocalTenantName] = useState<string | null>(null);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);

    const { login, isLoading, error, clearError, tenantId, tenantName } = useAuthStore();

    // Biometrics
    const {
        isAvailable: biometricAvailable,
        isEnabled: biometricEnabled,
        biometricType,
        authenticate,
        getSavedUserEmail,
        getSavedCredentials,
    } = useBiometrics();

    const [biometricReady, setBiometricReady] = useState(false);
    const [savedEmail, setSavedEmail] = useState<string | null>(null);

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

    // Cargar email guardado si biometría está habilitada
    useEffect(() => {
        const checkBiometric = async () => {
            if (biometricAvailable && biometricEnabled) {
                const email = await getSavedUserEmail();
                if (email) {
                    setSavedEmail(email);
                    setEmail(email);
                    setBiometricReady(true);
                }
            }
        };
        checkBiometric();
    }, [biometricAvailable, biometricEnabled, getSavedUserEmail]);

    const currentTenantId = tenantId || localTenantId;
    const currentTenantName = tenantName || localTenantName;

    const handleBiometricLogin = useCallback(async () => {
        try {
            // Autenticar con biometría
            const authSuccess = await authenticate();
            if (!authSuccess) {
                return;
            }

            // Obtener credenciales guardadas
            const credentials = await getSavedCredentials();
            if (!credentials) {
                alert.showError('Error', 'No se encontraron credenciales guardadas. Inicia sesión con tu contraseña.');
                return;
            }

            // Hacer login con las credenciales
            await login({
                email: credentials.email,
                password: credentials.password,
                tenantId: credentials.tenantId,
            });

            const user = useAuthStore.getState().user;
            const isStaff = user?.role ? isStaffRole(user.role) : false;

            if (isStaff) {
                router.replace('/(tabs)/home');
            } else {
                router.replace('/(tabs)/my-home');
            }
        } catch (e: any) {
            alert.showError('Error', e.message || 'No se pudo iniciar sesión');
        }
    }, [authenticate, getSavedCredentials, login, alert]);

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

            const user = useAuthStore.getState().user;
            const isStaff = user?.role ? isStaffRole(user.role) : false;

            if (isStaff) {
                router.replace('/(tabs)/home');
            } else {
                router.replace('/(tabs)/my-home');
            }
        } catch (e: any) {
            alert.showError('Error', e.message || 'Credenciales inválidas');
        }
    };

    const handleChangeCompany = () => {
        router.replace('/(auth)/company');
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
                    {/* Header con logo y tenant */}
                    <View style={styles.headerSection}>
                        <View style={styles.logoWrapper}>
                            <Image
                                source={require('../../assets/icon.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.brandName}>Club de Mercancías</Text>

                        <TouchableOpacity
                            onPress={handleChangeCompany}
                            style={styles.tenantPill}
                            activeOpacity={0.7}
                        >
                            <View style={styles.tenantDot} />
                            <Text style={styles.tenantText}>{currentTenantName || 'Seleccionar empresa'}</Text>
                            <Ionicons name="chevron-down" size={16} color="rgba(255,255,255,0.7)" />
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
                                focusedInput === 'email' && styles.inputContainerFocused
                            ]}>
                                <Ionicons
                                    name="mail-outline"
                                    size={20}
                                    color={focusedInput === 'email' ? '#2d6a8a' : '#9ca3af'}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="correo@ejemplo.com"
                                    placeholderTextColor="#9ca3af"
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
                                focusedInput === 'password' && styles.inputContainerFocused
                            ]}>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={20}
                                    color={focusedInput === 'password' ? '#2d6a8a' : '#9ca3af'}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
                                    placeholderTextColor="#9ca3af"
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
                                        color="#9ca3af"
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

                        {/* Login Button con degradado */}
                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={isLoading}
                            activeOpacity={0.85}
                            style={[styles.loginBtnWrapper, isLoading && styles.loginBtnDisabled]}
                        >
                            <LinearGradient
                                colors={['#1a4a6e', '#2d6a8a', '#3d8aa6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.loginBtn}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#ffffff" size="small" />
                                ) : (
                                    <>
                                        <Text style={styles.loginBtnText}>Entrar</Text>
                                        <Ionicons name="arrow-forward" size={18} color="#ffffff" />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Biometric Login Button */}
                        {biometricReady && (
                            <TouchableOpacity
                                onPress={handleBiometricLogin}
                                disabled={isLoading}
                                activeOpacity={0.7}
                                style={styles.biometricBtn}
                            >
                                <Ionicons
                                    name={getBiometricIcon(biometricType) as any}
                                    size={24}
                                    color="#2d6a8a"
                                />
                                <Text style={styles.biometricBtnText}>
                                    Usar {getBiometricLabel(biometricType)}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
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

    // Header
    headerSection: {
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
        marginBottom: 16,
        letterSpacing: -0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    tenantPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 100,
        gap: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    tenantDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#22c55e',
    },
    tenantText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#ffffff',
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
        marginBottom: 16,
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

    // Error
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef2f2',
        padding: 12,
        borderRadius: 12,
        gap: 10,
        marginBottom: 8,
        width: '100%',
    },
    errorText: {
        fontSize: 13,
        color: '#ef4444',
        flex: 1,
    },

    // Forgot
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    forgotText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#2d6a8a',
    },

    // Login Button
    loginBtnWrapper: {
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
    },
    loginBtn: {
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    loginBtnDisabled: {
        opacity: 0.6,
    },
    loginBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },

    // Biometric Button
    biometricBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 16,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: '#f9fafb',
    },
    biometricBtnText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#2d6a8a',
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
});
