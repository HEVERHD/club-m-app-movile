# Optimización de Carga de Clubes + Campo de Búsqueda

## Problema

La carga de clubes sin filtro (`Status: null`) es muy lenta porque el backend debe procesar todos los registros históricos.

## Solución Implementada

1. **Carga inicial optimizada**: Usa el filtro `Status: "Vencido"` por defecto (carga rápida)
2. **Búsqueda inteligente**: Cuando hay búsqueda activa, usa `Status: null` para buscar en TODOS los clubes
3. **Campo de búsqueda**: Permite buscar por cédula, nombre, contrato, etc.

### Cambios Realizados:

#### 1. [useClubs.ts](src/hooks/useClubs.ts#L31-L47)
Agregada lógica para usar "Vencido" como status por defecto cuando no se especifica ningún filtro:

```typescript
export function useClubs(filters: ClubFilters = {}, page = 1, pageSize = 20) {
    // Optimización: Si no hay filtros específicos, usar "Vencido" por defecto para cargar más rápido
    const optimizedFilters: ClubFilters = {
        ...filters,
        // Si no hay status definido, usar "Vencido" para mejor rendimiento
        status: filters.status !== undefined ? filters.status : 'Vencido',
    };

    return useQuery({
        queryKey: clubKeys.list(optimizedFilters, page, pageSize),
        queryFn: () => clubApi.getClubs(optimizedFilters, page, pageSize),
        // ...
    });
}
```

#### 2. [ClubFilters.tsx](src/components/clubs/ClubFilters.tsx#L18-L23)
Actualizado el orden de opciones de filtro y agregadas etiquetas descriptivas:

```typescript
const STATUS_OPTIONS: FilterOption[] = [
    { key: 'Vencido', label: 'Vencidos (rápido)', color: COLORS.accent.orange }, // Por defecto
    { key: 'Activo', label: 'Activos', color: COLORS.accent.green },
    { key: undefined, label: 'Todos (lento)', color: COLORS.text.muted },
    { key: 'Anulado', label: 'Anulados', color: COLORS.status.error },
];
```

#### 3. [clubs.tsx](app/(tabs)/clubs.tsx#L17-L19)
Inicializado el estado con el filtro "Vencido":

```typescript
export default function ClubsScreen() {
    // Inicializar con "Vencido" para carga más rápida
    const [filters, setFilters] = useState<IClubFilters>({ status: 'Vencido' });
    // ...
}
```

## Beneficios

1. **Carga mucho más rápida** al abrir la pantalla de Clubes
2. **Mejor experiencia de usuario** - menos tiempo de espera
3. **Indicadores claros** - etiquetas "(rápido)" y "(lento)" para guiar al usuario
4. **Flexibilidad mantenida** - el usuario puede cambiar a "Todos" si lo necesita

## Uso

Al abrir la pantalla de Clubes:
- Por defecto verás clubes con status "Vencido" (carga rápida)
- Puedes cambiar a "Activos" o "Anulados" según necesites
- Si necesitas ver TODOS los clubes, selecciona "Todos (lento)" - toma más tiempo

## Notas Técnicas

- El filtro por status se aplica en el payload al backend:
  ```json
  {
    "SearchText": "",
    "PageNumber": 1,
    "PageSize": 100,
    "Status": "Vencido"  // ← Este filtro mejora el rendimiento
  }
  ```

- El sistema de cache de 5 minutos se mantiene activo
- React Query maneja el cacheo adicional de las consultas
- La paginación continúa funcionando normalmente
