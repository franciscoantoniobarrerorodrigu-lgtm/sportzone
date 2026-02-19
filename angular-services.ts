// ============================================================
// SportZone Pro — Angular 17 Frontend
// Stack: Angular 17 + Signals + Standalone Components
// ============================================================

// ─────────────────────────────────────────────────────────────
// app.config.ts — App Configuration (standalone)
// ─────────────────────────────────────────────────────────────
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
  ]
};

// ─────────────────────────────────────────────────────────────
// app.routes.ts — Rutas Lazy Loading
// ─────────────────────────────────────────────────────────────
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component')
      .then(m => m.ShellComponent),
    canActivate: [authGuard],
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
        path: 'solicitudes',
        loadComponent: () => import('./features/solicitudes/solicitudes.component')
          .then(m => m.SolicitudesComponent)
      },
      {
        path: 'resoluciones',
        loadComponent: () => import('./features/resoluciones/resoluciones.component')
          .then(m => m.ResolucionesComponent)
      },
      {
        path: 'marketing',
        loadComponent: () => import('./features/marketing/marketing.component')
          .then(m => m.MarketingComponent)
      },
    ]
  },
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/login.component')
      .then(m => m.LoginComponent)
  },
  { path: '**', redirectTo: '' }
];

// ─────────────────────────────────────────────────────────────
// core/services/liga.service.ts
// ─────────────────────────────────────────────────────────────
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';

export interface PosicionEquipo {
  posicion: number;
  equipoId: string;
  equipoNombre: string;
  abreviatura: string;
  escudoUrl: string;
  pj: number; pg: number; pe: number; pp: number;
  gf: number; gc: number;
  puntos: number;
  diferencia: number;
}

@Injectable({ providedIn: 'root' })
export class LigaService {
  private readonly api = `${environment.apiUrl}/liga`;
  
  // Estado reactivo con Signals
  readonly torneoSeleccionado = signal<string | null>(null);
  readonly tabla = signal<PosicionEquipo[]>([]);
  readonly loading = signal(false);

  // Computed: equipos zona clasificación (top 4)
  readonly zonaClasificacion = computed(() =>
    this.tabla().filter(e => e.posicion <= 4)
  );

  // Computed: zona descenso (últimos 3)
  readonly zonaDescenso = computed(() => {
    const t = this.tabla();
    return t.slice(Math.max(0, t.length - 3));
  });

  constructor(private http: HttpClient) {}

  async cargarTabla(torneoId: string): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this.http
        .get<PosicionEquipo[]>(`${this.api}/posiciones/${torneoId}`)
        .toPromise();
      this.tabla.set(data ?? []);
      this.torneoSeleccionado.set(torneoId);
    } finally {
      this.loading.set(false);
    }
  }

  getTorneos() {
    return this.http.get<any[]>(`${this.api}/torneos`);
  }
}

// ─────────────────────────────────────────────────────────────
// core/services/partidos.service.ts — con SignalR para live
// ─────────────────────────────────────────────────────────────
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environments/environment';

export interface PartidoEnVivo {
  id: string;
  equipoLocal: { nombre: string; escudo: string };
  equipoVisita: { nombre: string; escudo: string };
  golesLocal: number;
  golesVisita: number;
  minuto: number;
  estado: string;
  eventos: EventoPartido[];
}

export interface EventoPartido {
  minuto: number;
  tipo: 'gol' | 'tarjeta_amarilla' | 'tarjeta_roja' | 'sustitucion';
  jugador: string;
  equipo: string;
  descripcion?: string;
}

@Injectable({ providedIn: 'root' })
export class PartidosService {
  private readonly api = `${environment.apiUrl}/partidos`;
  private hubConnection?: signalR.HubConnection;

  readonly partidoEnVivo = signal<PartidoEnVivo | null>(null);
  readonly proximosPartidos = signal<any[]>([]);

  constructor(private http: HttpClient) {}

