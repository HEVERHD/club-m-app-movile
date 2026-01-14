// app/customer/_layout.tsx
import { Stack } from 'expo-router';

export default function CustomerLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        />
    );
}
