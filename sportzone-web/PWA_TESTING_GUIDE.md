# Guía de Testing PWA - SportZone Planillero

## Introducción

Esta guía proporciona instrucciones completas para probar la instalación y funcionalidad de la Progressive Web App (PWA) de SportZone Planillero en dispositivos tablet. La aplicación está optimizada para uso en tablets con orientación horizontal durante partidos en vivo.

---

## 1. Requisitos Previos

### 1.1 Requisitos del Servidor
- ✅ **HTTPS obligatorio**: La PWA solo se puede instalar desde conexiones seguras (HTTPS)
- ✅ **Manifest.json configurado**: `/public/manifest.json` debe estar accesible
- ✅ **Service Worker registrado**: `/public/sw.js` debe estar activo
- ✅ **Iconos disponibles**: Iconos de 192x192 y 512x512 en `/public/assets/icons/`

### 1.2 Navegadores Soportados

| Plataforma | Navegador | Versión Mínima | Soporte PWA |
|------------|-----------|----------------|-------------|
| Android | Chrome | 72+ | ✅ Completo |
| Android | Edge | 79+ | ✅ Completo |
| Android | Firefox | 85+ | ⚠️ Limitado |
| iOS/iPadOS | Safari | 11.3+ | ✅ Completo |
| Windows | Chrome | 72+ | ✅ Completo |
| Windows | Edge | 79+ | ✅ Completo |

