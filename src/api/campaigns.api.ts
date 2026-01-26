/**
 * Campaigns API - Mock Implementation
 * Handles exclusive offers and campaigns for club members
 */

// ============ TYPES ============

export type CampaignType = 'discount' | 'bonus_points' | 'event' | 'referral' | 'promotion';
export type CampaignStatus = 'active' | 'upcoming' | 'expired' | 'participated';

export interface Campaign {
    id: string;
    title: string;
    description: string;
    shortDescription: string;
    type: CampaignType;
    status: CampaignStatus;
    imageUrl?: string;
    startDate: string;
    endDate: string;
    terms?: string;
    value?: string; // e.g., "20% descuento", "100 puntos", etc.
    code?: string; // Promo code if applicable
    targetAudience?: string;
    maxParticipants?: number;
    currentParticipants?: number;
    isParticipating?: boolean;
    clubId?: string;
    clubName?: string;
}

export interface CampaignsSummary {
    totalActive: number;
    totalUpcoming: number;
    participating: number;
}

// ============ MOCK DATA ============

const MOCK_CAMPAIGNS: Campaign[] = [
    {
        id: 'camp_001',
        title: 'Doble Puntos en Febrero',
        shortDescription: 'Gana el doble de puntos en todas tus compras',
        description: 'Durante todo febrero, acumula el doble de puntos en todas tus compras y pagos semanales. Aplica automáticamente en todos los clubs participantes.',
        type: 'bonus_points',
        status: 'active',
        startDate: '2026-02-01',
        endDate: '2026-02-28',
        value: '2x Puntos',
        terms: 'Válido del 1 al 28 de febrero de 2026. Aplica en compras y pagos semanales. No acumulable con otras promociones. Puntos se acreditan en 24-48 horas.',
        targetAudience: 'Todos los miembros activos',
    },
    {
        id: 'camp_002',
        title: 'Descuento en Canje',
        shortDescription: '20% menos puntos al canjear electrodomésticos',
        description: 'Canjea electrodomésticos seleccionados con 20% menos puntos de los requeridos. Incluye refrigeradores, lavadoras y estufas.',
        type: 'discount',
        status: 'active',
        startDate: '2026-01-15',
        endDate: '2026-02-15',
        value: '-20% puntos',
        terms: 'Aplica solo en electrodomésticos seleccionados. Sujeto a disponibilidad. Un canje por cliente durante la vigencia de la promoción.',
        clubId: 'club_central',
        clubName: 'Club Central',
    },
    {
        id: 'camp_003',
        title: 'Refiere y Gana',
        shortDescription: 'Gana $500 por cada amigo que se una',
        description: 'Invita a tus amigos y familiares a unirse al club. Por cada referido que active su membresía, recibirás $500 en tu próximo pago.',
        type: 'referral',
        status: 'active',
        startDate: '2026-01-01',
        endDate: '2026-03-31',
        value: '$500/referido',
        code: 'REFIERE2026',
        terms: 'El referido debe activar su membresía y realizar al menos un pago. Beneficio se aplica en el siguiente corte. Sin límite de referidos.',
        maxParticipants: 1000,
        currentParticipants: 342,
        isParticipating: true,
    },
    {
        id: 'camp_004',
        title: 'Evento VIP Marzo',
        shortDescription: 'Acceso exclusivo a preventa de productos',
        description: 'Sé el primero en acceder a nuestra nueva colección de muebles 2026. Precios especiales solo para miembros VIP del club.',
        type: 'event',
        status: 'upcoming',
        startDate: '2026-03-01',
        endDate: '2026-03-07',
        value: 'Acceso VIP',
        terms: 'Cupo limitado a 200 personas. Solo miembros con más de 6 meses de antigüedad. Registro obligatorio.',
        targetAudience: 'Miembros VIP',
        maxParticipants: 200,
        currentParticipants: 78,
    },
    {
        id: 'camp_005',
        title: 'Aniversario del Club',
        shortDescription: '15% descuento en tu siguiente pago',
        description: 'Celebra con nosotros 10 años del club. Disfruta de un 15% de descuento en tu siguiente pago semanal.',
        type: 'promotion',
        status: 'upcoming',
        startDate: '2026-04-01',
        endDate: '2026-04-30',
        value: '15% descuento',
        code: 'ANIVER10',
        terms: 'Válido una vez por cliente. Descuento máximo de $500. Aplica en pagos semanales regulares únicamente.',
    },
    {
        id: 'camp_006',
        title: 'Madrugadores',
        shortDescription: 'Puntos extra por pagar antes del viernes',
        description: 'Realiza tu pago semanal antes del viernes y recibe 25 puntos extra automáticamente.',
        type: 'bonus_points',
        status: 'active',
        startDate: '2026-01-01',
        endDate: '2026-06-30',
        value: '+25 puntos',
        terms: 'Aplica en pagos realizados de lunes a jueves. Puntos adicionales se acreditan el mismo día. Válido todo el semestre.',
        isParticipating: true,
    },
    {
        id: 'camp_007',
        title: 'Pack Familiar',
        shortDescription: 'Descuento especial en artículos de hogar',
        description: 'Promoción especial en artículos para el hogar. Ideal para renovar tu casa con productos de calidad.',
        type: 'discount',
        status: 'expired',
        startDate: '2025-12-01',
        endDate: '2025-12-31',
        value: '30% OFF',
        terms: 'Promoción finalizada.',
    },
    {
        id: 'camp_008',
        title: 'Sorteo Navideño',
        shortDescription: 'Participaste por una sala completa',
        description: 'Sorteo de fin de año. Participaste automáticamente por estar al corriente en tus pagos.',
        type: 'event',
        status: 'expired',
        startDate: '2025-12-15',
        endDate: '2025-12-24',
        value: 'Sorteo',
        isParticipating: true,
    },
];

