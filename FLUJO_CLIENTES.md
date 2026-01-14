# Flujo de Navegación - Módulo de Clientes

## 📱 Flujo Completo

### 1. Tab de Clientes → Listado
**Archivo:** `app/(tabs)/customers.tsx`

**Usuario ve:**
- Header con título "Clientes" y contador total
- Barra de búsqueda
- Botón de filtros (activo/suspendido/inactivo)
- Lista de cards de clientes (CustomerCard)
- FAB para agregar cliente

**Estado inicial:**
- Se ejecuta `useEffect` que llama a `fetchCustomers()`
- El store `useCustomerStore` hace request a `/mdl03/SearchCustomers/Post`
- Se cargan los primeros 20 clientes

### 2. CustomerCard → Click
**Archivo:** `src/components/customers/CustomerCard.tsx`

**Al hacer click:**
```typescript
const handlePress = () => {
    router.push(`/customer/${customer.customerId}`);
};
```

**Navega a:** `/customer/[id]` donde `[id]` es el `customerId`

### 3. Detalle del Cliente
**Archivo:** `app/customer/[id].tsx`

**Parámetros recibidos:**
```typescript
const { id } = useLocalSearchParams<{ id: string }>();
```

**Estado inicial:**
```typescript
useEffect(() => {
    if (id) {
        fetchCustomerDetail(id); // Carga cliente + estadísticas
    }
    return () => {
        clearSelectedCustomer(); // Limpia al salir
    };
}, [id]);
```

**Datos cargados:**
1. `selectedCustomer` - Información completa del cliente
2. `customerStats` - Estadísticas calculadas de sus clubes

**Usuario ve:**
- Perfil con avatar/iniciales
- Estado (activo/suspendido/inactivo)
- Tier/nivel si existe
- **Card de Estadísticas:**
  - Clubes totales
  - Clubes activos
  - Total invertido
  - Balance disponible
  - Botón "Ver Clubes"
- **Card de Contacto:**
  - Email
  - Teléfono
  - Documento de identidad
  - Fecha de nacimiento
- **Card de Dirección:**
  - Dirección completa
  - Ciudad, Estado, País
- **Card de Info Adicional:**
  - Fecha de registro
  - Código de sistema
  - Notas

**Botón "Ver Clubes":**
```typescript
const handleViewClubs = () => {
    if (customer) {
        router.push({
            pathname: '/(tabs)/clubs',
            params: { customerId: customer.customerId },
        });
    }
};
```

## 🔄 Flow Diagram

```
┌─────────────────────────────────────────┐
│  app/(tabs)/customers.tsx               │
│  (Tab "Clientes")                       │
│                                         │
│  - Listado de clientes                  │
│  - Búsqueda                             │
│  - Filtros                              │
│  - Paginación                           │
└─────────────────┬───────────────────────┘
                  │
                  │ Click en CustomerCard
                  │ router.push(`/customer/${id}`)
                  ↓
┌─────────────────────────────────────────┐
│  app/customer/[id].tsx                  │
│  (Detalle del Cliente)                  │
│                                         │
│  - Perfil completo                      │
│  - Estadísticas                         │
│  - Información de contacto              │
│  - Dirección                            │
│  - Info adicional                       │
│                                         │
│  [Botón: Ver Clubes] ──────────────────┼──┐
└─────────────────────────────────────────┘  │
                                             │
                                             ↓
                  ┌──────────────────────────────┐
                  │  app/(tabs)/clubs.tsx        │
                  │  (Filtrado por customerId)   │
                  │                              │
                  │  - Clubes del cliente        │
                  └──────────────────────────────┘
```

## 🗂️ Estructura de Archivos

```
app/
├── (tabs)/
│   ├── customers.tsx          # Listado principal
│   └── clubs.tsx              # Puede recibir customerId
├── customer/
│   ├── _layout.tsx            # Layout para rutas dinámicas
│   └── [id].tsx               # Detalle del cliente

src/
├── api/
│   ├── client.ts              # mdl03Client exportado
│   └── customers.api.ts       # CRUD de clientes
├── stores/
│   └── customer-store.ts      # Estado global con Zustand
├── components/
│   └── customers/
│       └── CustomerCard.tsx   # Card individual
└── types/
    └── clubs.ts               # Interfaces de Customer
```

## 🔌 API Calls

### Listado de Clientes
```typescript
POST /mdl03/SearchCustomers/Post
{
  "CompanyId": null,
  "CompanyCode": null,
  "GlobalExecution": true,
  "SearchText": "búsqueda opcional",
  "CustomerTypeId": null,
  "CustomerCategoryId": null,
  "AludraAPP": true,
  "RoleName": "CUSTOMER",
  "PageNumber": 1,
  "PageSize": 20
}
```

### Detalle de Cliente
```typescript
// Usa el mismo endpoint buscando por ID
POST /mdl03/SearchCustomers/Post
{
  ...
  "SearchText": "customerId",
  "PageSize": 1
}
```

### Estadísticas
```typescript
// Calculadas desde clubsApi
POST /mdl05/club/history
// Filtra clubs por customerId
```

## ✅ Checklist de Funcionalidad

- [x] Navegación desde listado a detalle
- [x] Parámetros dinámicos con `[id]`
- [x] Layout configurado para rutas dinámicas
- [x] Store conectado con API real
- [x] Manejo de loading states
- [x] Manejo de errores
- [x] Limpieza de estado al salir
- [x] Navegación a clubes filtrados
- [x] Cache de datos (5 min TTL)
- [x] Pull-to-refresh en listado
- [x] Scroll infinito en listado

## 🐛 Troubleshooting

### Error: "No se puede navegar a /customer/[id]"
- **Verificar:** Existe `app/customer/_layout.tsx`
- **Verificar:** Existe `app/customer/[id].tsx`
- **Solución:** Reiniciar Metro bundler

### Error: "Customer undefined"
- **Causa:** El API no retorna datos o customerId incorrecto
- **Verificar:** Console logs en `fetchCustomerDetail`
- **Verificar:** Formato de customerId en CustomerCard

### Error: "mdl03Client no está definido"
- **Verificar:** Import correcto en `customers.api.ts`
- **Verificar:** Export en `client.ts`

## 📝 Próximas Mejoras

1. **Modal de Crear/Editar Cliente**
   - Formulario con validación
   - Conectar con endpoints cuando estén disponibles

2. **Acciones en Detalle**
   - Editar información
   - Cambiar estado (activar/suspender)
   - Agregar notas

3. **Historial de Actividad**
   - Timeline de transacciones
   - Historial de clubes
   - Cambios de estado

4. **Compartir Información**
   - Exportar datos del cliente
   - Generar PDF de perfil
   - Compartir contacto
