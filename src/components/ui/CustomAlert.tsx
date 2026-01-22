// src/components/ui/CustomAlert.tsx
import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export interface AlertButton {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
    visible: boolean;
    type?: AlertType;
    title: string;
    message?: string;
    buttons?: AlertButton[];
    onDismiss?: () => void;
}

const { width } = Dimensions.get('window');

export function CustomAlert({
    visible,
    type = 'info',
    title,
    message,
    buttons = [{ text: 'OK', style: 'default' }],
    onDismiss,
}: CustomAlertProps) {
    const { colors } = useTheme();

    const getIconConfig = () => {
        switch (type) {
            case 'success':
                return {
                    name: 'checkmark-circle' as const,
                    color: colors.status.success,
                    bgColor: `${colors.status.success}15`,
                };
            case 'error':
                return {
                    name: 'close-circle' as const,
                    color: colors.status.error,
                    bgColor: `${colors.status.error}15`,
                };
            case 'warning':
                return {
                    name: 'warning' as const,
                    color: colors.status.warning,
                    bgColor: `${colors.status.warning}15`,
                };
            case 'confirm':
                return {
                    name: 'help-circle' as const,
                    color: colors.brand.primary,
                    bgColor: `${colors.brand.primary}15`,
                };
            default:
                return {
                    name: 'information-circle' as const,
                    color: colors.status.info,
                    bgColor: `${colors.status.info}15`,
                };
        }
    };

    const getButtonStyle = (buttonStyle?: 'default' | 'cancel' | 'destructive') => {
        switch (buttonStyle) {
            case 'destructive':
                return {
                    bg: colors.status.error,
                    text: colors.white,
                };
            case 'cancel':
                return {
                    bg: colors.bg.elevated,
                    text: colors.text.secondary,
                };
            default:
                return {
                    bg: colors.brand.primary,
                    text: colors.white,
                };
        }
    };

    const handleButtonPress = (button: AlertButton) => {
        if (button.onPress) {
            button.onPress();
        }
        if (onDismiss) {
            onDismiss();
        }
    };

    const iconConfig = getIconConfig();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onDismiss}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onDismiss}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                >
                    <View style={[styles.container, { backgroundColor: colors.bg.card }]}>
                        {/* Icon */}
                        <View
                            style={[
                                styles.iconContainer,
                                { backgroundColor: iconConfig.bgColor },
                            ]}
                        >
                            <Ionicons
                                name={iconConfig.name}
                                size={48}
                                color={iconConfig.color}
                            />
                        </View>

                        {/* Content */}
                        <View style={styles.content}>
                            <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
                            {message && <Text style={[styles.message, { color: colors.text.secondary }]}>{message}</Text>}
                        </View>

                        {/* Buttons */}
                        <View
                            style={[
                                styles.buttonContainer,
                                buttons.length === 2 && styles.buttonContainerRow,
                            ]}
                        >
                            {buttons.map((button, index) => {
                                const buttonStyle = getButtonStyle(button.style);
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.button,
                                            {
                                                backgroundColor: buttonStyle.bg,
                                                flex: buttons.length === 2 ? 1 : 0,
                                            },
                                        ]}
                                        onPress={() => handleButtonPress(button)}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            style={[
                                                styles.buttonText,
                                                { color: buttonStyle.text },
                                            ]}
                                        >
                                            {button.text}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        width: Math.min(width - 40, 340),
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    content: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },
    buttonContainer: {
        width: '100%',
        gap: 10,
    },
    buttonContainerRow: {
        flexDirection: 'row',
    },
    button: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
