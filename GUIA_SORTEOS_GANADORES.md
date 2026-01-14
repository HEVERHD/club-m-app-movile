# Guía: Cómo Probar Ganadores en los Sorteos

## Cómo Funciona el Sistema

El sistema de sorteos funciona de la siguiente manera:

1. **Cada Club tiene un número de acción (Share)** entre 0-99
2. **Cuando ejecutas un sorteo**, ingresas un número ganador (0-99)
3. **El backend busca automáticamente** todos los clubes que tienen ese número de acción
4. **Esos clubes son los ganadores** del sorteo

## Pasos para Probar un Ganador

### Método 1: Usando las Funciones de Debug (Recomendado)

1. **Abre la app** y ve a la pestaña de "Sorteos"

2. **Abre la consola del navegador/debugger** (si estás en web o usando React Native Debugger)

3. **Lista todos los clubes con sus números**:
   ```javascript
   debugDraws.listClubsWithShares()
   ```

   Esto te mostrará una tabla con todos los clubes y sus números de acción (Share).

4. **Elige un número que tenga clubes asignados**. Por ejemplo, si ves que hay clubes con Share 25, ese es un buen número para probar.

5. **Busca específicamente clubes por número** (opcional):
   ```javascript
   debugDraws.findClubsByShare(25)  // Reemplaza 25 por el número que quieras
   ```

6. **Ejecuta el sorteo** con ese número desde la UI

7. **Verifica los ganadores** en el detalle del sorteo

### Método 2: Revisando la Base de Datos Manualmente

Si tienes acceso directo a los datos:

1. Ve a la sección de **Clientes**
2. Abre un cliente
3. Revisa sus clubes
4. Busca el campo **"Acción"** o **"Share"** - ese es el número
5. Ejecuta un sorteo con ese número

### Método 3: Crear un Club de Prueba con Número Conocido

1. **Crea un nuevo club** para un cliente
2. **Asigna un número de acción específico** (ej: 77)
3. **Guarda el club**
4. **Ejecuta un sorteo** con el número 77
5. **Ese club debería ser el ganador**

## Ejemplo Completo

### Escenario:
Tienes 3 clubes:
- Club A → Share: 25
- Club B → Share: 25
- Club C → Share: 50

### Prueba 1: Sorteo con número 25
```
Ejecutas sorteo con número ganador: 25
Resultado: 2 ganadores (Club A y Club B)
```

### Prueba 2: Sorteo con número 50
```
Ejecutas sorteo con número ganador: 50
Resultado: 1 ganador (Club C)
```

### Prueba 3: Sorteo con número 99
```
Ejecutas sorteo con número ganador: 99
Resultado: 0 ganadores (ningún club tiene ese número)
```

## Verificar Ganadores

Una vez ejecutado el sorteo:

1. **En la lista de sorteos**, verás el número ganador en la card
2. **Abre el detalle del sorteo** (tap en la card)
3. **Deberías ver la sección "Ganadores"** con:
   - Nombre del cliente
   - Número de contrato
   - Número de acción (Share)
   - Monto del premio
   - Estado (notificado/reclamado)

## Notas Importantes

⚠️ **Endpoint de Ganadores Pendiente**: Actualmente el endpoint `/Draw/Winners/{drawId}` aún no está disponible en el backend. Por eso la sección de ganadores puede aparecer vacía.

Los ganadores se determinan en el backend cuando ejecutas el sorteo, pero necesitamos que el backend implemente el endpoint para poder mostrarlos en la app.

## Qué Hacer Si No Ves Ganadores

Si ejecutas un sorteo con un número que sabes que tiene clubes asignados, pero no ves ganadores:

1. **Verifica que el endpoint de ganadores esté implementado** en el backend
2. **Revisa los logs del backend** para confirmar que encontró los clubes
3. **Consulta con el equipo de backend** sobre el endpoint:
   ```
   GET /mdl05/Draw/Winners/{drawId}
   ```

## Script SQL para Verificar (Si Tienes Acceso a DB)

Si tienes acceso directo a la base de datos:

```sql
-- Ver todos los clubes con sus números de acción
SELECT
    ClubId,
    ContractNumber,
    CustomerName,
    Share,
    ClubTypeName
FROM Clubs
WHERE Active = 1
ORDER BY Share;

-- Ver clubes con un número específico
SELECT * FROM Clubs
WHERE Share = 25
AND Active = 1;

-- Ver ganadores de un sorteo específico
SELECT * FROM DrawWinners
WHERE DrawId = 'ID-DEL-SORTEO';
```

## Funciones de Debug Disponibles

Una vez cargada la app, estas funciones están disponibles en la consola:

```javascript
// Listar todos los clubes con sus números
debugDraws.listClubsWithShares()

// Buscar clubes por número específico
debugDraws.findClubsByShare(número)

// Ejemplo:
debugDraws.findClubsByShare(25)  // Muestra todos los clubes con Share 25
```

## Próximos Pasos

Una vez que el endpoint de ganadores esté disponible:
- [ ] Los ganadores se mostrarán automáticamente en el detalle del sorteo
- [ ] Podrás marcar ganadores como "Notificados"
- [ ] Podrás marcar premios como "Reclamados"
- [ ] Verás estadísticas de premios por sorteo
