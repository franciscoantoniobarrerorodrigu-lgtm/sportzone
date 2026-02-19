# Backend Ejecutándose Localmente ✅

## Estado Actual

El backend de SportZone Pro está corriendo exitosamente en tu máquina local.

### Información del Servidor

- **URL Base**: `http://localhost:5000`
- **API Endpoints**: `http://localhost:5000/api`
- **SignalR Hub**: `http://localhost:5000/hubs/partidos`
- **Swagger UI**: `http://localhost:5000/swagger`
- **Estado**: ✅ Corriendo

## Próximos Pasos

### 1. Probar el Backend con Swagger

Abre tu navegador y ve a:
```
http://localhost:5000/swagger
```

Aquí podrás ver todos los endpoints disponibles y probarlos interactivamente.

### 2. Configurar Supabase (Si aún no lo has hecho)

El backend necesita conectarse a Supabase. Actualiza el archivo:
```
SportZone.API/appsettings.Development.json
```

Con tus credenciales reales de Supabase:
```json
{
  "Supabase": {
    "Url": "https://husilgpjmqqsccmvbbka.supabase.co",
    "AnonKey": "tu-anon-key-real",
    "ServiceRoleKey": "tu-service-role-key-real",
    "JwtSecret": "tu-jwt-secret-real"
  }
}
```

### 3. Configurar Supabase Authentication URLs

Para que el login funcione en Vercel, necesitas configurar las URLs en Supabase:

1. Ve a https://app.supabase.com
2. Selecciona tu proyecto
3. Ve a **Authentication → URL Configuration**
4. Agrega estas URLs:
   - **Site URL**: `https://sportzone-web.vercel.app`
   - **Redirect URLs**:
     - `https://sportzone-web.vercel.app/**`
     - `https://sportzone-web.vercel.app/auth/callback`
     - `http://localhost:4200/**` (para desarrollo local)

### 4. Crear Usuario Admin

Ejecuta estos comandos en el SQL Editor de Supabase:

```sql
-- Crear usuario admin
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  'admin@sportzone.com',
  crypt('Admin123!', gen_salt('bf')),
  NOW(),
  '{"role": "admin"}'::jsonb
);

-- O usa la interfaz de Supabase:
-- Authentication → Users → Add user → Create new user
-- Email: admin@sportzone.com
-- Password: Admin123!
-- Auto Confirm User: ✓
```

Luego asigna el rol:

```sql
SELECT public.update_user_role(
  (SELECT id FROM auth.users WHERE email = 'admin@sportzone.com'),
  'admin'
);
```

### 5. Ejecutar el Frontend Localmente (Opcional)

Si quieres probar todo localmente:

```bash
cd sportzone-web
npm install
npm start
```

El frontend se abrirá en `http://localhost:4200` y se conectará automáticamente al backend local.

### 6. Probar el Login en Vercel

Una vez configuradas las URLs en Supabase y creado el usuario admin:

1. Ve a https://sportzone-web.vercel.app
2. Haz clic en "INICIAR SESIÓN"
3. Ingresa:
   - Email: `admin@sportzone.com`
   - Password: `Admin123!`
4. Deberías poder iniciar sesión y ver el dashboard

## Endpoints Disponibles

### Públicos (sin autenticación)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/liga/posiciones/{torneoId}` | Tabla de posiciones |
| GET | `/api/liga/torneos` | Torneos activos |
| GET | `/api/partidos/proximos` | Próximos partidos |
| GET | `/api/partidos/{id}` | Detalle de partido |
| GET | `/api/partidos/en-vivo` | Partidos en vivo |
| GET | `/api/goleadores/{torneoId}` | Ranking de goleadores |

### Protegidos (requieren autenticación)

| Método | Endpoint | Rol | Descripción |
|--------|----------|-----|-------------|
| POST | `/api/partidos` | admin | Crear partido |
| GET | `/api/partidos` | admin | Listar partidos (paginado) |
| GET | `/api/partidos/{id}` | admin | Obtener partido |
| PUT | `/api/partidos/{id}` | admin | Actualizar partido |
| DELETE | `/api/partidos/{id}` | admin | Eliminar partido |
| PATCH | `/api/partidos/{id}/iniciar` | planillero/admin | Iniciar partido |
| POST | `/api/partidos/{id}/eventos` | planillero/admin | Registrar evento |
| PATCH | `/api/partidos/{id}/finalizar` | planillero/admin | Finalizar partido |

## Detener el Backend

Para detener el servidor backend, presiona `Ctrl+C` en la terminal donde está corriendo.

## Troubleshooting

### Error: "Port 5000 is already in use"

Otro proceso está usando el puerto 5000. Opciones:
1. Detén el otro proceso
2. Cambia el puerto en `SportZone.API/Properties/launchSettings.json`

### Error: "Unable to connect to Supabase"

Verifica que:
1. Las credenciales en `appsettings.Development.json` sean correctas
2. Tu conexión a internet esté activa
3. El proyecto de Supabase esté activo

### Error: "JWT validation failed"

Verifica que el `JwtSecret` en `appsettings.Development.json` coincida con el de Supabase (Settings → API → JWT Settings).

## Recursos

- **Documentación Backend**: `docs/BACKEND_SETUP.md`
- **Documentación Supabase**: `docs/SUPABASE_SETUP.md`
- **Crear Admin**: `docs/CREAR_ADMIN.md`
- **Deployment Vercel**: `sportzone-web/VERCEL_DEPLOYMENT.md`

## Resumen de lo que se Arregló

1. ✅ Error de compilación en `PartidosService.cs` (líneas 449 y 454)
   - Problema: Incompatibilidad de tipos al reasignar query con filtros
   - Solución: Reescribir el método sin reasignaciones, construyendo queries completas para cada caso

2. ✅ Backend compilado exitosamente
3. ✅ Backend ejecutándose en `http://localhost:5000`
4. ✅ Swagger UI disponible en `http://localhost:5000/swagger`

## Siguiente Paso Recomendado

Configura las URLs de autenticación en Supabase y crea el usuario admin para poder probar el login en Vercel.
