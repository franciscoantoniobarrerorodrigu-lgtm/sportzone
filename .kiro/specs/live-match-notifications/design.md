# Documento de Diseño Técnico: SportZone Pro

## 1. Introducción

Este documento especifica el diseño técnico completo de SportZone Pro, un sistema integral de gestión de campeonatos deportivos profesionales. El sistema permite gestionar torneos, equipos, jugadores, partidos en vivo, estadísticas, resoluciones administrativas y campañas de marketing.

### 1.1 Objetivos del Sistema

- Gestionar torneos y campeonatos deportivos de forma profesional
- Transmitir resultados de partidos en tiempo real a múltiples clientes
- Generar automáticamente cronogramas de partidos sin conflictos
- Gestionar disciplina deportiva (tarjetas, suspensiones, resoluciones)
- Proporcionar interfaz optimizada para planilleros en tablets
- Ofrecer experiencia visual profesional tipo ESPN/Sofascore

### 1.2 Stack Tecnológico

- **Frontend Portal Web**: Angular 17 Standalone + Signals + TypeScript
- **Frontend App Planillero**: Angular 17 PWA optimizada para tablet
- **Backend API**: .NET 8 Web API + C# 12
- **Base de Datos**: Supabase PostgreSQL con Row Level Security
- **Tiempo Real**: SignalR (WebSocket) + Supabase Realtime
- **Autenticación**: Supabase Auth con JWT multi-rol
- **Notificaciones Push**: Firebase Cloud Messaging (FCM)
- **Hosting**: Vercel (Frontend) + Azure App Service (Backend)

## 2. Arquitectura del Sistema

### 2.1 Arquitectura de 3 Capas

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                     │
├─────────────────────────────────────────────────────────────┤
│  Portal Web (Angular 17)     │  App Planillero (PWA)        │
│  - Dashboard                  │  - Registro de eventos       │
│  - Tabla de posiciones        │  - Cronómetro                │
│  - Goleadores                 │  - Marcador en vivo          │
│  - Cronograma                 │  - Interfaz tablet           │
│  - Solicitudes/Resoluciones   │                              │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST + WebSocket
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE NEGOCIO                          │
├─────────────────────────────────────────────────────────────┤
│  .NET 8 Web API                                             │
│  - Controllers (Liga, Partidos, Goleadores, etc.)          │
│  - Services (Business Logic)                                │
│  - SignalR Hub (PartidoHub)                                 │
│  - Middleware (Auth, CORS, Error Handling)                  │
└─────────────────────────────────────────────────────────────┘
                            ↕ SQL + Realtime
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE DATOS                            │
├─────────────────────────────────────────────────────────────┤
│  Supabase PostgreSQL                                        │
│  - Tablas (equipos, jugadores, partidos, etc.)             │
│  - Vistas (v_goleadores, v_tabla_posiciones)               │
│  - Funciones (fn_actualizar_posiciones)                     │
│  - Triggers (actualización automática)                      │
│  - Row Level Security (RLS)                                 │
└─────────────────────────────────────────────────────────────┘
```



### 2.2 Flujo de Datos en Tiempo Real

```
Planillero (Tablet)
    │
    │ 1. POST /partidos/{id}/eventos
    ↓
.NET API Backend
    │
    ├─→ 2. Guardar en Supabase DB
    │
    ├─→ 3. SignalR Hub broadcast
    │       │
    │       ├─→ Portal Web (usuarios conectados)
    │       └─→ Marcador Público
    │
    └─→ 4. FCM Push Notification
            │
            └─→ Apps Móviles (usuarios suscritos)
```

### 2.3 Componentes Principales

| Componente | Tecnología | Responsabilidad |
|------------|-----------|-----------------|
| Portal_Web | Angular 17 | Interfaz pública y administrativa |
| App_Planillero | Angular PWA | Registro de eventos desde cancha |
| API_Backend | .NET 8 | Lógica de negocio y endpoints REST |
| SignalR_Hub | SignalR | Comunicación WebSocket en tiempo real |
| Supabase_DB | PostgreSQL | Almacenamiento persistente |
| Supabase_Auth | JWT | Autenticación multi-rol |
| Fixture_Generator | C# Service | Generación automática de cronograma |
| Suspension_Manager | C# Service | Gestión automática de suspensiones |
| Notification_Service | FCM | Notificaciones push móviles |

## 3. Diseño de Base de Datos

### 3.1 Modelo Entidad-Relación

```
temporadas (1) ──< (N) torneos (1) ──< (N) partidos
                                │
                                └──< (N) posiciones >── (1) equipos (1) ──< (N) jugadores
                                                                    │
                                                                    └──< (N) estadisticas_jugador
partidos (1) ──< (N) eventos_partido >── (1) jugadores

solicitudes (1) ──< (1) resoluciones >── (0..1) equipos
                                      └── (0..1) jugadores
