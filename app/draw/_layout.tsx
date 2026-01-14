// app/draw/_layout.tsx
import { Stack } from 'expo-router';

export default function DrawLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="[id]" />
            <Stack.Screen name="execute" />
        </Stack>
    );
}
