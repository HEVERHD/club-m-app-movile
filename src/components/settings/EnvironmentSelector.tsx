// src/components/settings/EnvironmentSelector.tsx
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../../constants/colors';
import { Environment, useSettingsStore } from '../../stores/settingsStore';
import { logApiConfig } from '../../services/api.config';

const ENVIRONMENTS: { key: Environment; label: string; color: string; icon: string }[] = [
    { key: 'dev', label: 'Development', color: '#f59e0b', icon: 'code-slash' },
    { key: 'qa', label: 'QA / Testing', color: '#3b82f6', icon: 'flask' },
    { key: 'prod', label: 'Production', color: '#22c55e', icon: 'rocket' },
];

interface Props {
    showWarning?: boolean;
}

export function EnvironmentSelector({ showWarning = true }: Props) {
    const { environment, setEnvironment } = useSettingsStore();

    const handleSelect = (env: Environment) => {
        if (env === environment) return;

        if (showWarning && env === 'prod') {
            Alert.alert(
                '⚠️ Producción',
                '¿Estás seguro de cambiar a producción? Los datos serán reales.',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Cambiar',
                        style: 'destructive',
                        onPress: () => {
                            setEnvironment(env);
                            logApiConfig();
                        },
                    },
                ]
            );
            return;
        }

        setEnvironment(env);
        logApiConfig();

        Alert.alert('✅ Entorno cambiado', `Ahora estás en: ${env.toUpperCase()}`);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Entorno de API</Text>
            <Text style={styles.subtitle}>Selecciona el servidor al que conectarte</Text>

            <View style={styles.options}>
                {ENVIRONMENTS.map((env) => {
                    const isSelected = environment === env.key;
                    return (
                        <TouchableOpacity
                            key={env.key}
                            style={[
                                styles.option,
                                isSelected && styles.optionSelected,
                                isSelected && { borderColor: env.color },
                            ]}
                            onPress={() => handleSelect(env.key)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: `${env.color}20` }]}>
                                <Ionicons name={env.icon as any} size={20} color={env.color} />
                            </View>
                            <View style={styles.optionContent}>
                                <Text style={[styles.optionLabel, isSelected && { color: env.color }]}>
                                    {env.label}
                                </Text>
                                <Text style={styles.optionKey}>{env.key.toUpperCase()}</Text>
                            </View>
                            {isSelected && (
                                <View style={[styles.checkmark, { backgroundColor: env.color }]}>
                                    <Ionicons name="checkmark" size={14} color={COLORS.white} />
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={styles.currentEnv}>
                <Ionicons name="server-outline" size={16} color={COLORS.text.muted} />
                <Text style={styles.currentEnvText}>
                    Conectado a: {environment}-apim.aludra.cloud
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        color: COLORS.text.muted,
        marginBottom: 16,
    },
    options: {
        gap: 10,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        backgroundColor: COLORS.bg.card,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.border.default,
        gap: 12,
    },
    optionSelected: {
        backgroundColor: COLORS.bg.elevated,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionContent: {
        flex: 1,
    },
    optionLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    optionKey: {
        fontSize: 12,
        color: COLORS.text.muted,
        marginTop: 2,
    },
    checkmark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    currentEnv: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.border.default,
    },
    currentEnvText: {
        fontSize: 12,
        color: COLORS.text.muted,
        fontFamily: 'monospace',
    },
});