# Test de Goleadores - SportZone Pro

## Objetivo
Verificar que la carga y visualización del ranking de goleadores funciona correctamente.

## Pre-requisitos

### 1. Datos de Prueba en Base de Datos
```sql
-- Insertar estadísticas de jugadores
INSERT INTO estadisticas_jugador (jugador_id, torneo_id, goles, asistencias, tarjetas_amarillas, tarjetas_rojas, partidos_jugados)
SELECT 
  j.id,
  t.id,
  FLOOR(RANDOM() * 20 + 1)::INT,  -- goles entre 1-20
  FLOOR(RANDOM() * 10 + 1)::INT,  -- asistencias entre 1-10
  FLOOR(RANDOM() * 5)::INT,        -- amarillas entre 0-5
  FLOOR(RANDOM() * 2)::INT,        -- rojas entre 0-2
  10
FROM jugadores j
CROSS JOIN torneos t
WHERE t.nombre = 'Liga Pro 2024/2025'
LIMIT 20;
```

## Casos de Prueba

### Test 1: Endpoint Backend - GET /api/goleadores/{torneoId}
**URL**: `http://localhost:5000/api/goleadores/{torneoId}`

**Resultado Esperado**:
```json
[
  {
    "jugadorId": "uuid",
    "jugadorNombre": "Juan Pérez",
    "equipoNombre": "Real Madrid",
    "goles": 18,
    "asistencias": 8,
    "tarjetasAmarillas": 3,
    "tarjetasRojas": 0,
    "fotoUrl": null,
    "escudoUrl": "url-escudo"
  }
]
```

**Verificar**:
- ✅ Status 200
- ✅ Array ordenado por goles DESC
- ✅ Incluye datos del jugador y equipo

### Test 2: Frontend - Tabs de Estadísticas
**Pasos**:
1. Navegar a `/goleadores`
2. Click en cada tab

**Verificar**:
- ✅ Tab "Goleadores" muestra jugadores ordenados por goles
- ✅ Tab "Asistencias" muestra jugadores ordenados por asistencias
- ✅ Tab "Tarjetas Amarillas" muestra jugadores con más amarillas
- ✅ Tab "Tarjetas Rojas" muestra jugadores con más rojas
- ✅ Tab activa tiene estilo diferente

### Test 3: Frontend - Medallas Top 3
**Verificar**:
- ✅ Posición 1 tiene medalla oro (#FFD700)
- ✅ Posición 2 tiene medalla plata (#C0C0C0)
- ✅ Posición 3 tiene medalla bronce (#CD7F32)
- ✅ Medallas tienen sombra y gradiente

### Test 4: Frontend - Barra de Progreso
**Verificar**:
- ✅ Líder tiene barra al 100%
- ✅ Otros jugadores tienen barra proporcional
- ✅ Barra tiene gradiente azul
- ✅ Animación suave al cambiar de tab

### Test 5: Frontend - Responsive
**Pasos**:
1. Cambiar a vista móvil (375px)

**Verificar**:
- ✅ Cards se adaptan a pantalla pequeña
- ✅ Estadística se mueve debajo
- ✅ Tabs se ajustan en múltiples líneas

## Checklist

- [ ] Endpoint retorna goleadores ordenados
- [ ] Tabs funcionan correctamente
- [ ] Medallas top 3 se muestran
- [ ] Barras de progreso proporcionales
- [ ] Responsive en móvil

## Resultado

**Fecha**: _________________
**Estado**: ⬜ PASS | ⬜ FAIL