```

### 3.2 Tablas Principales

#### 3.2.1 Tabla: temporadas
```sql
CREATE TABLE temporadas (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre      VARCHAR(100) NOT NULL,  -- "2024/2025"
  fecha_inicio DATE NOT NULL,
  fecha_fin    DATE NOT NULL,
  activa       BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3.2.2 Tabla: torneos
```sql
CREATE TABLE torneos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  temporada_id  UUID REFERENCES temporadas(id) ON DELETE CASCADE,
  nombre        VARCHAR(150) NOT NULL,  -- "Liga Pro", "Copa Nacional"
  tipo          VARCHAR(50) CHECK (tipo IN ('liga','copa','amistoso')),
  total_jornadas INT DEFAULT 30,
  activo        BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3.2.3 Tabla: equipos
```sql
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
```

#### 3.2.4 Tabla: jugadores
```sql
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
```

#### 3.2.5 Tabla: partidos
```sql
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
    CHECK (estado IN ('programado','en_curso','medio_tiempo','finalizado','suspendido','cancelado')),
  minuto_actual   INT DEFAULT 0,
  planillero_id   UUID REFERENCES auth.users(id),  -- Planillero asignado
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```



#### 3.2.6 Tabla: eventos_partido
```sql
CREATE TABLE eventos_partido (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partido_id  UUID REFERENCES partidos(id) ON DELETE CASCADE,
  minuto      INT NOT NULL,
  tipo        VARCHAR(30) CHECK (tipo IN ('gol','tarjeta_amarilla','tarjeta_roja','sustitucion','penal','autogol','inicio_partido','medio_tiempo','fin_partido')),
  jugador_id  UUID REFERENCES jugadores(id),
  asistente_id UUID REFERENCES jugadores(id),  -- Para goles
  equipo_id   UUID REFERENCES equipos(id),
  descripcion TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3.2.7 Tabla: posiciones
```sql
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
```

#### 3.2.8 Tabla: estadisticas_jugador
```sql
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
```

#### 3.2.9 Tabla: suspensiones
```sql
CREATE TABLE suspensiones (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jugador_id      UUID REFERENCES jugadores(id),
  torneo_id       UUID REFERENCES torneos(id),
  tipo            VARCHAR(50) CHECK (tipo IN ('acumulacion_amarillas','tarjeta_roja','resolucion_administrativa')),
  partidos_totales INT NOT NULL,  -- Total de partidos de suspensión
  partidos_cumplidos INT DEFAULT 0,
  estado          VARCHAR(30) DEFAULT 'activa' CHECK (estado IN ('activa','cumplida','anulada')),
  motivo          TEXT,
  fecha_inicio    DATE NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3.2.10 Tabla: solicitudes
```sql
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
```

#### 3.2.11 Tabla: resoluciones
```sql
CREATE TABLE resoluciones (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero        VARCHAR(30) UNIQUE NOT NULL,  -- "RES-2025-001"
  tipo          VARCHAR(50) CHECK (tipo IN ('disciplinaria','administrativa','tecnica')),
  asunto        TEXT NOT NULL,
  motivo        TEXT,
  sancion_tipo  VARCHAR(50) CHECK (sancion_tipo IN ('suspension','descuento_puntos','multa','wo_tecnico','amonestacion')),
  sancion_valor INT,  -- Número de partidos, puntos, etc.
  estado        VARCHAR(30) DEFAULT 'borrador'
    CHECK (estado IN ('borrador','emitida','apelada','resuelta','anulada')),
  fecha_emision DATE,
  solicitud_id  UUID REFERENCES solicitudes(id),
  equipo_id     UUID REFERENCES equipos(id),
  jugador_id    UUID REFERENCES jugadores(id),
  partido_id    UUID REFERENCES partidos(id),  -- Para W.O. técnico
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3.2.12 Tabla: suscripciones_notificaciones
```sql
CREATE TABLE suscripciones_notificaciones (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id),
  equipo_id   UUID REFERENCES equipos(id),
  partido_id  UUID REFERENCES partidos(id),
  preferencias JSONB DEFAULT '{
    "goles": true,
    "tarjetas": true,
    "inicio_partido": true,
    "fin_partido": true,
    "medio_tiempo": false
  }',
  activa      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, equipo_id),
  UNIQUE (user_id, partido_id)
);
```

#### 3.2.13 Tabla: dispositivos_fcm
```sql
CREATE TABLE dispositivos_fcm (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id),
  fcm_token   TEXT NOT NULL UNIQUE,
  plataforma  VARCHAR(20) CHECK (plataforma IN ('ios','android','web')),
  activo      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```



### 3.3 Vistas de Base de Datos

#### 3.3.1 Vista: v_goleadores
```sql
CREATE VIEW v_goleadores AS
SELECT
  j.id,
  j.nombre || ' ' || j.apellido AS nombre_completo,
  j.numero_camiseta,
  j.posicion,
  j.nacionalidad,
  j.foto_url,
  e.nombre AS equipo,
  e.escudo_url,
  e.color_primario,
  ej.goles,
  ej.asistencias,
  ej.tarjetas_amarillas,
  ej.tarjetas_rojas,
  ej.partidos_jugados,
  t.nombre AS torneo,
  t.id AS torneo_id
FROM estadisticas_jugador ej
JOIN jugadores j ON j.id = ej.jugador_id
JOIN equipos e   ON e.id = j.equipo_id
JOIN torneos t   ON t.id = ej.torneo_id
WHERE j.activo = true
ORDER BY ej.goles DESC, ej.asistencias DESC;
```

#### 3.3.2 Vista: v_tabla_posiciones
```sql
CREATE VIEW v_tabla_posiciones AS
SELECT
  ROW_NUMBER() OVER (PARTITION BY p.torneo_id ORDER BY p.puntos DESC, p.diferencia DESC, p.gf DESC) AS posicion,
  p.*,
  e.nombre AS equipo_nombre,
  e.abreviatura,
  e.escudo_url,
  e.color_primario,
  t.nombre AS torneo_nombre
FROM posiciones p
JOIN equipos e ON e.id = p.equipo_id
JOIN torneos t ON t.id = p.torneo_id
WHERE t.activo = true;
```

### 3.4 Funciones y Triggers

#### 3.4.1 Función: fn_actualizar_posiciones
```sql
CREATE OR REPLACE FUNCTION fn_actualizar_posiciones(p_partido_id UUID)
RETURNS void AS $$
DECLARE
  v_partido partidos%ROWTYPE;
  v_resultado_local VARCHAR(1);
  v_resultado_visita VARCHAR(1);
BEGIN
  SELECT * INTO v_partido FROM partidos WHERE id = p_partido_id;

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
END;
$$ LANGUAGE plpgsql;
```

#### 3.4.2 Función: fn_verificar_suspensiones
```sql
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

  -- Suspensión por 3 amarillas
  IF v_amarillas >= 3 AND v_amarillas % 3 = 0 THEN
    INSERT INTO suspensiones (jugador_id, torneo_id, tipo, partidos_totales, motivo, fecha_inicio)
    VALUES (
      p_jugador_id,
      p_torneo_id,
      'acumulacion_amarillas',
      1,
      'Acumulación de 3 tarjetas amarillas',
      CURRENT_DATE
    );
  END IF;

  -- Suspensión por tarjeta roja
  IF v_rojas > 0 THEN
    INSERT INTO suspensiones (jugador_id, torneo_id, tipo, partidos_totales, motivo, fecha_inicio)
    VALUES (
      p_jugador_id,
      p_torneo_id,
      'tarjeta_roja',
      2,  -- Configurable
      'Tarjeta roja directa',
      CURRENT_DATE
    );
  END IF;
END;
$$ LANGUAGE plpgsql;
```

#### 3.4.3 Trigger: actualizar estadísticas al registrar evento
```sql
CREATE OR REPLACE FUNCTION trg_actualizar_estadisticas()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tipo = 'gol' THEN
    -- Incrementar goles del jugador
    INSERT INTO estadisticas_jugador (jugador_id, torneo_id, goles)
    SELECT NEW.jugador_id, p.torneo_id, 1
    FROM partidos p WHERE p.id = NEW.partido_id
    ON CONFLICT (jugador_id, torneo_id) DO UPDATE
    SET goles = estadisticas_jugador.goles + 1;

    -- Incrementar asistencias si hay asistente
    IF NEW.asistente_id IS NOT NULL THEN
      INSERT INTO estadisticas_jugador (jugador_id, torneo_id, asistencias)
      SELECT NEW.asistente_id, p.torneo_id, 1
      FROM partidos p WHERE p.id = NEW.partido_id
      ON CONFLICT (jugador_id, torneo_id) DO UPDATE
      SET asistencias = estadisticas_jugador.asistencias + 1;
    END IF;

    -- Actualizar marcador del partido
    UPDATE partidos
    SET goles_local = goles_local + CASE WHEN NEW.equipo_id = equipo_local_id THEN 1 ELSE 0 END,
        goles_visita = goles_visita + CASE WHEN NEW.equipo_id = equipo_visita_id THEN 1 ELSE 0 END
    WHERE id = NEW.partido_id;

  ELSIF NEW.tipo IN ('tarjeta_amarilla', 'tarjeta_roja') THEN
    -- Incrementar tarjetas del jugador
    INSERT INTO estadisticas_jugador (
      jugador_id, 
      torneo_id, 
      tarjetas_amarillas,
      tarjetas_rojas
    )
    SELECT 
      NEW.jugador_id, 
      p.torneo_id,
      CASE WHEN NEW.tipo = 'tarjeta_amarilla' THEN 1 ELSE 0 END,
      CASE WHEN NEW.tipo = 'tarjeta_roja' THEN 1 ELSE 0 END
    FROM partidos p WHERE p.id = NEW.partido_id
    ON CONFLICT (jugador_id, torneo_id) DO UPDATE
    SET tarjetas_amarillas = estadisticas_jugador.tarjetas_amarillas + 
          CASE WHEN NEW.tipo = 'tarjeta_amarilla' THEN 1 ELSE 0 END,
        tarjetas_rojas = estadisticas_jugador.tarjetas_rojas + 
          CASE WHEN NEW.tipo = 'tarjeta_roja' THEN 1 ELSE 0 END;

    -- Verificar suspensiones
    PERFORM fn_verificar_suspensiones(NEW.jugador_id, (SELECT torneo_id FROM partidos WHERE id = NEW.partido_id));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_eventos_actualizar_estadisticas
  AFTER INSERT ON eventos_partido
  FOR EACH ROW
  EXECUTE FUNCTION trg_actualizar_estadisticas();
```



### 3.5 Row Level Security (RLS)

```sql
-- Habilitar RLS en tablas sensibles
ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resoluciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE campanas_marketing ENABLE ROW LEVEL SECURITY;
ALTER TABLE suspensiones ENABLE ROW LEVEL SECURITY;

-- Políticas: Solo admins pueden gestionar solicitudes
CREATE POLICY "admin_full_access_solicitudes" ON solicitudes
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas: Solo admins pueden gestionar resoluciones
CREATE POLICY "admin_full_access_resoluciones" ON resoluciones
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas: Admins y marketing pueden gestionar campañas
CREATE POLICY "marketing_access_campanas" ON campanas_marketing
  FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'marketing'));

-- Políticas: Lectura pública para datos de partidos y posiciones
CREATE POLICY "public_read_posiciones" ON posiciones
  FOR SELECT USING (true);

CREATE POLICY "public_read_partidos" ON partidos
  FOR SELECT USING (true);

CREATE POLICY "public_read_equipos" ON equipos
  FOR SELECT USING (true);

CREATE POLICY "public_read_jugadores" ON jugadores
  FOR SELECT USING (true);

-- Políticas: Solo planillero asignado puede modificar partido
CREATE POLICY "planillero_asignado_update_partido" ON partidos
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'admin' OR
    planillero_id = auth.uid()
  );

-- Políticas: Solo planillero asignado puede registrar eventos
CREATE POLICY "planillero_asignado_insert_eventos" ON eventos_partido
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR
    EXISTS (
      SELECT 1 FROM partidos 
      WHERE id = partido_id 
      AND planillero_id = auth.uid()
    )
  );
```

### 3.6 Índices para Rendimiento

```sql
-- Índices en partidos
CREATE INDEX idx_partidos_fecha ON partidos(fecha_hora);
CREATE INDEX idx_partidos_torneo_jornada ON partidos(torneo_id, jornada);
CREATE INDEX idx_partidos_estado ON partidos(estado);
CREATE INDEX idx_partidos_equipos ON partidos(equipo_local_id, equipo_visita_id);

-- Índices en eventos_partido
CREATE INDEX idx_eventos_partido_id ON eventos_partido(partido_id, minuto);
CREATE INDEX idx_eventos_tipo ON eventos_partido(tipo);
CREATE INDEX idx_eventos_jugador ON eventos_partido(jugador_id);

-- Índices en estadísticas
CREATE INDEX idx_estadisticas_jugador_torneo ON estadisticas_jugador(jugador_id, torneo_id);
CREATE INDEX idx_estadisticas_goles ON estadisticas_jugador(torneo_id, goles DESC);

-- Índices en posiciones
CREATE INDEX idx_posiciones_torneo ON posiciones(torneo_id, puntos DESC, diferencia DESC);

-- Índices en solicitudes
CREATE INDEX idx_solicitudes_estado_tipo ON solicitudes(estado, tipo);
CREATE INDEX idx_solicitudes_fecha ON solicitudes(created_at DESC);

-- Índices en resoluciones
CREATE INDEX idx_resoluciones_numero ON resoluciones(numero);
CREATE INDEX idx_resoluciones_estado ON resoluciones(estado);

-- Índices en suspensiones
CREATE INDEX idx_suspensiones_jugador ON suspensiones(jugador_id, estado);
CREATE INDEX idx_suspensiones_torneo ON suspensiones(torneo_id, estado);
```

## 4. Diseño de API Backend (.NET 8)

### 4.1 Estructura de Proyecto

```
SportZone.API/
├── Controllers/
│   ├── LigaController.cs
│   ├── PartidosController.cs
│   ├── GoleadoresController.cs
│   ├── SolicitudesController.cs
│   ├── ResolucionesController.cs
│   └── MarketingController.cs
├── Services/
│   ├── ILigaService.cs / LigaService.cs
│   ├── IPartidosService.cs / PartidosService.cs
│   ├── IGoleadoresService.cs / GoleadoresService.cs
│   ├── ISolicitudesService.cs / SolicitudesService.cs
│   ├── IResolucionesService.cs / ResolucionesService.cs
│   ├── IFixtureGeneratorService.cs / FixtureGeneratorService.cs
│   ├── ISuspensionManagerService.cs / SuspensionManagerService.cs
│   └── INotificationService.cs / NotificationService.cs
├── Hubs/
│   └── PartidoHub.cs
├── Models/
│   ├── DTOs/
│   │   ├── CreatePartidoDto.cs
│   │   ├── CreateEventoDto.cs
│   │   ├── ResultadoDto.cs
│   │   └── ...
│   └── Entities/
│       ├── Partido.cs
│       ├── Equipo.cs
│       └── ...
├── Middleware/
│   ├── ErrorHandlingMiddleware.cs
│   └── AuthMiddleware.cs
├── Program.cs
└── appsettings.json
```

### 4.2 Endpoints REST API

#### 4.2.1 Liga Controller

```csharp
[ApiController]
[Route("api/[controller]")]
public class LigaController : ControllerBase
{
    // GET /api/liga/posiciones/{torneoId}
    [HttpGet("posiciones/{torneoId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPosiciones(Guid torneoId);

    // GET /api/liga/torneos
    [HttpGet("torneos")]
    [AllowAnonymous]
    public async Task<IActionResult> GetTorneos();

    // GET /api/liga/{torneoId}/jornada/{numero}
    [HttpGet("{torneoId}/jornada/{numero}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetJornada(Guid torneoId, int numero);

    // POST /api/liga/torneos
    [HttpPost("torneos")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> CreateTorneo([FromBody] CreateTorneoDto dto);
}
```

#### 4.2.2 Partidos Controller

```csharp
[ApiController]
[Route("api/[controller]")]
public class PartidosController : ControllerBase
{
    // GET /api/partidos/proximos?dias=14&torneoId={guid}
    [HttpGet("proximos")]
    [AllowAnonymous]
    public async Task<IActionResult> GetProximos(
        [FromQuery] int dias = 14,
        [FromQuery] Guid? torneoId = null);

    // GET /api/partidos/{id}
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPartido(Guid id);

    // GET /api/partidos/en-vivo
    [HttpGet("en-vivo")]
    [AllowAnonymous]
    public async Task<IActionResult> GetEnVivo();

    // POST /api/partidos
    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> CreatePartido([FromBody] CreatePartidoDto dto);

    // PATCH /api/partidos/{id}/iniciar
    [HttpPatch("{id}/iniciar")]
    [Authorize]  // Admin o Planillero asignado
    public async Task<IActionResult> IniciarPartido(Guid id);

    // POST /api/partidos/{id}/eventos
    [HttpPost("{id}/eventos")]
    [Authorize]  // Admin o Planillero asignado
    public async Task<IActionResult> AddEvento(Guid id, [FromBody] CreateEventoDto dto);

    // PATCH /api/partidos/{id}/finalizar
    [HttpPatch("{id}/finalizar")]
    [Authorize]  // Admin o Planillero asignado
    public async Task<IActionResult> FinalizarPartido(Guid id);

    // POST /api/partidos/generar-fixture
    [HttpPost("generar-fixture")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GenerarFixture([FromBody] GenerarFixtureDto dto);
}
```



#### 4.2.3 Goleadores Controller

```csharp
[ApiController]
[Route("api/[controller]")]
public class GoleadoresController : ControllerBase
{
    // GET /api/goleadores/{torneoId}?top=20&equipoId={guid}
    [HttpGet("{torneoId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetGoleadores(
        Guid torneoId,
        [FromQuery] int top = 20,
        [FromQuery] Guid? equipoId = null);

    // GET /api/goleadores/{torneoId}/asistencias
    [HttpGet("{torneoId}/asistencias")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAsistidores(Guid torneoId, [FromQuery] int top = 20);

    // GET /api/goleadores/{torneoId}/tarjetas
    [HttpGet("{torneoId}/tarjetas")]
    [AllowAnonymous]
    public async Task<IActionResult> GetTarjetas(Guid torneoId, [FromQuery] string tipo = "amarillas");
}
```

#### 4.2.4 Solicitudes Controller

```csharp
[ApiController]
[Route("api/[controller]")]
public class SolicitudesController : ControllerBase
{
    // GET /api/solicitudes?estado=pendiente&tipo=marketing&page=1
    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetSolicitudes(
        [FromQuery] string? estado = null,
        [FromQuery] string? tipo = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20);

    // GET /api/solicitudes/{id}
    [HttpGet("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetSolicitud(Guid id);

    // POST /api/solicitudes
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateSolicitud([FromBody] CreateSolicitudDto dto);

    // PATCH /api/solicitudes/{id}/estado
    [HttpPatch("{id}/estado")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateEstado(Guid id, [FromBody] UpdateEstadoDto dto);
}
```

#### 4.2.5 Resoluciones Controller

```csharp
[ApiController]
[Route("api/[controller]")]
public class ResolucionesController : ControllerBase
{
    // GET /api/resoluciones?tipo=disciplinaria&estado=emitida
    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetResoluciones(
        [FromQuery] string? tipo = null,
        [FromQuery] string? estado = null,
        [FromQuery] int page = 1);

    // GET /api/resoluciones/{id}
    [HttpGet("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetResolucion(Guid id);

    // POST /api/resoluciones
    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> CreateResolucion([FromBody] CreateResolucionDto dto);

    // PATCH /api/resoluciones/{id}/estado
    [HttpPatch("{id}/estado")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> CambiarEstado(Guid id, [FromBody] UpdateEstadoDto dto);

    // PATCH /api/resoluciones/{id}/aplicar
    [HttpPatch("{id}/aplicar")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> AplicarResolucion(Guid id);
}
```

### 4.3 DTOs (Data Transfer Objects)

#### 4.3.1 CreatePartidoDto
```csharp
public record CreatePartidoDto(
    Guid TorneoId,
    int Jornada,
    Guid EquipoLocalId,
    Guid EquipoVisitaId,
    DateTime FechaHora,
    string Estadio,
    Guid? PlanilleroId
);
```

#### 4.3.2 CreateEventoDto
```csharp
public record CreateEventoDto(
    int Minuto,
    string Tipo,  // "gol", "tarjeta_amarilla", "tarjeta_roja", "sustitucion"
    Guid JugadorId,
    Guid? AsistenteId,
    Guid EquipoId,
    string? Descripcion
);
```

#### 4.3.3 GenerarFixtureDto
```csharp
public record GenerarFixtureDto(
    Guid TorneoId,
    List<Guid> EquipoIds,
    DateTime FechaInicio,
    List<TimeSpan> HorariosDisponibles,  // Ej: [14:00, 16:00, 18:00, 20:00]
    int DiasMinimosEntrePartidos = 3,
    int? Seed = null  // Para reproducibilidad
);
```

#### 4.3.4 CreateResolucionDto
```csharp
public record CreateResolucionDto(
    string Tipo,  // "disciplinaria", "administrativa", "tecnica"
    string Asunto,
    string Motivo,
    string? SancionTipo,  // "suspension", "descuento_puntos", "multa", "wo_tecnico"
    int? SancionValor,
    Guid? EquipoId,
    Guid? JugadorId,
    Guid? PartidoId,
    Guid? SolicitudId
);
```

### 4.4 SignalR Hub

#### 4.4.1 PartidoHub
```csharp
using Microsoft.AspNetCore.SignalR;

public class PartidoHub : Hub
{
    // Cliente se suscribe a un partido específico
    public async Task SuscribirPartido(string partidoId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"partido-{partidoId}");
        await Clients.Caller.SendAsync("SuscripcionConfirmada", partidoId);
    }

    // Cliente se desuscribe de un partido
    public async Task DesuscribirPartido(string partidoId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"partido-{partidoId}");
    }

    // Servidor envía evento a todos los clientes suscritos
    public async Task BroadcastEvento(string partidoId, object evento)
    {
        await Clients.Group($"partido-{partidoId}").SendAsync("EventoRegistrado", evento);
    }

    // Servidor envía actualización de minuto
    public async Task BroadcastMinuto(string partidoId, int minuto)
    {
        await Clients.Group($"partido-{partidoId}").SendAsync("MinutoActualizado", minuto);
    }

    // Servidor envía actualización de marcador
    public async Task BroadcastMarcador(string partidoId, int golesLocal, int golesVisita)
    {
        await Clients.Group($"partido-{partidoId}").SendAsync("MarcadorActualizado", new
        {
            GolesLocal = golesLocal,
            GolesVisita = golesVisita
        });
    }

    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
        Console.WriteLine($"Cliente conectado: {Context.ConnectionId}");
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
        Console.WriteLine($"Cliente desconectado: {Context.ConnectionId}");
    }
}
```

### 4.5 Servicios de Negocio

#### 4.5.1 IPartidosService
```csharp
public interface IPartidosService
{
    Task<List<PartidoDto>> GetProximosPartidosAsync(int dias, Guid? torneoId);
    Task<PartidoDetalleDto> GetPartidoConEventosAsync(Guid id);
    Task<PartidoDto?> GetPartidoEnVivoAsync();
    Task<PartidoDto> CreatePartidoAsync(CreatePartidoDto dto);
    Task IniciarPartidoAsync(Guid id, Guid userId);
    Task<EventoPartidoDto> AddEventoAsync(Guid partidoId, CreateEventoDto dto, Guid userId);
    Task FinalizarPartidoAsync(Guid id, Guid userId);
    Task ActualizarMinutoAsync(Guid partidoId, int minuto);
}
```

#### 4.5.2 IFixtureGeneratorService
```csharp
public interface IFixtureGeneratorService
{
    Task<List<PartidoDto>> GenerarFixtureAsync(GenerarFixtureDto dto);
    Task<bool> ValidarConflictosAsync(Guid equipoId, DateTime fechaHora);
}
```

Implementación del algoritmo:
```csharp
public class FixtureGeneratorService : IFixtureGeneratorService
{
    public async Task<List<PartidoDto>> GenerarFixtureAsync(GenerarFixtureDto dto)
    {
        var equipos = dto.EquipoIds;
        var n = equipos.Count;
        
        if (n % 2 != 0)
            throw new InvalidOperationException("El número de equipos debe ser par");

        var partidos = new List<PartidoDto>();
        var random = dto.Seed.HasValue ? new Random(dto.Seed.Value) : new Random();
        var fechaActual = dto.FechaInicio;
        var jornada = 1;

        // Algoritmo Round-Robin
        var totalJornadas = n - 1;
        var partidosPorJornada = n / 2;

        for (int j = 0; j < totalJornadas; j++)
        {
            for (int p = 0; p < partidosPorJornada; p++)
            {
                var local = equipos[p];
                var visita = equipos[n - 1 - p];

                // Alternar local/visita aleatoriamente
                if (random.Next(2) == 0)
                    (local, visita) = (visita, local);

                // Asignar horario aleatorio
                var horario = dto.HorariosDisponibles[random.Next(dto.HorariosDisponibles.Count)];
                var fechaHora = fechaActual.Date + horario;

                // Validar conflictos
                while (!await ValidarConflictosAsync(local, fechaHora) || 
                       !await ValidarConflictosAsync(visita, fechaHora))
                {
                    fechaHora = fechaHora.AddDays(1);
                }

                partidos.Add(new PartidoDto
                {
                    TorneoId = dto.TorneoId,
                    Jornada = jornada,
                    EquipoLocalId = local,
                    EquipoVisitaId = visita,
                    FechaHora = fechaHora
                });
            }

            // Rotar equipos (excepto el primero)
            var ultimo = equipos[n - 1];
            for (int i = n - 1; i > 1; i--)
                equipos[i] = equipos[i - 1];
            equipos[1] = ultimo;

            jornada++;
            fechaActual = fechaActual.AddDays(dto.DiasMinimosEntrePartidos);
        }

        return partidos;
    }

    public async Task<bool> ValidarConflictosAsync(Guid equipoId, DateTime fechaHora)
    {
        // Verificar que el equipo no tenga otro partido el mismo día
        var partidosEquipo = await _supabase
            .From<Partido>()
            .Where(p => (p.EquipoLocalId == equipoId || p.EquipoVisitaId == equipoId) &&
                        p.FechaHora.Date == fechaHora.Date)
            .Get();

        return !partidosEquipo.Models.Any();
    }
}
```



#### 4.5.3 ISuspensionManagerService
```csharp
public interface ISuspensionManagerService
{
    Task VerificarSuspensionesAsync(Guid jugadorId, Guid torneoId);
    Task<List<SuspensionDto>> GetSuspensionesActivasAsync(Guid equipoId, Guid torneoId);
    Task DescontarSuspensionAsync(Guid jugadorId, Guid partidoId);
}
```

Implementación:
```csharp
public class SuspensionManagerService : ISuspensionManagerService
{
    private readonly Supabase.Client _supabase;
    private const int UMBRAL_AMARILLAS = 3;
    private const int PARTIDOS_SUSPENSION_AMARILLAS = 1;
    private const int PARTIDOS_SUSPENSION_ROJA = 2;

    public async Task VerificarSuspensionesAsync(Guid jugadorId, Guid torneoId)
    {
        // Obtener estadísticas del jugador
        var stats = await _supabase
            .From<EstadisticaJugador>()
            .Where(e => e.JugadorId == jugadorId && e.TorneoId == torneoId)
            .Single();

        if (stats == null) return;

        // Verificar acumulación de amarillas
        if (stats.TarjetasAmarillas >= UMBRAL_AMARILLAS && 
            stats.TarjetasAmarillas % UMBRAL_AMARILLAS == 0)
        {
            await CrearSuspensionAsync(new CreateSuspensionDto
            {
                JugadorId = jugadorId,
                TorneoId = torneoId,
                Tipo = "acumulacion_amarillas",
                PartidosTotales = PARTIDOS_SUSPENSION_AMARILLAS,
                Motivo = $"Acumulación de {UMBRAL_AMARILLAS} tarjetas amarillas"
            });
        }

        // Verificar tarjeta roja (se verifica en el trigger de eventos)
    }

    public async Task<List<SuspensionDto>> GetSuspensionesActivasAsync(Guid equipoId, Guid torneoId)
    {
        var suspensiones = await _supabase
            .From<Suspension>()
            .Select("*, jugadores!inner(equipo_id)")
            .Where(s => s.Estado == "activa" && 
                        s.TorneoId == torneoId &&
                        s.Jugadores.EquipoId == equipoId)
            .Get();

        return suspensiones.Models.Select(s => new SuspensionDto
        {
            Id = s.Id,
            JugadorId = s.JugadorId,
            Tipo = s.Tipo,
            PartidosTotales = s.PartidosTotales,
            PartidosCumplidos = s.PartidosCumplidos,
            PartidosRestantes = s.PartidosTotales - s.PartidosCumplidos
        }).ToList();
    }

    public async Task DescontarSuspensionAsync(Guid jugadorId, Guid partidoId)
    {
        var partido = await _supabase.From<Partido>().Where(p => p.Id == partidoId).Single();
        
        var suspensiones = await _supabase
            .From<Suspension>()
            .Where(s => s.JugadorId == jugadorId && 
                        s.TorneoId == partido.TorneoId &&
                        s.Estado == "activa")
            .Get();

        foreach (var suspension in suspensiones.Models)
        {
            suspension.PartidosCumplidos++;
            
            if (suspension.PartidosCumplidos >= suspension.PartidosTotales)
            {
                suspension.Estado = "cumplida";
            }

            await _supabase.From<Suspension>().Update(suspension);
        }
    }
}
```

#### 4.5.4 INotificationService
```csharp
public interface INotificationService
{
    Task EnviarNotificacionGolAsync(Guid partidoId, EventoPartidoDto evento);
    Task EnviarNotificacionTarjetaAsync(Guid partidoId, EventoPartidoDto evento);
    Task EnviarNotificacionInicioPartidoAsync(Guid partidoId);
    Task EnviarNotificacionFinPartidoAsync(Guid partidoId, int golesLocal, int golesVisita);
}
```

Implementación con FCM:
```csharp
public class NotificationService : INotificationService
{
    private readonly FirebaseMessaging _fcm;
    private readonly Supabase.Client _supabase;

    public async Task EnviarNotificacionGolAsync(Guid partidoId, EventoPartidoDto evento)
    {
        var partido = await ObtenerPartidoAsync(partidoId);
        var suscriptores = await ObtenerSuscriptoresAsync(partidoId, partido.EquipoLocalId, partido.EquipoVisitaId);
        
        var tokens = suscriptores
            .Where(s => s.Preferencias.Goles)
            .SelectMany(s => s.Tokens)
            .ToList();

        if (!tokens.Any()) return;

        var message = new MulticastMessage
        {
            Tokens = tokens,
            Notification = new Notification
            {
                Title = $"⚽ ¡GOL! {evento.EquipoNombre}",
                Body = $"{evento.JugadorNombre} - Minuto {evento.Minuto}'"
            },
            Data = new Dictionary<string, string>
            {
                { "tipo", "gol" },
                { "partidoId", partidoId.ToString() },
                { "minuto", evento.Minuto.ToString() }
            }
        };

        await _fcm.SendMulticastAsync(message);
    }

    public async Task EnviarNotificacionTarjetaAsync(Guid partidoId, EventoPartidoDto evento)
    {
        if (evento.Tipo != "tarjeta_roja") return;  // Solo notificar rojas

        var partido = await ObtenerPartidoAsync(partidoId);
        var suscriptores = await ObtenerSuscriptoresAsync(partidoId, partido.EquipoLocalId, partido.EquipoVisitaId);
        
        var tokens = suscriptores
            .Where(s => s.Preferencias.Tarjetas)
            .SelectMany(s => s.Tokens)
            .ToList();

        if (!tokens.Any()) return;

        var message = new MulticastMessage
        {
            Tokens = tokens,
            Notification = new Notification
            {
                Title = $"🟥 Tarjeta Roja - {evento.EquipoNombre}",
                Body = $"{evento.JugadorNombre} expulsado - Minuto {evento.Minuto}'"
            },
            Data = new Dictionary<string, string>
            {
                { "tipo", "tarjeta_roja" },
                { "partidoId", partidoId.ToString() }
            }
        };

        await _fcm.SendMulticastAsync(message);
    }

    private async Task<List<SuscriptorDto>> ObtenerSuscriptoresAsync(Guid partidoId, Guid equipoLocalId, Guid equipoVisitaId)
    {
        var suscripciones = await _supabase
            .From<SuscripcionNotificacion>()
            .Select("*, dispositivos_fcm(*)")
            .Where(s => s.Activa && 
                       (s.PartidoId == partidoId || 
                        s.EquipoId == equipoLocalId || 
                        s.EquipoId == equipoVisitaId))
            .Get();

        return suscripciones.Models.Select(s => new SuscriptorDto
        {
            UserId = s.UserId,
            Preferencias = JsonSerializer.Deserialize<PreferenciasDto>(s.Preferencias),
            Tokens = s.DispositivosFcm.Where(d => d.Activo).Select(d => d.FcmToken).ToList()
        }).ToList();
    }
}
```

### 4.6 Middleware

#### 4.6.1 ErrorHandlingMiddleware
```csharp
public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Acceso no autorizado");
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(new { error = "No tienes permisos para esta operación" });
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Recurso no encontrado");
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            await context.Response.WriteAsJsonAsync(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Operación inválida");
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error no controlado");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsJsonAsync(new { error = "Error interno del servidor" });
        }
    }
}
```

### 4.7 Configuración (Program.cs)

```csharp
var builder = WebApplication.CreateBuilder(args);

// Supabase Client
builder.Services.AddSingleton(provider =>
{
    var url = builder.Configuration["Supabase:Url"]!;
    var key = builder.Configuration["Supabase:AnonKey"]!;
    return new Supabase.Client(url, key, new Supabase.SupabaseOptions
    {
        AutoConnectRealtime = true
    });
});

// Servicios de Negocio
builder.Services.AddScoped<ILigaService, LigaService>();
builder.Services.AddScoped<IPartidosService, PartidosService>();
builder.Services.AddScoped<IGoleadoresService, GoleadoresService>();
builder.Services.AddScoped<ISolicitudesService, SolicitudesService>();
builder.Services.AddScoped<IResolucionesService, ResolucionesService>();
builder.Services.AddScoped<IFixtureGeneratorService, FixtureGeneratorService>();
builder.Services.AddScoped<ISuspensionManagerService, SuspensionManagerService>();
builder.Services.AddSingleton<INotificationService, NotificationService>();

// Firebase Cloud Messaging
builder.Services.AddSingleton(provider =>
{
    var credential = GoogleCredential.FromFile("firebase-adminsdk.json");
    return FirebaseMessaging.GetMessaging(FirebaseApp.Create(new AppOptions
    {
        Credential = credential
    }));
});

// JWT Auth
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var supabaseUrl = builder.Configuration["Supabase:Url"]!;
        options.Authority = $"{supabaseUrl}/auth/v1";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Supabase:JwtSecret"]!)),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

builder.Services.AddAuthorization(opts =>
{
    opts.AddPolicy("AdminOnly", p => p.RequireClaim("role", "admin"));
    opts.AddPolicy("Planillero", p => p.RequireClaim("role", "admin", "planillero"));
});

// SignalR
builder.Services.AddSignalR();

// CORS
builder.Services.AddCors(o => o.AddPolicy("Angular", p =>
    p.WithOrigins("http://localhost:4200", "https://sportzone.app")
     .AllowAnyHeader()
     .AllowAnyMethod()
     .AllowCredentials()));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("Angular");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<PartidoHub>("/hubs/partidos");

app.Run();
```



## 5. Diseño de Frontend (Angular 17)

### 5.1 Estructura de Proyecto

```
sportzone-web/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── liga.service.ts
│   │   │   │   ├── partidos.service.ts
│   │   │   │   ├── goleadores.service.ts
│   │   │   │   ├── solicitudes.service.ts
│   │   │   │   └── signalr.service.ts
│   │   │   └── models/
│   │   │       ├── partido.model.ts
│   │   │       ├── equipo.model.ts
│   │   │       └── ...
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   └── login.component.ts
│   │   │   ├── dashboard/
│   │   │   │   └── dashboard.component.ts
│   │   │   ├── liga/
│   │   │   │   ├── liga.component.ts
│   │   │   │   └── tabla-posiciones.component.ts
│   │   │   ├── goleadores/
│   │   │   │   └── goleadores.component.ts
│   │   │   ├── cronograma/
│   │   │   │   └── cronograma.component.ts
│   │   │   ├── partido-live/
│   │   │   │   ├── partido-live.component.ts
│   │   │   │   └── marcador-publico.component.ts
│   │   │   ├── solicitudes/
│   │   │   │   └── solicitudes.component.ts
│   │   │   └── resoluciones/
│   │   │       └── resoluciones.component.ts
│   │   ├── layout/
│   │   │   ├── shell/
│   │   │   │   └── shell.component.ts
│   │   │   ├── navbar/
│   │   │   │   └── navbar.component.ts
│   │   │   └── sidebar/
│   │   │       └── sidebar.component.ts
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── card-equipo.component.ts
│   │   │   │   ├── badge-estado.component.ts
│   │   │   │   └── timeline-evento.component.ts
│   │   │   └── pipes/
│   │   │       ├── minuto.pipe.ts
│   │   │       └── fecha.pipe.ts
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   └── app.component.ts
│   ├── assets/
│   │   ├── fonts/
│   │   │   ├── BebasNeue-Regular.ttf
│   │   │   └── Barlow-Regular.ttf
│   │   └── images/
│   ├── styles/
│   │   ├── _variables.scss
│   │   ├── _mixins.scss
│   │   └── styles.scss
│   └── environments/
│       ├── environment.ts
│       └── environment.prod.ts
├── angular.json
├── package.json
└── tsconfig.json
```

### 5.2 Configuración de Rutas

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component')
      .then(m => m.ShellComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'liga',
        loadComponent: () => import('./features/liga/liga.component')
          .then(m => m.LigaComponent)
      },
      {
        path: 'goleadores',
        loadComponent: () => import('./features/goleadores/goleadores.component')
          .then(m => m.GoleadoresComponent)
      },
      {
        path: 'cronograma',
        loadComponent: () => import('./features/cronograma/cronograma.component')
          .then(m => m.CronogramaComponent)
      },
      {
        path: 'partidos/:id/live',
        loadComponent: () => import('./features/partido-live/partido-live.component')
          .then(m => m.PartidoLiveComponent)
      },
      {
        path: 'partidos/:id/marcador',
        loadComponent: () => import('./features/partido-live/marcador-publico.component')
          .then(m => m.MarcadorPublicoComponent)
      },
      {
        path: 'solicitudes',
        loadComponent: () => import('./features/solicitudes/solicitudes.component')
          .then(m => m.SolicitudesComponent),
        canActivate: [authGuard]
      },
      {
        path: 'resoluciones',
        loadComponent: () => import('./features/resoluciones/resoluciones.component')
          .then(m => m.ResolucionesComponent),
        canActivate: [authGuard]
      }
    ]
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login.component')
      .then(m => m.LoginComponent)
  },
  { path: '**', redirectTo: '' }
];
```

### 5.3 Servicios con Signals

#### 5.3.1 LigaService
```typescript
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface PosicionEquipo {
  posicion: number;
  equipoId: string;
  equipoNombre: string;
  abreviatura: string;
  escudoUrl: string;
  pj: number; pg: number; pe: number; pp: number;
  gf: number; gc: number;
  puntos: number;
  diferencia: number;
}

