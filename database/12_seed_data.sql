-- ============================================================
-- SPORTZONE PRO — Datos de Prueba (Seed Data)
-- ============================================================

-- ─────────────────────────────────────
-- TEMPORADA Y TORNEO DE PRUEBA
-- ─────────────────────────────────────
INSERT INTO temporadas (id, nombre, fecha_inicio, fecha_fin, activa)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '2024/2025', '2024-08-01', '2025-05-31', true);

INSERT INTO torneos (id, temporada_id, nombre, tipo, total_jornadas, activo)
VALUES 
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Liga Pro 2024/2025', 'liga', 30, true);

-- ─────────────────────────────────────
-- EQUIPOS DE PRUEBA
-- ─────────────────────────────────────
INSERT INTO equipos (id, nombre, abreviatura, ciudad, estadio, color_primario, color_secundario, activo)
VALUES 
  ('33333333-3333-3333-3333-333333333331', 'Águilas FC', 'AGU', 'Ciudad Capital', 'Estadio Nacional', '#FF0000', '#FFFFFF', true),
  ('33333333-3333-3333-3333-333333333332', 'Leones United', 'LEO', 'Puerto Norte', 'Estadio del Puerto', '#0000FF', '#FFFF00', true),
  ('33333333-3333-3333-3333-333333333333', 'Tigres SC', 'TIG', 'Villa Central', 'Estadio Central', '#FFA500', '#000000', true),
  ('33333333-3333-3333-3333-333333333334', 'Halcones CF', 'HAL', 'Ciudad Sur', 'Estadio Sur', '#008000', '#FFFFFF', true);

-- ─────────────────────────────────────
-- JUGADORES DE PRUEBA (Águilas FC)
-- ─────────────────────────────────────
INSERT INTO jugadores (id, equipo_id, nombre, apellido, numero_camiseta, posicion, nacionalidad, activo)
VALUES 
  ('44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333331', 'Carlos', 'Rodríguez', 1, 'Portero', 'Nacional', true),
  ('44444444-4444-4444-4444-444444444442', '33333333-3333-3333-3333-333333333331', 'Miguel', 'Fernández', 10, 'Delantero', 'Nacional', true),
  ('44444444-4444-4444-4444-444444444443', '33333333-3333-3333-3333-333333333331', 'Juan', 'Martínez', 7, 'Mediocampista', 'Nacional', true);

-- ─────────────────────────────────────
-- JUGADORES DE PRUEBA (Leones United)
-- ─────────────────────────────────────
INSERT INTO jugadores (id, equipo_id, nombre, apellido, numero_camiseta, posicion, nacionalidad, activo)
VALUES 
  ('44444444-4444-4444-4444-444444444451', '33333333-3333-3333-3333-333333333332', 'Pedro', 'González', 1, 'Portero', 'Nacional', true),
  ('44444444-4444-4444-4444-444444444452', '33333333-3333-3333-3333-333333333332', 'Luis', 'Sánchez', 9, 'Delantero', 'Nacional', true),
  ('44444444-4444-4444-4444-444444444453', '33333333-3333-3333-3333-333333333332', 'Diego', 'López', 8, 'Mediocampista', 'Nacional', true);

-- ─────────────────────────────────────
-- POSICIONES INICIALES
-- ─────────────────────────────────────
INSERT INTO posiciones (torneo_id, equipo_id, pj, pg, pe, pp, gf, gc)
VALUES 
  ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333331', 0, 0, 0, 0, 0, 0),
  ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333332', 0, 0, 0, 0, 0, 0),
  ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 0, 0, 0, 0, 0, 0),
  ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333334', 0, 0, 0, 0, 0, 0);

-- ─────────────────────────────────────
-- ESTADÍSTICAS INICIALES
-- ─────────────────────────────────────
INSERT INTO estadisticas_jugador (jugador_id, torneo_id, goles, asistencias, tarjetas_amarillas, tarjetas_rojas, partidos_jugados)
VALUES 
  ('44444444-4444-4444-4444-444444444442', '22222222-2222-2222-2222-222222222222', 0, 0, 0, 0, 0),
  ('44444444-4444-4444-4444-444444444443', '22222222-2222-2222-2222-222222222222', 0, 0, 0, 0, 0),
  ('44444444-4444-4444-4444-444444444452', '22222222-2222-2222-2222-222222222222', 0, 0, 0, 0, 0),
  ('44444444-4444-4444-4444-444444444453', '22222222-2222-2222-2222-222222222222', 0, 0, 0, 0, 0);

-- ─────────────────────────────────────
-- PARTIDO DE PRUEBA
-- ─────────────────────────────────────
INSERT INTO partidos (id, torneo_id, jornada, equipo_local_id, equipo_visita_id, fecha_hora, estadio, estado)
VALUES 
  ('55555555-5555-5555-5555-555555555551', 
   '22222222-2222-2222-2222-222222222222', 
   1, 
   '33333333-3333-3333-3333-333333333331', 
   '33333333-3333-3333-3333-333333333332', 
   NOW() + INTERVAL '7 days', 
   'Estadio Nacional', 
   'programado');

COMMENT ON TABLE temporadas IS 'Datos de prueba insertados';
