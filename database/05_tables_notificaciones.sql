-- ============================================================
-- SPORTZONE PRO — Tablas de Notificaciones
-- ============================================================

-- ─────────────────────────────────────
-- TABLA: suscripciones_notificaciones
-- ─────────────────────────────────────
CREATE TABLE suscripciones_notificaciones (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  equipo_id   UUID REFERENCES equipos(id),
  partido_id  UUID REFERENCES partidos(id),
  preferencias JSONB DEFAULT '{
    "goles": true,
    "tarjetas": true,
    "inicio_partido": true,
    "fin_partido": true,
    "medio_tiempo": false
  }'::jsonb,
  activa      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_equipo_o_partido CHECK (
    (equipo_id IS NOT NULL AND partido_id IS NULL) OR
    (equipo_id IS NULL AND partido_id IS NOT NULL)
  )
);

COMMENT ON TABLE suscripciones_notificaciones IS 'Suscripciones de usuarios a equipos o partidos';
COMMENT ON COLUMN suscripciones_notificaciones.preferencias IS 'Preferencias de notificación en formato JSON';

-- Índices únicos para evitar duplicados
CREATE UNIQUE INDEX idx_suscripcion_user_equipo 
  ON suscripciones_notificaciones(user_id, equipo_id) 
  WHERE equipo_id IS NOT NULL;

CREATE UNIQUE INDEX idx_suscripcion_user_partido 
  ON suscripciones_notificaciones(user_id, partido_id) 
  WHERE partido_id IS NOT NULL;

-- ─────────────────────────────────────
-- TABLA: dispositivos_fcm
-- ─────────────────────────────────────
CREATE TABLE dispositivos_fcm (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fcm_token   TEXT NOT NULL UNIQUE,
  plataforma  VARCHAR(20) CHECK (plataforma IN ('ios','android','web')),
  activo      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE dispositivos_fcm IS 'Tokens FCM de dispositivos para notificaciones push';
