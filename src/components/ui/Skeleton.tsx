// src/components/ui/Skeleton.tsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface SkeletonProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
}

export function Skeleton({
    width = '100%',
    height = 20,
    borderRadius = 8,
    style
}: SkeletonProps) {
    const { colors } = useTheme();
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, [shimmerAnim]);

    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    borderRadius,
                    opacity,
                    backgroundColor: colors.bg.elevated,
                },
                style,
            ]}
        />
    );
}

// Skeleton para texto (línea)
export function SkeletonText({
    width = '100%',
    height = 14,
    style
}: SkeletonProps) {
    return <Skeleton width={width} height={height} borderRadius={4} style={style} />;
}

// Skeleton circular (avatar, iconos)
export function SkeletonCircle({
    size = 40,
    style
}: { size?: number; style?: ViewStyle }) {
    return <Skeleton width={size} height={size} borderRadius={size / 2} style={style} />;
}

// Skeleton para cards de Club
export function ClubCardSkeleton() {
    const { colors } = useTheme();
    return (
        <View style={[styles.clubCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
            {/* Header */}
            <View style={styles.clubHeader}>
                <View style={styles.clubHeaderLeft}>
                    <SkeletonText width={120} height={16} />
                    <SkeletonText width={80} height={12} style={{ marginTop: 6 }} />
                </View>
                <Skeleton width={60} height={28} borderRadius={14} />
            </View>

            {/* Info */}
            <View style={styles.clubInfo}>
                <SkeletonText width={150} height={14} />
                <SkeletonText width={100} height={12} style={{ marginTop: 4 }} />
            </View>

            {/* Progress */}
            <Skeleton width="100%" height={6} borderRadius={3} style={{ marginTop: 12 }} />

            {/* Footer */}
            <View style={styles.clubFooter}>
                <View>
                    <SkeletonText width={60} height={10} />
                    <SkeletonText width={80} height={18} style={{ marginTop: 4 }} />
                </View>
                <Skeleton width={90} height={32} borderRadius={8} />
            </View>
        </View>
    );
}

// Skeleton para cards de Customer
export function CustomerCardSkeleton() {
    const { colors } = useTheme();
    return (
        <View style={[styles.customerCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
            <View style={styles.customerMain}>
                {/* Avatar */}
                <SkeletonCircle size={48} />

                {/* Info */}
                <View style={styles.customerInfo}>
                    <SkeletonText width={160} height={16} />
                    <SkeletonText width={100} height={12} style={{ marginTop: 6 }} />
                    <SkeletonText width={120} height={12} style={{ marginTop: 4 }} />
                </View>

                {/* Status badge */}
                <Skeleton width={70} height={24} borderRadius={12} />
            </View>
        </View>
    );
}

// Skeleton para el detalle de cliente
export function CustomerDetailSkeleton() {
    const { colors } = useTheme();
    return (
        <View style={styles.detailContainer}>
            {/* Profile Card */}
            <View style={[styles.profileCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                <SkeletonText width={200} height={24} />
                <Skeleton width={80} height={28} borderRadius={14} style={{ marginTop: 12 }} />

                <View style={styles.detailRow}>
                    <SkeletonCircle size={20} />
                    <SkeletonText width={120} height={14} style={{ marginLeft: 8 }} />
                </View>
                <View style={styles.detailRow}>
                    <SkeletonCircle size={20} />
                    <SkeletonText width={100} height={14} style={{ marginLeft: 8 }} />
                </View>
                <View style={styles.detailRow}>
                    <SkeletonCircle size={20} />
                    <SkeletonText width={140} height={14} style={{ marginLeft: 8 }} />
                </View>
            </View>

            {/* Stats Card */}
            <View style={[styles.statsCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                <SkeletonText width={100} height={18} style={{ marginBottom: 16 }} />
                <View style={styles.statsGrid}>
                    <View style={[styles.statItem, { backgroundColor: colors.bg.elevated }]}>
                        <SkeletonCircle size={44} />
                        <SkeletonText width={30} height={20} style={{ marginTop: 8 }} />
                        <SkeletonText width={60} height={12} style={{ marginTop: 4 }} />
                    </View>
                    <View style={[styles.statItem, { backgroundColor: colors.bg.elevated }]}>
                        <SkeletonCircle size={44} />
                        <SkeletonText width={30} height={20} style={{ marginTop: 8 }} />
                        <SkeletonText width={60} height={12} style={{ marginTop: 4 }} />
                    </View>
                    <View style={[styles.statItem, { backgroundColor: colors.bg.elevated }]}>
                        <SkeletonCircle size={44} />
                        <SkeletonText width={50} height={20} style={{ marginTop: 8 }} />
                        <SkeletonText width={70} height={12} style={{ marginTop: 4 }} />
                    </View>
                    <View style={[styles.statItem, { backgroundColor: colors.bg.elevated }]}>
                        <SkeletonCircle size={44} />
                        <SkeletonText width={50} height={20} style={{ marginTop: 8 }} />
                        <SkeletonText width={70} height={12} style={{ marginTop: 4 }} />
                    </View>
                </View>
            </View>
        </View>
    );
}

// Lista de skeletons
export function SkeletonList({
    count = 5,
    type = 'club'
}: { count?: number; type?: 'club' | 'customer' }) {
    const SkeletonComponent = type === 'club' ? ClubCardSkeleton : CustomerCardSkeleton;

    return (
        <View style={styles.list}>
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonComponent key={index} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    // Club Card
    clubCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    clubHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    clubHeaderLeft: {},
    clubInfo: {
        marginBottom: 8,
    },
    clubFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },

    // Customer Card
    customerCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    customerMain: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    customerInfo: {
        flex: 1,
        marginLeft: 12,
    },

    // Detail
    detailContainer: {
        padding: 20,
    },
    profileCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    statsCard: {
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statItem: {
        width: '48%',
        alignItems: 'center',
        padding: 12,
        marginBottom: 12,
        borderRadius: 12,
    },

    // List
    list: {
        paddingHorizontal: 20,
    },
});
