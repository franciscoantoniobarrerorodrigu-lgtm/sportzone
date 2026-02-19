# Lista de Verificación de Testing Manual PWA - SportZone Planillero

## Introducción

Este documento proporciona listas de verificación detalladas y procedimientos paso a paso para realizar pruebas manuales exhaustivas de la Progressive Web App (PWA) de SportZone Planillero en dispositivos físicos. La aplicación está optimizada para tablets con orientación horizontal y diseñada para uso en cancha durante partidos en vivo.

**Versión del documento:** 1.0  
**Fecha de creación:** Enero 2025  
**Última actualización:** Enero 2025

---

## Tabla de Contenidos

1. [Checklist de Testing en Android](#1-checklist-de-testing-en-android)
2. [Checklist de Testing en iOS](#2-checklist-de-testing-en-ios)
3. [Matriz de Testing de Tamaños de Tablet](#3-matriz-de-testing-de-tamaños-de-tablet)
4. [Testing de Usabilidad con Guantes](#4-testing-de-usabilidad-con-guantes)
5. [Plantillas de Reporte de Problemas](#5-plantillas-de-reporte-de-problemas)
6. [Sección de Aprobación](#6-sección-de-aprobación)

---

## 1. Checklist de Testing en Android

### 1.1 Información del Dispositivo de Prueba

**Completar antes de iniciar las pruebas:**

| Campo | Valor |
|-------|-------|
| **Fabricante** | _________________ |
| **Modelo** | _________________ |
| **Versión de Android** | _________________ |
| **Tamaño de pantalla** | _________________ pulgadas |
| **Resolución** | _________________ x _________________ |
| **Navegador** | Chrome / Edge / Firefox (marcar) |
| **Versión del navegador** | _________________ |
| **Fecha de prueba** | _________________ |
| **Tester** | _________________ |

### 1.2 Pre-requisitos de Testing

**Verificar antes de comenzar:**

- [ ] El dispositivo está cargado al 100%
- [ ] El dispositivo tiene conexión WiFi estable
- [ ] El navegador está actualizado a la última versión
- [ ] Se ha limpiado el caché del navegador
- [ ] No hay versiones previas de la PWA instaladas
- [ ] La URL de testing es: `https://[dominio]/planillero`


### 1.3 Proceso de Instalación en Android

#### Paso 1: Acceso a la Aplicación

| # | Acción | Resultado Esperado | ✅/❌ | Notas |
|---|--------|-------------------|-------|-------|
| 1.1 | Abrir Chrome en la tablet | Chrome se abre correctamente | | |
| 1.2 | Navegar a `https://[dominio]/planillero` | La página carga en menos de 5 segundos | | |
| 1.3 | Verificar que la URL muestra el candado HTTPS | El candado verde está visible | | |
| 1.4 | Esperar 3-5 segundos después de la carga | Banner de instalación aparece automáticamente | | |

**Captura de pantalla:** _[Adjuntar captura del banner de instalación]_

#### Paso 2: Instalación de la PWA

| # | Acción | Resultado Esperado | ✅/❌ | Notas |
|---|--------|-------------------|-------|-------|
| 2.1 | Tocar el banner "Agregar a pantalla de inicio" | El banner responde al toque | | |
| 2.2 | Tocar el botón "Agregar" o "Instalar" | Aparece diálogo de confirmación | | |
| 2.3 | Verificar el nombre mostrado | Muestra "Planillero" o "SportZone Planillero" | | |
| 2.4 | Verificar el ícono mostrado | Muestra el logo de SportZone | | |
| 2.5 | Confirmar la instalación | La instalación se completa en menos de 3 segundos | | |
| 2.6 | Verificar mensaje de éxito | Aparece notificación de instalación exitosa | | |

**Método alternativo (si no aparece banner):**

| # | Acción | Resultado Esperado | ✅/❌ | Notas |
|---|--------|-------------------|-------|-------|
| 2.7 | Tocar menú (⋮) en esquina superior derecha | Se abre el menú de Chrome | | |
| 2.8 | Buscar opción "Agregar a pantalla de inicio" | La opción está disponible | | |
| 2.9 | Tocar "Agregar a pantalla de inicio" | Aparece diálogo de confirmación | | |
| 2.10 | Confirmar la instalación | La instalación se completa exitosamente | | |

**Captura de pantalla:** _[Adjuntar captura del diálogo de instalación]_

#### Paso 3: Verificación Post-Instalación

| # | Acción | Resultado Esperado | ✅/❌ | Notas |
|---|--------|-------------------|-------|-------|
| 3.1 | Ir a la pantalla de inicio del dispositivo | La pantalla de inicio se muestra | | |
| 3.2 | Buscar el ícono "Planillero" | El ícono está visible en la pantalla de inicio | | |
| 3.3 | Verificar que el ícono es correcto | Muestra el logo de SportZone correctamente | | |
| 3.4 | Tocar el ícono para abrir la app | La app se abre en menos de 2 segundos | | |
| 3.5 | Verificar modo standalone | NO se ve la barra de navegación de Chrome | | |
| 3.6 | Verificar orientación | La app está en modo landscape (horizontal) | | |
| 3.7 | Verificar tema de color | La barra de estado es azul cian (#00D4FF) | | |
| 3.8 | Verificar fondo | El fondo es negro profundo (#06090F) | | |

**Captura de pantalla:** _[Adjuntar captura de la app abierta en modo standalone]_

#### Paso 4: Verificación en App Drawer

| # | Acción | Resultado Esperado | ✅/❌ | Notas |
|---|--------|-------------------|-------|-------|
| 4.1 | Abrir el App Drawer (cajón de aplicaciones) | El App Drawer se abre | | |
| 4.2 | Buscar "Planillero" en la lista de apps | La app aparece en la lista | | |
| 4.3 | Verificar el ícono en el App Drawer | El ícono es correcto | | |
| 4.4 | Abrir la app desde el App Drawer | La app se abre correctamente | | |

#### Paso 5: Verificación en Aplicaciones Recientes

| # | Acción | Resultado Esperado | ✅/❌ | Notas |
|---|--------|-------------------|-------|-------|
| 5.1 | Con la app abierta, presionar botón de Recientes | Se muestra la lista de apps recientes | | |
| 5.2 | Verificar que "Planillero" aparece en la lista | La app aparece como app independiente | | |
| 5.3 | Verificar el ícono en Recientes | El ícono es correcto | | |
| 5.4 | Tocar la app en Recientes | La app se restaura correctamente | | |

**Captura de pantalla:** _[Adjuntar captura de la app en Recientes]_


### 1.4 Testing Funcional en Android

#### Interfaz y Diseño

| # | Elemento | Resultado Esperado | ✅/❌ | Notas |
|---|----------|-------------------|-------|-------|
| 1 | **Marcador superior** | Visible con nombres de equipos y goles | | |
| 2 | **Cronómetro** | Tamaño 80px, color amarillo (#FFD60A) | | |
| 3 | **Botón GOL** | Verde, mínimo 80x80px, texto legible | | |
| 4 | **Botón TARJETA AMARILLA** | Amarillo, mínimo 80x80px, texto legible | | |
| 5 | **Botón TARJETA ROJA** | Rojo, mínimo 80x80px, texto legible | | |
| 6 | **Botón SUSTITUCIÓN** | Azul, mínimo 80x80px, texto legible | | |
| 7 | **Selector de equipo** | Funciona correctamente, cambio visual claro | | |
| 8 | **Lista de jugadores** | Visible, botones grandes, nombres legibles | | |
| 9 | **Timeline de eventos** | Muestra eventos en orden cronológico | | |
| 10 | **Botón FINALIZAR** | Rojo, grande, claramente visible | | |

#### Funcionalidad de Eventos

| # | Acción | Resultado Esperado | ✅/❌ | Notas |
|---|--------|-------------------|-------|-------|
| 1 | Tocar botón GOL | Muestra confirmación visual inmediata | | |
| 2 | Registrar un gol | El marcador se actualiza correctamente | | |
| 3 | Tocar botón TARJETA AMARILLA | Muestra confirmación visual inmediata | | |
| 4 | Registrar tarjeta amarilla | Aparece en el timeline de eventos | | |
| 5 | Tocar botón TARJETA ROJA | Muestra confirmación visual inmediata | | |
| 6 | Registrar tarjeta roja | Aparece en el timeline de eventos | | |
| 7 | Cambiar de equipo | El selector cambia correctamente | | |
| 8 | Seleccionar jugador | El jugador se selecciona visualmente | | |
| 9 | Registrar múltiples eventos | Todos aparecen en el timeline | | |
| 10 | Scroll en timeline | El scroll funciona suavemente | | |

#### Cronómetro

| # | Acción | Resultado Esperado | ✅/❌ | Notas |
|---|--------|-------------------|-------|-------|
| 1 | Iniciar cronómetro | Comienza a contar desde 00:00 | | |
| 2 | Verificar incremento | Se incrementa cada minuto | | |
| 3 | Pausar cronómetro | Se detiene correctamente | | |
| 4 | Reanudar cronómetro | Continúa desde donde se pausó | | |
| 5 | Marcar medio tiempo | Se resetea a 00:00 para segundo tiempo | | |
| 6 | Verificar sincronización | Se sincroniza con backend cada 30 seg | | |

#### Finalización de Partido

| # | Acción | Resultado Esperado | ✅/❌ | Notas |
|---|--------|-------------------|-------|-------|
| 1 | Tocar botón FINALIZAR | Aparece primer modal de confirmación | | |
| 2 | Confirmar primera vez | Aparece segundo modal con marcador final | | |
| 3 | Verificar marcador en modal | El marcador mostrado es correcto | | |
| 4 | Confirmar segunda vez | Se envía la finalización al backend | | |
| 5 | Verificar respuesta | Aparece pantalla de resumen final | | |
| 6 | Cancelar en primer modal | El partido NO se finaliza | | |
| 7 | Cancelar en segundo modal | El partido NO se finaliza | | |

### 1.5 Testing de Rendimiento en Android

| # | Métrica | Objetivo | Resultado | ✅/❌ | Notas |
|---|---------|----------|-----------|-------|-------|
| 1 | Tiempo de carga inicial | < 3 segundos | _______ seg | | |
| 2 | Tiempo de respuesta al tocar botón | < 500 ms | _______ ms | | |
| 3 | Actualización de marcador | < 200 ms | _______ ms | | |
| 4 | Scroll en timeline | 60 FPS | _______ FPS | | |
| 5 | Uso de memoria (DevTools) | < 200 MB | _______ MB | | |
| 6 | Consumo de batería (90 min) | < 30% | _______ % | | |

**Herramienta para medir:** Chrome DevTools > Performance

### 1.6 Testing de Conectividad en Android

| # | Escenario | Acción | Resultado Esperado | ✅/❌ | Notas |
|---|-----------|--------|-------------------|-------|-------|
| 1 | **Conexión WiFi estable** | Usar la app normalmente | Funciona sin problemas | | |
| 2 | **Conexión 4G/LTE** | Cambiar a datos móviles | Funciona correctamente | | |
| 3 | **Conexión 3G lenta** | Simular conexión lenta | Muestra indicador de loading | | |
| 4 | **Pérdida de conexión** | Desactivar WiFi y datos | Muestra mensaje de error | | |
| 5 | **Reconexión** | Reactivar conexión | Recupera estado automáticamente | | |
| 6 | **Registro offline** | Registrar evento sin conexión | Muestra error o encola evento | | |

**Herramienta para simular:** Chrome DevTools > Network > Throttling

### 1.7 Testing de Versiones de Android

**Repetir las pruebas en las siguientes versiones:**

| Versión Android | Dispositivo | Instalación | Funcionalidad | Rendimiento | Tester | Fecha |
|-----------------|-------------|:-----------:|:-------------:|:-----------:|--------|-------|
| **Android 10** | ____________ | ✅/❌ | ✅/❌ | ✅/❌ | _______ | _____ |
| **Android 11** | ____________ | ✅/❌ | ✅/❌ | ✅/❌ | _______ | _____ |
| **Android 12** | ____________ | ✅/❌ | ✅/❌ | ✅/❌ | _______ | _____ |
| **Android 13** | ____________ | ✅/❌ | ✅/❌ | ✅/❌ | _______ | _____ |
| **Android 14** | ____________ | ✅/❌ | ✅/❌ | ✅/❌ | _______ | _____ |

### 1.8 Testing de Navegadores en Android

**Repetir las pruebas en los siguientes navegadores:**

| Navegador | Versión | Instalación | Funcionalidad | Notas |
|-----------|---------|:-----------:|:-------------:|-------|
| **Chrome** | _______ | ✅/❌ | ✅/❌ | |
| **Edge** | _______ | ✅/❌ | ✅/❌ | |
| **Firefox** | _______ | ✅/❌ | ✅/❌ | Soporte PWA limitado |

### 1.9 Testing de Fabricantes en Android

**Repetir las pruebas en dispositivos de diferentes fabricantes:**

| Fabricante | Modelo | Android | Instalación | Funcionalidad | Notas |
|------------|--------|---------|:-----------:|:-------------:|-------|
| **Samsung** | Galaxy Tab _____ | _______ | ✅/❌ | ✅/❌ | |
| **Lenovo** | Tab _____ | _______ | ✅/❌ | ✅/❌ | |
| **Huawei** | MatePad _____ | _______ | ✅/❌ | ✅/❌ | |
| **Xiaomi** | Pad _____ | _______ | ✅/❌ | ✅/❌ | |
| **Motorola** | Moto Tab _____ | _______ | ✅/❌ | ✅/❌ | |

---


## 2. Checklist de Testing en iOS

### 2.1 Información del Dispositivo de Prueba

**Completar antes de iniciar las pruebas:**

| Campo | Valor |
|-------|-------|
| **Modelo de iPad** | _________________ |
| **Versión de iOS/iPadOS** | _________________ |
| **Tamaño de pantalla** | _________________ pulgadas |
| **Resolución** | _________________ x _________________ |
| **Versión de Safari** | _________________ |
| **Fecha de prueba** | _________________ |
| **Tester** | _________________ |

### 2.2 Pre-requisitos de Testing

**Verificar antes de comenzar:**

- [ ] El dispositivo está cargado al 100%
- [ ] El dispositivo tiene conexión WiFi estable
- [ ] Safari está actualizado a la última versión
- [ ] Se ha limpiado el caché de Safari
- [ ] No hay versiones previas de la PWA instaladas
- [ ] La URL de testing es: `https://[dominio]/planillero`

**⚠️ IMPORTANTE:** En iOS, la instalación de PWA SOLO funciona desde Safari. Chrome, Firefox y otros navegadores NO soportan instalación de PWA en iOS.

### 2.3 Proceso de Instalación en iOS

#### Paso 1: Acceso a la Aplicación

| # | Acción | Resultado Esperado | ✅/❌ | Notas |
|---|--------|-------------------|-------|-------|
| 1.1 | Abrir Safari en el iPad | Safari se abre correctamente | | |
| 1.2 | Navegar a `https://[dominio]/planillero` | La página carga en menos de 5 segundos | | |
| 1.3 | Verificar que la URL muestra el candado HTTPS | El candado está visible | | |
| 1.4 | Esperar a que la página cargue completamente | La página está completamente cargada | | |

**Captura de pantalla:** _[Adjuntar captura de la página en Safari]_

**⚠️ NOTA:** iOS NO muestra banner automático de instalación. La instalación debe hacerse manualmente.

#### Paso 2: Instalación de la PWA

| # | Acción | Resultado Esperado | ✅/❌ | Notas |
|---|--------|-------------------|-------|-------|
| 2.1 | Tocar el botón "Compartir" (□↑) en la barra superior | Se abre el menú de compartir | | |
| 2.2 | Desplazarse hacia abajo en el menú | Las opciones son visibles | | |
| 2.3 | Buscar "Agregar a pantalla de inicio" | La opción está disponible | | |
| 2.4 | Tocar "Agregar a pantalla de inicio" | Aparece pantalla de configuración | | |
| 2.5 | Verificar el nombre mostrado | Muestra "Planillero" o "SportZone Planillero" | | |
| 2.6 | Verificar el ícono mostrado | Muestra el logo de SportZone | | |
| 2.7 | Editar el nombre si es necesario | El nombre se puede editar | | |
| 2.8 | Tocar "Agregar" en la esquina superior derecha | La instalación se completa | | |

**Captura de pantalla:** _[Adjuntar captura del menú de compartir]_

**Captura de pantalla:** _[Adjuntar captura de la pantalla de configuración]_

#### Paso 3: Verificación Post-Instalación

| # | Acción | Resultado Esperado | ✅/❌ | Notas |
|---|--------|-------------------|-------|-------|
| 3.1 | Ir a la pantalla de inicio del iPad | La pantalla de inicio se muestra | | |
| 3.2 | Buscar el ícono "Planillero" | El ícono está visible en la pantalla de inicio | | |
| 3.3 | Verificar que el ícono es correcto | Muestra el logo de SportZone correctamente | | |
| 3.4 | Tocar el ícono para abrir la app | La app se abre en menos de 2 segundos | | |
| 3.5 | Verificar modo standalone | NO se ve la barra de Safari | | |
| 3.6 | Verificar orientación | La app está en modo landscape (horizontal) | | |
| 3.7 | Verificar tema de color | La barra de estado usa el color del tema | | |
| 3.8 | Verificar fondo | El fondo es negro profundo (#06090F) | | |

**Captura de pantalla:** _[Adjuntar captura de la app abierta en modo standalone]_

#### Paso 4: Verificación de Comportamiento de Orientación

| # | Acción | Resultado Esperado | ✅/❌ | Notas |
|---|--------|-------------------|-------|-------|
| 4.1 | Con la app abierta en landscape, rotar a portrait | La app permanece en landscape | | |
| 4.2 | Rotar de vuelta a landscape | La app se mantiene estable | | |
| 4.3 | Verificar que no hay glitches visuales | La interfaz no se rompe | | |
| 4.4 | Verificar que el contenido no se corta | Todo el contenido es visible | | |

### 2.4 Testing Funcional en iOS

#### Interfaz y Diseño

| # | Elemento | Resultado Esperado | ✅/❌ | Notas |
|---|----------|-------------------|-------|-------|
| 1 | **Marcador superior** | Visible con nombres de equipos y goles | | |
| 2 | **Cronómetro** | Tamaño 80px, color amarillo (#FFD60A) | | |
| 3 | **Botón GOL** | Verde, mínimo 80x80px, texto legible | | |
| 4 | **Botón TARJETA AMARILLA** | Amarillo, mínimo 80x80px, texto legible | | |
| 5 | **Botón TARJETA ROJA** | Rojo, mínimo 80x80px, texto legible | | |
| 6 | **Botón SUSTITUCIÓN** | Azul, mínimo 80x80px, texto legible | | |
| 7 | **Selector de equipo** | Funciona correctamente, cambio visual claro | | |
| 8 | **Lista de jugadores** | Visible, botones grandes, nombres legibles | | |
| 9 | **Timeline de eventos** | Muestra eventos en orden cronológico | | |
| 10 | **Botón FINALIZAR** | Rojo, grande, claramente visible | | |

#### Funcionalidad de Eventos

| # | Acción | Resultado Esperado | ✅/❌ | Notas |
|---|--------|-------------------|-------|-------|
| 1 | Tocar botón GOL | Muestra confirmación visual inmediata | | |
| 2 | Registrar un gol | El marcador se actualiza correctamente | | |
| 3 | Tocar botón TARJETA AMARILLA | Muestra confirmación visual inmediata | | |
| 4 | Registrar tarjeta amarilla | Aparece en el timeline de eventos | | |
| 5 | Tocar botón TARJETA ROJA | Muestra confirmación visual inmediata | | |
| 6 | Registrar tarjeta roja | Aparece en el timeline de eventos | | |
| 7 | Cambiar de equipo | El selector cambia correctamente | | |
| 8 | Seleccionar jugador | El jugador se selecciona visualmente | | |
| 9 | Registrar múltiples eventos | Todos aparecen en el timeline | | |
| 10 | Scroll en timeline | El scroll funciona suavemente | | |

#### Cronómetro

| # | Acción | Resultado Esperado | ✅/❌ | Notas |
|---|--------|-------------------|-------|-------|
| 1 | Iniciar cronómetro | Comienza a contar desde 00:00 | | |
| 2 | Verificar incremento | Se incrementa cada minuto | | |
| 3 | Pausar cronómetro | Se detiene correctamente | | |
| 4 | Reanudar cronómetro | Continúa desde donde se pausó | | |
| 5 | Marcar medio tiempo | Se resetea a 00:00 para segundo tiempo | | |
| 6 | Verificar sincronización | Se sincroniza con backend cada 30 seg | | |

#### Finalización de Partido

| # | Acción | Resultado Esperado | ✅/❌ | Notas |
|---|--------|-------------------|-------|-------|
| 1 | Tocar botón FINALIZAR | Aparece primer modal de confirmación | | |
| 2 | Confirmar primera vez | Aparece segundo modal con marcador final | | |
| 3 | Verificar marcador en modal | El marcador mostrado es correcto | | |
| 4 | Confirmar segunda vez | Se envía la finalización al backend | | |
| 5 | Verificar respuesta | Aparece pantalla de resumen final | | |
| 6 | Cancelar en primer modal | El partido NO se finaliza | | |
| 7 | Cancelar en segundo modal | El partido NO se finaliza | | |

### 2.5 Testing de Rendimiento en iOS

| # | Métrica | Objetivo | Resultado | ✅/❌ | Notas |
|---|---------|----------|-----------|-------|-------|
| 1 | Tiempo de carga inicial | < 3 segundos | _______ seg | | |
| 2 | Tiempo de respuesta al tocar botón | < 500 ms | _______ ms | | |
| 3 | Actualización de marcador | < 200 ms | _______ ms | | |
| 4 | Scroll en timeline | 60 FPS | _______ FPS | | |
| 5 | Uso de memoria | < 200 MB | _______ MB | | |
| 6 | Consumo de batería (90 min) | < 30% | _______ % | | |

**Herramienta para medir:** Safari Web Inspector (conectado desde Mac)

### 2.6 Testing de Conectividad en iOS

| # | Escenario | Acción | Resultado Esperado | ✅/❌ | Notas |
|---|-----------|--------|-------------------|-------|-------|
| 1 | **Conexión WiFi estable** | Usar la app normalmente | Funciona sin problemas | | |
| 2 | **Conexión 4G/LTE** | Cambiar a datos móviles | Funciona correctamente | | |
| 3 | **Conexión 3G lenta** | Simular conexión lenta | Muestra indicador de loading | | |
| 4 | **Pérdida de conexión** | Activar modo avión | Muestra mensaje de error | | |
| 5 | **Reconexión** | Desactivar modo avión | Recupera estado automáticamente | | |
| 6 | **Registro offline** | Registrar evento sin conexión | Muestra error o encola evento | | |

### 2.7 Testing de Versiones de iOS

**Repetir las pruebas en las siguientes versiones:**

| Versión iOS | Dispositivo | Instalación | Funcionalidad | Rendimiento | Tester | Fecha |
|-------------|-------------|:-----------:|:-------------:|:-----------:|--------|-------|
| **iOS 14** | iPad _______ | ✅/❌ | ✅/❌ | ✅/❌ | _______ | _____ |
| **iOS 15** | iPad _______ | ✅/❌ | ✅/❌ | ✅/❌ | _______ | _____ |
| **iOS 16** | iPad _______ | ✅/❌ | ✅/❌ | ✅/❌ | _______ | _____ |
| **iOS 17** | iPad _______ | ✅/❌ | ✅/❌ | ✅/❌ | _______ | _____ |

### 2.8 Testing de Modelos de iPad

**Repetir las pruebas en los siguientes modelos:**

| Modelo iPad | Tamaño | iOS | Instalación | Funcionalidad | Notas |
|-------------|--------|-----|:-----------:|:-------------:|-------|
| **iPad (9.7")** | 9.7" | _______ | ✅/❌ | ✅/❌ | |
| **iPad Air** | 10.9" | _______ | ✅/❌ | ✅/❌ | |
| **iPad Pro 11"** | 11" | _______ | ✅/❌ | ✅/❌ | |
| **iPad Pro 12.9"** | 12.9" | _______ | ✅/❌ | ✅/❌ | |
| **iPad Mini** | 8.3" | _______ | ✅/❌ | ✅/❌ | Pantalla pequeña |

### 2.9 Consideraciones Específicas de iOS

**Verificar los siguientes comportamientos específicos de iOS:**

| # | Comportamiento | Resultado Esperado | ✅/❌ | Notas |
|---|----------------|-------------------|-------|-------|
| 1 | Service Worker funciona correctamente | Caché funciona (con limitaciones) | | |
| 2 | La app no se cierra al cambiar de app | Se mantiene en memoria | | |
| 3 | La app se restaura al volver a ella | Mantiene el estado | | |
| 4 | Los gestos de iOS funcionan | Swipe, pinch, etc. funcionan | | |
| 5 | La app respeta el modo oscuro del sistema | Se adapta al modo oscuro | | |
| 6 | La app funciona con teclado externo | Los atajos de teclado funcionan | | |

---


## 3. Matriz de Testing de Tamaños de Tablet

### 3.1 Categorías de Tamaños

Esta sección proporciona una matriz para probar la PWA en tablets de diferentes tamaños y resoluciones.

#### 3.1.1 Tablets Pequeñas (7-8 pulgadas)

**Resoluciones comunes:** 1024x600, 1280x800

| Dispositivo | Resolución | Orientación | Marcador Visible | Botones Accesibles | Cronómetro Legible | ✅/❌ | Notas |
|-------------|------------|-------------|:----------------:|:------------------:|:------------------:|-------|-------|
| iPad Mini 8.3" | 2266x1488 | Landscape | | | | | |
| Samsung Tab A 8" | 1280x800 | Landscape | | | | | |
| Lenovo Tab M8 | 1280x800 | Landscape | | | | | |
| Amazon Fire HD 8 | 1280x800 | Landscape | | | | | |

**Validaciones específicas para tablets pequeñas:**

| # | Validación | Resultado Esperado | ✅/❌ | Notas |
|---|------------|-------------------|-------|-------|
| 1 | Todos los botones son visibles sin scroll | Todos los elementos caben en pantalla | | |
| 2 | El texto es legible sin zoom | Tamaño de fuente adecuado | | |
| 3 | Los botones son tocables sin error | Espaciado suficiente entre botones | | |
| 4 | El marcador no se solapa con otros elementos | Layout correcto | | |
| 5 | El timeline es accesible | Scroll funciona correctamente | | |

#### 3.1.2 Tablets Medianas (9-10 pulgadas)

**Resoluciones comunes:** 1280x800, 1920x1200, 2048x1536

| Dispositivo | Resolución | Orientación | Marcador Visible | Botones Accesibles | Cronómetro Legible | ✅/❌ | Notas |
|-------------|------------|-------------|:----------------:|:------------------:|:------------------:|-------|-------|
| iPad 9.7" | 2048x1536 | Landscape | | | | | |
| iPad Air 10.9" | 2360x1640 | Landscape | | | | | |
| Samsung Tab S6 10.5" | 2560x1600 | Landscape | | | | | |
| Lenovo Tab P10 | 1920x1200 | Landscape | | | | | |
| Huawei MatePad 10.4" | 2000x1200 | Landscape | | | | | |

**Validaciones específicas para tablets medianas:**

| # | Validación | Resultado Esperado | ✅/❌ | Notas |
|---|------------|-------------------|-------|-------|
| 1 | El layout aprovecha el espacio disponible | No hay espacios vacíos excesivos | | |
| 2 | Los botones mantienen tamaño mínimo 80x80px | Botones no son demasiado pequeños | | |
| 3 | El marcador es prominente | Tamaño adecuado para la pantalla | | |
| 4 | El cronómetro es claramente visible | Tamaño 80px o mayor | | |
| 5 | La interfaz se ve profesional | Diseño equilibrado | | |

#### 3.1.3 Tablets Grandes (11-13 pulgadas)

**Resoluciones comunes:** 2048x1536, 2388x1668, 2732x2048

| Dispositivo | Resolución | Orientación | Marcador Visible | Botones Accesibles | Cronómetro Legible | ✅/❌ | Notas |
|-------------|------------|-------------|:----------------:|:------------------:|:------------------:|-------|-------|
| iPad Pro 11" | 2388x1668 | Landscape | | | | | |
| iPad Pro 12.9" | 2732x2048 | Landscape | | | | | |
| Samsung Tab S8+ 12.4" | 2800x1752 | Landscape | | | | | |
| Lenovo Tab P12 Pro | 2560x1600 | Landscape | | | | | |
| Microsoft Surface Go | 1920x1280 | Landscape | | | | | |

**Validaciones específicas para tablets grandes:**

| # | Validación | Resultado Esperado | ✅/❌ | Notas |
|---|------------|-------------------|-------|-------|
| 1 | El layout escala correctamente | No hay elementos desproporcionados | | |
| 2 | Los botones son suficientemente grandes | Mínimo 80x80px, pueden ser más grandes | | |
| 3 | El marcador es prominente y legible | Aprovecha el espacio disponible | | |
| 4 | El cronómetro es gigante | Tamaño 80px o mayor | | |
| 5 | La interfaz no se ve vacía | Uso eficiente del espacio | | |
| 6 | El timeline muestra más eventos | Aprovecha la altura de pantalla | | |

### 3.2 Testing de Orientación

#### 3.2.1 Orientación Landscape (Horizontal) - PRINCIPAL

**Esta es la orientación principal y recomendada para la app.**

| Dispositivo | Tamaño | Resolución Landscape | Layout Correcto | Botones Accesibles | ✅/❌ | Notas |
|-------------|--------|---------------------|:---------------:|:------------------:|-------|-------|
| ____________ | ___" | _______ x _______ | | | | |
| ____________ | ___" | _______ x _______ | | | | | |
| ____________ | ___" | _______ x _______ | | | | | |

**Validaciones en Landscape:**

| # | Validación | Resultado Esperado | ✅/❌ | Notas |
|---|------------|-------------------|-------|-------|
| 1 | Marcador en la parte superior | Visible y centrado | | |
| 2 | Cronómetro en posición prominente | Grande y visible | | |
| 3 | Botones de eventos en fila o grid | Accesibles sin scroll | | |
| 4 | Timeline en lateral o inferior | Visible y scrollable | | |
| 5 | Selector de equipo accesible | Fácil de cambiar | | |

#### 3.2.2 Orientación Portrait (Vertical) - SECUNDARIA

**La app debe forzar landscape, pero verificar comportamiento si se rota:**

| Dispositivo | Tamaño | Resolución Portrait | Fuerza Landscape | Mensaje de Rotación | ✅/❌ | Notas |
|-------------|--------|---------------------|:----------------:|:-------------------:|-------|-------|
| ____________ | ___" | _______ x _______ | | | | |
| ____________ | ___" | _______ x _______ | | | | | |
| ____________ | ___" | _______ x _______ | | | | | |

**Validaciones en Portrait:**

| # | Validación | Resultado Esperado | ✅/❌ | Notas |
|---|------------|-------------------|-------|-------|
| 1 | La app permanece en landscape | No rota a portrait | | |
| 2 | Si rota, muestra mensaje | "Por favor, rota tu dispositivo" | | |
| 3 | El layout no se rompe | No hay elementos cortados | | |
| 4 | Al volver a landscape, funciona | Se restaura correctamente | | |

### 3.3 Testing de Resoluciones Específicas

**Probar en las siguientes resoluciones comunes:**

| Resolución | Aspecto | Dispositivos Comunes | Layout | Botones | Cronómetro | ✅/❌ | Notas |
|------------|---------|---------------------|:------:|:-------:|:----------:|-------|-------|
| **1024x768** | 4:3 | iPad antiguo | | | | | |
| **1280x800** | 16:10 | Tablets Android | | | | | |
| **1920x1200** | 16:10 | Tablets premium | | | | | |
| **2048x1536** | 4:3 | iPad Retina | | | | | |
| **2388x1668** | ~16:11 | iPad Pro 11" | | | | | |
| **2732x2048** | 4:3 | iPad Pro 12.9" | | | | | |
| **2560x1600** | 16:10 | Samsung Tab S | | | | | |

### 3.4 Testing de Escalado de UI

**Verificar que los elementos escalan correctamente:**

| Elemento | Tamaño Mínimo | Tamaño en 7" | Tamaño en 10" | Tamaño en 13" | ✅/❌ | Notas |
|----------|---------------|--------------|---------------|---------------|-------|-------|
| **Botón GOL** | 80x80px | _______ | _______ | _______ | | |
| **Botón TARJETA** | 80x80px | _______ | _______ | _______ | | |
| **Cronómetro** | 80px altura | _______ | _______ | _______ | | |
| **Marcador** | 40px altura | _______ | _______ | _______ | | |
| **Texto de botón** | 18px | _______ | _______ | _______ | | |
| **Nombres de jugadores** | 16px | _______ | _______ | _______ | | |

---


## 4. Testing de Usabilidad con Guantes

### 4.1 Introducción

Esta sección proporciona pruebas específicas para validar que la aplicación es usable con guantes deportivos, una característica crítica para planilleros que trabajan en condiciones de frío o que prefieren usar guantes durante los partidos.

### 4.2 Tipos de Guantes a Probar

**Probar con los siguientes tipos de guantes:**

| Tipo de Guante | Grosor | Material | Disponible | Tester | Fecha |
|----------------|--------|----------|:----------:|--------|-------|
| **Guantes deportivos finos** | Fino (1-2mm) | Sintético | ☐ | _______ | _____ |
| **Guantes deportivos medianos** | Medio (3-5mm) | Algodón/Sintético | ☐ | _______ | _____ |
| **Guantes deportivos gruesos** | Grueso (6-10mm) | Lana/Polar | ☐ | _______ | _____ |
| **Guantes de árbitro** | Fino (1-2mm) | Sintético | ☐ | _______ | _____ |
| **Guantes de invierno** | Muy grueso (10mm+) | Lana gruesa | ☐ | _______ | _____ |

### 4.3 Validación de Tamaño de Botones

**Objetivo:** Verificar que los botones cumplen con el tamaño mínimo de 80x80px y son tocables con guantes.

#### 4.3.1 Medición de Botones

**Usar Chrome DevTools para medir:**

| Botón | Ancho (px) | Alto (px) | Cumple Mínimo 80x80 | ✅/❌ | Notas |
|-------|------------|-----------|:-------------------:|-------|-------|
| **Botón GOL** | _______ | _______ | | | |
| **Botón TARJETA AMARILLA** | _______ | _______ | | | |
| **Botón TARJETA ROJA** | _______ | _______ | | | |
| **Botón SUSTITUCIÓN** | _______ | _______ | | | |
| **Botón INICIAR** | _______ | _______ | | | |
| **Botón PAUSAR** | _______ | _______ | | | |
| **Botón MEDIO TIEMPO** | _______ | _______ | | | |
| **Botón FINALIZAR** | _______ | _______ | | | |
| **Botones de jugadores** | _______ | _______ | | | |
| **Selector de equipo** | _______ | _______ | | | |

**Herramienta:** Chrome DevTools > Elements > Computed > Width/Height

#### 4.3.2 Pruebas de Toque con Guantes

**Para cada tipo de guante, completar la siguiente tabla:**

**Tipo de guante:** _______________________

| # | Acción | Resultado Esperado | ✅/❌ | Intentos | Notas |
|---|--------|-------------------|-------|----------|-------|
| 1 | Tocar botón GOL | Se registra el toque correctamente | | ___/5 | |
| 2 | Tocar botón TARJETA AMARILLA | Se registra el toque correctamente | | ___/5 | |
| 3 | Tocar botón TARJETA ROJA | Se registra el toque correctamente | | ___/5 | |
| 4 | Tocar botón SUSTITUCIÓN | Se registra el toque correctamente | | ___/5 | |
| 5 | Tocar botón de jugador | Se selecciona el jugador correcto | | ___/5 | |
| 6 | Cambiar selector de equipo | El equipo cambia correctamente | | ___/5 | |
| 7 | Tocar botón INICIAR cronómetro | El cronómetro inicia | | ___/5 | |
| 8 | Tocar botón PAUSAR cronómetro | El cronómetro se pausa | | ___/5 | |
| 9 | Tocar botón FINALIZAR | Aparece modal de confirmación | | ___/5 | |
| 10 | Confirmar en modal | El modal responde correctamente | | ___/5 | |

**Criterio de éxito:** Mínimo 4/5 intentos exitosos por acción.

### 4.4 Validación de Espaciado entre Botones

**Objetivo:** Verificar que hay suficiente espacio entre botones para evitar toques accidentales.

#### 4.4.1 Medición de Espaciado

**Usar Chrome DevTools para medir:**

| Par de Botones | Espaciado (px) | Cumple Mínimo 16px | ✅/❌ | Notas |
|----------------|----------------|:------------------:|-------|-------|
| GOL ↔ TARJETA AMARILLA | _______ | | | |
| TARJETA AMARILLA ↔ TARJETA ROJA | _______ | | | |
| TARJETA ROJA ↔ SUSTITUCIÓN | _______ | | | |
| Jugador 1 ↔ Jugador 2 | _______ | | | |
| INICIAR ↔ PAUSAR | _______ | | | |
| PAUSAR ↔ MEDIO TIEMPO | _______ | | | |

**Herramienta:** Chrome DevTools > Elements > Computed > Margin/Padding

#### 4.4.2 Pruebas de Toques Accidentales

**Para cada tipo de guante, completar la siguiente tabla:**

**Tipo de guante:** _______________________

| # | Acción Intencional | Botón Tocado Accidentalmente | Frecuencia | ✅/❌ | Notas |
|---|-------------------|------------------------------|------------|-------|-------|
| 1 | Tocar GOL | TARJETA AMARILLA | ___/10 | | |
| 2 | Tocar TARJETA AMARILLA | GOL o TARJETA ROJA | ___/10 | | |
| 3 | Tocar TARJETA ROJA | TARJETA AMARILLA o SUSTITUCIÓN | ___/10 | | |
| 4 | Tocar jugador específico | Jugador adyacente | ___/10 | | |
| 5 | Tocar INICIAR | PAUSAR | ___/10 | | |

**Criterio de éxito:** Máximo 1/10 toques accidentales por acción.

### 4.5 Validación de Feedback Visual

**Objetivo:** Verificar que el feedback visual es suficientemente claro para confirmar toques con guantes.

| # | Elemento | Feedback Visual | Duración | Claridad | ✅/❌ | Notas |
|---|----------|----------------|----------|----------|-------|-------|
| 1 | Botón GOL | Cambio de color / animación | _______ ms | Alta/Media/Baja | | |
| 2 | Botón TARJETA | Cambio de color / animación | _______ ms | Alta/Media/Baja | | |
| 3 | Botón de jugador | Resaltado / borde | _______ ms | Alta/Media/Baja | | |
| 4 | Selector de equipo | Cambio de estado visual | _______ ms | Alta/Media/Baja | | |
| 5 | Confirmación de evento | Toast / notificación | _______ ms | Alta/Media/Baja | | |

**Criterio de éxito:** Feedback visual debe ser "Alta" claridad y duración mínima de 300ms.

### 4.6 Pruebas de Precisión con Guantes

**Objetivo:** Medir la precisión de toques con diferentes tipos de guantes.

#### 4.6.1 Prueba de Precisión de 20 Toques

**Instrucciones:**
1. Seleccionar un tipo de guante
2. Intentar tocar 20 botones diferentes en secuencia
3. Registrar cuántos toques fueron exitosos en el primer intento

**Tipo de guante:** _______________________

| Intento | Botón Objetivo | Éxito 1er Intento | Intentos Necesarios | Notas |
|---------|----------------|:-----------------:|:-------------------:|-------|
| 1 | GOL | ☐ | _____ | |
| 2 | TARJETA AMARILLA | ☐ | _____ | |
| 3 | TARJETA ROJA | ☐ | _____ | |
| 4 | SUSTITUCIÓN | ☐ | _____ | |
| 5 | Jugador 1 | ☐ | _____ | |
| 6 | Jugador 2 | ☐ | _____ | |
| 7 | Jugador 3 | ☐ | _____ | |
| 8 | Jugador 4 | ☐ | _____ | |
| 9 | Jugador 5 | ☐ | _____ | |
| 10 | Selector Equipo Local | ☐ | _____ | |
| 11 | Selector Equipo Visita | ☐ | _____ | |
| 12 | INICIAR | ☐ | _____ | |
| 13 | PAUSAR | ☐ | _____ | |
| 14 | MEDIO TIEMPO | ☐ | _____ | |
| 15 | GOL (repetir) | ☐ | _____ | |
| 16 | Jugador 6 | ☐ | _____ | |
| 17 | Jugador 7 | ☐ | _____ | |
| 18 | TARJETA AMARILLA (repetir) | ☐ | _____ | |
| 19 | Jugador 8 | ☐ | _____ | |
| 20 | FINALIZAR | ☐ | _____ | |

**Resultados:**
- **Éxitos en 1er intento:** _____ / 20 (____%)
- **Promedio de intentos:** _____
- **Criterio de éxito:** Mínimo 16/20 (80%) éxitos en 1er intento

### 4.7 Pruebas de Velocidad con Guantes

**Objetivo:** Verificar que se pueden registrar eventos rápidamente con guantes.

#### 4.7.1 Prueba de Registro Rápido de Eventos

**Instrucciones:**
1. Cronometrar cuánto tiempo toma registrar 10 eventos consecutivos
2. Repetir con cada tipo de guante

**Tipo de guante:** _______________________

| Evento | Acción | Tiempo (segundos) | ✅/❌ | Notas |
|--------|--------|:-----------------:|-------|-------|
| 1 | Seleccionar Equipo Local + Jugador + GOL | _______ | | |
| 2 | Seleccionar Equipo Visita + Jugador + GOL | _______ | | |
| 3 | Seleccionar Equipo Local + Jugador + TARJETA AMARILLA | _______ | | |
| 4 | Seleccionar Equipo Local + Jugador + GOL | _______ | | |
| 5 | Seleccionar Equipo Visita + Jugador + TARJETA AMARILLA | _______ | | |
| 6 | Seleccionar Equipo Visita + Jugador + GOL | _______ | | |
| 7 | Seleccionar Equipo Local + Jugador + TARJETA ROJA | _______ | | |
| 8 | Seleccionar Equipo Visita + Jugador + GOL | _______ | | |
| 9 | Seleccionar Equipo Local + Jugador + SUSTITUCIÓN | _______ | | |
| 10 | Seleccionar Equipo Visita + Jugador + GOL | _______ | | |

**Resultados:**
- **Tiempo total:** _______ segundos
- **Tiempo promedio por evento:** _______ segundos
- **Criterio de éxito:** Máximo 10 segundos por evento

### 4.8 Pruebas de Condiciones Ambientales

**Objetivo:** Verificar usabilidad con guantes en diferentes condiciones.

| Condición | Tipo de Guante | Temperatura | Humedad | Usabilidad | ✅/❌ | Notas |
|-----------|----------------|-------------|---------|:----------:|-------|-------|
| **Interior cálido** | Fino | 20-25°C | Normal | Alta/Media/Baja | | |
| **Interior frío** | Medio | 10-15°C | Normal | Alta/Media/Baja | | |
| **Exterior templado** | Fino | 15-20°C | Normal | Alta/Media/Baja | | |
| **Exterior frío** | Grueso | 5-10°C | Normal | Alta/Media/Baja | | |
| **Exterior muy frío** | Muy grueso | 0-5°C | Normal | Alta/Media/Baja | | |
| **Lluvia ligera** | Medio | 10-15°C | Alta | Alta/Media/Baja | | |

### 4.9 Alternativas de Entrada

**Objetivo:** Documentar métodos alternativos de entrada para casos donde los guantes dificultan el uso.

| Método Alternativo | Descripción | Disponible | Funciona | ✅/❌ | Notas |
|-------------------|-------------|:----------:|:--------:|-------|-------|
| **Stylus capacitivo** | Lápiz táctil para pantallas | | | | |
| **Guantes táctiles** | Guantes con puntas conductivas | | | | |
| **Quitarse guantes** | Usar sin guantes temporalmente | | | | |
| **Voz (futuro)** | Comandos de voz | ☐ | N/A | | No implementado |
| **Teclado externo** | Atajos de teclado | | | | |

### 4.10 Recomendaciones de Accesibilidad

**Basado en las pruebas, documentar recomendaciones:**

| # | Recomendación | Prioridad | Implementado | Notas |
|---|---------------|-----------|:------------:|-------|
| 1 | Aumentar tamaño de botones a 100x100px | Alta/Media/Baja | ☐ | |
| 2 | Aumentar espaciado entre botones a 24px | Alta/Media/Baja | ☐ | |
| 3 | Mejorar feedback visual (duración/contraste) | Alta/Media/Baja | ☐ | |
| 4 | Agregar confirmación de audio | Alta/Media/Baja | ☐ | |
| 5 | Agregar modo "guantes" con botones más grandes | Alta/Media/Baja | ☐ | |
| 6 | Agregar soporte para stylus | Alta/Media/Baja | ☐ | |
| 7 | Agregar comandos de voz | Alta/Media/Baja | ☐ | |

---


## 5. Plantillas de Reporte de Problemas

### 5.1 Formulario de Reporte de Bug

**Usar esta plantilla para reportar cualquier problema encontrado durante las pruebas:**

---

#### BUG REPORT #_____

**Fecha:** _________________  
**Tester:** _________________  
**Dispositivo:** _________________  
**OS/Versión:** _________________  
**Navegador/Versión:** _________________

**Severidad:** ☐ Crítica  ☐ Alta  ☐ Media  ☐ Baja

**Categoría:** ☐ Instalación  ☐ Funcionalidad  ☐ UI/UX  ☐ Rendimiento  ☐ Conectividad

**Título del problema:**
_________________________________________________________________

**Descripción detallada:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Pasos para reproducir:**
1. _________________________________________________________________
2. _________________________________________________________________
3. _________________________________________________________________
4. _________________________________________________________________

**Resultado esperado:**
_________________________________________________________________
_________________________________________________________________

**Resultado actual:**
_________________________________________________________________
_________________________________________________________________

**Frecuencia:** ☐ Siempre  ☐ Frecuente  ☐ Ocasional  ☐ Raro

**¿Se puede reproducir?** ☐ Sí  ☐ No  ☐ A veces

**Impacto en el usuario:**
_________________________________________________________________
_________________________________________________________________

**Capturas de pantalla:**
☐ Adjuntas (archivos: ___________________________________)

**Video:**
☐ Adjunto (archivo: ___________________________________)

**Logs de consola:**
```
[Pegar logs aquí si están disponibles]
```

**Workaround disponible:**
☐ Sí: _________________________________________________________________
☐ No

**Notas adicionales:**
_________________________________________________________________
_________________________________________________________________

---

### 5.2 Formulario de Reporte de Mejora de UX

**Usar esta plantilla para sugerir mejoras de experiencia de usuario:**

---

#### UX IMPROVEMENT #_____

**Fecha:** _________________  
**Tester:** _________________  
**Dispositivo:** _________________

**Prioridad:** ☐ Alta  ☐ Media  ☐ Baja

**Área:** ☐ Navegación  ☐ Diseño  ☐ Interacción  ☐ Accesibilidad  ☐ Rendimiento

**Título de la mejora:**
_________________________________________________________________

**Situación actual:**
_________________________________________________________________
_________________________________________________________________

**Problema identificado:**
_________________________________________________________________
_________________________________________________________________

**Mejora propuesta:**
_________________________________________________________________
_________________________________________________________________

**Beneficio esperado:**
_________________________________________________________________
_________________________________________________________________

**Usuarios afectados:** ☐ Todos  ☐ Planilleros  ☐ Usuarios con guantes  ☐ Otros: _______

**Capturas de pantalla (antes):**
☐ Adjuntas (archivos: ___________________________________)

**Mockup de mejora (después):**
☐ Adjunto (archivo: ___________________________________)

**Notas adicionales:**
_________________________________________________________________

---

### 5.3 Formulario de Reporte de Rendimiento

**Usar esta plantilla para reportar problemas de rendimiento:**

---

#### PERFORMANCE ISSUE #_____

**Fecha:** _________________  
**Tester:** _________________  
**Dispositivo:** _________________  
**OS/Versión:** _________________

**Tipo de problema:** ☐ Carga lenta  ☐ Lag  ☐ Consumo de batería  ☐ Uso de memoria  ☐ Otro

**Métrica afectada:**
_________________________________________________________________

**Valor medido:** _________________
**Valor esperado:** _________________
**Diferencia:** _________________

**Condiciones de la prueba:**
- Conexión: ☐ WiFi  ☐ 4G  ☐ 3G  ☐ Offline
- Batería: _______%
- Apps en background: _________________
- Tiempo de uso antes del problema: _______ minutos

**Descripción del problema:**
_________________________________________________________________
_________________________________________________________________

**Impacto en la experiencia:**
_________________________________________________________________

**Datos de rendimiento (Chrome DevTools):**
- First Contentful Paint: _______ ms
- Time to Interactive: _______ ms
- Total Blocking Time: _______ ms
- Largest Contentful Paint: _______ ms
- Cumulative Layout Shift: _______

**Uso de recursos:**
- CPU: _______%
- Memoria: _______ MB
- Red: _______ KB/s

**Capturas de Performance:**
☐ Adjuntas (archivos: ___________________________________)

**Notas adicionales:**
_________________________________________________________________

---

### 5.4 Checklist de Validación de Corrección

**Usar esta plantilla después de que un bug ha sido corregido:**

---

#### BUG FIX VALIDATION #_____

**Bug original:** #_____  
**Fecha de corrección:** _________________  
**Tester de validación:** _________________  
**Dispositivo de prueba:** _________________

**Pasos de reproducción del bug original:**
1. _________________________________________________________________
2. _________________________________________________________________
3. _________________________________________________________________

**Resultado antes de la corrección:**
_________________________________________________________________

**Resultado después de la corrección:**
_________________________________________________________________

**¿El bug está corregido?** ☐ Sí  ☐ No  ☐ Parcialmente

**Pruebas de regresión:**

| Funcionalidad relacionada | Funciona correctamente | ✅/❌ | Notas |
|---------------------------|:----------------------:|-------|-------|
| _________________________ | | | |
| _________________________ | | | |
| _________________________ | | | |

**Pruebas en otros dispositivos:**

| Dispositivo | OS | Bug corregido | ✅/❌ | Notas |
|-------------|----|--------------:|-------|-------|
| ____________ | _______ | | | |
| ____________ | _______ | | | |
| ____________ | _______ | | | |

**¿Se introdujeron nuevos bugs?** ☐ Sí  ☐ No

**Si sí, describir:**
_________________________________________________________________

**Aprobación:** ☐ Aprobado  ☐ Rechazado  ☐ Requiere más trabajo

**Firma del tester:** _________________  
**Fecha:** _________________

---

### 5.5 Resumen de Sesión de Testing

**Usar esta plantilla al final de cada sesión de testing:**

---

#### TESTING SESSION SUMMARY

**Fecha:** _________________  
**Duración:** _______ horas  
**Tester(s):** _________________  
**Dispositivo(s):** _________________

**Áreas probadas:**
- ☐ Instalación
- ☐ Funcionalidad básica
- ☐ Funcionalidad avanzada
- ☐ Rendimiento
- ☐ Conectividad
- ☐ Usabilidad con guantes
- ☐ Diferentes tamaños de pantalla
- ☐ Diferentes versiones de OS

**Estadísticas:**
- **Total de pruebas ejecutadas:** _____
- **Pruebas exitosas:** _____
- **Pruebas fallidas:** _____
- **Bugs encontrados:** _____
  - Críticos: _____
  - Altos: _____
  - Medios: _____
  - Bajos: _____
- **Mejoras sugeridas:** _____

**Bugs críticos encontrados:**
1. _________________________________________________________________
2. _________________________________________________________________
3. _________________________________________________________________

**Principales hallazgos:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Recomendaciones:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Estado general de la aplicación:**
☐ Lista para producción
☐ Requiere correcciones menores
☐ Requiere correcciones mayores
☐ No lista para producción

**Próximos pasos:**
1. _________________________________________________________________
2. _________________________________________________________________
3. _________________________________________________________________

**Firma del tester:** _________________  
**Fecha:** _________________

---


## 6. Sección de Aprobación

### 6.1 Checklist Final de Aprobación

**Completar antes de aprobar la PWA para producción:**

#### 6.1.1 Instalación

| Criterio | Android | iOS | Notas |
|----------|:-------:|:---:|-------|
| Se instala correctamente en Chrome | ☐ | N/A | |
| Se instala correctamente en Safari | N/A | ☐ | |
| El ícono aparece en la pantalla de inicio | ☐ | ☐ | |
| El ícono es correcto y de alta calidad | ☐ | ☐ | |
| La app abre en modo standalone | ☐ | ☐ | |
| No se ve la barra del navegador | ☐ | ☐ | |

#### 6.1.2 Funcionalidad

| Criterio | Android | iOS | Notas |
|----------|:-------:|:---:|-------|
| Todos los botones funcionan correctamente | ☐ | ☐ | |
| El marcador se actualiza correctamente | ☐ | ☐ | |
| El cronómetro funciona correctamente | ☐ | ☐ | |
| Los eventos se registran correctamente | ☐ | ☐ | |
| La finalización de partido funciona | ☐ | ☐ | |
| El timeline muestra eventos correctamente | ☐ | ☐ | |
| La sincronización con backend funciona | ☐ | ☐ | |

#### 6.1.3 Diseño y UX

| Criterio | Android | iOS | Notas |
|----------|:-------:|:---:|-------|
| La orientación landscape se fuerza correctamente | ☐ | ☐ | |
| El tema de color se aplica correctamente | ☐ | ☐ | |
| Los botones son suficientemente grandes (80x80px) | ☐ | ☐ | |
| El espaciado entre botones es adecuado (16px) | ☐ | ☐ | |
| El cronómetro es legible (80px) | ☐ | ☐ | |
| El marcador es prominente y visible | ☐ | ☐ | |
| El diseño es profesional y pulido | ☐ | ☐ | |

#### 6.1.4 Rendimiento

| Criterio | Android | iOS | Notas |
|----------|:-------:|:---:|-------|
| Carga inicial < 3 segundos | ☐ | ☐ | |
| Respuesta a toques < 500ms | ☐ | ☐ | |
| Actualización de marcador < 200ms | ☐ | ☐ | |
| Scroll suave (60 FPS) | ☐ | ☐ | |
| Uso de memoria < 200MB | ☐ | ☐ | |
| Consumo de batería < 30% en 90 min | ☐ | ☐ | |

#### 6.1.5 Conectividad

| Criterio | Android | iOS | Notas |
|----------|:-------:|:---:|-------|
| Funciona con WiFi estable | ☐ | ☐ | |
| Funciona con 4G/LTE | ☐ | ☐ | |
| Funciona con 3G (con indicador de loading) | ☐ | ☐ | |
| Muestra error al perder conexión | ☐ | ☐ | |
| Recupera estado al reconectar | ☐ | ☐ | |

#### 6.1.6 Usabilidad con Guantes

| Criterio | Guantes Finos | Guantes Medios | Guantes Gruesos | Notas |
|----------|:-------------:|:--------------:|:---------------:|-------|
| Botones son tocables | ☐ | ☐ | ☐ | |
| Precisión > 80% | ☐ | ☐ | ☐ | |
| Toques accidentales < 10% | ☐ | ☐ | ☐ | |
| Feedback visual claro | ☐ | ☐ | ☐ | |
| Tiempo de registro < 10s por evento | ☐ | ☐ | ☐ | |

#### 6.1.7 Compatibilidad

| Criterio | Cumple | Notas |
|----------|:------:|-------|
| Funciona en Android 10+ | ☐ | |
| Funciona en iOS 14+ | ☐ | |
| Funciona en tablets 7-13 pulgadas | ☐ | |
| Funciona en diferentes fabricantes | ☐ | |
| Funciona en diferentes resoluciones | ☐ | |

### 6.2 Criterios de Aceptación

**Para aprobar la PWA para producción, TODOS los siguientes criterios deben cumplirse:**

- [ ] **Instalación:** La PWA se instala correctamente en Android (Chrome) e iOS (Safari)
- [ ] **Modo Standalone:** La app abre sin barra de navegador en ambas plataformas
- [ ] **Funcionalidad Core:** Todos los eventos (gol, tarjeta, sustitución) se registran correctamente
- [ ] **Cronómetro:** El cronómetro funciona y se sincroniza con el backend
- [ ] **Finalización:** La doble confirmación de finalización funciona correctamente
- [ ] **Orientación:** La orientación landscape se fuerza correctamente
- [ ] **Tamaño de Botones:** Todos los botones cumplen el mínimo de 80x80px
- [ ] **Espaciado:** El espaciado entre botones cumple el mínimo de 16px
- [ ] **Rendimiento:** La app cumple con los objetivos de rendimiento (carga < 3s, respuesta < 500ms)
- [ ] **Usabilidad con Guantes:** La app es usable con guantes finos y medios (precisión > 80%)
- [ ] **Compatibilidad:** La app funciona en tablets de 7-13 pulgadas
- [ ] **Conectividad:** La app maneja correctamente pérdida y recuperación de conexión
- [ ] **Sin Bugs Críticos:** No hay bugs críticos pendientes

### 6.3 Firmas de Aprobación

#### 6.3.1 Aprobación de QA

**Tester Principal:** _________________  
**Fecha:** _________________  
**Firma:** _________________

**Resumen de testing:**
- Dispositivos probados: _____
- Pruebas ejecutadas: _____
- Bugs encontrados: _____
- Bugs críticos: _____

**Comentarios:**
_________________________________________________________________
_________________________________________________________________

**Estado:** ☐ Aprobado  ☐ Aprobado con reservas  ☐ Rechazado

---

#### 6.3.2 Aprobación de Desarrollo

**Desarrollador Principal:** _________________  
**Fecha:** _________________  
**Firma:** _________________

**Confirmación:**
- [ ] Todos los bugs críticos han sido corregidos
- [ ] Todos los bugs altos han sido corregidos o documentados
- [ ] El código ha sido revisado (code review)
- [ ] La documentación está actualizada
- [ ] Los tests automatizados pasan

**Comentarios:**
_________________________________________________________________
_________________________________________________________________

**Estado:** ☐ Aprobado  ☐ Aprobado con reservas  ☐ Rechazado

---

#### 6.3.3 Aprobación de Producto

**Product Owner:** _________________  
**Fecha:** _________________  
**Firma:** _________________

**Confirmación:**
- [ ] La funcionalidad cumple con los requisitos del negocio
- [ ] La UX es aceptable para los usuarios finales (planilleros)
- [ ] El rendimiento es aceptable para uso en cancha
- [ ] La app es usable en condiciones reales (con guantes, luz solar, etc.)

**Comentarios:**
_________________________________________________________________
_________________________________________________________________

**Estado:** ☐ Aprobado para producción  ☐ Requiere más trabajo  ☐ Rechazado

---

#### 6.3.4 Aprobación Final

**Director de Proyecto:** _________________  
**Fecha:** _________________  
**Firma:** _________________

**Decisión final:**

☐ **APROBADO PARA PRODUCCIÓN**
   - Fecha de despliegue: _________________
   - Versión: _________________

☐ **REQUIERE CORRECCIONES**
   - Fecha de re-evaluación: _________________
   - Correcciones requeridas: _________________________________

☐ **RECHAZADO**
   - Razón: _________________________________

**Comentarios finales:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

## 7. Anexos

### 7.1 Glosario de Términos

| Término | Definición |
|---------|------------|
| **PWA** | Progressive Web App - Aplicación web que se puede instalar como app nativa |
| **Standalone** | Modo de visualización sin barra de navegador |
| **Landscape** | Orientación horizontal de la pantalla |
| **Portrait** | Orientación vertical de la pantalla |
| **Service Worker** | Script que permite funcionalidad offline y caché |
| **Manifest** | Archivo JSON que define metadatos de la PWA |
| **Touch Target** | Área tocable de un elemento interactivo |
| **Feedback Visual** | Respuesta visual al interactuar con un elemento |
| **Latency** | Tiempo de respuesta entre acción y resultado |
| **FPS** | Frames Per Second - Cuadros por segundo |

### 7.2 Referencias

- **Documentación PWA:** `sportzone-web/PWA_TESTING_GUIDE.md`
- **Guía de implementación:** `sportzone-web/APP_PLANILLERO_README.md`
- **Resumen de implementación:** `sportzone-web/PLANILLERO_IMPLEMENTATION_SUMMARY.md`
- **Configuración de frontend:** `docs/FRONTEND_SETUP.md`

### 7.3 Contactos

| Rol | Nombre | Email | Teléfono |
|-----|--------|-------|----------|
| **QA Lead** | _____________ | _____________ | _____________ |
| **Desarrollador Frontend** | _____________ | _____________ | _____________ |
| **Product Owner** | _____________ | _____________ | _____________ |
| **Soporte Técnico** | _____________ | _____________ | _____________ |

### 7.4 Historial de Versiones del Documento

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | Enero 2025 | _____________ | Versión inicial |
| | | | |
| | | | |

---

## Conclusión

Este documento proporciona un marco completo y detallado para realizar pruebas manuales exhaustivas de la PWA de SportZone Planillero. Asegúrese de:

1. **Completar todas las secciones** de testing relevantes
2. **Documentar todos los problemas** encontrados usando las plantillas proporcionadas
3. **Probar en múltiples dispositivos** y condiciones
4. **Validar la usabilidad con guantes** en condiciones reales
5. **Obtener todas las aprobaciones** necesarias antes de desplegar a producción

**La calidad de la PWA es crítica** ya que será utilizada por planilleros en condiciones de campo durante partidos en vivo. Una aplicación defectuosa puede resultar en pérdida de datos de eventos importantes o frustración de los usuarios.

**¡Buena suerte con las pruebas!**

---

**Documento creado:** Enero 2025  
**Última actualización:** Enero 2025  
**Versión:** 1.0  
**Estado:** Listo para uso

