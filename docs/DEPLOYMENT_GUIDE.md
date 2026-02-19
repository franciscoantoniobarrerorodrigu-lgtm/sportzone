# Guía de Deployment - SportZone Pro

## Tabla de Contenidos

1. [Preparación para Producción](#1-preparación-para-producción)
2. [Deployment Backend (.NET 8)](#2-deployment-backend-net-8)
3. [Deployment Frontend (Angular 17)](#3-deployment-frontend-angular-17)
4. [Deployment Base de Datos](#4-deployment-base-de-datos)
5. [Monitoreo y Logs](#5-monitoreo-y-logs)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Preparación para Producción

### 1.1 Variables de Entorno de Producción

#### Backend (.NET 8)

Crear archivo `appsettings.Production.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Supabase": {
    "Url": "https://your-project.supabase.co",
    "AnonKey": "your-anon-key",
    "ServiceRoleKey": "your-service-role-key",
    "JwtSecret": "your-jwt-secret"
  },
  "Firebase": {
    "ProjectId": "your-firebase-project",
    "CredentialsPath": "/app/firebase-adminsdk.json"
  },
  "ApplicationInsights": {
    "ConnectionString": "InstrumentationKey=your-key;IngestionEndpoint=https://..."
  },
  "Cors": {
    "AllowedOrigins": [
      "https://sportzone.app",
      "https://www.sportzone.app"
    ]
  }
}
```


#### Frontend (Angular 17)

Crear archivo `sportzone-web/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.sportzone.app/api',
  hubUrl: 'https://api.sportzone.app',
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseAnonKey: 'your-anon-key',
  firebase: {
    apiKey: 'your-api-key',
    authDomain: 'your-project.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-project.appspot.com',
    messagingSenderId: 'your-sender-id',
    appId: 'your-app-id',
    vapidKey: 'your-vapid-key'
  }
};
```

### 1.2 Configurar CORS para Producción

En `SportZone.API/Program.cs`, actualizar configuración CORS:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("Production", policy =>
    {
        var allowedOrigins = builder.Configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>() ?? Array.Empty<string>();
        
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// En app.UseCors()
app.UseCors(builder.Environment.IsProduction() ? "Production" : "Development");
```

### 1.3 Certificados SSL

Los certificados SSL son gestionados automáticamente por:
- **Azure App Service**: Certificado SSL gratuito con dominio personalizado
- **Vercel/Netlify**: Certificado SSL automático con Let's Encrypt

### 1.4 Optimizar Build de Angular

```bash
cd sportzone-web
ng build --configuration production
```

Optimizaciones aplicadas automáticamente:
- Minificación de JavaScript y CSS
- Tree-shaking para eliminar código no usado
- Ahead-of-Time (AOT) compilation
- Lazy loading de módulos
- Service Worker para PWA


### 1.5 Optimizar Build de .NET

```bash
cd SportZone.API
dotnet publish -c Release -o ./publish
```

Optimizaciones aplicadas:
- Compilación en modo Release
- Eliminación de símbolos de depuración
- Optimización de código IL
- Trimming de dependencias no usadas

---

## 2. Deployment Backend (.NET 8)

### 2.1 Dockerfile para Backend

Crear archivo `SportZone.API/Dockerfile`:

```dockerfile
# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["SportZone.API.csproj", "./"]
RUN dotnet restore "SportZone.API.csproj"

# Copy source code and build
COPY . .
RUN dotnet build "SportZone.API.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "SportZone.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Copy published files
COPY --from=publish /app/publish .

# Copy Firebase credentials (if using FCM)
COPY firebase-adminsdk.json /app/firebase-adminsdk.json

ENTRYPOINT ["dotnet", "SportZone.API.dll"]
```

### 2.2 Configurar Azure App Service

#### Opción A: Deployment desde Azure Portal

1. Crear App Service:
```bash
az login
az group create --name sportzone-rg --location eastus
az appservice plan create --name sportzone-plan --resource-group sportzone-rg --sku B1 --is-linux
az webapp create --name sportzone-api --resource-group sportzone-rg --plan sportzone-plan --runtime "DOTNETCORE:8.0"
```

2. Configurar variables de entorno en Azure Portal:
   - Settings → Configuration → Application settings
   - Agregar todas las variables de `appsettings.Production.json`

3. Habilitar HTTPS only:
   - Settings → TLS/SSL settings → HTTPS Only: On


#### Opción B: Deployment con Docker

1. Build y push de imagen Docker:
```bash
cd SportZone.API
docker build -t sportzone-api:latest .
docker tag sportzone-api:latest youracr.azurecr.io/sportzone-api:latest
docker push youracr.azurecr.io/sportzone-api:latest
```

2. Crear Web App con contenedor:
```bash
az webapp create --name sportzone-api --resource-group sportzone-rg \
  --plan sportzone-plan --deployment-container-image-name youracr.azurecr.io/sportzone-api:latest
```

### 2.3 CI/CD con GitHub Actions

Crear archivo `.github/workflows/deploy-backend.yml`:

```yaml
name: Deploy Backend to Azure

on:
  push:
    branches: [ main ]
    paths:
      - 'SportZone.API/**'
  workflow_dispatch:

env:
  AZURE_WEBAPP_NAME: sportzone-api
  DOTNET_VERSION: '8.0.x'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup .NET
      uses: actions/setup-dotnet@v4
      with:
        dotnet-version: ${{ env.DOTNET_VERSION }}
    
    - name: Restore dependencies
      run: dotnet restore SportZone.API/SportZone.API.csproj
    
    - name: Build
      run: dotnet build SportZone.API/SportZone.API.csproj --configuration Release --no-restore
    
    - name: Test
      run: dotnet test SportZone.API.Tests/SportZone.API.Tests.csproj --no-restore --verbosity normal
    
    - name: Publish
      run: dotnet publish SportZone.API/SportZone.API.csproj -c Release -o ./publish
    
    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: ${{ env.AZURE_WEBAPP_NAME }}
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: ./publish
```


### 2.4 Configurar Logging y Monitoreo

En `Program.cs`, agregar Application Insights:

```csharp
builder.Services.AddApplicationInsightsTelemetry(options =>
{
    options.ConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"];
});

builder.Logging.AddApplicationInsights();
```

### 2.5 Configurar Application Insights

1. Crear recurso de Application Insights en Azure:
```bash
az monitor app-insights component create \
  --app sportzone-insights \
  --location eastus \
  --resource-group sportzone-rg
```

2. Obtener Connection String y agregarlo a App Settings

3. Configurar alertas personalizadas:
   - Errores HTTP 5xx > 10 en 5 minutos
   - Tiempo de respuesta > 3 segundos
   - Disponibilidad < 99%

---

## 3. Deployment Frontend (Angular 17)

### 3.1 Dockerfile para Frontend

Crear archivo `sportzone-web/Dockerfile`:

```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build Angular app
RUN npm run build -- --configuration production

# Runtime stage with nginx
FROM nginx:alpine
COPY --from=build /app/dist/sportzone-web/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Crear archivo `sportzone-web/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        # Gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

        # Cache static assets
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Angular routing
        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```


### 3.2 Configurar Vercel

#### Opción A: Deployment desde Vercel Dashboard

1. Conectar repositorio de GitHub a Vercel
2. Configurar proyecto:
   - Framework Preset: Angular
   - Build Command: `cd sportzone-web && npm run build`
   - Output Directory: `sportzone-web/dist/sportzone-web/browser`
   - Install Command: `cd sportzone-web && npm install`

3. Configurar variables de entorno en Vercel Dashboard:
   - `VITE_API_URL`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_FIREBASE_API_KEY`
   - etc.

#### Opción B: Deployment con Vercel CLI

```bash
cd sportzone-web
npm install -g vercel
vercel login
vercel --prod
```

Crear archivo `sportzone-web/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/sportzone-web/browser"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```


### 3.3 Configurar Netlify (Alternativa)

Crear archivo `sportzone-web/netlify.toml`:

```toml
[build]
  base = "sportzone-web"
  command = "npm run build"
  publish = "dist/sportzone-web/browser"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 3.4 CI/CD para Frontend

Crear archivo `.github/workflows/deploy-frontend.yml`:

```yaml
name: Deploy Frontend to Vercel

on:
  push:
    branches: [ main ]
    paths:
      - 'sportzone-web/**'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        cache-dependency-path: sportzone-web/package-lock.json
    
    - name: Install dependencies
      run: |
        cd sportzone-web
        npm ci
    
    - name: Run tests
      run: |
        cd sportzone-web
        npm run test -- --watch=false --browsers=ChromeHeadless
    
    - name: Build
      run: |
        cd sportzone-web
        npm run build -- --configuration production
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        working-directory: ./sportzone-web
        vercel-args: '--prod'
```


### 3.5 Configurar CDN para Assets

Vercel y Netlify incluyen CDN global automáticamente. Para optimización adicional:

1. **Imágenes**: Usar Vercel Image Optimization o Cloudinary
2. **Fuentes**: Servir desde Google Fonts CDN o self-host con preload
3. **Scripts externos**: Usar CDN con SRI (Subresource Integrity)

### 3.6 Configurar Caché de Navegador

En `sportzone-web/angular.json`, configurar service worker:

```json
{
  "projects": {
    "sportzone-web": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "serviceWorker": true,
              "ngswConfigPath": "ngsw-config.json"
            }
          }
        }
      }
    }
  }
}
```

Crear `sportzone-web/ngsw-config.json`:

```json
{
  "$schema": "./node_modules/@angular/service-worker/config/schema.json",
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": [
          "/favicon.ico",
          "/index.html",
          "/manifest.webmanifest",
          "/*.css",
          "/*.js"
        ]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": [
          "/assets/**",
          "/*.(svg|cur|jpg|jpeg|png|apng|webp|avif|gif|otf|ttf|woff|woff2)"
        ]
      }
    }
  ],
  "dataGroups": [
    {
      "name": "api-cache",
      "urls": [
        "https://api.sportzone.app/api/liga/**",
        "https://api.sportzone.app/api/goleadores/**"
      ],
      "cacheConfig": {
        "maxSize": 100,
        "maxAge": "1h",
        "timeout": "10s",
        "strategy": "freshness"
      }
    }
  ]
}
```

---

## 4. Deployment Base de Datos

### 4.1 Backup de Base de Datos

#### Backup Manual desde Supabase Dashboard

1. Ir a Database → Backups
2. Click en "Create backup"
3. Descargar backup SQL


#### Backup Automatizado con Script

Crear archivo `database/backup.sh`:

```bash
#!/bin/bash