// ============ API FUNCTIONS ============

/**
 * Get all campaigns with optional filtering
 */
export async function getCampaigns(
    status?: CampaignStatus
): Promise<{ campaigns: Campaign[]; summary: CampaignsSummary }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    let campaigns = [...MOCK_CAMPAIGNS];

    // Filter by status if provided
    if (status) {
        campaigns = campaigns.filter(c => c.status === status);
    }

    // Calculate summary
    const summary: CampaignsSummary = {
        totalActive: MOCK_CAMPAIGNS.filter(c => c.status === 'active').length,
        totalUpcoming: MOCK_CAMPAIGNS.filter(c => c.status === 'upcoming').length,
        participating: MOCK_CAMPAIGNS.filter(c => c.isParticipating).length,
    };

    return { campaigns, summary };
}

/**
 * Get active campaigns for home banner
 */
export async function getActiveCampaigns(): Promise<Campaign[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return MOCK_CAMPAIGNS.filter(c => c.status === 'active');
}

/**
 * Get campaign detail
 */
export async function getCampaignDetail(campaignId: string): Promise<Campaign | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_CAMPAIGNS.find(c => c.id === campaignId) || null;
}

/**
 * Participate in a campaign
 */
export async function participateInCampaign(campaignId: string): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const campaign = MOCK_CAMPAIGNS.find(c => c.id === campaignId);

    if (!campaign) {
        return { success: false, message: 'Campaña no encontrada' };
    }

    if (campaign.status !== 'active' && campaign.status !== 'upcoming') {
        return { success: false, message: 'Esta campaña ya no está disponible' };
    }

    if (campaign.isParticipating) {
        return { success: false, message: 'Ya estás participando en esta campaña' };
    }

    if (campaign.maxParticipants && campaign.currentParticipants &&
        campaign.currentParticipants >= campaign.maxParticipants) {
        return { success: false, message: 'Esta campaña ha alcanzado el límite de participantes' };
    }

    // In a real app, this would update the backend
    return { success: true, message: 'Te has registrado exitosamente en la campaña' };
}

// ============ HELPER FUNCTIONS ============

export function getCampaignTypeLabel(type: CampaignType): string {
    const labels: Record<CampaignType, string> = {
        discount: 'Descuento',
        bonus_points: 'Puntos Bonus',
        event: 'Evento',
        referral: 'Referidos',
        promotion: 'Promoción',
    };
    return labels[type];
}

export function getCampaignTypeIcon(type: CampaignType): string {
    const icons: Record<CampaignType, string> = {
        discount: 'pricetag',
        bonus_points: 'star',
        event: 'calendar',
        referral: 'people',
        promotion: 'gift',
    };
    return icons[type];
}

export function getCampaignTypeColor(type: CampaignType): string {
    const colors: Record<CampaignType, string> = {
        discount: '#ef4444',
        bonus_points: '#f59e0b',
        event: '#8b5cf6',
        referral: '#10b981',
        promotion: '#3b82f6',
    };
    return colors[type];
}

export function getCampaignStatusLabel(status: CampaignStatus): string {
    const labels: Record<CampaignStatus, string> = {
        active: 'Activa',
        upcoming: 'Próximamente',
        expired: 'Finalizada',
        participated: 'Participaste',
    };
    return labels[status];
}

export function getCampaignStatusColor(status: CampaignStatus): string {
    const colors: Record<CampaignStatus, string> = {
        active: '#22c55e',
        upcoming: '#3b82f6',
        expired: '#9ca3af',
        participated: '#8b5cf6',
    };
    return colors[status];
}

/**
 * Calculate days remaining for a campaign
 */
export function getDaysRemaining(endDate: string): number {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Format campaign dates for display
 */
export function formatCampaignDates(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const formatOptions: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
    };

    return `${start.toLocaleDateString('es-MX', formatOptions)} - ${end.toLocaleDateString('es-MX', formatOptions)}`;
}
