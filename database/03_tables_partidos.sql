-- ============================================================
-- SPORTZONE PRO — Tablas de Partidos y Estadísticas
-- ============================================================

-- ─────────────────────────────────────
-- TABLA: partidos
-- ─────────────────────────────────────
CREATE TABLE partidos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  torneo_id       UUID REFERENCES torneos(id),
  jornada         INT NOT NULL,
  equipo_local_id  UUID REFERENCES equipos(id),
  equipo_visita_id UUID REFERENCES equipos(id),
  fecha_hora      TIMESTAMPTZ NOT NULL,
  estadio         VARCHAR(150),
  goles_local     INT DEFAULT 0,
  goles_visita    INT DEFAULT 0,
  estado          VARCHAR(30) DEFAULT 'programado'
    CHECK (estado IN ('programado','en_curso','medio_tiempo','finalizado','suspendido','cancelado')),
  minuto_actual   INT DEFAULT 0,
  planillero_id   UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_equipos_diferentes CHECK (equipo_local_id != equipo_visita_id)
);

COMMENT ON TABLE partidos IS 'Partidos del sistema con estado y marcador';
COMMENT ON COLUMN partidos.planillero_id IS 'Usuario planillero asignado al partido';

-- ─────────────────────────────────────
-- TABLA: eventos_partido
-- ─────────────────────────────────────
CREATE TABLE eventos_partido (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partido_id  UUID REFERENCES partidos(id) ON DELETE CASCADE,
  minuto      INT NOT NULL,
  tipo        VARCHAR(30) CHECK (tipo IN ('gol','tarjeta_amarilla','tarjeta_roja','sustitucion','penal','autogol','inicio_partido','medio_tiempo','fin_partido')),
  jugador_id  UUID REFERENCES jugadores(id),
  asistente_id UUID REFERENCES jugadores(id),
  equipo_id   UUID REFERENCES equipos(id),
  descripcion TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE eventos_partido IS 'Timeline de eventos de cada partido';

-- ─────────────────────────────────────
-- TABLA: posiciones
-- ─────────────────────────────────────
CREATE TABLE posiciones (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  torneo_id    UUID REFERENCES torneos(id) ON DELETE CASCADE,
  equipo_id    UUID REFERENCES equipos(id),
  pj           INT DEFAULT 0,  -- partidos jugados
  pg           INT DEFAULT 0,  -- ganados
  pe           INT DEFAULT 0,  -- empatados
  pp           INT DEFAULT 0,  -- perdidos
  gf           INT DEFAULT 0,  -- goles a favor
  gc           INT DEFAULT 0,  -- goles en contra
  puntos       INT GENERATED ALWAYS AS (pg * 3 + pe) STORED,
  diferencia   INT GENERATED ALWAYS AS (gf - gc) STORED,
  ultima_actualizacion TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (torneo_id, equipo_id)
);

COMMENT ON TABLE posiciones IS 'Tabla de posiciones por torneo';
COMMENT ON COLUMN posiciones.puntos IS 'Calculado automáticamente: PG*3 + PE';
COMMENT ON COLUMN posiciones.diferencia IS 'Calculado automáticamente: GF - GC';

-- ─────────────────────────────────────
-- TABLA: estadisticas_jugador
-- ─────────────────────────────────────
CREATE TABLE estadisticas_jugador (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jugador_id      UUID REFERENCES jugadores(id),
  torneo_id       UUID REFERENCES torneos(id),
  goles           INT DEFAULT 0,
  asistencias     INT DEFAULT 0,
  tarjetas_amarillas INT DEFAULT 0,
  tarjetas_rojas  INT DEFAULT 0,
  partidos_jugados INT DEFAULT 0,
  minutos_jugados  INT DEFAULT 0,
  UNIQUE (jugador_id, torneo_id)
);

COMMENT ON TABLE estadisticas_jugador IS 'Estadísticas de jugadores por torneo';
