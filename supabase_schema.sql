-- ============================================================
-- SPORTZONE PRO — Supabase Schema
-- Stack: .NET 8 API + Angular 17 + Supabase (PostgreSQL)
-- ============================================================

-- ─────────────────────────────────────
-- EXTENSIONES
-- ─────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────
-- TABLA: temporadas
-- ─────────────────────────────────────
CREATE TABLE temporadas (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre      VARCHAR(100) NOT NULL,  -- ej: "2024/2025"
  fecha_inicio DATE NOT NULL,
  fecha_fin    DATE NOT NULL,
  activa       BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────
-- TABLA: torneos
-- ─────────────────────────────────────
CREATE TABLE torneos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  temporada_id  UUID REFERENCES temporadas(id) ON DELETE CASCADE,
  nombre        VARCHAR(150) NOT NULL,  -- "Liga Pro", "Copa Nacional"
  tipo          VARCHAR(50) CHECK (tipo IN ('liga','copa','amistoso')),
  total_jornadas INT DEFAULT 30,
  activo        BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────
-- TABLA: equipos
-- ─────────────────────────────────────
CREATE TABLE equipos (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre       VARCHAR(150) NOT NULL,
  abreviatura  VARCHAR(5) NOT NULL,
  ciudad       VARCHAR(100),
  estadio      VARCHAR(150),
  escudo_url   TEXT,
  color_primario   VARCHAR(7),  -- hex #RRGGBB
  color_secundario VARCHAR(7),
  activo       BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────
-- TABLA: jugadores
-- ─────────────────────────────────────
CREATE TABLE jugadores (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipo_id      UUID REFERENCES equipos(id),
  nombre         VARCHAR(100) NOT NULL,
  apellido       VARCHAR(100) NOT NULL,
  numero_camiseta INT,
  posicion       VARCHAR(50) CHECK (posicion IN ('Portero','Defensa','Mediocampista','Extremo','Delantero','Mediapunta')),
  nacionalidad   VARCHAR(80),
  fecha_nacimiento DATE,
  foto_url       TEXT,
  activo         BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────
-- TABLA: posiciones (tabla de liga)
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
  goles_local     INT,
  goles_visita    INT,
  estado          VARCHAR(30) DEFAULT 'programado'
    CHECK (estado IN ('programado','en_curso','finalizado','suspendido','cancelado')),
  minuto_actual   INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────
-- TABLA: eventos_partido (cronograma/timeline)
-- ─────────────────────────────────────
CREATE TABLE eventos_partido (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partido_id  UUID REFERENCES partidos(id) ON DELETE CASCADE,
  minuto      INT NOT NULL,
  tipo        VARCHAR(30) CHECK (tipo IN ('gol','tarjeta_amarilla','tarjeta_roja','sustitucion','penal','autogol')),
  jugador_id  UUID REFERENCES jugadores(id),
  asistente_id UUID REFERENCES jugadores(id),  -- para goles
  equipo_id   UUID REFERENCES equipos(id),
  descripcion TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────
-- TABLA: estadisticas_jugador (por temporada)
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

-- ─────────────────────────────────────
-- TABLA: solicitudes / mandas
-- ─────────────────────────────────────
CREATE TABLE solicitudes (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo         VARCHAR(50) CHECK (tipo IN ('marketing','traspaso','patrocinio','medios','disciplina','administrativa','tecnica')),
  titulo       VARCHAR(255) NOT NULL,
  descripcion  TEXT,
  solicitante  VARCHAR(150),
  equipo_id    UUID REFERENCES equipos(id),
  monto        NUMERIC(12,2),
  estado       VARCHAR(30) DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente','en_revision','aprobado','rechazado','cancelado')),
  prioridad    VARCHAR(20) DEFAULT 'media'
    CHECK (prioridad IN ('baja','media','alta','urgente')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────
-- TABLA: resoluciones
-- ─────────────────────────────────────
CREATE TABLE resoluciones (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero        VARCHAR(30) UNIQUE NOT NULL,  -- "RES-2025-018"
  tipo          VARCHAR(50) CHECK (tipo IN ('disciplinaria','administrativa','tecnica')),
  asunto        TEXT NOT NULL,
  motivo        TEXT,
  estado        VARCHAR(30) DEFAULT 'en_revision'
    CHECK (estado IN ('en_revision','emitida','apelada','anulada')),
  fecha_emision DATE,
  solicitud_id  UUID REFERENCES solicitudes(id),
  equipo_id     UUID REFERENCES equipos(id),
  jugador_id    UUID REFERENCES jugadores(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────
-- TABLA: campanas_marketing
-- ─────────────────────────────────────
CREATE TABLE campanas_marketing (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre        VARCHAR(200) NOT NULL,
  tipo          VARCHAR(50) CHECK (tipo IN ('digital','redes_sociales','email','outdoor','tv','radio')),
  presupuesto   NUMERIC(12,2),
  alcance_meta  INT,
  alcance_real  INT DEFAULT 0,
  estado        VARCHAR(30) DEFAULT 'planificada'
    CHECK (estado IN ('planificada','activa','pausada','finalizada')),
  fecha_inicio  DATE,
  fecha_fin     DATE,
  roi           NUMERIC(8,2),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────
-- TABLA: patrocinadores
-- ─────────────────────────────────────
CREATE TABLE patrocinadores (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre      VARCHAR(200) NOT NULL,
  categoria   VARCHAR(80),  -- "Principal", "Equipamiento", etc.
  logo_url    TEXT,
  monto_anual NUMERIC(12,2),
  contrato_inicio DATE,
  contrato_fin    DATE,
  estado      VARCHAR(30) DEFAULT 'activo'
    CHECK (estado IN ('propuesta','negociando','activo','vencido')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────
-- VISTAS ÚTILES
-- ─────────────────────────────────────

-- Vista: goleadores con nombre completo
CREATE VIEW v_goleadores AS
SELECT
  j.id,
  j.nombre || ' ' || j.apellido AS nombre_completo,
  j.posicion,
  j.nacionalidad,
  j.foto_url,
  e.nombre AS equipo,
  e.escudo_url,
  ej.goles,
  ej.asistencias,
  ej.tarjetas_amarillas,
  ej.tarjetas_rojas,
  ej.partidos_jugados,
  t.nombre AS torneo
FROM estadisticas_jugador ej
JOIN jugadores j ON j.id = ej.jugador_id
JOIN equipos e   ON e.id = j.equipo_id
JOIN torneos t   ON t.id = ej.torneo_id
ORDER BY ej.goles DESC, ej.asistencias DESC;

-- Vista: tabla de posiciones ordenada
CREATE VIEW v_tabla_posiciones AS
SELECT
  ROW_NUMBER() OVER (PARTITION BY p.torneo_id ORDER BY p.puntos DESC, p.diferencia DESC, p.gf DESC) AS posicion,
  p.*,
  e.nombre AS equipo_nombre,
  e.abreviatura,
  e.escudo_url,
  t.nombre AS torneo_nombre
FROM posiciones p
JOIN equipos e ON e.id = p.equipo_id
JOIN torneos t ON t.id = p.torneo_id;

-- ─────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────
ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resoluciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE campanas_marketing ENABLE ROW LEVEL SECURITY;

-- Solo admins ven solicitudes y resoluciones
CREATE POLICY "admin_only_solicitudes" ON solicitudes
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "admin_only_resoluciones" ON resoluciones
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Campañas: solo admins y marketing
CREATE POLICY "marketing_campanas" ON campanas_marketing
  FOR ALL USING (auth.jwt() ->> 'role' IN ('admin','marketing'));

-- Datos públicos: lectura libre para tablas, partidos, goleadores
CREATE POLICY "public_read_posiciones" ON posiciones
  FOR SELECT USING (true);

CREATE POLICY "public_read_partidos" ON partidos
  FOR SELECT USING (true);

-- ─────────────────────────────────────
-- FUNCIONES / TRIGGERS
-- ─────────────────────────────────────

-- Trigger: actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_solicitudes_updated
  BEFORE UPDATE ON solicitudes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Función: actualizar tabla de posiciones al finalizar un partido
CREATE OR REPLACE FUNCTION fn_actualizar_posiciones(partido_id UUID)
RETURNS void AS $$
DECLARE
  p partidos%ROWTYPE;
BEGIN
  SELECT * INTO p FROM partidos WHERE id = partido_id;

  IF p.estado = 'finalizado' THEN
    -- Actualizar equipo local
    INSERT INTO posiciones (torneo_id, equipo_id, pj, pg, pe, pp, gf, gc)
    VALUES (p.torneo_id, p.equipo_local_id, 1,
      CASE WHEN p.goles_local > p.goles_visita THEN 1 ELSE 0 END,
      CASE WHEN p.goles_local = p.goles_visita THEN 1 ELSE 0 END,
      CASE WHEN p.goles_local < p.goles_visita THEN 1 ELSE 0 END,
      p.goles_local, p.goles_visita)
    ON CONFLICT (torneo_id, equipo_id) DO UPDATE SET
      pj = posiciones.pj + 1,
      pg = posiciones.pg + CASE WHEN p.goles_local > p.goles_visita THEN 1 ELSE 0 END,
      pe = posiciones.pe + CASE WHEN p.goles_local = p.goles_visita THEN 1 ELSE 0 END,
      pp = posiciones.pp + CASE WHEN p.goles_local < p.goles_visita THEN 1 ELSE 0 END,
      gf = posiciones.gf + p.goles_local,
      gc = posiciones.gc + p.goles_visita,
      ultima_actualizacion = NOW();
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────
-- ÍNDICES para performance
-- ─────────────────────────────────────
CREATE INDEX idx_partidos_fecha ON partidos(fecha_hora);
CREATE INDEX idx_partidos_torneo ON partidos(torneo_id, jornada);
CREATE INDEX idx_estadisticas_jugador ON estadisticas_jugador(jugador_id);
CREATE INDEX idx_estadisticas_torneo ON estadisticas_jugador(torneo_id);
CREATE INDEX idx_solicitudes_estado ON solicitudes(estado, tipo);
CREATE INDEX idx_resoluciones_numero ON resoluciones(numero);
CREATE INDEX idx_eventos_partido ON eventos_partido(partido_id, minuto);
