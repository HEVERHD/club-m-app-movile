// app/customer/edit-particular/[id].tsx
import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../../../src/constants/colors';
import { customersApi } from '../../../src/api/customers.api';
import { CustomAlert } from '../../../src/components/ui/CustomAlert';
import { useAlert } from '../../../src/hooks/useAlert';
import {
    UpdateParticularDTO,
    CUSTOMER_TYPE_IDS,
    CUSTOMER_STATUS_IDS,
    DOCUMENT_TYPE_IDS,
    COUNTRY_IDS,
    GENDER_IDS,
    TELEPHONE_TYPE_IDS,
    EMAIL_TYPE_IDS,
    GeneralTelephone,
    GeneralEmail,
    Customer,
} from '../../../src/types/clubs';

export default function EditParticularScreen() {
    const alert = useAlert();
    const { id } = useLocalSearchParams();
    const customerId = Array.isArray(id) ? id[0] : id;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [customer, setCustomer] = useState<Customer | null>(null);

    // Form fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [birthdate, setBirthdate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedGender, setSelectedGender] = useState<string>(GENDER_IDS.MALE);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phonePrefix, setPhonePrefix] = useState('+507');
    const [email, setEmail] = useState('');

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
            setFirstName(data.firstName || '');
            setLastName(data.lastName || '');
            setIdNumber(data.identificationNumber || '');

            // Parse birthdate
            if (data.dateOfBirth) {
                setBirthdate(new Date(data.dateOfBirth));
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

            console.log('✅ Datos del cliente cargados:', {
                firstName: data.firstName,
                lastName: data.lastName,
                idNumber: data.identificationNumber,
                phone: data.phone,
                email: data.email,
            });
        } catch (error: any) {
            console.error('Error loading customer:', error);
            alert.showError('Error', 'No se pudo cargar los datos del cliente');
            setTimeout(() => router.back(), 1500);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setBirthdate(selectedDate);
        }
    };

    const validateForm = (): boolean => {
        if (!firstName.trim()) {
            alert.showError('Error', 'El nombre es requerido');
            return false;
        }
        if (!lastName.trim()) {
            alert.showError('Error', 'El apellido es requerido');
            return false;
        }
        if (!idNumber.trim()) {
            alert.showError('Error', 'La cédula es requerida');
            return false;
        }
        if (!phoneNumber.trim()) {
            alert.showError('Error', 'El teléfono es requerido');
            return false;
        }
        if (!email.trim()) {
            alert.showError('Error', 'El correo electrónico es requerido');
            return false;
        }
        if (!email.includes('@')) {
            alert.showError('Error', 'El correo electrónico no es válido');
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
                TelephoneTypeId: TELEPHONE_TYPE_IDS.MOBILE,
                DefaultMobile: true,
                DefaultHome: false,
                DefaultWork: false,
            };

            const generalEmail: GeneralEmail = {
                Address: email.trim().toLowerCase(),
                DefaultEmail: true,
                EmailTypeId: EMAIL_TYPE_IDS.PERSONAL,
                Status: true,
            };

            const updateData: UpdateParticularDTO = {
                AludraAPP: true,
                Birthdate: birthdate.toISOString().split('T')[0],
                CountryId: COUNTRY_IDS.PANAMA,
                CustomerId: customerId,
                CustomerStatusId: CUSTOMER_STATUS_IDS.ACTIVE,
                CustomerTypeId: CUSTOMER_TYPE_IDS.PARTICULAR,
                EducationalLevelId: '11acbcf4-be83-4f03-8b5e-5760fc92b59b', // Default
                Email: email.trim().toLowerCase(),
                FirstName: firstName.trim(),
                DocumentTypeId: DOCUMENT_TYPE_IDS.CEDULA,
                DV: null,
                GeneralExternalCode: [],
                GeneralStore: [],
                GeneralAddress: [],
                GeneralTelephone: [generalTelephone],
                GeneralEmail: [generalEmail],
                Latitude: null,
                FullName: `${firstName.trim()} ${lastName.trim()}`,
                Longitude: null,
                Tenant: 2,
                HasChildren: false,
                IdNumber: idNumber.trim(),
                IsWorking: false,
                LastName: lastName.trim(),
                MaritalStatusId: '22acbcf4-be83-4f03-8b5e-5760fc92b59b', // Default
                NationalityId: COUNTRY_IDS.PANAMA,
                SystemCode: null,
                RolesName: ['CUSTOMER'],
                FrequencyCode: null,
                GenderId: selectedGender,
                UserName: email.trim().toLowerCase(),
                Status: true,
                WorkId: null,
            };

            console.log('📤 Actualizando cliente particular:', updateData);

            await customersApi.updateParticular(updateData);

            alert.showSuccess('Éxito', 'Cliente actualizado exitosamente');
            setTimeout(() => router.back(), 1500);
        } catch (error: any) {
            console.error('Error updating customer:', error);
            alert.showError('Error', error.message || 'No se pudo actualizar el cliente');
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
                    title: 'Editar Cliente',
                    headerStyle: { backgroundColor: COLORS.bg.card },
                    headerTintColor: COLORS.text.primary,
                    headerTitleStyle: { fontWeight: 'bold' },
                }}
            />
            <ScrollView style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Ionicons name="person-circle" size={64} color={COLORS.accent.blue} />
                        <Text style={styles.title}>Cliente Particular</Text>
                        <Text style={styles.subtitle}>Actualiza los datos del cliente</Text>
                    </View>

                    {/* Nombres */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Nombre <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            value={firstName}
                            onChangeText={setFirstName}
                            placeholder="Ej: Juan"
                            placeholderTextColor={COLORS.text.tertiary}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Apellido <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            value={lastName}
                            onChangeText={setLastName}
                            placeholder="Ej: Pérez"
                            placeholderTextColor={COLORS.text.tertiary}
                        />
                    </View>

                    {/* Cédula */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Cédula <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            value={idNumber}
                            onChangeText={setIdNumber}
                            placeholder="Ej: 8-123-456"
                            placeholderTextColor={COLORS.text.tertiary}
                            keyboardType="default"
                        />
                    </View>

                    {/* Fecha de nacimiento */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Fecha de Nacimiento <Text style={styles.required}>*</Text>
                        </Text>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={styles.dateButtonText}>
                                {birthdate.toLocaleDateString('es-PA')}
                            </Text>
                            <Ionicons name="calendar" size={20} color={COLORS.text.secondary} />
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={birthdate}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                                maximumDate={new Date()}
                            />
                        )}
                    </View>

                    {/* Género */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Género <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.genderContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.genderButton,
                                    selectedGender === GENDER_IDS.MALE && styles.genderButtonActive,
                                ]}
                                onPress={() => setSelectedGender(GENDER_IDS.MALE)}
                            >
                                <Ionicons
                                    name="male"
                                    size={24}
                                    color={
                                        selectedGender === GENDER_IDS.MALE
                                            ? '#fff'
                                            : COLORS.text.secondary
                                    }
                                />
                                <Text
                                    style={[
                                        styles.genderButtonText,
                                        selectedGender === GENDER_IDS.MALE &&
                                            styles.genderButtonTextActive,
                                    ]}
                                >
                                    Masculino
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.genderButton,
                                    selectedGender === GENDER_IDS.FEMALE &&
                                        styles.genderButtonActive,
                                ]}
                                onPress={() => setSelectedGender(GENDER_IDS.FEMALE)}
                            >
                                <Ionicons
                                    name="female"
                                    size={24}
                                    color={
                                        selectedGender === GENDER_IDS.FEMALE
                                            ? '#fff'
                                            : COLORS.text.secondary
                                    }
                                />
                                <Text
                                    style={[
                                        styles.genderButtonText,
                                        selectedGender === GENDER_IDS.FEMALE &&
                                            styles.genderButtonTextActive,
                                    ]}
                                >
                                    Femenino
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Teléfono */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Teléfono Móvil <Text style={styles.required}>*</Text>
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

                    {/* Email */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Correo Electrónico <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="ejemplo@correo.com"
                            placeholderTextColor={COLORS.text.tertiary}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
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
                                <Text style={styles.submitButtonText}>Actualizar Cliente</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={styles.bottomSpacer} />
                </View>
            </ScrollView>
            <CustomAlert
                visible={alert.visible}
                type={alert.config.type}
                title={alert.config.title}
                message={alert.config.message}
                buttons={alert.config.buttons}
                onDismiss={alert.hide}
            />
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
    dateButton: {
        backgroundColor: COLORS.bg.card,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    dateButtonText: {
        fontSize: 16,
        color: COLORS.text.primary,
    },
    genderContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    genderButton: {
        flex: 1,
        backgroundColor: COLORS.bg.card,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    genderButtonActive: {
        backgroundColor: COLORS.accent.blue,
        borderColor: COLORS.accent.blue,
    },
    genderButtonText: {
        fontSize: 16,
        color: COLORS.text.secondary,
        fontWeight: '600',
    },
    genderButtonTextActive: {
        color: '#fff',
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
        backgroundColor: COLORS.accent.blue,
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
