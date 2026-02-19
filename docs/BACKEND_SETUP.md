# Guía de Configuración del Backend .NET 8

Esta guía te ayudará a configurar y ejecutar el backend API de SportZone Pro.

## Requisitos Previos

1. ✅ Fase 1 completada (Base de datos Supabase configurada)
2. ✅ .NET 8 SDK instalado
3. ✅ Visual Studio 2022, VS Code o Rider

## Verificar instalación de .NET 8

Abre una terminal y ejecuta:

```bash
dotnet --version
```

Deberías ver algo como: `8.0.x`

Si no tienes .NET 8, descárgalo desde: https://dotnet.microsoft.com/download/dotnet/8.0

## Paso 1: Obtener Credenciales de Supabase

1. **Accede a tu proyecto en Supabase**
   - Ve a https://app.supabase.com
   - Selecciona tu proyecto "sportzone-pro"

2. **Ve a Settings → API**

3. **Copia las siguientes credenciales:**

   📋 **Project URL:**
   ```
   https://tu-proyecto.supabase.co
   ```

   📋 **anon public (Anon Key):**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   📋 **service_role (Service Role Key):**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Ve a Settings → API → JWT Settings**

   📋 **JWT Secret:**
   ```
   tu-jwt-secret-super-secreto
   ```

## Paso 2: Configurar el Proyecto

1. **Abre el archivo `SportZone.API/appsettings.Development.json`**

2. **Reemplaza las credenciales:**

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "Supabase": {
    "Url": "PEGA_AQUI_TU_PROJECT_URL",
    "AnonKey": "PEGA_AQUI_TU_ANON_KEY",
    "ServiceRoleKey": "PEGA_AQUI_TU_SERVICE_ROLE_KEY",
    "JwtSecret": "PEGA_AQUI_TU_JWT_SECRET"
  }
}
```

3. **Guarda el archivo**

## Paso 3: Restaurar Paquetes NuGet

Abre una terminal en la carpeta `SportZone.API` y ejecuta:

```bash
cd SportZone.API
dotnet restore
```

Deberías ver algo como:
```
Determining projects to restore...
Restored SportZone.API.csproj (in X ms).
```

## Paso 4: Compilar el Proyecto

```bash
dotnet build
```

Deberías ver:
```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

## Paso 5: Ejecutar el Proyecto

```bash
dotnet run
```

Deberías ver:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:5001
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

## Paso 6: Probar la API

### Opción A: Swagger UI (Recomendado)

1. Abre tu navegador
2. Ve a: `https://localhost:5001/swagger`
3. Verás la documentación interactiva de la API
4. Prueba los endpoints haciendo clic en "Try it out"

### Opción B: cURL

```bash
# Probar endpoint público
curl https://localhost:5001/api/liga/torneos

# Deberías ver:
# {"message":"Endpoint en desarrollo"}
```

### Opción C: Postman

1. Importa la colección desde Swagger
2. Configura el base URL: `https://localhost:5001`
3. Prueba los endpoints

## Paso 7: Probar Autenticación

### 1. Obtener un token JWT de Supabase

Puedes usar el SQL Editor de Supabase para generar un token de prueba:

```sql
-- Generar token para el usuario admin
SELECT 
  email,
  raw_user_meta_data->>'role' as role,
  id
FROM auth.users
WHERE email = 'admin@sportzone.com';
```

### 2. Usar el token en Swagger

1. Haz clic en el botón "Authorize" en Swagger
2. Ingresa: `Bearer {tu-token-aqui}`
3. Haz clic en "Authorize"
4. Ahora puedes probar endpoints protegidos

## Estructura de Archivos Creados

