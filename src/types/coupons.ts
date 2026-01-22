// src/types/coupons.ts

export type CouponType =
    | 'discount_percentage'  // Descuento porcentual
    | 'discount_fixed'       // Descuento fijo
    | 'free_week'           // Semana gratis
    | 'double_points'       // Puntos dobles
    | 'gift'                // Regalo
    | 'cashback';           // Cashback

export type CouponStatus =
    | 'available'    // Disponible para usar
    | 'used'         // Ya fue usado
    | 'expired'      // Expiró
    | 'locked';      // Bloqueado (necesita desbloquear)

export interface Coupon {
    id: string;
    code: string;
    type: CouponType;
    title: string;
    description: string;
    value: number;              // Valor del descuento/beneficio
    minPurchase?: number;       // Compra mínima requerida
    maxDiscount?: number;       // Descuento máximo (para porcentajes)
    expiresAt: string;          // Fecha de expiración ISO
    status: CouponStatus;
    usedAt?: string;            // Fecha de uso
    clubId?: string;            // Opcional: aplica solo a un club específico
    clubName?: string;          // Nombre del club si aplica
    terms?: string;             // Términos y condiciones
    imageUrl?: string;          // Imagen promocional opcional
}

export interface CouponRedemption {
    couponId: string;
    redeemedAt: string;
    clubId?: string;
    transactionId?: string;
}

// Helper para obtener el ícono según el tipo
export function getCouponIcon(type: CouponType): string {
    switch (type) {
        case 'discount_percentage':
        case 'discount_fixed':
            return 'pricetag-outline';
        case 'free_week':
            return 'calendar-outline';
        case 'double_points':
            return 'star-outline';
        case 'gift':
            return 'gift-outline';
        case 'cashback':
            return 'cash-outline';
        default:
            return 'ticket-outline';
    }
}

// Helper para obtener el color según el tipo
export function getCouponColor(type: CouponType): string {
    switch (type) {
        case 'discount_percentage':
            return '#22c55e'; // Green
        case 'discount_fixed':
            return '#3b82f6'; // Blue
        case 'free_week':
            return '#8b5cf6'; // Purple
        case 'double_points':
            return '#f59e0b'; // Amber
        case 'gift':
            return '#ec4899'; // Pink
        case 'cashback':
            return '#14b8a6'; // Teal
        default:
            return '#6b7280'; // Gray
    }
}

// Helper para formatear el valor del cupón
export function formatCouponValue(coupon: Coupon): string {
    switch (coupon.type) {
        case 'discount_percentage':
            return `${coupon.value}% OFF`;
        case 'discount_fixed':
            return `$${coupon.value.toFixed(2)} OFF`;
        case 'free_week':
            return `${coupon.value} Semana${coupon.value > 1 ? 's' : ''} Gratis`;
        case 'double_points':
            return `${coupon.value}x Puntos`;
        case 'gift':
            return 'Regalo';
        case 'cashback':
            return `${coupon.value}% Cashback`;
        default:
            return coupon.title;
    }
}

// Helper para obtener días restantes
export function getDaysUntilExpiry(expiresAt: string): number {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
}
