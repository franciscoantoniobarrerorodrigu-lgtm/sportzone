-- ============================================================
-- SPORTZONE PRO — Índices para Rendimiento
-- ============================================================

-- ─────────────────────────────────────
-- ÍNDICES: partidos
-- ─────────────────────────────────────
CREATE INDEX idx_partidos_fecha ON partidos(fecha_hora);
CREATE INDEX idx_partidos_torneo_jornada ON partidos(torneo_id, jornada);
CREATE INDEX idx_partidos_estado ON partidos(estado);
CREATE INDEX idx_partidos_equipos ON partidos(equipo_local_id, equipo_visita_id);
CREATE INDEX idx_partidos_planillero ON partidos(planillero_id) WHERE planillero_id IS NOT NULL;

COMMENT ON INDEX idx_partidos_fecha IS 'Índice para consultas por fecha';
COMMENT ON INDEX idx_partidos_torneo_jornada IS 'Índice para consultas por torneo y jornada';
COMMENT ON INDEX idx_partidos_estado IS 'Índice para filtrar por estado del partido';

-- ─────────────────────────────────────
-- ÍNDICES: eventos_partido
-- ─────────────────────────────────────
CREATE INDEX idx_eventos_partido_id ON eventos_partido(partido_id, minuto);
CREATE INDEX idx_eventos_tipo ON eventos_partido(tipo);
CREATE INDEX idx_eventos_jugador ON eventos_partido(jugador_id);
CREATE INDEX idx_eventos_created_at ON eventos_partido(created_at DESC);

COMMENT ON INDEX idx_eventos_partido_id IS 'Índice para timeline de eventos por partido';

-- ─────────────────────────────────────
-- ÍNDICES: estadisticas_jugador
-- ─────────────────────────────────────
CREATE INDEX idx_estadisticas_jugador_torneo ON estadisticas_jugador(jugador_id, torneo_id);
CREATE INDEX idx_estadisticas_goles ON estadisticas_jugador(torneo_id, goles DESC);
CREATE INDEX idx_estadisticas_asistencias ON estadisticas_jugador(torneo_id, asistencias DESC);
CREATE INDEX idx_estadisticas_tarjetas ON estadisticas_jugador(torneo_id, tarjetas_amarillas DESC, tarjetas_rojas DESC);

COMMENT ON INDEX idx_estadisticas_goles IS 'Índice para ranking de goleadores';
COMMENT ON INDEX idx_estadisticas_asistencias IS 'Índice para ranking de asistidores';

-- ─────────────────────────────────────
-- ÍNDICES: posiciones
-- ─────────────────────────────────────
CREATE INDEX idx_posiciones_torneo ON posiciones(torneo_id, puntos DESC, diferencia DESC);
CREATE INDEX idx_posiciones_equipo ON posiciones(equipo_id);

COMMENT ON INDEX idx_posiciones_torneo IS 'Índice para tabla de posiciones ordenada';

-- ─────────────────────────────────────
-- ÍNDICES: solicitudes
-- ─────────────────────────────────────
CREATE INDEX idx_solicitudes_estado_tipo ON solicitudes(estado, tipo);
CREATE INDEX idx_solicitudes_fecha ON solicitudes(created_at DESC);
CREATE INDEX idx_solicitudes_equipo ON solicitudes(equipo_id) WHERE equipo_id IS NOT NULL;

-- ─────────────────────────────────────
-- ÍNDICES: resoluciones
-- ─────────────────────────────────────
CREATE INDEX idx_resoluciones_numero ON resoluciones(numero);
CREATE INDEX idx_resoluciones_estado ON resoluciones(estado);
CREATE INDEX idx_resoluciones_fecha ON resoluciones(created_at DESC);

-- ─────────────────────────────────────
-- ÍNDICES: suspensiones
-- ─────────────────────────────────────
CREATE INDEX idx_suspensiones_jugador ON suspensiones(jugador_id, estado);
CREATE INDEX idx_suspensiones_torneo ON suspensiones(torneo_id, estado);
CREATE INDEX idx_suspensiones_activas ON suspensiones(estado) WHERE estado = 'activa';

COMMENT ON INDEX idx_suspensiones_activas IS 'Índice para consultas de suspensiones activas';

-- ─────────────────────────────────────
-- ÍNDICES: suscripciones_notificaciones
-- ─────────────────────────────────────
CREATE INDEX idx_suscripciones_user ON suscripciones_notificaciones(user_id);
CREATE INDEX idx_suscripciones_equipo ON suscripciones_notificaciones(equipo_id) WHERE equipo_id IS NOT NULL;
CREATE INDEX idx_suscripciones_partido ON suscripciones_notificaciones(partido_id) WHERE partido_id IS NOT NULL;
CREATE INDEX idx_suscripciones_activas ON suscripciones_notificaciones(activa) WHERE activa = true;

-- ─────────────────────────────────────
-- ÍNDICES: dispositivos_fcm
-- ─────────────────────────────────────
CREATE INDEX idx_dispositivos_user ON dispositivos_fcm(user_id);
CREATE INDEX idx_dispositivos_activos ON dispositivos_fcm(activo) WHERE activo = true;

-- ─────────────────────────────────────
-- ÍNDICES: jugadores
-- ─────────────────────────────────────
CREATE INDEX idx_jugadores_equipo ON jugadores(equipo_id);
CREATE INDEX idx_jugadores_activos ON jugadores(activo) WHERE activo = true;

-- ─────────────────────────────────────
-- ÍNDICES: torneos
-- ─────────────────────────────────────
CREATE INDEX idx_torneos_temporada ON torneos(temporada_id);
CREATE INDEX idx_torneos_activos ON torneos(activo) WHERE activo = true;
