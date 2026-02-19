# Configuración de Monitoreo - SportZone Pro

## Tabla de Contenidos

1. [Application Insights](#1-application-insights)
2. [Health Checks](#2-health-checks)
3. [Alertas](#3-alertas)
4. [Dashboards](#4-dashboards)
5. [Logs](#5-logs)

---

## 1. Application Insights

### 1.1 Configuración en Backend

En `Program.cs`:

```csharp
// Agregar Application Insights
builder.Services.AddApplicationInsightsTelemetry(options =>
{
    options.ConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"];
});

// Configurar logging
builder.Logging.AddApplicationInsights(
    configureTelemetryConfiguration: (config) => 
        config.ConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"],
    configureApplicationInsightsLoggerOptions: (options) => { }
);

// Agregar filtros de telemetría
builder.Services.AddApplicationInsightsTelemetryProcessor<CustomTelemetryProcessor>();
```

### 1.2 Métricas Personalizadas

Crear servicio de telemetría:

```csharp
public class TelemetryService
{
    private readonly TelemetryClient _telemetryClient;

    public TelemetryService(TelemetryClient telemetryClient)
    {
        _telemetryClient = telemetryClient;
    }

    public void TrackPartidoIniciado(Guid partidoId)
    {
        _telemetryClient.TrackEvent("PartidoIniciado", new Dictionary<string, string>
        {
            { "PartidoId", partidoId.ToString() }
        });
    }

    public void TrackGolRegistrado(Guid partidoId, Guid jugadorId)
    {
        _telemetryClient.TrackEvent("GolRegistrado", new Dictionary<string, string>
        {
            { "PartidoId", partidoId.ToString() },
            { "JugadorId", jugadorId.ToString() }
        });
        
        _telemetryClient.TrackMetric("GolesRegistrados", 1);
    }

    public void TrackSignalRConnection(string connectionId)
    {
        _telemetryClient.TrackMetric("SignalRConnections", 1);
    }
}
```


---

## 2. Health Checks

### 2.1 Configuración de Health Checks

En `Program.cs`:

```csharp
using HealthChecks.UI.Client;
using Microsoft.Extensions.Diagnostics.HealthChecks;

// Agregar health checks
builder.Services.AddHealthChecks()
    .AddCheck("self", () => HealthCheckResult.Healthy(), tags: new[] { "ready" })
    .AddNpgSql(
        builder.Configuration["ConnectionStrings:DefaultConnection"]!,
        name: "supabase-db",
        timeout: TimeSpan.FromSeconds(3),
        tags: new[] { "ready", "db" })
    .AddUrlGroup(
        new Uri($"{builder.Configuration["Supabase:Url"]}/rest/v1/"),
        name: "supabase-api",
        timeout: TimeSpan.FromSeconds(3),
        tags: new[] { "ready", "external" })
    .AddCheck<SignalRHealthCheck>("signalr", tags: new[] { "ready", "signalr" });

// Configurar endpoints de health checks
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});

app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false,
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});
```

### 2.2 Endpoints de Health Check

- **`/health`**: Estado general de todos los componentes
- **`/health/ready`**: Verifica si la aplicación está lista para recibir tráfico
- **`/health/live`**: Verifica si la aplicación está viva (liveness probe)

### 2.3 Respuesta de Health Check

```json
{
  "status": "Healthy",
  "totalDuration": "00:00:00.1234567",
  "entries": {
    "self": {
      "status": "Healthy",
      "duration": "00:00:00.0001234"
    },
    "supabase-db": {
      "status": "Healthy",
      "duration": "00:00:00.0234567"
    },
    "supabase-api": {
      "status": "Healthy",
      "duration": "00:00:00.0456789"
    },
    "signalr": {
      "status": "Healthy",
      "duration": "00:00:00.0001234"
    }
  }
}
```

---

## 3. Alertas

### 3.1 Alertas de Errores HTTP 5xx

```bash
az monitor metrics alert create \
  --name "High-5xx-Errors" \
  --resource-group sportzone-rg \
  --scopes /subscriptions/{subscription-id}/resourceGroups/sportzone-rg/providers/Microsoft.Web/sites/sportzone-api \
  --condition "count requests/failed > 10" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action email admin@sportzone.app \
  --description "Alerta cuando hay más de 10 errores 5xx en 5 minutos"
```

### 3.2 Alertas de Tiempo de Respuesta

```bash
az monitor metrics alert create \
  --name "High-Response-Time" \
  --resource-group sportzone-rg \
  --scopes /subscriptions/{subscription-id}/resourceGroups/sportzone-rg/providers/Microsoft.Web/sites/sportzone-api \
  --condition "avg requests/duration > 3000" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action email admin@sportzone.app \
  --description "Alerta cuando el tiempo de respuesta promedio supera 3 segundos"
```

### 3.3 Alertas de Disponibilidad

```bash
az monitor metrics alert create \
  --name "Low-Availability" \
  --resource-group sportzone-rg \
  --scopes /subscriptions/{subscription-id}/resourceGroups/sportzone-rg/providers/Microsoft.Web/sites/sportzone-api \
  --condition "avg availabilityResults/availabilityPercentage < 99" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action email admin@sportzone.app \
  --description "Alerta cuando la disponibilidad cae por debajo del 99%"
```

### 3.4 Alertas de CPU y Memoria

```bash
# CPU alta
az monitor metrics alert create \
  --name "High-CPU-Usage" \
  --resource-group sportzone-rg \
  --scopes /subscriptions/{subscription-id}/resourceGroups/sportzone-rg/providers/Microsoft.Web/sites/sportzone-api \
  --condition "avg CpuPercentage > 80" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action email admin@sportzone.app

# Memoria alta
az monitor metrics alert create \
  --name "High-Memory-Usage" \
  --resource-group sportzone-rg \
  --scopes /subscriptions/{subscription-id}/resourceGroups/sportzone-rg/providers/Microsoft.Web/sites/sportzone-api \
  --condition "avg MemoryPercentage > 80" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action email admin@sportzone.app
```


---

## 4. Dashboards

### 4.1 Dashboard de Application Insights

Crear dashboard personalizado en Azure Portal con los siguientes widgets:

#### Métricas de Rendimiento
- **Request Rate**: Requests por segundo
- **Response Time**: Tiempo de respuesta promedio, P95, P99
- **Failed Requests**: Porcentaje de requests fallidos
- **Server Response Time**: Tiempo de respuesta del servidor

#### Métricas de Disponibilidad
- **Availability**: Porcentaje de disponibilidad
- **Health Check Status**: Estado de health checks

#### Métricas de Recursos
- **CPU Usage**: Uso de CPU
- **Memory Usage**: Uso de memoria
- **Active Connections**: Conexiones activas

#### Métricas de Negocio
- **Partidos en Vivo**: Número de partidos activos
- **Goles Registrados**: Goles registrados por hora
- **SignalR Connections**: Conexiones SignalR activas
- **Notificaciones Enviadas**: Notificaciones push enviadas

### 4.2 Queries de Log Analytics

#### Top 10 Endpoints más lentos

```kusto
requests
| where timestamp > ago(1h)
| summarize avg(duration), count() by name
| order by avg_duration desc
| take 10
```

#### Errores por tipo

```kusto
exceptions
| where timestamp > ago(24h)
| summarize count() by type
| order by count_ desc
```

#### Requests por código de estado

```kusto
requests
| where timestamp > ago(1h)
| summarize count() by resultCode
| order by count_ desc
```

#### SignalR Connections por hora

```kusto
customEvents
| where name == "SignalRConnection"
| where timestamp > ago(24h)
| summarize count() by bin(timestamp, 1h)
| render timechart
```

### 4.3 Dashboard de Grafana (Opcional)

Crear dashboard con Prometheus y Grafana:

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'sportzone-api'
    static_configs:
      - targets: ['api.sportzone.app:80']
    metrics_path: '/metrics'
```

Paneles recomendados:
- Request rate (QPS)
- Error rate
- Response time (P50, P95, P99)
- Active connections
- Database query time
- SignalR hub metrics

---

## 5. Logs

### 5.1 Configuración de Serilog

En `Program.cs`:

```csharp
using Serilog;
using Serilog.Events;

// Configurar Serilog
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.AspNetCore.SignalR", LogEventLevel.Information)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .Enrich.WithEnvironmentName()
    .WriteTo.Console()
    .WriteTo.ApplicationInsights(
        builder.Configuration["ApplicationInsights:ConnectionString"],
        TelemetryConverter.Traces)
    .CreateLogger();

builder.Host.UseSerilog();
```

### 5.2 Structured Logging

Ejemplo de logging estructurado:

```csharp
_logger.LogInformation(
    "Partido iniciado: {PartidoId} - {EquipoLocal} vs {EquipoVisita}",
    partidoId,
    equipoLocal,
    equipoVisita);

_logger.LogWarning(
    "Intento de registrar evento en partido no iniciado: {PartidoId}",
    partidoId);

_logger.LogError(
    exception,
    "Error al enviar notificación push: {PartidoId}, {EventoTipo}",
    partidoId,
    eventoTipo);
```

### 5.3 Queries de Logs

#### Logs de errores en la última hora

```kusto
traces
| where timestamp > ago(1h)
| where severityLevel >= 3
| project timestamp, message, severityLevel, customDimensions
| order by timestamp desc
```

#### Logs de eventos de partido

```kusto
traces
| where message contains "Partido"
| where timestamp > ago(24h)
| project timestamp, message, customDimensions
| order by timestamp desc
```

#### Logs de SignalR

```kusto
traces
| where message contains "SignalR"
| where timestamp > ago(1h)
| project timestamp, message, customDimensions
| order by timestamp desc
```

### 5.4 Retención de Logs

Configurar retención en Azure Portal:

- **Logs de Application Insights**: 90 días (configurable)
- **Logs de App Service**: 7 días
- **Logs de base de datos**: 30 días

Para retención a largo plazo, exportar a Azure Storage:

```bash
az monitor log-analytics workspace data-export create \
  --resource-group sportzone-rg \
  --workspace-name sportzone-logs \
  --name export-to-storage \
  --destination /subscriptions/{subscription-id}/resourceGroups/sportzone-rg/providers/Microsoft.Storage/storageAccounts/sportzonelogs \
  --enable true
```

---

## Checklist de Monitoreo

### Configuración Inicial
- [ ] Application Insights configurado
- [ ] Health checks implementados
- [ ] Serilog configurado
- [ ] Métricas personalizadas implementadas

### Alertas
- [ ] Alerta de errores 5xx configurada
- [ ] Alerta de tiempo de respuesta configurada
- [ ] Alerta de disponibilidad configurada
- [ ] Alerta de CPU/memoria configurada
- [ ] Notificaciones por email configuradas

### Dashboards
- [ ] Dashboard de Application Insights creado
- [ ] Queries de Log Analytics guardadas
- [ ] Dashboard de Grafana configurado (opcional)

### Logs
- [ ] Logging estructurado implementado
- [ ] Retención de logs configurada
- [ ] Exportación a Storage configurada

---

## Recursos Adicionales

- [Application Insights Documentation](https://docs.microsoft.com/azure/azure-monitor/app/app-insights-overview)
- [Health Checks in ASP.NET Core](https://docs.microsoft.com/aspnet/core/host-and-deploy/health-checks)
- [Serilog Documentation](https://serilog.net/)
- [Kusto Query Language](https://docs.microsoft.com/azure/data-explorer/kusto/query/)
