// src/schemas/club.schema.ts
import { z } from 'zod';

export const createClubSchema = z.object({
    customerId: z.string().min(1, 'Cliente es requerido'),
    clubTypeId: z.string().min(1, 'Tipo de club es requerido'),
    denominationId: z.string().min(1, 'Denominación es requerida'),
    share: z
        .number({ invalid_type_error: 'Debe ser un número' })
        .min(1, 'Mínimo 1')
        .max(99, 'Máximo 99'),
    startDate: z.string().min(1, 'Fecha de inicio es requerida'),
});

export type CreateClubFormData = z.infer<typeof createClubSchema>;

export const payWeekSchema = z.object({
    weekNumber: z.number().min(1).max(52),
    amount: z.number().positive('El monto debe ser positivo'),
    paymentMethod: z.string().optional(),
});

export type PayWeekFormData = z.infer<typeof payWeekSchema>;

export const createTransactionSchema = z.object({
    transactionTypeId: z.string().min(1, 'Tipo de transacción requerido'),
    amount: z.number().positive('El monto debe ser positivo'),
    description: z.string().optional(),
});

export type CreateTransactionFormData = z.infer<typeof createTransactionSchema>;

// Helper para obtener límite según share
export const getShareLimit = (share: number): number => {
    if (share >= 1 && share <= 39) return 100;
    if (share >= 40 && share <= 99) return 300;
    return 0;
};

// Validar si share está dentro del límite
export const isShareWithinLimit = (share: number, currentCount: number): boolean => {
    const limit = getShareLimit(share);
    return currentCount < limit;
};