### 1.3 Dispositivos Recomendados
- **Tablets Android**: 10" o superior (Samsung Galaxy Tab, Lenovo Tab)
- **iPads**: iPad (9.7"), iPad Air, iPad Pro
- **Resolución mínima**: 1024x768 px
- **Orientación**: Landscape (horizontal) preferida

---

## 2. Validación Pre-Instalación

### 2.1 Verificar Configuración del Manifest

**Acceder a:** `https://[tu-dominio]/manifest.json`

**Verificar que contenga:**
```json
{
  "name": "SportZone Planillero",
  "short_name": "Planillero",
  "description": "App para registro de eventos de partidos en vivo",
  "start_url": "/planillero",
  "display": "standalone",
  "orientation": "landscape",
  "background_color": "#06090F",
  "theme_color": "#00D4FF",
  "icons": [
    {
      "src": "/assets/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/assets/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### 2.2 Verificar Service Worker

**Chrome DevTools:**
1. Abrir `https://[tu-dominio]/planillero`
2. Presionar `F12` para abrir DevTools
3. Ir a pestaña **Application**
4. En el menú lateral, seleccionar **Service Workers**
5. Verificar que aparezca `sw.js` con estado **activated and running**

**Safari (iOS/iPadOS):**
1. Abrir Safari en Mac conectado al iPad
2. Habilitar **Develop menu** en Safari > Preferences > Advanced
3. Conectar iPad vía USB
4. En menú Develop, seleccionar el iPad
5. Inspeccionar la página `/planillero`
6. Verificar en Console que no haya errores de Service Worker

### 2.3 Verificar Iconos

**Acceder a:**
- `https://[tu-dominio]/assets/icons/icon-192.png`
- `https://[tu-dominio]/assets/icons/icon-512.png`

**Verificar:**
- ✅ Ambos iconos cargan correctamente
- ✅ Iconos tienen fondo sólido (no transparente para maskable)
- ✅ Logo centrado y visible

### 2.4 Lighthouse PWA Audit (Opcional pero Recomendado)

**Chrome DevTools:**
1. Abrir `https://[tu-dominio]/planillero`
2. Presionar `F12` para abrir DevTools
3. Ir a pestaña **Lighthouse**
4. Seleccionar categoría **Progressive Web App**
5. Click en **Generate report**

**Puntaje esperado:** 90+ / 100

**Verificar que pase:**
- ✅ Registers a service worker
- ✅ Responds with a 200 when offline
- ✅ Has a `<meta name="viewport">` tag
- ✅ Contains a manifest
- ✅ Manifest has icons
- ✅ Manifest has a name
- ✅ Manifest has a short_name
- ✅ Manifest has a start_url
- ✅ Manifest has a display mode

---

## 3. Instrucciones de Instalación por Plataforma

### 3.1 Android (Chrome)

#### Paso 1: Acceder a la Aplicación
1. Abrir **Chrome** en la tablet Android
2. Navegar a `https://[tu-dominio]/planillero`
3. Esperar a que la página cargue completamente

#### Paso 2: Instalar la PWA
**Método A - Banner de Instalación Automático:**
1. Esperar a que aparezca el banner "Agregar SportZone Planillero a la pantalla de inicio"
2. Tocar **"Agregar"** o **"Instalar"**
3. Confirmar en el diálogo de instalación

**Método B - Menú Manual:**
1. Tocar el ícono de **menú** (⋮) en la esquina superior derecha
2. Seleccionar **"Agregar a pantalla de inicio"** o **"Instalar app"**
3. Confirmar el nombre de la app
4. Tocar **"Agregar"**

#### Paso 3: Verificar Instalación
1. Ir a la pantalla de inicio del dispositivo
2. Buscar el ícono **"Planillero"** o **"SportZone Planillero"**
3. Tocar el ícono para abrir la app

#### Comportamiento Esperado:
- ✅ La app abre en **modo standalone** (sin barra de navegación del navegador)
- ✅ La orientación se fuerza a **landscape** (horizontal)
- ✅ El tema de color **#00D4FF** (azul cian) aparece en la barra de estado
- ✅ El fondo es **#06090F** (negro profundo)
- ✅ La app aparece en el **App Drawer** y **Recientes**

### 3.2 iOS / iPadOS (Safari)

#### Paso 1: Acceder a la Aplicación
1. Abrir **Safari** en el iPad
2. Navegar a `https://[tu-dominio]/planillero`
3. Esperar a que la página cargue completamente

#### Paso 2: Instalar la PWA
1. Tocar el botón **Compartir** (ícono de cuadrado con flecha hacia arriba) en la barra superior
2. Desplazarse hacia abajo en el menú
3. Seleccionar **"Agregar a pantalla de inicio"** (Add to Home Screen)
4. Editar el nombre si es necesario (por defecto: "Planillero")
5. Tocar **"Agregar"** en la esquina superior derecha

#### Paso 3: Verificar Instalación
1. Ir a la pantalla de inicio del iPad
2. Buscar el ícono **"Planillero"**
3. Tocar el ícono para abrir la app

#### Comportamiento Esperado:
- ✅ La app abre en **modo standalone** (sin barra de Safari)
- ✅ La orientación se fuerza a **landscape** (horizontal)
- ✅ La barra de estado usa el color del tema **#00D4FF**
- ✅ No aparece la barra de navegación de Safari
- ✅ La app permanece en orientación horizontal incluso si se rota el dispositivo

#### Notas Específicas de iOS:
- ⚠️ iOS no muestra banner automático de instalación
- ⚠️ La instalación SOLO funciona desde Safari (no Chrome, Firefox, etc.)
- ⚠️ El Service Worker tiene limitaciones en iOS (caché limitado)

### 3.3 Windows (Chrome/Edge)

#### Paso 1: Acceder a la Aplicación
1. Abrir **Chrome** o **Edge** en Windows
2. Navegar a `https://[tu-dominio]/planillero`
3. Esperar a que la página cargue completamente

#### Paso 2: Instalar la PWA
**Chrome:**
1. Click en el ícono **"Instalar"** (⊕) en la barra de direcciones
2. O ir a menú (⋮) > **"Instalar SportZone Planillero"**
3. Confirmar en el diálogo de instalación

**Edge:**
1. Click en el ícono **"Instalar"** (⊕) en la barra de direcciones
2. O ir a menú (⋯) > **"Aplicaciones"** > **"Instalar este sitio como una aplicación"**
3. Confirmar en el diálogo de instalación

#### Paso 3: Verificar Instalación
1. La app se abre automáticamente en una ventana independiente
2. Buscar el acceso directo en el **Menú Inicio** o **Escritorio**
3. La app aparece en **Configuración > Aplicaciones**

#### Comportamiento Esperado:
- ✅ La app abre en ventana independiente (sin barra de navegador)
- ✅ Aparece en la barra de tareas como app independiente
- ✅ Se puede anclar a la barra de tareas
- ✅ Aparece en el menú de inicio

---

## 4. Checklist de Validación Post-Instalación

### 4.1 Validación Visual

| Elemento | Esperado | ✅/❌ |
|----------|----------|-------|
| **Orientación** | Landscape (horizontal) forzada | |
| **Barra de navegador** | NO visible (modo standalone) | |
| **Tema de color** | Azul cian (#00D4FF) en barra de estado | |
| **Fondo** | Negro profundo (#06090F) | |
| **Ícono en pantalla de inicio** | Visible y correcto | |
| **Nombre de la app** | "Planillero" o "SportZone Planillero" | |

### 4.2 Validación Funcional

| Funcionalidad | Esperado | ✅/❌ |
|---------------|----------|-------|
| **Carga inicial** | Carga en menos de 3 segundos | |
| **Marcador superior** | Visible con equipos y goles | |
| **Cronómetro** | Tamaño 80px, color amarillo | |
| **Botones de eventos** | Tamaño mínimo 80x80px | |
| **Selector de equipo** | Funciona correctamente | |
| **Registro de gol** | Confirmación visual inmediata | |
| **Registro de tarjeta** | Confirmación visual inmediata | |
| **Timeline de eventos** | Muestra eventos en orden cronológico | |
| **Botón finalizar** | Muestra doble confirmación | |

### 4.3 Validación de Conectividad

| Escenario | Esperado | ✅/❌ |
|-----------|----------|-------|
| **Conexión estable** | Funciona sin problemas | |
| **Conexión lenta (3G)** | Carga con indicador de loading | |
| **Pérdida temporal de conexión** | Muestra mensaje de error | |
| **Reconexión** | Recupera estado automáticamente | |

### 4.4 Validación de Rendimiento

| Métrica | Objetivo | Resultado | ✅/❌ |
|---------|----------|-----------|-------|
| **First Contentful Paint** | < 2s | | |
| **Time to Interactive** | < 3s | | |
| **Registro de evento** | < 500ms | | |
| **Actualización de marcador** | < 200ms | | |
| **Uso de memoria** | < 200MB | | |

---

## 5. Pruebas de Usabilidad en Tablet

### 5.1 Prueba de Botones Grandes

**Objetivo:** Verificar que los botones son suficientemente grandes para uso con guantes o dedos grandes.

**Procedimiento:**
1. Intentar tocar botones de eventos (GOL, TARJETA, etc.) con el dedo pulgar
2. Intentar tocar botones con guantes deportivos (si disponible)
3. Verificar que no se toquen botones adyacentes por error

**Criterios de éxito:**
- ✅ Botones de mínimo 80x80px
- ✅ Espaciado de mínimo 16px entre botones
- ✅ Feedback visual inmediato al tocar
- ✅ No se activan botones adyacentes

### 5.2 Prueba de Visibilidad en Exteriores

**Objetivo:** Verificar que la interfaz es legible bajo luz solar directa.

**Procedimiento:**
1. Llevar la tablet al exterior en día soleado
2. Ajustar brillo al máximo
3. Intentar leer el marcador y cronómetro
4. Intentar identificar botones de eventos

**Criterios de éxito:**
- ✅ Marcador legible con brillo máximo
- ✅ Cronómetro legible con brillo máximo
- ✅ Botones identificables por color
- ✅ Contraste suficiente (negro sobre colores brillantes)

### 5.3 Prueba de Orientación

**Objetivo:** Verificar que la app mantiene orientación landscape.

**Procedimiento:**
1. Abrir la app en orientación landscape
2. Rotar la tablet a orientación portrait
3. Rotar de vuelta a landscape
4. Verificar que la interfaz no se rompe

**Criterios de éxito:**
- ✅ La app permanece en landscape incluso al rotar
- ✅ No hay glitches visuales al rotar
- ✅ El contenido no se corta o desborda

### 5.4 Prueba de Batería

**Objetivo:** Verificar el consumo de batería durante un partido completo.

**Procedimiento:**
1. Cargar la tablet al 100%
2. Abrir la app y simular un partido de 90 minutos
3. Registrar eventos cada 5-10 minutos
4. Medir el porcentaje de batería al finalizar

**Criterios de éxito:**
- ✅ Consumo menor al 30% en 90 minutos
- ✅ La app no causa sobrecalentamiento
- ✅ El brillo de pantalla no afecta excesivamente

---

## 6. Troubleshooting - Problemas Comunes

### 6.1 No Aparece Opción de Instalación

**Síntomas:**
- No aparece banner de instalación
- No aparece opción "Agregar a pantalla de inicio" en el menú

**Causas posibles:**
1. ❌ El sitio no está servido por HTTPS
2. ❌ El manifest.json no está accesible o tiene errores
3. ❌ El Service Worker no está registrado correctamente
4. ❌ Faltan iconos requeridos
5. ❌ El navegador no soporta PWA

**Soluciones:**
1. ✅ Verificar que la URL comienza con `https://`
2. ✅ Abrir DevTools > Application > Manifest y verificar errores
3. ✅ Abrir DevTools > Application > Service Workers y verificar estado
4. ✅ Verificar que existen `/assets/icons/icon-192.png` y `icon-512.png`
5. ✅ Usar Chrome o Safari (no Firefox en iOS)

### 6.2 La App No Abre en Modo Standalone

**Síntomas:**
- La app abre en el navegador normal
- Se ve la barra de navegación del navegador

**Causas posibles:**
1. ❌ El manifest.json tiene `"display": "browser"` en lugar de `"standalone"`
2. ❌ La app no se instaló correctamente

**Soluciones:**
1. ✅ Verificar que `manifest.json` tiene `"display": "standalone"`
2. ✅ Desinstalar la app y volver a instalar
3. ✅ Limpiar caché del navegador antes de reinstalar

### 6.3 La Orientación No Se Fuerza a Landscape

**Síntomas:**
- La app rota a portrait al girar el dispositivo

**Causas posibles:**
1. ❌ El manifest.json no tiene `"orientation": "landscape"`
2. ❌ El navegador no respeta la orientación del manifest (iOS Safari)

**Soluciones:**
1. ✅ Verificar que `manifest.json` tiene `"orientation": "landscape"`
2. ✅ En iOS, agregar meta tag: `<meta name="apple-mobile-web-app-capable" content="yes">`
3. ✅ Usar CSS: `@media (orientation: portrait) { /* Mostrar mensaje de rotar */ }`

### 6.4 Los Iconos No Aparecen Correctamente

**Síntomas:**
- El ícono en la pantalla de inicio es genérico o está en blanco

**Causas posibles:**
1. ❌ Los iconos no están en la ruta correcta
2. ❌ Los iconos no tienen el tamaño correcto
3. ❌ Los iconos tienen formato incorrecto

**Soluciones:**
1. ✅ Verificar que los iconos están en `/public/assets/icons/`
2. ✅ Verificar que hay iconos de 192x192 y 512x512
3. ✅ Usar formato PNG (no SVG para iconos de instalación)
4. ✅ Asegurar que los iconos tienen fondo sólido para `"purpose": "maskable"`

### 6.5 El Service Worker No Se Actualiza

**Síntomas:**
- Los cambios en la app no se reflejan después de actualizar
- La app muestra contenido antiguo

**Causas posibles:**
1. ❌ El Service Worker está cacheando agresivamente
2. ❌ El navegador no detecta cambios en `sw.js`

**Soluciones:**
1. ✅ Incrementar `CACHE_NAME` en `sw.js` (ej: `v1` → `v2`)
2. ✅ En DevTools > Application > Service Workers, click en **"Unregister"**
3. ✅ Limpiar caché: DevTools > Application > Storage > **"Clear site data"**
4. ✅ Forzar actualización: Mantener presionado el botón de recargar y seleccionar **"Empty Cache and Hard Reload"**

### 6.6 La App No Funciona Offline

**Síntomas:**
- La app muestra error al perder conexión
- No se pueden ver datos cacheados

**Causas posibles:**
1. ❌ El Service Worker no está cacheando correctamente
2. ❌ Las rutas en `urlsToCache` no coinciden con las rutas reales

**Soluciones:**
1. ✅ Verificar que `sw.js` tiene las rutas correctas en `urlsToCache`
2. ✅ Agregar estrategia de caché para API: Cache-First o Network-First
3. ✅ Verificar en DevTools > Application > Cache Storage que los recursos están cacheados

---

## 7. Checklist Final de Validación

### 7.1 Antes de Entregar a Producción

- [ ] La PWA se instala correctamente en Android (Chrome)
- [ ] La PWA se instala correctamente en iOS/iPadOS (Safari)
- [ ] La PWA abre en modo standalone (sin barra de navegador)
- [ ] La orientación se fuerza a landscape
- [ ] Los iconos aparecen correctamente en la pantalla de inicio
- [ ] El tema de color se aplica correctamente
- [ ] El Service Worker está registrado y activo
- [ ] El manifest.json es válido (sin errores en DevTools)
- [ ] Los botones son suficientemente grandes (80x80px mínimo)
- [ ] El cronómetro es legible (80px, amarillo)
- [ ] El marcador es visible y actualiza en tiempo real
- [ ] Los eventos se registran con confirmación visual
- [ ] La finalización de partido requiere doble confirmación
- [ ] La app funciona con conexión lenta (3G)
- [ ] La app muestra mensaje de error al perder conexión
- [ ] El consumo de batería es aceptable (< 30% en 90 min)
- [ ] La app es legible bajo luz solar directa
- [ ] Lighthouse PWA audit puntúa 90+ / 100

### 7.2 Documentación de Resultados

**Completar después de las pruebas:**

| Dispositivo | OS | Navegador | Instalación | Funcionalidad | Usabilidad | Notas |
|-------------|----|-----------|-----------:|-------------:|-----------:|-------|
| iPad Air | iPadOS 17 | Safari | ✅/❌ | ✅/❌ | ✅/❌ | |
| Samsung Galaxy Tab | Android 13 | Chrome | ✅/❌ | ✅/❌ | ✅/❌ | |
| Lenovo Tab | Android 12 | Chrome | ✅/❌ | ✅/❌ | ✅/❌ | |
| Surface Pro | Windows 11 | Edge | ✅/❌ | ✅/❌ | ✅/❌ | |

---

## 8. Recursos Adicionales

### 8.1 Herramientas de Testing

- **Chrome DevTools**: Auditoría PWA con Lighthouse
- **PWA Builder**: https://www.pwabuilder.com/ (validación de manifest)
- **Manifest Generator**: https://app-manifest.firebaseapp.com/
- **Icon Generator**: https://realfavicongenerator.net/

### 8.2 Documentación Oficial

- **MDN - Progressive Web Apps**: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
- **Google - PWA Checklist**: https://web.dev/pwa-checklist/
- **Apple - Configuring Web Applications**: https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html

### 8.3 Contacto de Soporte

Para reportar problemas o solicitar asistencia:
- **Email**: soporte@sportzone.com
- **Slack**: #sportzone-pwa-support
- **Documentación técnica**: `/docs/FRONTEND_SETUP.md`

---

## Conclusión

Esta guía proporciona un marco completo para probar la instalación y funcionalidad de la PWA de SportZone Planillero en tablets. Asegúrese de completar todas las validaciones antes de desplegar a producción y documentar cualquier problema encontrado para su resolución.

**Última actualización:** 2025-01-XX
**Versión:** 1.0