@Injectable({ providedIn: 'root' })
export class LigaService {
  private readonly api = `${environment.apiUrl}/liga`;
  
  readonly torneoSeleccionado = signal<string | null>(null);
  readonly tabla = signal<PosicionEquipo[]>([]);
  readonly loading = signal(false);

  readonly zonaClasificacion = computed(() =>
    this.tabla().filter(e => e.posicion <= 4)
  );

  readonly zonaDescenso = computed(() => {
    const t = this.tabla();
    return t.slice(Math.max(0, t.length - 3));
  });

  constructor(private http: HttpClient) {}

  async cargarTabla(torneoId: string): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this.http
        .get<PosicionEquipo[]>(`${this.api}/posiciones/${torneoId}`)
        .toPromise();
      this.tabla.set(data ?? []);
      this.torneoSeleccionado.set(torneoId);
    } finally {
      this.loading.set(false);
    }
  }

  getTorneos() {
    return this.http.get<any[]>(`${this.api}/torneos`);
  }
}
```

#### 5.3.2 PartidosService con SignalR
```typescript
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environments/environment';

export interface PartidoEnVivo {
  id: string;
  equipoLocal: { nombre: string; escudo: string };
  equipoVisita: { nombre: string; escudo: string };
  golesLocal: number;
  golesVisita: number;
  minuto: number;
  estado: string;
  eventos: EventoPartido[];
}

