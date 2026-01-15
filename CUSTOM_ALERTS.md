# Sistema de Alertas Personalizadas

## Descripción

Hemos creado un sistema de alertas personalizadas para reemplazar el `Alert.alert` nativo de React Native con un componente más moderno y consistente con la paleta de colores de la aplicación.

## Componentes

### 1. CustomAlert Component
[CustomAlert.tsx](src/components/ui/CustomAlert.tsx)

Componente visual que muestra el modal de alerta con diseño personalizado.

**Características:**
- ✅ Diseño moderno con iconos y colores de la paleta de la app
- ✅ 5 tipos de alertas: `success`, `error`, `warning`, `info`, `confirm`
- ✅ Soporte para múltiples botones con estilos diferentes
- ✅ Animaciones suaves
- ✅ Overlay semitransparente
- ✅ Responsive y adaptable

### 2. useAlert Hook
[useAlert.tsx](src/hooks/useAlert.tsx)

Hook personalizado que facilita el uso de las alertas.

## Uso

### Importar el hook

```typescript
import { useAlert } from '../../src/hooks/useAlert';
import { CustomAlert } from '../../src/components/ui/CustomAlert';

export default function MyScreen() {
    const alert = useAlert();

    // ... tu código
}
```

### Agregar el componente al render

```tsx
return (
    <View>
        {/* Tu contenido */}

        {/* Custom Alert - Siempre al final */}
        <CustomAlert
            visible={alert.visible}
            type={alert.config.type}
            title={alert.config.title}
            message={alert.config.message}
            buttons={alert.config.buttons}
            onDismiss={alert.hide}
        />
    </View>
);
```

## Métodos Disponibles

### 1. showSuccess()
Muestra una alerta de éxito con ícono verde.

```typescript
alert.showSuccess(
    'Operación Exitosa',
    'Los datos se guardaron correctamente'
);

// Con callback
alert.showSuccess(
    'Pago Exitoso',
    `Se registraron 3 semanas\nMonto: $15.00`,
    () => router.back()  // Se ejecuta al presionar OK
);
```

### 2. showError()
Muestra una alerta de error con ícono rojo.

```typescript
alert.showError(
    'Error',
    'No se pudo conectar con el servidor'
);

// Con callback
alert.showError(
    'Error al Guardar',
    error.message,
    () => console.log('Usuario cerró el error')
);
```

### 3. showWarning()
Muestra una alerta de advertencia con ícono naranja.

```typescript
alert.showWarning(
    'Atención',
    'Debes seleccionar al menos una opción'
);
```

### 4. showConfirm()
Muestra una alerta de confirmación con dos botones.

```typescript
alert.showConfirm(
    'Confirmar Acción',
    '¿Estás seguro de que deseas continuar?',
    () => {
        // Se ejecuta al confirmar
        console.log('Usuario confirmó');
    },
    () => {
        // Se ejecuta al cancelar (opcional)
        console.log('Usuario canceló');
    },
    'Sí, Continuar',  // Texto botón confirmar (opcional)
    'No'              // Texto botón cancelar (opcional)
);
```

### 5. show()
Método genérico para casos personalizados.

```typescript
alert.show(
    'Título',
    'Mensaje',
    [
        {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => console.log('Cancelado'),
        },
        {
            text: 'Opción 1',
            onPress: () => console.log('Opción 1'),
        },
        {
            text: 'Opción 2',
            style: 'destructive',
            onPress: () => console.log('Opción 2'),
        },
    ],
    'confirm'  // Tipo: success, error, warning, info, confirm
);
```

## Tipos de Alertas

### Success (Verde)
```typescript
alert.showSuccess('Título', 'Mensaje');
```
<img src="docs/alert-success.png" width="300" alt="Success Alert" />

### Error (Rojo)
```typescript
alert.showError('Título', 'Mensaje');
```
<img src="docs/alert-error.png" width="300" alt="Error Alert" />

### Warning (Naranja)
```typescript
alert.showWarning('Título', 'Mensaje');
```
<img src="docs/alert-warning.png" width="300" alt="Warning Alert" />

### Info (Azul)
```typescript
alert.show('Título', 'Mensaje', [], 'info');
```
<img src="docs/alert-info.png" width="300" alt="Info Alert" />

### Confirm (Azul con pregunta)
```typescript
alert.showConfirm('Título', 'Mensaje', onConfirm);
```
<img src="docs/alert-confirm.png" width="300" alt="Confirm Alert" />

## Estilos de Botones

Los botones tienen 3 estilos disponibles:

- **`default`**: Botón azul (acción principal)
- **`cancel`**: Botón gris (cancelar)
- **`destructive`**: Botón rojo (acciones destructivas)

