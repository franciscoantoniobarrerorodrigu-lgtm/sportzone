-- ============================================================
-- SPORTZONE PRO — Triggers para Actualización Automática
-- ============================================================

-- ─────────────────────────────────────
-- FUNCIÓN: trg_actualizar_estadisticas
-- ─────────────────────────────────────
CREATE OR REPLACE FUNCTION trg_actualizar_estadisticas()
RETURNS TRIGGER AS $$
DECLARE
  v_torneo_id UUID;
BEGIN
  -- Obtener torneo_id del partido
  SELECT torneo_id INTO v_torneo_id FROM partidos WHERE id = NEW.partido_id;

  -- Procesar según tipo de evento
  IF NEW.tipo = 'gol' THEN
    -- Incrementar goles del jugador
    INSERT INTO estadisticas_jugador (jugador_id, torneo_id, goles)
    VALUES (NEW.jugador_id, v_torneo_id, 1)
    ON CONFLICT (jugador_id, torneo_id) DO UPDATE
    SET goles = estadisticas_jugador.goles + 1;

    -- Incrementar asistencias si hay asistente
    IF NEW.asistente_id IS NOT NULL THEN
      INSERT INTO estadisticas_jugador (jugador_id, torneo_id, asistencias)
      VALUES (NEW.asistente_id, v_torneo_id, 1)
      ON CONFLICT (jugador_id, torneo_id) DO UPDATE
      SET asistencias = estadisticas_jugador.asistencias + 1;
    END IF;

    -- Actualizar marcador del partido
    UPDATE partidos
    SET 
      goles_local = CASE 
        WHEN NEW.equipo_id = equipo_local_id THEN goles_local + 1 
        ELSE goles_local 
      END,
      goles_visita = CASE 
        WHEN NEW.equipo_id = equipo_visita_id THEN goles_visita + 1 
        ELSE goles_visita 
      END
    WHERE id = NEW.partido_id;

  ELSIF NEW.tipo IN ('tarjeta_amarilla', 'tarjeta_roja') THEN
    -- Incrementar tarjetas del jugador
    INSERT INTO estadisticas_jugador (
      jugador_id, 
      torneo_id, 
      tarjetas_amarillas,
      tarjetas_rojas
    )
    VALUES (
      NEW.jugador_id, 
      v_torneo_id,
      CASE WHEN NEW.tipo = 'tarjeta_amarilla' THEN 1 ELSE 0 END,
      CASE WHEN NEW.tipo = 'tarjeta_roja' THEN 1 ELSE 0 END
    )
    ON CONFLICT (jugador_id, torneo_id) DO UPDATE
    SET 
      tarjetas_amarillas = estadisticas_jugador.tarjetas_amarillas + 
        CASE WHEN NEW.tipo = 'tarjeta_amarilla' THEN 1 ELSE 0 END,
      tarjetas_rojas = estadisticas_jugador.tarjetas_rojas + 
        CASE WHEN NEW.tipo = 'tarjeta_roja' THEN 1 ELSE 0 END;

    -- Verificar suspensiones
    PERFORM fn_verificar_suspensiones(NEW.jugador_id, v_torneo_id);

    -- Si es tarjeta roja, crear suspensión inmediata
    IF NEW.tipo = 'tarjeta_roja' THEN
      INSERT INTO suspensiones (jugador_id, torneo_id, tipo, partidos_totales, motivo, fecha_inicio)
      VALUES (
        NEW.jugador_id,
        v_torneo_id,
        'tarjeta_roja',
        2,  -- Configurable
        'Tarjeta roja directa',
        CURRENT_DATE
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION trg_actualizar_estadisticas IS 'Actualiza estadísticas y marcador al registrar eventos';

-- Crear trigger
CREATE TRIGGER trg_eventos_actualizar_estadisticas
  AFTER INSERT ON eventos_partido
  FOR EACH ROW
  EXECUTE FUNCTION trg_actualizar_estadisticas();

COMMENT ON TRIGGER trg_eventos_actualizar_estadisticas ON eventos_partido IS 'Trigger que actualiza estadísticas automáticamente';
