# Troubleshooting - Módulo de Clientes

## ❌ Error: "Cliente no encontrado"

### Problema
Al hacer click en un cliente y navegar al detalle, aparece el error:
```
ERROR  Error fetching customer by ID: [Error: Cliente no encontrado]
```

### Causa
El `CustomerId` no se encuentra en los resultados de búsqueda porque:
1. El endpoint `SearchCustomers` busca por texto, no por ID exacto
2. El resultado paginado puede no incluir ese cliente específico
3. El `CustomerId` tiene un formato diferente al esperado

### Solución Implementada

**Actualización de `getCustomerById`:**
```typescript
// Antes: Buscaba con PageSize: 1 (muy limitado)
const response = await mdl03Client.post('/mdl03/SearchCustomers/Post', {
    SearchText: customerId,
    PageSize: 1, // ❌ Muy restrictivo
});

// Ahora: Busca en 50 registros y filtra exacto
const response = await mdl03Client.post('/mdl03/SearchCustomers/Post', {
    SearchText: customerId,
    PageSize: 50, // ✅ Más amplio
});

// Luego filtra por CustomerId exacto
const customerData = searchData.find((c: any) => c.CustomerId === customerId);
```

### Alternativa: Usar GetCustomerGeneralInfo

Para obtener información más detallada, puedes usar:
```typescript
const info = await customersApi.getCustomerGeneralInfo(
    customerId,
    customerTypeId,  // Opcional
    countryId        // Opcional
);
```

**Endpoint:** `POST /mdl03/GetCustomerGeneralInfo/Post`

**Payload:**
```json
{
  "CustomerId": "9BD005C3-B69C-42A0-AA38-CA0427B8C6D6",
  "CustomerTypeId": "41ACBCF4-BE83-4F03-8B5E-5760FC92B59B",
  "CountryId": "2d3d33c2-3401-40a1-858b-ae0140b0d376"
}
```

---

## 🔍 Cómo Debuggear

### 1. Activar Debug Mode

En `src/api/customers.api.ts`:
```typescript
const DEBUG_MODE = true; // Cambiar de __DEV__ a true
```

Esto mostrará en consola:
```
====================================
📊 CUSTOMER DEBUG - getCustomers
====================================
🔑 Identificación:
  CustomerId: 9BD005C3-B69C-42A0-AA38-CA0427B8C6D6
  ...
```

### 2. Verificar CustomerId en la Lista

Cuando estés en el listado de clientes, revisa la consola:
```
📋 CUSTOMER LIST - API Response
Total: 20 clientes

Muestra del primer cliente:
  1. Juan Pérez (ID: 9BD005C3-B69C-42A0-AA38-CA0427B8C6D6)
```

### 3. Verificar Navegación

Cuando hagas click en un cliente, verifica el log:
```
📤 MDL03: POST /mdl03/SearchCustomers/Post
📊 CUSTOMER DEBUG - getCustomerById - Found
📥 MDL03 OK: 200
```

Si ves `Cliente no encontrado`, significa que el ID no está en los resultados.

---

## 🛠️ Soluciones Rápidas

### Opción 1: Aumentar PageSize (Actual)
```typescript
// En getCustomerById
PageSize: 50 // O más si es necesario
```

**Pros:** Simple, no requiere cambios en la UI
**Cons:** Menos eficiente si hay muchos clientes

### Opción 2: Pasar CustomerTypeId desde la Card
```typescript
// En CustomerCard.tsx
const handlePress = () => {
    router.push({
        pathname: `/customer/${customer.customerId}`,
        params: {
            customerTypeId: customer.customerTypeName, // Pasar más datos
        }
    });
};

// En [id].tsx
const { id, customerTypeId } = useLocalSearchParams();

// Usar GetCustomerGeneralInfo con más contexto
```

**Pros:** Más eficiente, usa el endpoint correcto
**Cons:** Requiere pasar más datos

### Opción 3: Cache Local (Recomendado)
```typescript
// Ya implementado en el store
// El cliente ya se cargó en la lista, usar del cache
const customer = customers.find(c => c.customerId === id);
if (customer) {
    // Usar directamente sin hacer otro request
    setSelectedCustomer(customer);
}
```

**Pros:** Instantáneo, no hace request adicional
**Cons:** Requiere que el cliente esté en la lista cargada

---

## 📊 Endpoints Disponibles

### 1. SearchCustomers (Actual para listado)
```
POST /mdl03/SearchCustomers/Post
```
**Usa para:** Listar, buscar, filtrar clientes

**Payload:**
```json
{
  "GlobalExecution": true,
  "SearchText": "búsqueda",
  "AludraAPP": true,
  "RoleName": "CUSTOMER",
  "PageNumber": 1,
  "PageSize": 20
}
```

### 2. GetCustomerGeneralInfo (Para detalle)
```
POST /mdl03/GetCustomerGeneralInfo/Post
```
**Usa para:** Obtener información completa de un cliente específico

**Payload:**
```json
{
  "CustomerId": "UUID",
  "CustomerTypeId": "UUID",
  "CountryId": "UUID"
}
```

### 3. CustomerType/Get (Metadata)
```
GET /mdl03/CustomerType/Get?customerTypeId=UUID
```
**Usa para:** Obtener tipo de cliente

### 4. CustomerStatus/Get (Metadata)
```
GET /mdl03/CustomerStatus/Get/CustomerStatusId?UUID
```
**Usa para:** Obtener estado del cliente

---

## ✅ Checklist de Verificación

Cuando tengas el error "Cliente no encontrado":

- [ ] Verificar que el cliente aparece en el listado
- [ ] Copiar el `CustomerId` exacto de la consola
- [ ] Activar `DEBUG_MODE = true`
- [ ] Hacer click en el cliente
- [ ] Revisar logs en consola:
  - ¿Qué `CustomerId` se está buscando?
  - ¿Cuántos resultados retorna SearchCustomers?
  - ¿El ID está en esos resultados?
- [ ] Si no está, aumentar `PageSize` o usar alternativa

---

## 🚀 Mejora Futura Recomendada

Implementar un sistema híbrido:

```typescript
export async function getCustomerById(customerId: string): Promise<Customer> {
    // 1. Intentar desde cache local (store)
    const fromCache = getFromLocalStore(customerId);
    if (fromCache) return fromCache;

    // 2. Intentar desde cache HTTP (5 min)
    const fromHttpCache = getFromCache(customerId);
    if (fromHttpCache) return fromHttpCache;

    // 3. Usar GetCustomerGeneralInfo si tenemos los IDs necesarios
    if (hasRequiredIds(customerId)) {
        return await getCustomerGeneralInfo(customerId, ...);
    }

    // 4. Fallback: Buscar en SearchCustomers
    return await searchAndFind(customerId);
}
```

Esto daría:
- **Velocidad:** Cache primero
- **Precisión:** Endpoint específico cuando sea posible
- **Confiabilidad:** Fallback que siempre funciona
