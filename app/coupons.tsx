// app/coupons.tsx
import { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../src/contexts/ThemeContext';
import { useCouponsStore, useCouponsFiltered } from '../src/stores/coupons-store';
import { getCoupons, redeemCoupon } from '../src/api/coupons.api';
import { CouponCard } from '../src/components/coupons/CouponCard';
import { CustomAlert } from '../src/components/ui/CustomAlert';
import type { Coupon } from '../src/types/coupons';
import {
    getCouponIcon,
    getCouponColor,
    formatCouponValue,
    getDaysUntilExpiry,
} from '../src/types/coupons';

type FilterTab = 'available' | 'used' | 'expired';

export default function CouponsScreen() {
    const { colors } = useTheme();
    const [activeTab, setActiveTab] = useState<FilterTab>('available');
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [alert, setAlert] = useState<{
        visible: boolean;
        type: 'success' | 'error' | 'info';
        title: string;
        message: string;
    }>({ visible: false, type: 'info', title: '', message: '' });

    const { setCoupons, redeemCoupon: storeRedeemCoupon, isLoading, setLoading } = useCouponsStore();
    const { available, used, expired, availableCount } = useCouponsFiltered();

    const loadCoupons = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getCoupons();
            setCoupons(response.coupons);
        } catch (error) {
            console.error('Error loading coupons:', error);
        } finally {
            setLoading(false);
        }
    }, [setCoupons, setLoading]);

    useEffect(() => {
        loadCoupons();
    }, [loadCoupons]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadCoupons();
        setRefreshing(false);
    };

    const handleCouponPress = (coupon: Coupon) => {
        setSelectedCoupon(coupon);
    };

    const handleRedeemCoupon = async () => {
        if (!selectedCoupon) return;

        setIsRedeeming(true);
        try {
            const response = await redeemCoupon(selectedCoupon.id);

            if (response.success) {
                storeRedeemCoupon(selectedCoupon.id);
                setSelectedCoupon(null);
                setAlert({
                    visible: true,
                    type: 'success',
                    title: '¡Cupón Canjeado!',
                    message: `Tu cupón "${selectedCoupon.title}" ha sido canjeado exitosamente. Presenta el código al momento de tu compra.`,
                });
            } else {
                setAlert({
                    visible: true,
                    type: 'error',
                    title: 'Error',
                    message: response.message,
                });
            }
        } catch (error) {
            setAlert({
                visible: true,
                type: 'error',
                title: 'Error',
                message: 'No se pudo canjear el cupón. Intenta de nuevo.',
            });
        } finally {
            setIsRedeeming(false);
        }
    };

    const getFilteredCoupons = () => {
        switch (activeTab) {
            case 'available':
                return available;
            case 'used':
                return used;
            case 'expired':
                return expired;
            default:
                return available;
        }
    };

    const filteredCoupons = getFilteredCoupons();

    const tabs: { key: FilterTab; label: string; count: number }[] = [
        { key: 'available', label: 'Disponibles', count: available.length },
        { key: 'used', label: 'Usados', count: used.length },
        { key: 'expired', label: 'Expirados', count: expired.length },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.primary }]} edges={['top']}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <View style={styles.headerTitle}>
                    <Text style={[styles.title, { color: colors.text.primary }]}>Mis Cupones</Text>
                    {availableCount > 0 && (
                        <View style={[styles.badge, { backgroundColor: colors.brand.primary }]}>
                            <Text style={styles.badgeText}>{availableCount}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.placeholder} />
            </View>

            {/* Tabs */}
            <View style={[styles.tabsContainer, { backgroundColor: colors.bg.elevated }]}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[
                            styles.tab,
                            activeTab === tab.key && {
                                backgroundColor: colors.bg.card,
                                borderColor: colors.border.default,
                            },
                        ]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                { color: activeTab === tab.key ? colors.text.primary : colors.text.muted },
                            ]}
                        >
                            {tab.label}
                        </Text>
                        {tab.count > 0 && (
                            <View
                                style={[
                                    styles.tabBadge,
                                    {
                                        backgroundColor:
                                            activeTab === tab.key
                                                ? colors.brand.primary
                                                : colors.bg.primary,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.tabBadgeText,
                                        {
                                            color:
                                                activeTab === tab.key
                                                    ? '#ffffff'
                                                    : colors.text.muted,
                                        },
                                    ]}
                                >
                                    {tab.count}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.brand.primary}
                    />
                }
            >
                {isLoading && filteredCoupons.length === 0 ? (
                    <View style={styles.loadingState}>
                        <ActivityIndicator size="large" color={colors.brand.primary} />
                        <Text style={[styles.loadingText, { color: colors.text.muted }]}>
                            Cargando cupones...
                        </Text>
                    </View>
                ) : filteredCoupons.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIcon, { backgroundColor: colors.bg.elevated }]}>
                            <Ionicons
                                name={
                                    activeTab === 'available'
                                        ? 'ticket-outline'
                                        : activeTab === 'used'
                                            ? 'checkmark-done-outline'
                                            : 'time-outline'
                                }
                                size={48}
                                color={colors.text.muted}
                            />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
                            {activeTab === 'available'
                                ? 'Sin cupones disponibles'
                                : activeTab === 'used'
                                    ? 'Sin cupones usados'
                                    : 'Sin cupones expirados'}
                        </Text>
                        <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                            {activeTab === 'available'
                                ? 'Cuando recibas cupones aparecerán aquí'
                                : activeTab === 'used'
                                    ? 'Los cupones que uses aparecerán aquí'
                                    : 'Los cupones expirados aparecerán aquí'}
                        </Text>
                    </View>
                ) : (
                    <>
                        {filteredCoupons.map((coupon) => (
                            <CouponCard
                                key={coupon.id}
                                coupon={coupon}
                                onPress={() => handleCouponPress(coupon)}
                            />
                        ))}
                    </>
                )}
            </ScrollView>

            {/* Coupon Detail Modal */}
            <Modal
                visible={selectedCoupon !== null}
                animationType="slide"
                transparent
                onRequestClose={() => setSelectedCoupon(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.bg.card }]}>
                        {selectedCoupon && (
                            <>
                                {/* Modal Header */}
                                <View style={styles.modalHeader}>
                                    <View
                                        style={[
                                            styles.modalIcon,
                                            { backgroundColor: getCouponColor(selectedCoupon.type) + '15' },
                                        ]}
                                    >
                                        <Ionicons
                                            name={getCouponIcon(selectedCoupon.type) as any}
                                            size={36}
                                            color={getCouponColor(selectedCoupon.type)}
                                        />
                                    </View>
                                    <TouchableOpacity
                                        style={styles.modalCloseBtn}
                                        onPress={() => setSelectedCoupon(null)}
                                    >
                                        <Ionicons name="close" size={24} color={colors.text.muted} />
                                    </TouchableOpacity>
                                </View>

                                {/* Value & Title */}
                                <Text
                                    style={[
                                        styles.modalValue,
                                        { color: getCouponColor(selectedCoupon.type) },
                                    ]}
                                >
                                    {formatCouponValue(selectedCoupon)}
                                </Text>
                                <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                                    {selectedCoupon.title}
                                </Text>
                                <Text style={[styles.modalDescription, { color: colors.text.secondary }]}>
                                    {selectedCoupon.description}
                                </Text>

                                {/* Code */}
                                <View style={[styles.modalCodeBox, { backgroundColor: colors.bg.elevated }]}>
                                    <Text style={[styles.modalCodeLabel, { color: colors.text.muted }]}>
                                        Código del cupón
                                    </Text>
                                    <Text style={[styles.modalCode, { color: colors.text.primary }]}>
                                        {selectedCoupon.code}
                                    </Text>
                                </View>

                                {/* Details */}
                                <View style={styles.modalDetails}>
                                    {selectedCoupon.minPurchase && (
                                        <View style={styles.modalDetailRow}>
                                            <Ionicons
                                                name="cart-outline"
                                                size={18}
                                                color={colors.text.muted}
                                            />
                                            <Text style={[styles.modalDetailText, { color: colors.text.secondary }]}>
                                                Compra mínima: ${selectedCoupon.minPurchase.toFixed(2)}
                                            </Text>
                                        </View>
                                    )}
                                    {selectedCoupon.maxDiscount && (
                                        <View style={styles.modalDetailRow}>
                                            <Ionicons
                                                name="trending-down-outline"
                                                size={18}
                                                color={colors.text.muted}
                                            />
                                            <Text style={[styles.modalDetailText, { color: colors.text.secondary }]}>
                                                Descuento máximo: ${selectedCoupon.maxDiscount.toFixed(2)}
                                            </Text>
                                        </View>
                                    )}
                                    <View style={styles.modalDetailRow}>
                                        <Ionicons name="calendar-outline" size={18} color={colors.text.muted} />
                                        <Text style={[styles.modalDetailText, { color: colors.text.secondary }]}>
                                            Vence: {new Date(selectedCoupon.expiresAt).toLocaleDateString('es', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                            {selectedCoupon.status === 'available' &&
                                                ` (${getDaysUntilExpiry(selectedCoupon.expiresAt)} días)`}
                                        </Text>
                                    </View>
                                    {selectedCoupon.clubName && (
                                        <View style={styles.modalDetailRow}>
                                            <Ionicons
                                                name="storefront-outline"
                                                size={18}
                                                color={colors.text.muted}
                                            />
                                            <Text style={[styles.modalDetailText, { color: colors.text.secondary }]}>
                                                Válido solo en: {selectedCoupon.clubName}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Terms */}
                                {selectedCoupon.terms && (
                                    <View style={[styles.modalTerms, { backgroundColor: colors.bg.elevated }]}>
                                        <Text style={[styles.modalTermsLabel, { color: colors.text.muted }]}>
                                            Términos y condiciones
                                        </Text>
                                        <Text style={[styles.modalTermsText, { color: colors.text.secondary }]}>
                                            {selectedCoupon.terms}
                                        </Text>
                                    </View>
                                )}

                                {/* Actions */}
                                <View style={styles.modalActions}>
                                    <TouchableOpacity
                                        style={[styles.cancelBtn, { borderColor: colors.border.default }]}
                                        onPress={() => setSelectedCoupon(null)}
                                    >
                                        <Text style={[styles.cancelBtnText, { color: colors.text.secondary }]}>
                                            Cerrar
                                        </Text>
                                    </TouchableOpacity>

                                    {selectedCoupon.status === 'available' && (
                                        <TouchableOpacity
                                            style={[
                                                styles.redeemBtn,
                                                { backgroundColor: getCouponColor(selectedCoupon.type) },
                                            ]}
                                            onPress={handleRedeemCoupon}
                                            disabled={isRedeeming}
                                        >
                                            {isRedeeming ? (
                                                <ActivityIndicator size="small" color="#ffffff" />
                                            ) : (
                                                <>
                                                    <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                                                    <Text style={styles.redeemBtnText}>Canjear Cupón</Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Alert */}
            <CustomAlert
                visible={alert.visible}
                type={alert.type}
                title={alert.title}
                message={alert.message}
                onDismiss={() => setAlert((prev) => ({ ...prev, visible: false }))}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    badge: {
        minWidth: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '700',
    },
    placeholder: {
        width: 40,
    },

    // Tabs
    tabsContainer: {
        flexDirection: 'row',
        padding: 4,
        margin: 16,
        marginBottom: 0,
        borderRadius: 12,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
    },
    tabBadge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 5,
    },
    tabBadgeText: {
        fontSize: 11,
        fontWeight: '600',
    },

    // Content
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 100,
    },

    // Loading
    loadingState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 80,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
    },

    // Empty
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        maxWidth: 250,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    modalIcon: {
        width: 64,
        height: 64,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCloseBtn: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalValue: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 4,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    modalDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 20,
    },
    modalCodeBox: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    modalCodeLabel: {
        fontSize: 12,
        marginBottom: 8,
    },
    modalCode: {
        fontSize: 24,
        fontWeight: '700',
        fontFamily: 'monospace',
        letterSpacing: 2,
    },
    modalDetails: {
        gap: 12,
        marginBottom: 20,
    },
    modalDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    modalDetailText: {
        fontSize: 14,
        flex: 1,
    },
    modalTerms: {
        padding: 14,
        borderRadius: 10,
        marginBottom: 20,
    },
    modalTermsLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 6,
    },
    modalTermsText: {
        fontSize: 12,
        lineHeight: 18,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    cancelBtnText: {
        fontSize: 15,
        fontWeight: '600',
    },
    redeemBtn: {
        flex: 2,
        flexDirection: 'row',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    redeemBtnText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '600',
    },
});
