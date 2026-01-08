// src/stores/dashboard-store.ts
import { create } from 'zustand';
import { clubApi } from '../api/clubs.api';

interface DashboardStats {
    totalClubs: number;
    activeClubs: number;
    totalBalance: number;
    totalAmount: number;      // Monto total comprometido
    totalWeeksPaid: number;
    totalWeeksLate: number;
    totalPaidAmount: number;
    averageProgress: number;
    averageShare: number;     // Número promedio
}

interface RecentActivity {
    id: string;
    type: 'payment' | 'creation' | 'withdrawal';
    clubId: string;
    contractNumber: string;
    customerName: string;
    amount?: number;
    date: string;
}

interface DashboardState {
    stats: DashboardStats;
    recentActivity: RecentActivity[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;

    // Actions
    fetchDashboardData: () => Promise<void>;
    refreshStats: () => Promise<void>;
}

const initialStats: DashboardStats = {
    totalClubs: 0,
    activeClubs: 0,
    totalBalance: 0,
    totalAmount: 0,
    totalWeeksPaid: 0,
    totalWeeksLate: 0,
    totalPaidAmount: 0,
    averageProgress: 0,
    averageShare: 0,
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
    stats: initialStats,
    recentActivity: [],
    isLoading: false,
    error: null,
    lastUpdated: null,

    fetchDashboardData: async () => {
        set({ isLoading: true, error: null });

        try {
            // Obtener TODOS los clubes (sin filtro de status)
            const response = await clubApi.getClubs({}, 1, 100);
            const clubs = response.data;

            console.log('📊 Clubes obtenidos para dashboard:', clubs.length);
            console.log('📊 CLUB COMPLETO:', JSON.stringify(clubs[0], null, 2));

            // Calcular estadísticas
            const activeClubs = clubs.filter(c => c.active || c.statusName?.toLowerCase() === 'activo');

            const stats: DashboardStats = {
                totalClubs: clubs.length,
                activeClubs: activeClubs.length || clubs.length,
                totalBalance: clubs.reduce((sum, c) => sum + (c.balanceAmount || 0), 0),
                totalAmount: clubs.reduce((sum, c) => sum + (c.totalAmount || 0), 0),
                totalWeeksPaid: clubs.reduce((sum, c) => sum + (c.weeksPaid || 0), 0),
                totalWeeksLate: clubs.reduce((sum, c) => sum + (c.weeksLate || 0), 0),
                totalPaidAmount: clubs.reduce((sum, c) => sum + (c.paidAmount || 0), 0),
                averageProgress: clubs.length > 0
                    ? Math.round(clubs.reduce((sum, c) => {
                        const weeks = c.weeksPaid || 0;
                        return sum + (weeks / 52) * 100;
                    }, 0) / clubs.length)
                    : 0,
                averageShare: clubs.length > 0
                    ? Math.round(clubs.reduce((sum, c) => sum + (c.share || 0), 0) / clubs.length)
                    : 0,
            };

            console.log('📊 Stats calculados:', stats);

            // Crear actividad reciente de los últimos clubes
            const recentActivity: RecentActivity[] = clubs
                .slice(0, 5)
                .map(club => ({
                    id: club.clubId,
                    type: 'creation' as const,
                    clubId: club.clubId,
                    contractNumber: club.contractNumber,
                    customerName: club.customerName,
                    amount: club.paidAmount,
                    date: club.createdDate,
                }));

            set({
                stats,
                recentActivity,
                isLoading: false,
                lastUpdated: new Date(),
            });

            console.log('📊 Dashboard stats:', stats);
        } catch (error: any) {
            console.error('❌ Error fetching dashboard:', error);
            set({
                error: error.message || 'Error al cargar datos',
                isLoading: false,
            });
        }
    },

    refreshStats: async () => {
        await get().fetchDashboardData();
    },
}));