export interface EventoPartido {
  minuto: number;
  tipo: 'gol' | 'tarjeta_amarilla' | 'tarjeta_roja' | 'sustitucion';
  jugador: string;
  equipo: string;
  descripcion?: string;
}

@Injectable({ providedIn: 'root' })
export class PartidosService {
  private readonly api = `${environment.apiUrl}/partidos`;
  private hubConnection?: signalR.HubConnection;

  readonly partidoEnVivo = signal<PartidoEnVivo | null>(null);
  readonly proximosPartidos = signal<any[]>([]);
  readonly conectado = signal(false);

  constructor(private http: HttpClient) {}

  cargarProximos(dias = 14) {
    return this.http.get<any[]>(`${this.api}/proximos?dias=${dias}`)
      .subscribe(data => this.proximosPartidos.set(data));
  }

  cargarEnVivo() {
    return this.http.get<PartidoEnVivo>(`${this.api}/en-vivo`)
      .subscribe(data => this.partidoEnVivo.set(data));
  }

  conectarLive(partidoId: string): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.hubUrl}/hubs/partidos`, {
        accessTokenFactory: () => localStorage.getItem('token') ?? ''
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('EventoRegistrado', (evento: EventoPartido) => {
      const actual = this.partidoEnVivo();
      if (actual) {
        this.partidoEnVivo.update(p => p ? {
          ...p,
          eventos: [...p.eventos, evento],
          golesLocal: evento.tipo === 'gol' && evento.equipo === actual.equipoLocal.nombre
            ? p.golesLocal + 1 : p.golesLocal,
          golesVisita: evento.tipo === 'gol' && evento.equipo === actual.equipoVisita.nombre
            ? p.golesVisita + 1 : p.golesVisita,
        } : null);
      }
    });

    this.hubConnection.on('MinutoActualizado', (minuto: number) => {
      this.partidoEnVivo.update(p => p ? { ...p, minuto } : null);
    });

    this.hubConnection.on('MarcadorActualizado', (data: { golesLocal: number; golesVisita: number }) => {
      this.partidoEnVivo.update(p => p ? { ...p, ...data } : null);
    });

    this.hubConnection.start()
      .then(() => {
        this.hubConnection!.invoke('SuscribirPartido', partidoId);
        this.conectado.set(true);
      })
      .catch(err => console.error('SignalR error:', err));
  }

  desconectarLive(partidoId: string): void {
    this.hubConnection?.invoke('DesuscribirPartido', partidoId);
    this.hubConnection?.stop();
    this.conectado.set(false);
  }
}
```

#### 5.3.3 AuthService con Supabase
```typescript
import { Injectable, signal, computed } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase: SupabaseClient;
  
  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly userRole = computed(() => 
    this.currentUser()?.user_metadata?.['role'] as string | undefined
  );
  readonly isAdmin = computed(() => this.userRole() === 'admin');
  readonly isPlanillero = computed(() => 
    this.userRole() === 'planillero' || this.isAdmin()
  );

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl, 
      environment.supabaseAnonKey
    );
    
    this.supabase.auth.getSession().then(({ data }) => {
      this.currentUser.set(data.session?.user ?? null);
    });
    
    this.supabase.auth.onAuthStateChange((_, session) => {
      this.currentUser.set(session?.user ?? null);
    });
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    if (error) throw error;
    return data;
  }

  async logout() {
    await this.supabase.auth.signOut();
    this.currentUser.set(null);
  }

  async getToken(): Promise<string | null> {
    const { data } = await this.supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }
}
```



