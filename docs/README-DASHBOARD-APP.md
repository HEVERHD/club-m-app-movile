# Dashboard Ejecutivo en la App Móvil

## 📱 Descripción

Se ha integrado el Dashboard Ejecutivo HTML dentro de la app móvil usando WebView. Solo usuarios con rol **Admin** pueden acceder a esta funcionalidad.

## 🎯 Funcionalidades Implementadas

### 1. **Pantalla con HTML Inline** (Recomendado)
- **Archivo**: `app/admin-dashboard-inline.tsx`
- **Ventaja**: No requiere hosting externo, HTML embebido directamente
- **Uso**: Mejor para desarrollo y producción sin servidor

### 2. **Pantalla con Carga desde URL**
- **Archivo**: `app/admin-dashboard.tsx`
- **Ventaja**: HTML actualizable sin rebuild de la app
- **Uso**: Si decides hostear el dashboard en un servidor

## 🔐 Control de Acceso

### Validación de Rol Admin
Ambas pantallas incluyen verificación automática:

```typescript
useEffect(() => {
    if (!user || user.role !== 'admin') {
        Alert.alert(
            'Acceso Denegado',
            'Solo usuarios administradores pueden acceder al Dashboard Ejecutivo',
            [{ text: 'OK', onPress: () => router.back() }]
        );
    }
}, [user]);
```

### Botón de Acceso Rápido
Se agregó un botón en el **Home de Staff** que solo aparece para admins:

```typescript
// En home.tsx
const actions = [
    ...(user?.role === 'admin' ? [{
        icon: 'stats-chart',
        title: 'Dashboard Ejecutivo',
        subtitle: 'Ver estado del proyecto',
        onPress: () => router.push('/admin-dashboard-inline'),
    }] : []),
    // ... otras acciones
];
```

## 📊 Contenido del Dashboard

El dashboard muestra en tiempo real:

### ✅ Módulos con Backend Real (5/9)
- Autenticación y Usuarios (MDL03)
- Gestión de Clientes (MDL05)
- Clubes y Membresías (MDL05)
- Sorteos (MDL05)
- Pagos de Cuotas (MDL05)

### ⚠️ Módulos con Datos Mock (4/9)
- Sistema de Puntos
- Cupones
- Historial de Compras
- Campañas

### ❌ Pendiente de Integrar (1/9)
- Pasarela de Pago (Stripe/MercadoPago/Tilopay)

## 🚀 Cómo Usar

### Opción 1: HTML Inline (Recomendado)

1. **Acceder como Admin**:
   ```
   - Login con usuario role: 'admin'
   - Ver Home de Staff
   - Click en "Dashboard Ejecutivo"
   ```

2. **Vista**:
   - Se abre pantalla con WebView
   - HTML renderizado directamente
   - Funciona offline

### Opción 2: Desde URL

1. **Configurar URL del dashboard**:
   ```typescript
   // En admin-dashboard.tsx
   const DASHBOARD_URL = 'https://tudominio.com/docs/index.html';
   ```

2. **Hostear el HTML**:
   - Subir `docs/index.html` a un servidor
   - Configurar CORS si es necesario
   - Actualizar la URL en el código

3. **Acceder**: Igual que Opción 1

## 🎨 Personalización del HTML

### Actualizar Contenido
Edita `app/admin-dashboard-inline.tsx` línea ~30:

```typescript
const dashboardHTML = `
<!DOCTYPE html>
<html>
...
// Tu HTML personalizado aquí
...
</html>
`;
```

### Usar HTML Completo
Para incluir el HTML completo de `docs/index.html`:

1. **Opción A**: Copiar todo el HTML de `docs/index.html` al string `dashboardHTML`
2. **Opción B**: Usar imports (requiere configuración extra)
3. **Opción C**: Cargar desde URL (usar `admin-dashboard.tsx`)

## 🔧 Configuración Técnica

### WebView Props Importantes

```typescript
<WebView
    originWhitelist={['*']}              // Permite cargar de cualquier origen
    source={{ html: dashboardHTML }}     // HTML inline
    javaScriptEnabled={true}             // Permite JS
    domStorageEnabled={true}             // LocalStorage
    scalesPageToFit={true}              // Auto-escala
    useWebKit={true}                     // Motor WebKit (iOS)
/>
```

### Dependencias Requeridas
```json
{
  "react-native-webview": "^13.16.0",  // ✅ Ya instalado
  "expo-file-system": "^19.0.21"       // ✅ Ya instalado
}
```

## 📱 Rutas Disponibles

### Pantallas
- `/admin-dashboard` - Versión con carga desde URL
- `/admin-dashboard-inline` - Versión con HTML embebido (recomendado)

### Navegación
```typescript
// Desde cualquier pantalla
router.push('/admin-dashboard-inline');
```

## 🐛 Troubleshooting

### Problema: WebView no carga
**Solución**:
- Verificar que `react-native-webview` esté instalado
- Revisar permisos de red en `app.json`
- Usar versión inline si hay problemas de red

### Problema: HTML no se ve bien
**Solución**:
- Agregar viewport meta tag en HTML
- Usar `scalesPageToFit={true}`
- Ajustar estilos CSS para móvil

### Problema: JavaScript no funciona
**Solución**:
- Verificar `javaScriptEnabled={true}`
- Revisar console.log en WebView
- Usar `onMessage` para debugging

## 📝 Próximos Pasos

### Mejoras Sugeridas

1. **Agregar Refresh**:
   ```typescript
   const [refreshing, setRefreshing] = useState(false);

   <ScrollView refreshControl={
       <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
   }>
       <WebView ... />
   </ScrollView>
   ```

2. **Modo Pantalla Completa**:
   ```typescript
   <Stack.Screen
       options={{
           headerShown: false,  // Ocultar header
           presentation: 'fullScreenModal',
       }}
   />
   ```

3. **Compartir Dashboard**:
   ```typescript
   import * as Sharing from 'expo-sharing';

   // Botón para compartir screenshot del dashboard
   ```

4. **Actualización Automática**:
   - Cargar HTML desde URL
   - Implementar cache con expiración
   - Refrescar cada X tiempo

## 🎯 Ejemplo de Uso Completo

```typescript
// Usuario Admin hace login
const user = { role: 'admin', name: 'Admin User' };

// Ve el Home con botón de Dashboard Ejecutivo
<QuickActions>
  <ActionCard
    title="Dashboard Ejecutivo"
    icon="stats-chart"
    onPress={() => router.push('/admin-dashboard-inline')}
  />
</QuickActions>

// Click en el botón -> Abre dashboard
// Ve estado completo del proyecto:
// - 5/9 Módulos con Backend Real
// - 4/9 Módulos con Mock Data
// - 56% Backend Completado
// - 36 Pantallas implementadas
```

## 📚 Referencias

- [React Native WebView Docs](https://github.com/react-native-webview/react-native-webview/blob/master/docs/Reference.md)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Dashboard HTML Original](../docs/index.html)

---

**Última actualización**: Enero 2026
**Versión de la App**: 0.9 Beta
**Estado**: ✅ Funcional
