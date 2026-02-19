-- ============================================================
-- SPORTZONE PRO — Vistas
-- ============================================================

-- ─────────────────────────────────────
-- VISTA: v_goleadores
-- ─────────────────────────────────────
CREATE OR REPLACE VIEW v_goleadores AS
SELECT
  j.id,
  j.nombre || ' ' || j.apellido AS nombre_completo,
  j.numero_camiseta,
  j.posicion,
  j.nacionalidad,
  j.foto_url,
  e.nombre AS equipo,
  e.escudo_url,
  e.color_primario,
  ej.goles,
  ej.asistencias,
  ej.tarjetas_amarillas,
  ej.tarjetas_rojas,
  ej.partidos_jugados,
  t.nombre AS torneo,
  t.id AS torneo_id
FROM estadisticas_jugador ej
JOIN jugadores j ON j.id = ej.jugador_id
JOIN equipos e   ON e.id = j.equipo_id
JOIN torneos t   ON t.id = ej.torneo_id
WHERE j.activo = true
ORDER BY ej.goles DESC, ej.asistencias DESC;

COMMENT ON VIEW v_goleadores IS 'Vista de goleadores con información completa';

-- ─────────────────────────────────────
-- VISTA: v_tabla_posiciones
-- ─────────────────────────────────────
CREATE OR REPLACE VIEW v_tabla_posiciones AS
SELECT
  ROW_NUMBER() OVER (
    PARTITION BY p.torneo_id 
    ORDER BY p.puntos DESC, p.diferencia DESC, p.gf DESC
  ) AS posicion,
  p.id,
  p.torneo_id,
  p.equipo_id,
  p.pj,
  p.pg,
  p.pe,
  p.pp,
  p.gf,
  p.gc,
  p.puntos,
  p.diferencia,
  p.ultima_actualizacion,
  e.nombre AS equipo_nombre,
  e.abreviatura,
  e.escudo_url,
  e.color_primario,
  t.nombre AS torneo_nombre
FROM posiciones p
JOIN equipos e ON e.id = p.equipo_id
JOIN torneos t ON t.id = p.torneo_id
WHERE t.activo = true;

COMMENT ON VIEW v_tabla_posiciones IS 'Vista de tabla de posiciones ordenada con información completa';

-- ─────────────────────────────────────
-- VISTA: v_partidos_completos
-- ─────────────────────────────────────
CREATE OR REPLACE VIEW v_partidos_completos AS
SELECT
  p.id,
  p.torneo_id,
  p.jornada,
  p.fecha_hora,
  p.estadio,
  p.goles_local,
  p.goles_visita,
  p.estado,
  p.minuto_actual,
  el.id AS equipo_local_id,
  el.nombre AS equipo_local_nombre,
  el.abreviatura AS equipo_local_abreviatura,
  el.escudo_url AS equipo_local_escudo,
  ev.id AS equipo_visita_id,
  ev.nombre AS equipo_visita_nombre,
  ev.abreviatura AS equipo_visita_abreviatura,
  ev.escudo_url AS equipo_visita_escudo,
  t.nombre AS torneo_nombre,
  p.created_at
FROM partidos p
JOIN equipos el ON el.id = p.equipo_local_id
JOIN equipos ev ON ev.id = p.equipo_visita_id
JOIN torneos t ON t.id = p.torneo_id;

COMMENT ON VIEW v_partidos_completos IS 'Vista de partidos con información completa de equipos';
