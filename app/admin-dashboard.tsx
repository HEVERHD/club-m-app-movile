// app/admin-dashboard.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/auth-store';
import * as FileSystem from 'expo-file-system';

export default function AdminDashboardScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [htmlContent, setHtmlContent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    // Verificar que el usuario sea admin
    useEffect(() => {
        if (!user || user.role !== 'admin') {
            Alert.alert(
                'Acceso Denegado',
                'Solo usuarios administradores pueden acceder al Dashboard Ejecutivo',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } else {
            loadDashboard();
        }
    }, [user]);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError('');

            // Opción 1: Cargar desde URL hosteada (producción)
            const DASHBOARD_URL = 'https://raw.githubusercontent.com/tu-usuario/tu-repo/main/docs/index.html';

            // Para desarrollo local, puedes usar el HTML directamente
            // o cargar desde un servidor local

            setHtmlContent(DASHBOARD_URL);
        } catch (err) {
            console.error('Error cargando dashboard:', err);
            setError('Error al cargar el dashboard');
        } finally {
            setLoading(false);
        }
    };

    // Si no es admin, no mostrar nada
    if (!user || user.role !== 'admin') {
        return null;
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Stack.Screen
                    options={{
                        title: 'Dashboard Ejecutivo',
                        headerStyle: { backgroundColor: '#1a4a6e' },
                        headerTintColor: '#fff',
                    }}
                />
                <ActivityIndicator size="large" color="#1a4a6e" />
                <Text style={styles.loadingText}>Cargando Dashboard...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Stack.Screen
                    options={{
                        title: 'Dashboard Ejecutivo',
                        headerStyle: { backgroundColor: '#1a4a6e' },
                        headerTintColor: '#fff',
                    }}
                />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadDashboard}>
                    <Text style={styles.retryButtonText}>Reintentar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Dashboard Ejecutivo',
                    headerStyle: {
                        backgroundColor: '#1a4a6e',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            />

            <WebView
                source={{
                    uri: htmlContent || 'about:blank'
                }}
                style={styles.webview}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#1a4a6e" />
                    </View>
                )}
                onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.error('WebView error: ', nativeEvent);
                    setError('Error al renderizar el dashboard');
                }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                scalesPageToFit={true}
                useWebKit={true}
                // Configuración para mejor visualización
                androidLayerType="hardware"
                mixedContentMode="compatibility"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0f1a',
    },
    webview: {
        flex: 1,
        backgroundColor: '#0a0f1a',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0f1a',
    },
    loadingText: {
        marginTop: 16,
        color: '#94a3b8',
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0f1a',
        padding: 20,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#1a4a6e',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
