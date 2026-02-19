# Test de Tabla de Posiciones - SportZone Pro

## Objetivo
Verificar que la carga y visualización de la tabla de posiciones funciona correctamente desde el backend hasta el frontend.

## Pre-requisitos

### 1. Base de Datos con Datos de Prueba
Ejecutar en SQL Editor de Supabase:

```sql
-- Crear temporada de prueba
INSERT INTO temporadas (id, nombre, fecha_inicio, fecha_fin, activa)
VALUES 
  (gen_random_uuid(), '2024/2025', '2024-08-01', '2025-05-31', true);

-- Crear torneo de prueba
INSERT INTO torneos (id, temporada_id, nombre, tipo, total_jornadas, activo)
SELECT 
  gen_random_uuid(),
  id,
  'Liga Pro 2024/2025',
  'liga',
  30,
  true
FROM temporadas WHERE nombre = '2024/2025';

-- Crear equipos de prueba
INSERT INTO equipos (id, nombre, abreviatura, ciudad, estadio, activo)
VALUES
  (gen_random_uuid(), 'Real Madrid', 'RMA', 'Madrid', 'Santiago Bernabéu', true),
  (gen_random_uuid(), 'FC Barcelona', 'BAR', 'Barcelona', 'Camp Nou', true),
  (gen_random_uuid(), 'Atlético Madrid', 'ATM', 'Madrid', 'Wanda Metropolitano', true),
  (gen_random_uuid(), 'Sevilla FC', 'SEV', 'Sevilla', 'Ramón Sánchez-Pizjuán', true),
  (gen_random_uuid(), 'Valencia CF', 'VAL', 'Valencia', 'Mestalla', true),
  (gen_random_uuid(), 'Real Betis', 'BET', 'Sevilla', 'Benito Villamarín', true);

-- Crear posiciones de prueba
INSERT INTO posiciones (torneo_id, equipo_id, pj, pg, pe, pp, gf, gc)
SELECT 
  t.id,
  e.id,
  CASE e.nombre
    WHEN 'Real Madrid' THEN 10
    WHEN 'FC Barcelona' THEN 10
    WHEN 'Atlético Madrid' THEN 10
    WHEN 'Sevilla FC' THEN 10
    WHEN 'Valencia CF' THEN 10
    WHEN 'Real Betis' THEN 10
  END,
  CASE e.nombre
    WHEN 'Real Madrid' THEN 8
    WHEN 'FC Barcelona' THEN 7
    WHEN 'Atlético Madrid' THEN 6
    WHEN 'Sevilla FC' THEN 4
    WHEN 'Valencia CF' THEN 3
    WHEN 'Real Betis' THEN 2
  END,
  CASE e.nombre
    WHEN 'Real Madrid' THEN 1
    WHEN 'FC Barcelona' THEN 2
    WHEN 'Atlético Madrid' THEN 2
    WHEN 'Sevilla FC' THEN 3
    WHEN 'Valencia CF' THEN 2
    WHEN 'Real Betis' THEN 3
  END,
  CASE e.nombre
    WHEN 'Real Madrid' THEN 1
    WHEN 'FC Barcelona' THEN 1
    WHEN 'Atlético Madrid' THEN 2
    WHEN 'Sevilla FC' THEN 3
    WHEN 'Valencia CF' THEN 5
    WHEN 'Real Betis' THEN 5
  END,
  CASE e.nombre
    WHEN 'Real Madrid' THEN 28
    WHEN 'FC Barcelona' THEN 25
    WHEN 'Atlético Madrid' THEN 20
    WHEN 'Sevilla FC' THEN 18
    WHEN 'Valencia CF' THEN 12
    WHEN 'Real Betis' THEN 10
  END,
  CASE e.nombre
    WHEN 'Real Madrid' THEN 8
    WHEN 'FC Barcelona' THEN 10
    WHEN 'Atlético Madrid' THEN 12
    WHEN 'Sevilla FC' THEN 15
    WHEN 'Valencia CF' THEN 20
    WHEN 'Real Betis' THEN 22
  END
FROM torneos t
CROSS JOIN equipos e
WHERE t.nombre = 'Liga Pro 2024/2025';
```

