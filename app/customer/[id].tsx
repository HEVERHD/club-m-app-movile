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
import { COLORS } from '../../src/constants/colors';

export default function CustomerDetailScreen() {
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

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.accent.blue} />
                <Text style={styles.loadingText}>Cargando cliente...</Text>
            </View>
        );
    }

    if (error || !customer) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={64} color={COLORS.status.error} />
                <Text style={styles.errorTitle}>Error</Text>
                <Text style={styles.errorMessage}>{error || 'Cliente no encontrado'}</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detalle del Cliente</Text>
                <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
                    <Ionicons name="create-outline" size={24} color={COLORS.accent.blue} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Perfil Card */}
                <View style={styles.profileCard}>
                    <Text style={styles.name}>{customer.fullName}</Text>

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
                            <View style={styles.tierBadge}>
                                <Ionicons name="ribbon" size={14} color={COLORS.accent.purple} />
                                <Text style={styles.tierText}>{customer.tierName}</Text>
                            </View>
                        )}
                    </View>

                    {/* Quick Info Grid */}
                    <View style={styles.quickInfoGrid}>
                        {customer.identificationNumber && (
                            <View style={styles.quickInfoItem}>
                                <Ionicons name="card-outline" size={16} color={COLORS.text.secondary} />
                                <Text style={styles.quickInfoLabel}>ID:</Text>
                                <Text style={styles.quickInfoValue}>{customer.identificationNumber}</Text>
                            </View>
                        )}
                        {customer.customerTypeName && (
                            <View style={styles.quickInfoItem}>
                                <Ionicons name="person-outline" size={16} color={COLORS.text.secondary} />
                                <Text style={styles.quickInfoLabel}>Tipo:</Text>
                                <Text style={styles.quickInfoValue}>{customer.customerTypeName}</Text>
                            </View>
                        )}
                        {customer.registrationDate && (
                            <View style={styles.quickInfoItem}>
                                <Ionicons name="calendar-outline" size={16} color={COLORS.text.secondary} />
                                <Text style={styles.quickInfoLabel}>Registro:</Text>
                                <Text style={styles.quickInfoValue}>{formatDate(customer.registrationDate)}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Estadísticas */}
                {stats && (
                    <View style={styles.statsCard}>
                        <Text style={styles.sectionTitle}>Resumen</Text>

                        <View style={styles.statsGrid}>
                            <View style={styles.statItem}>
                                <View style={[styles.statIcon, { backgroundColor: COLORS.accent.blue + '20' }]}>
                                    <Ionicons name="people" size={20} color={COLORS.accent.blue} />
                                </View>
                                <Text style={styles.statValue}>{stats.totalClubs}</Text>
                                <Text style={styles.statLabel}>Clubes Totales</Text>
                            </View>

                            <View style={styles.statItem}>
                                <View style={[styles.statIcon, { backgroundColor: COLORS.status.success + '20' }]}>
                                    <Ionicons name="checkmark-circle" size={20} color={COLORS.status.success} />
                                </View>
                                <Text style={styles.statValue}>{stats.activeClubs}</Text>
                                <Text style={styles.statLabel}>Clubes Activos</Text>
                            </View>

                            <View style={styles.statItem}>
                                <View style={[styles.statIcon, { backgroundColor: COLORS.accent.green + '20' }]}>
                                    <Ionicons name="cash" size={20} color={COLORS.accent.green} />
                                </View>
                                <Text style={styles.statValue}>{formatCurrency(stats.totalInvested)}</Text>
                                <Text style={styles.statLabel}>Total Invertido</Text>
                            </View>

                            <View style={styles.statItem}>
                                <View style={[styles.statIcon, { backgroundColor: COLORS.accent.orange + '20' }]}>
                                    <Ionicons name="wallet" size={20} color={COLORS.accent.orange} />
                                </View>
                                <Text style={styles.statValue}>{formatCurrency(stats.totalBalance)}</Text>
                                <Text style={styles.statLabel}>Balance Disponible</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.viewClubsBtn} onPress={handleViewClubs}>
                            <Text style={styles.viewClubsBtnText}>Ver Clubes</Text>
                            <Ionicons name="arrow-forward" size={18} color={COLORS.accent.blue} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Información de Contacto */}
                <View style={styles.infoCard}>
                    <Text style={styles.sectionTitle}>Información de Contacto</Text>

                    {customer.email && (
                        <View style={styles.infoRow}>
                            <View style={styles.infoIcon}>
                                <Ionicons name="mail" size={20} color={COLORS.accent.blue} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Email</Text>
                                <Text style={styles.infoValue}>{customer.email}</Text>
                            </View>
                        </View>
                    )}

                    {customer.phone && (
                        <View style={styles.infoRow}>
                            <View style={styles.infoIcon}>
                                <Ionicons name="call" size={20} color={COLORS.accent.green} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Teléfono</Text>
                                <Text style={styles.infoValue}>{customer.phone}</Text>
                            </View>
                        </View>
                    )}

                    {customer.identificationNumber && (
                        <View style={styles.infoRow}>
                            <View style={styles.infoIcon}>
                                <Ionicons name="card" size={20} color={COLORS.accent.purple} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Documento</Text>
                                <Text style={styles.infoValue}>{customer.identificationNumber}</Text>
                            </View>
                        </View>
                    )}

                    {customer.dateOfBirth && (
                        <View style={styles.infoRow}>
                            <View style={styles.infoIcon}>
                                <Ionicons name="calendar" size={20} color={COLORS.accent.orange} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Fecha de Nacimiento</Text>
                                <Text style={styles.infoValue}>{formatDate(customer.dateOfBirth)}</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Dirección */}
                {(customer.address || customer.city || customer.state) && (
                    <View style={styles.infoCard}>
                        <Text style={styles.sectionTitle}>Dirección</Text>

                        {customer.address && (
                            <View style={styles.infoRow}>
                                <View style={styles.infoIcon}>
                                    <Ionicons name="location" size={20} color={COLORS.accent.blue} />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Dirección</Text>
                                    <Text style={styles.infoValue}>{customer.address}</Text>
                                </View>
                            </View>
                        )}

                        {(customer.city || customer.state || customer.country) && (
                            <View style={styles.infoRow}>
                                <View style={styles.infoIcon}>
                                    <Ionicons name="business" size={20} color={COLORS.accent.green} />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Ubicación</Text>
                                    <Text style={styles.infoValue}>
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
                <View style={styles.infoCard}>
                    <Text style={styles.sectionTitle}>Información Adicional</Text>

                    <View style={styles.infoRow}>
                        <View style={styles.infoIcon}>
                            <Ionicons name="calendar-outline" size={20} color={COLORS.text.secondary} />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Fecha de Registro</Text>
                            <Text style={styles.infoValue}>{formatDate(customer.registrationDate)}</Text>
                        </View>
                    </View>

                    {customer.systemCode && (
                        <View style={styles.infoRow}>
                            <View style={styles.infoIcon}>
                                <Ionicons name="code-outline" size={20} color={COLORS.text.secondary} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Código de Sistema</Text>
                                <Text style={styles.infoValue}>{customer.systemCode}</Text>
                            </View>
                        </View>
                    )}

                    {customer.notes && (
                        <View style={styles.infoRow}>
                            <View style={styles.infoIcon}>
                                <Ionicons name="document-text-outline" size={20} color={COLORS.text.secondary} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Notas</Text>
                                <Text style={styles.infoValue}>{customer.notes}</Text>
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
        backgroundColor: COLORS.bg.primary,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 56,
        paddingBottom: 16,
        backgroundColor: COLORS.bg.card,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.default,
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
        color: COLORS.text.primary,
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
        backgroundColor: COLORS.bg.card,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border.default,
    },
    name: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.text.primary,
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
        backgroundColor: COLORS.accent.purple + '15',
        borderRadius: 12,
        gap: 4,
    },
    tierText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.accent.purple,
    },
    quickInfoGrid: {
        gap: 10,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.border.default,
    },
    quickInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    quickInfoLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: COLORS.text.secondary,
    },
    quickInfoValue: {
        fontSize: 13,
        color: COLORS.text.primary,
        flex: 1,
    },

    // Stats Card
    statsCard: {
        backgroundColor: COLORS.bg.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border.default,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text.primary,
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
        backgroundColor: COLORS.bg.elevated,
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
        color: COLORS.text.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.text.secondary,
        textAlign: 'center',
    },
    viewClubsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        backgroundColor: COLORS.accent.blue + '15',
        borderRadius: 12,
        gap: 8,
    },
    viewClubsBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.accent.blue,
    },

    // Info Card
    infoCard: {
        backgroundColor: COLORS.bg.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border.default,
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
        backgroundColor: COLORS.bg.elevated,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: COLORS.text.secondary,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.text.primary,
    },

    // Loading
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.bg.primary,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 15,
        color: COLORS.text.secondary,
    },

    // Error
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.bg.primary,
        padding: 40,
    },
    errorTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.text.primary,
        marginTop: 16,
        marginBottom: 8,
    },
    errorMessage: {
        fontSize: 15,
        color: COLORS.text.secondary,
        textAlign: 'center',
        marginBottom: 24,
    },
    backButton: {
        paddingHorizontal: 32,
        paddingVertical: 12,
        backgroundColor: COLORS.accent.blue,
        borderRadius: 12,
    },
    backButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.white,
    },
});
