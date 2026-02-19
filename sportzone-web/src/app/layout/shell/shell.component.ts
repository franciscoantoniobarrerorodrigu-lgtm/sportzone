import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    <div class="shell-container">
      <app-navbar />
      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .shell-container {
      min-height: 100vh;
      background: #06090F;
      display: flex;
      flex-direction: column;
    }

    .main-content {
      flex: 1;
      padding: 2rem;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
    }

    @media (max-width: 768px) {
      .main-content {
        padding: 1rem;
      }
    }
  `]
})
export class ShellComponent {}
