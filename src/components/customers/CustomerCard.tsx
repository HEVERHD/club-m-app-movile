// src/components/customers/CustomerCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Customer } from '../../types/clubs';
import { useTheme } from '../../contexts/ThemeContext';

interface CustomerCardProps {
    customer: Customer;
}

export function CustomerCard({ customer }: CustomerCardProps) {
    const { colors } = useTheme();

    const handlePress = () => {
        router.push(`/customer/${customer.customerId}`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return colors.status.success;
            case 'suspended':
                return colors.status.warning;
            case 'inactive':
                return colors.text.muted;
            default:
                return colors.text.secondary;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active':
                return 'Activo';
            case 'suspended':
                return 'Suspendido';
            case 'inactive':
                return 'Inactivo';
            default:
                return status;
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('es-PA', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return 'N/A';
        }
    };

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            {/* Header: Nombre y Status */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={[styles.name, { color: colors.text.primary }]} numberOfLines={1}>
                        {customer.fullName}
                    </Text>
                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: `${getStatusColor(customer.status)}20` },
                        ]}
                    >
                        <View
                            style={[
                                styles.statusDot,
                                { backgroundColor: getStatusColor(customer.status) },
                            ]}
                        />
                        <Text style={[styles.statusText, { color: getStatusColor(customer.status) }]}>
                            {getStatusLabel(customer.status)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Grid de Información Principal */}
            <View style={[styles.infoGrid, { borderTopColor: colors.border.default, borderBottomColor: colors.border.default }]}>
                {/* Documento */}
                {customer.identificationNumber && (
                    <View style={styles.infoRow}>
                        <Ionicons name="id-card-outline" size={16} color={colors.text.secondary} />
                        <Text style={[styles.infoLabel, { color: colors.text.secondary }]}>Documento:</Text>
                        <Text style={[styles.infoValue, { color: colors.text.primary }]} numberOfLines={1}>
                            {customer.identificationNumber}
                        </Text>
                    </View>
                )}

                {/* Tipo de Cliente */}
                {customer.customerTypeName && (
                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={16} color={colors.text.secondary} />
                        <Text style={[styles.infoLabel, { color: colors.text.secondary }]}>Tipo:</Text>
                        <Text style={[styles.infoValue, { color: colors.text.primary }]} numberOfLines={1}>
                            {customer.customerTypeName}
                        </Text>
                    </View>
                )}

                {/* Email */}
                {customer.email && (
                    <View style={styles.infoRow}>
                        <Ionicons name="mail-outline" size={16} color={colors.text.secondary} />
                        <Text style={[styles.infoLabel, { color: colors.text.secondary }]}>Email:</Text>
                        <Text style={[styles.infoValue, { color: colors.text.primary }]} numberOfLines={1}>
                            {customer.email}
                        </Text>
                    </View>
                )}

                {/* Teléfono */}
                {customer.phone && (
                    <View style={styles.infoRow}>
                        <Ionicons name="call-outline" size={16} color={colors.text.secondary} />
                        <Text style={[styles.infoLabel, { color: colors.text.secondary }]}>Teléfono:</Text>
                        <Text style={[styles.infoValue, { color: colors.text.primary }]} numberOfLines={1}>
                            {customer.phone}
                        </Text>
                    </View>
                )}

                {/* Ubicación */}
                {(customer.city || customer.state) && (
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={16} color={colors.text.secondary} />
                        <Text style={[styles.infoLabel, { color: colors.text.secondary }]}>Ubicación:</Text>
                        <Text style={[styles.infoValue, { color: colors.text.primary }]} numberOfLines={1}>
                            {[customer.city, customer.state].filter(Boolean).join(', ')}
                        </Text>
                    </View>
                )}
            </View>

            {/* Footer con Metadata */}
            <View style={styles.footer}>
                {customer.tierName && (
                    <View style={[styles.tierBadge, { backgroundColor: colors.accent.purple + '15' }]}>
                        <Ionicons name="ribbon-outline" size={12} color={colors.accent.purple} />
                        <Text style={[styles.tierText, { color: colors.accent.purple }]}>{customer.tierName}</Text>
                    </View>
                )}

                <View style={styles.footerRight}>
                    <Ionicons name="calendar-outline" size={12} color={colors.text.muted} />
                    <Text style={[styles.dateText, { color: colors.text.muted }]}>
                        Registro: {formatDate(customer.registrationDate)}
                    </Text>
                </View>
            </View>

            {/* Chevron */}
            <View style={styles.chevron}>
                <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 14,
        paddingRight: 32,
    },
    headerLeft: {
        flex: 1,
        gap: 8,
    },
    name: {
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },

    // Info Grid
    infoGrid: {
        gap: 10,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingRight: 32,
    },
    infoLabel: {
        fontSize: 13,
        fontWeight: '500',
        width: 80,
    },
    infoValue: {
        fontSize: 13,
        flex: 1,
    },

    // Footer
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingRight: 32,
        flexWrap: 'wrap',
        gap: 8,
    },
    tierBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    tierText: {
        fontSize: 11,
        fontWeight: '600',
    },
    footerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        fontSize: 11,
    },

    // Chevron
    chevron: {
        position: 'absolute',
        right: 16,
        top: '50%',
        marginTop: -10,
    },
});