### 5.4 Componentes Principales

#### 5.4.1 TablaPosicionesComponent
```typescript
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LigaService, PosicionEquipo } from '../../core/services/liga.service';

@Component({
  selector: 'app-tabla-posiciones',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tabla-container">
      <h2 class="titulo-seccion">TABLA DE POSICIONES</h2>
      
      @if (ligaService.loading()) {
        <div class="loading">Cargando...</div>
      } @else {
        <table class="tabla-posiciones">
          <thead>
            <tr>
              <th>POS</th>
              <th>EQUIPO</th>
              <th>PJ</th>
              <th>PG</th>
              <th>PE</th>
              <th>PP</th>
              <th>GF</th>
              <th>GC</th>
              <th>DIF</th>
              <th>PTS</th>
            </tr>
          </thead>
          <tbody>
            @for (equipo of ligaService.tabla(); track equipo.equipoId) {
              <tr [class.zona-clasificacion]="equipo.posicion <= 4"
                  [class.zona-descenso]="equipo.posicion > ligaService.tabla().length - 3">
                <td class="posicion">{{ equipo.posicion }}</td>
                <td class="equipo">
                  <img [src]="equipo.escudoUrl" [alt]="equipo.equipoNombre" class="escudo">
                  <span>{{ equipo.equipoNombre }}</span>
                </td>
                <td>{{ equipo.pj }}</td>
                <td>{{ equipo.pg }}</td>
                <td>{{ equipo.pe }}</td>
                <td>{{ equipo.pp }}</td>
                <td>{{ equipo.gf }}</td>
                <td>{{ equipo.gc }}</td>
                <td [class.positivo]="equipo.diferencia > 0"
                    [class.negativo]="equipo.diferencia < 0">
                  {{ equipo.diferencia > 0 ? '+' : '' }}{{ equipo.diferencia }}
                </td>
                <td class="puntos">{{ equipo.puntos }}</td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
  styles: [`
    .tabla-container {
      background: rgba(255, 255, 255, 0.02);
      border-radius: 12px;
      padding: 24px;
      backdrop-filter: blur(10px);
    }

    .titulo-seccion {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 32px;
      color: #00D4FF;
      margin-bottom: 24px;
      letter-spacing: 2px;
    }

    .tabla-posiciones {
      width: 100%;
      border-collapse: collapse;
      font-family: 'Barlow', sans-serif;
    }

    thead {
      background: rgba(0, 212, 255, 0.1);
      border-bottom: 2px solid #00D4FF;
    }

    th {
      padding: 12px 8px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #00D4FF;
      letter-spacing: 1px;
    }

    td {
      padding: 16px 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      color: #fff;
    }

    .equipo {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .escudo {
      width: 32px;
      height: 32px;
      object-fit: contain;
    }

    .posicion {
      font-weight: 700;
      font-size: 18px;
      color: #FFD60A;
    }

    .puntos {
      font-weight: 700;
      font-size: 18px;
      color: #00D4FF;
    }

    .positivo {
      color: #34C759;
    }

    .negativo {
      color: #FF2D55;
    }

    .zona-clasificacion {
      background: rgba(52, 199, 89, 0.05);
      border-left: 3px solid #34C759;
    }

    .zona-descenso {
      background: rgba(255, 45, 85, 0.05);
      border-left: 3px solid #FF2D55;
    }
  `]
})
export class TablaPosicionesComponent implements OnInit {
  constructor(public ligaService: LigaService) {}

  ngOnInit() {
    // Cargar tabla del torneo activo
    this.ligaService.cargarTabla('torneo-id-default');
  }
}
```

#### 5.4.2 PartidoLiveComponent
```typescript
import { Component, OnInit, OnDestroy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartidosService } from '../../core/services/partidos.service';

@Component({
  selector: 'app-partido-live',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="partido-live-container">
      @if (partidosService.partidoEnVivo(); as partido) {
        <div class="marcador">
          <div class="equipo equipo-local">
            <img [src]="partido.equipoLocal.escudo" [alt]="partido.equipoLocal.nombre">
            <h2>{{ partido.equipoLocal.nombre }}</h2>
            <div class="goles">{{ partido.golesLocal }}</div>
          </div>

          <div class="info-central">
            <div class="estado-badge">
              <span class="live-indicator"></span>
              EN VIVO
            </div>
            <div class="minuto">{{ partido.minuto }}'</div>
          </div>

          <div class="equipo equipo-visita">
            <div class="goles">{{ partido.golesVisita }}</div>
            <h2>{{ partido.equipoVisita.nombre }}</h2>
            <img [src]="partido.equipoVisita.escudo" [alt]="partido.equipoVisita.nombre">
          </div>
        </div>

        <div class="timeline">
          <h3>CRONOLOGÍA DEL PARTIDO</h3>
          <div class="eventos">
            @for (evento of partido.eventos; track $index) {
              <div class="evento" [class]="'evento-' + evento.tipo">
                <span class="minuto-evento">{{ evento.minuto }}'</span>
                <span class="icono-evento">
                  @switch (evento.tipo) {
                    @case ('gol') { ⚽ }
                    @case ('tarjeta_amarilla') { 🟨 }
                    @case ('tarjeta_roja') { 🟥 }
                    @case ('sustitucion') { 🔄 }
                  }
                </span>
                <span class="jugador-evento">{{ evento.jugador }}</span>
                <span class="equipo-evento">{{ evento.equipo }}</span>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="no-partido">
          <p>No hay partidos en vivo en este momento</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .partido-live-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .marcador {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(255, 45, 85, 0.1));
      border-radius: 16px;
      padding: 48px;
      margin-bottom: 32px;
      backdrop-filter: blur(20px);
    }

    .equipo {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .equipo img {
      width: 120px;
      height: 120px;
      object-fit: contain;
    }

    .equipo h2 {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 32px;
      color: #fff;
      text-align: center;
      letter-spacing: 2px;
    }

    .goles {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 80px;
      color: #00D4FF;
      font-weight: 700;
      text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
    }

    .info-central {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .estado-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #FF2D55;
      color: #fff;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 14px;
      letter-spacing: 1px;
    }

    .live-indicator {
      width: 8px;
      height: 8px;
      background: #fff;
      border-radius: 50%;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    .minuto {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 48px;
      color: #FFD60A;
      font-weight: 700;
    }

    .timeline {
      background: rgba(255, 255, 255, 0.02);
      border-radius: 12px;
      padding: 24px;
    }

    .timeline h3 {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 24px;
      color: #00D4FF;
      margin-bottom: 24px;
      letter-spacing: 2px;
    }

    .eventos {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .evento {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 8px;
      border-left: 3px solid transparent;
      transition: all 0.3s ease;
    }

    .evento-gol {
      border-left-color: #34C759;
    }

    .evento-tarjeta_amarilla {
      border-left-color: #FFD60A;
    }

    .evento-tarjeta_roja {
      border-left-color: #FF2D55;
    }

    .minuto-evento {
      font-weight: 700;
      color: #FFD60A;
      min-width: 40px;
    }

    .icono-evento {
      font-size: 24px;
    }

    .jugador-evento {
      font-weight: 600;
      color: #fff;
      flex: 1;
    }

    .equipo-evento {
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
    }
  `]
})
export class PartidoLiveComponent implements OnInit, OnDestroy {
  partidoId = input.required<string>();

  constructor(public partidosService: PartidosService) {}

  ngOnInit() {
    this.partidosService.cargarEnVivo();
    this.partidosService.conectarLive(this.partidoId());
  }

  ngOnDestroy() {
    this.partidosService.desconectarLive(this.partidoId());
  }
}
```

### 5.5 Estilos Globales

#### 5.5.1 Variables SCSS
```scss
// styles/_variables.scss
$color-primary: #00D4FF;
$color-secondary: #FF2D55;
$color-accent: #FFD60A;
$color-success: #34C759;
$color-warning: #FFD60A;
$color-danger: #FF2D55;

$bg-dark: #06090F;
$bg-card: rgba(255, 255, 255, 0.02);
$bg-hover: rgba(255, 255, 255, 0.05);

$font-primary: 'Barlow', sans-serif;
$font-display: 'Bebas Neue', sans-serif;

$border-radius: 12px;
$border-radius-sm: 8px;
$border-radius-lg: 16px;

$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;
```

#### 5.5.2 Estilos Globales
```scss
// styles/styles.scss
@import 'variables';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: $font-primary;
  background: $bg-dark;
  color: #fff;
  background-image: 
    linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  min-height: 100vh;
}

h1, h2, h3, h4, h5, h6 {
  font-family: $font-display;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: $border-radius-sm;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: $font-primary;
  
  &-primary {
    background: $color-primary;
    color: #000;
    
    &:hover {
      background: lighten($color-primary, 10%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 212, 255, 0.4);
    }
  }
  
  &-danger {
    background: $color-danger;
    color: #fff;
    
    &:hover {
      background: lighten($color-danger, 10%);
    }
  }
}

.card {
  background: $bg-card;
  border-radius: $border-radius;
  padding: $spacing-lg;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    background: $bg-hover;
    border-color: rgba(0, 212, 255, 0.2);
  }
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  
  &-success {
    background: rgba(52, 199, 89, 0.2);
    color: $color-success;
  }
  
  &-warning {
    background: rgba(255, 214, 10, 0.2);
    color: $color-warning;
  }
  
  &-danger {
    background: rgba(255, 45, 85, 0.2);
    color: $color-danger;
  }
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: $spacing-xl;
  color: $color-primary;
  font-size: 18px;
  
  &::after {
    content: '...';
    animation: dots 1.5s infinite;
  }
}

