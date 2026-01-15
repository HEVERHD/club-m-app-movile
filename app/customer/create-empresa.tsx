// app/customer/create-empresa.tsx
import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { customersApi } from '../../src/api/customers.api';
import { CustomAlert } from '../../src/components/ui/CustomAlert';
import { useAlert } from '../../src/hooks/useAlert';
import {
    RegisterEmpresaDTO,
    CUSTOMER_TYPE_IDS,
    CUSTOMER_STATUS_IDS,
    DOCUMENT_TYPE_IDS,
    COUNTRY_IDS,
    TELEPHONE_TYPE_IDS,
    EMAIL_TYPE_IDS,
    ADDRESS_TYPE_IDS,
    BUILDING_TYPE_IDS,
} from '../../src/types/clubs';

export default function CreateEmpresaScreen() {
    const alert = useAlert();
    const [loading, setLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        legalName: '',
        comercialName: '',
        ruc: '',
        dv: '',
        phone: '',
        email: '',
        website: '',
        storeName: '',
        storeAddress: '',
        provinceId: '48a8223c-d101-4b47-a669-41236d8accee',
        townshipId: '458a7343-2dc3-4543-8ee3-2c5788a02333',
        districtId: '4e2d91f9-7ce2-42fb-a122-9faaeac6a595',
    });

    const validateForm = (): boolean => {
        if (!formData.legalName.trim()) {
            alert.showError('Error', 'El nombre legal es requerido');
            return false;
        }
        if (!formData.comercialName.trim()) {
            alert.showError('Error', 'El nombre comercial es requerido');
            return false;
        }
        if (!formData.ruc.trim()) {
            alert.showError('Error', 'El RUC es requerido');
            return false;
        }
        if (!formData.dv.trim()) {
            alert.showError('Error', 'El DV es requerido');
            return false;
        }
        if (!formData.phone.trim()) {
            alert.showError('Error', 'El teléfono es requerido');
            return false;
        }
        if (!formData.email.trim()) {
            alert.showError('Error', 'El email es requerido');
            return false;
        }
        if (!formData.storeName.trim()) {
            alert.showError('Error', 'El nombre de la tienda es requerido');
            return false;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert.showError('Error', 'El formato del email no es válido');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            const registerData: RegisterEmpresaDTO = {
                AludraAPP: true,
                BusinessActivity: null,
                ComercialName: formData.comercialName,
                CountryId: COUNTRY_IDS.PANAMA,
                CustomerId: null,
                CustomerStatusId: CUSTOMER_STATUS_IDS.ACTIVE,
                CustomerTypeId: CUSTOMER_TYPE_IDS.EMPRESA,
                Dv: formData.dv,
                Email: formData.email || null,
                FundationYear: null,
                GeneralExternalCode: [],
                GeneralStore: [
                    {
                        AdministrativeLocation: true,
                        CountryId: COUNTRY_IDS.PANAMA,
                        CustomerId: null,
                        GeneralAddress: [
                            {
                                AddressDetail: null,
                                AddressId: null,
                                AddressTypeId: ADDRESS_TYPE_IDS.HOME,
                                BuildingId: null,
                                BuildingTypeId: BUILDING_TYPE_IDS.HOUSE,
                                CountryId: COUNTRY_IDS.PANAMA,
                                CustomerId: null,
                                DefaultBillingAddress: false,
                                DefaultHomeAddress: true,
                                DefaultShippingAddress: false,
                                IsfirstFloor: true,
                                HasElevator: true,
                                DistanceOverFiveMts: true,
                                AccessibleBuildingProject: true,
                                DistrictId: formData.districtId,
                                HomeOrFloorNumber: null,
                                Latitude: null,
                                Longitude: null,
                                Name: formData.storeAddress,
                                NeighborhoodId: null,
                                ProvinceId: formData.provinceId,
                                Status: true,
                                Street: null,
                                TownshipId: formData.townshipId,
                            },
                        ],
                        GeneralStoreHours: [],
                        GeneralTelephone: [
                            {
                                CustomerId: null,
                                StoreId: null,
                                DefaultHome: false,
                                DefaultMobile: true,
                                DefaultWork: false,
                                Number: formData.phone,
                                Status: true,
                                TelephoneId: null,
                                TelephoneTypeId: TELEPHONE_TYPE_IDS.MOBILE,
                                Prefix: '+507',
                            },
                        ],
                        GeneralEmail: [
                            {
                                Address: formData.email,
                                CustomerId: null,
                                StoreId: null,
                                DefaultEmail: true,
                                EmailId: null,
                                EmailTypeId: EMAIL_TYPE_IDS.PERSONAL,
                            },
                        ],
                        GeneralImage: [],
                        Manager: null,
                        Name: formData.storeName,
                        Status: true,
                        StoreId: null,
                        Supervisor: null,
                    },
                ],
                DocumentTypeId: DOCUMENT_TYPE_IDS.RUC,
                GeneralAddress: [],
                GeneralTelephone: [],
                GeneralEmail: [],
                Latitude: null,
                LegalName: formData.legalName,
                Longitude: null,
                Tenant: 2,
                RolesName: ['Customer', 'Customer MDL11'],
                FrequencyCode: null,
                Ruc: formData.ruc,
                OperationNoticeNumber: null,
                UserName: formData.ruc,
                Status: true,
                Website: formData.website || null,
            };

            await customersApi.registerEmpresa(registerData);

            alert.showSuccess('Éxito', 'Cliente empresa registrado exitosamente');
            setTimeout(() => router.back(), 1500);
        } catch (error: any) {
            alert.showError('Error', error.message || 'Error al registrar cliente empresa');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Cliente Empresa',
                    headerStyle: { backgroundColor: '#28a745' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: 'bold' },
                }}
            />
            <ScrollView style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Ionicons name="business" size={48} color="#28a745" />
                        <Text style={styles.headerTitle}>Cliente Empresa</Text>
                        <Text style={styles.headerSubtitle}>
                            Completa los datos de la empresa
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Información de la Empresa</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Nombre Legal <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ej: EMPRESA S.A."
                                value={formData.legalName}
                                onChangeText={(text) => setFormData({ ...formData, legalName: text })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Nombre Comercial <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ej: Mi Empresa"
                                value={formData.comercialName}
                                onChangeText={(text) => setFormData({ ...formData, comercialName: text })}
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 3 }]}>
                                <Text style={styles.label}>
                                    RUC <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ej: 2-887-7000"
                                    value={formData.ruc}
                                    onChangeText={(text) => setFormData({ ...formData, ruc: text })}
                                />
                            </View>

                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>
                                    DV <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="24"
                                    value={formData.dv}
                                    onChangeText={(text) => setFormData({ ...formData, dv: text })}
                                    maxLength={2}
                                />
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
                                placeholder="Ej: 66558895"
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
                                placeholder="Ej: empresa@email.com"
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Website (opcional)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ej: www.miempresa.com"
                                value={formData.website}
                                onChangeText={(text) => setFormData({ ...formData, website: text })}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Información de la Tienda</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Nombre de la Tienda <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ej: Tienda Principal"
                                value={formData.storeName}
                                onChangeText={(text) => setFormData({ ...formData, storeName: text })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Dirección</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ej: Calle 50, Ciudad de Panamá"
                                value={formData.storeAddress}
                                onChangeText={(text) => setFormData({ ...formData, storeAddress: text })}
                                multiline
                                numberOfLines={2}
                            />
                        </View>
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
                                <Text style={styles.submitButtonText}>Registrar Empresa</Text>
                            </>
                        )}
                    </TouchableOpacity>
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
    row: {
        flexDirection: 'row',
        gap: 12,
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
    submitButton: {
        backgroundColor: '#28a745',
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
