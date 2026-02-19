-- ============================================================
-- SPORTZONE PRO — Partidos Adicionales para Pruebas
-- ============================================================
-- Este script agrega más partidos al cronograma para pruebas
-- Ejecutar en Supabase SQL Editor después de 12_seed_data.sql

-- ─────────────────────────────────────
-- PARTIDOS JORNADA 1
-- ─────────────────────────────────────
INSERT INTO partidos (id, torneo_id, jornada, equipo_local_id, equipo_visita_id, fecha_hora, estadio, estado)
VALUES 
  -- Tigres SC vs Halcones CF
  ('55555555-5555-5555-5555-555555555552', 
   '22222222-2222-2222-2222-222222222222', 
   1, 
   '33333333-3333-3333-3333-333333333333', 
   '33333333-3333-3333-3333-333333333334', 
   NOW() + INTERVAL '8 days', 
   'Estadio Central', 
   'programado');

-- ─────────────────────────────────────
-- PARTIDOS JORNADA 2
-- ─────────────────────────────────────
INSERT INTO partidos (id, torneo_id, jornada, equipo_local_id, equipo_visita_id, fecha_hora, estadio, estado)
VALUES 
  -- Leones United vs Águilas FC
  ('55555555-5555-5555-5555-555555555553', 
   '22222222-2222-2222-2222-222222222222', 
   2, 
   '33333333-3333-3333-3333-333333333332', 
   '33333333-3333-3333-3333-333333333331', 
   NOW() + INTERVAL '14 days', 
   'Estadio del Puerto', 
   'programado'),
  
  -- Halcones CF vs Tigres SC
  ('55555555-5555-5555-5555-555555555554', 
   '22222222-2222-2222-2222-222222222222', 
   2, 
   '33333333-3333-3333-3333-333333333334', 
   '33333333-3333-3333-3333-333333333333', 
   NOW() + INTERVAL '15 days', 
   'Estadio Sur', 
   'programado');

-- ─────────────────────────────────────
-- PARTIDOS JORNADA 3
-- ─────────────────────────────────────
INSERT INTO partidos (id, torneo_id, jornada, equipo_local_id, equipo_visita_id, fecha_hora, estadio, estado)
VALUES 
  -- Águilas FC vs Halcones CF
  ('55555555-5555-5555-5555-555555555555', 
   '22222222-2222-2222-2222-222222222222', 
   3, 
   '33333333-3333-3333-3333-333333333331', 
   '33333333-3333-3333-3333-333333333334', 
   NOW() + INTERVAL '21 days', 
   'Estadio Nacional', 
   'programado'),
  
  -- Tigres SC vs Leones United
  ('55555555-5555-5555-5555-555555555556', 
   '22222222-2222-2222-2222-222222222222', 
   3, 
   '33333333-3333-3333-3333-333333333333', 
   '33333333-3333-3333-3333-333333333332', 
   NOW() + INTERVAL '22 days', 
   'Estadio Central', 
   'programado');

-- ─────────────────────────────────────
-- PARTIDO EN VIVO (para pruebas)
-- ─────────────────────────────────────
INSERT INTO partidos (id, torneo_id, jornada, equipo_local_id, equipo_visita_id, fecha_hora, estadio, estado, goles_local, goles_visita, minuto_actual)
VALUES 
  -- Leones United vs Tigres SC (EN VIVO)
  ('55555555-5555-5555-5555-555555555557', 
   '22222222-2222-2222-2222-222222222222', 
   1, 
   '33333333-3333-3333-3333-333333333332', 
   '33333333-3333-3333-3333-333333333333', 
   NOW() - INTERVAL '30 minutes', 
   'Estadio del Puerto', 
   'en_vivo',
   1,
   0,
   35);

COMMENT ON TABLE partidos IS 'Partidos adicionales insertados para pruebas';