@keyframes dots {
  0%, 20% { content: '.'; }
  40% { content: '..'; }
  60%, 100% { content: '...'; }
}
```



## 6. Diseño de App Planillero (PWA)

### 6.1 Características PWA

```json
// manifest.json
{
  "name": "SportZone Planillero",
  "short_name": "Planillero",
  "description": "App para registro de eventos de partidos en vivo",
  "start_url": "/planillero",
  "display": "standalone",
  "orientation": "landscape",
  "background_color": "#06090F",
  "theme_color": "#00D4FF",
  "icons": [
    {
      "src": "/assets/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/assets/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 6.2 PlanilleroComponent

```typescript
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartidosService } from '../../core/services/partidos.service';
import { AuthService } from '../../core/services/auth.service';

interface EventoRapido {
  tipo: 'gol' | 'tarjeta_amarilla' | 'tarjeta_roja' | 'sustitucion';
  label: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-planillero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="planillero-container">
      <!-- Marcador Superior -->
      <div class="marcador-header">
        <div class="equipo-info">
          <img [src]="partido().equipoLocal.escudo" alt="Local">
          <span class="nombre-equipo">{{ partido().equipoLocal.nombre }}</span>
          <span class="goles-grande">{{ partido().golesLocal }}</span>
        </div>
        
        <div class="cronometro">
          <div class="minuto-display">{{ minutoActual() }}'</div>
          <div class="controles-tiempo">
            <button class="btn-tiempo" (click)="iniciarCronometro()" [disabled]="cronometroActivo()">
              ▶ INICIAR
            </button>
            <button class="btn-tiempo" (click)="pausarCronometro()" [disabled]="!cronometroActivo()">
              ⏸ PAUSAR
            </button>
            <button class="btn-tiempo btn-medio-tiempo" (click)="marcarMedioTiempo()">
              ⏱ MEDIO TIEMPO
            </button>
          </div>
        </div>

        <div class="equipo-info">
          <span class="goles-grande">{{ partido().golesVisita }}</span>
          <span class="nombre-equipo">{{ partido().equipoVisita.nombre }}</span>
          <img [src]="partido().equipoVisita.escudo" alt="Visita">
        </div>
      </div>

      <!-- Selector de Equipo -->
      <div class="selector-equipo">
        <button 
          class="btn-equipo"
          [class.activo]="equipoSeleccionado() === 'local'"
          (click)="seleccionarEquipo('local')">
          {{ partido().equipoLocal.nombre }}
        </button>
        <button 
          class="btn-equipo"
          [class.activo]="equipoSeleccionado() === 'visita'"
          (click)="seleccionarEquipo('visita')">
          {{ partido().equipoVisita.nombre }}
        </button>
      </div>

      <!-- Botones de Eventos Rápidos -->
      <div class="eventos-rapidos">
        @for (evento of eventosRapidos; track evento.tipo) {
          <button 
            class="btn-evento-rapido"
            [style.background]="evento.color"
            (click)="abrirModalEvento(evento.tipo)">
            <span class="icono-evento">{{ evento.icon }}</span>
            <span class="label-evento">{{ evento.label }}</span>
          </button>
        }
      </div>

      <!-- Lista de Jugadores -->
      <div class="lista-jugadores">
        <h3>SELECCIONAR JUGADOR</h3>
        <div class="jugadores-grid">
          @for (jugador of jugadoresEquipoSeleccionado(); track jugador.id) {
            <button 
              class="btn-jugador"
              (click)="seleccionarJugador(jugador)">
              <span class="numero">{{ jugador.numeroCamiseta }}</span>
              <span class="nombre">{{ jugador.nombre }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Botón Finalizar Partido -->
      <div class="acciones-partido">
        <button class="btn-finalizar" (click)="finalizarPartido()">
          🏁 FINALIZAR PARTIDO
        </button>
      </div>

      <!-- Timeline de Eventos -->
      <div class="timeline-eventos">
        <h3>EVENTOS REGISTRADOS</h3>
        @for (evento of partido().eventos; track $index) {
          <div class="evento-item">
            <span class="minuto">{{ evento.minuto }}'</span>
            <span class="tipo">{{ evento.tipo }}</span>
            <span class="jugador">{{ evento.jugador }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .planillero-container {
      min-height: 100vh;
      background: #06090F;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .marcador-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(255, 45, 85, 0.1));
      padding: 24px;
      border-radius: 16px;
    }

    .equipo-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .equipo-info img {
      width: 80px;
      height: 80px;
      object-fit: contain;
    }

    .nombre-equipo {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 28px;
      color: #fff;
      letter-spacing: 2px;
    }

    .goles-grande {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 72px;
      color: #00D4FF;
      font-weight: 700;
      text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
    }

    .cronometro {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .minuto-display {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 80px;
      color: #FFD60A;
      font-weight: 700;
      text-shadow: 0 0 30px rgba(255, 214, 10, 0.6);
    }

    .controles-tiempo {
      display: flex;
      gap: 12px;
    }

    .btn-tiempo {
      padding: 12px 24px;
      background: rgba(0, 212, 255, 0.2);
      border: 2px solid #00D4FF;
      border-radius: 8px;
      color: #00D4FF;
      font-weight: 700;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 120px;
    }

    .btn-tiempo:hover:not(:disabled) {
      background: #00D4FF;
      color: #000;
      transform: translateY(-2px);
    }

    .btn-tiempo:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .btn-medio-tiempo {
      border-color: #FFD60A;
      color: #FFD60A;
      background: rgba(255, 214, 10, 0.2);
    }

    .selector-equipo {
      display: flex;
      gap: 16px;
    }

    .btn-equipo {
      flex: 1;
      padding: 20px;
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid transparent;
      border-radius: 12px;
      color: #fff;
      font-family: 'Bebas Neue', sans-serif;
      font-size: 24px;
      letter-spacing: 2px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-equipo.activo {
      background: rgba(0, 212, 255, 0.2);
      border-color: #00D4FF;
      color: #00D4FF;
    }

    .eventos-rapidos {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .btn-evento-rapido {
      min-height: 120px;
      border: none;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .btn-evento-rapido:active {
      transform: scale(0.95);
    }

    .icono-evento {
      font-size: 48px;
    }

    .label-evento {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 24px;
      color: #fff;
      letter-spacing: 2px;
    }

    .lista-jugadores {
      background: rgba(255, 255, 255, 0.02);
      border-radius: 12px;
      padding: 24px;
    }

    .lista-jugadores h3 {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 24px;
      color: #00D4FF;
      margin-bottom: 16px;
      letter-spacing: 2px;
    }

    .jugadores-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 12px;
    }

    .btn-jugador {
      padding: 16px;
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid transparent;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      min-height: 100px;
    }

    .btn-jugador:hover {
      background: rgba(0, 212, 255, 0.1);
      border-color: #00D4FF;
    }

    .btn-jugador .numero {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 32px;
      color: #FFD60A;
      font-weight: 700;
    }

    .btn-jugador .nombre {
      font-size: 14px;
      color: #fff;
      text-align: center;
    }

    .btn-finalizar {
      width: 100%;
      padding: 24px;
      background: linear-gradient(135deg, #FF2D55, #FF6B6B);
      border: none;
      border-radius: 12px;
      color: #fff;
      font-family: 'Bebas Neue', sans-serif;
      font-size: 28px;
      letter-spacing: 2px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 20px rgba(255, 45, 85, 0.4);
    }

    .btn-finalizar:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 30px rgba(255, 45, 85, 0.6);
    }

    .timeline-eventos {
      background: rgba(255, 255, 255, 0.02);
      border-radius: 12px;
      padding: 24px;
      max-height: 300px;
      overflow-y: auto;
    }

    .timeline-eventos h3 {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 20px;
      color: #00D4FF;
      margin-bottom: 16px;
      letter-spacing: 2px;
    }

    .evento-item {
      display: flex;
      gap: 16px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 8px;
      margin-bottom: 8px;
      border-left: 3px solid #00D4FF;
    }

    .evento-item .minuto {
      font-weight: 700;
      color: #FFD60A;
      min-width: 40px;
    }

    .evento-item .tipo {
      color: #00D4FF;
      min-width: 120px;
    }

    .evento-item .jugador {
      color: #fff;
      flex: 1;
    }

    /* Optimización para tablets en landscape */
    @media (orientation: landscape) and (min-width: 768px) {
      .eventos-rapidos {
        grid-template-columns: repeat(4, 1fr);
      }

      .btn-evento-rapido {
        min-height: 140px;
      }
    }
  `]
})
export class PlanilleroComponent implements OnInit {
  partido = signal<any>(null);
  minutoActual = signal(0);
  cronometroActivo = signal(false);
  equipoSeleccionado = signal<'local' | 'visita'>('local');
  jugadoresEquipoSeleccionado = signal<any[]>([]);

  eventosRapidos: EventoRapido[] = [
    { tipo: 'gol', label: 'GOL', icon: '⚽', color: 'linear-gradient(135deg, #34C759, #30D158)' },
    { tipo: 'tarjeta_amarilla', label: 'AMARILLA', icon: '🟨', color: 'linear-gradient(135deg, #FFD60A, #FFCC00)' },
    { tipo: 'tarjeta_roja', label: 'ROJA', icon: '🟥', color: 'linear-gradient(135deg, #FF2D55, #FF3B30)' },
    { tipo: 'sustitucion', label: 'CAMBIO', icon: '🔄', color: 'linear-gradient(135deg, #00D4FF, #0A84FF)' }
  ];

  private cronometroInterval?: number;

  constructor(
    private partidosService: PartidosService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Cargar partido asignado al planillero
    this.cargarPartidoAsignado();
  }

  async cargarPartidoAsignado() {
    // Implementar lógica para cargar partido del planillero logueado
  }

  iniciarCronometro() {
    this.cronometroActivo.set(true);
    this.cronometroInterval = window.setInterval(() => {
      this.minutoActual.update(m => m + 1);
      // Sincronizar con backend cada 30 segundos
      if (this.minutoActual() % 30 === 0) {
        this.sincronizarMinuto();
      }
    }, 60000); // 1 minuto
  }

  pausarCronometro() {
    this.cronometroActivo.set(false);
    if (this.cronometroInterval) {
      clearInterval(this.cronometroInterval);
    }
  }

  async sincronizarMinuto() {
    // Enviar minuto actual al backend
  }

  marcarMedioTiempo() {
    this.pausarCronometro();
    // Registrar evento de medio tiempo
  }

  seleccionarEquipo(equipo: 'local' | 'visita') {
    this.equipoSeleccionado.set(equipo);
    // Cargar jugadores del equipo seleccionado
  }

  seleccionarJugador(jugador: any) {
    // Lógica para seleccionar jugador
  }

  abrirModalEvento(tipo: string) {
    // Abrir modal para registrar evento
  }

  async finalizarPartido() {
    // Doble confirmación
    const confirmar1 = confirm('¿Estás seguro de finalizar el partido?');
    if (!confirmar1) return;

    const confirmar2 = confirm(
      `Marcador final: ${this.partido().equipoLocal.nombre} ${this.partido().golesLocal} - ${this.partido().golesVisita} ${this.partido().equipoVisita.nombre}. ¿Confirmar?`
    );
    if (!confirmar2) return;

    // Enviar finalización al backend
  }
}
```



## 7. Algoritmos Críticos

### 7.1 Generador de Fixture (Round-Robin)

El algoritmo Round-Robin garantiza que todos los equipos se enfrenten entre sí exactamente una vez (ida) o dos veces (ida y vuelta).

#### Pseudocódigo
```
FUNCIÓN GenerarFixture(equipos[], fechaInicio, horariosDisponibles[], diasMinimos)
  n = equipos.length
  SI n es impar ENTONCES
    LANZAR ERROR "Número de equipos debe ser par"
  FIN SI

  partidos = []
  totalJornadas = n - 1
  partidosPorJornada = n / 2
  fechaActual = fechaInicio
  jornada = 1

  PARA j = 0 HASTA totalJornadas - 1 HACER
    PARA p = 0 HASTA partidosPorJornada - 1 HACER
      local = equipos[p]
      visita = equipos[n - 1 - p]

      // Alternar local/visita aleatoriamente
      SI Random(0, 1) == 0 ENTONCES
        INTERCAMBIAR(local, visita)
      FIN SI

      // Asignar horario aleatorio
      horario = horariosDisponibles[Random(0, horariosDisponibles.length - 1)]
      fechaHora = fechaActual + horario

      // Validar conflictos (mismo equipo no juega 2 veces el mismo día)
      MIENTRAS NO ValidarConflictos(local, fechaHora) O NO ValidarConflictos(visita, fechaHora) HACER
        fechaHora = fechaHora + 1 día
      FIN MIENTRAS

      partidos.AGREGAR({
        torneoId: torneoId,
        jornada: jornada,
        equipoLocalId: local,
        equipoVisitaId: visita,
        fechaHora: fechaHora
      })
    FIN PARA

    // Rotar equipos (excepto el primero que queda fijo)
    ultimo = equipos[n - 1]
    PARA i = n - 1 HASTA 2 HACER
      equipos[i] = equipos[i - 1]
    FIN PARA
    equipos[1] = ultimo

    jornada++
    fechaActual = fechaActual + diasMinimos días
  FIN PARA

  RETORNAR partidos
FIN FUNCIÓN

FUNCIÓN ValidarConflictos(equipoId, fechaHora)
  partidosEquipo = CONSULTAR partidos DONDE 
    (equipoLocalId == equipoId O equipoVisitaId == equipoId) Y
    fecha == fechaHora.fecha
  
  RETORNAR partidosEquipo.length == 0
FIN FUNCIÓN
```

#### Ejemplo de Rotación (6 equipos)
```
Jornada 1:  1-6  2-5  3-4
Jornada 2:  1-5  6-4  2-3
Jornada 3:  1-4  5-3  6-2
Jornada 4:  1-3  4-2  5-6
Jornada 5:  1-2  3-6  4-5
```

### 7.2 Sistema de Suspensiones Automáticas

#### Reglas de Suspensión
1. **3 Tarjetas Amarillas** → 1 partido de suspensión
2. **1 Tarjeta Roja** → 2 partidos de suspensión (configurable)
3. **2 Amarillas en el mismo partido** → Expulsión (equivalente a roja)

#### Pseudocódigo
```
FUNCIÓN VerificarSuspensiones(jugadorId, torneoId)
  stats = CONSULTAR estadisticas_jugador DONDE 
    jugadorId == jugadorId Y torneoId == torneoId

  // Verificar acumulación de amarillas
  SI stats.tarjetasAmarillas >= 3 Y stats.tarjetasAmarillas % 3 == 0 ENTONCES
    CrearSuspension({
      jugadorId: jugadorId,
      torneoId: torneoId,
      tipo: 'acumulacion_amarillas',
      partidosTotales: 1,
      motivo: 'Acumulación de 3 tarjetas amarillas'
    })
  FIN SI

  // Verificar tarjeta roja (se maneja en el trigger de eventos)
