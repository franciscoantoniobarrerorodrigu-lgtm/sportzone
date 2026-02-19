import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { planilleroGuard } from './core/guards/planillero.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component')
      .then(m => m.ShellComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'liga',
        loadComponent: () => import('./features/liga/liga.component')
          .then(m => m.LigaComponent)
      },
      {
        path: 'goleadores',
        loadComponent: () => import('./features/goleadores/goleadores.component')
          .then(m => m.GoleadoresComponent)
      },
      {
        path: 'cronograma',
        loadComponent: () => import('./features/cronograma/cronograma.component')
          .then(m => m.CronogramaComponent)
      },
      {
        path: 'partidos/:id/live',
        loadComponent: () => import('./features/partido-live/partido-live.component')
          .then(m => m.PartidoLiveComponent)
      },
      {
        path: 'partidos/:id/marcador',
        loadComponent: () => import('./features/partido-live/marcador-publico.component')
          .then(m => m.MarcadorPublicoComponent)
      },
      {
        path: 'solicitudes',
        loadComponent: () => import('./features/solicitudes/solicitudes.component')
          .then(m => m.SolicitudesComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'resoluciones',
        loadComponent: () => import('./features/resoluciones/resoluciones.component')
          .then(m => m.ResolucionesComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'admin/partidos',
        loadComponent: () => import('./features/admin/admin-partidos.component')
          .then(m => m.AdminPartidosComponent),
        canActivate: [adminGuard]
      }
    ]
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'planillero',
    loadComponent: () => import('./features/planillero/planillero.component')
      .then(m => m.PlanilleroComponent),
    canActivate: [planilleroGuard]
  },
  {
    path: 'planillero/:id',
    loadComponent: () => import('./features/planillero/planillero.component')
      .then(m => m.PlanilleroComponent),
    canActivate: [planilleroGuard]
  },
  { path: '**', redirectTo: '' }
];
