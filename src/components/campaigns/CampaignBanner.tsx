/**
 * CampaignBanner Component
 * Horizontal scrollable banner for active campaigns on home screen
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import {
    Campaign,
    getCampaignTypeIcon,
    getCampaignTypeColor,
    getDaysRemaining,
} from '../../api/campaigns.api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 64; // 32px padding on each side

interface CampaignBannerProps {
    campaigns: Campaign[];
    onCampaignPress?: (campaign: Campaign) => void;
    onViewAllPress?: () => void;
}

export function CampaignBanner({ campaigns, onCampaignPress, onViewAllPress }: CampaignBannerProps) {
    const { colors } = useTheme();

    if (campaigns.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={[styles.headerIcon, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                        <Ionicons name="megaphone" size={16} color="#8b5cf6" />
                    </View>
                    <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
                        Ofertas Activas
                    </Text>
                    <View style={[styles.countBadge, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                        <Text style={styles.countText}>{campaigns.length}</Text>
                    </View>
                </View>
                {onViewAllPress && (
                    <TouchableOpacity onPress={onViewAllPress} style={styles.viewAllBtn}>
                        <Text style={[styles.viewAllText, { color: colors.brand.primary }]}>Ver todas</Text>
                        <Ionicons name="arrow-forward" size={14} color={colors.brand.primary} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Horizontal scroll of campaigns */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                decelerationRate="fast"
                snapToInterval={BANNER_WIDTH + 12}
                snapToAlignment="start"
            >
                {campaigns.map(campaign => (
                    <BannerItem
                        key={campaign.id}
                        campaign={campaign}
                        onPress={() => onCampaignPress?.(campaign)}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

interface BannerItemProps {
    campaign: Campaign;
    onPress?: () => void;
}

function BannerItem({ campaign, onPress }: BannerItemProps) {
    const typeColor = getCampaignTypeColor(campaign.type);
    const typeIcon = getCampaignTypeIcon(campaign.type);
    const daysRemaining = getDaysRemaining(campaign.endDate);
    const isEnding = daysRemaining <= 7 && daysRemaining > 0;

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
            <LinearGradient
                colors={[typeColor, `${typeColor}DD`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.bannerItem, { width: BANNER_WIDTH }]}
            >
                {/* Icon */}
                <View style={styles.bannerIcon}>
                    <Ionicons name={typeIcon as any} size={24} color="rgba(255,255,255,0.9)" />
                </View>

                {/* Content */}
                <View style={styles.bannerContent}>
                    <Text style={styles.bannerTitle} numberOfLines={1}>
                        {campaign.title}
                    </Text>
                    <Text style={styles.bannerDescription} numberOfLines={1}>
                        {campaign.shortDescription}
                    </Text>
                </View>

                {/* Value badge */}
                {campaign.value && (
                    <View style={styles.bannerValueBadge}>
                        <Text style={styles.bannerValueText}>{campaign.value}</Text>
                    </View>
                )}

                {/* Ending soon indicator */}
                {isEnding && (
                    <View style={styles.endingBadge}>
                        <Ionicons name="time" size={10} color="white" />
                        <Text style={styles.endingText}>
                            {daysRemaining === 1 ? '1 día' : `${daysRemaining}d`}
                        </Text>
                    </View>
                )}

                {/* Decorative elements */}
                <View style={styles.decorCircle1} />
                <View style={styles.decorCircle2} />
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    countBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    countText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#8b5cf6',
    },
    viewAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewAllText: {
        fontSize: 13,
        fontWeight: '600',
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 12,
    },
    bannerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        overflow: 'hidden',
        minHeight: 80,
    },
    bannerIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    bannerContent: {
        flex: 1,
    },
    bannerTitle: {
        color: 'white',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    bannerDescription: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 13,
    },
    bannerValueBadge: {
        backgroundColor: 'white',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        marginLeft: 8,
    },
    bannerValueText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#1f2937',
    },
    endingBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        gap: 3,
    },
    endingText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '600',
    },
    decorCircle1: {
        position: 'absolute',
        top: -15,
        right: -15,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    decorCircle2: {
        position: 'absolute',
        bottom: -20,
        left: 30,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
});
