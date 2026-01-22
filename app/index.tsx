// app/index.tsx
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore, isStaffRole } from '../src/stores/auth-store';

export default function Index() {
    const { isAuthenticated, isLoading, user } = useAuthStore();

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    if (isAuthenticated) {
        // Redirigir según el rol del usuario
        const isStaff = user?.role ? isStaffRole(user.role) : false;
        if (isStaff) {
            return <Redirect href="/(tabs)/home" />;
        } else {
            return <Redirect href="/(tabs)/my-home" />;
        }
    }

    return <Redirect href="/(auth)/company" />;
}