```
SportZone.API/
├── Program.cs                    ✅ Configuración principal
├── appsettings.json              ✅ Configuración base
├── appsettings.Development.json  ✅ Configuración de desarrollo
├── SportZone.API.csproj          ✅ Archivo de proyecto
├── .gitignore                    ✅ Archivos ignorados por Git
├── README.md                     ✅ Documentación del proyecto
├── Controllers/
│   ├── LigaController.cs         ✅ Endpoints de liga
│   ├── PartidosController.cs     ✅ Endpoints de partidos
│   └── GoleadoresController.cs   ✅ Endpoints de goleadores
├── Hubs/
│   └── PartidoHub.cs             ✅ SignalR Hub
└── Models/
    ├── Entities/
    │   ├── Partido.cs            ✅ Modelo de partido
    │   ├── Equipo.cs             ✅ Modelo de equipo
    │   └── EventoPartido.cs      ✅ Modelo de evento
    └── DTOs/
        └── CreateEventoDto.cs    ✅ DTO para crear eventos
```

## Endpoints Disponibles

### 🔓 Públicos (sin autenticación)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/liga/posiciones/{torneoId}` | Tabla de posiciones |
| GET | `/api/liga/torneos` | Torneos activos |
| GET | `/api/liga/{torneoId}/jornada/{numero}` | Resultados de jornada |
| GET | `/api/partidos/proximos` | Próximos partidos |
| GET | `/api/partidos/{id}` | Detalle de partido |
| GET | `/api/partidos/en-vivo` | Partidos en vivo |
| GET | `/api/goleadores/{torneoId}` | Ranking de goleadores |
| GET | `/api/goleadores/{torneoId}/asistencias` | Ranking de asistidores |
| GET | `/api/goleadores/{torneoId}/tarjetas` | Ranking de tarjetas |

### 🔒 Protegidos (requieren autenticación)

| Método | Endpoint | Rol | Descripción |
|--------|----------|-----|-------------|
| PATCH | `/api/partidos/{id}/iniciar` | planillero/admin | Iniciar partido |
| POST | `/api/partidos/{id}/eventos` | planillero/admin | Registrar evento |
| PATCH | `/api/partidos/{id}/finalizar` | planillero/admin | Finalizar partido |

## SignalR Hub

**Endpoint WebSocket:** `wss://localhost:5001/hubs/partido`

**Métodos disponibles:**
- `SuscribirPartido(partidoId)` - Suscribirse a actualizaciones de un partido
- `DesuscribirPartido(partidoId)` - Desuscribirse de un partido

**Eventos que recibirás:**
- `NuevoEvento` - Cuando ocurre un gol, tarjeta, etc.
- `MinutoActualizado` - Cada vez que cambia el minuto
- `MarcadorActualizado` - Cuando cambia el marcador

## Troubleshooting

### Error: "Unable to find package Supabase"

**Solución:**
```bash
dotnet nuget add source https://api.nuget.org/v3/index.json
dotnet restore
```

### Error: "The certificate chain was issued by an authority that is not trusted"

**Solución:**
```bash
dotnet dev-certs https --trust
```

### Error: "Port 5001 is already in use"

**Solución:** Cambia el puerto en `Properties/launchSettings.json` o detén el proceso que está usando el puerto.

### Error: "JWT Secret is invalid"

**Solución:** Verifica que copiaste correctamente el JWT Secret desde Supabase Settings → API → JWT Settings.

## Próximos Pasos

Una vez que el backend esté corriendo:

1. ✅ Backend básico funcionando
2. ⏳ Implementar servicios de negocio (Fase 2.3-2.9)
3. ⏳ Conectar con Supabase usando Npgsql
4. ⏳ Implementar lógica de controllers
5. ⏳ Configurar Firebase Cloud Messaging
6. ⏳ Crear frontend Angular 17 (Fase 3)

## Usuarios de Prueba

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@sportzone.com | 123456 | admin |
| planillero@sportzone.com | 123456 | planillero |
| arbitro@sportzone.com | 123456 | arbitro |

## Recursos Adicionales

- [Documentación de .NET 8](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-8)
- [SignalR Documentation](https://learn.microsoft.com/en-us/aspnet/core/signalr/introduction)
- [Supabase C# Client](https://github.com/supabase-community/supabase-csharp)
- [JWT Authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/)

## Soporte

Si encuentras problemas:
1. Revisa los logs en la consola
2. Verifica que las credenciales de Supabase sean correctas
3. Asegúrate de que la Fase 1 (base de datos) esté completada
4. Consulta el archivo `tasks.md` para ver el progreso del proyecto