FIN FUNCIÓN

FUNCIÓN DescontarSuspension(jugadorId, partidoId)
  partido = CONSULTAR partidos DONDE id == partidoId
  
  suspensiones = CONSULTAR suspensiones DONDE
    jugadorId == jugadorId Y
    torneoId == partido.torneoId Y
    estado == 'activa'

  PARA CADA suspension EN suspensiones HACER
    suspension.partidosCumplidos++
    
    SI suspension.partidosCumplidos >= suspension.partidosTotales ENTONCES
      suspension.estado = 'cumplida'
    FIN SI

    ACTUALIZAR suspension
  FIN PARA
FIN FUNCIÓN

FUNCIÓN ValidarJugadorHabilitado(jugadorId, partidoId)
  partido = CONSULTAR partidos DONDE id == partidoId
  
  suspensionesActivas = CONSULTAR suspensiones DONDE
    jugadorId == jugadorId Y
    torneoId == partido.torneoId Y
    estado == 'activa'

  RETORNAR suspensionesActivas.length == 0
FIN FUNCIÓN
```

### 7.3 Actualización de Tabla de Posiciones

#### Pseudocódigo
```
FUNCIÓN ActualizarPosiciones(partidoId)
  partido = CONSULTAR partidos DONDE id == partidoId

  SI partido.estado != 'finalizado' ENTONCES
    LANZAR ERROR 'El partido no está finalizado'
  FIN SI

  // Determinar resultado
  SI partido.golesLocal > partido.golesVisita ENTONCES
    resultadoLocal = 'V'  // Victoria
    resultadoVisita = 'D' // Derrota
  SINO SI partido.golesLocal < partido.golesVisita ENTONCES
    resultadoLocal = 'D'
    resultadoVisita = 'V'
  SINO
    resultadoLocal = 'E'  // Empate
    resultadoVisita = 'E'
  FIN SI

  // Actualizar equipo local
  INSERTAR O ACTUALIZAR posiciones
    torneoId = partido.torneoId
    equipoId = partido.equipoLocalId
    pj = pj + 1
    pg = pg + (resultadoLocal == 'V' ? 1 : 0)
    pe = pe + (resultadoLocal == 'E' ? 1 : 0)
    pp = pp + (resultadoLocal == 'D' ? 1 : 0)
    gf = gf + partido.golesLocal
    gc = gc + partido.golesVisita

  // Actualizar equipo visita
  INSERTAR O ACTUALIZAR posiciones
    torneoId = partido.torneoId
    equipoId = partido.equipoVisitaId
    pj = pj + 1
    pg = pg + (resultadoVisita == 'V' ? 1 : 0)
    pe = pe + (resultadoVisita == 'E' ? 1 : 0)
    pp = pp + (resultadoVisita == 'D' ? 1 : 0)
    gf = gf + partido.golesVisita
    gc = gc + partido.golesLocal
FIN FUNCIÓN
```

### 7.4 Aplicación de Resoluciones Administrativas

#### Pseudocódigo
```
FUNCIÓN AplicarResolucion(resolucionId)
  resolucion = CONSULTAR resoluciones DONDE id == resolucionId

  SI resolucion.estado != 'emitida' ENTONCES
    LANZAR ERROR 'La resolución no está emitida'
  FIN SI

  SEGÚN resolucion.sancionTipo HACER
    CASO 'suspension':
      CrearSuspension({
        jugadorId: resolucion.jugadorId,
        torneoId: resolucion.torneoId,
        tipo: 'resolucion_administrativa',
        partidosTotales: resolucion.sancionValor,
        motivo: resolucion.asunto
      })

    CASO 'descuento_puntos':
      ACTUALIZAR posiciones
        DONDE equipoId == resolucion.equipoId Y torneoId == resolucion.torneoId
        ESTABLECER puntos = puntos - resolucion.sancionValor

    CASO 'wo_tecnico':
      ACTUALIZAR partidos
        DONDE id == resolucion.partidoId
        ESTABLECER 
          golesLocal = 3,
          golesVisita = 0,
          estado = 'finalizado'
      
      ActualizarPosiciones(resolucion.partidoId)

    CASO 'multa':
      // Registrar multa en sistema financiero
      RegistrarMulta(resolucion.equipoId, resolucion.sancionValor)

    CASO 'amonestacion':
      // Solo registro, sin efecto automático
      RegistrarAmonestacion(resolucion)
  FIN SEGÚN
FIN FUNCIÓN

FUNCIÓN RevertirResolucion(resolucionId)
  resolucion = CONSULTAR resoluciones DONDE id == resolucionId

  SEGÚN resolucion.sancionTipo HACER
    CASO 'suspension':
      ACTUALIZAR suspensiones
        DONDE jugadorId == resolucion.jugadorId Y tipo == 'resolucion_administrativa'
        ESTABLECER estado = 'anulada'

    CASO 'descuento_puntos':
      ACTUALIZAR posiciones
        DONDE equipoId == resolucion.equipoId Y torneoId == resolucion.torneoId
        ESTABLECER puntos = puntos + resolucion.sancionValor

    CASO 'wo_tecnico':
      // Revertir resultado del partido
      ACTUALIZAR partidos
        DONDE id == resolucion.partidoId
        ESTABLECER estado = 'programado'
      
      // Recalcular posiciones
      RecalcularPosiciones(resolucion.torneoId)
  FIN SEGÚN

  ACTUALIZAR resoluciones
    DONDE id == resolucionId
    ESTABLECER estado = 'anulada'
FIN FUNCIÓN
```

## 8. Flujos de Datos Críticos

### 8.1 Flujo de Registro de Evento (Gol)

```
1. Planillero presiona botón "GOL" en App Planillero
   ↓
2. App muestra modal para seleccionar jugador
   ↓
3. Planillero selecciona jugador y confirma
   ↓
4. App envía POST /partidos/{id}/eventos
   {
     "minuto": 23,
     "tipo": "gol",
     "jugadorId": "uuid",
     "equipoId": "uuid"
   }
   ↓
5. Backend valida:
   - Usuario es planillero asignado
   - Partido está en estado "en_curso"
   - Jugador pertenece al equipo
   ↓
6. Backend ejecuta trigger trg_actualizar_estadisticas:
   - Incrementa goles del jugador en estadisticas_jugador
   - Actualiza marcador en tabla partidos
   - Registra evento en eventos_partido
   ↓
7. Backend envía a SignalR Hub:
   - BroadcastEvento(partidoId, evento)
   - BroadcastMarcador(partidoId, golesLocal, golesVisita)
   ↓
8. SignalR Hub transmite a todos los clientes conectados:
   - Portal Web actualiza marcador en tiempo real
   - Marcador Público actualiza display
   ↓
9. Backend envía notificación push vía FCM:
   - Consulta suscriptores del partido/equipos
   - Filtra por preferencias (goles habilitados)
   - Envía notificación a dispositivos móviles
   ↓
10. App Planillero muestra confirmación visual
```

### 8.2 Flujo de Finalización de Partido

```
1. Planillero presiona "FINALIZAR PARTIDO"
   ↓
2. App muestra primer modal de confirmación
   ↓
3. Planillero confirma
   ↓
4. App muestra segundo modal con marcador final
   ↓
5. Planillero confirma nuevamente
   ↓
6. App envía PATCH /partidos/{id}/finalizar
   ↓
7. Backend valida:
   - Usuario es planillero asignado o admin
   - Partido está en estado "en_curso"
   ↓
8. Backend actualiza estado del partido a "finalizado"
   ↓
9. Backend ejecuta fn_actualizar_posiciones(partidoId):
   - Calcula resultado (V/E/D)
   - Actualiza PJ, PG, PE, PP, GF, GC de ambos equipos
   - Recalcula puntos y diferencia
   ↓
10. Backend verifica suspensiones de todos los jugadores:
    - Ejecuta fn_verificar_suspensiones para cada jugador con tarjetas
    - Crea suspensiones automáticas si aplica
    ↓
11. Backend envía a SignalR Hub:
    - BroadcastEstado(partidoId, "finalizado")
    ↓
12. Backend envía notificación push:
    - "Partido finalizado: Equipo A 2 - 1 Equipo B"
    ↓
13. Supabase Realtime notifica cambios en tabla posiciones:
    - Portal Web actualiza tabla automáticamente
    ↓
14. App Planillero muestra pantalla de resumen final
```

### 8.3 Flujo de Generación de Fixture

```
1. Admin accede a módulo de Fixture
   ↓
2. Admin selecciona:
   - Torneo
   - Equipos participantes
   - Fecha de inicio
   - Horarios disponibles (ej: 14:00, 16:00, 18:00, 20:00)
   - Días mínimos entre partidos (default: 3)
   ↓
3. Admin presiona "GENERAR FIXTURE"
   ↓
4. Frontend envía POST /partidos/generar-fixture
   {
     "torneoId": "uuid",
     "equipoIds": ["uuid1", "uuid2", ...],
     "fechaInicio": "2025-03-01",
     "horariosDisponibles": ["14:00", "16:00", "18:00", "20:00"],
     "diasMinimosEntrePartidos": 3,
     "seed": 12345  // Opcional para reproducibilidad
   }
   ↓
5. Backend ejecuta algoritmo Round-Robin:
   - Calcula totalJornadas = n - 1
   - Para cada jornada:
     * Empareja equipos según rotación
     * Alterna local/visita aleatoriamente
     * Asigna horario aleatorio
     * Valida que ningún equipo juegue 2 veces el mismo día
     * Si hay conflicto, mueve al día siguiente
   ↓
6. Backend inserta todos los partidos en tabla partidos
   ↓
7. Backend retorna lista de partidos generados
   ↓
8. Frontend muestra vista previa del fixture:
   - Agrupado por jornada
   - Con fechas y horarios
   - Opción de regenerar con diferente seed
   ↓
9. Admin confirma o regenera
```



## 9. Seguridad y Autenticación

### 9.1 Autenticación con Supabase Auth

#### Flujo de Login
```
1. Usuario ingresa email y contraseña en LoginComponent
   ↓
2. Frontend llama authService.login(email, password)
   ↓
3. AuthService llama supabase.auth.signInWithPassword()
   ↓
4. Supabase valida credenciales contra tabla auth.users
   ↓
5. Supabase retorna JWT con claims:
   {
     "sub": "user-uuid",
     "email": "user@example.com",
     "role": "admin",  // En user_metadata
     "aud": "authenticated",
     "exp": 1234567890
   }
   ↓
6. Frontend almacena token en localStorage
   ↓
7. AuthService actualiza signal currentUser
   ↓
8. Frontend redirige según rol:
   - admin → /dashboard
   - planillero → /planillero
   - arbitro → /consultas
   - público → /liga
```

#### Configuración de Roles en Supabase
```sql
-- Crear función para asignar rol en user_metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Por defecto, todos los usuarios son "publico"
  NEW.raw_user_meta_data = jsonb_set(
    COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"publico"'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para asignar rol por defecto
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Función para actualizar rol (solo admin puede ejecutar)
CREATE OR REPLACE FUNCTION public.update_user_role(user_id UUID, new_role TEXT)
RETURNS void AS $$
BEGIN
  -- Verificar que el usuario actual es admin
  IF (auth.jwt() ->> 'role') != 'admin' THEN
    RAISE EXCEPTION 'Solo administradores pueden cambiar roles';
  END IF;

  -- Validar rol
  IF new_role NOT IN ('admin', 'planillero', 'arbitro', 'publico') THEN
    RAISE EXCEPTION 'Rol inválido';
  END IF;

  -- Actualizar rol en user_metadata
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
    raw_user_meta_data,
    '{role}',
    to_jsonb(new_role)
  )
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 9.2 Autorización en Backend (.NET)

