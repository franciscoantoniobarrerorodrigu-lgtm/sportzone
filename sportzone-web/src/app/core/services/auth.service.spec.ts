import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn()
}));

// Mock Router
const mockRouter = {
  navigate: vi.fn()
};

describe('AuthService', () => {
  let service: AuthService;
  let mockSupabase: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock Supabase client
    mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: null }
        }),
        onAuthStateChange: vi.fn().mockReturnValue({
          data: { subscription: { unsubscribe: vi.fn() } }
        }),
        signInWithPassword: vi.fn(),
        signOut: vi.fn()
      }
    };

    (createClient as any).mockReturnValue(mockSupabase);

    // Create service instance
    service = new AuthService(mockRouter as any);
  });

  it('should create an instance', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should call signInWithPassword with correct credentials', async () => {
      const mockData = {
        user: { id: '123', email: 'test@example.com' },
        session: { access_token: 'token123' }
      };
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: mockData,
        error: null
      });

      const result = await service.login('test@example.com', 'password123');

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(result).toEqual(mockData);
    });

    it('should throw error when login fails', async () => {
      const mockError = new Error('Invalid credentials');
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: mockError
      });

      await expect(service.login('test@example.com', 'wrong')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should call signOut and navigate to login', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      await service.logout();

      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should throw error when logout fails', async () => {
      const mockError = new Error('Logout failed');
      mockSupabase.auth.signOut.mockResolvedValue({ error: mockError });

      await expect(service.logout()).rejects.toThrow('Logout failed');
    });
  });

  describe('getAccessToken', () => {
    it('should return access token when session exists', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: { access_token: 'token123' }
        }
      });

      const token = await service.getAccessToken();

      expect(token).toBe('token123');
    });

    it('should return null when no session exists', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null }
      });

      const token = await service.getAccessToken();

      expect(token).toBeNull();
    });
  });

  describe('getUserRole', () => {
    it('should return role from user metadata', () => {
      service.currentUser.set({
        id: '123',
        user_metadata: { role: 'admin' }
      } as any);

      expect(service.getUserRole()).toBe('admin');
    });

    it('should return null when no user', () => {
      service.currentUser.set(null);

      expect(service.getUserRole()).toBeNull();
    });

    it('should return null when no role in metadata', () => {
      service.currentUser.set({
        id: '123',
        user_metadata: {}
      } as any);

      expect(service.getUserRole()).toBeNull();
    });
  });

  describe('isAdmin', () => {
    it('should return true when user is admin', () => {
      service.currentUser.set({
        id: '123',
        user_metadata: { role: 'admin' }
      } as any);

      expect(service.isAdmin()).toBe(true);
    });

    it('should return false when user is not admin', () => {
      service.currentUser.set({
        id: '123',
        user_metadata: { role: 'planillero' }
      } as any);

      expect(service.isAdmin()).toBe(false);
    });
  });

  describe('isPlanillero', () => {
    it('should return true when user is planillero', () => {
      service.currentUser.set({
        id: '123',
        user_metadata: { role: 'planillero' }
      } as any);

      expect(service.isPlanillero()).toBe(true);
    });

    it('should return false when user is not planillero', () => {
      service.currentUser.set({
        id: '123',
        user_metadata: { role: 'admin' }
      } as any);

      expect(service.isPlanillero()).toBe(false);
    });
  });
});
