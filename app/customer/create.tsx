// app/customer/create.tsx
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Link, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../src/constants/colors';

export default function CreateCustomerScreen() {
    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Crear Cliente',
                    headerStyle: { backgroundColor: COLORS.bg.card },
                    headerTintColor: COLORS.text.primary,
                    headerTitleStyle: { fontWeight: 'bold' },
                }}
            />
            <ScrollView style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Ionicons name="person-add" size={64} color={COLORS.accent.blue} />
                        <Text style={styles.title}>Nuevo Cliente</Text>
                        <Text style={styles.subtitle}>
                            Selecciona el tipo de cliente que deseas registrar
                        </Text>
                    </View>

                    <View style={styles.cardsContainer}>
                        <Link href="/customer/create-particular" asChild>
                            <TouchableOpacity style={styles.card}>
                                <LinearGradient
                                    colors={['#1a5fb4', '#2874d4']}
                                    style={styles.cardGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <View style={styles.cardIcon}>
                                        <Ionicons name="person" size={48} color="#fff" />
                                    </View>
                                    <Text style={styles.cardTitle}>Cliente Particular</Text>
                                    <Text style={styles.cardDescription}>
                                        Persona natural o individual
                                    </Text>
                                    <View style={styles.cardArrow}>
                                        <Ionicons name="arrow-forward" size={24} color="#fff" />
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        </Link>

                        <Link href="/customer/create-empresa" asChild>
                            <TouchableOpacity style={styles.card}>
                                <LinearGradient
                                    colors={['#1e7e34', '#28a745']}
                                    style={styles.cardGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <View style={styles.cardIcon}>
                                        <Ionicons name="business" size={48} color="#fff" />
                                    </View>
                                    <Text style={styles.cardTitle}>Cliente Empresa</Text>
                                    <Text style={styles.cardDescription}>
                                        Persona jurídica o negocio
                                    </Text>
                                    <View style={styles.cardArrow}>
                                        <Ionicons name="arrow-forward" size={24} color="#fff" />
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        </Link>
                    </View>

                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle" size={24} color={COLORS.accent.blue} />
                        <Text style={styles.infoText}>
                            Los clientes particulares son personas individuales, mientras que los clientes empresa son negocios o personas jurídicas.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg.primary,
    },
    content: {
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
        paddingTop: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text.primary,
        marginTop: 16,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.text.secondary,
        textAlign: 'center',
        maxWidth: 300,
    },
    cardsContainer: {
        gap: 16,
        marginBottom: 24,
    },
    card: {
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    cardGradient: {
        padding: 24,
        minHeight: 180,
    },
    cardIcon: {
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    cardDescription: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
        marginBottom: 16,
    },
    cardArrow: {
        position: 'absolute',
        bottom: 24,
        right: 24,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: COLORS.status.infoBg,
        padding: 16,
        borderRadius: 12,
        gap: 12,
        alignItems: 'flex-start',
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: COLORS.text.secondary,
        lineHeight: 20,
    },
});
