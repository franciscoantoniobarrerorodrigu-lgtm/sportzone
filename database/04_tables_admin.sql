-- ============================================================
-- SPORTZONE PRO — Tablas Administrativas
-- ============================================================

-- ─────────────────────────────────────
-- TABLA: suspensiones
-- ─────────────────────────────────────
CREATE TABLE suspensiones (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jugador_id      UUID REFERENCES jugadores(id),
  torneo_id       UUID REFERENCES torneos(id),
  tipo            VARCHAR(50) CHECK (tipo IN ('acumulacion_amarillas','tarjeta_roja','resolucion_administrativa')),
  partidos_totales INT NOT NULL,
  partidos_cumplidos INT DEFAULT 0,
  estado          VARCHAR(30) DEFAULT 'activa' CHECK (estado IN ('activa','cumplida','anulada')),
  motivo          TEXT,
  fecha_inicio    DATE NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE suspensiones IS 'Suspensiones de jugadores por tarjetas o resoluciones';

-- ─────────────────────────────────────
-- TABLA: solicitudes
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

COMMENT ON TABLE solicitudes IS 'Solicitudes administrativas del sistema';

-- ─────────────────────────────────────
-- TABLA: resoluciones
-- ─────────────────────────────────────
CREATE TABLE resoluciones (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero        VARCHAR(30) UNIQUE NOT NULL,  -- "RES-2025-001"
  tipo          VARCHAR(50) CHECK (tipo IN ('disciplinaria','administrativa','tecnica')),
  asunto        TEXT NOT NULL,
  motivo        TEXT,
  sancion_tipo  VARCHAR(50) CHECK (sancion_tipo IN ('suspension','descuento_puntos','multa','wo_tecnico','amonestacion')),
  sancion_valor INT,
  estado        VARCHAR(30) DEFAULT 'borrador'
    CHECK (estado IN ('borrador','emitida','apelada','resuelta','anulada')),
  fecha_emision DATE,
  solicitud_id  UUID REFERENCES solicitudes(id),
  equipo_id     UUID REFERENCES equipos(id),
  jugador_id    UUID REFERENCES jugadores(id),
  partido_id    UUID REFERENCES partidos(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE resoluciones IS 'Resoluciones oficiales del sistema';
COMMENT ON COLUMN resoluciones.numero IS 'Número único secuencial de la resolución';