### 2. Backend y Frontend Corriendo
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:4200`

## Casos de Prueba

### Test 1: Endpoint Backend - GET /api/liga/torneos
**Método**: GET  
**URL**: `http://localhost:5000/api/liga/torneos`  
**Headers**: Ninguno (endpoint público)

**Resultado Esperado**:
```json
[
  {
    "id": "uuid-del-torneo",
    "nombre": "Liga Pro 2024/2025",
    "tipo": "liga",
    "totalJornadas": 30,
    "activo": true,
    "temporadaNombre": "2024/2025"
  }
]
```

**Verificar**:
- ✅ Status code: 200
- ✅ Array con al menos 1 torneo
- ✅ Cada torneo tiene id, nombre, tipo, activo

### Test 2: Endpoint Backend - GET /api/liga/posiciones/{torneoId}
**Método**: GET  
**URL**: `http://localhost:5000/api/liga/posiciones/{torneoId}`  
**Headers**: Ninguno (endpoint público)

**Resultado Esperado**:
```json
[
  {
    "posicion": 1,
    "id": "uuid-posicion",
    "equipoNombre": "Real Madrid",
    "abreviatura": "RMA",
    "escudoUrl": null,
    "partidosJugados": 10,
    "partidosGanados": 8,
    "partidosEmpatados": 1,
    "partidosPerdidos": 1,
    "golesFavor": 28,
    "golesContra": 8,
    "diferencia": 20,
    "puntos": 25
  },
  ...
]
```

**Verificar**:
- ✅ Status code: 200
- ✅ Array ordenado por puntos (descendente)
- ✅ Posiciones numeradas correctamente (1, 2, 3...)
- ✅ Puntos calculados correctamente (PG*3 + PE)
- ✅ Diferencia calculada correctamente (GF - GC)

### Test 3: Frontend - Carga de Tabla en Dashboard
**Pasos**:
1. Navegar a `http://localhost:4200/dashboard`
2. Observar la sección de tabla de posiciones

**Resultado Esperado**:
- ✅ Se muestra spinner de carga inicialmente
- ✅ Tabla se carga sin errores
- ✅ Se muestran todos los equipos
- ✅ Columnas visibles: POS, EQUIPO, PJ, PG, PE, PP, GF, GC, DIF, PTS
- ✅ Datos coinciden con los del backend

### Test 4: Frontend - Zona de Clasificación
**Pasos**:
1. Navegar a tabla de posiciones
2. Observar los primeros 4 equipos

