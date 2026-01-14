// src/components/clubs/ClubFilters.tsx - ARREGLADO
import { memo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import type { ClubFilters as IClubFilters } from '../../types/clubs';

interface Props {
    filters: IClubFilters;
    onChange: (filters: IClubFilters) => void;
}

type FilterOption = {
    key: string | undefined;
    label: string;
    color?: string;
};

const STATUS_OPTIONS: FilterOption[] = [
    { key: 'Vencido', label: 'Vencidos (rápido)', color: COLORS.accent.orange }, // Por defecto para rendimiento
    { key: 'Activo', label: 'Activos', color: COLORS.accent.green },
    { key: undefined, label: 'Todos (lento)', color: COLORS.text.muted },
    { key: 'Anulado', label: 'Anulados', color: COLORS.status.error },
];

export const ClubFilters = memo(function ClubFilters({ filters, onChange }: Props) {
    const handleStatusPress = (status: string | undefined) => {
        onChange({ ...filters, status });
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
                    return (
                        <TouchableOpacity
                            key={opt.key ?? 'all'}
                            style={[
                                styles.chip,
                                isActive && styles.chipActive,
                            ]}
                            onPress={() => handleStatusPress(opt.key)}
                            activeOpacity={0.7}
                        >
                            {opt.color && (
                                <View style={[styles.dot, { backgroundColor: isActive ? COLORS.white : opt.color }]} />
                            )}
                            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
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
        backgroundColor: COLORS.bg.card,
        borderWidth: 1,
        borderColor: COLORS.border.default,
        marginRight: 10,
    },
    chipActive: {
        backgroundColor: COLORS.accent.blue,
        borderColor: COLORS.accent.blue,
    },
    chipText: {
        fontSize: 14,
        color: COLORS.text.secondary,
        fontWeight: '500',
    },
    chipTextActive: {
        color: COLORS.white,
        fontWeight: '600',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
});