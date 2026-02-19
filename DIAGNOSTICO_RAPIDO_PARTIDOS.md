# 🔍 Diagnóstico Rápido - Error al Cargar Partidos

## ✅ ACTUALIZACIÓN: CORS Configurado

El backend ahora permite todos los subdominios de Vercel. Render está redesplegando automáticamente.

## Problema Actual
El token JWT de Supabase no contiene el claim `role: "admin"` que el backend requiere para autorizar las peticiones.

## 📖 Guía Completa
Ver: **VERIFICAR_TOKEN_ADMIN.md** para instrucciones detalladas paso a paso.

---

## ✅ Verificación Rápida (2 minutos)

### Paso 1: Abre DevTools
Presiona `F12` en tu navegador

### Paso 2: Ve a la pestaña Console

### Paso 3: Ejecuta este código

```javascript
// Obtener el token actual
const getToken = async () => {
  const { data: { session } } = await window.supabase.auth.getSession();
  if (!session) {
    console.log('❌ NO HAY SESIÓN ACTIVA');
    return;
  }
  
  const token = session.access_token;
  console.log('✅ Token encontrado:', token.substring(0, 50) + '...');
  
  // Decodificar el token
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('📦 Payload completo:', payload);
  console.log('👤 Role:', payload.role || '❌ NO TIENE ROLE');
  console.log('📧 Email:', payload.email);
  console.log('🆔 User ID:', payload.sub);
  
  // Verificar si es admin
  if (payload.role === 'admin') {
    console.log('✅ USUARIO ES ADMIN');
  } else {
    console.log('❌ USUARIO NO ES ADMIN (role:', payload.role, ')');
  }
  
  return payload;
};

// Ejecutar
getToken();
```

---

## 🎯 Resultados Esperados

### ✅ Si funciona correctamente:
```
✅ Token encontrado: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
📦 Payload completo: { sub: "...", email: "admin@sportzone.com", role: "admin", ... }
👤 Role: admin
📧 Email: admin@sportzone.com
✅ USUARIO ES ADMIN
```

### ❌ Si hay problema:
```
✅ Token encontrado: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
📦 Payload completo: { sub: "...", email: "admin@sportzone.com", ... }
👤 Role: ❌ NO TIENE ROLE
📧 Email: admin@sportzone.com
❌ USUARIO NO ES ADMIN (role: undefined)
```

---

## 🔧 Solución si NO tiene role

El problema es que Supabase no está incluyendo el claim `role` en el JWT. Necesitas configurar esto en Supabase.

### Opción 1: Configurar Custom Claims en Supabase

1. Ve a Supabase Dashboard: https://supabase.com/dashboard
2. Abre tu proyecto
3. Ve a **SQL Editor**
4. Ejecuta este SQL:

```sql
-- Crear función para agregar custom claims al JWT
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  user_role text;
BEGIN
  -- Obtener el rol del usuario desde la tabla usuarios
  SELECT rol INTO user_role
  FROM public.usuarios
  WHERE id = (event->>'user_id')::uuid;
  
  -- Agregar el rol al token
  event := jsonb_set(event, '{claims,role}', to_jsonb(user_role));
  
  RETURN event;
END;
$$;

-- Configurar el hook en Supabase Auth
-- NOTA: Esto requiere configuración adicional en el dashboard de Supabase
```

5. Ve a **Authentication** → **Hooks**
6. Configura el hook `custom_access_token_hook`

### Opción 2: Usar app_metadata (Más Simple)

1. Ve a Supabase Dashboard
2. Ve a **Authentication** → **Users**
3. Busca tu usuario admin
4. Click en el usuario
5. En la sección **User Metadata**, agrega:

```json
{
  "role": "admin"
}
```

6. Guarda los cambios
7. **Cierra sesión y vuelve a iniciar sesión** en la app

---

## 🧪 Probar el Endpoint Manualmente

Una vez que tengas el role configurado, prueba el endpoint directamente:

```javascript
const testEndpoint = async () => {
  const { data: { session } } = await window.supabase.auth.getSession();
  const token = session.access_token;
  
  const response = await fetch('https://sportzone-api-mslj.onrender.com/api/partidos?page=1&pageSize=20', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Response:', data);
  
  if (response.status === 200) {
    console.log('✅ ENDPOINT FUNCIONA');
  } else if (response.status === 401) {
    console.log('❌ NO AUTORIZADO - Token inválido o expirado');
  } else if (response.status === 403) {
    console.log('❌ PROHIBIDO - No tienes permisos de admin');
  }
};

testEndpoint();
```

---

## 📝 Notas Importantes

1. **El token se genera al hacer login**: Si cambias el role en Supabase, debes cerrar sesión y volver a iniciar sesión para que el nuevo token incluya el role.

2. **El backend requiere el claim "role"**: El código en `Program.cs` tiene esta configuración:
   ```csharp
   options.AddPolicy("AdminOnly", policy => policy.RequireClaim("role", "admin"));
   ```

3. **Supabase por defecto NO incluye custom claims**: Necesitas configurar hooks o usar user_metadata.

---

## 🚀 Próximos Pasos

1. Ejecuta el diagnóstico en la consola del navegador
2. Si NO tiene role, configura el user_metadata en Supabase
3. Cierra sesión y vuelve a iniciar sesión
4. Vuelve a ejecutar el diagnóstico para verificar
5. Prueba el endpoint manualmente
6. Recarga la página de administración de partidos

---

**Última actualización:** 2026-02-19  
**Estado:** Diagnóstico activo
