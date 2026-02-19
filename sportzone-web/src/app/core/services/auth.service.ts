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
