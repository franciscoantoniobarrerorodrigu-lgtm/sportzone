# Problema de Conexión a Supabase PostgreSQL

## Diagnóstico

Hemos identificado un problema de conectividad entre el backend .NET y la base de datos Supabase PostgreSQL:

### Síntomas
- Error 500 al llamar a `/api/liga/torneos`
- Errores de DNS: "El nombre solicitado es válido pero no se encontraron datos del tipo solicitado"
- Timeout al intentar conectar con IPv6

### Causa Raíz
Supabase usa **IPv6 por defecto** para conexiones directas a PostgreSQL. El sistema Windows actual:
1. No puede resolver correctamente el host `db.husilgpjmqqsccmvbbka.supabase.co` cuando Npgsql intenta conectarse
2. No tiene IPv6 funcional o está bloqueado por firewall
3. Los poolers de Supabase requieren configuración de región específica que no tenemos

## Soluciones Intentadas

1. ✗ Conexión directa puerto 5432 - Error DNS
2. ✗ Transaction Pooler puerto 6543 - Error DNS  
3. ✗ Session Pooler con región - Error "Tenant or user not found"
4. ✗ IPv6 directa - Timeout

## Soluciones Recomendadas

### Opción 1: Usar Supabase REST API (RECOMENDADO)
En lugar de conectar directamente a PostgreSQL, usar la REST API de Supabase que funciona sobre HTTPS:

**Ventajas:**
- No requiere IPv6
- Maneja autenticación automáticamente
- Incluye RLS (Row Level Security)
- Más fácil de configurar

**Implementación:**
```csharp
// Usar el paquete Supabase-csharp
var options = new SupabaseOptions
{
    AutoConnectRealtime = true
};

var supabase = new Supabase.Client(supabaseUrl, supabaseKey, options);

// Consultar datos
var response = await supabase
    .From<Torneo>()
    .Where(x => x.Activo == true)
    .Get();
```

### Opción 2: Habilitar IPv6 en Windows
Si necesitas usar Npgsql directamente:

1. Verificar si IPv6 está habilitado:
   ```cmd
   ipconfig /all
   ```

2. Habilitar IPv6 en adaptador de red:
   - Panel de Control → Redes → Propiedades del adaptador
   - Marcar "Protocolo de Internet versión 6 (TCP/IPv6)"

3. Verificar firewall no bloquea IPv6

### Opción 3: Obtener Connection String del Dashboard
El dashboard de Supabase proporciona el connection string correcto con la región:

1. Ir a https://supabase.com/dashboard/project/husilgpjmqqsccmvbbka
2. Click en "Connect"
3. Seleccionar "Connection Pooling" → "Session Mode"
4. Copiar el connection string completo

## Próximos Pasos

Recomiendo usar la **Opción 1** (Supabase REST API) porque:
- Es la forma oficial y recomendada por Supabase
- Funciona en cualquier entorno (IPv4/IPv6)
- Incluye características adicionales (RLS, Auth, Realtime)
- Más fácil de mantener

¿Quieres que implemente la solución usando Supabase REST API?


## Solución Implementada ✅

Se implementó exitosamente la **Opción 1: Supabase REST API**.

### Cambios Realizados

1. **Paquetes Instalados:**
   - `supabase-csharp` v0.16.2
   - Incluye automáticamente: `postgrest-csharp`, `gotrue-csharp`, `realtime-csharp`, `storage-csharp`

2. **Modelos Actualizados:**
   - Todos los modelos de entidades ahora heredan de `Postgrest.Models.BaseModel`
   - Agregados atributos `[Table]`, `[PrimaryKey]`, `[Column]` de Postgrest
   - Nuevos modelos: `Torneo`, `Temporada`, `Posicion`

3. **LigaService Refactorizado:**
   - Eliminado Npgsql y connection strings
   - Implementado usando `Supabase.Client`
   - Consultas usando LINQ sobre Postgrest
   - Manejo automático de relaciones entre tablas

4. **Program.cs Actualizado:**
   - Configurado `Supabase.Client` como servicio Scoped
   - Usa `ServiceRoleKey` para acceso completo desde backend
   - Inicialización automática del cliente

### Resultados

✅ **Todos los endpoints funcionando correctamente:**
- `GET /api/liga/torneos` - Retorna torneos activos con nombre de temporada
- `GET /api/liga/posiciones/{torneoId}` - Retorna tabla de posiciones ordenada
- `GET /api/liga/{torneoId}/jornada/{numero}` - Retorna partidos de una jornada

✅ **Sin problemas de IPv6/DNS**
✅ **Funciona sobre HTTPS (IPv4)**
✅ **Código más limpio y mantenible**
✅ **Mejor rendimiento (sin overhead de conexiones directas)**

### Próximos Pasos

1. Implementar servicios restantes:
   - `PartidosService` - Gestión de partidos en vivo
   - `GoleadoresService` - Tabla de goleadores
   - `FixtureGeneratorService` - Generación automática de fixture
   - `SuspensionManagerService` - Gestión de suspensiones
   - `NotificationService` - Notificaciones push con Firebase

2. Implementar SignalR Hub completo para actualizaciones en tiempo real

3. Agregar autenticación JWT con Supabase Auth

4. Implementar RLS (Row Level Security) para seguridad a nivel de base de datos