# Variables
SUPABASE_PROJECT_REF="your-project-ref"
SUPABASE_DB_PASSWORD="your-db-password"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/sportzone_backup_$DATE.sql"

# Crear directorio de backups
mkdir -p $BACKUP_DIR

# Ejecutar backup
PGPASSWORD=$SUPABASE_DB_PASSWORD pg_dump \
  -h db.$SUPABASE_PROJECT_REF.supabase.co \
  -U postgres \
  -d postgres \
  -F c \
  -f $BACKUP_FILE

# Comprimir backup
gzip $BACKUP_FILE

echo "Backup completado: ${BACKUP_FILE}.gz"

# Eliminar backups antiguos (más de 30 días)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

Configurar cron job para backups diarios:

```bash
# Editar crontab
crontab -e

# Agregar línea para backup diario a las 2 AM
0 2 * * * /path/to/database/backup.sh
```

### 4.2 Ejecutar Migraciones en Producción

#### Opción A: Desde Supabase SQL Editor

1. Ir a SQL Editor en Supabase Dashboard
2. Ejecutar scripts en orden:
   - `01_extensions.sql`
   - `02_tables_core.sql`
   - `03_tables_partidos.sql`
   - etc.

#### Opción B: Con psql CLI

```bash
# Conectar a base de datos de producción
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Ejecutar scripts
\i database/01_extensions.sql
\i database/02_tables_core.sql
\i database/03_tables_partidos.sql
# ... etc
```

