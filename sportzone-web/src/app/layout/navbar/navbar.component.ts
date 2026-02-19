import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="navbar-container">
        <div class="navbar-brand">
          <a routerLink="/" class="logo">
            <span class="logo-text">SPORTZONE</span>
            <span class="logo-pro">PRO</span>
          </a>
        </div>

        <button class="menu-toggle" (click)="toggleMenu()" [class.active]="menuOpen">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div class="navbar-menu" [class.active]="menuOpen">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
            Dashboard
          </a>
          <a routerLink="/liga" routerLinkActive="active" class="nav-link">
            Liga
          </a>
          <a routerLink="/goleadores" routerLinkActive="active" class="nav-link">
            Goleadores
          </a>
          <a routerLink="/cronograma" routerLinkActive="active" class="nav-link">
            Cronograma
          </a>
          
          @if (authService.isAdmin()) {
            <a routerLink="/solicitudes" routerLinkActive="active" class="nav-link">
              Solicitudes
            </a>
            <a routerLink="/resoluciones" routerLinkActive="active" class="nav-link">
              Resoluciones
            </a>
            <a routerLink="/admin/partidos" routerLinkActive="active" class="nav-link">
              Gestión de Partidos
            </a>
          }
        </div>

        <div class="navbar-actions">
          @if (authService.isAuthenticated()) {
            <div class="user-menu">
              <span class="user-name">{{ authService.currentUser()?.email }}</span>
              <button class="btn-logout" (click)="logout()">Salir</button>
            </div>
          } @else {
            <a routerLink="/auth/login" class="btn-login">Iniciar Sesión</a>
          }
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: rgba(6, 9, 15, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(0, 212, 255, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .navbar-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
    }

    .navbar-brand .logo {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      text-decoration: none;
    }

    .logo-text {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 2rem;
      color: #00D4FF;
      letter-spacing: 2px;
    }

    .logo-pro {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.2rem;
      color: #FFD60A;
    }

    .menu-toggle {
      display: none;
      flex-direction: column;
      gap: 4px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
    }

    .menu-toggle span {
      width: 24px;
      height: 2px;
      background: #00D4FF;
      transition: all 0.3s;
    }

    .menu-toggle.active span:nth-child(1) {
      transform: rotate(45deg) translate(5px, 5px);
    }

    .menu-toggle.active span:nth-child(2) {
      opacity: 0;
    }

    .menu-toggle.active span:nth-child(3) {
      transform: rotate(-45deg) translate(7px, -6px);
    }

    .navbar-menu {
      display: flex;
      gap: 2rem;
      flex: 1;
    }

    .nav-link {
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      font-family: 'Barlow', sans-serif;
      font-size: 1rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1px;
      transition: color 0.3s;
      position: relative;
    }

    .nav-link:hover {
      color: #00D4FF;
    }

    .nav-link.active {
      color: #00D4FF;
    }

    .nav-link.active::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 0;
      right: 0;
      height: 2px;
      background: #00D4FF;
    }

    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-name {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.9rem;
    }

    .btn-login,
    .btn-logout {
      background: linear-gradient(135deg, #00D4FF, #0099CC);
      color: white;
      border: none;
      padding: 0.6rem 1.5rem;
      border-radius: 4px;
      font-family: 'Barlow', sans-serif;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.3s;
    }

    .btn-login:hover,
    .btn-logout:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
    }

    @media (max-width: 768px) {
      .navbar-container {
        padding: 1rem;
      }

      .menu-toggle {
        display: flex;
      }

      .navbar-menu {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: rgba(6, 9, 15, 0.98);
        flex-direction: column;
        padding: 1rem;
        gap: 1rem;
        transform: translateY(-100%);
        opacity: 0;
        pointer-events: none;
        transition: all 0.3s;
      }

      .navbar-menu.active {
        transform: translateY(0);
        opacity: 1;
        pointer-events: all;
      }

      .navbar-actions {
        display: none;
      }
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  private router = inject(Router);
  
  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
