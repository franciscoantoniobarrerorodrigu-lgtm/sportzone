# Quick Test: Login Flow

## Paso 1: Verificar que todo está corriendo

### Backend
```bash
cd SportZone.API
dotnet run
```
Debe mostrar: `Now listening on: http://localhost:5000`

### Frontend
```bash
cd sportzone-web
npm start
```
Debe mostrar: `Angular Live Development Server is listening on localhost:4200`

## Paso 2: Crear usuario de prueba en Supabase

1. Ir a Supabase Dashboard: https://app.supabase.com
2. Seleccionar tu proyecto
3. Ir a **Authentication** > **Users**
4. Click en **Add user** > **Create new user**
5. Ingresar:
   - Email: `admin@test.com`
   - Password: `Test123!`
   - Auto Confirm User: ✅ (activar)
6. Click **Create user**

## Paso 3: Asignar rol al usuario

Ejecutar en **SQL Editor** de Supabase:

```sql
-- Asignar rol admin al usuario
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@test.com';
```

## Paso 4: Probar login

1. Abrir navegador en: `http://localhost:4200/login`
2. Ingresar:
   - Email: `admin@test.com`
   - Password: `Test123!`
3. Click **Iniciar Sesión**

### ✅ Resultado Esperado:
- Redirige a `/dashboard`
- No hay errores en consola
- Navbar muestra opciones de navegación

### ❌ Si hay error:
1. Abrir DevTools (F12)
2. Ver consola para errores
3. Verificar que:
   - Backend está corriendo
   - Variables de entorno están configuradas
   - Usuario existe en Supabase

## Paso 5: Verificar autenticación

Abrir consola del navegador (F12) y ejecutar:

```javascript
// Verificar que hay sesión
localStorage.getItem('supabase.auth.token')
// Debe retornar un objeto JSON con access_token
```

## Paso 6: Probar logout

1. Click en botón de usuario en navbar
2. Click **Cerrar Sesión**

### ✅ Resultado Esperado:
- Redirige a `/login`
- Session eliminada

## Troubleshooting

### Error: "Invalid login credentials"
**Solución**: Verificar que el usuario existe y el password es correcto

### Error: "Failed to fetch"
**Solución**: Verificar que el backend está corriendo en puerto 5000

### Error: "CORS policy"
**Solución**: Verificar configuración CORS en `Program.cs`

### Usuario no tiene rol
**Solución**: Ejecutar el SQL del Paso 3 nuevamente

