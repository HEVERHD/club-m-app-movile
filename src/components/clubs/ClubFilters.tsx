// src/components/clubs/ClubFilters.tsx - ARREGLADO
import { memo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import type { ClubFilters as IClubFilters } from '../../types/clubs';

interface Props {
    filters: IClubFilters;
    onChange: (filters: IClubFilters) => void;
}

type FilterOption = {
    key: string | undefined;
    label: string;
    colorKey?: 'muted' | 'green' | 'orange' | 'error';
};

const STATUS_OPTIONS: FilterOption[] = [
    { key: undefined, label: 'Todos', colorKey: 'muted' },
    { key: 'Activo', label: 'Activos', colorKey: 'green' },
    { key: 'Vencido', label: 'Vencidos', colorKey: 'orange' },
    { key: 'Anulado', label: 'Anulados', colorKey: 'error' },
];

export const ClubFilters = memo(function ClubFilters({ filters, onChange }: Props) {
    const { colors } = useTheme();

    const handleStatusPress = (status: string | undefined) => {
        onChange({ ...filters, status });
    };

    const getColor = (colorKey?: string) => {
        switch (colorKey) {
            case 'green': return colors.accent.green;
            case 'orange': return colors.accent.orange;
            case 'error': return colors.status.error;
            default: return colors.text.muted;
        }
    };

    return (
        <View style={styles.wrapper}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.container}
            >
                {STATUS_OPTIONS.map((opt) => {
                    const isActive = filters.status === opt.key;
                    const dotColor = getColor(opt.colorKey);
                    return (
                        <TouchableOpacity
                            key={opt.key ?? 'all'}
                            style={[
                                styles.chip,
                                { backgroundColor: colors.bg.card, borderColor: colors.border.default },
                                isActive && { backgroundColor: colors.accent.blue, borderColor: colors.accent.blue },
                            ]}
                            onPress={() => handleStatusPress(opt.key)}
                            activeOpacity={0.7}
                        >
                            {opt.colorKey && (
                                <View style={[styles.dot, { backgroundColor: isActive ? colors.white : dotColor }]} />
                            )}
                            <Text style={[
                                styles.chipText,
                                { color: colors.text.secondary },
                                isActive && { color: colors.white, fontWeight: '600' },
                            ]}>
                                {opt.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
});

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 8,
    },
    container: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 10,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '500',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
});
