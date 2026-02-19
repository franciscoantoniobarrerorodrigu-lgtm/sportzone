# Shared Pipes

Este directorio contiene pipes personalizados reutilizables para la aplicación SportZone.

## MinutoPipe

Transforma segundos o minutos a formato MM:SS para mostrar el tiempo de partido.

### Uso

```typescript
import { MinutoPipe } from './shared/pipes';

// En el template
{{ 45 | minuto }}                    // "45:00" (minutos por defecto)
{{ 2730 | minuto:'seconds' }}        // "45:30" (segundos)
{{ partido.minutoActual | minuto }}  // "90:00"
```

### Parámetros

- `value`: number | null | undefined - El valor a transformar
- `unit`: 'minutes' | 'seconds' - La unidad del valor de entrada (default: 'minutes')

### Ejemplos

| Input | Unit | Output |
|-------|------|--------|
| 45 | minutes | "45:00" |
| 90 | minutes | "90:00" |
| 2730 | seconds | "45:30" |
| 0 | minutes | "00:00" |
| null | - | "00:00" |

### Manejo de Edge Cases

- `null` y `undefined` retornan "00:00"
- Números negativos retornan "00:00"
- Números decimales se procesan correctamente (45.7 minutos = "45:42")

---

## FechaPipe

Transforma fechas a formato español personalizado con múltiples opciones de formato.

### Uso

```typescript
import { FechaPipe } from './shared/pipes';

// En el template
{{ partido.fechaHora | fecha:'short' }}     // "12 ene 2025"
{{ partido.fechaHora | fecha:'medium' }}    // "12 enero 2025"
{{ partido.fechaHora | fecha:'long' }}      // "12 de enero de 2025"
{{ partido.fechaHora | fecha:'full' }}      // "Lunes, 12 de enero de 2025"
{{ partido.fechaHora | fecha:'time' }}      // "14:30"
{{ partido.fechaHora | fecha:'datetime' }}  // "12 ene 2025, 14:30"
```

### Parámetros

- `value`: Date | string | number | null | undefined - La fecha a transformar
- `format`: 'short' | 'medium' | 'long' | 'full' | 'time' | 'datetime' - El formato deseado (default: 'short')

### Formatos Disponibles

| Formato | Ejemplo | Descripción |
|---------|---------|-------------|
| short | "12 ene 2025" | Fecha corta con mes abreviado |
| medium | "12 enero 2025" | Fecha con mes completo |
| long | "12 de enero de 2025" | Fecha larga con preposiciones |
| full | "Lunes, 12 de enero de 2025" | Fecha completa con día de la semana |
| time | "14:30" | Solo hora en formato 24h |
| datetime | "12 ene 2025, 14:30" | Fecha corta + hora |

### Tipos de Input Soportados

- `Date` object: `new Date(2025, 0, 12)`
- ISO string: `"2025-01-12T14:30:00.000Z"`
- Timestamp: `1736689800000`

### Manejo de Edge Cases

- `null` y `undefined` retornan string vacío ""
- Fechas inválidas retornan string vacío ""
- Todas las fechas se formatean en español (es-ES)

---

## Importación

Ambos pipes están disponibles a través del barrel export:

```typescript
import { MinutoPipe, FechaPipe } from '@shared/pipes';

// En componentes standalone
@Component({
  selector: 'app-partido-live',
  standalone: true,
  imports: [MinutoPipe, FechaPipe],
  // ...
})
```

---

## Testing

Ambos pipes incluyen tests unitarios completos:

- `minuto.pipe.spec.ts` - 20 tests cubriendo todos los casos
- `fecha.pipe.spec.ts` - Tests para todos los formatos y edge cases

Para ejecutar los tests:

```bash
npm test -- --include='src/app/shared/pipes/*.spec.ts'
```
