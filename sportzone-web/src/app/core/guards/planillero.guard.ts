import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const planilleroGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser();
  const role = user?.user_metadata?.['role'];

  // Permitir acceso a admin y planillero
  if (role === 'admin' || role === 'planillero') {
    return true;
  }

  // Redirigir al login si no está autenticado
  if (!user) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Redirigir al dashboard si no tiene permisos
  router.navigate(['/dashboard']);
  return false;
};
