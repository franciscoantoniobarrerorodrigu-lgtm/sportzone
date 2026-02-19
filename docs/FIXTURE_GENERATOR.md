# Generador Automático de Fixture - SportZone Pro

## Descripción

El Fixture Generator es un servicio que genera automáticamente el cronograma completo de partidos para un torneo usando el algoritmo **Round-Robin**. Garantiza que:

- ✅ Ningún equipo juega dos veces el mismo día
- ✅ Mínimo 3 días de separación entre partidos del mismo equipo (configurable)
- ✅ Todos los equipos se enfrentan entre sí (ida y vuelta opcional)
- ✅ Horarios asignados aleatoriamente entre slots disponibles
- ✅ Soporte para reproducibilidad con seed

## Algoritmo Round-Robin

El algoritmo Round-Robin es un método clásico para generar calendarios deportivos donde todos los equipos se enfrentan exactamente una vez (o dos veces en ida y vuelta).

### Características

- **Complejidad**: O(n²) donde n es el número de equipos
- **Jornadas**: n - 1 (donde n es el número de equipos)
- **Partidos por jornada**: n / 2
- **Total de partidos**: n × (n - 1) / 2 (ida) o n × (n - 1) (ida y vuelta)

### Ejemplo con 4 equipos

```
Jornada 1:  A vs D,  B vs C
Jornada 2:  A vs C,  D vs B
Jornada 3:  A vs B,  C vs D
```

## Endpoint API

### POST /api/fixture/generar

Genera el fixture completo para un torneo.

**Autorización**: Requiere rol `admin`

**Request Body**:

```json
{
  "torneoId": "123e4567-e89b-12d3-a456-426614174000",
  "fechaInicio": "2024-03-01T00:00:00Z",
  "horariosDisponibles": [
    "15:00:00",
    "17:00:00",
    "19:00:00"
  ],
  "diasMinimosEntrePartidos": 3,
  "idaYVuelta": true,
  "seed": 42
}
```

**Parámetros**:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `torneoId` | GUID | Sí | ID del torneo |
| `fechaInicio` | DateTime | Sí | Fecha de inicio del fixture |
| `horariosDisponibles` | TimeSpan[] | Sí | Lista de horarios disponibles (ej: 15:00, 17:00, 19:00) |
| `diasMinimosEntrePartidos` | int | No | Días mínimos entre partidos del mismo equipo (default: 3) |
| `idaYVuelta` | bool | No | Generar ida y vuelta (default: true) |
| `seed` | int? | No | Semilla para reproducibilidad (opcional) |

**Response Success (200)**:

```json
{
  "success": true,
  "message": "Fixture generado exitosamente con 12 partidos",
  "data": [
    {
      "id": "...",
      "torneoId": "...",
      "equipoLocalId": "...",
      "equipoLocalNombre": "Equipo A",
      "equipoVisitaId": "...",
      "equipoVisitaNombre": "Equipo B",
      "fechaHora": "2024-03-01T15:00:00Z",
      "jornada": 1,
      "estado": "programado",
      "golesLocal": 0,
      "golesVisita": 0
    }
  ]
}
```

**Response Error (400)**:

```json
{
  "success": false,
  "message": "Se necesitan al menos 2 equipos para generar un fixture"
}
```

### GET /api/fixture/validar-conflictos

Valida si un equipo tiene conflictos de horario en una fecha específica.

**Autorización**: Requiere rol `admin`

**Query Parameters**:

- `equipoId` (GUID): ID del equipo
- `fechaHora` (DateTime): Fecha y hora a validar

**Response**:

```json
{
  "success": true,
  "equipoId": "123e4567-e89b-12d3-a456-426614174000",
  "fechaHora": "2024-03-01T15:00:00Z",
  "sinConflictos": true,
  "message": "No hay conflictos"
}
```

## Ejemplos de Uso

### Ejemplo 1: Torneo de 8 equipos, ida y vuelta

```bash
curl -X POST http://localhost:5000/api/fixture/generar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "torneoId": "123e4567-e89b-12d3-a456-426614174000",
    "fechaInicio": "2024-03-01T00:00:00Z",
    "horariosDisponibles": ["15:00:00", "17:00:00", "19:00:00"],
    "diasMinimosEntrePartidos": 3,
    "idaYVuelta": true
  }'
```

