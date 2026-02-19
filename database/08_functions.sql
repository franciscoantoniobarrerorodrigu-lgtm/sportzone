-- ============================================================
-- SPORTZONE PRO — Funciones y Triggers
-- ============================================================

-- ─────────────────────────────────────
-- FUNCIÓN: update_updated_at
-- ─────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at IS 'Actualiza automáticamente el campo updated_at';

-- Trigger para solicitudes
CREATE TRIGGER trg_solicitudes_updated
  BEFORE UPDATE ON solicitudes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Trigger para dispositivos_fcm
CREATE TRIGGER trg_dispositivos_fcm_updated
  BEFORE UPDATE ON dispositivos_fcm
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────
-- FUNCIÓN: fn_actualizar_posiciones
-- ─────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_actualizar_posiciones(p_partido_id UUID)
RETURNS void AS $$
DECLARE
  v_partido partidos%ROWTYPE;
  v_resultado_local VARCHAR(1);
  v_resultado_visita VARCHAR(1);
BEGIN
  -- Obtener datos del partido
  SELECT * INTO v_partido FROM partidos WHERE id = p_partido_id;

  -- Validar que el partido esté finalizado
  IF v_partido.estado != 'finalizado' THEN
    RAISE EXCEPTION 'El partido no está finalizado';
  END IF;

  -- Determinar resultado
  IF v_partido.goles_local > v_partido.goles_visita THEN
    v_resultado_local := 'V';  -- Victoria
    v_resultado_visita := 'D'; -- Derrota
  ELSIF v_partido.goles_local < v_partido.goles_visita THEN
    v_resultado_local := 'D';
    v_resultado_visita := 'V';
  ELSE
    v_resultado_local := 'E';  -- Empate
    v_resultado_visita := 'E';
  END IF;

  -- Actualizar equipo local
  INSERT INTO posiciones (torneo_id, equipo_id, pj, pg, pe, pp, gf, gc)
  VALUES (
    v_partido.torneo_id,
    v_partido.equipo_local_id,
    1,
    CASE WHEN v_resultado_local = 'V' THEN 1 ELSE 0 END,
    CASE WHEN v_resultado_local = 'E' THEN 1 ELSE 0 END,
    CASE WHEN v_resultado_local = 'D' THEN 1 ELSE 0 END,
    v_partido.goles_local,
    v_partido.goles_visita
  )
  ON CONFLICT (torneo_id, equipo_id) DO UPDATE SET
    pj = posiciones.pj + 1,
    pg = posiciones.pg + CASE WHEN v_resultado_local = 'V' THEN 1 ELSE 0 END,
    pe = posiciones.pe + CASE WHEN v_resultado_local = 'E' THEN 1 ELSE 0 END,
    pp = posiciones.pp + CASE WHEN v_resultado_local = 'D' THEN 1 ELSE 0 END,
    gf = posiciones.gf + v_partido.goles_local,
    gc = posiciones.gc + v_partido.goles_visita,
    ultima_actualizacion = NOW();

  -- Actualizar equipo visita
  INSERT INTO posiciones (torneo_id, equipo_id, pj, pg, pe, pp, gf, gc)
  VALUES (
    v_partido.torneo_id,
    v_partido.equipo_visita_id,
    1,
    CASE WHEN v_resultado_visita = 'V' THEN 1 ELSE 0 END,
    CASE WHEN v_resultado_visita = 'E' THEN 1 ELSE 0 END,
    CASE WHEN v_resultado_visita = 'D' THEN 1 ELSE 0 END,
    v_partido.goles_visita,
    v_partido.goles_local
  )
  ON CONFLICT (torneo_id, equipo_id) DO UPDATE SET
    pj = posiciones.pj + 1,
    pg = posiciones.pg + CASE WHEN v_resultado_visita = 'V' THEN 1 ELSE 0 END,
    pe = posiciones.pe + CASE WHEN v_resultado_visita = 'E' THEN 1 ELSE 0 END,
    pp = posiciones.pp + CASE WHEN v_resultado_visita = 'D' THEN 1 ELSE 0 END,
    gf = posiciones.gf + v_partido.goles_visita,
    gc = posiciones.gc + v_partido.goles_local,
    ultima_actualizacion = NOW();

  RAISE NOTICE 'Posiciones actualizadas para partido %', p_partido_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_actualizar_posiciones IS 'Actualiza la tabla de posiciones al finalizar un partido';

-- ─────────────────────────────────────
-- FUNCIÓN: fn_verificar_suspensiones
-- ─────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_verificar_suspensiones(p_jugador_id UUID, p_torneo_id UUID)
RETURNS void AS $$
DECLARE
  v_amarillas INT;
  v_rojas INT;
BEGIN
  -- Contar tarjetas del jugador en el torneo
  SELECT 
    COALESCE(tarjetas_amarillas, 0),
    COALESCE(tarjetas_rojas, 0)
  INTO v_amarillas, v_rojas
  FROM estadisticas_jugador
  WHERE jugador_id = p_jugador_id AND torneo_id = p_torneo_id;

  -- Suspensión por 3 amarillas (cada 3 amarillas)
  IF v_amarillas >= 3 AND v_amarillas % 3 = 0 THEN
    -- Verificar si ya existe una suspensión por estas amarillas
    IF NOT EXISTS (
      SELECT 1 FROM suspensiones 
      WHERE jugador_id = p_jugador_id 
        AND torneo_id = p_torneo_id 
        AND tipo = 'acumulacion_amarillas'
        AND estado = 'activa'
    ) THEN
      INSERT INTO suspensiones (jugador_id, torneo_id, tipo, partidos_totales, motivo, fecha_inicio)
      VALUES (
        p_jugador_id,
        p_torneo_id,
        'acumulacion_amarillas',
        1,
        'Acumulación de 3 tarjetas amarillas',
        CURRENT_DATE
      );
      RAISE NOTICE 'Suspensión creada por acumulación de amarillas para jugador %', p_jugador_id;
    END IF;
  END IF;

  -- Suspensión por tarjeta roja (se maneja en el trigger de eventos)
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_verificar_suspensiones IS 'Verifica y crea suspensiones automáticas por acumulación de tarjetas';