**Resultado Esperado**:
- ✅ Los primeros 4 equipos tienen borde izquierdo azul cian (#00D4FF)
- ✅ Fondo ligeramente azul
- ✅ Leyenda muestra "Zona de Clasificación" en azul

### Test 5: Frontend - Zona de Descenso
**Pasos**:
1. Navegar a tabla de posiciones
2. Observar los últimos 3 equipos

**Resultado Esperado**:
- ✅ Los últimos 3 equipos tienen borde izquierdo rojo (#FF2D55)
- ✅ Fondo ligeramente rojo
- ✅ Leyenda muestra "Zona de Descenso" en rojo

### Test 6: Frontend - Diferencia de Goles con Color
**Pasos**:
1. Observar la columna DIF

**Resultado Esperado**:
- ✅ Diferencias positivas (+20, +15) en color azul cian
- ✅ Diferencias negativas (-5, -12) en color rojo
- ✅ Signo + visible en diferencias positivas

### Test 7: Frontend - Puntos Destacados
**Pasos**:
1. Observar la columna PTS

**Resultado Esperado**:
- ✅ Puntos en badge con gradiente azul
- ✅ Fuente Bebas Neue, tamaño grande
- ✅ Fácilmente legible

### Test 8: Frontend - Responsive en Móvil
**Pasos**:
1. Abrir DevTools (F12)
2. Cambiar a vista móvil (375px)
3. Observar tabla

**Resultado Esperado**:
- ✅ Tabla tiene scroll horizontal
- ✅ Nombres de equipos se ocultan
- ✅ Abreviaturas se muestran (RMA, BAR, etc.)
- ✅ Leyenda en columna vertical

### Test 9: Frontend - Hover en Filas
**Pasos**:
1. Pasar mouse sobre cada fila de equipo

**Resultado Esperado**:
- ✅ Fila cambia de color al hacer hover
- ✅ Transición suave
- ✅ Cursor normal (no pointer)

### Test 10: Frontend - Estado Vacío
**Pasos**:
1. Modificar código para simular torneo sin posiciones
2. Recargar página

**Resultado Esperado**:
- ✅ Se muestra mensaje "No hay datos de posiciones disponibles"
- ✅ Borde punteado
- ✅ No hay errores en consola

### Test 11: Frontend - Manejo de Errores
**Pasos**:
1. Detener el backend
2. Recargar página con tabla de posiciones

**Resultado Esperado**:
- ✅ Se muestra mensaje de error apropiado
- ✅ No se rompe la aplicación
- ✅ Error se registra en consola

### Test 12: Integración - Actualización Automática
**Pasos**:
1. Tener tabla de posiciones abierta
2. En SQL Editor, actualizar puntos de un equipo:
```sql
UPDATE posiciones 
SET pg = 9, pe = 1, pp = 0
WHERE equipo_id = (SELECT id FROM equipos WHERE nombre = 'Real Madrid' LIMIT 1);
```
3. Refrescar página

**Resultado Esperado**:
- ✅ Tabla se actualiza con nuevos datos
- ✅ Orden de equipos se recalcula
- ✅ Puntos reflejan el cambio

## Verificación con DevTools

### Network Tab
1. Abrir DevTools > Network
2. Recargar página con tabla
3. Buscar request a `/api/liga/posiciones/{torneoId}`

**Verificar**:
- ✅ Status: 200 OK
- ✅ Response time < 500ms
- ✅ Response size razonable
- ✅ Content-Type: application/json

### Console Tab
**Verificar**:
- ✅ No hay errores en rojo
- ✅ No hay warnings críticos
- ✅ Logs de carga de datos (si están habilitados)

## Pruebas de Rendimiento

### Test 13: Tabla con Muchos Equipos
**Pasos**:
1. Insertar 20 equipos en la base de datos
2. Crear posiciones para todos
3. Cargar tabla

**Resultado Esperado**:
- ✅ Tabla carga en < 1 segundo
- ✅ Scroll suave
- ✅ No hay lag al hacer hover

### Test 14: Múltiples Cargas Consecutivas
**Pasos**:
1. Recargar página 5 veces seguidas
2. Observar tiempos de carga

**Resultado Esperado**:
- ✅ Cada carga toma tiempo similar
- ✅ No hay memory leaks
- ✅ No hay requests duplicados

## Checklist de Verificación

- [ ] Endpoint `/api/liga/torneos` retorna torneos activos
- [ ] Endpoint `/api/liga/posiciones/{torneoId}` retorna posiciones ordenadas
- [ ] Frontend carga tabla sin errores
- [ ] Zona de clasificación (top 4) resaltada en azul
- [ ] Zona de descenso (últimos 3) resaltada en rojo
- [ ] Diferencia de goles con colores (positivo=azul, negativo=rojo)
- [ ] Puntos destacados en badge azul
- [ ] Responsive en móvil (scroll horizontal, abreviaturas)
- [ ] Hover en filas funciona
- [ ] Estado vacío se muestra correctamente
- [ ] Manejo de errores apropiado
- [ ] Actualización de datos funciona

## Problemas Comunes

### Error: "Cannot read property 'length' of undefined"
**Solución**: Verificar que el backend está retornando un array, no un objeto con `{success, data}`

### Tabla no se ordena correctamente
**Solución**: Verificar que el backend ordena por puntos DESC, diferencia DESC, golesFavor DESC

### Zona de clasificación/descenso no se resalta
**Solución**: Verificar que `esZonaClasificacion()` y `esZonaDescenso()` usan el número correcto de equipos

### Nombres de equipos no se muestran
**Solución**: Verificar que el backend está haciendo JOIN con tabla equipos y retornando `equipoNombre`

## Resultado del Test

**Fecha**: _________________

**Tester**: _________________

**Estado**: ⬜ PASS | ⬜ FAIL

**Notas**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

