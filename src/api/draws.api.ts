// src/api/draws.api.ts
import { mdl05Client, STORAGE_KEYS } from './client';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as SecureStore from 'expo-secure-store';
import { getBaseUrl, getApiKey } from '../services/api.config';
import type {
    Draw,
    DrawWinner,
    DrawFilters,
    PaginatedDraws,
    CreateDrawDTO,
} from '../types/clubs';

const BASE = '/mdl05';

// ============================================
// MAPPER
// ============================================
const mapDrawResponse = (d: any): Draw => {
    console.log('🗺️ mapDrawResponse - Datos de entrada:', JSON.stringify(d, null, 2));

    // Determinar el estado basado en los datos disponibles
    let status: 'pending' | 'completed' | 'cancelled' = 'completed';
    if (d.NumberPlayed === null || d.NumberPlayed === undefined || d.NumberPlayed === 0) {
        status = 'pending';
    }
    if (d.Status && typeof d.Status === 'string') {
        status = d.Status.toLowerCase();
    }

    const mappedNumberPlayed = d.NumberPlayed ?? d.numberPlayed ?? 0;
    console.log('🗺️ mapDrawResponse - NumberPlayed extraído:', {
        'd.NumberPlayed': d.NumberPlayed,
        'd.numberPlayed': d.numberPlayed,
        'mappedNumberPlayed': mappedNumberPlayed,
    });

    const result = {
        drawId: d.DrawId || d.drawId || '',
        clubTypeId: d.ClubTypeId || d.clubTypeId || '',
        clubTypeName: d.ClubTypeName || d.clubTypeName || 'Club',
        date: d.Date || d.date || '',
        numberPlayed: mappedNumberPlayed,
        winners: d.Winners || d.winners || [],
        totalWinners: d.TotalWinners ?? d.totalWinners ?? 0,
        totalPrizeAmount: d.TotalPrizeAmount ?? d.totalPrizeAmount ?? 0,
        status,
        executedBy: d.ExecutedBy || d.executedBy || d.CreatedBy,
        executedDate: d.ExecutedDate || d.executedDate || d.CreatedDate,
        notes: d.Notes || d.notes || d.Comment,
    };

    console.log('🗺️ mapDrawResponse - Draw mapeado:', JSON.stringify(result, null, 2));
    console.log('🗺️ mapDrawResponse - result.numberPlayed:', result.numberPlayed);

    return result;
};

const mapWinnerResponse = (w: any): DrawWinner => ({
    clubId: w.ClubId || w.clubId || '',
    contractNumber: w.ContractNumber || w.contractNumber || '',
    customerId: w.CustomerId || w.customerId || '',
    customerName: w.CustomerName || w.customerName || '',
    customerNumber: w.CustomerNumber || w.customerNumber,
    share: w.Share || w.share || 0,
    prizeAmount: w.PrizeAmount || w.prizeAmount || 0,
    denominationId: w.DenominationId || w.denominationId || '',
    denominationValue: w.DenominationValue || w.denominationValue,
    notified: w.Notified || w.notified || false,
    claimed: w.Claimed || w.claimed || false,
    claimDate: w.ClaimDate || w.claimDate,
});

