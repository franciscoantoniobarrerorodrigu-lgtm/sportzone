# Sistema de Notificaciones Push - SportZone Pro

## Descripción

El Notification Service gestiona el envío de notificaciones push a dispositivos móviles usando Firebase Cloud Messaging (FCM). Envía notificaciones automáticas para eventos importantes de partidos en tiempo real.

## Características

- ✅ Notificaciones automáticas de goles
- ✅ Notificaciones de tarjetas (amarillas y rojas)
- ✅ Notificaciones de inicio de partido
- ✅ Notificaciones de fin de partido
- ✅ Gestión de tokens FCM por usuario
- ✅ Eliminación automática de tokens inválidos
- ✅ Suscripciones por partido
- ✅ Retry con backoff exponencial (manejado por Firebase SDK)

## Configuración de Firebase

### 1. Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita Cloud Messaging en el proyecto

### 2. Obtener Credenciales

1. Ve a Project Settings → Service Accounts
2. Click en "Generate new private key"
3. Descarga el archivo JSON con las credenciales

### 3. Configurar en el Backend

Opción A: Variable de entorno (Recomendado para producción)

```bash
export FIREBASE_CREDENTIALS='{"type":"service_account","project_id":"...","private_key":"..."}'
```

Opción B: appsettings.json (Solo para desarrollo)

```json
{
  "Firebase": {
    "Credentials": "{\"type\":\"service_account\",\"project_id\":\"...\",\"private_key\":\"...\"}"
  }
}
```

**IMPORTANTE**: Nunca subas las credenciales de Firebase a un repositorio público.

## Endpoints API

### POST /api/notificaciones/registrar-token

Registra un token FCM para recibir notificaciones push.

**Autorización**: Requiere autenticación

**Request Body**:

```json
{
  "token": "fcm-token-del-dispositivo",
  "plataforma": "android"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Token FCM registrado exitosamente"
}
```

### DELETE /api/notificaciones/eliminar-token

Elimina un token FCM (cuando el usuario cierra sesión o desinstala la app).

**Autorización**: Requiere autenticación

**Request Body**:

```json
{
  "token": "fcm-token-del-dispositivo"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Token FCM eliminado exitosamente"
}
```

### POST /api/notificaciones/test

Envía una notificación de prueba (solo para testing).

**Autorización**: Requiere rol `admin`

**Request Body**:

```json
{
  "partidoId": "123e4567-e89b-12d3-a456-426614174000"
}
```

## Tipos de Notificaciones

### 1. Notificación de Gol

**Trigger**: Cuando se registra un evento de tipo "gol"

**Título**: `⚽ ¡GOL de {equipoNombre}!`

**Cuerpo**: `{jugadorNombre} - Minuto {minuto}'`

**Datos adicionales**:
```json
{
  "tipo": "gol",
  "partidoId": "...",
  "equipo": "Equipo A",
  "jugador": "Juan Pérez",
  "minuto": "45"
}
```

### 2. Notificación de Tarjeta Amarilla

**Trigger**: Cuando se registra un evento de tipo "tarjeta_amarilla"

**Título**: `🟨 Tarjeta Amarilla`

**Cuerpo**: `{jugadorNombre} ({equipoNombre}) - Minuto {minuto}'`

### 3. Notificación de Tarjeta Roja

**Trigger**: Cuando se registra un evento de tipo "tarjeta_roja"

**Título**: `🟥 Tarjeta Roja`

**Cuerpo**: `{jugadorNombre} ({equipoNombre}) - Minuto {minuto}'`

### 4. Notificación de Inicio de Partido

**Trigger**: Cuando el planillero inicia un partido

**Título**: `🏁 ¡Partido iniciado!`

**Cuerpo**: `{equipoLocal} vs {equipoVisita}`

### 5. Notificación de Fin de Partido

**Trigger**: Cuando el planillero finaliza un partido

**Título**: `⏱️ ¡Partido finalizado!`

**Cuerpo**: `{equipoLocal} {golesLocal} - {golesVisita} {equipoVisita}`

## Integración con el Frontend

### Configuración en Angular (Web)

```typescript
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Solicitar permiso y obtener token
async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  
  if (permission === 'granted') {
    const token = await getToken(messaging, {
      vapidKey: 'tu-vapid-key'
    });
    
    // Enviar token al backend
    await fetch('/api/notificaciones/registrar-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify({
        token: token,
        plataforma: 'web'
      })
    });
  }
}

// Escuchar mensajes en primer plano
onMessage(messaging, (payload) => {
  console.log('Notificación recibida:', payload);
  // Mostrar notificación personalizada
});
```

