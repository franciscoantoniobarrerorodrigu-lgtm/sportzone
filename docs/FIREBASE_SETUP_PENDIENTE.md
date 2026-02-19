# Configuración de Firebase Cloud Messaging - PENDIENTE

## Estado Actual

El backend `NotificationService.cs` está completamente implementado y listo para usar Firebase Cloud Messaging, pero **las credenciales de Firebase no están configuradas** debido a restricciones de política organizacional en Google Cloud.

## Problema Encontrado

Al intentar crear una cuenta de servicio en Google Cloud Console para el proyecto Firebase "SportZone" (ID: `sportzone-dcd47`), se encontró el siguiente error:

```
La creación de claves de la cuenta de servicio está inhabilitada

Se aplicó una política de la organización que impide la creación de claves para cuentas de servicio en tu empresa.

IDs de las políticas de la organización aplicadas:
iam.disableServiceAccountKeyCreation

Número de seguimiento: c267851019590744
```

## Comportamiento Actual del Sistema

El `NotificationService` detecta automáticamente cuando Firebase no está configurado:

```csharp
if (string.IsNullOrEmpty(firebaseCredentials))
{
    _logger.LogWarning("Firebase credentials not configured. Notifications will be disabled.");
    _messaging = null!;
    return;
}
```

**Resultado:** El sistema funciona completamente sin notificaciones push. Cuando se intenta enviar una notificación, simplemente se registra un warning en los logs y continúa la ejecución normal.

## Funcionalidades Afectadas

Las siguientes funcionalidades NO funcionarán hasta que se configuren las credenciales:

- ❌ Notificaciones push de goles
- ❌ Notificaciones push de tarjetas rojas
- ❌ Notificaciones push de inicio de partido
- ❌ Notificaciones push de fin de partido
- ❌ Notificaciones push de medio tiempo

## Funcionalidades que SÍ Funcionan

Todo lo demás funciona normalmente:

- ✅ Actualizaciones en tiempo real vía SignalR
- ✅ Registro de eventos de partido
- ✅ Tabla de posiciones en tiempo real
- ✅ Ranking de goleadores
- ✅ App Planillero
- ✅ Marcador público en vivo
- ✅ Gestión de suspensiones automáticas
- ✅ Generación de fixture

## Soluciones Posibles

### Opción 1: Deshabilitar la Política Organizacional (Requiere Admin)

Un administrador con rol `roles/orgpolicy.policyAdmin` debe:

1. Ir a Google Cloud Console → IAM & Admin → Organization Policies
2. Buscar la política `iam.disableServiceAccountKeyCreation`
3. Deshabilitarla temporalmente o crear una excepción para el proyecto

### Opción 2: Usar un Proyecto Personal de Google Cloud

1. Crear una cuenta de Google personal (sin restricciones organizacionales)
2. Crear un nuevo proyecto de Firebase en esa cuenta
3. Obtener las credenciales JSON de la cuenta de servicio
4. Configurarlas en `appsettings.Development.json`

### Opción 3: Usar Workload Identity Federation (Más Complejo)

Método más seguro pero requiere configuración adicional en el entorno de hosting.

## Cómo Configurar Firebase Cuando se Obtengan las Credenciales

### Paso 1: Obtener el JSON de Credenciales

Una vez que puedas crear la clave de la cuenta de servicio:

1. Ve a Google Cloud Console
2. IAM & Admin → Service Accounts
3. Selecciona la cuenta de servicio `sportzone-fcm@sportzone-487821.iam.gserviceaccount.com`
4. Keys → Add Key → Create new key → JSON
5. Descarga el archivo JSON

### Paso 2: Configurar en el Backend

Edita `SportZone.API/appsettings.Development.json`:

```json
{
  "Logging": { ... },
  "Supabase": { ... },
  "Firebase": {
    "Credentials": "{\"type\":\"service_account\",\"project_id\":\"sportzone-dcd47\",\"private_key_id\":\"...\",\"private_key\":\"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n\",\"client_email\":\"sportzone-fcm@sportzone-487821.iam.gserviceaccount.com\",\"client_id\":\"...\",\"auth_uri\":\"https://accounts.google.com/o/oauth2/auth\",\"token_uri\":\"https://oauth2.googleapis.com/token\",\"auth_provider_x509_cert_url\":\"https://www.googleapis.com/oauth2/v1/certs\",\"client_x509_cert_url\":\"...\"}"
  }
}
```

**IMPORTANTE:** El JSON debe estar en una sola línea, con comillas escapadas (`\"`).

### Paso 3: Reiniciar el Backend

```cmd
cd SportZone.API
dotnet run
```

Deberías ver en los logs:

```
info: SportZone.API.Services.NotificationService[0]
      Firebase Cloud Messaging initialized successfully
```

### Paso 4: Crear Tablas de Notificaciones en Supabase

Ejecuta el script en Supabase SQL Editor:

```sql
-- Ver archivo: database/05_tables_notificaciones.sql
```

Esto crea las tablas:
- `suscripciones_notificaciones`
- `dispositivos_fcm`

### Paso 5: Probar las Notificaciones

1. Registra un token FCM de prueba en la tabla `dispositivos_fcm`
2. Crea una suscripción en `suscripciones_notificaciones`
3. Registra un gol en un partido
4. Verifica que se envíe la notificación

## Información del Proyecto Firebase

- **Nombre:** SportZone
- **Project ID:** `sportzone-dcd47`
- **Project Number:** `149290344620`
- **Cuenta de Servicio:** `sportzone-fcm@sportzone-487821.iam.gserviceaccount.com`

## Referencias

- [Documentación Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)

## Fecha de Documentación

Febrero 2026

## Próximos Pasos

1. Resolver el tema de las credenciales con el administrador de la organización
2. O crear un proyecto personal de Firebase para desarrollo
3. Configurar las credenciales según los pasos anteriores
4. Probar el envío de notificaciones push
5. Marcar las tareas de la Fase 5.3 como completadas
