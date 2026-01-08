// src/components/clubs/CustomerSearchSelect.tsx
import { useState, useCallback, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, FlatList,
    ActivityIndicator, StyleSheet, Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import { searchCustomers, CustomerSearchResult } from '../../services/customerSearch';
import { COLORS } from '../../constants/colors';

interface Props {
    value: string;
    onChange: (customerId: string, customer: CustomerSearchResult | null) => void;
    error?: string;
    selectedCustomer: CustomerSearchResult | null;
}

export function CustomerSearchSelect({ value, onChange, error, selectedCustomer }: Props) {
    const [inputText, setInputText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showResults, setShowResults] = useState(false);
    const inputRef = useRef<TextInput>(null);

    // Query para buscar clientes (usa apiClient con Bearer token)
    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['customerSearch', searchTerm],
        queryFn: () => searchCustomers({
            searchText: searchTerm, // Parámetro correcto para la API
            page: 1,
            pageSize: 10,
        }),
        enabled: searchTerm.length >= 2,
        staleTime: 30000,
    });

    // Debounce search - se crea una sola vez
    const debouncedSetSearch = useCallback(
        debounce((text: string) => {
            setSearchTerm(text);
        }, 400),
        []
    );

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            debouncedSetSearch.cancel();
        };
    }, [debouncedSetSearch]);

    const handleInputChange = (text: string) => {
        setInputText(text);
        debouncedSetSearch(text);
        setShowResults(text.length >= 2);
    };

    const handleSelectCustomer = (customer: CustomerSearchResult) => {
        onChange(customer.CustomerId, customer);
        setShowResults(false);
        setInputText('');
        setSearchTerm('');
        Keyboard.dismiss();
    };

    const handleClear = () => {
        onChange('', null);
        setInputText('');
        setSearchTerm('');
        setShowResults(false);
    };

    // Si hay cliente seleccionado, mostrar su info
    if (selectedCustomer) {
        return (
            <View style={[styles.selectedContainer, error && styles.containerError]}>
                <View style={styles.selectedInfo}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={20} color={COLORS.white} />
                    </View>
                    <View style={styles.customerDetails}>
                        <Text style={styles.customerName} numberOfLines={1}>
                            {selectedCustomer.FullName}
                        </Text>
                        <Text style={styles.customerMeta} numberOfLines={1}>
                            {selectedCustomer.Email || selectedCustomer.PhoneNumber}
                            {selectedCustomer.NumberId ? `  •  ${selectedCustomer.NumberId}` : ''}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity onPress={handleClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="close-circle" size={24} color={COLORS.text.muted} />
                </TouchableOpacity>
            </View>
        );
    }

    const customers = data?.Data || [];
    const showLoader = isLoading || isFetching;

    return (
        <View style={styles.container}>
            {/* Input de búsqueda */}
            <View style={[styles.inputContainer, error && styles.inputError, showResults && styles.inputActive]}>
                <Ionicons name="search" size={20} color={COLORS.text.muted} />
                <TextInput
                    ref={inputRef}
                    style={styles.input}
                    value={inputText}
                    placeholder="Buscar por nombre, email o cédula..."
                    placeholderTextColor={COLORS.text.muted}
                    onChangeText={handleInputChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                {showLoader && <ActivityIndicator size="small" color={COLORS.accent.blue} />}
            </View>

            {/* Dropdown de resultados */}
            {showResults && (
                <View style={styles.resultsContainer}>
                    {customers.length > 0 ? (
                        <FlatList
                            data={customers}
                            keyExtractor={(item) => item.CustomerId}
                            keyboardShouldPersistTaps="handled"
                            style={styles.resultsList}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.resultItem}
                                    onPress={() => handleSelectCustomer(item)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.resultAvatar}>
                                        <Ionicons name="person" size={16} color={COLORS.accent.blue} />
                                    </View>
                                    <View style={styles.resultInfo}>
                                        <Text style={styles.resultName} numberOfLines={1}>
                                            {item.FullName}
                                        </Text>
                                        <Text style={styles.resultMeta} numberOfLines={1}>
                                            {item.Email}
                                            {item.NumberId ? `  •  ${item.NumberId}` : ''}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    ) : searchTerm.length >= 2 && !showLoader ? (
                        <View style={styles.noResults}>
                            <Ionicons name="search-outline" size={24} color={COLORS.text.muted} />
                            <Text style={styles.noResultsText}>No se encontraron clientes</Text>
                        </View>
                    ) : searchTerm.length >= 2 && showLoader ? (
                        <View style={styles.noResults}>
                            <ActivityIndicator size="small" color={COLORS.accent.blue} />
                            <Text style={styles.noResultsText}>Buscando...</Text>
                        </View>
                    ) : null}
                </View>
            )}

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { position: 'relative', zIndex: 100 },

    // Input
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bg.card,
        borderRadius: 12,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: COLORS.border.default,
        gap: 10,
    },
    inputActive: {
        borderColor: COLORS.accent.blue,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    inputError: { borderColor: COLORS.status.error },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 15,
        color: COLORS.text.primary,
    },

    // Selected customer
    selectedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.bg.card,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.accent.blue,
    },
    containerError: { borderColor: COLORS.status.error },
    selectedInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.accent.blue,
        justifyContent: 'center',
        alignItems: 'center',
    },
    customerDetails: { marginLeft: 12, flex: 1 },
    customerName: { fontSize: 15, fontWeight: '600', color: COLORS.text.primary },
    customerMeta: { fontSize: 13, color: COLORS.text.muted, marginTop: 2 },

    // Results dropdown
    resultsContainer: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: COLORS.bg.card,
        borderWidth: 1,
        borderTopWidth: 0,
        borderColor: COLORS.accent.blue,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        maxHeight: 250,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    resultsList: { maxHeight: 230 },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.default,
    },
    resultAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.accent.blue + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultInfo: { marginLeft: 12, flex: 1 },
    resultName: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary },
    resultMeta: { fontSize: 12, color: COLORS.text.muted, marginTop: 2 },

    // No results / Loading
    noResults: {
        padding: 24,
        alignItems: 'center',
        gap: 8,
    },
    noResultsText: { fontSize: 14, color: COLORS.text.muted },

    // Error
    errorText: { fontSize: 12, color: COLORS.status.error, marginTop: 6 },
});