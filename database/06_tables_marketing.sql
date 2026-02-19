-- ============================================================
-- SPORTZONE PRO — Tablas de Marketing
-- ============================================================

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

COMMENT ON TABLE campanas_marketing IS 'Campañas de marketing del sistema';

-- ─────────────────────────────────────
-- TABLA: patrocinadores
-- ─────────────────────────────────────
CREATE TABLE patrocinadores (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre      VARCHAR(200) NOT NULL,
  categoria   VARCHAR(80),
  logo_url    TEXT,
  monto_anual NUMERIC(12,2),
  contrato_inicio DATE,
  contrato_fin    DATE,
  estado      VARCHAR(30) DEFAULT 'activo'
    CHECK (estado IN ('propuesta','negociando','activo','vencido')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE patrocinadores IS 'Patrocinadores del sistema';
