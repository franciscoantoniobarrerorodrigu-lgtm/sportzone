# Frontend Portal Web - SportZone Pro (Angular 17)

## Descripción

Portal web profesional tipo ESPN/Sofascore con diseño oscuro, actualizaciones en tiempo real con SignalR, y arquitectura standalone de Angular 17.

## Stack Tecnológico

- **Framework**: Angular 17 Standalone
- **Lenguaje**: TypeScript 5.2+
- **Estilos**: SCSS con variables CSS
- **Estado**: Angular Signals
- **HTTP**: HttpClient
- **Tiempo Real**: @microsoft/signalr
- **Autenticación**: @supabase/supabase-js
- **Notificaciones**: Firebase Cloud Messaging

## Requisitos Previos

- Node.js 18+ instalado
- npm 9+ instalado
- Angular CLI 17 instalado globalmente

## Paso 1: Crear Proyecto Angular

```bash
# Instalar Angular CLI (si no lo tienes)
npm install -g @angular/cli@17

# Crear proyecto Angular 17 standalone
ng new sportzone-web --standalone --routing --style=scss --skip-git

# Entrar al directorio
cd sportzone-web
```

## Paso 2: Instalar Dependencias

```bash
# Dependencias principales
npm install @microsoft/signalr
npm install @supabase/supabase-js
npm install firebase

# Dependencias de desarrollo
npm install --save-dev @types/node
```

## Paso 3: Configurar Environments

### src/environments/environment.ts

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  signalRUrl: 'http://localhost:5000/hubs',
  supabase: {
    url: 'https://tu-proyecto.supabase.co',
    anonKey: 'tu-anon-key-aqui'
  },
  firebase: {
    apiKey: "tu-api-key",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-id",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "tu-app-id"
  }
};
```

### src/environments/environment.prod.ts

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.sportzone.com/api',
  signalRUrl: 'https://api.sportzone.com/hubs',
  supabase: {
    url: 'https://tu-proyecto.supabase.co',
    anonKey: 'tu-anon-key-aqui'
  },
  firebase: {
    apiKey: "tu-api-key",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-id",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "tu-app-id"
  }
};
```

## Paso 4: Configurar Estilos Globales

### src/styles.scss

```scss
/* Variables de tema oscuro tipo ESPN */
:root {
  --color-primary: #06090F;
  --color-secondary: #1A1D29;
  --color-accent: #00D9FF;
  --color-success: #00FF87;
  --color-warning: #FFB800;
  --color-danger: #FF3838;
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #B0B3B8;
  --color-border: #2A2D3A;
  --color-hover: #252836;
  
  --font-primary: 'Bebas Neue', sans-serif;
  --font-secondary: 'Barlow', sans-serif;
  
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  --border-radius: 8px;
  --transition: all 0.3s ease;
}

/* Reset y estilos base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-secondary);
  background-color: var(--color-primary);
  color: var(--color-text-primary);
  line-height: 1.6;
  overflow-x: hidden;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-primary);
  font-weight: 700;
  letter-spacing: 1px;
}

a {
  color: var(--color-accent);
  text-decoration: none;
  transition: var(--transition);
  
  &:hover {
    color: var(--color-success);
  }
}

/* Scrollbar personalizado */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
  
  &:hover {
    background: var(--color-accent);
  }
}

/* Utilidades */
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.card {
  background: var(--color-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
  transition: var(--transition);
  
  &:hover {
    border-color: var(--color-accent);
    transform: translateY(-2px);
  }
}

.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--border-radius);
  font-family: var(--font-primary);
  font-size: 16px;
  cursor: pointer;
  transition: var(--transition);
  
  &-primary {
    background: var(--color-accent);
    color: var(--color-primary);
    
    &:hover {
      background: var(--color-success);
    }
  }
  
  &-secondary {
    background: var(--color-secondary);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);
    
    &:hover {
      border-color: var(--color-accent);
    }
  }
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  
  &-success {
    background: var(--color-success);
    color: var(--color-primary);
  }
  
  &-warning {
    background: var(--color-warning);
    color: var(--color-primary);
  }
  
  &-danger {
    background: var(--color-danger);
    color: white;
  }
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.pulse {
  animation: pulse 2s infinite;
}
```

