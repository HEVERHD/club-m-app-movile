// src/components/exchange/ClubExchangeCard.tsx
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { ClubForExchange } from '../../api/exchange.api';


interface Props {
    club: ClubForExchange;
    isSelected: boolean;
    amountToUse: number;
    onToggle: () => void;
    onAmountChange: (amount: number) => void;
    disabled?: boolean;
}

export function ClubExchangeCard({
    club,
    isSelected,
    amountToUse,
    onToggle,
    onAmountChange,
    disabled = false,
}: Props) {
    const handleAmountChange = (text: string) => {
        const num = parseFloat(text.replace(/[^0-9.]/g, '')) || 0;
        onAmountChange(Math.min(num, club.balance));
    };

    return (
        <TouchableOpacity
            style={[
                styles.container,
                isSelected && styles.containerSelected,
                disabled && styles.containerDisabled,
            ]}
            onPress={onToggle}
            disabled={disabled}
            activeOpacity={0.7}
        >
            {/* Checkbox */}
            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                {isSelected && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
            </View>

            {/* Club Info */}
            <View style={styles.info}>
                <View style={styles.header}>
                    <Text style={styles.contractNumber}>Club #{club.contractNumber}</Text>
                    <View style={styles.typeBadge}>
                        <Text style={styles.typeText}>{club.clubTypeName}</Text>
                    </View>
                </View>

                <View style={styles.details}>
                    <View style={styles.detailItem}>
                        <Ionicons name="ticket-outline" size={14} color={COLORS.text.muted} />
                        <Text style={styles.detailText}>Acción: {club.share}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Ionicons name="cash-outline" size={14} color={COLORS.text.muted} />
                        <Text style={styles.detailText}>${club.denomination.toFixed(2)}/sem</Text>
                    </View>
                </View>

                {/* Balance */}
                <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>Disponible:</Text>
                    <Text style={styles.balanceValue}>${club.balance.toFixed(2)}</Text>
                </View>
            </View>

            {/* Amount Input (only when selected) */}
            {isSelected && (
                <View style={styles.amountSection}>
                    <Text style={styles.amountLabel}>Usar:</Text>
                    <View style={styles.amountInputContainer}>
                        <Text style={styles.currencySymbol}>$</Text>
                        <TextInput
                            style={styles.amountInput}
                            value={amountToUse.toFixed(2)}
                            onChangeText={handleAmountChange}
                            keyboardType="decimal-pad"
                            selectTextOnFocus
                        />
                    </View>
                    {/* Quick buttons */}
                    <View style={styles.quickButtons}>
                        <TouchableOpacity
                            style={styles.quickBtn}
                            onPress={() => onAmountChange(club.balance)}
                        >
                            <Text style={styles.quickBtnText}>Max</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: COLORS.bg.card,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1.5,
        borderColor: COLORS.border.default,
        alignItems: 'flex-start',
    },
    containerSelected: {
        borderColor: COLORS.accent.blue,
        backgroundColor: COLORS.accent.blue + '08',
    },
    containerDisabled: {
        opacity: 0.5,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: COLORS.border.strong,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    checkboxSelected: {
        backgroundColor: COLORS.accent.blue,
        borderColor: COLORS.accent.blue,
    },
    info: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    contractNumber: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.text.primary,
    },
    typeBadge: {
        marginLeft: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
        backgroundColor: COLORS.accent.purple + '20',
        borderRadius: 4,
    },
    typeText: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.accent.purple,
    },
    details: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        fontSize: 12,
        color: COLORS.text.secondary,
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    balanceLabel: {
        fontSize: 13,
        color: COLORS.text.muted,
    },
    balanceValue: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.status.success,
    },
    amountSection: {
        alignItems: 'flex-end',
        marginLeft: 12,
    },
    amountLabel: {
        fontSize: 11,
        color: COLORS.text.muted,
        marginBottom: 4,
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bg.primary,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.accent.blue,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    currencySymbol: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.accent.blue,
    },
    amountInput: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text.primary,
        minWidth: 60,
        textAlign: 'right',
        paddingVertical: 2,
    },
    quickButtons: {
        flexDirection: 'row',
        marginTop: 6,
        gap: 6,
    },
    quickBtn: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: COLORS.accent.blue + '20',
        borderRadius: 4,
    },
    quickBtnText: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.accent.blue,
    },
});