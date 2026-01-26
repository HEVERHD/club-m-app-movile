/**
 * Campaigns Store - Zustand State Management
 * Manages exclusive offers and campaigns with persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    Campaign,
    CampaignsSummary,
    CampaignStatus,
    getCampaigns,
    participateInCampaign,
} from '../api/campaigns.api';

// ============ TYPES ============

interface CampaignsState {
    // Data
    campaigns: Campaign[];
    summary: CampaignsSummary | null;
    seenCampaignIds: string[];

    // UI State
    isLoading: boolean;
    error: string | null;
    lastFetched: number | null;

    // Actions
    fetchCampaigns: (status?: CampaignStatus) => Promise<void>;
    participate: (campaignId: string) => Promise<{ success: boolean; message: string }>;
    markAsSeen: (campaignId: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

// ============ INITIAL STATE ============

const initialState = {
    campaigns: [],
    summary: null,
    seenCampaignIds: [],
    isLoading: false,
    error: null,
    lastFetched: null,
};

// ============ STORE ============

export const useCampaignsStore = create<CampaignsState>()(
    persist(
        (set, get) => ({
            ...initialState,

            fetchCampaigns: async (status?: CampaignStatus) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await getCampaigns(status);

                    set({
                        campaigns: response.campaigns,
                        summary: response.summary,
                        isLoading: false,
                        lastFetched: Date.now(),
                    });
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Error al cargar campañas';
                    set({ error: message, isLoading: false });
                }
            },

            participate: async (campaignId: string) => {
                try {
                    const result = await participateInCampaign(campaignId);

                    if (result.success) {
                        // Update campaign in local state
                        set(state => ({
                            campaigns: state.campaigns.map(c =>
                                c.id === campaignId
                                    ? {
                                          ...c,
                                          isParticipating: true,
                                          currentParticipants: (c.currentParticipants ?? 0) + 1,
                                      }
                                    : c
                            ),
                        }));
                    }

                    return result;
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Error al participar';
                    return { success: false, message };
                }
            },

            markAsSeen: (campaignId: string) => {
                set(state => ({
                    seenCampaignIds: state.seenCampaignIds.includes(campaignId)
                        ? state.seenCampaignIds
                        : [...state.seenCampaignIds, campaignId],
                }));
            },

            setLoading: (loading: boolean) => {
                set({ isLoading: loading });
            },

            setError: (error: string | null) => {
                set({ error });
            },

            reset: () => {
                set(initialState);
            },
        }),
        {
            name: 'campaigns-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: state => ({
                campaigns: state.campaigns,
                summary: state.summary,
                seenCampaignIds: state.seenCampaignIds,
                lastFetched: state.lastFetched,
            }),
        }
    )
);

// ============ SELECTORS ============

export const selectActiveCampaigns = (state: CampaignsState) =>
    state.campaigns.filter(c => c.status === 'active');

export const selectUpcomingCampaigns = (state: CampaignsState) =>
    state.campaigns.filter(c => c.status === 'upcoming');

export const selectExpiredCampaigns = (state: CampaignsState) =>
    state.campaigns.filter(c => c.status === 'expired');

export const selectParticipatingCampaigns = (state: CampaignsState) =>
    state.campaigns.filter(c => c.isParticipating);

export const selectUnseenCampaigns = (state: CampaignsState) =>
    state.campaigns.filter(
        c => c.status === 'active' && !state.seenCampaignIds.includes(c.id)
    );

// ============ HOOKS ============

/**
 * Hook to get filtered campaigns by status
 */
export function useCampaignsFiltered() {
    const campaigns = useCampaignsStore(state => state.campaigns);
    const summary = useCampaignsStore(state => state.summary);
    const seenCampaignIds = useCampaignsStore(state => state.seenCampaignIds);

    const all = campaigns;
    const active = campaigns.filter(c => c.status === 'active');
    const upcoming = campaigns.filter(c => c.status === 'upcoming');
    const expired = campaigns.filter(c => c.status === 'expired');
    const participating = campaigns.filter(c => c.isParticipating);
    const unseen = campaigns.filter(
        c => c.status === 'active' && !seenCampaignIds.includes(c.id)
    );

    return {
        all,
        active,
        upcoming,
        expired,
        participating,
        unseen,
        summary,
        activeCount: active.length,
        upcomingCount: upcoming.length,
        participatingCount: participating.length,
        unseenCount: unseen.length,
    };
}
