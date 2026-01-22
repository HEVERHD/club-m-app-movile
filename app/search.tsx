// app/search.tsx
import { useState, useCallback, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, FlatList, TouchableOpacity,
    StyleSheet, ActivityIndicator, Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../src/constants/colors';
import { clubApi } from '../src/api/clubs.api';
import type { Club } from '../src/types/clubs';

export default function SearchScreen() {
    // Obtener parámetros de la URL (desde QR Scanner)
    const params = useLocalSearchParams<{ query?: string; autoSearch?: string }>();

    const [query, setQuery] = useState(params.query || '');
    const [results, setResults] = useState<Club[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const inputRef = useRef<TextInput>(null);
    const hasAutoSearched = useRef(false);

    // Focus en el input al entrar o búsqueda automática desde QR
    useEffect(() => {
        if (params.query && params.autoSearch === 'true' && !hasAutoSearched.current) {
            hasAutoSearched.current = true;
            // Ejecutar búsqueda automática desde QR
            handleSearch(params.query);
        } else {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [params.query, params.autoSearch]);

    const handleSearch = useCallback(async (searchText: string) => {
        const trimmed = searchText.trim();
        if (!trimmed || trimmed.length < 2) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        setIsLoading(true);
        setHasSearched(true);
        Keyboard.dismiss();

        try {
            const response = await clubApi.getClubs({ search: trimmed }, 1, 50, true);
            setResults(response.data);

            // Guardar en búsquedas recientes
            if (response.data.length > 0) {
                setRecentSearches(prev => {
                    const updated = [trimmed, ...prev.filter(s => s !== trimmed)].slice(0, 5);
                    return updated;
                });
            }
        } catch (error) {
            console.error('Error buscando:', error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleClubPress = useCallback((club: Club) => {
        router.push(`/club/${club.clubId}`);
    }, []);

    const handleClear = useCallback(() => {
        setQuery('');
        setResults([]);
        setHasSearched(false);
        inputRef.current?.focus();
    }, []);

    const handleRecentSearch = useCallback((text: string) => {
        setQuery(text);
        handleSearch(text);
    }, [handleSearch]);

    const renderClubItem = useCallback(({ item }: { item: Club }) => (
        <TouchableOpacity
            style={styles.resultCard}
            onPress={() => handleClubPress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.resultLeft}>
                <View style={[
                    styles.statusDot,
                    { backgroundColor: item.active ? COLORS.status.success : COLORS.status.error }
                ]} />
                <View style={styles.resultInfo}>
                    <Text style={styles.contractNumber}>#{item.contractNumber}</Text>
                    <Text style={styles.customerName} numberOfLines={1}>
                        {item.customerName}
                    </Text>
                    <Text style={styles.customerDoc}>{item.customerNumber}</Text>
                </View>
            </View>
            <View style={styles.resultRight}>
                <View style={styles.shareBadge}>
                    <Text style={styles.shareText}>{item.share}</Text>
                </View>
                <Text style={styles.balanceText}>
                    ${Math.abs(item.balanceAmount).toFixed(2)}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.text.muted} />
            </View>
        </TouchableOpacity>
    ), [handleClubPress]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>

                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={COLORS.text.muted} />
                    <TextInput
                        ref={inputRef}
                        style={styles.searchInput}
                        placeholder="Buscar por contrato, nombre o cédula..."
                        placeholderTextColor={COLORS.text.muted}
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={() => handleSearch(query)}
                        returnKeyType="search"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={handleClear}>
                            <Ionicons name="close-circle" size={20} color={COLORS.text.muted} />
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.searchBtn}
                    onPress={() => handleSearch(query)}
                    disabled={query.trim().length < 2}
                >
                    <Text style={[
                        styles.searchBtnText,
                        query.trim().length < 2 && styles.searchBtnDisabled
                    ]}>
                        Buscar
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.accent.blue} />
                    <Text style={styles.loadingText}>Buscando clubes...</Text>
                </View>
            ) : hasSearched ? (
                results.length > 0 ? (
                    <FlatList
                        data={results}
                        keyExtractor={(item) => item.clubId}
                        renderItem={renderClubItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={
                            <Text style={styles.resultsCount}>
                                {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
                            </Text>
                        }
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIcon}>
                            <Ionicons name="search-outline" size={48} color={COLORS.text.muted} />
                        </View>
                        <Text style={styles.emptyTitle}>Sin resultados</Text>
                        <Text style={styles.emptySubtitle}>
                            No se encontraron clubes para "{query}"
                        </Text>
                    </View>
                )
            ) : (
                <View style={styles.initialContainer}>
                    {/* Búsquedas recientes */}
                    {recentSearches.length > 0 && (
                        <View style={styles.recentSection}>
                            <Text style={styles.recentTitle}>Búsquedas recientes</Text>
                            {recentSearches.map((search, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.recentItem}
                                    onPress={() => handleRecentSearch(search)}
                                >
                                    <Ionicons name="time-outline" size={18} color={COLORS.text.muted} />
                                    <Text style={styles.recentText}>{search}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Tips de búsqueda */}
                    <View style={styles.tipsSection}>
                        <Text style={styles.tipsTitle}>Consejos de búsqueda</Text>
                        <View style={styles.tipItem}>
                            <Ionicons name="document-text-outline" size={18} color={COLORS.accent.blue} />
                            <Text style={styles.tipText}>Número de contrato: 5896</Text>
                        </View>
                        <View style={styles.tipItem}>
                            <Ionicons name="person-outline" size={18} color={COLORS.accent.green} />
                            <Text style={styles.tipText}>Nombre: Juan Pérez</Text>
                        </View>
                        <View style={styles.tipItem}>
                            <Ionicons name="card-outline" size={18} color={COLORS.accent.orange} />
                            <Text style={styles.tipText}>Cédula: 8-888-8888</Text>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg.primary },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 56,
        paddingBottom: 16,
        backgroundColor: COLORS.bg.card,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.default,
        gap: 12,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center'
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bg.elevated,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: COLORS.text.primary,
    },
    searchBtn: {
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    searchBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.accent.blue,
    },
    searchBtnDisabled: {
        color: COLORS.text.muted,
    },

    // Loading
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: COLORS.text.secondary
    },

    // Results
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    resultsCount: {
        fontSize: 13,
        color: COLORS.text.muted,
        marginBottom: 12,
    },
    resultCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.bg.card,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: COLORS.border.default,
    },
    resultLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 12,
    },
    resultInfo: {
        flex: 1,
    },
    contractNumber: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text.primary,
    },
    customerName: {
        fontSize: 14,
        color: COLORS.text.secondary,
        marginTop: 2,
    },
    customerDoc: {
        fontSize: 12,
        color: COLORS.text.muted,
        marginTop: 2,
    },
    resultRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    shareBadge: {
        backgroundColor: COLORS.accent.blue + '20',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    shareText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.accent.blue,
    },
    balanceText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.status.success,
    },

    // Empty
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: COLORS.bg.card,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.text.muted,
        textAlign: 'center',
    },

    // Initial State
    initialContainer: {
        flex: 1,
        padding: 20,
    },
    recentSection: {
        marginBottom: 32,
    },
    recentTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.text.muted,
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.default,
    },
    recentText: {
        fontSize: 15,
        color: COLORS.text.primary,
    },
    tipsSection: {
        backgroundColor: COLORS.bg.card,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border.default,
    },
    tipsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: 16,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    tipText: {
        fontSize: 14,
        color: COLORS.text.secondary,
    },
});