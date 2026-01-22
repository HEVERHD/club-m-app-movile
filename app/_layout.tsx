// app/_layout.tsx
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../src/stores/auth-store';
import { OfflineBanner } from '../src/components/ui/OfflineBanner';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';
import { COLORS } from '../src/constants/colors';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 5 * 60 * 1000,
        },
    },
});

// Componente interno que usa el tema
function AppContent() {
    const { colors, isDark } = useTheme();
    const [isReady, setIsReady] = useState(false);
    const loadStoredAuth = useAuthStore((state) => state.loadStoredAuth);

    useEffect(() => {
        const initAuth = async () => {
            await loadStoredAuth();
            setIsReady(true);
        };
        initAuth();
    }, []);

    if (!isReady) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.bg.primary }]}>
                <ActivityIndicator size="large" color={colors.brand.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.bg.primary }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.bg.primary} />
            <OfflineBanner />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="club/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="search" />
                <Stack.Screen name="draw" />
            </Stack>
        </View>
    );
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <SafeAreaProvider>
                <QueryClientProvider client={queryClient}>
                    <AppContent />
                </QueryClientProvider>
            </SafeAreaProvider>
        </ThemeProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