  cargarProximos(dias = 14) {
    return this.http.get<any[]>(`${this.api}/proximos?dias=${dias}`)
      .subscribe(data => this.proximosPartidos.set(data));
  }

  cargarEnVivo() {
    return this.http.get<PartidoEnVivo>(`${this.api}/en-vivo`)
      .subscribe(data => this.partidoEnVivo.set(data));
  }

  // Conectar a SignalR para actualizaciones en tiempo real
  conectarLive(partidoId: string): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.hubUrl}/hubs/partidos`, {
        accessTokenFactory: () => localStorage.getItem('token') ?? ''
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('EventoRegistrado', (evento: EventoPartido) => {
      const actual = this.partidoEnVivo();
      if (actual) {
        this.partidoEnVivo.update(p => p ? {
          ...p,
          eventos: [...p.eventos, evento],
          golesLocal: evento.tipo === 'gol' && evento.equipo === actual.equipoLocal.nombre
            ? p.golesLocal + 1 : p.golesLocal,
          golesVisita: evento.tipo === 'gol' && evento.equipo === actual.equipoVisita.nombre
            ? p.golesVisita + 1 : p.golesVisita,
        } : null);
      }
    });

    this.hubConnection.on('MinutoActualizado', (minuto: number) => {
      this.partidoEnVivo.update(p => p ? { ...p, minuto } : null);
    });

    this.hubConnection.start()
      .then(() => this.hubConnection!.invoke('SuscribirPartido', partidoId))
      .catch(err => console.error('SignalR error:', err));
  }

  desconectarLive(partidoId: string): void {
    this.hubConnection?.invoke('DesuscribirPartido', partidoId);
    this.hubConnection?.stop();
  }
}

// ─────────────────────────────────────────────────────────────
// core/services/solicitudes.service.ts
// ─────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class SolicitudesService {
  private readonly api = `${environment.apiUrl}/solicitudes`;

  readonly solicitudes = signal<any[]>([]);
  readonly loading = signal(false);
  readonly totalPendientes = computed(() =>
    this.solicitudes().filter(s => s.estado === 'pendiente').length
  );

  constructor(private http: HttpClient) {}

  cargar(estado?: string, tipo?: string, page = 1) {
    this.loading.set(true);
    let params = `page=${page}`;
    if (estado) params += `&estado=${estado}`;
    if (tipo) params += `&tipo=${tipo}`;
    
    return this.http.get<any>(`${this.api}?${params}`).subscribe(res => {
      this.solicitudes.set(res.items);
      this.loading.set(false);
    });
  }

  crear(dto: any) {
    return this.http.post(`${this.api}`, dto);
  }

  updateEstado(id: string, estado: string, comentario?: string) {
    return this.http.patch(`${this.api}/${id}/estado`, { estado, comentario });
  }
}

// ─────────────────────────────────────────────────────────────
// core/interceptors/auth.interceptor.ts
// ─────────────────────────────────────────────────────────────
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  if (token) {
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(authReq);
  }
  return next(req);
};

// ─────────────────────────────────────────────────────────────
// core/services/auth.service.ts — Supabase Auth
// ─────────────────────────────────────────────────────────────
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase: SupabaseClient;
  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => !!this.currentUser());

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
    // Restaurar sesión al recargar
    this.supabase.auth.getSession().then(({ data }) => {
      this.currentUser.set(data.session?.user ?? null);
    });
    // Escuchar cambios de auth
    this.supabase.auth.onAuthStateChange((_, session) => {
      this.currentUser.set(session?.user ?? null);
    });
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async logout() {
    await this.supabase.auth.signOut();
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return this.supabase.auth.session?.() ?? null;
    // En versión real: return (await this.supabase.auth.getSession()).data.session?.access_token ?? null
  }
}

// ─────────────────────────────────────────────────────────────
// environments/environment.ts
// ─────────────────────────────────────────────────────────────
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  hubUrl: 'http://localhost:5000',
  supabaseUrl: 'https://TU_PROYECTO.supabase.co',
  supabaseAnonKey: 'TU_ANON_KEY',
};
