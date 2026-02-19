# Frontend Services - SportZone Pro

## Core Services Implementation

Esta guía cubre la implementación de todos los servicios core del frontend Angular.

## 1. Auth Service

### src/app/core/services/auth.service.ts

```typescript
import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor(private router: Router) {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );

    // Verificar sesión actual
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        this.currentUser.set(session.user);
        this.isAuthenticated.set(true);
      }
    });

    // Escuchar cambios de autenticación
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        this.currentUser.set(session.user);
        this.isAuthenticated.set(true);
      } else {
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
      }
    });
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  }

  async logout() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
    
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  async getAccessToken(): Promise<string | null> {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session?.access_token ?? null;
  }

  getUserRole(): string | null {
    const user = this.currentUser();
    return user?.user_metadata?.['role'] ?? null;
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

  isPlanillero(): boolean {
    return this.getUserRole() === 'planillero';
  }
}
```

## 2. API Service

### src/app/core/services/api.service.ts

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: any) {
    console.error('API Error:', error);
    return throwError(() => error);
  }

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`)
      .pipe(catchError(this.handleError));
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, data)
      .pipe(catchError(this.handleError));
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, data)
      .pipe(catchError(this.handleError));
  }

  patch<T>(endpoint: string, data: any): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}/${endpoint}`, data)
      .pipe(catchError(this.handleError));
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`)
      .pipe(catchError(this.handleError));
  }
}
```

## 3. SignalR Service

### src/app/core/services/signalr.service.ts

```typescript
import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection: signalR.HubConnection | null = null;
  isConnected = signal<boolean>(false);

  constructor() {}

  async startConnection(hubName: string): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.signalRUrl}/${hubName}`)
      .withAutomaticReconnect()
      .build();

    try {
      await this.hubConnection.start();
      this.isConnected.set(true);
      console.log(`SignalR connected to ${hubName}`);
    } catch (err) {
      console.error('SignalR connection error:', err);
      this.isConnected.set(false);
    }

    this.hubConnection.onreconnecting(() => {
      this.isConnected.set(false);
      console.log('SignalR reconnecting...');
    });

    this.hubConnection.onreconnected(() => {
      this.isConnected.set(true);
      console.log('SignalR reconnected');
    });

    this.hubConnection.onclose(() => {
      this.isConnected.set(false);
      console.log('SignalR disconnected');
    });
  }

  async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.isConnected.set(false);
    }
  }

  on(eventName: string, callback: (...args: any[]) => void): void {
    if (this.hubConnection) {
      this.hubConnection.on(eventName, callback);
    }
  }

  off(eventName: string): void {
    if (this.hubConnection) {
      this.hubConnection.off(eventName);
    }
  }

  async invoke(methodName: string, ...args: any[]): Promise<any> {
    if (this.hubConnection) {
      return await this.hubConnection.invoke(methodName, ...args);
    }
  }
}
```

## 4. Liga Service

### src/app/core/services/liga.service.ts

```typescript
import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface PosicionEquipo {
  posicion: number;
  equipoNombre: string;
  escudoUrl?: string;
  partidosJugados: number;
  ganados: number;
  empatados: number;
  perdidos: number;
  golesFavor: number;
  golesContra: number;
  diferencia: number;
  puntos: number;
}

