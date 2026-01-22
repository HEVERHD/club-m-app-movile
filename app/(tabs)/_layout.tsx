// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuthStore, isStaffRole } from '../../src/stores/auth-store';

export default function TabsLayout() {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const user = useAuthStore((state) => state.user);

    // Determinar si es staff o cliente
    const isStaff = user?.role ? isStaffRole(user.role) : false;

    // Calcular altura del tab bar considerando safe area
    const tabBarHeight = Platform.OS === 'ios' ? 50 + insets.bottom : 60 + insets.bottom;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.bg.card,
                    borderTopColor: colors.border.light,
                    borderTopWidth: 1,
                    height: tabBarHeight,
                    paddingBottom: insets.bottom + 5,
                    paddingTop: 8,
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                },
                tabBarActiveTintColor: colors.brand.primary,
                tabBarInactiveTintColor: colors.text.secondary,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
                tabBarIconStyle: {
                    marginTop: 2,
                },
            }}
        >
            {/* ===== TABS PARA STAFF (Admin/Operator/Analyst) ===== */}
            <Tabs.Screen
                name="home"
                options={{
                    href: isStaff ? '/(tabs)/home' : null,
                    title: 'Inicio',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'home' : 'home-outline'}
                            size={22}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="customers"
                options={{
                    href: isStaff ? '/(tabs)/customers' : null,
                    title: 'Clientes',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'person' : 'person-outline'}
                            size={22}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="clubs"
                options={{
                    href: isStaff ? '/(tabs)/clubs' : null,
                    title: 'Clubes',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'people' : 'people-outline'}
                            size={22}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="draws"
                options={{
                    href: isStaff ? '/(tabs)/draws' : null,
                    title: 'Sorteos',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'trophy' : 'trophy-outline'}
                            size={22}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    href: isStaff ? '/(tabs)/profile' : null,
                    title: 'Perfil',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'settings' : 'settings-outline'}
                            size={22}
                            color={color}
                        />
                    ),
                }}
            />

            {/* ===== TABS PARA CLIENTES ===== */}
            <Tabs.Screen
                name="my-home"
                options={{
                    href: !isStaff ? '/(tabs)/my-home' : null,
                    title: 'Inicio',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'home' : 'home-outline'}
                            size={22}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="my-clubs"
                options={{
                    href: !isStaff ? '/(tabs)/my-clubs' : null,
                    title: 'Mis Clubes',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'wallet' : 'wallet-outline'}
                            size={22}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="my-draws"
                options={{
                    href: !isStaff ? '/(tabs)/my-draws' : null,
                    title: 'Mis Sorteos',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'trophy' : 'trophy-outline'}
                            size={22}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="my-profile"
                options={{
                    href: !isStaff ? '/(tabs)/my-profile' : null,
                    title: 'Mi Perfil',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'person-circle' : 'person-circle-outline'}
                            size={22}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
