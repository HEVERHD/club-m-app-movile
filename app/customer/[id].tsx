// app/customer/[id].tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCustomerStore } from '../../src/stores/customer-store';
import { useTheme } from '../../src/contexts/ThemeContext';
import { QRCodeCard } from '../../src/components/customers/QRCodeCard';

export default function CustomerDetailScreen() {
    const { colors } = useTheme();
    const { id } = useLocalSearchParams<{ id: string }>();
    const {
        selectedCustomer: customer,
        customerStats: stats,
        isLoadingDetail: isLoading,
        detailError: error,
        fetchCustomerDetail,
        clearSelectedCustomer,
    } = useCustomerStore();

    useEffect(() => {
        if (id) {
            fetchCustomerDetail(id);
        }

        return () => {
            clearSelectedCustomer();
        };
    }, [id]);

    const handleEdit = () => {
        if (!customer) return;

        // Determinar el tipo de cliente y navegar a la pantalla de edición correspondiente
        const isParticular = customer.customerTypeName?.toLowerCase().includes('particular') ||
            customer.customerTypeName?.toLowerCase().includes('natural');

        if (isParticular) {
            router.push(`/customer/edit-particular/${customer.customerId}`);
        } else {
            router.push(`/customer/edit-empresa/${customer.customerId}`);
        }
    };

    const handleViewClubs = () => {
        if (customer) {
            router.push({
                pathname: '/(tabs)/clubs',
                params: { customerId: customer.customerId },
            });
        }
    };

    const formatCurrency = (amount: number) => {
        return `$${amount.toFixed(2)}`;
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('es-PA', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            });
        } catch {
            return 'N/A';
        }
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

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.bg.primary }]}>
                <ActivityIndicator size="large" color={colors.brand.primary} />
                <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Cargando cliente...</Text>
            </View>
        );
    }

    if (error || !customer) {
        return (
            <View style={[styles.errorContainer, { backgroundColor: colors.bg.primary }]}>
                <Ionicons name="alert-circle-outline" size={64} color={colors.status.error} />
                <Text style={[styles.errorTitle, { color: colors.text.primary }]}>Error</Text>
                <Text style={[styles.errorMessage, { color: colors.text.secondary }]}>{error || 'Cliente no encontrado'}</Text>
                <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.brand.primary }]} onPress={() => router.back()}>
                    <Text style={[styles.backButtonText, { color: colors.white }]}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.bg.primary }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.bg.card, borderBottomColor: colors.border.default }]}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Detalle del Cliente</Text>
                <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
                    <Ionicons name="create-outline" size={24} color={colors.brand.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Perfil Card */}
                <View style={[styles.profileCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                    <Text style={[styles.name, { color: colors.text.primary }]}>{customer.fullName}</Text>

                    <View style={styles.badgesRow}>
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

                        {customer.tierName && (
                            <View style={[styles.tierBadge, { backgroundColor: colors.accent.purple + '15' }]}>
                                <Ionicons name="ribbon" size={14} color={colors.accent.purple} />
                                <Text style={[styles.tierText, { color: colors.accent.purple }]}>{customer.tierName}</Text>
                            </View>
                        )}
                    </View>

                    {/* Quick Info Grid */}
                    <View style={[styles.quickInfoGrid, { borderTopColor: colors.border.default }]}>
                        {customer.identificationNumber && (
                            <View style={styles.quickInfoItem}>
                                <Ionicons name="card-outline" size={16} color={colors.text.secondary} />
                                <Text style={[styles.quickInfoLabel, { color: colors.text.secondary }]}>ID:</Text>
                                <Text style={[styles.quickInfoValue, { color: colors.text.primary }]}>{customer.identificationNumber}</Text>
                            </View>
                        )}
                        {customer.customerTypeName && (
                            <View style={styles.quickInfoItem}>
                                <Ionicons name="person-outline" size={16} color={colors.text.secondary} />
                                <Text style={[styles.quickInfoLabel, { color: colors.text.secondary }]}>Tipo:</Text>
                                <Text style={[styles.quickInfoValue, { color: colors.text.primary }]}>{customer.customerTypeName}</Text>
                            </View>
                        )}
                        {customer.registrationDate && (
                            <View style={styles.quickInfoItem}>
                                <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} />
                                <Text style={[styles.quickInfoLabel, { color: colors.text.secondary }]}>Registro:</Text>
                                <Text style={[styles.quickInfoValue, { color: colors.text.primary }]}>{formatDate(customer.registrationDate)}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Código QR del Miembro */}
                {customer.identificationNumber && (
                    <QRCodeCard
                        customerId={customer.customerId}
                        identificationNumber={customer.identificationNumber}
                        customerName={customer.fullName}
                    />
                )}

                {/* Estadísticas */}
                {stats && (
                    <View style={[styles.statsCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Resumen</Text>

                        <View style={styles.statsGrid}>
                            <View style={[styles.statItem, { backgroundColor: colors.bg.elevated }]}>
                                <View style={[styles.statIcon, { backgroundColor: colors.brand.primary + '20' }]}>
                                    <Ionicons name="people" size={20} color={colors.brand.primary} />
                                </View>
                                <Text style={[styles.statValue, { color: colors.text.primary }]}>{stats.totalClubs}</Text>
                                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Clubes Totales</Text>
                            </View>

                            <View style={[styles.statItem, { backgroundColor: colors.bg.elevated }]}>
                                <View style={[styles.statIcon, { backgroundColor: colors.status.success + '20' }]}>
                                    <Ionicons name="checkmark-circle" size={20} color={colors.status.success} />
                                </View>
                                <Text style={[styles.statValue, { color: colors.text.primary }]}>{stats.activeClubs}</Text>
                                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Clubes Activos</Text>
                            </View>

                            <View style={[styles.statItem, { backgroundColor: colors.bg.elevated }]}>
                                <View style={[styles.statIcon, { backgroundColor: colors.status.success + '20' }]}>
                                    <Ionicons name="cash" size={20} color={colors.status.success} />
                                </View>
                                <Text style={[styles.statValue, { color: colors.text.primary }]}>{formatCurrency(stats.totalInvested)}</Text>
                                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Total Invertido</Text>
                            </View>

                            <View style={[styles.statItem, { backgroundColor: colors.bg.elevated }]}>
                                <View style={[styles.statIcon, { backgroundColor: colors.accent.orange + '20' }]}>
                                    <Ionicons name="wallet" size={20} color={colors.accent.orange} />
                                </View>
                                <Text style={[styles.statValue, { color: colors.text.primary }]}>{formatCurrency(stats.totalBalance)}</Text>
                                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Balance Disponible</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={[styles.viewClubsBtn, { backgroundColor: colors.brand.primary + '15' }]} onPress={handleViewClubs}>
                            <Text style={[styles.viewClubsBtnText, { color: colors.brand.primary }]}>Ver Clubes</Text>
                            <Ionicons name="arrow-forward" size={18} color={colors.brand.primary} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Información de Contacto */}
                <View style={[styles.infoCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Información de Contacto</Text>

                    {customer.email && (
                        <View style={styles.infoRow}>
                            <View style={[styles.infoIcon, { backgroundColor: colors.bg.elevated }]}>
                                <Ionicons name="mail" size={20} color={colors.brand.primary} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoLabel, { color: colors.text.secondary }]}>Email</Text>
                                <Text style={[styles.infoValue, { color: colors.text.primary }]}>{customer.email}</Text>
                            </View>
                        </View>
                    )}

                    {customer.phone && (
                        <View style={styles.infoRow}>
                            <View style={[styles.infoIcon, { backgroundColor: colors.bg.elevated }]}>
                                <Ionicons name="call" size={20} color={colors.status.success} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoLabel, { color: colors.text.secondary }]}>Teléfono</Text>
                                <Text style={[styles.infoValue, { color: colors.text.primary }]}>{customer.phone}</Text>
                            </View>
                        </View>
                    )}

                    {customer.identificationNumber && (
                        <View style={styles.infoRow}>
                            <View style={[styles.infoIcon, { backgroundColor: colors.bg.elevated }]}>
                                <Ionicons name="card" size={20} color={colors.accent.purple} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoLabel, { color: colors.text.secondary }]}>Documento</Text>
                                <Text style={[styles.infoValue, { color: colors.text.primary }]}>{customer.identificationNumber}</Text>
                            </View>
                        </View>
                    )}

                    {customer.dateOfBirth && (
                        <View style={styles.infoRow}>
                            <View style={[styles.infoIcon, { backgroundColor: colors.bg.elevated }]}>
                                <Ionicons name="calendar" size={20} color={colors.accent.orange} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoLabel, { color: colors.text.secondary }]}>Fecha de Nacimiento</Text>
                                <Text style={[styles.infoValue, { color: colors.text.primary }]}>{formatDate(customer.dateOfBirth)}</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Dirección */}
                {(customer.address || customer.city || customer.state) && (
                    <View style={[styles.infoCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Dirección</Text>

                        {customer.address && (
                            <View style={styles.infoRow}>
                                <View style={[styles.infoIcon, { backgroundColor: colors.bg.elevated }]}>
                                    <Ionicons name="location" size={20} color={colors.brand.primary} />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={[styles.infoLabel, { color: colors.text.secondary }]}>Dirección</Text>
                                    <Text style={[styles.infoValue, { color: colors.text.primary }]}>{customer.address}</Text>
                                </View>
                            </View>
                        )}

                        {(customer.city || customer.state || customer.country) && (
                            <View style={styles.infoRow}>
                                <View style={[styles.infoIcon, { backgroundColor: colors.bg.elevated }]}>
                                    <Ionicons name="business" size={20} color={colors.status.success} />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={[styles.infoLabel, { color: colors.text.secondary }]}>Ubicación</Text>
                                    <Text style={[styles.infoValue, { color: colors.text.primary }]}>
                                        {[customer.city, customer.state, customer.country]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                )}

                {/* Información Adicional */}
                <View style={[styles.infoCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Información Adicional</Text>

                    <View style={styles.infoRow}>
                        <View style={[styles.infoIcon, { backgroundColor: colors.bg.elevated }]}>
                            <Ionicons name="calendar-outline" size={20} color={colors.text.secondary} />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={[styles.infoLabel, { color: colors.text.secondary }]}>Fecha de Registro</Text>
                            <Text style={[styles.infoValue, { color: colors.text.primary }]}>{formatDate(customer.registrationDate)}</Text>
                        </View>
                    </View>

                    {customer.systemCode && (
                        <View style={styles.infoRow}>
                            <View style={[styles.infoIcon, { backgroundColor: colors.bg.elevated }]}>
                                <Ionicons name="code-outline" size={20} color={colors.text.secondary} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoLabel, { color: colors.text.secondary }]}>Código de Sistema</Text>
                                <Text style={[styles.infoValue, { color: colors.text.primary }]}>{customer.systemCode}</Text>
                            </View>
                        </View>
                    )}

                    {customer.notes && (
                        <View style={styles.infoRow}>
                            <View style={[styles.infoIcon, { backgroundColor: colors.bg.elevated }]}>
                                <Ionicons name="document-text-outline" size={20} color={colors.text.secondary} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoLabel, { color: colors.text.secondary }]}>Notas</Text>
                                <Text style={[styles.infoValue, { color: colors.text.primary }]}>{customer.notes}</Text>
                            </View>
                        </View>
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 56,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
        marginLeft: 8,
    },
    editBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Content
    content: {
        flex: 1,
        padding: 20,
    },

    // Profile Card
    profileCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
    },
    name: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 14,
    },
    badgesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
        flexWrap: 'wrap',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
    },
    tierBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    tierText: {
        fontSize: 12,
        fontWeight: '600',
    },
    quickInfoGrid: {
        gap: 10,
        paddingTop: 16,
        borderTopWidth: 1,
    },
    quickInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    quickInfoLabel: {
        fontSize: 13,
        fontWeight: '500',
    },
    quickInfoValue: {
        fontSize: 13,
        flex: 1,
    },

    // Stats Card
    statsCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
    },
    statItem: {
        flex: 1,
        minWidth: '45%',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
    },
    statIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
    viewClubsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    viewClubsBtnText: {
        fontSize: 15,
        fontWeight: '600',
    },

    // Info Card
    infoCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
        gap: 12,
    },
    infoIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '500',
    },

    // Loading
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 15,
    },

    // Error
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    errorTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginTop: 16,
        marginBottom: 8,
    },
    errorMessage: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 24,
    },
    backButton: {
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 12,
    },
    backButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
});
