# 🔐 Verificar Token de Admin - Guía Rápida

## El Problema
El backend requiere que el token JWT incluya el claim `role: "admin"` para acceder a los endpoints de administración. Si el token no tiene este claim, recibirás errores 403 (Forbidden).

---

## ✅ Paso 1: Verificar el Token Actual

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Verificar token y role
(async () => {
  try {
    // Obtener sesión de Supabase
    const { data: { session }, error } = await window.supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Error al obtener sesión:', error);
      return;
    }
    
    if (!session) {
      console.log('❌ NO HAY SESIÓN ACTIVA - Debes iniciar sesión primero');
      return;
    }
    
    const token = session.access_token;
    console.log('✅ Token encontrado');
    
    // Decodificar el payload del JWT
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 INFORMACIÓN DEL TOKEN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Email:', payload.email);
    console.log('🆔 User ID:', payload.sub);
    console.log('🎭 Role:', payload.role || '❌ NO TIENE ROLE');
    console.log('📅 Expira:', new Date(payload.exp * 1000).toLocaleString());
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Verificar si es admin
    if (payload.role === 'admin') {
      console.log('✅ ¡PERFECTO! El usuario tiene role de ADMIN');
      console.log('El token debería funcionar correctamente');
    } else {
      console.log('❌ PROBLEMA: El usuario NO tiene role de admin');
      console.log('Role actual:', payload.role || 'undefined');
      console.log('');
      console.log('🔧 SOLUCIÓN: Sigue los pasos en la sección "Configurar Role de Admin"');
    }
    
    return payload;
  } catch (err) {
    console.error('❌ Error al verificar token:', err);
  }
})();
```

---

## 🔧 Paso 2: Configurar Role de Admin (si no lo tiene)

Si el script anterior muestra que NO tienes role de admin, sigue estos pasos:

### Opción A: Configurar en Supabase Dashboard (Recomendado)

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto: `husilgpjmqqsccmvbbka`
3. Ve a **Authentication** → **Users**
4. Busca tu usuario admin (el que usas para iniciar sesión)
5. Click en el usuario
6. En la sección **Raw User Meta Data**, agrega:

```json
{
  "role": "admin"
}
```

7. Click en **Save**
8. **IMPORTANTE**: Cierra sesión en la aplicación y vuelve a iniciar sesión

### Opción B: Actualizar con SQL

Ejecuta este SQL en Supabase SQL Editor:

```sql
-- Reemplaza 'admin@sportzone.com' con tu email de admin
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@sportzone.com';
```

Luego cierra sesión y vuelve a iniciar sesión.

---

## 🧪 Paso 3: Probar el Endpoint

Después de configurar el role y volver a iniciar sesión, ejecuta este script para probar el endpoint:

```javascript
// Probar endpoint de partidos
(async () => {
  try {
    const { data: { session } } = await window.supabase.auth.getSession();
    
    if (!session) {
      console.log('❌ No hay sesión activa');
      return;
    }
    
    const token = session.access_token;
    const apiUrl = 'https://sportzone-api-mslj.onrender.com/api/partidos?page=1&pageSize=20';
    
    console.log('🔄 Probando endpoint:', apiUrl);
    console.log('🔑 Con token de autorización');
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📡 RESPUESTA DEL SERVIDOR');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Status:', response.status, response.statusText);
    
    if (response.status === 200) {
      const data = await response.json();
      console.log('✅ ¡ÉXITO! El endpoint funciona correctamente');
      console.log('Datos recibidos:', data);
    } else if (response.status === 401) {
      console.log('❌ ERROR 401: No autorizado');
      console.log('El token es inválido o ha expirado');
      console.log('Solución: Cierra sesión y vuelve a iniciar sesión');
    } else if (response.status === 403) {
      console.log('❌ ERROR 403: Prohibido');
      console.log('El token no tiene permisos de admin');
      console.log('Solución: Configura el role de admin (ver Paso 2)');
    } else {
      const errorText = await response.text();
      console.log('❌ ERROR:', response.status);
      console.log('Respuesta:', errorText);
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (err) {
    console.error('❌ Error al probar endpoint:', err);
  }
})();
```

---

## 🎯 Resultados Esperados

### ✅ Si todo funciona:
```
Status: 200 OK
✅ ¡ÉXITO! El endpoint funciona correctamente
Datos recibidos: { success: true, data: { items: [...], totalCount: X } }
```

### ❌ Si hay error 403:
```
Status: 403 Forbidden
❌ ERROR 403: Prohibido
El token no tiene permisos de admin
```
**Solución**: Configura el role de admin en Supabase (Paso 2)

### ❌ Si hay error 401:
```
Status: 401 Unauthorized
❌ ERROR 401: No autorizado
```
**Solución**: Cierra sesión y vuelve a iniciar sesión

---

## 📋 Checklist de Verificación

- [ ] Ejecuté el script de verificación de token
- [ ] El token tiene `role: "admin"`
- [ ] Si no tenía role, lo configuré en Supabase
- [ ] Cerré sesión y volví a iniciar sesión
- [ ] Ejecuté el script de prueba del endpoint
- [ ] El endpoint responde con status 200
- [ ] La aplicación carga los partidos correctamente

---

## 🚨 Problemas Comunes

### "El token no tiene role pero ya lo configuré en Supabase"
**Solución**: Debes cerrar sesión y volver a iniciar sesión. El role se incluye en el token cuando se genera, no se actualiza automáticamente.

### "El endpoint responde 401 después de configurar el role"
**Solución**: El token puede haber expirado. Cierra sesión y vuelve a iniciar sesión.

### "El endpoint responde 403 incluso con role de admin"
**Solución**: Verifica que el role sea exactamente `"admin"` (en minúsculas) en el user_metadata.

---

**Última actualización:** 2026-02-19  
**Backend:** https://sportzone-api-mslj.onrender.com  
**Supabase Project:** husilgpjmqqsccmvbbka
