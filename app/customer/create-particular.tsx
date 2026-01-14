// app/customer/create-particular.tsx
import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { customersApi } from '../../src/api/customers.api';
import {
    RegisterParticularDTO,
    CUSTOMER_TYPE_IDS,
    CUSTOMER_STATUS_IDS,
    DOCUMENT_TYPE_IDS,
    COUNTRY_IDS,
    GENDER_IDS,
    TELEPHONE_TYPE_IDS,
    EMAIL_TYPE_IDS,
} from '../../src/types/clubs';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CreateParticularScreen() {
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        idNumber: '',
        birthdate: new Date('2000-01-01'),
        phone: '',
        email: '',
        genderId: GENDER_IDS.MALE,
        hasChildren: false,
        isWorking: false,
        educationalLevelId: '41c7a364-b4fb-4ec6-9b0a-c0dbe4299ba3',
        maritalStatusId: 'a305f1be-e121-46dc-b087-11bf7a0ee3e3',
        nationalityId: '6aa4a880-5e7a-4199-8e17-bd3192786e3a',
    });

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setFormData({ ...formData, birthdate: selectedDate });
        }
    };

    const validateForm = (): boolean => {
        if (!formData.firstName.trim()) {
            Alert.alert('Error', 'El nombre es requerido');
            return false;
        }
        if (!formData.lastName.trim()) {
            Alert.alert('Error', 'El apellido es requerido');
            return false;
        }
        if (!formData.idNumber.trim()) {
            Alert.alert('Error', 'El número de cédula es requerido');
            return false;
        }
        if (!formData.phone.trim()) {
            Alert.alert('Error', 'El teléfono es requerido');
            return false;
        }
        if (!formData.email.trim()) {
            Alert.alert('Error', 'El email es requerido');
            return false;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            Alert.alert('Error', 'El formato del email no es válido');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            const registerData: RegisterParticularDTO = {
                AludraAPP: true,
                Birthdate: formData.birthdate.toISOString().split('T')[0],
                CountryId: COUNTRY_IDS.PANAMA,
                CustomerId: null,
                CustomerStatusId: CUSTOMER_STATUS_IDS.ACTIVE,
                CustomerTypeId: CUSTOMER_TYPE_IDS.PARTICULAR,
                EducationalLevelId: formData.educationalLevelId,
                Email: formData.email || null,
                FirstName: formData.firstName,
                DocumentTypeId: DOCUMENT_TYPE_IDS.CEDULA,
                DV: null,
                GeneralExternalCode: [],
                GeneralStore: [],
                GeneralAddress: [],
                GeneralTelephone: [
                    {
                        CustomerId: null,
                        DefaultHome: true,
                        DefaultMobile: false,
                        DefaultWork: false,
                        Number: formData.phone,
                        Status: true,
                        Prefix: '+507',
                        TelephoneId: null,
                        TelephoneTypeId: TELEPHONE_TYPE_IDS.HOME,
                    },
                ],
                GeneralEmail: [
                    {
                        Address: formData.email,
                        CustomerId: null,
                        DefaultEmail: true,
                        EmailId: null,
                        EmailTypeId: EMAIL_TYPE_IDS.PERSONAL,
                        Status: true,
                    },
                ],
                Latitude: null,
                FullName: null,
                Longitude: null,
                Tenant: 2,
                HasChildren: formData.hasChildren,
                IdNumber: formData.idNumber,
                IsWorking: formData.isWorking,
                LastName: formData.lastName,
                MaritalStatusId: formData.maritalStatusId,
                NationalityId: formData.nationalityId,
                SystemCode: null,
                RolesName: ['Customer', 'Customer MDL11'],
                FrequencyCode: null,
                GenderId: formData.genderId,
                UserName: formData.idNumber,
                Status: true,
                WorkId: null,
            };

            await customersApi.registerParticular(registerData);

            Alert.alert(
                'Éxito',
                'Cliente registrado exitosamente',
                [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Error al registrar cliente');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Cliente Particular',
                    headerStyle: { backgroundColor: '#1a5fb4' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: 'bold' },
                }}
            />
            <ScrollView style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Ionicons name="person" size={48} color="#1a5fb4" />
                        <Text style={styles.headerTitle}>Cliente Particular</Text>
                        <Text style={styles.headerSubtitle}>
                            Completa los datos del cliente
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Información Personal</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Nombre <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ej: Juan"
                                value={formData.firstName}
                                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Apellido <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ej: Pérez"
                                value={formData.lastName}
                                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Cédula <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ej: 8-877-7777"
                                value={formData.idNumber}
                                onChangeText={(text) => setFormData({ ...formData, idNumber: text })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Fecha de Nacimiento</Text>
                            <TouchableOpacity
                                style={styles.input}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text>{formData.birthdate.toLocaleDateString('es-PA')}</Text>
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={formData.birthdate}
                                    mode="date"
                                    display="default"
                                    onChange={handleDateChange}
                                    maximumDate={new Date()}
                                />
                            )}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Género</Text>
                            <View style={styles.radioGroup}>
                                <TouchableOpacity
                                    style={styles.radioButton}
                                    onPress={() => setFormData({ ...formData, genderId: GENDER_IDS.MALE })}
                                >
                                    <View style={styles.radio}>
                                        {formData.genderId === GENDER_IDS.MALE && (
                                            <View style={styles.radioSelected} />
                                        )}
                                    </View>
                                    <Text style={styles.radioLabel}>Masculino</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.radioButton}
                                    onPress={() => setFormData({ ...formData, genderId: GENDER_IDS.FEMALE })}
                                >
                                    <View style={styles.radio}>
                                        {formData.genderId === GENDER_IDS.FEMALE && (
                                            <View style={styles.radioSelected} />
                                        )}
                                    </View>
                                    <Text style={styles.radioLabel}>Femenino</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Contacto</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Teléfono <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ej: 66558871"
                                value={formData.phone}
                                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Email <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ej: cliente@email.com"
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Información Adicional</Text>

                        <TouchableOpacity
                            style={styles.checkbox}
                            onPress={() => setFormData({ ...formData, hasChildren: !formData.hasChildren })}
                        >
                            <View style={styles.checkboxBox}>
                                {formData.hasChildren && (
                                    <Ionicons name="checkmark" size={20} color="#1a5fb4" />
                                )}
                            </View>
                            <Text style={styles.checkboxLabel}>Tiene hijos</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.checkbox}
                            onPress={() => setFormData({ ...formData, isWorking: !formData.isWorking })}
                        >
                            <View style={styles.checkboxBox}>
                                {formData.isWorking && (
                                    <Ionicons name="checkmark" size={20} color="#1a5fb4" />
                                )}
                            </View>
                            <Text style={styles.checkboxLabel}>Está trabajando</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                                <Text style={styles.submitButtonText}>Registrar Cliente</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f6fa',
    },
    content: {
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
        paddingTop: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginTop: 12,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    required: {
        color: '#dc3545',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    radioGroup: {
        flexDirection: 'row',
        gap: 20,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    radio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#1a5fb4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioSelected: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#1a5fb4',
    },
    radioLabel: {
        fontSize: 16,
        color: '#333',
    },
    checkbox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    checkboxBox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#1a5fb4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxLabel: {
        fontSize: 16,
        color: '#333',
    },
    submitButton: {
        backgroundColor: '#1a5fb4',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 8,
        marginBottom: 32,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
