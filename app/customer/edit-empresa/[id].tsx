// app/customer/edit-empresa/[id].tsx
import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../src/constants/colors';
import { customersApi } from '../../../src/api/customers.api';
import {
    UpdateEmpresaDTO,
    CUSTOMER_TYPE_IDS,
    CUSTOMER_STATUS_IDS,
    DOCUMENT_TYPE_IDS,
    COUNTRY_IDS,
    TELEPHONE_TYPE_IDS,
    EMAIL_TYPE_IDS,
    GeneralTelephone,
    GeneralEmail,
    GeneralStore,
    Customer,
} from '../../../src/types/clubs';

export default function EditEmpresaScreen() {
    const { id } = useLocalSearchParams();
    const customerId = Array.isArray(id) ? id[0] : id;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [customer, setCustomer] = useState<Customer | null>(null);

    // Form fields
    const [legalName, setLegalName] = useState('');
    const [comercialName, setComercialName] = useState('');
    const [ruc, setRuc] = useState('');
    const [dv, setDv] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phonePrefix, setPhonePrefix] = useState('+507');
    const [email, setEmail] = useState('');
    const [website, setWebsite] = useState('');
    const [businessActivity, setBusinessActivity] = useState('');

    // Store info
    const [storeName, setStoreName] = useState('');
    const [storePhone, setStorePhone] = useState('');
    const [storeEmail, setStoreEmail] = useState('');

    // Load customer data
    useEffect(() => {
        loadCustomer();
    }, [customerId]);

    const loadCustomer = async () => {
        try {
            setLoading(true);
            const data = await customersApi.getCustomerById(customerId);
            setCustomer(data);

            // Populate form fields
            setLegalName(data.fullName || '');
            setComercialName(data.fullName || '');

            // Parse RUC - separar número y DV si viene junto
            if (data.identificationNumber) {
                const rucFull = data.identificationNumber.trim();
                // Si tiene guión, separar RUC y DV
                if (rucFull.includes('-')) {
                    const parts = rucFull.split('-');
                    setRuc(parts[0] || '');
                    setDv(parts[1] || '');
                } else {
                    setRuc(rucFull);
                }
            }

            // Parse email
            setEmail(data.email || '');

            // Parse phone number - separar prefijo del número
            if (data.phone) {
                const phone = data.phone.trim();
                // Si empieza con +, extraer el prefijo
                if (phone.startsWith('+')) {
                    const parts = phone.split(/[\s-]/);
                    if (parts.length > 0) {
                        setPhonePrefix(parts[0]); // +507 o similar
                        setPhoneNumber(parts.slice(1).join('')); // resto del número
                    }
                } else {
                    setPhoneNumber(phone);
                }
            }

            // Store defaults - usar los mismos datos de la empresa por ahora
            setStoreName(data.fullName || 'Sucursal Principal');
            setStorePhone(data.phone ? data.phone.replace(/^\+\d+[\s-]/, '') : '');
            setStoreEmail(data.email || '');

            console.log('✅ Datos de empresa cargados:', {
                legalName: data.fullName,
                ruc: data.identificationNumber,
                phone: data.phone,
                email: data.email,
            });
        } catch (error: any) {
            console.error('Error loading customer:', error);
            Alert.alert('Error', 'No se pudo cargar los datos del cliente');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const validateForm = (): boolean => {
        if (!legalName.trim()) {
            Alert.alert('Error', 'El nombre legal es requerido');
            return false;
        }
        if (!comercialName.trim()) {
            Alert.alert('Error', 'El nombre comercial es requerido');
            return false;
        }
        if (!ruc.trim()) {
            Alert.alert('Error', 'El RUC es requerido');
            return false;
        }
        if (!dv.trim()) {
            Alert.alert('Error', 'El DV es requerido');
            return false;
        }
        if (!phoneNumber.trim()) {
            Alert.alert('Error', 'El teléfono es requerido');
            return false;
        }
        if (!email.trim()) {
            Alert.alert('Error', 'El correo electrónico es requerido');
            return false;
        }
        if (!email.includes('@')) {
            Alert.alert('Error', 'El correo electrónico no es válido');
            return false;
        }
        if (!storeName.trim()) {
            Alert.alert('Error', 'El nombre de la tienda es requerido');
            return false;
        }
        if (!storePhone.trim()) {
            Alert.alert('Error', 'El teléfono de la tienda es requerido');
            return false;
        }
        if (!storeEmail.trim()) {
            Alert.alert('Error', 'El correo de la tienda es requerido');
            return false;
        }
        if (!storeEmail.includes('@')) {
            Alert.alert('Error', 'El correo de la tienda no es válido');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setSubmitting(true);

            const generalTelephone: GeneralTelephone = {
                Number: phoneNumber.trim(),
                Status: true,
                Prefix: phonePrefix,
                TelephoneTypeId: TELEPHONE_TYPE_IDS.WORK,
                DefaultMobile: false,
                DefaultHome: false,
                DefaultWork: true,
            };

            const generalEmail: GeneralEmail = {
                Address: email.trim().toLowerCase(),
                DefaultEmail: true,
                EmailTypeId: EMAIL_TYPE_IDS.PERSONAL,
                Status: true,
            };

            const storeTelephone: GeneralTelephone = {
                Number: storePhone.trim(),
                Status: true,
                Prefix: phonePrefix,
                TelephoneTypeId: TELEPHONE_TYPE_IDS.WORK,
                DefaultMobile: false,
                DefaultHome: false,
                DefaultWork: true,
            };

            const storeEmailObj: GeneralEmail = {
                Address: storeEmail.trim().toLowerCase(),
                DefaultEmail: true,
                EmailTypeId: EMAIL_TYPE_IDS.PERSONAL,
                Status: true,
            };

            const generalStore: GeneralStore = {
                AdministrativeLocation: true,
                CountryId: COUNTRY_IDS.PANAMA,
                CustomerId: customerId,
                GeneralAddress: [],
                GeneralStoreHours: [],
                GeneralTelephone: [storeTelephone],
                GeneralEmail: [storeEmailObj],
                GeneralImage: [],
                Manager: null,
                Name: storeName.trim(),
                Status: true,
                StoreId: null,
                Supervisor: null,
            };

            const updateData: UpdateEmpresaDTO = {
                AludraAPP: true,
                BusinessActivity: businessActivity.trim() || null,
                ComercialName: comercialName.trim(),
                CountryId: COUNTRY_IDS.PANAMA,
                CustomerId: customerId,
                CustomerStatusId: CUSTOMER_STATUS_IDS.ACTIVE,
                CustomerTypeId: CUSTOMER_TYPE_IDS.EMPRESA,
                Dv: dv.trim(),
                Email: email.trim().toLowerCase(),
                FundationYear: null,
                GeneralExternalCode: [],
                GeneralStore: [generalStore],
                DocumentTypeId: DOCUMENT_TYPE_IDS.RUC,
                GeneralAddress: [],
                GeneralTelephone: [generalTelephone],
                GeneralEmail: [generalEmail],
                Latitude: null,
                LegalName: legalName.trim(),
                Longitude: null,
                Tenant: 2,
                RolesName: ['CUSTOMER'],
                FrequencyCode: null,
                Ruc: ruc.trim(),
                OperationNoticeNumber: null,
                UserName: email.trim().toLowerCase(),
                Status: true,
                Website: website.trim() || null,
            };

            console.log('📤 Actualizando cliente empresa:', updateData);

            await customersApi.updateEmpresa(updateData);

            Alert.alert(
                'Éxito',
                'Cliente empresa actualizado exitosamente',
                [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error: any) {
            console.error('Error updating empresa:', error);
            Alert.alert(
                'Error',
                error.message || 'No se pudo actualizar el cliente'
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.accent.blue} />
                <Text style={styles.loadingText}>Cargando datos...</Text>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Editar Empresa',
                    headerStyle: { backgroundColor: COLORS.bg.card },
                    headerTintColor: COLORS.text.primary,
                    headerTitleStyle: { fontWeight: 'bold' },
                }}
            />
            <ScrollView style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Ionicons name="business" size={64} color={COLORS.accent.green} />
                        <Text style={styles.title}>Cliente Empresa</Text>
                        <Text style={styles.subtitle}>Actualiza los datos de la empresa</Text>
                    </View>

                    {/* Información de la Empresa */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Información de la Empresa</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>
                                Nombre Legal <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={legalName}
                                onChangeText={setLegalName}
                                placeholder="Ej: EMPRESA S.A."
                                placeholderTextColor={COLORS.text.tertiary}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>
                                Nombre Comercial <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={comercialName}
                                onChangeText={setComercialName}
                                placeholder="Ej: Mi Empresa"
                                placeholderTextColor={COLORS.text.tertiary}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>
                                RUC <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={ruc}
                                onChangeText={setRuc}
                                placeholder="Ej: 123456789"
                                placeholderTextColor={COLORS.text.tertiary}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>
                                DV <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={dv}
                                onChangeText={setDv}
                                placeholder="Ej: 12"
                                placeholderTextColor={COLORS.text.tertiary}
                                keyboardType="numeric"
                                maxLength={2}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Actividad Comercial</Text>
                            <TextInput
                                style={styles.input}
                                value={businessActivity}
                                onChangeText={setBusinessActivity}
                                placeholder="Ej: Comercio al por mayor"
                                placeholderTextColor={COLORS.text.tertiary}
                            />
                        </View>
                    </View>

                    {/* Información de Contacto */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Información de Contacto</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>
                                Teléfono <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={styles.phoneContainer}>
                                <TextInput
                                    style={styles.phonePrefix}
                                    value={phonePrefix}
                                    onChangeText={setPhonePrefix}
                                    placeholder="+507"
                                    placeholderTextColor={COLORS.text.tertiary}
                                    keyboardType="phone-pad"
                                />
                                <TextInput
                                    style={styles.phoneInput}
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    placeholder="6123-4567"
                                    placeholderTextColor={COLORS.text.tertiary}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>
                                Correo Electrónico <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="empresa@correo.com"
                                placeholderTextColor={COLORS.text.tertiary}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Sitio Web</Text>
                            <TextInput
                                style={styles.input}
                                value={website}
                                onChangeText={setWebsite}
                                placeholder="www.empresa.com"
                                placeholderTextColor={COLORS.text.tertiary}
                                keyboardType="url"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {/* Información de la Tienda */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Información de la Tienda</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>
                                Nombre de la Tienda <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={storeName}
                                onChangeText={setStoreName}
                                placeholder="Ej: Sucursal Principal"
                                placeholderTextColor={COLORS.text.tertiary}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>
                                Teléfono de la Tienda <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={styles.phoneContainer}>
                                <TextInput
                                    style={styles.phonePrefix}
                                    value={phonePrefix}
                                    placeholder="+507"
                                    placeholderTextColor={COLORS.text.tertiary}
                                    keyboardType="phone-pad"
                                    editable={false}
                                />
                                <TextInput
                                    style={styles.phoneInput}
                                    value={storePhone}
                                    onChangeText={setStorePhone}
                                    placeholder="6123-4567"
                                    placeholderTextColor={COLORS.text.tertiary}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>
                                Correo de la Tienda <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={storeEmail}
                                onChangeText={setStoreEmail}
                                placeholder="tienda@correo.com"
                                placeholderTextColor={COLORS.text.tertiary}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {/* Botón de guardar */}
                    <TouchableOpacity
                        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                                <Text style={styles.submitButtonText}>Actualizar Empresa</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={styles.bottomSpacer} />
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.bg.primary,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: COLORS.text.secondary,
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
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text.primary,
        marginBottom: 16,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: 8,
    },
    required: {
        color: COLORS.accent.red,
    },
    input: {
        backgroundColor: COLORS.bg.card,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: COLORS.text.primary,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    phoneContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    phonePrefix: {
        backgroundColor: COLORS.bg.card,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: COLORS.text.primary,
        borderWidth: 1,
        borderColor: COLORS.border,
        width: 80,
    },
    phoneInput: {
        flex: 1,
        backgroundColor: COLORS.bg.card,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: COLORS.text.primary,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    submitButton: {
        backgroundColor: COLORS.accent.green,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 12,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    bottomSpacer: {
        height: 40,
    },
});
