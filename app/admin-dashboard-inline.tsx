// app/admin-dashboard-inline.tsx
/**
 * Dashboard Ejecutivo - Versión con HTML Inline
 * Esta versión carga el HTML directamente embebido para mejor compatibilidad
 */
import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/auth-store';

export default function AdminDashboardInlineScreen() {
    const router = useRouter();
    const { user } = useAuthStore();

    // Verificar que el usuario sea admin
    useEffect(() => {
        if (!user || user.role !== 'admin') {
            Alert.alert(
                'Acceso Denegado',
                'Solo usuarios administradores pueden acceder al Dashboard Ejecutivo',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        }
    }, [user]);

    // Si no es admin, no mostrar nada
    if (!user || user.role !== 'admin') {
        return null;
    }

    // HTML simplificado del dashboard
    // NOTA: Para producción, puedes incluir el HTML completo aquí
    const dashboardHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Club de Mercancias - Dashboard Ejecutivo</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">
    <style>
        :root {
            --primary: #1a4a6e;
            --success: #22c55e;
            --warning: #f59e0b;
            --error: #ef4444;
            --info: #3b82f6;
            --bg-dark: #0a0f1a;
            --bg-card: #111827;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            padding: 20px;
            line-height: 1.6;
        }
        .hero {
            background: linear-gradient(135deg, #1a4a6e 0%, #2d6a8a 100%);
            padding: 40px 20px;
            border-radius: 20px;
            margin-bottom: 30px;
        }
        h1 {
            font-size: 2rem;
            font-weight: 900;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 1rem;
            opacity: 0.9;
            margin-bottom: 20px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 30px;
        }
        .stat {
            background: var(--bg-card);
            padding: 20px;
            border-radius: 16px;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .stat-value {
            font-size: 2rem;
            font-weight: 800;
            margin-bottom: 5px;
        }
        .stat-label {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }
        .section {
            background: var(--bg-card);
            padding: 24px;
            border-radius: 16px;
            margin-bottom: 20px;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .section h2 {
            font-size: 1.3rem;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .module {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            border-radius: 10px;
            margin-bottom: 10px;
        }
        .module-done {
            background: rgba(34, 197, 94, 0.1);
            border-left: 3px solid var(--success);
        }
        .module-mock {
            background: rgba(245, 158, 11, 0.1);
            border-left: 3px solid var(--warning);
        }
        .module-pending {
            background: rgba(239, 68, 68, 0.1);
            border-left: 3px solid var(--error);
        }
        .module i {
            font-size: 20px;
        }
        .module-done i { color: var(--success); }
        .module-mock i { color: var(--warning); }
        .module-pending i { color: var(--error); }
        .module-title {
            flex: 1;
            font-weight: 600;
        }
        .module-badge {
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        .badge-done {
            background: rgba(34, 197, 94, 0.2);
            color: var(--success);
        }
        .badge-mock {
            background: rgba(245, 158, 11, 0.2);
            color: var(--warning);
        }
        .badge-pending {
            background: rgba(239, 68, 68, 0.2);
            color: var(--error);
        }
    </style>
</head>
<body>
    <div class="hero">
        <h1>Club de Mercancias</h1>
        <p class="subtitle">Dashboard Ejecutivo - Estado del Proyecto</p>
    </div>

    <div class="stats">
        <div class="stat">
            <div class="stat-value" style="color: var(--success);">5/9</div>
            <div class="stat-label">Backend Real</div>
        </div>
        <div class="stat">
            <div class="stat-value" style="color: var(--warning);">4/9</div>
            <div class="stat-label">Mock Data</div>
        </div>
        <div class="stat">
            <div class="stat-value" style="color: var(--info);">36</div>
            <div class="stat-label">Pantallas</div>
        </div>
        <div class="stat">
            <div class="stat-value" style="color: var(--primary);">56%</div>
            <div class="stat-label">Backend Completo</div>
        </div>
    </div>

    <div class="section">
        <h2><i class="ri-check-double-line"></i> Backend Real (Aludra API)</h2>
        <div class="module module-done">
            <i class="ri-shield-check-line"></i>
            <div class="module-title">Autenticación y Usuarios</div>
            <span class="module-badge badge-done">MDL03</span>
        </div>
        <div class="module module-done">
            <i class="ri-user-settings-line"></i>
            <div class="module-title">Gestión de Clientes</div>
            <span class="module-badge badge-done">MDL05</span>
        </div>
        <div class="module module-done">
            <i class="ri-trophy-line"></i>
            <div class="module-title">Clubes y Membresías</div>
            <span class="module-badge badge-done">MDL05</span>
        </div>
        <div class="module module-done">
            <i class="ri-auction-line"></i>
            <div class="module-title">Sorteos</div>
            <span class="module-badge badge-done">MDL05</span>
        </div>
        <div class="module module-done">
            <i class="ri-money-dollar-circle-line"></i>
            <div class="module-title">Pagos de Cuotas</div>
            <span class="module-badge badge-done">MDL05</span>
        </div>
    </div>

    <div class="section">
        <h2><i class="ri-flask-line"></i> Datos Mock (Frontend Listo)</h2>
        <div class="module module-mock">
            <i class="ri-star-line"></i>
            <div class="module-title">Sistema de Puntos</div>
            <span class="module-badge badge-mock">Mock</span>
        </div>
        <div class="module module-mock">
            <i class="ri-coupon-3-line"></i>
            <div class="module-title">Cupones</div>
            <span class="module-badge badge-mock">Mock</span>
        </div>
        <div class="module module-mock">
            <i class="ri-shopping-cart-line"></i>
            <div class="module-title">Historial de Compras</div>
            <span class="module-badge badge-mock">Mock</span>
        </div>
        <div class="module module-mock">
            <i class="ri-megaphone-line"></i>
            <div class="module-title">Campañas</div>
            <span class="module-badge badge-mock">Mock</span>
        </div>
    </div>

    <div class="section">
        <h2><i class="ri-error-warning-line"></i> Pendiente de Integrar</h2>
        <div class="module module-pending">
            <i class="ri-bank-card-line"></i>
            <div class="module-title">Pasarela de Pago</div>
            <span class="module-badge badge-pending">No Integrado</span>
        </div>
    </div>
</body>
</html>
    `;

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
                originWhitelist={['*']}
                source={{ html: dashboardHTML }}
                style={styles.webview}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#1a4a6e" />
                    </View>
                )}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                scalesPageToFit={true}
                useWebKit={true}
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
});