export interface Torneo {
  id: string;
  nombre: string;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LigaService {
  tablaPosiciones = signal<PosicionEquipo[]>([]);
  torneos = signal<Torneo[]>([]);
  torneoActual = signal<Torneo | null>(null);

  constructor(private api: ApiService) {}

  getTorneos(): Observable<any> {
    return this.api.get('liga/torneos').pipe(
      tap((response: any) => {
        if (response.success) {
          this.torneos.set(response.data);
          if (response.data.length > 0) {
            this.torneoActual.set(response.data[0]);
          }
        }
      })
    );
  }

  getTablaPosiciones(torneoId: string): Observable<any> {
    return this.api.get(`liga/posiciones/${torneoId}`).pipe(
      tap((response: any) => {
        if (response.success) {
          this.tablaPosiciones.set(response.data);
        }
      })
    );
  }

  getResultadosJornada(torneoId: string, jornada: number): Observable<any> {
    return this.api.get(`liga/${torneoId}/jornada/${jornada}`);
  }
}
```

## 5. Partidos Service

### src/app/core/services/partidos.service.ts

```typescript
import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { SignalRService } from './signalr.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Partido {
  id: string;
  jornada: number;
  fechaHora: Date;
  estado: string;
  golesLocal: number;
  golesVisita: number;
  equipoLocalNombre: string;
  equipoLocalEscudo?: string;
  equipoVisitaNombre: string;
  equipoVisitaEscudo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PartidosService {
  partidosEnVivo = signal<Partido[]>([]);
  partidoActual = signal<Partido | null>(null);

  constructor(
    private api: ApiService,
    private signalR: SignalRService
  ) {}

  async inicializarSignalR(): Promise<void> {
    await this.signalR.startConnection('partido');

    // Escuchar eventos de SignalR
    this.signalR.on('NuevoEvento', (data: any) => {
      console.log('Nuevo evento:', data);
      this.actualizarPartidoLocal(data.partidoId);
    });

    this.signalR.on('MarcadorActualizado', (data: any) => {
      console.log('Marcador actualizado:', data);
      this.actualizarMarcadorLocal(data.partidoId, data.golesLocal, data.golesVisita);
    });

    this.signalR.on('MinutoActualizado', (data: any) => {
      console.log('Minuto actualizado:', data);
    });

    this.signalR.on('PartidoIniciado', (data: any) => {
      console.log('Partido iniciado:', data);
      this.getPartidosEnVivo().subscribe();
    });

    this.signalR.on('PartidoFinalizado', (data: any) => {
      console.log('Partido finalizado:', data);
      this.getPartidosEnVivo().subscribe();
    });
  }

  getPartidosEnVivo(): Observable<any> {
    return this.api.get('partidos/en-vivo').pipe(
      tap((response: any) => {
        if (response.success) {
          this.partidosEnVivo.set(response.data);
        }
      })
    );
  }

  getPartidoDetalle(id: string): Observable<any> {
    return this.api.get(`partidos/${id}`).pipe(
      tap((response: any) => {
        if (response.success) {
          this.partidoActual.set(response.data);
        }
      })
    );
  }

  async suscribirPartido(partidoId: string): Promise<void> {
    await this.signalR.invoke('SuscribirPartido', partidoId);
  }

  async desuscribirPartido(partidoId: string): Promise<void> {
    await this.signalR.invoke('DesuscribirPartido', partidoId);
  }

  private actualizarPartidoLocal(partidoId: string): void {
    // Actualizar partido en la lista local
    this.getPartidoDetalle(partidoId).subscribe();
  }

  private actualizarMarcadorLocal(partidoId: string, golesLocal: number, golesVisita: number): void {
    const partidos = this.partidosEnVivo();
    const index = partidos.findIndex(p => p.id === partidoId);
    
    if (index !== -1) {
      const partidosActualizados = [...partidos];
      partidosActualizados[index] = {
        ...partidosActualizados[index],
        golesLocal,
        golesVisita
      };
      this.partidosEnVivo.set(partidosActualizados);
    }
  }
}
```

## 6. Goleadores Service

### src/app/core/services/goleadores.service.ts

```typescript
import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Goleador {
  jugadorNombre: string;
  equipoNombre: string;
  goles: number;
  asistencias: number;
  tarjetasAmarillas: number;
  tarjetasRojas: number;
}

@Injectable({
  providedIn: 'root'
})
export class GoleadoresService {
  goleadores = signal<Goleador[]>([]);

  constructor(private api: ApiService) {}

  getGoleadores(torneoId: string): Observable<any> {
    return this.api.get(`goleadores/${torneoId}`).pipe(
      tap((response: any) => {
        if (response.success) {
          this.goleadores.set(response.data);
        }
      })
    );
  }
}
```

## 7. Guards

### src/app/core/guards/auth.guard.ts

```typescript
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
```

### src/app/core/guards/admin.guard.ts

```typescript
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
```

## 8. Interceptor

### src/app/core/interceptors/auth.interceptor.ts

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { from, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return from(authService.getAccessToken()).pipe(
    switchMap(token => {
      if (token) {
        const cloned = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next(cloned);
      }
      return next(req);
    })
  );
};
```

## Uso de los Servicios

### En un Componente

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { LigaService } from '../../core/services/liga.service';
import { PartidosService } from '../../core/services/partidos.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="dashboard">
      <h1>Partidos en Vivo</h1>
      @for (partido of partidosService.partidosEnVivo(); track partido.id) {
        <div class="partido-card">
          <span>{{ partido.equipoLocalNombre }}</span>
          <span>{{ partido.golesLocal }} - {{ partido.golesVisita }}</span>
          <span>{{ partido.equipoVisitaNombre }}</span>
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  ligaService = inject(LigaService);
  partidosService = inject(PartidosService);

  async ngOnInit() {
    // Inicializar SignalR
    await this.partidosService.inicializarSignalR();
    
    // Cargar datos
    this.partidosService.getPartidosEnVivo().subscribe();
    this.ligaService.getTorneos().subscribe();
  }
}
```

## Próximos Pasos

Continúa con la implementación de componentes en `FRONTEND_COMPONENTS.md`.
