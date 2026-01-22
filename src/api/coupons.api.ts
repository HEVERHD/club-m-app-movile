// src/api/coupons.api.ts
import type { Coupon } from '../types/coupons';

// Simular delay de red
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock data - en producción esto vendría del backend
const mockCoupons: Coupon[] = [
    {
        id: 'coup_1',
        code: 'BIENVENIDO10',
        type: 'discount_percentage',
        title: '10% de Descuento',
        description: 'Descuento de bienvenida en tu próximo pago semanal',
        value: 10,
        minPurchase: 20,
        maxDiscount: 50,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
        status: 'available',
        terms: 'Válido solo para nuevos usuarios. Aplica a pagos semanales de $20 o más. No acumulable con otras promociones.',
    },
    {
        id: 'coup_2',
        code: 'SEMANAGRATIS',
        type: 'free_week',
        title: 'Semana Gratis',
        description: 'Una semana gratis en tu club por ser cliente frecuente',
        value: 1,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
        status: 'available',
        terms: 'Aplica solo a clientes con más de 4 semanas pagadas consecutivas. Un cupón por cliente.',
    },
    {
        id: 'coup_3',
        code: 'PUNTOSX2',
        type: 'double_points',
        title: 'Puntos Dobles',
        description: 'Gana el doble de puntos en tus próximos 3 pagos',
        value: 2,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 días
        status: 'available',
        terms: 'Válido para los próximos 3 pagos realizados dentro del período de vigencia.',
    },
    {
        id: 'coup_4',
        code: 'AHORRO25',
        type: 'discount_fixed',
        title: '$25 de Descuento',
        description: 'Descuento fijo en tu próximo pago',
        value: 25,
        minPurchase: 100,
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 días - urgente!
        status: 'available',
        terms: 'Válido para pagos de $100 o más. No válido en combinación con otros cupones.',
    },
    {
        id: 'coup_5',
        code: 'REGALO2024',
        type: 'gift',
        title: 'Regalo Sorpresa',
        description: 'Un regalo especial te espera en la tienda',
        value: 1,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 días
        status: 'available',
        clubId: 'club_123',
        clubName: 'Electrodomésticos Plus',
        terms: 'Canjeable solo en la tienda Electrodomésticos Plus. Presentar este cupón al momento del canje.',
    },
    {
        id: 'coup_6',
        code: 'CASHBACK5',
        type: 'cashback',
        title: '5% Cashback',
        description: 'Recibe 5% de tu pago de vuelta',
        value: 5,
        maxDiscount: 100,
        expiresAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 días
        status: 'available',
        terms: 'El cashback se acreditará a tu cuenta en 24-48 horas después del pago. Máximo $100 de cashback.',
    },
    // Cupones usados (historial)
    {
        id: 'coup_7',
        code: 'DESC15MAYO',
        type: 'discount_percentage',
        title: '15% de Descuento',
        description: 'Promoción especial de mayo',
        value: 15,
        expiresAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // Ya pasó
        status: 'used',
        usedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        terms: 'Promoción de mayo 2024.',
    },
    {
        id: 'coup_8',
        code: 'VERANO20',
        type: 'discount_percentage',
        title: '20% de Verano',
        description: 'Promoción de verano',
        value: 20,
        expiresAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'expired',
        terms: 'Promoción de verano 2024. Expirado.',
    },
];

export interface GetCouponsResponse {
    coupons: Coupon[];
    totalAvailable: number;
}

export interface RedeemCouponResponse {
    success: boolean;
    message: string;
    redemptionId?: string;
    coupon?: Coupon;
}

/**
 * Obtiene todos los cupones del usuario
 */
export async function getCoupons(): Promise<GetCouponsResponse> {
    await delay(800); // Simular latencia

    // Actualizar estados de cupones expirados
    const now = new Date();
    const updatedCoupons = mockCoupons.map((c) => {
        if (c.status === 'available' && new Date(c.expiresAt) < now) {
            return { ...c, status: 'expired' as const };
        }
        return c;
    });

    const availableCount = updatedCoupons.filter((c) => c.status === 'available').length;

    return {
        coupons: updatedCoupons,
        totalAvailable: availableCount,
    };
}

/**
 * Canjea un cupón
 */
export async function redeemCoupon(couponId: string, clubId?: string): Promise<RedeemCouponResponse> {
    await delay(1000); // Simular latencia

    const coupon = mockCoupons.find((c) => c.id === couponId);

    if (!coupon) {
        return {
            success: false,
            message: 'Cupón no encontrado',
        };
    }

    if (coupon.status !== 'available') {
        return {
            success: false,
            message: coupon.status === 'used'
                ? 'Este cupón ya fue utilizado'
                : 'Este cupón ha expirado',
        };
    }

    if (new Date(coupon.expiresAt) < new Date()) {
        return {
            success: false,
            message: 'Este cupón ha expirado',
        };
    }

    // Simular canje exitoso
    const redemptionId = `red_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
        success: true,
        message: '¡Cupón canjeado exitosamente!',
        redemptionId,
        coupon: {
            ...coupon,
            status: 'used',
            usedAt: new Date().toISOString(),
        },
    };
}

/**
 * Valida un código de cupón
 */
export async function validateCouponCode(code: string): Promise<{ valid: boolean; coupon?: Coupon; message?: string }> {
    await delay(500);

    const coupon = mockCoupons.find(
        (c) => c.code.toLowerCase() === code.toLowerCase() && c.status === 'available'
    );

    if (!coupon) {
        return {
            valid: false,
            message: 'Código de cupón inválido o no disponible',
        };
    }

    if (new Date(coupon.expiresAt) < new Date()) {
        return {
            valid: false,
            message: 'Este cupón ha expirado',
        };
    }

    return {
        valid: true,
        coupon,
    };
}

/**
 * Genera cupones de prueba adicionales
 */
export function generateMockCoupon(): Coupon {
    const types: Coupon['type'][] = [
        'discount_percentage',
        'discount_fixed',
        'free_week',
        'double_points',
        'gift',
        'cashback',
    ];

    const randomType = types[Math.floor(Math.random() * types.length)];
    const id = `coup_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const baseValues: Record<Coupon['type'], { title: string; desc: string; value: number }> = {
        discount_percentage: { title: '% de Descuento', desc: 'Descuento porcentual en tu próximo pago', value: Math.floor(Math.random() * 20) + 5 },
        discount_fixed: { title: ' de Descuento', desc: 'Descuento fijo en tu próximo pago', value: Math.floor(Math.random() * 50) + 10 },
        free_week: { title: 'Semana Gratis', desc: 'Semanas gratis por ser cliente fiel', value: 1 },
        double_points: { title: 'Puntos Dobles', desc: 'Multiplica tus puntos', value: 2 },
        gift: { title: 'Regalo Especial', desc: 'Un regalo te espera', value: 1 },
        cashback: { title: '% Cashback', desc: 'Recibe dinero de vuelta', value: Math.floor(Math.random() * 10) + 3 },
    };

    const config = baseValues[randomType];

    return {
        id,
        code: `PROMO${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        type: randomType,
        title: randomType === 'discount_percentage' || randomType === 'cashback'
            ? `${config.value}${config.title}`
            : randomType === 'discount_fixed'
                ? `$${config.value}${config.title}`
                : config.title,
        description: config.desc,
        value: config.value,
        expiresAt: new Date(Date.now() + Math.floor(Math.random() * 30 + 3) * 24 * 60 * 60 * 1000).toISOString(),
        status: 'available',
        terms: 'Términos y condiciones aplican. No acumulable con otras promociones.',
    };
}
