// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function TabsLayout() {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

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
                tabBarActiveTintColor: colors.accent.blue,
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
            <Tabs.Screen
                name="home"
                options={{
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
        </Tabs>
    );
}