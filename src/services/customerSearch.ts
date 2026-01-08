// src/services/customerSearch.ts
import * as SecureStore from 'expo-secure-store';
import { getBaseUrl } from './api.config';

export interface CustomerSearchResult {
    CustomerId: string;
    FullName: string;
    Email: string;
    PhoneNumber: string;
    NumberId: string;
    SystemCode: string;
    TierName: string;
    CustomerTypeName: string;
    ProfileImage: string | null;
    TotalRegisters?: number;
    RowNumber?: number;
}

export interface CustomerSearchResponse {
    Data: CustomerSearchResult[];
    Status: { Code: number; Message: string };
}

export interface SearchCustomersParams {
    searchText?: string;
    page?: number;
    pageSize?: number;
}

// API Keys - mdl03 usa Ocp-Apim-Subscription-Key (la corta)
const OCP_APIM_KEY = 'f718d6d8af9848008b8f6a6f516cb7ba';

/**
 * Buscar clientes usando fetch nativo
 * POST /mdl03/SearchCustomers/Post
 */
export async function searchCustomers({
    searchText = '',
    page = 1,
    pageSize = 20,
}: SearchCustomersParams): Promise<CustomerSearchResponse> {
    const token = await SecureStore.getItemAsync('accessToken');
    const baseUrl = getBaseUrl();

    console.log('🔍 Buscando clientes:', { searchText, hasToken: !!token, tokenLength: token?.length });
    console.log('🔑 API Key:', OCP_APIM_KEY);
    console.log('🌐 URL:', `${baseUrl}/mdl03/SearchCustomers/Post`);

    // Body exacto como en la web (sin SaaSId)
    const body = {
        CompanyId: null,
        CompanyCode: null,
        GlobalExecution: true,
        SearchText: searchText || null,
        CustomerTypeId: null,
        CustomerCategoryId: null,
        AludraAPP: true,
        RoleName: 'CUSTOMER',
        PageNumber: page,
        PageSize: pageSize,
    };

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Ocp-Apim-Subscription-Key': OCP_APIM_KEY,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('📤 Headers:', JSON.stringify(headers, null, 2));
    console.log('📤 Body:', JSON.stringify(body, null, 2));

    const response = await fetch(`${baseUrl}/mdl03/SearchCustomers/Post`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Clientes encontrados:', data.Data?.length || 0);

    return data;
}