#### Opción C: Script automatizado

Crear archivo `database/migrate.sh`:

```bash
#!/bin/bash

SUPABASE_PROJECT_REF="your-project-ref"
SUPABASE_DB_PASSWORD="your-db-password"
DB_URL="postgresql://postgres:$SUPABASE_DB_PASSWORD@db.$SUPABASE_PROJECT_REF.supabase.co:5432/postgres"

echo "Ejecutando migraciones..."

for file in database/*.sql; do
  echo "Ejecutando $file..."
  PGPASSWORD=$SUPABASE_DB_PASSWORD psql $DB_URL -f $file
done

echo "Migraciones completadas"
```


### 4.3 Verificar Índices y Rendimiento

Ejecutar query para verificar índices:

```sql
-- Ver todos los índices
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Ver tamaño de tablas e índices
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) AS index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Ver queries lentas (requiere pg_stat_statements)
SELECT
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```

### 4.4 Configurar Backups Automáticos

En Supabase Dashboard:

1. Ir a Database → Backups
2. Configurar "Point in Time Recovery" (PITR)
   - Disponible en plan Pro o superior
   - Permite restaurar a cualquier punto en el tiempo
3. Configurar retención de backups:
   - Daily backups: 7 días
   - Weekly backups: 4 semanas
   - Monthly backups: 12 meses

Para proyectos críticos, considerar:
- Replicación a otra región
- Backups externos a S3/Azure Blob Storage

---

## 5. Monitoreo y Logs

### 5.1 Configurar Alertas de Errores

#### Application Insights (Backend)

Crear alertas en Azure Portal:

