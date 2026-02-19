# Crear Cuenta de Administrador - SportZone Pro

## Opción 1: Desde Supabase Dashboard (Recomendado)

### Paso 1: Acceder a Supabase
1. Ve a https://supabase.com/dashboard
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto SportZone Pro

### Paso 2: Crear Usuario
1. En el menú lateral, ve a **Authentication** → **Users**
2. Haz clic en **Add user** → **Create new user**
3. Completa los datos:
   - **Email**: admin@sportzone.com (o el email que prefieras)
   - **Password**: Crea una contraseña segura
   - **Auto Confirm User**: ✅ Activado (para que no necesite confirmar email)
4. Haz clic en **Create user**

### Paso 3: Asignar Rol de Admin
1. Copia el **User ID** (UUID) del usuario recién creado
2. Ve a **SQL Editor** en el menú lateral
3. Ejecuta este SQL:

```sql
-- Asignar rol de admin al usuario
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE id = 'PEGA-AQUI-EL-USER-ID';

-- Verificar que se asignó correctamente
SELECT id, email, raw_user_meta_data->>'role' as role
FROM auth.users
WHERE id = 'PEGA-AQUI-EL-USER-ID';
```

### Paso 4: Verificar
1. Abre la aplicación en http://localhost:4200 o https://sportzone-web.vercel.app
2. Inicia sesión con el email y contraseña creados
3. Deberías tener acceso a todas las funciones de administrador

## Opción 2: Desde SQL Editor (Avanzado)

Si prefieres crear todo desde SQL:

```sql
-- 1. Crear usuario en auth.users (Supabase lo hace automáticamente al registrarse)
-- Nota: No puedes insertar directamente en auth.users por seguridad
-- Debes usar el dashboard o la API de Supabase

-- 2. Después de crear el usuario en el dashboard, asignar rol:
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@sportzone.com';

-- 3. Verificar
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  created_at
FROM auth.users
WHERE email = 'admin@sportzone.com';
```

## Opción 3: Registro Normal + Actualización Manual

### Paso 1: Registrarse en la App
1. Abre la aplicación
2. Ve a la página de registro
3. Crea una cuenta normal

### Paso 2: Actualizar a Admin
1. Ve a Supabase Dashboard → SQL Editor
2. Ejecuta:

```sql
-- Buscar tu usuario por email
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'tu-email@ejemplo.com';

-- Asignar rol de admin
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'tu-email@ejemplo.com';
```

## Roles Disponibles

SportZone Pro tiene los siguientes roles:

- **admin**: Acceso completo al sistema
- **planillero**: Puede gestionar partidos y registrar eventos
- **arbitro**: Puede ver partidos asignados
- **marketing**: Puede gestionar campañas y notificaciones
- **publico**: Usuario normal (por defecto)

## Crear Otros Tipos de Usuarios

### Planillero
```sql
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"planillero"'
)
WHERE email = 'planillero@sportzone.com';
```

### Marketing
```sql
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"marketing"'
)
WHERE email = 'marketing@sportzone.com';
```

## Verificar Roles

Para ver todos los usuarios y sus roles:

```sql
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;
```

## Troubleshooting

### El usuario no tiene permisos de admin
- Verifica que el rol se haya asignado correctamente en `raw_user_meta_data`
- Cierra sesión y vuelve a iniciar sesión
- Limpia la caché del navegador

### No puedo acceder a ciertas funciones
- Verifica que el backend esté configurado correctamente con las políticas de autorización
- Revisa los guards en el frontend (`admin.guard.ts`)
- Verifica que el JWT incluya el claim `role`

### Error al crear usuario
- Asegúrate de que el email no esté ya registrado
- Verifica que la contraseña cumpla con los requisitos mínimos
- Revisa los logs en Supabase Dashboard → Logs

## Cuentas de Prueba Recomendadas

Para desarrollo, crea estas cuentas:

1. **Admin**: admin@sportzone.com
2. **Planillero**: planillero@sportzone.com
3. **Marketing**: marketing@sportzone.com
4. **Usuario Normal**: usuario@sportzone.com

Todas con contraseña: `SportZone2024!` (o la que prefieras)

## Seguridad

⚠️ **IMPORTANTE**:
- Nunca uses contraseñas débiles en producción
- Cambia las contraseñas de prueba antes de ir a producción
- Habilita 2FA para cuentas de administrador en producción
- Revisa regularmente los logs de acceso

## Acceso Rápido

**Supabase Dashboard**: https://supabase.com/dashboard
**Proyecto**: https://husilgpjmqqsccmvbbka.supabase.co
**App Local**: http://localhost:4200
**App Producción**: https://sportzone-web.vercel.app