**Resultado**:
- 8 equipos × 7 jornadas × 2 (ida y vuelta) = 56 partidos
- Duración aproximada: 14 jornadas × 3 días = 42 días

### Ejemplo 2: Torneo de 6 equipos, solo ida

```bash
curl -X POST http://localhost:5000/api/fixture/generar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "torneoId": "123e4567-e89b-12d3-a456-426614174000",
    "fechaInicio": "2024-03-01T00:00:00Z",
    "horariosDisponibles": ["16:00:00", "18:00:00"],
    "diasMinimosEntrePartidos": 7,
    "idaYVuelta": false
  }'
```

**Resultado**:
- 6 equipos × 5 jornadas = 15 partidos
- Duración aproximada: 5 jornadas × 7 días = 35 días

### Ejemplo 3: Reproducibilidad con seed

```bash
# Primera generación
curl -X POST http://localhost:5000/api/fixture/generar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "torneoId": "123e4567-e89b-12d3-a456-426614174000",
    "fechaInicio": "2024-03-01T00:00:00Z",
    "horariosDisponibles": ["15:00:00", "17:00:00"],
    "seed": 42
  }'

# Segunda generación (mismo resultado)
curl -X POST http://localhost:5000/api/fixture/generar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "torneoId": "123e4567-e89b-12d3-a456-426614174000",
    "fechaInicio": "2024-03-01T00:00:00Z",
    "horariosDisponibles": ["15:00:00", "17:00:00"],
    "seed": 42
  }'
```

**Resultado**: Ambas generaciones producen exactamente el mismo fixture.

## Validación de Conflictos

El servicio valida automáticamente que:

1. **Mismo día**: Un equipo no puede jugar dos partidos el mismo día
2. **Días mínimos**: Respeta el mínimo de días entre partidos del mismo equipo
3. **Límite de intentos**: Si no encuentra fecha válida en 365 intentos, lanza error

### Ejemplo de validación manual

```bash
curl -X GET "http://localhost:5000/api/fixture/validar-conflictos?equipoId=123e4567-e89b-12d3-a456-426614174000&fechaHora=2024-03-01T15:00:00Z" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Manejo de Equipos Impares

Si el torneo tiene un número impar de equipos, el algoritmo agrega automáticamente un equipo "fantasma" llamado "DESCANSO". Los partidos contra este equipo se omiten, lo que significa que un equipo descansa esa jornada.

**Ejemplo con 5 equipos**:

```
Jornada 1:  A vs E,  B vs D,  C descansa
Jornada 2:  A vs D,  E vs C,  B descansa
Jornada 3:  A vs C,  D vs E,  B descansa
...
```

## Consideraciones de Rendimiento

- **Tiempo de ejecución**: ~100ms para 20 equipos (ida y vuelta = 380 partidos)
- **Memoria**: O(n²) para almacenar todos los partidos
- **Base de datos**: Inserta partidos uno por uno (considerar batch insert para >100 equipos)

## Errores Comunes

### Error: "Debe proporcionar al menos un horario disponible"

**Causa**: El array `horariosDisponibles` está vacío.

**Solución**: Proporcionar al menos un horario válido.

```json
{
  "horariosDisponibles": ["15:00:00"]
}
```

### Error: "Se necesitan al menos 2 equipos para generar un fixture"

**Causa**: El torneo tiene menos de 2 equipos registrados.

**Solución**: Agregar equipos al torneo antes de generar el fixture.

### Error: "No se pudo encontrar fecha válida después de 365 intentos"

**Causa**: Las restricciones son demasiado estrictas (ej: `diasMinimosEntrePartidos` muy alto).

**Solución**: Reducir `diasMinimosEntrePartidos` o aumentar la fecha de inicio.

## Próximas Mejoras

- [ ] Soporte para restricciones de cancha (ej: cancha no disponible ciertos días)
- [ ] Soporte para restricciones de equipo (ej: equipo no puede jugar ciertos días)
- [ ] Optimización con batch insert para torneos grandes
- [ ] Soporte para torneos con múltiples zonas/grupos
- [ ] Exportación a PDF/Excel del fixture generado

## Referencias

- [Round-Robin Tournament Scheduling](https://en.wikipedia.org/wiki/Round-robin_tournament)
- [Algorithm Design Manual - Scheduling](https://www.algorist.com/)