// ============================================
// API
// ============================================
export const drawsApi = {
    /**
     * Obtener lista de sorteos
     */
    async getDraws(filters: DrawFilters = {}, page = 1, pageSize = 20): Promise<PaginatedDraws> {
        try {
            console.log('📤 Buscando sorteos...');

            // Nota: El endpoint requiere /DrawId/undefined (literal) para listar todos los sorteos
            // Es una peculiaridad del backend donde "undefined" actúa como wildcard
            const { data: response } = await mdl05Client.get(`${BASE}/Draw/Get/DrawId/undefined`);

            console.log('📥 Respuesta raw:', JSON.stringify(response, null, 2).substring(0, 500));

            const dataArray = Array.isArray(response) ? response : (response.Data || []);

            // Aplicar filtros localmente si es necesario
            let filteredDraws = dataArray;

            if (filters.status) {
                filteredDraws = filteredDraws.filter((d: any) => {
                    // Determinar el estado basado en NumberPlayed
                    let status: 'pending' | 'completed' | 'cancelled' = 'completed';
                    if (d.NumberPlayed === null || d.NumberPlayed === undefined || d.NumberPlayed === 0) {
                        status = 'pending';
                    }
                    if (d.Status && typeof d.Status === 'string') {
                        status = d.Status.toLowerCase();
                    }
                    return status === filters.status;
                });
            }

            if (filters.clubTypeId) {
                filteredDraws = filteredDraws.filter((d: any) => {
                    const clubTypeId = d.ClubTypeId || d.clubTypeId;
                    return clubTypeId === filters.clubTypeId;
                });
            }

            // Ordenar por fecha descendente
            filteredDraws.sort((a: any, b: any) => {
                const dateA = new Date(a.Date || a.date);
                const dateB = new Date(b.Date || b.date);
                return dateB.getTime() - dateA.getTime();
            });

            const draws: Draw[] = filteredDraws.map(mapDrawResponse);
            const total = draws.length;

            // Aplicar paginación local
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedDraws = draws.slice(startIndex, endIndex);

            console.log(`✅ Sorteos obtenidos: ${paginatedDraws.length} de ${total}`);

            return {
                data: paginatedDraws,
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            };
        } catch (error: any) {
            console.error('❌ Error en getDraws:', error.message);
            console.error('❌ Error completo:', error);
            return { data: [], total: 0, page, pageSize, totalPages: 0 };
        }
    },

    /**
     * Obtener sorteo por ID
     */
    async getDrawById(drawId: string): Promise<Draw | null> {
        try {
            console.log('🔍 Buscando sorteo por ID:', drawId);

            const { data } = await mdl05Client.get(`${BASE}/Draw/Get/DrawId/${drawId}`);

            if (!data) {
                throw new Error('Sorteo no encontrado');
            }

            // El backend retorna { Data: [...], Status: {...}, Info: {...} }
            // Necesitamos extraer el primer elemento del array Data
            const drawData = Array.isArray(data) ? data[0] : (data.Data?.[0] || data);

            console.log('🔍 drawData extraído para mapear:', JSON.stringify(drawData, null, 2));

            const draw = mapDrawResponse(drawData);
            console.log('✅ Sorteo encontrado:', draw.drawId);

            return draw;
        } catch (error: any) {
            console.error('❌ Error en getDrawById:', error);
            return null;
        }
    },

    /**
     * Obtener ganadores de un sorteo
     * TODO: Endpoint no disponible todavía, retorna array vacío
     */
    async getDrawWinners(drawId: string): Promise<DrawWinner[]> {
        try {
            console.log('🏆 Obteniendo ganadores del sorteo:', drawId);
            console.log('⚠️ Endpoint de ganadores no disponible todavía');

            // TODO: Implementar cuando el endpoint esté disponible
            // const { data } = await mdl05Client.get(`${BASE}/Draw/Winners/${drawId}`);
            // return (data.Data || data || []).map(mapWinnerResponse);

            return [];
        } catch (error: any) {
            console.error('❌ Error en getDrawWinners:', error);
            return [];
        }
    },

    /**
     * Ejecutar un nuevo sorteo
     * Este endpoint genera un número aleatorio y busca los clubes ganadores
     */
    async executeDraw(dto: CreateDrawDTO): Promise<Draw> {
        try {
            // Usar fecha actual en formato simple
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const drawDate = `${year}-${month}-${day} 00:00:00.000`;

            const payload = {
                Share: dto.manualNumber,
                DrawDate: drawDate,
                AlternativeHour: null,
                AlternativeDate: '',
                Comment: '',
            };

            console.log('🎲 Ejecutando sorteo con payload:', JSON.stringify(payload, null, 2));

            const { data } = await mdl05Client.post(`${BASE}/Club/RegisterDraw`, payload);

            console.log('✅ Sorteo ejecutado - Respuesta completa:', JSON.stringify(data, null, 2));

            // Verificar si fue exitoso
            if (data?.Status?.Code !== 200 && data?.Data?.Status !== 200) {
                throw new Error(data?.Data?.Message || data?.Status?.Message || 'Error al registrar sorteo');
            }

            // Extraer información del sorteo registrado
            const drawId = data?.Data?.DrawId || '';

            console.log('🔢 VALORES DISPONIBLES EN RESPUESTA:', {
                'data?.Data?.NumberPlayed': data?.Data?.NumberPlayed,
                'data?.Data?.Share': data?.Data?.Share,
                'dto.manualNumber': dto.manualNumber,
            });

            const numberPlayed = data?.Data?.NumberPlayed ?? data?.Data?.Share ?? dto.manualNumber;

            console.log('🔢 Número extraído del backend:', {
                NumberPlayed: data?.Data?.NumberPlayed,
                Share: data?.Data?.Share,
                numberPlayed,
                usedFromDTO: !data?.Data?.NumberPlayed && !data?.Data?.Share,
            });

            console.log('🔢 VERIFICACIÓN FINAL - numberPlayed:', numberPlayed);
            console.log('🔢 VERIFICACIÓN FINAL - typeof numberPlayed:', typeof numberPlayed);

            // Intentar obtener el sorteo completo del backend
            if (drawId) {
                try {
                    const draw = await this.getDrawById(drawId);
                    if (draw) {
                        console.log('✅ Sorteo obtenido después de registro:', JSON.stringify(draw, null, 2));
                        console.log('✅ draw.numberPlayed después de getDrawById:', draw.numberPlayed);
                        console.log('✅ typeof draw.numberPlayed:', typeof draw.numberPlayed);
                        return draw;
                    }
                } catch (error) {
                    console.warn('⚠️ No se pudo obtener el sorteo completo, usando datos básicos');
                }
            }

            // Si no podemos obtener el sorteo completo, crear uno básico con los datos de la respuesta
            const basicDraw: Draw = {
                drawId: drawId,
                clubTypeId: dto.clubTypeId,
                clubTypeName: undefined,
                date: data?.Data?.Date || drawDate,
                numberPlayed: numberPlayed,
                winners: [],
                totalWinners: 0,
                totalPrizeAmount: 0,
                status: 'completed',
                executedBy: undefined,
                executedDate: new Date().toISOString(),
                notes: undefined,
            };

            console.log('📋 Retornando sorteo básico:', JSON.stringify(basicDraw, null, 2));
            console.log('📋 basicDraw.numberPlayed:', basicDraw.numberPlayed);
            console.log('📋 typeof basicDraw.numberPlayed:', typeof basicDraw.numberPlayed);
            return basicDraw;
        } catch (error: any) {
            console.error('❌ Error ejecutando sorteo:', error);
            throw new Error(error.response?.data?.message || error.message || 'Error al ejecutar sorteo');
        }
    },

    /**
     * Cancelar un sorteo
     * TODO: Endpoint no disponible todavía
     */
    async cancelDraw(drawId: string, reason: string): Promise<void> {
        console.log('🚫 Cancelando sorteo:', drawId, 'Razón:', reason);
        console.log('⚠️ Funcionalidad de cancelar sorteo no disponible todavía');
        throw new Error('La función de cancelar sorteo no está disponible en este momento');
    },

    /**
     * Marcar ganador como notificado
     * TODO: Endpoint no disponible todavía
     */
    async markWinnerNotified(drawId: string, clubId: string): Promise<void> {
        console.log('📧 Marcando ganador como notificado:', { drawId, clubId });
        console.log('⚠️ Funcionalidad no disponible todavía');
        throw new Error('La función de notificar ganador no está disponible en este momento');
    },

    /**
     * Marcar premio como reclamado
     * TODO: Endpoint no disponible todavía
     */
    async markPrizeClaimed(drawId: string, clubId: string): Promise<void> {
        console.log('✅ Marcando premio como reclamado:', { drawId, clubId });
        console.log('⚠️ Funcionalidad no disponible todavía');
        throw new Error('La función de reclamar premio no está disponible en este momento');
    },

    /**
     * Obtener próximos sorteos programados
     * TODO: Endpoint no disponible todavía
     */
    async getUpcomingDraws(clubTypeId?: string): Promise<Draw[]> {
        console.log('📅 Obteniendo próximos sorteos...', clubTypeId);
        console.log('⚠️ Funcionalidad no disponible todavía');
        return [];
    },

    /**
     * Obtener reporte PDF de ganadores por fecha
     * Descarga el PDF y lo guarda localmente
     * @param lotteryDate - Fecha del sorteo en formato ISO
     * @returns Ruta local del archivo PDF descargado
     */
    async getWinnersReportPdf(lotteryDate: Date): Promise<string> {
        try {
            console.log('📄 Descargando reporte de ganadores...');

            // Formatear la fecha para el API
            const isoDate = lotteryDate.toISOString();
            console.log('📅 Fecha del sorteo:', isoDate);

            // Obtener token de autenticación
            const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
            if (!token) {
                throw new Error('No hay sesión activa. Por favor inicia sesión nuevamente.');
            }

            // Construir URL del endpoint
            const baseUrl = getBaseUrl();
            const apiKey = getApiKey();
            const url = `${baseUrl}${BASE}/GetReport1`;

            console.log('📤 URL del reporte:', url);

            // Hacer la petición con fetch para obtener el PDF como blob
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/pdf',
                    'Ocp-Apim-Subscription-Key': apiKey,
                },
                body: JSON.stringify({
                    LotteryDate: isoDate,
                }),
            });

            console.log('📥 Respuesta del servidor:', response.status);

            if (!response.ok) {
                throw new Error(`Error al descargar el reporte. Código: ${response.status}`);
            }

            // Obtener el blob del PDF
            const pdfBlob = await response.blob();
            console.log('📦 Tamaño del PDF:', pdfBlob.size, 'bytes');

            // Convertir blob a base64 usando FileReader (compatible con React Native)
            const base64Data = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (typeof reader.result === 'string') {
                        // Remover el prefijo "data:application/pdf;base64,"
                        const base64 = reader.result.split(',')[1];
                        resolve(base64);
                    } else {
                        reject(new Error('Error al convertir el PDF'));
                    }
                };
                reader.onerror = () => reject(new Error('Error al leer el PDF'));
                reader.readAsDataURL(pdfBlob);
            });

            console.log('📝 PDF convertido a base64, longitud:', base64Data.length);

            // Crear archivo en el directorio cache usando la nueva API de expo-file-system
            const timestamp = Date.now();
            const fileName = `ganadores_${lotteryDate.toISOString().split('T')[0]}_${timestamp}.pdf`;
            const file = new FileSystem.File(FileSystem.Paths.cache, fileName);

            // Escribir el archivo desde base64
            await file.write(base64Data, { encoding: 'base64' });

            console.log('✅ Reporte descargado exitosamente:', {
                uri: file.uri,
                size: pdfBlob.size,
            });

            return file.uri;
        } catch (error: any) {
            console.error('❌ Error descargando reporte:', error);
            throw new Error(error.message || 'Error al descargar el reporte de ganadores');
        }
    },

    /**
     * Obtener reporte PDF de ganadores con base64 para renderizar en WebView
     * @param lotteryDate - Fecha del sorteo
     * @returns Objeto con base64 del PDF y uri del archivo guardado
     */
    async getWinnersReportPdfWithBase64(lotteryDate: Date): Promise<{ base64: string; uri: string }> {
        try {
            console.log('📄 Descargando reporte de ganadores (con base64)...');

            const isoDate = lotteryDate.toISOString();
            console.log('📅 Fecha del sorteo:', isoDate);

            const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
            if (!token) {
                throw new Error('No hay sesión activa. Por favor inicia sesión nuevamente.');
            }

            const baseUrl = getBaseUrl();
            const apiKey = getApiKey();
            const url = `${baseUrl}${BASE}/GetReport1`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/pdf',
                    'Ocp-Apim-Subscription-Key': apiKey,
                },
                body: JSON.stringify({
                    LotteryDate: isoDate,
                }),
            });

            console.log('📥 Respuesta del servidor:', response.status);

            if (!response.ok) {
                throw new Error(`Error al descargar el reporte. Código: ${response.status}`);
            }

            const pdfBlob = await response.blob();
            console.log('📦 Tamaño del PDF:', pdfBlob.size, 'bytes');

            // Convertir blob a base64
            const base64Data = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (typeof reader.result === 'string') {
                        const base64 = reader.result.split(',')[1];
                        resolve(base64);
                    } else {
                        reject(new Error('Error al convertir el PDF'));
                    }
                };
                reader.onerror = () => reject(new Error('Error al leer el PDF'));
                reader.readAsDataURL(pdfBlob);
            });

            console.log('📝 PDF convertido a base64, longitud:', base64Data.length);

            // Guardar archivo para compartir
            const timestamp = Date.now();
            const fileName = `ganadores_${lotteryDate.toISOString().split('T')[0]}_${timestamp}.pdf`;
            const file = new FileSystem.File(FileSystem.Paths.cache, fileName);
            await file.write(base64Data, { encoding: 'base64' });

            console.log('✅ Reporte listo:', { uri: file.uri });

            return {
                base64: base64Data,
                uri: file.uri,
            };
        } catch (error: any) {
            console.error('❌ Error descargando reporte:', error);
            throw new Error(error.message || 'Error al descargar el reporte de ganadores');
        }
    },

    /**
     * Compartir el reporte PDF de ganadores
     * @param fileUri - Ruta local del archivo PDF
     */
    async shareWinnersReport(fileUri: string): Promise<void> {
        try {
            const isAvailable = await Sharing.isAvailableAsync();
            if (!isAvailable) {
                throw new Error('La función de compartir no está disponible en este dispositivo');
            }

            await Sharing.shareAsync(fileUri, {
                mimeType: 'application/pdf',
                dialogTitle: 'Compartir Reporte de Ganadores',
            });

            console.log('✅ Reporte compartido exitosamente');
        } catch (error: any) {
            console.error('❌ Error compartiendo reporte:', error);
            throw new Error(error.message || 'Error al compartir el reporte');
        }
    },
};