#### Políticas de Autorización
```csharp
builder.Services.AddAuthorization(opts =>
{
    // Solo administradores
    opts.AddPolicy("AdminOnly", p => 
        p.RequireClaim("role", "admin"));

    // Administradores y planilleros
    opts.AddPolicy("Planillero", p => 
        p.RequireClaim("role", "admin", "planillero"));

    // Administradores y árbitros
    opts.AddPolicy("Arbitro", p => 
        p.RequireClaim("role", "admin", "arbitro"));

    // Lectura pública (cualquier usuario autenticado o no)
    opts.AddPolicy("PublicRead", p => 
        p.RequireAssertion(_ => true));
});
```

#### Validación de Planillero Asignado
```csharp
public class PartidosService : IPartidosService
{
    public async Task<EventoPartidoDto> AddEventoAsync(
        Guid partidoId, 
        CreateEventoDto dto, 
        Guid userId)
    {
        var partido = await _supabase
            .From<Partido>()
            .Where(p => p.Id == partidoId)
            .Single();

        if (partido == null)
            throw new KeyNotFoundException("Partido no encontrado");

        // Verificar que el usuario es el planillero asignado o admin
        var userRole = _httpContext.User.FindFirst("role")?.Value;
        if (userRole != "admin" && partido.PlanilleroId != userId)
        {
            throw new UnauthorizedAccessException(
                "Solo el planillero asignado puede registrar eventos");
        }

        // Verificar que el partido está en curso
        if (partido.Estado != "en_curso")
        {
            throw new InvalidOperationException(
                "Solo se pueden registrar eventos en partidos en curso");
        }

        // Registrar evento...
    }
}
```

### 9.3 Row Level Security (RLS)

#### Políticas de Seguridad
```sql
-- Tabla partidos: lectura pública, escritura solo planillero asignado
ALTER TABLE partidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_partidos" ON partidos
  FOR SELECT USING (true);

CREATE POLICY "planillero_update_partido" ON partidos
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'admin' OR
    planillero_id = auth.uid()
  );

-- Tabla eventos_partido: lectura pública, inserción solo planillero asignado
ALTER TABLE eventos_partido ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_eventos" ON eventos_partido
  FOR SELECT USING (true);

CREATE POLICY "planillero_insert_eventos" ON eventos_partido
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR
    EXISTS (
      SELECT 1 FROM partidos 
      WHERE id = partido_id 
      AND planillero_id = auth.uid()
    )
  );

-- Tabla solicitudes: solo admins
ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access_solicitudes" ON solicitudes
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Tabla resoluciones: solo admins
ALTER TABLE resoluciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access_resoluciones" ON resoluciones
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Tabla suspensiones: lectura para árbitros y admins
ALTER TABLE suspensiones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "arbitro_read_suspensiones" ON suspensiones
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('admin', 'arbitro')
  );

CREATE POLICY "admin_write_suspensiones" ON suspensiones
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

### 9.4 Interceptor de Autenticación (Angular)

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  
  // Obtener token de forma asíncrona
  return from(auth.getToken()).pipe(
    switchMap(token => {
      if (token) {
        const authReq = req.clone({
          setHeaders: { 
            Authorization: `Bearer ${token}` 
          }
        });
        return next(authReq);
      }
      return next(req);
    })
  );
};
```

### 9.5 Guard de Rutas (Angular)

```typescript
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  router.navigate(['/auth/login']);
  return false;
};

export const adminGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAdmin()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};

export const planilleroGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isPlanillero()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
```

## 10. Manejo de Errores y Resiliencia

### 10.1 Estrategias de Retry

#### Backend - Notificaciones FCM
```csharp
public class NotificationService : INotificationService
{
    private const int MAX_RETRIES = 3;
    private const int INITIAL_DELAY_MS = 1000;

    public async Task EnviarNotificacionGolAsync(Guid partidoId, EventoPartidoDto evento)
    {
        var tokens = await ObtenerTokensAsync(partidoId);
        
        for (int retry = 0; retry < MAX_RETRIES; retry++)
        {
            try
            {
                var message = new MulticastMessage
                {
                    Tokens = tokens,
                    Notification = new Notification
                    {
                        Title = $"⚽ ¡GOL! {evento.EquipoNombre}",
                        Body = $"{evento.JugadorNombre} - Minuto {evento.Minuto}'"
                    }
                };

                var response = await _fcm.SendMulticastAsync(message);
                
                // Eliminar tokens inválidos
                if (response.FailureCount > 0)
                {
                    await EliminarTokensInvalidosAsync(response);
                }

                return;
            }
            catch (FirebaseMessagingException ex)
            {
                _logger.LogWarning(ex, $"Intento {retry + 1} de envío de notificación falló");
                
                if (retry == MAX_RETRIES - 1)
                {
                    _logger.LogError(ex, "Falló el envío de notificación después de {Retries} intentos", MAX_RETRIES);
                    throw;
                }

                // Backoff exponencial
                await Task.Delay(INITIAL_DELAY_MS * (int)Math.Pow(2, retry));
            }
        }
    }
}
```

#### Frontend - Reconexión SignalR
```typescript
export class PartidosService {
  conectarLive(partidoId: string): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.hubUrl}/hubs/partidos`, {
        accessTokenFactory: () => localStorage.getItem('token') ?? ''
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Backoff exponencial: 0s, 2s, 10s, 30s, luego cada 60s
          if (retryContext.previousRetryCount === 0) return 0;
          if (retryContext.previousRetryCount === 1) return 2000;
          if (retryContext.previousRetryCount === 2) return 10000;
          if (retryContext.previousRetryCount === 3) return 30000;
          return 60000;
        }
      })
      .build();

    this.hubConnection.onreconnecting(() => {
      console.log('SignalR reconectando...');
      this.conectado.set(false);
    });

    this.hubConnection.onreconnected(() => {
      console.log('SignalR reconectado');
      this.hubConnection!.invoke('SuscribirPartido', partidoId);
      this.conectado.set(true);
    });

    this.hubConnection.onclose(() => {
      console.log('SignalR desconectado');
      this.conectado.set(false);
    });

    // Configurar eventos...
    this.hubConnection.start()
      .then(() => {
        this.hubConnection!.invoke('SuscribirPartido', partidoId);
        this.conectado.set(true);
      })
      .catch(err => {
        console.error('Error al conectar SignalR:', err);
        // Reintentar después de 5 segundos
        setTimeout(() => this.conectarLive(partidoId), 5000);
      });
  }
}
```

### 10.2 Circuit Breaker Pattern

```csharp
public class CircuitBreakerService
{
    private int _failureCount = 0;
    private DateTime _lastFailureTime = DateTime.MinValue;
    private const int FAILURE_THRESHOLD = 5;
    private const int TIMEOUT_SECONDS = 60;

    public async Task<T> ExecuteAsync<T>(Func<Task<T>> action)
    {
        if (_failureCount >= FAILURE_THRESHOLD)
        {
            if ((DateTime.UtcNow - _lastFailureTime).TotalSeconds < TIMEOUT_SECONDS)
            {
                throw new InvalidOperationException("Circuit breaker is open");
            }
            else
            {
                // Reset después del timeout
                _failureCount = 0;
            }
        }

        try
        {
            var result = await action();
            _failureCount = 0;  // Reset en éxito
            return result;
        }
        catch (Exception)
        {
            _failureCount++;
            _lastFailureTime = DateTime.UtcNow;
            throw;
        }
    }
}
```

### 10.3 Logging y Monitoreo

```csharp
// Program.cs
builder.Services.AddLogging(logging =>
{
    logging.AddConsole();
    logging.AddDebug();
    logging.AddApplicationInsights();  // Azure Application Insights
});

// Middleware de logging
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();
            
            _logger.LogInformation(
                "Request {Method} {Path} completed in {ElapsedMs}ms with status {StatusCode}",
                context.Request.Method,
                context.Request.Path,
                stopwatch.ElapsedMilliseconds,
                context.Response.StatusCode
            );
        }
    }
}
```

## 11. Rendimiento y Optimización

### 11.1 Caché en Backend

```csharp
public class LigaService : ILigaService
{
    private readonly IMemoryCache _cache;
    private const int CACHE_DURATION_MINUTES = 5;

    public async Task<List<PosicionEquipo>> GetTablaPosicionesAsync(Guid torneoId)
    {
        var cacheKey = $"tabla-posiciones-{torneoId}";
        
        if (_cache.TryGetValue(cacheKey, out List<PosicionEquipo> tabla))
        {
            return tabla;
        }

        tabla = await _supabase
            .From<Posicion>()
            .Select("*, equipos(*)")
            .Where(p => p.TorneoId == torneoId)
            .Order("puntos", Ordering.Descending)
            .Order("diferencia", Ordering.Descending)
            .Get();

        _cache.Set(cacheKey, tabla, TimeSpan.FromMinutes(CACHE_DURATION_MINUTES));
        
        return tabla;
    }

    public async Task InvalidarCacheTablaAsync(Guid torneoId)
    {
        var cacheKey = $"tabla-posiciones-{torneoId}";
        _cache.Remove(cacheKey);
    }
}
```

### 11.2 Paginación en API

```csharp
public class SolicitudesService : ISolicitudesService
{
    public async Task<PagedResult<SolicitudDto>> GetSolicitudesAsync(
        string? estado, 
        string? tipo, 
        int page = 1, 
        int pageSize = 20)
    {
        var query = _supabase.From<Solicitud>().Select("*");

        if (!string.IsNullOrEmpty(estado))
            query = query.Where(s => s.Estado == estado);

        if (!string.IsNullOrEmpty(tipo))
            query = query.Where(s => s.Tipo == tipo);

        var totalCount = await query.Count();
        
        var items = await query
            .Order("created_at", Ordering.Descending)
            .Range((page - 1) * pageSize, page * pageSize - 1)
            .Get();

        return new PagedResult<SolicitudDto>
        {
            Items = items.Models.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };
    }
}
```

### 11.3 Lazy Loading en Angular

```typescript
// Todas las rutas usan lazy loading
export const routes: Routes = [
  {
    path: 'liga',
    loadComponent: () => import('./features/liga/liga.component')
      .then(m => m.LigaComponent)
  },
  {
    path: 'goleadores',
    loadComponent: () => import('./features/goleadores/goleadores.component')
      .then(m => m.GoleadoresComponent)
  }
  // ...
];
```

### 11.4 Optimización de Imágenes

```typescript
// Directiva para lazy loading de imágenes
@Directive({
  selector: 'img[appLazyLoad]',
  standalone: true
})
export class LazyLoadDirective implements OnInit {
  @Input() src!: string;
  
  constructor(private el: ElementRef<HTMLImageElement>) {}

  ngOnInit() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.el.nativeElement.src = this.src;
          observer.unobserve(this.el.nativeElement);
        }
      });
    });

    observer.observe(this.el.nativeElement);
  }
}
```

## 12. Deployment y DevOps

### 12.1 Configuración de Entornos

#### Backend (appsettings.json)
```json
{
  "Supabase": {
    "Url": "https://tu-proyecto.supabase.co",
    "AnonKey": "tu-anon-key",
    "JwtSecret": "tu-jwt-secret"
  },
  "Firebase": {
    "ProjectId": "sportzone-pro",
    "CredentialsPath": "firebase-adminsdk.json"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Cors": {
    "Origins": ["http://localhost:4200", "https://sportzone.app"]
  }
}
```

#### Frontend (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  hubUrl: 'http://localhost:5000',
  supabaseUrl: 'https://tu-proyecto.supabase.co',
  supabaseAnonKey: 'tu-anon-key'
};

export const environment_prod = {
  production: true,
  apiUrl: 'https://api.sportzone.app/api',
  hubUrl: 'https://api.sportzone.app',
  supabaseUrl: 'https://tu-proyecto.supabase.co',
  supabaseAnonKey: 'tu-anon-key'
};
```

### 12.2 Docker Configuration

```dockerfile
# Backend Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["SportZone.API/SportZone.API.csproj", "SportZone.API/"]
RUN dotnet restore "SportZone.API/SportZone.API.csproj"
COPY . .
WORKDIR "/src/SportZone.API"
RUN dotnet build "SportZone.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SportZone.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SportZone.API.dll"]
```

```dockerfile
# Frontend Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build --prod

FROM nginx:alpine
COPY --from=build /app/dist/sportzone-web /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

**Fin del Documento de Diseño Técnico**

Este documento proporciona una especificación técnica completa para la implementación de SportZone Pro. Todos los componentes, algoritmos y flujos de datos están diseñados para trabajar en conjunto y cumplir con los 24 requerimientos especificados en el documento de requerimientos.