```bash
# Alerta de errores HTTP 5xx
az monitor metrics alert create \
  --name "High-5xx-Errors" \
  --resource-group sportzone-rg \
  --scopes /subscriptions/{subscription-id}/resourceGroups/sportzone-rg/providers/Microsoft.Web/sites/sportzone-api \
  --condition "count requests/failed > 10" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action email admin@sportzone.app

# Alerta de tiempo de respuesta alto
az monitor metrics alert create \
  --name "High-Response-Time" \
  --resource-group sportzone-rg \
  --scopes /subscriptions/{subscription-id}/resourceGroups/sportzone-rg/providers/Microsoft.Web/sites/sportzone-api \
  --condition "avg requests/duration > 3000" \
  --window-size 5m \
  --evaluation-frequency 1m
```


#### Sentry (Frontend y Backend)

Instalar Sentry:

```bash
# Backend
dotnet add package Sentry.AspNetCore

# Frontend
cd sportzone-web
npm install @sentry/angular
```

Configurar Sentry en backend (`Program.cs`):

```csharp
builder.WebHost.UseSentry(options =>
{
    options.Dsn = builder.Configuration["Sentry:Dsn"];
    options.Environment = builder.Environment.EnvironmentName;
    options.TracesSampleRate = 1.0;
});
```

Configurar Sentry en frontend (`app.config.ts`):

```typescript
import * as Sentry from "@sentry/angular";

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        showDialog: false,
      }),
    },
    {
      provide: Sentry.TraceService,
      deps: [Router],
    },
    provideRouter(routes),
  ]
};

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: environment.production ? 'production' : 'development',
  tracesSampleRate: 1.0,
});
```

### 5.2 Configurar Dashboard de Métricas

#### Azure Application Insights Dashboard

1. Crear dashboard personalizado en Azure Portal
2. Agregar widgets:
   - Request rate (requests/sec)
   - Response time (avg, p95, p99)
   - Failed requests (5xx errors)
   - Dependency calls (Supabase, Firebase)
   - Server response time
   - Active users

#### Grafana + Prometheus (Alternativa)

Crear archivo `docker-compose.monitoring.yml`:

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana

volumes:
  prometheus-data:
  grafana-data:
```


### 5.3 Configurar Logs Centralizados

#### Azure Log Analytics

Configurar en `Program.cs`:

```csharp
builder.Logging.AddAzureWebAppDiagnostics();
builder.Services.Configure<AzureFileLoggerOptions>(options =>
{
    options.FileName = "sportzone-api-";
    options.FileSizeLimit = 50 * 1024 * 1024; // 50 MB
    options.RetainedFileCountLimit = 5;
});
```

Query de ejemplo en Log Analytics:

```kusto
AppTraces
| where TimeGenerated > ago(1h)
| where SeverityLevel >= 3  // Warning o superior
| project TimeGenerated, Message, SeverityLevel, Properties
| order by TimeGenerated desc
```

#### ELK Stack (Elasticsearch, Logstash, Kibana)

Configurar Serilog para enviar logs a Elasticsearch:

```csharp
builder.Host.UseSerilog((context, configuration) =>
{
    configuration
        .ReadFrom.Configuration(context.Configuration)
        .Enrich.FromLogContext()
        .Enrich.WithMachineName()
        .WriteTo.Console()
        .WriteTo.Elasticsearch(new ElasticsearchSinkOptions(new Uri("http://elasticsearch:9200"))
        {
            AutoRegisterTemplate = true,
            IndexFormat = $"sportzone-api-{DateTime.UtcNow:yyyy-MM}"
        });
});
```

### 5.4 Configurar Health Checks

Implementar health checks en `Program.cs`:

```csharp
builder.Services.AddHealthChecks()
    .AddCheck("self", () => HealthCheckResult.Healthy())
    .AddNpgSql(
        builder.Configuration["Supabase:ConnectionString"]!,
        name: "supabase-db",
        timeout: TimeSpan.FromSeconds(3))
    .AddUrlGroup(
        new Uri($"{builder.Configuration["Supabase:Url"]}/rest/v1/"),
        name: "supabase-api",
        timeout: TimeSpan.FromSeconds(3))
    .AddCheck<SignalRHealthCheck>("signalr");

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

Crear `SignalRHealthCheck.cs`:

```csharp
public class SignalRHealthCheck : IHealthCheck
{
    private readonly IHubContext<PartidoHub> _hubContext;

    public SignalRHealthCheck(IHubContext<PartidoHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Verificar que el hub está disponible
            return Task.FromResult(HealthCheckResult.Healthy("SignalR hub is operational"));
        }
        catch (Exception ex)
        {
            return Task.FromResult(HealthCheckResult.Unhealthy("SignalR hub is down", ex));
        }
    }
}
```


