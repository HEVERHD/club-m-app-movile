// app/(tabs)/my-draws.tsx - Sorteos del cliente
import { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuthStore } from '../../src/stores/auth-store';
import { getClubsByCustomer } from '../../src/api/clubs.api';
import { drawsApi } from '../../src/api/draws.api';
import type { Club, Draw } from '../../src/types/clubs';

interface CustomerDraw extends Draw {
    customerClubs: Club[];
    isWinner: boolean;
}

export default function MyDrawsScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const user = useAuthStore((state) => state.user);

    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [draws, setDraws] = useState<CustomerDraw[]>([]);
    const [customerClubs, setCustomerClubs] = useState<Club[]>([]);
    const [filter, setFilter] = useState<'all' | 'participated' | 'winner'>('all');

    const loadData = useCallback(async () => {
        if (!user?.customerId) {
            setIsLoading(false);
            return;
        }

        try {
            // Cargar clubes del cliente y sorteos
            const [clubs, drawsResult] = await Promise.all([
                getClubsByCustomer(user.customerId),
                drawsApi.getDraws({ status: 'completed' }, 1, 50),
            ]);
            const allDraws = drawsResult.data;

            setCustomerClubs(clubs);

            // Determinar en qué sorteos participó
            const customerShares = clubs.map(c => c.share);
            const customerDraws: CustomerDraw[] = allDraws.map(draw => {
                // Verificar si algún club del cliente participó en este sorteo
                const participatingClubs = clubs.filter(club => {
                    // El cliente participa si tiene un club activo del mismo tipo
                    const sameType = club.clubTypeId === draw.clubTypeId;
                    return sameType;
                });

                // Verificar si ganó
                const isWinner = participatingClubs.some(club =>
                    club.share === draw.numberPlayed
                );

                return {
                    ...draw,
                    customerClubs: participatingClubs,
                    isWinner,
                };
            }).filter(d => d.customerClubs.length > 0);

            setDraws(customerDraws);
        } catch (error) {
            console.error('Error loading draws:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [user?.customerId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, [loadData]);

    const filteredDraws = draws.filter((draw) => {
        if (filter === 'all') return true;
        if (filter === 'winner') return draw.isWinner;
        return draw.customerClubs.length > 0;
    });

    const winCount = draws.filter(d => d.isWinner).length;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-PA', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const renderDrawCard = ({ item: draw }: { item: CustomerDraw }) => {
        const myShares = draw.customerClubs.map(c => c.share);

        return (
            <TouchableOpacity
                style={[
                    styles.drawCard,
                    { backgroundColor: colors.bg.card, borderColor: colors.border.default },
                    draw.isWinner && { borderColor: colors.accent.gold, borderWidth: 2 }
                ]}
                onPress={() => router.push(`/draw/${draw.drawId}`)}
                activeOpacity={0.7}
            >
                {/* Winner badge */}
                {draw.isWinner && (
                    <View style={[styles.winnerBadge, { backgroundColor: colors.accent.gold }]}>
                        <Ionicons name="trophy" size={14} color={colors.white} />
                        <Text style={[styles.winnerBadgeText, { color: colors.white }]}>
                            ¡GANASTE!
                        </Text>
                    </View>
                )}

                {/* Header */}
                <View style={styles.drawHeader}>
                    <View style={[styles.drawIcon, { backgroundColor: colors.brand.primary + '15' }]}>
                        <Ionicons name="calendar" size={24} color={colors.brand.primary} />
                    </View>
                    <View style={styles.drawInfo}>
                        <Text style={[styles.drawType, { color: colors.text.primary }]}>
                            {draw.clubTypeName || 'Sorteo'}
                        </Text>
                        <Text style={[styles.drawDate, { color: colors.text.secondary }]}>
                            {formatDate(draw.date)}
                        </Text>
                    </View>
                </View>

                {/* Número ganador */}
                <View style={[styles.winningSection, { backgroundColor: colors.bg.elevated }]}>
                    <Text style={[styles.winningLabel, { color: colors.text.muted }]}>
                        NÚMERO GANADOR
                    </Text>
                    <View style={[
                        styles.winningNumber,
                        {
                            backgroundColor: draw.isWinner ? colors.accent.gold : colors.brand.primary,
                        }
                    ]}>
                        <Text style={[styles.winningNumberText, { color: colors.white }]}>
                            {draw.numberPlayed}
                        </Text>
                    </View>
                </View>

                {/* Mis números */}
                <View style={styles.myNumbersSection}>
                    <Text style={[styles.myNumbersLabel, { color: colors.text.secondary }]}>
                        Mis números:
                    </Text>
                    <View style={styles.myNumbersRow}>
                        {myShares.map((share, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.myNumberBadge,
                                    {
                                        backgroundColor: share === draw.numberPlayed
                                            ? colors.accent.gold
                                            : colors.brand.primary + '20',
                                        borderColor: share === draw.numberPlayed
                                            ? colors.accent.gold
                                            : colors.brand.primary,
                                    }
                                ]}
                            >
                                <Text style={[
                                    styles.myNumberText,
                                    {
                                        color: share === draw.numberPlayed
                                            ? colors.white
                                            : colors.brand.primary
                                    }
                                ]}>
                                    {share}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Premio si ganó */}
                {draw.isWinner && draw.totalPrizeAmount && (
                    <View style={[styles.prizeSection, { backgroundColor: colors.accent.gold + '15' }]}>
                        <Ionicons name="gift" size={20} color={colors.accent.gold} />
                        <Text style={[styles.prizeText, { color: colors.accent.gold }]}>
                            Premio: ${draw.totalPrizeAmount.toFixed(2)}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderHeader = () => (
        <View style={styles.headerSection}>
            {/* Título */}
            <Text style={[styles.pageTitle, { color: colors.text.primary }]}>Mis Sorteos</Text>

            {/* Stats rápidos */}
            <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: colors.bg.card }]}>
                    <Ionicons name="ticket" size={24} color={colors.brand.primary} />
                    <Text style={[styles.statValue, { color: colors.text.primary }]}>
                        {draws.length}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.text.muted }]}>
                        Participaciones
                    </Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.bg.card }]}>
                    <Ionicons name="trophy" size={24} color={colors.accent.gold} />
                    <Text style={[styles.statValue, { color: colors.accent.gold }]}>
                        {winCount}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.text.muted }]}>
                        Victorias
                    </Text>
                </View>
            </View>

            {/* Filtros */}
            <View style={styles.filterRow}>
                {(['all', 'participated', 'winner'] as const).map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[
                            styles.filterBtn,
                            { backgroundColor: colors.bg.card, borderColor: colors.border.default },
                            filter === f && { backgroundColor: colors.brand.primary, borderColor: colors.brand.primary }
                        ]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[
                            styles.filterText,
                            { color: colors.text.secondary },
                            filter === f && { color: colors.white }
                        ]}>
                            {f === 'all' ? 'Todos' : f === 'participated' ? 'Participé' : 'Gané'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View style={[styles.emptyContainer, { backgroundColor: colors.bg.card }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.accent.gold + '15' }]}>
                <Ionicons name="trophy-outline" size={48} color={colors.accent.gold} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
                {filter === 'winner' ? 'Sin victorias aún' : 'Sin sorteos'}
            </Text>
            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                {filter === 'winner'
                    ? '¡Sigue participando para ganar!'
                    : 'No has participado en sorteos aún'
                }
            </Text>
        </View>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.primary }]} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.brand.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.primary }]} edges={['top']}>
            <FlatList
                data={filteredDraws}
                keyExtractor={(item) => item.drawId}
                renderItem={renderDrawCard}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.brand.primary}
                    />
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },

    // Header
    headerSection: {
        marginBottom: 20,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        gap: 4,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 12,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 10,
    },
    filterBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '500',
    },

    // Draw Card
    drawCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    winnerBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderBottomLeftRadius: 12,
    },
    winnerBadgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    drawHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    drawIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    drawInfo: {
        flex: 1,
    },
    drawType: {
        fontSize: 16,
        fontWeight: '700',
    },
    drawDate: {
        fontSize: 13,
        marginTop: 2,
    },

    // Winning Section
    winningSection: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    winningLabel: {
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 8,
    },
    winningNumber: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 20,
    },
    winningNumberText: {
        fontSize: 28,
        fontWeight: '900',
    },

    // My Numbers
    myNumbersSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    myNumbersLabel: {
        fontSize: 13,
    },
    myNumbersRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    myNumberBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
    },
    myNumberText: {
        fontSize: 14,
        fontWeight: '700',
    },

    // Prize
    prizeSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 12,
        padding: 12,
        borderRadius: 12,
    },
    prizeText: {
        fontSize: 16,
        fontWeight: '700',
    },

    // Empty
    emptyContainer: {
        padding: 40,
        borderRadius: 20,
        alignItems: 'center',
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
    },
});
