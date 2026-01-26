/**
 * CampaignCard Component
 * Displays a campaign/offer card with details and participation status
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import {
    Campaign,
    getCampaignTypeLabel,
    getCampaignTypeIcon,
    getCampaignTypeColor,
    getCampaignStatusLabel,
    getCampaignStatusColor,
    getDaysRemaining,
    formatCampaignDates,
} from '../../api/campaigns.api';

interface CampaignCardProps {
    campaign: Campaign;
    onPress?: (campaign: Campaign) => void;
    variant?: 'full' | 'compact';
}

export function CampaignCard({ campaign, onPress, variant = 'full' }: CampaignCardProps) {
    const { colors } = useTheme();

    const typeIcon = getCampaignTypeIcon(campaign.type);
    const typeColor = getCampaignTypeColor(campaign.type);
    const typeLabel = getCampaignTypeLabel(campaign.type);
    const statusColor = getCampaignStatusColor(campaign.status);
    const statusLabel = getCampaignStatusLabel(campaign.status);
    const daysRemaining = getDaysRemaining(campaign.endDate);
    const isEnding = campaign.status === 'active' && daysRemaining <= 7 && daysRemaining > 0;

    if (variant === 'compact') {
        return (
            <TouchableOpacity
                style={[styles.compactContainer, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}
                onPress={() => onPress?.(campaign)}
                activeOpacity={0.7}
            >
                <View style={[styles.compactIcon, { backgroundColor: `${typeColor}15` }]}>
                    <Ionicons name={typeIcon as any} size={20} color={typeColor} />
                </View>
                <View style={styles.compactContent}>
                    <Text style={[styles.compactTitle, { color: colors.text.primary }]} numberOfLines={1}>
                        {campaign.title}
                    </Text>
                    {campaign.value && (
                        <Text style={[styles.compactValue, { color: typeColor }]}>{campaign.value}</Text>
                    )}
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.text.quaternary} />
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}
            onPress={() => onPress?.(campaign)}
            activeOpacity={0.7}
        >
            {/* Header with gradient */}
            <LinearGradient
                colors={[typeColor, `${typeColor}CC`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                {/* Value Badge */}
                {campaign.value && (
                    <View style={styles.valueBadge}>
                        <Text style={styles.valueText}>{campaign.value}</Text>
                    </View>
                )}

                {/* Type Icon */}
                <View style={styles.headerIcon}>
                    <Ionicons name={typeIcon as any} size={32} color="rgba(255,255,255,0.9)" />
                </View>

                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <View style={[styles.statusDot, { backgroundColor: 'white' }]} />
                    <Text style={styles.statusText}>{statusLabel}</Text>
                </View>

                {/* Decorative circles */}
                <View style={styles.decorCircle1} />
                <View style={styles.decorCircle2} />
            </LinearGradient>

            {/* Content */}
            <View style={styles.content}>
                {/* Title */}
                <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={2}>
                    {campaign.title}
                </Text>

                {/* Description */}
                <Text style={[styles.description, { color: colors.text.secondary }]} numberOfLines={2}>
                    {campaign.shortDescription}
                </Text>

                {/* Meta Info Row */}
                <View style={styles.metaRow}>
                    {/* Type Badge */}
                    <View style={[styles.typeBadge, { backgroundColor: `${typeColor}15` }]}>
                        <Ionicons name={typeIcon as any} size={12} color={typeColor} />
                        <Text style={[styles.typeBadgeText, { color: typeColor }]}>{typeLabel}</Text>
                    </View>

                    {/* Dates */}
                    <View style={styles.datesContainer}>
                        <Ionicons name="calendar-outline" size={12} color={colors.text.tertiary} />
                        <Text style={[styles.datesText, { color: colors.text.tertiary }]}>
                            {formatCampaignDates(campaign.startDate, campaign.endDate)}
                        </Text>
                    </View>
                </View>

                {/* Warning for ending soon */}
                {isEnding && (
                    <View style={styles.warningRow}>
                        <Ionicons name="time-outline" size={14} color="#f59e0b" />
                        <Text style={styles.warningText}>
                            {daysRemaining === 1 ? 'Termina mañana' : `Termina en ${daysRemaining} días`}
                        </Text>
                    </View>
                )}

                {/* Participation status */}
                {campaign.isParticipating && (
                    <View style={styles.participatingRow}>
                        <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                        <Text style={styles.participatingText}>Ya estás participando</Text>
                    </View>
                )}

                {/* Progress bar for campaigns with participants limit */}
                {campaign.maxParticipants && campaign.currentParticipants !== undefined && (
                    <View style={styles.progressSection}>
                        <View style={styles.progressHeader}>
                            <Text style={[styles.progressLabel, { color: colors.text.tertiary }]}>
                                Participantes
                            </Text>
                            <Text style={[styles.progressCount, { color: colors.text.secondary }]}>
                                {campaign.currentParticipants}/{campaign.maxParticipants}
                            </Text>
                        </View>
                        <View style={[styles.progressBar, { backgroundColor: colors.bg.elevated }]}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        backgroundColor: typeColor,
                                        width: `${(campaign.currentParticipants / campaign.maxParticipants) * 100}%`,
                                    },
                                ]}
                            />
                        </View>
                    </View>
                )}

                {/* Club info if available */}
                {campaign.clubName && (
                    <View style={styles.clubRow}>
                        <Ionicons name="business-outline" size={12} color={colors.text.tertiary} />
                        <Text style={[styles.clubText, { color: colors.text.tertiary }]}>
                            {campaign.clubName}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
        marginBottom: 16,
    },
    header: {
        padding: 16,
        minHeight: 100,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    valueBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    valueText: {
        fontWeight: '800',
        fontSize: 14,
        color: '#1f2937',
    },
    headerIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    decorCircle1: {
        position: 'absolute',
        top: -20,
        right: -20,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    decorCircle2: {
        position: 'absolute',
        bottom: -30,
        left: 60,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 6,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        gap: 6,
    },
    typeBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    datesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    datesText: {
        fontSize: 12,
    },
    warningRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
        paddingVertical: 8,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderRadius: 8,
    },
    warningText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#f59e0b',
    },
    participatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
    },
    participatingText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#22c55e',
    },
    progressSection: {
        marginTop: 12,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    progressLabel: {
        fontSize: 12,
    },
    progressCount: {
        fontSize: 12,
        fontWeight: '600',
    },
    progressBar: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    clubRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    clubText: {
        fontSize: 12,
    },
    // Compact variant styles
    compactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 10,
    },
    compactIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    compactContent: {
        flex: 1,
    },
    compactTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    compactValue: {
        fontSize: 13,
        fontWeight: '700',
    },
});
