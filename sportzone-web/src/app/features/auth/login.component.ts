import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1 class="logo">
            <span class="logo-text">SPORTZONE</span>
            <span class="logo-pro">PRO</span>
          </h1>
          <p class="subtitle">Sistema de Gestión Deportiva</p>
        </div>

        <form class="login-form" (ngSubmit)="onSubmit()">
          @if (error()) {
            <div class="alert alert-error">
              {{ error() }}
            </div>
          }

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="email"
              placeholder="usuario@ejemplo.com"
              required
              autocomplete="email"
            />
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="password"
              placeholder="••••••••"
              required
              autocomplete="current-password"
            />
          </div>

          <button 
            type="submit" 
            class="btn-submit"
            [disabled]="loading()"
          >
            @if (loading()) {
              <span class="spinner"></span>
              Iniciando sesión...
            } @else {
              Iniciar Sesión
            }
          </button>
        </form>

        <div class="login-footer">
          <a routerLink="/" class="link-back">← Volver al inicio</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #06090F 0%, #0A1628 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }

    .login-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0, 212, 255, 0.03) 2px,
          rgba(0, 212, 255, 0.03) 4px
        );
      pointer-events: none;
    }

    .login-card {
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(0, 212, 255, 0.2);
      border-radius: 12px;
      padding: 3rem;
      width: 100%;
      max-width: 450px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      position: relative;
      z-index: 1;
    }

    .login-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .logo {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .logo-text {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 3rem;
      color: #00D4FF;
      letter-spacing: 3px;
    }

    .logo-pro {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.8rem;
      color: #FFD60A;
    }

    .subtitle {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.95rem;
      margin: 0;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .alert {
      padding: 1rem;
      border-radius: 6px;
      font-size: 0.9rem;
    }

    .alert-error {
      background: rgba(255, 45, 85, 0.1);
      border: 1px solid rgba(255, 45, 85, 0.3);
      color: #FF2D55;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.9rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .form-group input {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(0, 212, 255, 0.2);
      border-radius: 6px;
      padding: 0.9rem 1rem;
      color: white;
      font-size: 1rem;
      transition: all 0.3s;
    }

    .form-group input:focus {
      outline: none;
      border-color: #00D4FF;
      box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
    }

    .form-group input::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }

    .btn-submit {
      background: linear-gradient(135deg, #00D4FF, #0099CC);
      color: white;
      border: none;
      border-radius: 6px;
      padding: 1rem;
      font-family: 'Barlow', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 212, 255, 0.3);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .login-footer {
      margin-top: 2rem;
      text-align: center;
    }

    .link-back {
      color: rgba(255, 255, 255, 0.6);
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.3s;
    }

    .link-back:hover {
      color: #00D4FF;
    }

    @media (max-width: 768px) {
      .login-card {
        padding: 2rem;
      }

      .logo-text {
        font-size: 2.5rem;
      }

      .logo-pro {
        font-size: 1.5rem;
      }
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  async onSubmit() {
    if (!this.email || !this.password) {
      this.error.set('Por favor completa todos los campos');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      await this.authService.login(this.email, this.password);
      
      // Redirigir según rol
      const role = this.authService.getUserRole();
      if (role === 'admin') {
        this.router.navigate(['/dashboard']);
      } else if (role === 'planillero') {
        this.router.navigate(['/planillero']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    } catch (err: any) {
      console.error('Error de login:', err);
      this.error.set(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      this.loading.set(false);
    }
  }
}
