-- ============================================================
-- SPORTZONE PRO — Row Level Security (RLS)
-- ============================================================

-- ─────────────────────────────────────
-- RLS: solicitudes
-- ─────────────────────────────────────
ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access_solicitudes" ON solicitudes
  FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin');

COMMENT ON POLICY "admin_full_access_solicitudes" ON solicitudes IS 'Solo administradores pueden gestionar solicitudes';

-- ─────────────────────────────────────
-- RLS: resoluciones
-- ─────────────────────────────────────
ALTER TABLE resoluciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access_resoluciones" ON resoluciones
  FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin');

COMMENT ON POLICY "admin_full_access_resoluciones" ON resoluciones IS 'Solo administradores pueden gestionar resoluciones';

-- ─────────────────────────────────────
-- RLS: campanas_marketing
-- ─────────────────────────────────────
ALTER TABLE campanas_marketing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "marketing_access_campanas" ON campanas_marketing
  FOR ALL 
  USING (auth.jwt() ->> 'role' IN ('admin', 'marketing'));

COMMENT ON POLICY "marketing_access_campanas" ON campanas_marketing IS 'Administradores y marketing pueden gestionar campañas';

-- ─────────────────────────────────────
-- RLS: suspensiones
-- ─────────────────────────────────────
ALTER TABLE suspensiones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "arbitro_read_suspensiones" ON suspensiones
  FOR SELECT 
  USING (auth.jwt() ->> 'role' IN ('admin', 'arbitro'));

CREATE POLICY "admin_write_suspensiones" ON suspensiones
  FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin');

COMMENT ON POLICY "arbitro_read_suspensiones" ON suspensiones IS 'Árbitros pueden consultar suspensiones';
COMMENT ON POLICY "admin_write_suspensiones" ON suspensiones IS 'Solo administradores pueden modificar suspensiones';

-- ─────────────────────────────────────
-- RLS: Lectura pública
-- ─────────────────────────────────────
ALTER TABLE posiciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_posiciones" ON posiciones
  FOR SELECT USING (true);

ALTER TABLE partidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_partidos" ON partidos
  FOR SELECT USING (true);

ALTER TABLE equipos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_equipos" ON equipos
  FOR SELECT USING (true);

ALTER TABLE jugadores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_jugadores" ON jugadores
  FOR SELECT USING (true);

ALTER TABLE eventos_partido ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_eventos" ON eventos_partido
  FOR SELECT USING (true);

ALTER TABLE estadisticas_jugador ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_estadisticas" ON estadisticas_jugador
  FOR SELECT USING (true);

-- ─────────────────────────────────────
-- RLS: Planillero asignado
-- ─────────────────────────────────────
CREATE POLICY "planillero_update_partido" ON partidos
  FOR UPDATE 
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    planillero_id = auth.uid()
  );

CREATE POLICY "planillero_insert_eventos" ON eventos_partido
  FOR INSERT 
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR
    EXISTS (
      SELECT 1 FROM partidos 
      WHERE id = partido_id 
      AND planillero_id = auth.uid()
    )
  );

COMMENT ON POLICY "planillero_update_partido" ON partidos IS 'Solo el planillero asignado puede actualizar el partido';
COMMENT ON POLICY "planillero_insert_eventos" ON eventos_partido IS 'Solo el planillero asignado puede registrar eventos';
