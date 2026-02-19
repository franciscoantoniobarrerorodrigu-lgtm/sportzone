# SportZone Web - Portal Angular 17

## Descripción

Portal web profesional para SportZone Pro con diseño oscuro tipo ESPN, actualizaciones en tiempo real con SignalR, y arquitectura standalone de Angular 17.

## Estado del Proyecto

### ✅ Completado

#### Fase 3.1: Configuración Inicial
- ✅ Proyecto Angular 17 creado con standalone components
- ✅ Dependencias instaladas (@microsoft/signalr, @supabase/supabase-js, firebase)
- ✅ Environments configurados (development, production)
- ✅ Estilos globales con tema oscuro profesional (#06090F)
- ✅ Fuentes importadas (Bebas Neue, Barlow)

#### Fase 3.2: Core - Servicios
- ✅ AuthService con Supabase Auth
- ✅ ApiService (wrapper HTTP)
- ✅ LigaService con Signals
- ✅ PartidosService con SignalR
- ✅ GoleadoresService
- ✅ SignalRService (wrapper genérico)

#### Fase 3.3: Core - Guards e Interceptors
- ✅ authGuard
- ✅ adminGuard
- ✅ authInterceptor (JWT en headers)
- ✅ HttpClient configurado con interceptor

### 📋 Pendiente

- Crear modelos TypeScript (interfaces)
- Crear componentes de layout (Shell, Navbar)
- Crear componentes de features (Dashboard, Liga, Partidos, etc.)
- Crear componentes shared
- Configurar routing completo

## Estructura del Proyecto

```
sportzone-web/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts ✅
│   │   │   │   └── admin.guard.ts ✅
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts ✅
│   │   │   └── services/
│   │   │       ├── auth.service.ts ✅
│   │   │       ├── api.service.ts ✅
│   │   │       ├── signalr.service.ts ✅
│   │   │       ├── liga.service.ts ✅
│   │   │       ├── partidos.service.ts ✅
│   │   │       └── goleadores.service.ts ✅
│   │   ├── app.config.ts ✅
│   │   └── app.routes.ts
│   ├── environments/
│   │   ├── environment.ts ✅
│   │   └── environment.prod.ts ✅
│   └── styles.scss ✅
└── package.json ✅
```

## Configuración

### Variables de Entorno

Actualizar `src/environments/environment.ts` con las credenciales reales:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  signalRUrl: 'http://localhost:5000/hubs',
  supabase: {
    url: 'TU_SUPABASE_URL',
    anonKey: 'TU_SUPABASE_ANON_KEY'
  },
  firebase: {
    // Configuración de Firebase
  }
};
```

## Comandos

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
ng serve

# Compilar para producción
ng build --configuration production

# Ejecutar tests
ng test

# Generar componente
ng generate component features/nombre-componente --standalone
```

## Tecnologías

- **Angular**: 17 (Standalone Components)
- **TypeScript**: 5.2+
- **SCSS**: Variables CSS + tema oscuro
- **SignalR**: Tiempo real
- **Supabase**: Auth + Database
- **Firebase**: Cloud Messaging

## Próximos Pasos

1. Crear interfaces TypeScript para modelos
2. Implementar componentes de layout
3. Implementar componentes de features
4. Configurar routing completo
5. Integrar con backend .NET 8

## Notas

- Usar **standalone components** en todo el proyecto
- Usar **Angular Signals** para estado reactivo
- Implementar **lazy loading** para todas las rutas
- Tema oscuro profesional tipo ESPN (#06090F)
