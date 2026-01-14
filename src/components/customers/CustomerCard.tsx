// src/components/customers/CustomerCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Customer } from '../../types/clubs';
import { COLORS } from '../../constants/colors';

interface CustomerCardProps {
    customer: Customer;
}

export function CustomerCard({ customer }: CustomerCardProps) {
    const handlePress = () => {
        router.push(`/customer/${customer.customerId}`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return COLORS.status.success;
            case 'suspended':
                return COLORS.status.warning;
            case 'inactive':
                return COLORS.text.muted;
            default:
                return COLORS.text.secondary;
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
            style={styles.card}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            {/* Header: Nombre y Status */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.name} numberOfLines={1}>
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
            <View style={styles.infoGrid}>
                {/* Documento */}
                {customer.identificationNumber && (
                    <View style={styles.infoRow}>
                        <Ionicons name="id-card-outline" size={16} color={COLORS.text.secondary} />
                        <Text style={styles.infoLabel}>Documento:</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>
                            {customer.identificationNumber}
                        </Text>
                    </View>
                )}

                {/* Tipo de Cliente */}
                {customer.customerTypeName && (
                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={16} color={COLORS.text.secondary} />
                        <Text style={styles.infoLabel}>Tipo:</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>
                            {customer.customerTypeName}
                        </Text>
                    </View>
                )}

                {/* Email */}
                {customer.email && (
                    <View style={styles.infoRow}>
                        <Ionicons name="mail-outline" size={16} color={COLORS.text.secondary} />
                        <Text style={styles.infoLabel}>Email:</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>
                            {customer.email}
                        </Text>
                    </View>
                )}

                {/* Teléfono */}
                {customer.phone && (
                    <View style={styles.infoRow}>
                        <Ionicons name="call-outline" size={16} color={COLORS.text.secondary} />
                        <Text style={styles.infoLabel}>Teléfono:</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>
                            {customer.phone}
                        </Text>
                    </View>
                )}

                {/* Ubicación */}
                {(customer.city || customer.state) && (
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={16} color={COLORS.text.secondary} />
                        <Text style={styles.infoLabel}>Ubicación:</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>
                            {[customer.city, customer.state].filter(Boolean).join(', ')}
                        </Text>
                    </View>
                )}
            </View>

            {/* Footer con Metadata */}
            <View style={styles.footer}>
                {customer.tierName && (
                    <View style={styles.tierBadge}>
                        <Ionicons name="ribbon-outline" size={12} color={COLORS.accent.purple} />
                        <Text style={styles.tierText}>{customer.tierName}</Text>
                    </View>
                )}

                <View style={styles.footerRight}>
                    <Ionicons name="calendar-outline" size={12} color={COLORS.text.muted} />
                    <Text style={styles.dateText}>
                        Registro: {formatDate(customer.registrationDate)}
                    </Text>
                </View>
            </View>

            {/* Chevron */}
            <View style={styles.chevron}>
                <Ionicons name="chevron-forward" size={20} color={COLORS.text.muted} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.bg.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border.default,
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
        color: COLORS.text.primary,
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
        borderTopColor: COLORS.border.default,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.default,
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
        color: COLORS.text.secondary,
        width: 80,
    },
    infoValue: {
        fontSize: 13,
        color: COLORS.text.primary,
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
        backgroundColor: COLORS.accent.purple + '15',
        borderRadius: 6,
    },
    tierText: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.accent.purple,
    },
    footerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        fontSize: 11,
        color: COLORS.text.muted,
    },

    // Chevron
    chevron: {
        position: 'absolute',
        right: 16,
        top: '50%',
        marginTop: -10,
    },
});
