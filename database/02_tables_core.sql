-- ============================================================
-- SPORTZONE PRO — Tablas Principales
-- ============================================================

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

COMMENT ON TABLE temporadas IS 'Temporadas deportivas del sistema';
COMMENT ON COLUMN temporadas.activa IS 'Solo puede haber una temporada activa a la vez';

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

COMMENT ON TABLE torneos IS 'Torneos y competiciones del sistema';

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

COMMENT ON TABLE equipos IS 'Equipos participantes en los torneos';

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

COMMENT ON TABLE jugadores IS 'Jugadores registrados en el sistema';