### Configuración en Android (Kotlin)

```kotlin
import com.google.firebase.messaging.FirebaseMessaging

// Obtener token FCM
FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
    if (task.isSuccessful) {
        val token = task.result
        
        // Enviar token al backend
        apiService.registrarToken(RegistrarTokenRequest(token, "android"))
    }
}

// Manejar notificaciones
class MyFirebaseMessagingService : FirebaseMessagingService() {
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        // Procesar notificación
        val tipo = remoteMessage.data["tipo"]
        val partidoId = remoteMessage.data["partidoId"]
        
        // Mostrar notificación
        showNotification(remoteMessage.notification?.title, 
                        remoteMessage.notification?.body)
    }
}
```

### Configuración en iOS (Swift)

```swift
import FirebaseMessaging

// Obtener token FCM
Messaging.messaging().token { token, error in
    if let token = token {
        // Enviar token al backend
        apiService.registrarToken(token: token, plataforma: "ios")
    }
}

// Manejar notificaciones
func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
    // Token actualizado
}
```

## Suscripciones a Partidos

Los usuarios pueden suscribirse a partidos específicos para recibir notificaciones:

```sql
INSERT INTO suscripciones_notificaciones (usuario_id, partido_id, activa)
VALUES ('user-id', 'partido-id', true);
```

El sistema solo envía notificaciones a usuarios suscritos al partido.

## Gestión de Tokens Inválidos

El servicio elimina automáticamente tokens FCM inválidos cuando:

- El token ha expirado
- El usuario desinstaló la app
- El token fue revocado

Esto se hace automáticamente después de cada envío de notificaciones.

## Canales de Notificación (Android)

Para Android, se recomienda crear un canal de notificaciones:

```kotlin
val channelId = "partidos_en_vivo"
val channelName = "Partidos en Vivo"
val importance = NotificationManager.IMPORTANCE_HIGH

val channel = NotificationChannel(channelId, channelName, importance).apply {
    description = "Notificaciones de eventos en partidos en vivo"
    enableLights(true)
    lightColor = Color.GREEN
    enableVibration(true)
}

val notificationManager = getSystemService(NotificationManager::class.java)
notificationManager.createNotificationChannel(channel)
```

## Consideraciones de Rendimiento

- **Batch Sending**: Firebase SDK maneja automáticamente el envío en lotes
- **Rate Limiting**: Firebase tiene límites de 1000 mensajes/segundo por proyecto
- **Payload Size**: Máximo 4KB por mensaje
- **TTL**: Los mensajes tienen un tiempo de vida de 4 semanas por defecto

## Monitoreo y Logs

El servicio registra logs para:

- ✅ Notificaciones enviadas exitosamente
- ❌ Notificaciones fallidas
- 🗑️ Tokens inválidos eliminados
- ⚠️ Errores de configuración

Ejemplo de logs:

```
[INFO] Notificación de gol enviada: 150 exitosas, 5 fallidas
[INFO] Token FCM inválido eliminado: abc123...
[ERROR] Error al enviar notificación de gol: Firebase not configured
```

## Troubleshooting

### Error: "Firebase not configured"

**Causa**: Las credenciales de Firebase no están configuradas.

**Solución**: Configurar la variable `Firebase:Credentials` en appsettings.json o como variable de entorno.

### Error: "No hay usuarios suscritos al partido"

**Causa**: Ningún usuario se ha suscrito al partido.

**Solución**: Los usuarios deben suscribirse explícitamente a los partidos que quieren seguir.

### Notificaciones no llegan a dispositivos

**Causas posibles**:
1. Token FCM inválido o expirado
2. Permisos de notificaciones no otorgados
3. App en segundo plano sin service worker (Web)
4. Firewall bloqueando conexiones a Firebase

**Solución**: Verificar logs del backend y del dispositivo.

## Próximas Mejoras

- [ ] Notificaciones programadas (recordatorios de partidos)
- [ ] Notificaciones personalizadas por equipo favorito
- [ ] Notificaciones de cambios en tabla de posiciones
- [ ] Notificaciones de suspensiones de jugadores
- [ ] Dashboard de estadísticas de notificaciones
- [ ] A/B testing de mensajes
- [ ] Notificaciones ricas con imágenes

## Referencias

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [FCM HTTP v1 API](https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages)
- [Firebase Admin SDK for .NET](https://firebase.google.com/docs/admin/setup)
