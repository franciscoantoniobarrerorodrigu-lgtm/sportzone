# Procedimientos de Deployment - SportZone Pro

## 1. Visión General

Este documento describe los procedimientos completos de deployment para SportZone Pro, incluyendo:
- Preparación de ambientes
- Deployment de base de datos
- Deployment de backend (.NET API)
- Deployment de frontend (Angular)
- Configuración de servicios externos
- Rollback procedures
- Monitoreo post-deployment

---

## 2. Ambientes

### 2.1 Configuración de Ambientes

| Ambiente | Propósito | URL | Branch |
|----------|-----------|-----|--------|
| **Development** | Desarrollo local | localhost:4200 / localhost:5000 | feature/* |
| **Staging** | Testing pre-producción | staging.sportzone.app | develop |
| **Production** | Producción | sportzone.app | main |

### 2.2 Variables de Entorno

**Frontend (Angular)**:
```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.sportzone.app',
  hubUrl: 'https://api.sportzone.app',
  supabaseUrl: 'https://xxx.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  firebaseConfig: {
    apiKey: 'AIzaSy...',
    authDomain: 'sportzone-xxx.firebaseapp.com',
    projectId: 'sportzone-xxx',
    messagingSenderId: '123456789'
  }
};
```

**Backend (.NET)**:
```json
// appsettings.Production.json
{
  "Supabase": {
    "Url": "https://xxx.supabase.co",
    "AnonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "JwtSecret": "your-jwt-secret-here"
  },
  "Firebase": {
    "ProjectId": "sportzone-xxx",
    "CredentialsPath": "/app/firebase-adminsdk.json"
  },
  "ConnectionStrings": {
    "Supabase": "Host=db.xxx.supabase.co;Database=postgres;Username=postgres;Password=xxx"
  },
  "Cors": {
    "AllowedOrigins": ["https://sportzone.app", "https://www.sportzone.app"]
  },
  "ApplicationInsights": {
    "InstrumentationKey": "xxx-xxx-xxx"
  }
}
```

---

## 3. Deployment de Base de Datos

### 3.1 Pre-requisitos

- Acceso a Supabase Dashboard
- Credenciales de administrador de base de datos
- Scripts SQL en `/database/`
- Backup de base de datos actual

### 3.2 Procedimiento de Deployment

**Paso 1: Backup de Base de Datos**

```bash
# Conectar a Supabase
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Crear backup
pg_dump -h db.[PROJECT-REF].supabase.co \
        -U postgres \
        -d postgres \
        -F c \
        -f backup_$(date +%Y%m%d_%H%M%S).dump

# Verificar backup
ls -lh backup_*.dump
```

**Paso 2: Ejecutar Migraciones**

```bash
# Orden de ejecución de scripts
cd database/

# 1. Extensiones
psql -f 01_extensions.sql

# 2. Tablas core
psql -f 02_tables_core.sql
psql -f 03_tables_partidos.sql
psql -f 04_tables_admin.sql
psql -f 05_tables_notificaciones.sql
psql -f 06_tables_marketing.sql

# 3. Vistas
psql -f 07_views.sql

# 4. Funciones y triggers
psql -f 08_functions.sql
psql -f 09_triggers.sql

# 5. Seguridad
psql -f 10_rls.sql

# 6. Índices
psql -f 11_indexes.sql

# 7. Datos iniciales (opcional)
psql -f 12_seed_data.sql

# 8. Roles y permisos
psql -f 13_auth_roles.sql
```

**Paso 3: Verificar Migraciones**

```sql
-- Verificar tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar vistas
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public';

-- Verificar funciones
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public';

-- Verificar índices
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

**Paso 4: Crear Usuarios de Prueba**

```sql
-- Crear usuario admin
SELECT update_user_role(
  '[USER-UUID]'::uuid, 
  'admin'
);

-- Crear usuario planillero
SELECT update_user_role(
  '[USER-UUID]'::uuid, 
  'planillero'
);

-- Verificar roles
SELECT id, email, raw_user_meta_data->>'role' as role
FROM auth.users;
```

### 3.3 Rollback de Base de Datos

```bash
# Restaurar desde backup
pg_restore -h db.[PROJECT-REF].supabase.co \
           -U postgres \
           -d postgres \
           -c \
           backup_20250115_120000.dump

# Verificar restauración
psql -c "SELECT COUNT(*) FROM equipos;"
psql -c "SELECT COUNT(*) FROM partidos;"
```

---

## 4. Deployment de Backend (.NET API)

### 4.1 Pre-requisitos

- .NET 8 SDK instalado
- Docker instalado (para containerización)
- Azure CLI instalado
- Acceso a Azure Container Registry
- Acceso a Azure App Service

### 4.2 Build Local

```bash
cd SportZone.API/

# Restaurar dependencias
dotnet restore

# Build en modo Release
dotnet build -c Release

# Ejecutar tests
dotnet test

# Publicar aplicación
dotnet publish -c Release -o ./publish
```

### 4.3 Containerización con Docker

**Dockerfile**:
```dockerfile
# SportZone.API/Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["SportZone.API.csproj", "./"]
RUN dotnet restore "SportZone.API.csproj"
COPY . .
RUN dotnet build "SportZone.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SportZone.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Copiar credenciales de Firebase
COPY firebase-adminsdk.json /app/firebase-adminsdk.json

ENTRYPOINT ["dotnet", "SportZone.API.dll"]
```

**Build y Push de Imagen**:
```bash
# Build imagen Docker
docker build -t sportzone-api:latest .

# Tag para Azure Container Registry
docker tag sportzone-api:latest \
  sportzoneacr.azurecr.io/sportzone-api:latest

# Login a Azure Container Registry
az acr login --name sportzoneacr

# Push imagen
docker push sportzoneacr.azurecr.io/sportzone-api:latest
```

### 4.4 Deployment a Azure App Service

**Opción 1: Azure CLI**

```bash
# Login a Azure
az login

# Crear Resource Group (si no existe)
az group create \
  --name sportzone-rg \
  --location eastus

# Crear App Service Plan
az appservice plan create \
  --name sportzone-plan \
  --resource-group sportzone-rg \
  --is-linux \
  --sku P1V2

# Crear Web App
az webapp create \
  --name sportzone-api \
  --resource-group sportzone-rg \
  --plan sportzone-plan \
  --deployment-container-image-name sportzoneacr.azurecr.io/sportzone-api:latest

# Configurar variables de entorno
az webapp config appsettings set \
  --name sportzone-api \
  --resource-group sportzone-rg \
  --settings \
    Supabase__Url="https://xxx.supabase.co" \
    Supabase__AnonKey="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
    Supabase__JwtSecret="your-jwt-secret" \
    Firebase__ProjectId="sportzone-xxx" \
    ASPNETCORE_ENVIRONMENT="Production"

# Configurar CORS
az webapp cors add \
  --name sportzone-api \
  --resource-group sportzone-rg \
  --allowed-origins "https://sportzone.app" "https://www.sportzone.app"

# Habilitar logs
az webapp log config \
  --name sportzone-api \
  --resource-group sportzone-rg \
  --application-logging filesystem \
  --level information

# Restart app
az webapp restart \
  --name sportzone-api \
  --resource-group sportzone-rg
```

**Opción 2: GitHub Actions CI/CD**

```yaml
# .github/workflows/deploy-backend.yml
name: Deploy Backend to Azure

on:
  push:
    branches: [main]
    paths:
      - 'SportZone.API/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: '8.0.x'
    
    - name: Restore dependencies
      run: dotnet restore SportZone.API/SportZone.API.csproj
    
    - name: Build
      run: dotnet build SportZone.API/SportZone.API.csproj -c Release --no-restore
    
    - name: Test
      run: dotnet test SportZone.API.Tests/SportZone.API.Tests.csproj --no-build --verbosity normal
    
    - name: Login to Azure Container Registry
      uses: azure/docker-login@v1
      with:
        login-server: sportzoneacr.azurecr.io
        username: ${{ secrets.ACR_USERNAME }}
        password: ${{ secrets.ACR_PASSWORD }}
    
    - name: Build and push Docker image
      run: |
        cd SportZone.API
        docker build -t sportzoneacr.azurecr.io/sportzone-api:${{ github.sha }} .
        docker push sportzoneacr.azurecr.io/sportzone-api:${{ github.sha }}
    
    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'sportzone-api'
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        images: 'sportzoneacr.azurecr.io/sportzone-api:${{ github.sha }}'
    
    - name: Run smoke tests
      run: |
        sleep 30
        curl -f https://sportzone-api.azurewebsites.net/health || exit 1
```

### 4.5 Verificación Post-Deployment

```bash
# Health check
curl https://api.sportzone.app/health

# Verificar endpoints
curl https://api.sportzone.app/api/liga/torneos

# Verificar SignalR Hub
curl https://api.sportzone.app/hubs/partidos

# Ver logs
az webapp log tail \
  --name sportzone-api \
  --resource-group sportzone-rg
```

### 4.6 Rollback de Backend

```bash
# Listar deployments anteriores
az webapp deployment list \
  --name sportzone-api \
  --resource-group sportzone-rg

# Rollback a deployment anterior
az webapp deployment slot swap \
  --name sportzone-api \
  --resource-group sportzone-rg \
  --slot staging \
  --target-slot production

# O desplegar imagen anterior
az webapp config container set \
  --name sportzone-api \
  --resource-group sportzone-rg \
  --docker-custom-image-name sportzoneacr.azurecr.io/sportzone-api:previous-sha
```

---

## 5. Deployment de Frontend (Angular)

### 5.1 Pre-requisitos

- Node.js 18+ instalado
- Angular CLI instalado
- Cuenta de Vercel
- Vercel CLI instalado

### 5.2 Build Local

```bash
cd sportzone-web/

# Instalar dependencias
npm install

# Build para producción
ng build --configuration production

# Verificar build
ls -lh dist/sportzone-web/browser/

# Ejecutar tests
ng test --watch=false --browsers=ChromeHeadless

# Ejecutar e2e tests (opcional)
ng e2e
```

### 5.3 Optimizaciones de Build

**angular.json**:
```json
{
  "projects": {
    "sportzone-web": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "optimization": true,
              "outputHashing": "all",
              "sourceMap": false,
              "namedChunks": false,
              "aot": true,
              "extractLicenses": true,
              "vendorChunk": false,
              "buildOptimizer": true,
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kb",
                  "maximumError": "1mb"
                },
                {
                  "type": "anyComponentStyle",
                  "maximumWarning": "2kb",
                  "maximumError": "4kb"
                }
              ],
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.prod.ts"
                }
              ]
            }
          }
        }
      }
    }
  }
}
```

### 5.4 Deployment a Vercel

**Opción 1: Vercel CLI**

```bash
# Login a Vercel
vercel login

# Deploy a producción
vercel --prod

# Configurar variables de entorno
vercel env add SUPABASE_URL production
vercel env add SUPABASE_ANON_KEY production
vercel env add API_URL production
```

**Opción 2: GitHub Integration**

```json
// vercel.json
{
  "version": 2,
  "name": "sportzone-web",
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
  "env": {
    "SUPABASE_URL": "@supabase-url",
    "SUPABASE_ANON_KEY": "@supabase-anon-key",
    "API_URL": "@api-url"
  },
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

**GitHub Actions CI/CD**:

```yaml
# .github/workflows/deploy-frontend.yml
name: Deploy Frontend to Vercel

on:
  push:
    branches: [main]
    paths:
      - 'sportzone-web/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: sportzone-web/package-lock.json
    
    - name: Install dependencies
      run: |
        cd sportzone-web
        npm ci
    
    - name: Run tests
      run: |
        cd sportzone-web
        npm run test:ci
    
    - name: Build
      run: |
        cd sportzone-web
        npm run build:prod
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
        working-directory: sportzone-web
```

### 5.5 Configuración de PWA

**ngsw-config.json**:
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
        "https://api.sportzone.app/api/**"
      ],
      "cacheConfig": {
        "maxSize": 100,
        "maxAge": "5m",
        "timeout": "10s",
        "strategy": "freshness"
      }
    }
  ]
}
```

### 5.6 Verificación Post-Deployment

```bash
# Verificar sitio
curl -I https://sportzone.app

# Verificar PWA manifest
curl https://sportzone.app/manifest.webmanifest

# Verificar service worker
curl https://sportzone.app/ngsw.json

# Lighthouse audit
npx lighthouse https://sportzone.app --view

# Verificar performance
curl -w "@curl-format.txt" -o /dev/null -s https://sportzone.app
```

### 5.7 Rollback de Frontend

```bash
# Listar deployments en Vercel
vercel ls

# Rollback a deployment anterior
vercel rollback [DEPLOYMENT-URL]

# O promover deployment específico
vercel promote [DEPLOYMENT-URL] --scope=sportzone
```



---

## 6. Configuración de Servicios Externos

### 6.1 Firebase Cloud Messaging

**Paso 1: Crear Proyecto en Firebase Console**

1. Ir a https://console.firebase.google.com
2. Crear nuevo proyecto "SportZone Pro"
3. Habilitar Cloud Messaging
4. Generar clave de cuenta de servicio

**Paso 2: Descargar Credenciales**

```bash
# Descargar firebase-adminsdk.json desde Firebase Console
# Settings → Service Accounts → Generate New Private Key

# Copiar a backend
cp firebase-adminsdk.json SportZone.API/firebase-adminsdk.json

# Agregar a .gitignore
echo "firebase-adminsdk.json" >> .gitignore
```

**Paso 3: Configurar en Backend**

```csharp
// Program.cs
builder.Services.AddSingleton(provider =>
{
    var credential = GoogleCredential.FromFile("firebase-adminsdk.json");
    return FirebaseMessaging.GetMessaging(FirebaseApp.Create(new AppOptions
    {
        Credential = credential
    }));
});
```

**Paso 4: Configurar en Frontend**

```typescript
// src/environments/environment.prod.ts
export const environment = {
  firebaseConfig: {
    apiKey: 'AIzaSy...',
    authDomain: 'sportzone-xxx.firebaseapp.com',
    projectId: 'sportzone-xxx',
    storageBucket: 'sportzone-xxx.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:xxx'
  }
};
```

```typescript
// src/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSy...',
  authDomain: 'sportzone-xxx.firebaseapp.com',
  projectId: 'sportzone-xxx',
  storageBucket: 'sportzone-xxx.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:xxx'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/assets/icons/icon-192.png',
    badge: '/assets/icons/badge-72.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

### 6.2 Application Insights

**Paso 1: Crear Recurso en Azure**

```bash
# Crear Application Insights
az monitor app-insights component create \
  --app sportzone-insights \
  --location eastus \
  --resource-group sportzone-rg \
  --application-type web

# Obtener Instrumentation Key
az monitor app-insights component show \
  --app sportzone-insights \
  --resource-group sportzone-rg \
  --query instrumentationKey
```

**Paso 2: Configurar en Backend**

```json
// appsettings.Production.json
{
  "ApplicationInsights": {
    "InstrumentationKey": "xxx-xxx-xxx-xxx",
    "EnableAdaptiveSampling": true,
    "EnablePerformanceCounterCollectionModule": true
  }
}
```

```csharp
// Program.cs
builder.Services.AddApplicationInsightsTelemetry(options =>
{
    options.InstrumentationKey = builder.Configuration["ApplicationInsights:InstrumentationKey"];
});
```

**Paso 3: Configurar Alertas**

```bash
# Crear alerta para errores
az monitor metrics alert create \
  --name "High Error Rate" \
  --resource-group sportzone-rg \
  --scopes /subscriptions/xxx/resourceGroups/sportzone-rg/providers/Microsoft.Insights/components/sportzone-insights \
  --condition "count exceptions/count > 10" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action email admin@sportzone.app

# Crear alerta para latencia
az monitor metrics alert create \
  --name "High Latency" \
  --resource-group sportzone-rg \
  --scopes /subscriptions/xxx/resourceGroups/sportzone-rg/providers/Microsoft.Web/sites/sportzone-api \
  --condition "avg requests/duration > 2000" \
  --window-size 5m \
  --evaluation-frequency 1m
```

### 6.3 CDN Configuration

**Paso 1: Crear Azure CDN**

```bash
# Crear CDN Profile
az cdn profile create \
  --name sportzone-cdn \
  --resource-group sportzone-rg \
  --sku Standard_Microsoft

# Crear CDN Endpoint
az cdn endpoint create \
  --name sportzone-assets \
  --profile-name sportzone-cdn \
  --resource-group sportzone-rg \
  --origin sportzone.app \
  --origin-host-header sportzone.app \
  --enable-compression true
```

**Paso 2: Configurar Cache Rules**

```bash
# Configurar cache para assets estáticos
az cdn endpoint rule add \
  --name sportzone-assets \
  --profile-name sportzone-cdn \
  --resource-group sportzone-rg \
  --order 1 \
  --rule-name "CacheStaticAssets" \
  --match-variable UrlPath \
  --operator BeginsWith \
  --match-values "/assets/" \
  --action-name CacheExpiration \
  --cache-behavior Override \
  --cache-duration "365.00:00:00"
```

---

## 7. Monitoreo Post-Deployment

### 7.1 Health Checks

**Backend Health Endpoint**:

```csharp
// HealthController.cs
[ApiController]
[Route("[controller]")]
public class HealthController : ControllerBase
{
    private readonly Supabase.Client _supabase;
    private readonly IHubContext<PartidoHub> _hubContext;

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var health = new
        {
            status = "healthy",
            timestamp = DateTime.UtcNow,
            version = "1.0.0",
            checks = new
            {
                database = await CheckDatabaseAsync(),
                signalr = CheckSignalR(),
                memory = CheckMemory()
            }
        };

        return Ok(health);
    }

    private async Task<string> CheckDatabaseAsync()
    {
        try
        {
            await _supabase.From<Equipo>().Select("id").Limit(1).Get();
            return "healthy";
        }
        catch
        {
            return "unhealthy";
        }
    }

    private string CheckSignalR()
    {
        return _hubContext != null ? "healthy" : "unhealthy";
    }

    private string CheckMemory()
    {
        var memoryUsed = GC.GetTotalMemory(false) / 1024 / 1024;
        return memoryUsed < 500 ? "healthy" : "warning";
    }
}
```

**Smoke Tests**:

```bash
#!/bin/bash
# smoke-tests.sh

echo "Running smoke tests..."

# Test backend health
echo "Testing backend health..."
curl -f https://api.sportzone.app/health || exit 1

# Test frontend
echo "Testing frontend..."
curl -f https://sportzone.app || exit 1

# Test API endpoints
echo "Testing API endpoints..."
curl -f https://api.sportzone.app/api/liga/torneos || exit 1

# Test SignalR Hub
echo "Testing SignalR Hub..."
curl -f https://api.sportzone.app/hubs/partidos || exit 1

echo "All smoke tests passed!"
```

### 7.2 Métricas Clave

**Backend Metrics**:
- Request rate (requests/second)
- Response time (p50, p95, p99)
- Error rate (%)
- CPU usage (%)
- Memory usage (MB)
- Database connections (active)

**Frontend Metrics**:
- Page load time (seconds)
- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)

**Business Metrics**:
- Eventos registrados por minuto
- Usuarios activos concurrentes
- Partidos en vivo simultáneos
- Notificaciones enviadas por minuto

### 7.3 Dashboard de Monitoreo

**Kusto Query para Application Insights**:

```kusto
// Request rate por minuto
requests
| where timestamp > ago(1h)
| summarize count() by bin(timestamp, 1m)
| render timechart

// Response time percentiles
requests
| where timestamp > ago(1h)
| summarize 
    p50 = percentile(duration, 50),
    p95 = percentile(duration, 95),
    p99 = percentile(duration, 99)
  by bin(timestamp, 5m)
| render timechart

// Error rate
requests
| where timestamp > ago(1h)
| summarize 
    total = count(),
    errors = countif(success == false)
  by bin(timestamp, 5m)
| extend errorRate = (errors * 100.0) / total
| render timechart

// Top endpoints por latencia
requests
| where timestamp > ago(1h)
| summarize avgDuration = avg(duration) by name
| top 10 by avgDuration desc
```

---

## 8. Procedimientos de Rollback

### 8.1 Rollback de Base de Datos

**Escenario: Migración fallida**

```bash
# 1. Detener aplicaciones
az webapp stop --name sportzone-api --resource-group sportzone-rg

# 2. Restaurar backup
pg_restore -h db.[PROJECT-REF].supabase.co \
           -U postgres \
           -d postgres \
           -c \
           backup_pre_migration.dump

# 3. Verificar restauración
psql -c "SELECT COUNT(*) FROM equipos;"
psql -c "SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1;"

# 4. Reiniciar aplicaciones
az webapp start --name sportzone-api --resource-group sportzone-rg
```

### 8.2 Rollback de Backend

**Escenario: Deployment con bugs críticos**

```bash
# Opción 1: Rollback a imagen anterior
az webapp config container set \
  --name sportzone-api \
  --resource-group sportzone-rg \
  --docker-custom-image-name sportzoneacr.azurecr.io/sportzone-api:[PREVIOUS-SHA]

# Opción 2: Swap slots
az webapp deployment slot swap \
  --name sportzone-api \
  --resource-group sportzone-rg \
  --slot staging \
  --target-slot production

# Verificar rollback
curl https://api.sportzone.app/health
```

### 8.3 Rollback de Frontend

**Escenario: Build con errores en producción**

```bash
# Listar deployments
vercel ls

# Rollback a deployment anterior
vercel rollback [PREVIOUS-DEPLOYMENT-URL]

# Verificar rollback
curl -I https://sportzone.app
```

### 8.4 Rollback Completo

**Procedimiento de rollback completo del sistema**:

```bash
#!/bin/bash
# rollback-complete.sh

echo "Starting complete system rollback..."

# 1. Rollback frontend
echo "Rolling back frontend..."
vercel rollback [PREVIOUS-DEPLOYMENT-URL]

# 2. Rollback backend
echo "Rolling back backend..."
az webapp config container set \
  --name sportzone-api \
  --resource-group sportzone-rg \
  --docker-custom-image-name sportzoneacr.azurecr.io/sportzone-api:[PREVIOUS-SHA]

# 3. Rollback database (si es necesario)
echo "Rolling back database..."
# pg_restore ...

# 4. Verificar servicios
echo "Verifying services..."
sleep 30
curl -f https://sportzone.app || exit 1
curl -f https://api.sportzone.app/health || exit 1

echo "Rollback completed successfully!"
```

---

## 9. Checklist de Deployment

### 9.1 Pre-Deployment

- [ ] Backup de base de datos creado
- [ ] Tests unitarios pasando (backend y frontend)
- [ ] Tests de integración pasando
- [ ] Variables de entorno configuradas
- [ ] Credenciales de Firebase actualizadas
- [ ] Certificados SSL válidos
- [ ] Documentación actualizada
- [ ] Changelog actualizado
- [ ] Equipo notificado del deployment

### 9.2 Durante Deployment

- [ ] Base de datos migrada exitosamente
- [ ] Backend desplegado sin errores
- [ ] Frontend desplegado sin errores
- [ ] Health checks pasando
- [ ] Smoke tests pasando
- [ ] SignalR Hub funcionando
- [ ] Notificaciones push funcionando
- [ ] CDN configurado correctamente

### 9.3 Post-Deployment

- [ ] Monitoreo activo en Application Insights
- [ ] Alertas configuradas
- [ ] Logs siendo capturados
- [ ] Performance metrics normales
- [ ] Error rate < 1%
- [ ] Response time < 2s (p95)
- [ ] Usuarios pueden acceder al sistema
- [ ] Funcionalidades críticas verificadas
- [ ] Equipo notificado del deployment exitoso

---

## 10. Troubleshooting

### 10.1 Problemas Comunes

**Backend no inicia**:
```bash
# Ver logs
az webapp log tail --name sportzone-api --resource-group sportzone-rg

# Verificar variables de entorno
az webapp config appsettings list --name sportzone-api --resource-group sportzone-rg

# Verificar imagen Docker
docker pull sportzoneacr.azurecr.io/sportzone-api:latest
docker run -p 5000:80 sportzoneacr.azurecr.io/sportzone-api:latest
```

**Frontend no carga**:
```bash
# Verificar deployment en Vercel
vercel ls

# Ver logs de build
vercel logs [DEPLOYMENT-URL]

# Verificar DNS
nslookup sportzone.app

# Verificar certificado SSL
openssl s_client -connect sportzone.app:443 -servername sportzone.app
```

**Base de datos no conecta**:
```bash
# Verificar conectividad
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Verificar firewall
az postgres server firewall-rule list --resource-group sportzone-rg --server-name sportzone-db

# Verificar connection string
echo $DATABASE_URL
```

**SignalR no funciona**:
```bash
# Verificar WebSocket support
curl -i -N -H "Connection: Upgrade" \
     -H "Upgrade: websocket" \
     -H "Sec-WebSocket-Version: 13" \
     -H "Sec-WebSocket-Key: SGVsbG8sIHdvcmxkIQ==" \
     https://api.sportzone.app/hubs/partidos

# Verificar CORS
curl -H "Origin: https://sportzone.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://api.sportzone.app/hubs/partidos
```

### 10.2 Contactos de Emergencia

| Rol | Nombre | Email | Teléfono |
|-----|--------|-------|----------|
| DevOps Lead | [Nombre] | devops@sportzone.app | +1-xxx-xxx-xxxx |
| Backend Lead | [Nombre] | backend@sportzone.app | +1-xxx-xxx-xxxx |
| Frontend Lead | [Nombre] | frontend@sportzone.app | +1-xxx-xxx-xxxx |
| DBA | [Nombre] | dba@sportzone.app | +1-xxx-xxx-xxxx |

---

## 11. Conclusión

Este documento proporciona procedimientos completos para el deployment de SportZone Pro. Asegúrate de:

✅ Seguir el checklist de deployment  
✅ Crear backups antes de cada deployment  
✅ Ejecutar smoke tests después del deployment  
✅ Monitorear métricas post-deployment  
✅ Tener plan de rollback listo  
✅ Documentar cualquier issue encontrado  

Para soporte adicional, contactar al equipo de DevOps en devops@sportzone.app
