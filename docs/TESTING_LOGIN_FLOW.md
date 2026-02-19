# Test de Flujo de Login - SportZone Pro

## Objetivo
Verificar que el flujo completo de autenticación funciona correctamente desde el frontend hasta el backend.

## Pre-requisitos

### 1. Base de Datos Configurada
- ✅ Supabase proyecto creado
- ✅ Tablas creadas (scripts 01-13 ejecutados)
- ✅ Sistema de roles configurado (script 13_auth_roles.sql)
- ✅ Usuarios de prueba creados

### 2. Backend API Corriendo
```bash
cd SportZone.API
dotnet run
```
Debe estar corriendo en: `http://localhost:5000`

### 3. Frontend Corriendo
```bash
cd sportzone-web
npm start
```
Debe estar corriendo en: `http://localhost:4200`

### 4. Variables de Entorno Configuradas

**Frontend** (`sportzone-web/src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  signalRUrl: 'http://localhost:5000/hubs',
  supabase: {
    url: 'https://[TU-PROYECTO].supabase.co',
    anonKey: '[TU-ANON-KEY]'
  }
};
```

**Backend** (`SportZone.API/appsettings.json`):
```json
{
  "Supabase": {
    "Url": "https://[TU-PROYECTO].supabase.co",
    "ServiceRoleKey": "[TU-SERVICE-ROLE-KEY]",
    "JwtSecret": "[TU-JWT-SECRET]"
  }
}
```

## Usuarios de Prueba

Crear estos usuarios en Supabase para testing:

### Usuario Admin
- **Email**: `admin@sportzone.com`
- **Password**: `Admin123!`
- **Rol**: `admin`

### Usuario Planillero
- **Email**: `planillero@sportzone.com`
- **Password**: `Planillero123!`
- **Rol**: `planillero`

### Usuario Árbitro
- **Email**: `arbitro@sportzone.com`
- **Password**: `Arbitro123!`
- **Rol**: `arbitro`

## Casos de Prueba

### Test 1: Login Exitoso - Admin
**Pasos:**
1. Navegar a `http://localhost:4200/login`
2. Ingresar email: `admin@sportzone.com`
3. Ingresar password: `Admin123!`
4. Click en "Iniciar Sesión"

**Resultado Esperado:**
- ✅ No hay errores en consola
- ✅ Usuario es redirigido a `/dashboard`
- ✅ Navbar muestra el nombre del usuario
- ✅ Token JWT es almacenado en Supabase session
- ✅ `authService.isAuthenticated()` retorna `true`
- ✅ `authService.getUserRole()` retorna `'admin'`

### Test 2: Login Exitoso - Planillero
**Pasos:**
1. Navegar a `http://localhost:4200/login`
2. Ingresar email: `planillero@sportzone.com`
3. Ingresar password: `Planillero123!`
4. Click en "Iniciar Sesión"

**Resultado Esperado:**
- ✅ Usuario es redirigido a `/planillero`
- ✅ Se carga el partido asignado al planillero
- ✅ `authService.getUserRole()` retorna `'planillero'`

### Test 3: Login Fallido - Credenciales Incorrectas
**Pasos:**
1. Navegar a `http://localhost:4200/login`
2. Ingresar email: `admin@sportzone.com`
3. Ingresar password: `PasswordIncorrecto`
4. Click en "Iniciar Sesión"

**Resultado Esperado:**
- ✅ Se muestra mensaje de error: "Error al iniciar sesión. Verifica tus credenciales."
- ✅ Usuario permanece en `/login`
- ✅ `authService.isAuthenticated()` retorna `false`

### Test 4: Login Fallido - Campos Vacíos
**Pasos:**
1. Navegar a `http://localhost:4200/login`
2. Dejar campos vacíos
3. Click en "Iniciar Sesión"

**Resultado Esperado:**
- ✅ Se muestra mensaje de error: "Por favor completa todos los campos"
- ✅ No se hace llamada al backend

### Test 5: Logout
**Pasos:**
1. Iniciar sesión como admin
2. Click en botón "Cerrar Sesión" en navbar
3. Confirmar logout

**Resultado Esperado:**
- ✅ Usuario es redirigido a `/login`
- ✅ Session de Supabase es eliminada
- ✅ `authService.isAuthenticated()` retorna `false`
- ✅ `authService.currentUser()` retorna `null`

### Test 6: Protección de Rutas - Sin Autenticación
**Pasos:**
1. Sin iniciar sesión, intentar navegar a `http://localhost:4200/dashboard`

**Resultado Esperado:**
- ✅ Usuario es redirigido a `/login`
- ✅ Se muestra mensaje indicando que debe iniciar sesión

### Test 7: Protección de Rutas - Rol Incorrecto
**Pasos:**
1. Iniciar sesión como planillero
2. Intentar navegar a `/admin/solicitudes`

**Resultado Esperado:**
- ✅ Usuario es redirigido a página de acceso denegado o dashboard
- ✅ Se muestra mensaje indicando permisos insuficientes

### Test 8: Token JWT en Requests
**Pasos:**
1. Iniciar sesión como admin
2. Abrir DevTools > Network
3. Navegar a `/dashboard` (hace llamadas a API)
4. Inspeccionar headers de requests a API

**Resultado Esperado:**
- ✅ Todos los requests a `/api/*` incluyen header `Authorization: Bearer [TOKEN]`
- ✅ Token es válido y no expirado
- ✅ Backend acepta el token y retorna datos

### Test 9: Persistencia de Sesión
**Pasos:**
1. Iniciar sesión como admin
2. Cerrar el navegador completamente
3. Abrir navegador nuevamente
4. Navegar a `http://localhost:4200`

**Resultado Esperado:**
- ✅ Usuario sigue autenticado
- ✅ No es redirigido a `/login`
- ✅ `authService.currentUser()` tiene datos del usuario

### Test 10: Expiración de Token
**Pasos:**
1. Iniciar sesión como admin
2. Esperar a que el token expire (configurar tiempo corto en Supabase para testing)
3. Intentar hacer una acción que requiera API

**Resultado Esperado:**
- ✅ Backend retorna 401 Unauthorized
- ✅ Usuario es redirigido a `/login`
- ✅ Se muestra mensaje indicando que la sesión expiró

## Verificación Manual en Consola del Navegador

Después de iniciar sesión, ejecutar en consola:

```javascript
// Verificar usuario actual
console.log('Usuario:', window.localStorage.getItem('supabase.auth.token'));

// Verificar rol
// (Inspeccionar el JWT token en jwt.io)
```

## Checklist de Verificación

- [ ] Login con admin funciona y redirige a `/dashboard`
- [ ] Login con planillero funciona y redirige a `/planillero`
- [ ] Login con credenciales incorrectas muestra error
- [ ] Campos vacíos muestran validación
- [ ] Logout funciona correctamente
- [ ] Rutas protegidas redirigen a login si no autenticado
- [ ] Rutas admin están protegidas para no-admins
- [ ] Token JWT se incluye en requests a API
- [ ] Sesión persiste después de cerrar navegador
- [ ] Token expirado redirige a login

## Problemas Comunes

### Error: "Invalid login credentials"
- Verificar que el usuario existe en Supabase Auth
- Verificar que el password es correcto
- Verificar que el email está confirmado

### Error: "CORS policy"
- Verificar que el backend tiene CORS configurado correctamente
- Verificar que el frontend está usando la URL correcta del backend

### Error: "Network request failed"
- Verificar que el backend está corriendo en `http://localhost:5000`
- Verificar que no hay firewall bloqueando la conexión

### Usuario no tiene rol
- Ejecutar script `13_auth_roles.sql` para crear función de roles
- Ejecutar script `14_assign_roles.sql` para asignar roles a usuarios
- Verificar en Supabase Dashboard > Authentication > Users > User Metadata

## Resultado del Test

**Fecha**: _________________

**Tester**: _________________

**Estado**: ⬜ PASS | ⬜ FAIL

**Notas**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

