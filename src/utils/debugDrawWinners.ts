// src/utils/debugDrawWinners.ts
// Script de ayuda para ver clubes y sus números de acción (Share)

import { clubApi } from '../api/clubs.api';

/**
 * Lista todos los clubes con sus números de acción (Share)
 * Útil para saber qué números usar en los sorteos para probar ganadores
 */
export async function listClubsWithShares() {
    try {
        console.log('📋 Obteniendo lista de clubes con sus números de acción...\n');

        const result = await clubApi.getClubs({}, 1, 100);

        if (result.data.length === 0) {
            console.log('⚠️ No hay clubes registrados en el sistema');
            return;
        }

        console.log(`✅ Total de clubes: ${result.total}\n`);
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('│ Share │ Contrato       │ Cliente                          │');
        console.log('═══════════════════════════════════════════════════════════════');

        // Agrupar clubes por número de acción
        const shareGroups = new Map<number, any[]>();

        result.data.forEach(club => {
            const share = club.share ?? -1;
            if (!shareGroups.has(share)) {
                shareGroups.set(share, []);
            }
            shareGroups.get(share)!.push(club);
        });

        // Ordenar por share
        const sortedShares = Array.from(shareGroups.keys()).sort((a, b) => a - b);

        sortedShares.forEach(share => {
            const clubs = shareGroups.get(share)!;
            clubs.forEach((club, index) => {
                const shareDisplay = share === -1 ? 'N/A' : share.toString().padStart(2, '0');
                const contract = (club.contractNumber || 'Sin contrato').substring(0, 14).padEnd(14);
                const customer = (club.customerName || 'Sin nombre').substring(0, 32).padEnd(32);

                console.log(`│  ${shareDisplay}   │ ${contract} │ ${customer} │`);
            });
        });

        console.log('═══════════════════════════════════════════════════════════════\n');

        // Resumen
        console.log('📊 RESUMEN DE NÚMEROS DE ACCIÓN:');
        console.log('─────────────────────────────────');

        const sharesWithClubs = sortedShares.filter(s => s !== -1);
        if (sharesWithClubs.length > 0) {
            console.log(`\n✅ Números con clubes asignados: ${sharesWithClubs.join(', ')}`);
            console.log(`\n💡 Para probar un ganador, ejecuta un sorteo con uno de estos números.`);
            console.log(`   Por ejemplo: Si hay clubes con Share 25, ejecuta sorteo con número 25.\n`);
        } else {
            console.log('\n⚠️ No hay clubes con números de acción asignados todavía.\n');
        }

    } catch (error: any) {
        console.error('❌ Error al obtener clubes:', error.message);
    }
}

/**
 * Busca clubes que tienen un número de acción específico
 */
export async function findClubsByShare(shareNumber: number) {
    try {
        console.log(`\n🔍 Buscando clubes con Share = ${shareNumber}...\n`);

        const result = await clubApi.getClubs({}, 1, 100);

        const clubsWithShare = result.data.filter(club => club.share === shareNumber);

        if (clubsWithShare.length === 0) {
            console.log(`⚠️ No hay clubes con el número de acción ${shareNumber}`);
            console.log(`💡 Ejecuta listClubsWithShares() para ver qué números están disponibles.\n`);
            return;
        }

        console.log(`✅ Encontrados ${clubsWithShare.length} club(es) con Share ${shareNumber}:\n`);

        clubsWithShare.forEach((club, index) => {
            console.log(`${index + 1}. Club ID: ${club.clubId}`);
            console.log(`   Contrato: ${club.contractNumber || 'N/A'}`);
            console.log(`   Cliente: ${club.customerName || 'N/A'}`);
            console.log(`   Tipo: ${club.clubTypeName || 'N/A'}`);
            console.log(`   Share: ${club.share}`);
            console.log(`   Denominación: $${club.denominationValue || 0}\n`);
        });

        console.log(`💡 Si ejecutas un sorteo con el número ${shareNumber}, ${clubsWithShare.length === 1 ? 'este club será' : 'estos clubes serán'} ${clubsWithShare.length === 1 ? 'el ganador' : 'los ganadores'}.\n`);

    } catch (error: any) {
        console.error('❌ Error al buscar clubes:', error.message);
    }
}

// Exportar para usar en consola del navegador o en código
if (typeof window !== 'undefined') {
    (window as any).debugDraws = {
        listClubsWithShares,
        findClubsByShare,
    };
    console.log('💡 Funciones de debug disponibles:');
    console.log('   - debugDraws.listClubsWithShares() - Lista todos los clubes con sus números');
    console.log('   - debugDraws.findClubsByShare(número) - Busca clubes por número específico');
}
