// app/campaigns.tsx
import { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../src/contexts/ThemeContext';
import { useCampaignsStore, useCampaignsFiltered } from '../src/stores/campaigns-store';
import { CampaignCard } from '../src/components/campaigns/CampaignCard';
import {
    Campaign,
    getCampaignTypeColor,
    getCampaignTypeIcon,
    getCampaignTypeLabel,
    formatCampaignDates,
    getDaysRemaining,
} from '../src/api/campaigns.api';

type FilterTab = 'active' | 'upcoming' | 'participating';

export default function CampaignsScreen() {
    const { colors } = useTheme();
    const [activeTab, setActiveTab] = useState<FilterTab>('active');
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const { fetchCampaigns, participate, isLoading, error } = useCampaignsStore();
    const { active, upcoming, participating, activeCount, upcomingCount, participatingCount } =
        useCampaignsFiltered();

    const loadCampaigns = useCallback(async () => {
        await fetchCampaigns();
    }, [fetchCampaigns]);

    useEffect(() => {
        loadCampaigns();
    }, [loadCampaigns]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadCampaigns();
        setRefreshing(false);
    };

    const handleCampaignPress = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setShowDetailModal(true);
    };

    const handleParticipate = async () => {
        if (!selectedCampaign) return;

        const result = await participate(selectedCampaign.id);

        if (result.success) {
            // Update the selected campaign locally
            setSelectedCampaign(prev =>
                prev ? { ...prev, isParticipating: true } : null
            );
        }

        // Show feedback (in a real app, you'd use a toast/alert)
        console.log(result.message);
    };

    const getFilteredCampaigns = () => {
        switch (activeTab) {
            case 'active':
                return active;
            case 'upcoming':
                return upcoming;
            case 'participating':
                return participating;
            default:
                return active;
        }
    };

    const filteredCampaigns = getFilteredCampaigns();

    const tabs: { key: FilterTab; label: string; count: number }[] = [
        { key: 'active', label: 'Activas', count: activeCount },
        { key: 'upcoming', label: 'Próximas', count: upcomingCount },
        { key: 'participating', label: 'Mis campañas', count: participatingCount },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.primary }]} edges={['top']}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <View style={styles.headerTitle}>
                    <Text style={[styles.title, { color: colors.text.primary }]}>Ofertas</Text>
                    {activeCount > 0 && (
                        <View style={[styles.badge, { backgroundColor: '#8b5cf6' }]}>
                            <Text style={styles.badgeText}>{activeCount}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.brand.primary}
                        colors={[colors.brand.primary]}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Stats */}
                <View style={styles.heroStats}>
                    <View style={[styles.heroCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                        <View style={[styles.heroIcon, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                            <Ionicons name="flash" size={22} color="#22c55e" />
                        </View>
                        <Text style={[styles.heroValue, { color: '#22c55e' }]}>{activeCount}</Text>
                        <Text style={[styles.heroLabel, { color: colors.text.tertiary }]}>Activas</Text>
                    </View>
                    <View style={[styles.heroCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                        <View style={[styles.heroIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                            <Ionicons name="time" size={22} color="#3b82f6" />
                        </View>
                        <Text style={[styles.heroValue, { color: '#3b82f6' }]}>{upcomingCount}</Text>
                        <Text style={[styles.heroLabel, { color: colors.text.tertiary }]}>Próximas</Text>
                    </View>
                    <View style={[styles.heroCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                        <View style={[styles.heroIcon, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                            <Ionicons name="checkmark-circle" size={22} color="#8b5cf6" />
                        </View>
                        <Text style={[styles.heroValue, { color: '#8b5cf6' }]}>{participatingCount}</Text>
                        <Text style={[styles.heroLabel, { color: colors.text.tertiary }]}>Participando</Text>
                    </View>
                </View>

                {/* Section Title */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                        Explora Ofertas
                    </Text>
                </View>

                {/* Tabs */}
                <View style={[styles.tabsContainer, { backgroundColor: colors.bg.elevated }]}>
                    {tabs.map(tab => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[
                                styles.tab,
                                activeTab === tab.key && [styles.activeTab, { backgroundColor: colors.bg.card }],
                            ]}
                            onPress={() => setActiveTab(tab.key)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    { color: activeTab === tab.key ? colors.text.primary : colors.text.tertiary },
                                ]}
                            >
                                {tab.label}
                            </Text>
                            <View
                                style={[
                                    styles.tabBadge,
                                    {
                                        backgroundColor:
                                            activeTab === tab.key
                                                ? 'rgba(139, 92, 246, 0.15)'
                                                : colors.bg.elevated,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.tabBadgeText,
                                        { color: activeTab === tab.key ? '#8b5cf6' : colors.text.tertiary },
                                    ]}
                                >
                                    {tab.count}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Loading State */}
                {isLoading && !refreshing && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.brand.primary} />
                        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
                            Cargando ofertas...
                        </Text>
                    </View>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <View style={[styles.emptyContainer, { backgroundColor: colors.bg.card }]}>
                        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
                        <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>Error</Text>
                        <Text style={[styles.emptyText, { color: colors.text.secondary }]}>{error}</Text>
                        <TouchableOpacity
                            style={[styles.retryButton, { backgroundColor: colors.brand.primary }]}
                            onPress={loadCampaigns}
                        >
                            <Text style={styles.retryButtonText}>Reintentar</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Empty State */}
                {!isLoading && !error && filteredCampaigns.length === 0 && (
                    <View style={[styles.emptyContainer, { backgroundColor: colors.bg.card }]}>
                        <Ionicons name="megaphone-outline" size={48} color={colors.text.tertiary} />
                        <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
                            Sin ofertas
                        </Text>
                        <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                            {activeTab === 'active'
                                ? 'No hay ofertas activas en este momento'
                                : activeTab === 'upcoming'
                                ? 'No hay ofertas próximas programadas'
                                : 'Aún no participas en ninguna campaña'}
                        </Text>
                    </View>
                )}

                {/* Campaigns List */}
                {!isLoading && !error && filteredCampaigns.length > 0 && (
                    <View style={styles.listContainer}>
                        {filteredCampaigns.map(campaign => (
                            <CampaignCard
                                key={campaign.id}
                                campaign={campaign}
                                onPress={handleCampaignPress}
                            />
                        ))}
                    </View>
                )}

                {/* Bottom Padding */}
                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Campaign Detail Modal */}
            <Modal
                visible={showDetailModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowDetailModal(false)}
            >
                <CampaignDetailModal
                    campaign={selectedCampaign}
                    onClose={() => setShowDetailModal(false)}
                    onParticipate={handleParticipate}
                />
            </Modal>
        </SafeAreaView>
    );
}

interface CampaignDetailModalProps {
    campaign: Campaign | null;
    onClose: () => void;
    onParticipate: () => void;
}

function CampaignDetailModal({ campaign, onClose, onParticipate }: CampaignDetailModalProps) {
    const { colors } = useTheme();

    if (!campaign) return null;

    const typeColor = getCampaignTypeColor(campaign.type);
    const typeIcon = getCampaignTypeIcon(campaign.type);
    const typeLabel = getCampaignTypeLabel(campaign.type);
    const daysRemaining = getDaysRemaining(campaign.endDate);
    const canParticipate =
        (campaign.status === 'active' || campaign.status === 'upcoming') &&
        !campaign.isParticipating;

    return (
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.bg.primary }]}>
            {/* Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border.default }]}>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <Ionicons name="close" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: colors.text.primary }]}>Detalle</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <View style={[styles.modalHero, { backgroundColor: typeColor }]}>
                    <View style={styles.modalHeroIcon}>
                        <Ionicons name={typeIcon as any} size={40} color="white" />
                    </View>
                    {campaign.value && (
                        <View style={styles.modalValueBadge}>
                            <Text style={styles.modalValueText}>{campaign.value}</Text>
                        </View>
                    )}
                </View>

                {/* Content */}
                <View style={styles.modalBody}>
                    <Text style={[styles.modalCampaignTitle, { color: colors.text.primary }]}>
                        {campaign.title}
                    </Text>

                    <View style={styles.modalMeta}>
                        <View style={[styles.modalTypeBadge, { backgroundColor: `${typeColor}15` }]}>
                            <Ionicons name={typeIcon as any} size={14} color={typeColor} />
                            <Text style={[styles.modalTypeText, { color: typeColor }]}>{typeLabel}</Text>
                        </View>
                        <View style={styles.modalDates}>
                            <Ionicons name="calendar-outline" size={14} color={colors.text.tertiary} />
                            <Text style={[styles.modalDatesText, { color: colors.text.tertiary }]}>
                                {formatCampaignDates(campaign.startDate, campaign.endDate)}
                            </Text>
                        </View>
                    </View>

                    {campaign.status === 'active' && daysRemaining <= 7 && daysRemaining > 0 && (
                        <View style={styles.modalWarning}>
                            <Ionicons name="time-outline" size={16} color="#f59e0b" />
                            <Text style={styles.modalWarningText}>
                                {daysRemaining === 1
                                    ? 'Termina mañana'
                                    : `Termina en ${daysRemaining} días`}
                            </Text>
                        </View>
                    )}

                    <Text style={[styles.modalDescription, { color: colors.text.secondary }]}>
                        {campaign.description}
                    </Text>

                    {campaign.code && (
                        <View style={[styles.codeBox, { backgroundColor: colors.bg.elevated }]}>
                            <Text style={[styles.codeLabel, { color: colors.text.tertiary }]}>
                                Código promocional
                            </Text>
                            <Text style={[styles.codeText, { color: colors.text.primary }]}>
                                {campaign.code}
                            </Text>
                        </View>
                    )}

                    {campaign.terms && (
                        <View style={styles.termsSection}>
                            <Text style={[styles.termsTitle, { color: colors.text.primary }]}>
                                Términos y condiciones
                            </Text>
                            <Text style={[styles.termsText, { color: colors.text.tertiary }]}>
                                {campaign.terms}
                            </Text>
                        </View>
                    )}

                    {campaign.isParticipating && (
                        <View style={styles.participatingBadge}>
                            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                            <Text style={styles.participatingText}>Ya estás participando</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Action Button */}
            {canParticipate && (
                <View style={[styles.modalFooter, { borderTopColor: colors.border.default }]}>
                    <TouchableOpacity
                        style={[styles.participateBtn, { backgroundColor: typeColor }]}
                        onPress={onParticipate}
                    >
                        <Text style={styles.participateBtnText}>Participar ahora</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '700',
    },
    placeholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    heroStats: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    heroCard: {
        flex: 1,
        borderRadius: 14,
        borderWidth: 1,
        padding: 14,
        alignItems: 'center',
    },
    heroIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    heroValue: {
        fontSize: 22,
        fontWeight: '700',
    },
    heroLabel: {
        fontSize: 11,
        marginTop: 2,
    },
    sectionHeader: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
    },
    tabsContainer: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 8,
        gap: 4,
    },
    activeTab: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
    },
    tabBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    tabBadgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 14,
    },
    emptyContainer: {
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: '600',
        marginTop: 16,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
    },
    retryButton: {
        marginTop: 20,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    listContainer: {
        gap: 0,
    },
    // Modal styles
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    closeBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    modalContent: {
        flex: 1,
    },
    modalHero: {
        padding: 24,
        alignItems: 'center',
    },
    modalHeroIcon: {
        width: 72,
        height: 72,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalValueBadge: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 24,
    },
    modalValueText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1f2937',
    },
    modalBody: {
        padding: 20,
    },
    modalCampaignTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 12,
    },
    modalMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    modalTypeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 6,
    },
    modalTypeText: {
        fontSize: 13,
        fontWeight: '600',
    },
    modalDates: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    modalDatesText: {
        fontSize: 13,
    },
    modalWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderRadius: 10,
        marginBottom: 16,
    },
    modalWarningText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#f59e0b',
    },
    modalDescription: {
        fontSize: 15,
        lineHeight: 24,
        marginBottom: 20,
    },
    codeBox: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    codeLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    codeText: {
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: 2,
    },
    termsSection: {
        marginBottom: 20,
    },
    termsTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 8,
    },
    termsText: {
        fontSize: 13,
        lineHeight: 20,
    },
    participatingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderRadius: 12,
    },
    participatingText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#22c55e',
    },
    modalFooter: {
        padding: 16,
        borderTopWidth: 1,
    },
    participateBtn: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    participateBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
});
