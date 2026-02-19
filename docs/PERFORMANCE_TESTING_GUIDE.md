# Guía de Testing de Rendimiento - SportZone Pro

## Índice

1. [Introducción](#introducción)
2. [Objetivos de Rendimiento](#objetivos-de-rendimiento)
3. [Test 1: 1000 Usuarios Concurrentes en SignalR](#test-1-1000-usuarios-concurrentes-en-signalr)
4. [Test 2: 10 Eventos por Segundo](#test-2-10-eventos-por-segundo)
5. [Test 3: 10,000 Dispositivos Push](#test-3-10000-dispositivos-push)
6. [Test 4: 50 Partidos en Vivo Simultáneos](#test-4-50-partidos-en-vivo-simultáneos)
7. [Herramientas de Testing](#herramientas-de-testing)
8. [Monitoreo y Métricas](#monitoreo-y-métricas)
9. [Troubleshooting](#troubleshooting)

---

## Introducción

Esta guía proporciona procedimientos detallados para realizar pruebas de rendimiento del sistema SportZone Pro, enfocándose en los componentes críticos de tiempo real: SignalR, procesamiento de eventos, notificaciones push y gestión de múltiples partidos simultáneos.

### Contexto del Sistema

- **Backend**: .NET 8 Web API con SignalR Hub
- **Base de Datos**: Supabase PostgreSQL
- **Tiempo Real**: SignalR (WebSocket)
- **Notificaciones**: Firebase Cloud Messaging (FCM)
- **Frontend**: Angular 17 con Signals

### Requisitos Previos

- Acceso al entorno de testing/staging
- Credenciales de administrador
- Herramientas de load testing instaladas
- Acceso a métricas y logs del sistema

---

## Objetivos de Rendimiento

Según el **Requerimiento 12** del documento de requisitos, el sistema debe cumplir:

| Métrica | Objetivo | Criterio de Aceptación |
|---------|----------|------------------------|
| **Usuarios concurrentes SignalR** | 1000+ | Entrega de eventos < 2 segundos |
| **Procesamiento de eventos** | 10 eventos/segundo | Tiempo de respuesta < 1 segundo |
| **Notificaciones push** | 10,000 dispositivos | Entrega completa < 10 segundos |
| **Partidos simultáneos** | 50 partidos en vivo | Sin degradación de rendimiento |
| **Consultas a BD** | Optimizadas | Uso de índices en match_id, team_id, timestamp |


---

## Test 1: 1000 Usuarios Concurrentes en SignalR

### Objetivo

Verificar que el SignalR Hub puede manejar 1000+ conexiones WebSocket simultáneas y entregar eventos en menos de 2 segundos.

### Herramientas Recomendadas

- **Artillery** (Node.js load testing)
- **SignalR Client .NET** (para scripts personalizados)
- **Azure Load Testing** (si está en Azure)

### Configuración del Test

#### Opción A: Artillery con Plugin SignalR

1. **Instalar Artillery**:
```bash
npm install -g artillery
npm install -g artillery-plugin-signalr
```

2. **Crear archivo de configuración** `signalr-load-test.yml`:

```yaml
config:
  target: "https://api.sportzone.app"
  phases:
    - duration: 60
      arrivalRate: 50  # 50 usuarios por segundo
      name: "Ramp up"
    - duration: 300
      arrivalRate: 100  # 100 usuarios por segundo
      name: "Sustained load"
  plugins:
    signalr:
      hubUrl: "/hubs/partidos"
      
scenarios:
  - name: "Connect and subscribe to match"
    engine: signalr
    flow:
      - connect:
          hubUrl: "/hubs/partidos"
          headers:
            Authorization: "Bearer {{ $randomString() }}"
      - invoke:
          method: "SuscribirPartido"
          arguments:
            - "{{ partidoId }}"
      - listen:
          event: "EventoRegistrado"
          timeout: 300
      - listen:
          event: "MarcadorActualizado"
          timeout: 300
```

3. **Ejecutar el test**:
```bash
artillery run signalr-load-test.yml --output report.json
artillery report report.json
```


#### Opción B: Script C# Personalizado

Crear un proyecto de consola .NET para simular múltiples clientes:

```csharp
using Microsoft.AspNetCore.SignalR.Client;
using System.Diagnostics;

class SignalRLoadTest
{
    static async Task Main(string[] args)
    {
        const int NUM_CLIENTS = 1000;
        const string HUB_URL = "https://api.sportzone.app/hubs/partidos";
        const string PARTIDO_ID = "your-partido-id";
        
        var connections = new List<HubConnection>();
        var latencies = new List<long>();
        var stopwatch = new Stopwatch();
        
        Console.WriteLine($"Conectando {NUM_CLIENTS} clientes...");
        
        // Crear y conectar clientes
        for (int i = 0; i < NUM_CLIENTS; i++)
        {
            var connection = new HubConnectionBuilder()
                .WithUrl(HUB_URL)
                .WithAutomaticReconnect()
                .Build();
                
            connection.On<object>("EventoRegistrado", (evento) =>
            {
                var latency = stopwatch.ElapsedMilliseconds;
                latencies.Add(latency);
                Console.WriteLine($"Cliente {i}: Evento recibido en {latency}ms");
            });
            
            await connection.StartAsync();
            await connection.InvokeAsync("SuscribirPartido", PARTIDO_ID);
            connections.Add(connection);
            
            if (i % 100 == 0)
                Console.WriteLine($"Conectados: {i + 1}/{NUM_CLIENTS}");
        }
        
        Console.WriteLine($"\n✅ {NUM_CLIENTS} clientes conectados");
        Console.WriteLine("Presiona ENTER para simular evento broadcast...");
        Console.ReadLine();
        
        // Simular broadcast de evento
        stopwatch.Restart();
        // (Aquí deberías triggear un evento real desde el backend)
        
        await Task.Delay(5000); // Esperar respuestas
        
        // Calcular estadísticas
        var avgLatency = latencies.Average();
        var maxLatency = latencies.Max();
        var p95Latency = latencies.OrderBy(x => x).ElementAt((int)(latencies.Count * 0.95));
        
        Console.WriteLine($"\n📊 Resultados:");
        Console.WriteLine($"   Latencia promedio: {avgLatency:F2}ms");
        Console.WriteLine($"   Latencia máxima: {maxLatency}ms");
        Console.WriteLine($"   Latencia P95: {p95Latency}ms");
        Console.WriteLine($"   Eventos recibidos: {latencies.Count}/{NUM_CLIENTS}");
        
        // Desconectar
        foreach (var conn in connections)
            await conn.StopAsync();
    }
}
```

### Métricas a Recolectar

| Métrica | Objetivo | Cómo Medir |
|---------|----------|------------|
| **Conexiones exitosas** | 100% | Contar conexiones establecidas |
| **Latencia promedio** | < 2000ms | Tiempo desde broadcast hasta recepción |
| **Latencia P95** | < 3000ms | Percentil 95 de latencias |
| **Tasa de error** | < 1% | Conexiones fallidas / Total |
| **Uso de CPU** | < 70% | Azure Monitor / Task Manager |
| **Uso de memoria** | < 4GB | Azure Monitor / Task Manager |
| **Ancho de banda** | Monitorear | Network I/O |

### Criterios de Éxito

✅ **PASA** si:
- 1000+ clientes se conectan exitosamente
- Latencia promedio < 2 segundos
- Tasa de error < 1%
- Sin crashes del servidor

❌ **FALLA** si:
- Latencia promedio > 2 segundos
- Más del 1% de conexiones fallan
- El servidor se cae o reinicia


---

## Test 2: 10 Eventos por Segundo

### Objetivo

Verificar que el sistema puede procesar 10 eventos de partido por segundo manteniendo tiempos de respuesta menores a 1 segundo.

### Herramientas Recomendadas

- **Apache JMeter** (HTTP load testing)
- **k6** (modern load testing)
- **Postman Collection Runner**

### Configuración del Test

#### Opción A: k6 Script

1. **Instalar k6**:
```bash
# Windows (Chocolatey)
choco install k6

# macOS (Homebrew)
brew install k6

# Linux
sudo apt-get install k6
```

2. **Crear script** `event-load-test.js`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 5 },   // Ramp up a 5 eventos/seg
    { duration: '60s', target: 10 },  // Mantener 10 eventos/seg
    { duration: '30s', target: 15 },  // Pico de 15 eventos/seg
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% de requests < 1s
    errors: ['rate<0.01'],              // Tasa de error < 1%
  },
};

const BASE_URL = 'https://api.sportzone.app';
const PARTIDO_ID = __ENV.PARTIDO_ID || 'your-partido-id';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || 'your-jwt-token';

const EVENTOS = [
  { tipo: 'gol', jugadorId: 'jugador-1', equipoId: 'equipo-1', minuto: 15 },
  { tipo: 'tarjeta_amarilla', jugadorId: 'jugador-2', equipoId: 'equipo-2', minuto: 23 },
  { tipo: 'sustitucion', jugadorId: 'jugador-3', equipoId: 'equipo-1', minuto: 45 },
  { tipo: 'gol', jugadorId: 'jugador-4', equipoId: 'equipo-2', minuto: 67 },
  { tipo: 'tarjeta_roja', jugadorId: 'jugador-5', equipoId: 'equipo-1', minuto: 78 },
];

export default function () {
  const evento = EVENTOS[Math.floor(Math.random() * EVENTOS.length)];
  evento.minuto = Math.floor(Math.random() * 90) + 1;
  
  const payload = JSON.stringify(evento);
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`,
    },
  };
  
  const response = http.post(
    `${BASE_URL}/api/partidos/${PARTIDO_ID}/eventos`,
    payload,
    params
  );
  
  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 1s': (r) => r.timings.duration < 1000,
    'has evento id': (r) => JSON.parse(r.body).id !== undefined,
  });
  
  errorRate.add(!success);
  
  sleep(0.1); // 100ms entre requests
}
```

3. **Ejecutar el test**:
```bash
k6 run event-load-test.js \
  --env PARTIDO_ID=your-partido-id \
  --env AUTH_TOKEN=your-jwt-token
```


#### Opción B: Apache JMeter

1. **Crear Test Plan**:
   - Thread Group: 10 threads, loop infinito, duración 5 minutos
   - HTTP Request: POST `/api/partidos/{id}/eventos`
   - Constant Throughput Timer: 600 samples/min (10/seg)

2. **Configuración del HTTP Request**:
```
Method: POST
Path: /api/partidos/${PARTIDO_ID}/eventos
Body Data:
{
  "minuto": ${__Random(1,90)},
  "tipo": "${__chooseRandom(gol,tarjeta_amarilla,tarjeta_roja,sustitucion)}",
  "jugadorId": "${JUGADOR_ID}",
  "equipoId": "${EQUIPO_ID}"
}
Headers:
  Content-Type: application/json
  Authorization: Bearer ${JWT_TOKEN}
```

3. **Listeners a agregar**:
   - Summary Report
   - Response Time Graph
   - Aggregate Report

### Métricas a Recolectar

| Métrica | Objetivo | Cómo Medir |
|---------|----------|------------|
| **Throughput** | 10 eventos/seg | Requests completados por segundo |
| **Tiempo de respuesta promedio** | < 500ms | Promedio de response time |
| **Tiempo de respuesta P95** | < 1000ms | Percentil 95 |
| **Tasa de error** | < 1% | Requests fallidos / Total |
| **Tiempo de procesamiento DB** | < 200ms | Query execution time |
| **Uso de CPU backend** | < 60% | Azure Monitor |

### Validaciones Adicionales

Después del test, verificar:

```sql
-- Verificar que todos los eventos se registraron
SELECT COUNT(*) FROM eventos_partido 
WHERE created_at > NOW() - INTERVAL '10 minutes';

-- Verificar integridad de marcadores
SELECT 
  p.id,
  p.goles_local,
  p.goles_visita,
  (SELECT COUNT(*) FROM eventos_partido 
   WHERE partido_id = p.id AND tipo = 'gol' AND equipo_id = p.equipo_local_id) as goles_local_calculado,
  (SELECT COUNT(*) FROM eventos_partido 
   WHERE partido_id = p.id AND tipo = 'gol' AND equipo_id = p.equipo_visita_id) as goles_visita_calculado
FROM partidos p
WHERE p.estado = 'en_curso';

-- Verificar que no hay deadlocks
SELECT * FROM pg_stat_database WHERE datname = 'sportzone';
```

### Criterios de Éxito

✅ **PASA** si:
- Throughput sostenido de 10+ eventos/seg
- Tiempo de respuesta P95 < 1 segundo
- Tasa de error < 1%
- Todos los eventos se persisten correctamente
- Marcadores se actualizan correctamente

❌ **FALLA** si:
- Throughput cae por debajo de 10 eventos/seg
- Tiempo de respuesta P95 > 1 segundo
- Hay inconsistencias en los datos


---

## Test 3: 10,000 Dispositivos Push

### Objetivo

Verificar que el sistema puede enviar notificaciones push a 10,000 dispositivos en menos de 10 segundos usando Firebase Cloud Messaging.

### Prerequisitos

⚠️ **IMPORTANTE**: Este test requiere credenciales de Firebase configuradas. Ver `docs/FIREBASE_SETUP_PENDIENTE.md` para detalles.

### Herramientas Recomendadas

- **Firebase Admin SDK** (para scripts de testing)
- **Custom C# Script** (usando el NotificationService existente)

### Configuración del Test

#### Script de Simulación de Tokens

1. **Crear script para generar tokens de prueba** `generate-test-tokens.sql`:

```sql
-- Crear 10,000 tokens FCM de prueba
DO $$
DECLARE
  i INT;
  test_user_id UUID;
BEGIN
  -- Crear usuario de prueba
  INSERT INTO auth.users (email, encrypted_password)
  VALUES ('test-push@sportzone.app', crypt('password', gen_salt('bf')))
  RETURNING id INTO test_user_id;
  
  -- Generar 10,000 tokens
  FOR i IN 1..10000 LOOP
    INSERT INTO dispositivos_fcm (user_id, fcm_token, plataforma, activo)
    VALUES (
      test_user_id,
      'test_token_' || i || '_' || md5(random()::text),
      CASE WHEN i % 2 = 0 THEN 'android' ELSE 'ios' END,
      true
    );
  END LOOP;
  
  -- Suscribir a un partido de prueba
  INSERT INTO suscripciones_notificaciones (user_id, partido_id, activa)
  VALUES (test_user_id, 'your-partido-id', true);
  
  RAISE NOTICE 'Creados 10,000 tokens de prueba para user_id: %', test_user_id;
END $$;
```

2. **Script C# para test de notificaciones**:

```csharp
using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;
using System.Diagnostics;

class PushNotificationLoadTest
{
    static async Task Main(string[] args)
    {
        // Inicializar Firebase
        FirebaseApp.Create(new AppOptions
        {
            Credential = GoogleCredential.FromFile("firebase-adminsdk.json")
        });
        
        var messaging = FirebaseMessaging.DefaultInstance;
        
        // Obtener tokens de prueba desde la BD
        var tokens = await GetTestTokensFromDatabase(10000);
        Console.WriteLine($"Obtenidos {tokens.Count} tokens de prueba");
        
        // Preparar mensaje
        var message = new MulticastMessage
        {
            Tokens = tokens,
            Notification = new Notification
            {
                Title = "⚽ ¡GOL! Test de Carga",
                Body = "Este es un test de rendimiento con 10,000 dispositivos"
            },
            Data = new Dictionary<string, string>
            {
                { "tipo", "gol" },
                { "partidoId", "test-partido-id" },
                { "test", "true" }
            }
        };
        
        Console.WriteLine("Enviando notificaciones...");
        var stopwatch = Stopwatch.StartNew();
        
        // FCM tiene límite de 500 tokens por request
        var batches = tokens.Chunk(500).ToList();
        var tasks = new List<Task<BatchResponse>>();
        
        foreach (var batch in batches)
        {
            var batchMessage = new MulticastMessage
            {
                Tokens = batch.ToList(),
                Notification = message.Notification,
                Data = message.Data
            };
            tasks.Add(messaging.SendMulticastAsync(batchMessage));
        }
        
        var responses = await Task.WhenAll(tasks);
        stopwatch.Stop();
        
        // Calcular estadísticas
        var totalSuccess = responses.Sum(r => r.SuccessCount);
        var totalFailure = responses.Sum(r => r.FailureCount);
        var elapsedSeconds = stopwatch.Elapsed.TotalSeconds;
        
        Console.WriteLine($"\n📊 Resultados:");
        Console.WriteLine($"   Tiempo total: {elapsedSeconds:F2} segundos");
        Console.WriteLine($"   Notificaciones exitosas: {totalSuccess}");
        Console.WriteLine($"   Notificaciones fallidas: {totalFailure}");
        Console.WriteLine($"   Tasa de éxito: {(totalSuccess * 100.0 / tokens.Count):F2}%");
        Console.WriteLine($"   Throughput: {(tokens.Count / elapsedSeconds):F0} notif/seg");
        
        // Verificar criterio de éxito
        if (elapsedSeconds <= 10 && totalSuccess >= tokens.Count * 0.99)
        {
            Console.WriteLine("\n✅ TEST PASADO");
        }
        else
        {
            Console.WriteLine("\n❌ TEST FALLIDO");
            if (elapsedSeconds > 10)
                Console.WriteLine($"   Tiempo excedido: {elapsedSeconds:F2}s > 10s");
            if (totalSuccess < tokens.Count * 0.99)
                Console.WriteLine($"   Tasa de éxito baja: {(totalSuccess * 100.0 / tokens.Count):F2}% < 99%");
        }
    }
    
    static async Task<List<string>> GetTestTokensFromDatabase(int count)
    {
        // Implementar conexión a Supabase y obtener tokens
        // Por simplicidad, aquí se muestra el concepto
        var tokens = new List<string>();
        for (int i = 0; i < count; i++)
        {
            tokens.Add($"test_token_{i}");
        }
        return tokens;
    }
}
```


### Métricas a Recolectar

| Métrica | Objetivo | Cómo Medir |
|---------|----------|------------|
| **Tiempo total de envío** | < 10 segundos | Stopwatch desde inicio hasta fin |
| **Tasa de éxito** | > 99% | Notificaciones exitosas / Total |
| **Throughput** | > 1000 notif/seg | Total / Tiempo |
| **Latencia FCM** | < 500ms | Tiempo de respuesta de FCM API |
| **Uso de memoria** | < 2GB | Durante el envío masivo |

### Consideraciones Importantes

1. **Límites de FCM**:
   - Máximo 500 tokens por request multicast
   - Rate limit: 600,000 requests/minuto (10,000/seg)
   - Usar batching para optimizar

2. **Tokens Inválidos**:
   - FCM retorna tokens inválidos en la respuesta
   - El sistema debe limpiarlos automáticamente
   - Verificar que `NotificationService.cs` maneja esto

3. **Retry Logic**:
   - Implementar backoff exponencial para fallos temporales
   - Máximo 3 reintentos por batch

### Validaciones Post-Test

```sql
-- Verificar que no se crearon tokens duplicados
SELECT fcm_token, COUNT(*) 
FROM dispositivos_fcm 
GROUP BY fcm_token 
HAVING COUNT(*) > 1;

-- Limpiar tokens de prueba
DELETE FROM dispositivos_fcm 
WHERE fcm_token LIKE 'test_token_%';

DELETE FROM auth.users 
WHERE email = 'test-push@sportzone.app';
```

### Criterios de Éxito

✅ **PASA** si:
- Tiempo total < 10 segundos
- Tasa de éxito > 99%
- Throughput > 1000 notificaciones/seg
- Sin errores de memoria o crashes

❌ **FALLA** si:
- Tiempo total > 10 segundos
- Tasa de éxito < 99%
- Errores de memoria o crashes del servidor

### Alternativa: Test con Firebase Test Lab

Si no puedes generar 10,000 tokens reales, usa Firebase Test Lab:

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Ejecutar test en dispositivos reales
firebase test android run \
  --type instrumentation \
  --app app-debug.apk \
  --test app-debug-androidTest.apk \
  --device model=Pixel2,version=28,locale=en,orientation=portrait \
  --num-flaky-test-attempts 2
```


---

## Test 4: 50 Partidos en Vivo Simultáneos

### Objetivo

Verificar que el sistema puede gestionar 50 partidos en vivo simultáneamente sin degradación de rendimiento.

### Herramientas Recomendadas

- **Custom Orchestration Script** (C# o Python)
- **Database Monitoring Tools** (pgAdmin, Azure Monitor)
- **SignalR Load Testing** (combinado con Test 1)

### Configuración del Test

#### Script de Preparación de Datos

1. **Crear 50 partidos de prueba**:

```sql
-- Script: create-50-test-matches.sql
DO $$
DECLARE
  torneo_id UUID;
  equipo_ids UUID[];
  i INT;
  partido_id UUID;
BEGIN
  -- Obtener torneo activo
  SELECT id INTO torneo_id FROM torneos WHERE activo = true LIMIT 1;
  
  -- Obtener equipos
  SELECT ARRAY_AGG(id) INTO equipo_ids FROM equipos LIMIT 100;
  
  -- Crear 50 partidos
  FOR i IN 1..50 LOOP
    INSERT INTO partidos (
      torneo_id,
      jornada,
      equipo_local_id,
      equipo_visita_id,
      fecha_hora,
      estado,
      goles_local,
      goles_visita,
      minuto_actual
    ) VALUES (
      torneo_id,
      1,
      equipo_ids[((i-1) * 2) % array_length(equipo_ids, 1) + 1],
      equipo_ids[(i * 2) % array_length(equipo_ids, 1) + 1],
      NOW(),
      'en_curso',
      0,
      0,
      0
    ) RETURNING id INTO partido_id;
    
    RAISE NOTICE 'Partido % creado: %', i, partido_id;
  END LOOP;
END $$;
```

2. **Script de Orquestación** `simulate-50-matches.cs`:

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Diagnostics;

class MultiMatchSimulator
{
    private static readonly HttpClient client = new HttpClient();
    private const string API_BASE = "https://api.sportzone.app";
    private const int NUM_MATCHES = 50;
    private const int EVENTS_PER_MATCH = 20;
    private const int DURATION_MINUTES = 10;
    
    static async Task Main(string[] args)
    {
        Console.WriteLine($"🏟️  Simulando {NUM_MATCHES} partidos simultáneos");
        Console.WriteLine($"⚽ {EVENTS_PER_MATCH} eventos por partido");
        Console.WriteLine($"⏱️  Duración: {DURATION_MINUTES} minutos\n");
        
        // Obtener IDs de partidos en curso
        var partidoIds = await GetMatchesInProgress();
        
        if (partidoIds.Count < NUM_MATCHES)
        {
            Console.WriteLine($"❌ Solo hay {partidoIds.Count} partidos disponibles");
            return;
        }
        
        partidoIds = partidoIds.Take(NUM_MATCHES).ToList();
        
        // Métricas
        var stopwatch = Stopwatch.StartNew();
        var successCount = 0;
        var errorCount = 0;
        var responseTimes = new List<long>();
        
        // Simular eventos en paralelo
        var tasks = partidoIds.Select(async partidoId =>
        {
            for (int i = 0; i < EVENTS_PER_MATCH; i++)
            {
                try
                {
                    var eventStopwatch = Stopwatch.StartNew();
                    await SimulateEvent(partidoId, i + 1);
                    eventStopwatch.Stop();
                    
                    responseTimes.Add(eventStopwatch.ElapsedMilliseconds);
                    Interlocked.Increment(ref successCount);
                    
                    // Esperar tiempo aleatorio entre eventos (5-30 segundos)
                    await Task.Delay(Random.Shared.Next(5000, 30000));
                }
                catch (Exception ex)
                {
                    Interlocked.Increment(ref errorCount);
                    Console.WriteLine($"❌ Error en partido {partidoId}: {ex.Message}");
                }
            }
        }).ToList();
        
        // Esperar a que todos los partidos terminen
        await Task.WhenAll(tasks);
        stopwatch.Stop();
        
        // Calcular estadísticas
        var totalEvents = NUM_MATCHES * EVENTS_PER_MATCH;
        var avgResponseTime = responseTimes.Average();
        var p95ResponseTime = responseTimes.OrderBy(x => x).ElementAt((int)(responseTimes.Count * 0.95));
        var eventsPerSecond = totalEvents / stopwatch.Elapsed.TotalSeconds;
        
        Console.WriteLine($"\n📊 Resultados:");
        Console.WriteLine($"   Tiempo total: {stopwatch.Elapsed.TotalMinutes:F2} minutos");
        Console.WriteLine($"   Eventos exitosos: {successCount}/{totalEvents}");
        Console.WriteLine($"   Eventos fallidos: {errorCount}");
        Console.WriteLine($"   Tasa de éxito: {(successCount * 100.0 / totalEvents):F2}%");
        Console.WriteLine($"   Tiempo de respuesta promedio: {avgResponseTime:F2}ms");
        Console.WriteLine($"   Tiempo de respuesta P95: {p95ResponseTime}ms");
        Console.WriteLine($"   Throughput: {eventsPerSecond:F2} eventos/seg");
        
        // Verificar criterios
        var passed = successCount >= totalEvents * 0.99 &&
                     avgResponseTime < 1000 &&
                     p95ResponseTime < 2000;
        
        Console.WriteLine(passed ? "\n✅ TEST PASADO" : "\n❌ TEST FALLIDO");
    }
    
    static async Task<List<string>> GetMatchesInProgress()
    {
        var response = await client.GetAsync($"{API_BASE}/api/partidos/en-vivo");
        response.EnsureSuccessStatusCode();
        var matches = await response.Content.ReadAsAsync<List<Match>>();
        return matches.Select(m => m.Id).ToList();
    }
    
    static async Task SimulateEvent(string partidoId, int minuto)
    {
        var eventos = new[] { "gol", "tarjeta_amarilla", "tarjeta_roja", "sustitucion" };
        var evento = eventos[Random.Shared.Next(eventos.Length)];
        
        var payload = new
        {
            minuto = minuto,
            tipo = evento,
            jugadorId = Guid.NewGuid().ToString(),
            equipoId = Guid.NewGuid().ToString()
        };
        
        var response = await client.PostAsJsonAsync(
            $"{API_BASE}/api/partidos/{partidoId}/eventos",
            payload
        );
        
        response.EnsureSuccessStatusCode();
    }
}
```


### Métricas a Recolectar

| Métrica | Objetivo | Cómo Medir |
|---------|----------|------------|
| **Partidos simultáneos** | 50 | Contar partidos en estado "en_curso" |
| **Eventos procesados** | 1000 (50 x 20) | Total de eventos registrados |
| **Tiempo de respuesta promedio** | < 1000ms | Promedio de response times |
| **Tiempo de respuesta P95** | < 2000ms | Percentil 95 |
| **Tasa de éxito** | > 99% | Eventos exitosos / Total |
| **Uso de CPU** | < 80% | Azure Monitor |
| **Uso de memoria** | < 6GB | Azure Monitor |
| **Conexiones DB activas** | < 100 | pg_stat_activity |
| **Query time promedio** | < 100ms | pg_stat_statements |

### Monitoreo Durante el Test

#### Queries de Monitoreo en Tiempo Real

```sql
-- Ver partidos en curso
SELECT COUNT(*) as partidos_en_curso 
FROM partidos 
WHERE estado = 'en_curso';

-- Ver eventos por minuto
SELECT 
  DATE_TRUNC('minute', created_at) as minuto,
  COUNT(*) as eventos
FROM eventos_partido
WHERE created_at > NOW() - INTERVAL '15 minutes'
GROUP BY minuto
ORDER BY minuto DESC;

-- Ver conexiones activas
SELECT 
  COUNT(*) as conexiones_activas,
  state,
  wait_event_type
FROM pg_stat_activity
WHERE datname = 'sportzone'
GROUP BY state, wait_event_type;

-- Ver queries lentas
SELECT 
  query,
  mean_exec_time,
  calls
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Ver locks
SELECT 
  l.locktype,
  l.mode,
  l.granted,
  a.query
FROM pg_locks l
JOIN pg_stat_activity a ON l.pid = a.pid
WHERE NOT l.granted;
```

#### Dashboard de Azure Monitor

Crear dashboard con:
- CPU Usage (%)
- Memory Usage (GB)
- Network In/Out (MB/s)
- HTTP Request Rate (req/s)
- HTTP Response Time (ms)
- SignalR Connection Count
- Database Connection Pool

### Validaciones Post-Test

```sql
-- Verificar integridad de datos
SELECT 
  p.id,
  p.goles_local,
  p.goles_visita,
  COUNT(CASE WHEN e.tipo = 'gol' AND e.equipo_id = p.equipo_local_id THEN 1 END) as goles_local_eventos,
  COUNT(CASE WHEN e.tipo = 'gol' AND e.equipo_id = p.equipo_visita_id THEN 1 END) as goles_visita_eventos
FROM partidos p
LEFT JOIN eventos_partido e ON e.partido_id = p.id
WHERE p.estado = 'en_curso'
GROUP BY p.id, p.goles_local, p.goles_visita
HAVING 
  p.goles_local != COUNT(CASE WHEN e.tipo = 'gol' AND e.equipo_id = p.equipo_local_id THEN 1 END) OR
  p.goles_visita != COUNT(CASE WHEN e.tipo = 'gol' AND e.equipo_id = p.equipo_visita_id THEN 1 END);

-- Limpiar partidos de prueba
UPDATE partidos 
SET estado = 'finalizado' 
WHERE estado = 'en_curso' 
  AND fecha_hora < NOW() - INTERVAL '1 hour';
```

### Criterios de Éxito

✅ **PASA** si:
- 50 partidos se ejecutan simultáneamente
- Tasa de éxito > 99%
- Tiempo de respuesta promedio < 1 segundo
- Tiempo de respuesta P95 < 2 segundos
- Uso de CPU < 80%
- Sin deadlocks en la base de datos
- Integridad de datos verificada

❌ **FALLA** si:
- No se pueden ejecutar 50 partidos simultáneos
- Tasa de éxito < 99%
- Tiempos de respuesta exceden objetivos
- Uso de CPU > 80%
- Hay deadlocks o inconsistencias de datos


---

## Herramientas de Testing

### Herramientas Recomendadas

| Herramienta | Propósito | Instalación |
|-------------|-----------|-------------|
| **Artillery** | Load testing HTTP/WebSocket | `npm install -g artillery` |
| **k6** | Modern load testing | [k6.io/docs/getting-started/installation](https://k6.io/docs/getting-started/installation) |
| **Apache JMeter** | Load testing completo | [jmeter.apache.org](https://jmeter.apache.org/) |
| **SignalR Client** | Testing de SignalR | NuGet: `Microsoft.AspNetCore.SignalR.Client` |
| **Firebase Admin SDK** | Testing de notificaciones | NuGet: `FirebaseAdmin` |
| **Postman** | API testing manual | [postman.com](https://www.postman.com/) |

### Configuración de Entorno de Testing

#### Variables de Entorno

Crear archivo `.env.testing`:

```bash
# API
API_BASE_URL=https://api-staging.sportzone.app
API_JWT_TOKEN=your-admin-jwt-token

# SignalR
SIGNALR_HUB_URL=https://api-staging.sportzone.app/hubs/partidos

# Database
DB_CONNECTION_STRING=postgresql://user:pass@host:5432/sportzone_test

# Firebase
FIREBASE_PROJECT_ID=sportzone-test
FIREBASE_CREDENTIALS_PATH=./firebase-adminsdk-test.json

# Test Configuration
NUM_CONCURRENT_USERS=1000
EVENTS_PER_SECOND=10
NUM_PUSH_DEVICES=10000
NUM_SIMULTANEOUS_MATCHES=50
```

#### Docker Compose para Testing Local

```yaml
# docker-compose.test.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: sportzone_test
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_pass
    ports:
      - "5433:5432"
    volumes:
      - ./database:/docker-entrypoint-initdb.d
  
  api:
    build: ./SportZone.API
    environment:
      - ASPNETCORE_ENVIRONMENT=Testing
      - Supabase__Url=http://postgres:5432
    ports:
      - "5001:80"
    depends_on:
      - postgres
  
  artillery:
    image: artilleryio/artillery:latest
    volumes:
      - ./tests/load:/tests
    command: run /tests/signalr-load-test.yml
    depends_on:
      - api
```

Ejecutar:
```bash
docker-compose -f docker-compose.test.yml up
```


---

## Monitoreo y Métricas

### Dashboard de Métricas en Tiempo Real

#### Grafana Dashboard Configuration

```json
{
  "dashboard": {
    "title": "SportZone Performance Testing",
    "panels": [
      {
        "title": "SignalR Connections",
        "targets": [
          {
            "expr": "signalr_connections_total",
            "legendFormat": "Active Connections"
          }
        ]
      },
      {
        "title": "Event Processing Rate",
        "targets": [
          {
            "expr": "rate(events_processed_total[1m])",
            "legendFormat": "Events/sec"
          }
        ]
      },
      {
        "title": "API Response Time",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds_bucket)",
            "legendFormat": "P95 Latency"
          }
        ]
      },
      {
        "title": "Database Query Time",
        "targets": [
          {
            "expr": "pg_stat_statements_mean_exec_time_seconds",
            "legendFormat": "{{query}}"
          }
        ]
      }
    ]
  }
}
```

### Métricas Clave a Monitorear

#### Backend (.NET)

```csharp
// Agregar a Program.cs
using Prometheus;

app.UseMetricServer();
app.UseHttpMetrics();

// Custom metrics
var eventCounter = Metrics.CreateCounter(
    "events_processed_total",
    "Total number of match events processed"
);

var signalrConnections = Metrics.CreateGauge(
    "signalr_connections_total",
    "Current number of SignalR connections"
);

var eventProcessingTime = Metrics.CreateHistogram(
    "event_processing_duration_seconds",
    "Time to process a match event"
);
```

#### Base de Datos (PostgreSQL)

```sql
-- Habilitar pg_stat_statements
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Ver estadísticas de queries
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time,
  rows
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Ver índices no utilizados
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexname NOT LIKE 'pg_toast%';

-- Ver tamaño de tablas
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Alertas Recomendadas

#### Azure Monitor Alerts

```json
{
  "alerts": [
    {
      "name": "High CPU Usage",
      "condition": "CPU > 80%",
      "duration": "5 minutes",
      "action": "Send email to ops@sportzone.app"
    },
    {
      "name": "High Response Time",
      "condition": "P95 Response Time > 2000ms",
      "duration": "2 minutes",
      "action": "Send SMS to on-call engineer"
    },
    {
      "name": "SignalR Connection Drop",
      "condition": "Active Connections drops by 50%",
      "duration": "1 minute",
      "action": "Trigger incident"
    },
    {
      "name": "Database Connection Pool Exhausted",
      "condition": "Available Connections < 10",
      "duration": "30 seconds",
      "action": "Auto-scale database"
    }
  ]
}
```

### Logs Estructurados

#### Configuración de Serilog

```csharp
// Program.cs
using Serilog;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Application", "SportZone.API")
    .WriteTo.Console()
    .WriteTo.ApplicationInsights(
        configuration["ApplicationInsights:InstrumentationKey"],
        TelemetryConverter.Traces
    )
    .CreateLogger();

builder.Host.UseSerilog();
```

#### Logging de Eventos Críticos

```csharp
// En PartidosService.cs
_logger.LogInformation(
    "Event processed: {EventType} for match {MatchId} at minute {Minute}. Processing time: {Duration}ms",
    evento.Tipo,
    partidoId,
    evento.Minuto,
    stopwatch.ElapsedMilliseconds
);

_logger.LogWarning(
    "High event processing time: {Duration}ms for match {MatchId}",
    stopwatch.ElapsedMilliseconds,
    partidoId
);
```


---

## Troubleshooting

### Problemas Comunes y Soluciones

#### Problema 1: Alta Latencia en SignalR

**Síntomas**:
- Eventos tardan > 2 segundos en llegar a clientes
- Conexiones se desconectan frecuentemente

**Diagnóstico**:
```csharp
// Agregar logging en PartidoHub.cs
public override async Task OnConnectedAsync()
{
    _logger.LogInformation(
        "Client connected: {ConnectionId} from {IpAddress}",
        Context.ConnectionId,
        Context.GetHttpContext()?.Connection.RemoteIpAddress
    );
    await base.OnConnectedAsync();
}
```

**Soluciones**:
1. **Aumentar límites de conexión**:
```csharp
// Program.cs
builder.Services.AddSignalR(options =>
{
    options.MaximumReceiveMessageSize = 102400; // 100KB
    options.StreamBufferCapacity = 20;
    options.EnableDetailedErrors = true;
});
```

2. **Configurar Azure SignalR Service** (para escalar):
```csharp
builder.Services.AddSignalR()
    .AddAzureSignalR(options =>
    {
        options.ConnectionString = configuration["Azure:SignalR:ConnectionString"];
        options.ServerStickyMode = ServerStickyMode.Required;
    });
```

3. **Optimizar broadcast**:
```csharp
// Usar grupos en lugar de broadcast global
await Clients.Group($"partido-{partidoId}").SendAsync("EventoRegistrado", evento);
```

---

#### Problema 2: Procesamiento Lento de Eventos

**Síntomas**:
- Tiempo de respuesta > 1 segundo
- Queue de eventos se acumula

**Diagnóstico**:
```sql
-- Ver queries lentas
SELECT 
  query,
  mean_exec_time,
  calls,
  total_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC;

-- Ver locks activos
SELECT * FROM pg_locks WHERE NOT granted;
```

**Soluciones**:
1. **Optimizar queries**:
```sql
-- Agregar índices faltantes
CREATE INDEX CONCURRENTLY idx_eventos_partido_created 
ON eventos_partido(partido_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_partidos_estado_fecha 
ON partidos(estado, fecha_hora) 
WHERE estado = 'en_curso';
```

2. **Usar transacciones más pequeñas**:
```csharp
// En lugar de una transacción grande
using var transaction = await _supabase.BeginTransactionAsync();
try
{
    await InsertEvento(evento);
    await UpdateMarcador(partidoId);
    await transaction.CommitAsync();
}
catch
{
    await transaction.RollbackAsync();
    throw;
}
```

3. **Implementar caché**:
```csharp
// Cachear datos de partido
private readonly IMemoryCache _cache;

public async Task<Partido> GetPartidoAsync(Guid id)
{
    return await _cache.GetOrCreateAsync($"partido-{id}", async entry =>
    {
        entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
        return await _supabase.From<Partido>().Where(p => p.Id == id).Single();
    });
}
```

---

#### Problema 3: Notificaciones Push Lentas

**Síntomas**:
- Envío a 10,000 dispositivos tarda > 10 segundos
- Muchas notificaciones fallan

**Diagnóstico**:
```csharp
// Agregar logging detallado
_logger.LogInformation(
    "Sending push to {TokenCount} devices. Batch size: {BatchSize}",
    tokens.Count,
    batchSize
);

foreach (var response in responses)
{
    _logger.LogWarning(
        "Batch result: {SuccessCount} success, {FailureCount} failures",
        response.SuccessCount,
        response.FailureCount
    );
}
```

**Soluciones**:
1. **Optimizar tamaño de batch**:
```csharp
// Usar batches de 500 (límite de FCM)
const int BATCH_SIZE = 500;
var batches = tokens.Chunk(BATCH_SIZE);

var tasks = batches.Select(batch => 
    _fcm.SendMulticastAsync(new MulticastMessage
    {
        Tokens = batch.ToList(),
        Notification = notification
    })
);

await Task.WhenAll(tasks);
```

2. **Implementar retry con backoff**:
```csharp
private async Task<BatchResponse> SendWithRetryAsync(
    MulticastMessage message, 
    int maxRetries = 3)
{
    for (int i = 0; i < maxRetries; i++)
    {
        try
        {
            return await _fcm.SendMulticastAsync(message);
        }
        catch (FirebaseMessagingException ex) when (i < maxRetries - 1)
        {
            var delay = TimeSpan.FromSeconds(Math.Pow(2, i));
            _logger.LogWarning(
                "FCM send failed, retrying in {Delay}s. Error: {Error}",
                delay.TotalSeconds,
                ex.Message
            );
            await Task.Delay(delay);
        }
    }
    throw new Exception("Max retries exceeded");
}
```

3. **Limpiar tokens inválidos**:
```csharp
// Después de enviar
foreach (var response in responses)
{
    for (int i = 0; i < response.Responses.Count; i++)
    {
        if (!response.Responses[i].IsSuccess)
        {
            var token = tokens[i];
            await _supabase.From<DispositivoFcm>()
                .Where(d => d.FcmToken == token)
                .Delete();
        }
    }
}
```

---

#### Problema 4: Degradación con 50 Partidos Simultáneos

**Síntomas**:
- CPU > 80%
- Memoria crece constantemente
- Conexiones DB se agotan

**Diagnóstico**:
```sql
-- Ver conexiones activas por estado
SELECT state, COUNT(*) 
FROM pg_stat_activity 
WHERE datname = 'sportzone'
GROUP BY state;

-- Ver memoria usada por queries
SELECT 
  pid,
  usename,
  query,
  pg_size_pretty(pg_backend_memory_contexts.total_bytes) as memory
FROM pg_stat_activity
JOIN pg_backend_memory_contexts ON pg_stat_activity.pid = pg_backend_memory_contexts.pid
ORDER BY pg_backend_memory_contexts.total_bytes DESC;
```

**Soluciones**:
1. **Aumentar pool de conexiones**:
```csharp
// appsettings.json
{
  "Supabase": {
    "ConnectionString": "...;Maximum Pool Size=200;Min Pool Size=10;"
  }
}
```

2. **Implementar rate limiting**:
```csharp
// Program.cs
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.User.Identity?.Name ?? "anonymous",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1)
            }
        )
    );
});

app.UseRateLimiter();
```

3. **Optimizar uso de memoria**:
```csharp
// Usar streaming para grandes resultados
public async IAsyncEnumerable<Evento> GetEventosStreamAsync(Guid partidoId)
{
    await foreach (var evento in _supabase.From<Evento>()
        .Where(e => e.PartidoId == partidoId)
        .AsAsyncEnumerable())
    {
        yield return evento;
    }
}
```

4. **Escalar horizontalmente**:
```bash
# Azure App Service
az appservice plan update \
  --name sportzone-plan \
  --resource-group sportzone-rg \
  --number-of-workers 3

# O usar auto-scaling
az monitor autoscale create \
  --resource-group sportzone-rg \
  --resource sportzone-api \
  --min-count 2 \
  --max-count 10 \
  --count 3
```


---

### Checklist de Troubleshooting

Cuando encuentres problemas de rendimiento, sigue este checklist:

- [ ] **Verificar logs** - Buscar errores o warnings en Application Insights
- [ ] **Revisar métricas** - CPU, memoria, conexiones DB, latencia
- [ ] **Analizar queries lentas** - Usar pg_stat_statements
- [ ] **Verificar índices** - Asegurar que existen y se usan
- [ ] **Revisar pool de conexiones** - Verificar que no se agota
- [ ] **Monitorear SignalR** - Conexiones activas, mensajes por segundo
- [ ] **Verificar FCM** - Tasa de éxito, tokens inválidos
- [ ] **Revisar caché** - Hit rate, tamaño, expiración
- [ ] **Analizar network** - Latencia, ancho de banda, packet loss
- [ ] **Verificar escalado** - Número de instancias, auto-scaling

---

## Resumen de Benchmarks

### Tabla de Objetivos vs Resultados

| Test | Métrica | Objetivo | Resultado | Estado |
|------|---------|----------|-----------|--------|
| **Test 1: SignalR** | Usuarios concurrentes | 1000+ | _______ | ⬜ |
| | Latencia promedio | < 2000ms | _______ ms | ⬜ |
| | Tasa de éxito | > 99% | _______ % | ⬜ |
| **Test 2: Eventos** | Throughput | 10 eventos/seg | _______ /seg | ⬜ |
| | Tiempo respuesta P95 | < 1000ms | _______ ms | ⬜ |
| | Tasa de error | < 1% | _______ % | ⬜ |
| **Test 3: Push** | Tiempo total | < 10 seg | _______ seg | ⬜ |
| | Tasa de éxito | > 99% | _______ % | ⬜ |
| | Throughput | > 1000 notif/seg | _______ /seg | ⬜ |
| **Test 4: 50 Partidos** | Partidos simultáneos | 50 | _______ | ⬜ |
| | Tiempo respuesta promedio | < 1000ms | _______ ms | ⬜ |
| | Uso de CPU | < 80% | _______ % | ⬜ |

**Leyenda**: ✅ Pasa | ❌ Falla | ⬜ Pendiente

---

## Reporte de Resultados

### Plantilla de Reporte

```markdown
# Reporte de Testing de Rendimiento - SportZone Pro

**Fecha**: _________________
**Ejecutado por**: _________________
**Entorno**: ☐ Staging  ☐ Production  ☐ Local
**Versión del sistema**: _________________

## Resumen Ejecutivo

- **Tests ejecutados**: _____ / 4
- **Tests pasados**: _____
- **Tests fallidos**: _____
- **Estado general**: ☐ ✅ Todos pasaron  ☐ ⚠️ Algunos fallaron  ☐ ❌ Críticos fallaron

## Resultados Detallados

### Test 1: 1000 Usuarios Concurrentes en SignalR
- **Estado**: ☐ ✅ Pasó  ☐ ❌ Falló
- **Usuarios conectados**: _______
- **Latencia promedio**: _______ ms
- **Latencia P95**: _______ ms
- **Tasa de éxito**: _______ %
- **Notas**: _________________________________________________________________

### Test 2: 10 Eventos por Segundo
- **Estado**: ☐ ✅ Pasó  ☐ ❌ Falló
- **Throughput alcanzado**: _______ eventos/seg
- **Tiempo de respuesta promedio**: _______ ms
- **Tiempo de respuesta P95**: _______ ms
- **Tasa de error**: _______ %
- **Notas**: _________________________________________________________________

### Test 3: 10,000 Dispositivos Push
- **Estado**: ☐ ✅ Pasó  ☐ ❌ Falló
- **Tiempo total**: _______ segundos
- **Notificaciones exitosas**: _______
- **Notificaciones fallidas**: _______
- **Tasa de éxito**: _______ %
- **Notas**: _________________________________________________________________

### Test 4: 50 Partidos en Vivo Simultáneos
- **Estado**: ☐ ✅ Pasó  ☐ ❌ Falló
- **Partidos ejecutados**: _______
- **Eventos procesados**: _______
- **Tiempo de respuesta promedio**: _______ ms
- **Uso de CPU máximo**: _______ %
- **Uso de memoria máximo**: _______ GB
- **Notas**: _________________________________________________________________

## Problemas Encontrados

1. **Problema**: _________________________________________________________________
   **Severidad**: ☐ Crítica  ☐ Alta  ☐ Media  ☐ Baja
   **Solución**: _________________________________________________________________

2. **Problema**: _________________________________________________________________
   **Severidad**: ☐ Crítica  ☐ Alta  ☐ Media  ☐ Baja
   **Solución**: _________________________________________________________________

## Recomendaciones

- [ ] _________________________________________________________________
- [ ] _________________________________________________________________
- [ ] _________________________________________________________________

## Próximos Pasos

- [ ] _________________________________________________________________
- [ ] _________________________________________________________________
- [ ] _________________________________________________________________

## Aprobación

**Aprobado por**: _________________
**Fecha**: _________________
**Firma**: _________________
```

---

## Anexos

### Anexo A: Scripts de Testing

Todos los scripts mencionados en esta guía están disponibles en:
- `tests/performance/signalr-load-test.yml` (Artillery)
- `tests/performance/event-load-test.js` (k6)
- `tests/performance/simulate-50-matches.cs` (C#)
- `tests/performance/push-notification-test.cs` (C#)

### Anexo B: Queries de Monitoreo

```sql
-- Archivo: tests/performance/monitoring-queries.sql

-- 1. Ver rendimiento general
SELECT 
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  idx_tup_fetch,
  n_tup_ins,
  n_tup_upd,
  n_tup_del
FROM pg_stat_user_tables
ORDER BY seq_scan DESC;

-- 2. Ver cache hit ratio
SELECT 
  sum(heap_blks_read) as heap_read,
  sum(heap_blks_hit) as heap_hit,
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
FROM pg_statio_user_tables;

-- 3. Ver tamaño de índices
SELECT 
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_indexes
JOIN pg_class ON pg_indexes.indexname = pg_class.relname
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

### Anexo C: Configuración de Azure Monitor

```json
{
  "workspaceId": "your-workspace-id",
  "metrics": [
    {
      "name": "CPU Percentage",
      "aggregation": "Average",
      "threshold": 80,
      "operator": "GreaterThan"
    },
    {
      "name": "Memory Percentage",
      "aggregation": "Average",
      "threshold": 85,
      "operator": "GreaterThan"
    },
    {
      "name": "Http Response Time",
      "aggregation": "Average",
      "threshold": 2000,
      "operator": "GreaterThan"
    }
  ]
}
```

---

## Referencias

- [SignalR Performance Best Practices](https://docs.microsoft.com/en-us/aspnet/core/signalr/scale)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Firebase Cloud Messaging Best Practices](https://firebase.google.com/docs/cloud-messaging/best-practices)
- [k6 Load Testing Documentation](https://k6.io/docs/)
- [Artillery Load Testing Guide](https://www.artillery.io/docs/guides/overview/welcome)

---

**Última actualización**: 2025-01-XX  
**Versión del documento**: 1.0  
**Mantenido por**: Equipo de DevOps SportZone Pro