Configurar monitoreo de health checks con Azure:

```bash
az monitor app-insights web-test create \
  --resource-group sportzone-rg \
  --name "API Health Check" \
  --location eastus \
  --kind ping \
  --web-test-name "api-health" \
  --url "https://api.sportzone.app/health" \
  --frequency 300 \
  --timeout 30 \
  --enabled true
```

---

## 6. Troubleshooting

### 6.1 Problemas Comunes

#### Backend no inicia

**Síntoma**: Error al iniciar la aplicación

**Soluciones**:
1. Verificar variables de entorno:
   ```bash
   az webapp config appsettings list --name sportzone-api --resource-group sportzone-rg
   ```

2. Revisar logs:
   ```bash
   az webapp log tail --name sportzone-api --resource-group sportzone-rg
   ```

3. Verificar conexión a Supabase:
   ```bash
   curl https://your-project.supabase.co/rest/v1/
   ```

#### SignalR no conecta

**Síntoma**: Clientes no reciben actualizaciones en tiempo real

**Soluciones**:
1. Verificar CORS en backend
2. Verificar WebSocket está habilitado en Azure App Service:
   ```bash
   az webapp config set --name sportzone-api --resource-group sportzone-rg --web-sockets-enabled true
   ```

3. Verificar URL del hub en frontend:
   ```typescript
   // Debe incluir protocolo y dominio completo
   hubUrl: 'https://api.sportzone.app'
   ```

#### Frontend no carga

**Síntoma**: Página en blanco o error 404

**Soluciones**:
1. Verificar build de producción:
   ```bash
   cd sportzone-web
   npm run build -- --configuration production
   ls -la dist/sportzone-web/browser
   ```

2. Verificar configuración de routing en Vercel/Netlify
3. Revisar console del navegador para errores de CORS

#### Base de datos lenta

**Síntoma**: Queries tardan más de 1 segundo

**Soluciones**:
1. Verificar índices:
   ```sql
   SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0;
   ```

2. Analizar queries lentas:
   ```sql
   SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;
   ```

3. Ejecutar VACUUM y ANALYZE:
   ```sql
   VACUUM ANALYZE;
   ```


### 6.2 Rollback de Deployment

#### Backend (Azure App Service)

```bash
# Listar slots de deployment
az webapp deployment slot list --name sportzone-api --resource-group sportzone-rg

# Swap a versión anterior
az webapp deployment slot swap --name sportzone-api --resource-group sportzone-rg --slot staging --target-slot production
```

#### Frontend (Vercel)

```bash
# Listar deployments
vercel ls

# Rollback a deployment anterior
vercel rollback [deployment-url]
```

#### Base de Datos

```bash
# Restaurar desde backup
PGPASSWORD=$SUPABASE_DB_PASSWORD pg_restore \
  -h db.$SUPABASE_PROJECT_REF.supabase.co \
  -U postgres \
  -d postgres \
  -c \
  backups/sportzone_backup_20240115_020000.sql
```

### 6.3 Contactos de Soporte

- **Azure Support**: https://portal.azure.com/#blade/Microsoft_Azure_Support/HelpAndSupportBlade
- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Firebase Support**: https://firebase.google.com/support

---

## Checklist de Deployment

### Pre-Deployment

- [ ] Backup completo de base de datos
- [ ] Tests pasando (backend y frontend)
- [ ] Variables de entorno configuradas
- [ ] Certificados SSL configurados
- [ ] CORS configurado para dominio de producción
- [ ] Secrets de GitHub Actions configurados

### Deployment

- [ ] Backend desplegado en Azure App Service
- [ ] Frontend desplegado en Vercel/Netlify
- [ ] Migraciones de base de datos ejecutadas
- [ ] Health checks respondiendo correctamente
- [ ] SignalR conectando correctamente
- [ ] Notificaciones push funcionando

### Post-Deployment

- [ ] Verificar logs sin errores críticos
- [ ] Verificar métricas de rendimiento
- [ ] Configurar alertas de monitoreo
- [ ] Documentar versión desplegada
- [ ] Notificar a stakeholders
- [ ] Realizar smoke tests en producción

---

## Recursos Adicionales

- [Documentación Azure App Service](https://docs.microsoft.com/azure/app-service/)
- [Documentación Vercel](https://vercel.com/docs)
- [Documentación Supabase](https://supabase.com/docs)
- [Documentación SignalR](https://docs.microsoft.com/aspnet/core/signalr/)
- [Documentación Angular](https://angular.io/docs)
- [Documentación .NET 8](https://docs.microsoft.com/dotnet/core/)