```typescript
{
    text: 'Eliminar',
    style: 'destructive',
    onPress: handleDelete
}
```

## Ejemplos Prácticos

### Ejemplo 1: Confirmación de Pago
```typescript
const handlePayment = () => {
    if (selectedWeeks.length === 0) {
        alert.showWarning('Atención', 'Selecciona al menos una semana para pagar');
        return;
    }

    alert.showConfirm(
        'Confirmar Pago',
        `¿Deseas pagar ${selectedWeeks.length} semana(s) por $${amount.toFixed(2)}?`,
        async () => {
            const success = await processPayment();
            if (success) {
                alert.showSuccess('Pago Exitoso', 'El pago se procesó correctamente');
            }
        },
        undefined,
        'Confirmar',
        'Cancelar'
    );
};
```

### Ejemplo 2: Cancelar Club
```typescript
const handleCancelClub = () => {
    alert.showConfirm(
        'Cancelar Club',
        `¿Estás seguro de que deseas cancelar el club #${contractNumber}?\n\nEsta acción no se puede deshacer.`,
        async () => {
            const success = await cancelClub(clubId);
            if (success) {
                alert.showSuccess(
                    'Club Cancelado',
                    'El club ha sido cancelado exitosamente',
                    () => router.back()
                );
            }
        },
        undefined,
        'Sí, Cancelar',
        'No'
    );
};
```

### Ejemplo 3: Ejecutar Sorteo
```typescript
const handleExecute = () => {
    // Validaciones
    if (!selectedClubTypeId) {
        alert.showError('Error', 'Debes seleccionar un tipo de club');
        return;
    }

    // Confirmación
    alert.showConfirm(
        'Confirmar Sorteo',
        `¿Estás seguro de que deseas ejecutar el sorteo?\n\nNúmero ganador: ${winningNumber}`,
        async () => {
            try {
                const draw = await executeDraw({ clubTypeId, winningNumber });

                alert.show(
                    'Sorteo Ejecutado',
                    `Número ganador: ${draw.numberPlayed}\nGanadores: ${draw.totalWinners}`,
                    [
                        {
                            text: 'Volver',
                            style: 'cancel',
                            onPress: () => router.back(),
                        },
                        {
                            text: 'Ver Detalles',
                            onPress: () => router.push(`/draw/${draw.drawId}`),
                        },
                    ],
                    'success'
                );
            } catch (error) {
                alert.showError('Error', error.message);
            }
        },
        undefined,
        'Ejecutar',
        'Cancelar'
    );
};
```

## Migrando desde Alert.alert

### Antes (Alert nativo)
```typescript
import { Alert } from 'react-native';

Alert.alert('Título', 'Mensaje');

Alert.alert('Confirmar', 'Mensaje', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'OK', onPress: handleOk },
]);
```

### Después (CustomAlert)
```typescript
import { useAlert } from '../../src/hooks/useAlert';
import { CustomAlert } from '../../src/components/ui/CustomAlert';

const alert = useAlert();

alert.showSuccess('Título', 'Mensaje');

alert.showConfirm(
    'Confirmar',
    'Mensaje',
    handleOk,
    undefined,
    'OK',
    'Cancelar'
);

// Agregar al render
<CustomAlert
    visible={alert.visible}
    type={alert.config.type}
    title={alert.config.title}
    message={alert.config.message}
    buttons={alert.config.buttons}
    onDismiss={alert.hide}
/>
```

## Archivos Actualizados

Ya hemos migrado las siguientes pantallas:

1. ✅ **[club/[id].tsx](app/club/[id].tsx)** - Detalle del club
   - Confirmación de pago
   - Cancelación de club
   - Errores de pago

2. ✅ **[draw/execute.tsx](app/draw/execute.tsx)** - Ejecución de sorteos
   - Validaciones de formulario
   - Confirmación de sorteo
   - Resultado de sorteo

## Paleta de Colores

Las alertas usan la paleta de colores definida en [COLORS](src/constants/colors.ts):

- **Success**: `COLORS.status.success` (#34C759)
- **Error**: `COLORS.status.error` (#FF3B30)
- **Warning**: `COLORS.status.warning` (#FF9500)
- **Info**: `COLORS.status.info` (#007AFF)
- **Primary**: `COLORS.accent.blue` (#007AFF)

## Notas

- ✅ El componente es completamente accesible
- ✅ Funciona en iOS y Android
- ✅ Soporta modo oscuro (si se implementa)
- ✅ Las animaciones son suaves y performantes
- ✅ No requiere librerías externas adicionales
- ✅ Mantiene la API similar a Alert.alert para facilitar la migración
