import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(() => {
    mockAuthService = {
      login: vi.fn(),
      getUserRole: vi.fn()
    };

    mockRouter = {
      navigate: vi.fn()
    };

    // Create component instance with mocked dependencies
    component = new LoginComponent();
    (component as any).authService = mockAuthService;
    (component as any).router = mockRouter;
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });

  describe('onSubmit', () => {
    it('should show error when email is empty', async () => {
      component.email = '';
      component.password = 'password123';

      await component.onSubmit();

      expect(component.error()).toBe('Por favor completa todos los campos');
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should show error when password is empty', async () => {
      component.email = 'test@example.com';
      component.password = '';

      await component.onSubmit();

      expect(component.error()).toBe('Por favor completa todos los campos');
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should set loading to true during login', async () => {
      component.email = 'test@example.com';
      component.password = 'password123';

      mockAuthService.login.mockImplementation(() => {
        expect(component.loading()).toBe(true);
        return Promise.resolve();
      });

      await component.onSubmit();
    });

    it('should navigate to dashboard for admin role', async () => {
      component.email = 'admin@example.com';
      component.password = 'password123';

      mockAuthService.login.mockResolvedValue(undefined);
      mockAuthService.getUserRole.mockReturnValue('admin');

      await component.onSubmit();

      expect(mockAuthService.login).toHaveBeenCalledWith('admin@example.com', 'password123');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBeNull();
    });

    it('should navigate to planillero for planillero role', async () => {
      component.email = 'planillero@example.com';
      component.password = 'password123';

      mockAuthService.login.mockResolvedValue(undefined);
      mockAuthService.getUserRole.mockReturnValue('planillero');

      await component.onSubmit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/planillero']);
    });

    it('should navigate to dashboard for other roles', async () => {
      component.email = 'user@example.com';
      component.password = 'password123';

      mockAuthService.login.mockResolvedValue(undefined);
      mockAuthService.getUserRole.mockReturnValue('arbitro');

      await component.onSubmit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should show error message on login failure', async () => {
      component.email = 'test@example.com';
      component.password = 'wrongpassword';

      const errorMessage = 'Invalid credentials';
      mockAuthService.login.mockRejectedValue(new Error(errorMessage));

      await component.onSubmit();

      expect(component.error()).toBe(errorMessage);
      expect(component.loading()).toBe(false);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should show generic error when error has no message', async () => {
      component.email = 'test@example.com';
      component.password = 'password123';

      mockAuthService.login.mockRejectedValue({});

      await component.onSubmit();

      expect(component.error()).toBe('Error al iniciar sesión. Verifica tus credenciales.');
      expect(component.loading()).toBe(false);
    });

    it('should clear previous error on new submit', async () => {
      component.email = 'test@example.com';
      component.password = 'password123';
      component.error.set('Previous error');

      mockAuthService.login.mockResolvedValue(undefined);
      mockAuthService.getUserRole.mockReturnValue('admin');

      await component.onSubmit();

      expect(component.error()).toBeNull();
    });
  });
});