## Paso 5: Estructura de Carpetas

```
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   └── admin.guard.ts
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts
│   │   ├── models/
│   │   │   ├── partido.model.ts
│   │   │   ├── equipo.model.ts
│   │   │   ├── jugador.model.ts
│   │   │   └── evento.model.ts
│   │   └── services/
│   │       ├── auth.service.ts
│   │       ├── api.service.ts
│   │       ├── signalr.service.ts
│   │       ├── liga.service.ts
│   │       ├── partidos.service.ts
│   │       └── goleadores.service.ts
│   ├── features/
│   │   ├── dashboard/
│   │   │   └── dashboard.component.ts
│   │   ├── liga/
│   │   │   ├── liga.component.ts
│   │   │   └── tabla-posiciones/
│   │   │       └── tabla-posiciones.component.ts
│   │   ├── partidos/
│   │   │   ├── partidos-en-vivo/
│   │   │   │   └── partidos-en-vivo.component.ts
│   │   │   └── partido-detalle/
│   │   │       └── partido-detalle.component.ts
│   │   ├── goleadores/
│   │   │   └── goleadores.component.ts
│   │   └── auth/
│   │       └── login/
│   │           └── login.component.ts
│   ├── shared/
│   │   ├── components/
│   │   │   ├── navbar/
│   │   │   │   └── navbar.component.ts
│   │   │   ├── card-partido/
│   │   │   │   └── card-partido.component.ts
│   │   │   └── loading/
│   │   │       └── loading.component.ts
│   │   └── pipes/
│   │       └── minuto.pipe.ts
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
├── assets/
│   ├── fonts/
│   └── images/
└── environments/
    ├── environment.ts
    └── environment.prod.ts
```

## Paso 6: Configurar Routing

### src/app/app.routes.ts

```typescript
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'liga',
    loadComponent: () => import('./features/liga/liga.component').then(m => m.LigaComponent)
  },
  {
    path: 'partidos',
    loadComponent: () => import('./features/partidos/partidos-en-vivo/partidos-en-vivo.component').then(m => m.PartidosEnVivoComponent)
  },
  {
    path: 'partidos/:id',
    loadComponent: () => import('./features/partidos/partido-detalle/partido-detalle.component').then(m => m.PartidoDetalleComponent)
  },
  {
    path: 'goleadores',
    loadComponent: () => import('./features/goleadores/goleadores.component').then(m => m.GoleadoresComponent)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
```

## Paso 7: Configurar App Config

### src/app/app.config.ts

```typescript
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
```

## Próximos Pasos

Una vez completada esta configuración inicial, continúa con:

1. **Implementar Core Services** (Auth, API, SignalR)
2. **Crear Guards e Interceptors**
3. **Implementar Componentes de Features**
4. **Agregar Estilos Específicos**
5. **Integrar SignalR para Tiempo Real**
6. **Implementar Firebase Cloud Messaging**

Consulta los siguientes documentos para cada paso:
- `FRONTEND_SERVICES.md` - Implementación de servicios
- `FRONTEND_COMPONENTS.md` - Implementación de componentes
- `FRONTEND_SIGNALR.md` - Integración de SignalR

## Comandos Útiles

```bash
# Ejecutar en desarrollo
ng serve

# Compilar para producción
ng build --configuration production

# Ejecutar tests
ng test

# Generar componente
ng generate component features/nombre-componente --standalone

# Generar servicio
ng generate service core/services/nombre-servicio
```

## Notas Importantes

- Usa **standalone components** en todo el proyecto
- Usa **Angular Signals** para estado reactivo
- Implementa **lazy loading** para todas las rutas
- Mantén los componentes **pequeños y enfocados**
- Usa **SCSS modules** para estilos específicos de componentes
- Implementa **error handling** en todos los servicios
- Agrega **loading states** en todas las operaciones asíncronas
