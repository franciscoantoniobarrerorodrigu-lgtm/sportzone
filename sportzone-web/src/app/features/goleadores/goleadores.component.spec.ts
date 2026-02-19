import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GoleadoresComponent } from './goleadores.component';
import { GoleadoresService } from '../../core/services/goleadores.service';

describe('GoleadoresComponent', () => {
  let component: GoleadoresComponent;
  let mockGoleadoresService: any;

  beforeEach(() => {
    mockGoleadoresService = {
      getGoleadores: vi.fn(),
      getAsistidores: vi.fn(),
      getTarjetas: vi.fn()
    };

    component = new GoleadoresComponent();
    (component as any).goleadoresService = mockGoleadoresService;
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });

  describe('cambiarTab', () => {
    it('should change active tab to goleadores', () => {
      component.cambiarTab('goleadores');
      expect(component.tabActiva()).toBe('goleadores');
    });

    it('should change active tab to asistencias', () => {
      component.cambiarTab('asistencias');
      expect(component.tabActiva()).toBe('asistencias');
    });

    it('should change active tab to amarillas', () => {
      component.cambiarTab('amarillas');
      expect(component.tabActiva()).toBe('amarillas');
    });

    it('should change active tab to rojas', () => {
      component.cambiarTab('rojas');
      expect(component.tabActiva()).toBe('rojas');
    });
  });

  describe('getValorEstadistica', () => {
    const mockJugador = {
      goles: 15,
      asistencias: 10,
      tarjetasAmarillas: 5,
      tarjetasRojas: 2
    };

    it('should return goles when tab is goleadores', () => {
      component.tabActiva.set('goleadores');
      expect(component.getValorEstadistica(mockJugador)).toBe(15);
    });

    it('should return asistencias when tab is asistencias', () => {
      component.tabActiva.set('asistencias');
      expect(component.getValorEstadistica(mockJugador)).toBe(10);
    });

    it('should return tarjetas amarillas when tab is amarillas', () => {
      component.tabActiva.set('amarillas');
      expect(component.getValorEstadistica(mockJugador)).toBe(5);
    });

    it('should return tarjetas rojas when tab is rojas', () => {
      component.tabActiva.set('rojas');
      expect(component.getValorEstadistica(mockJugador)).toBe(2);
    });

    it('should return 0 when value is undefined', () => {
      component.tabActiva.set('goleadores');
      expect(component.getValorEstadistica({})).toBe(0);
    });
  });

  describe('calcularPorcentaje', () => {
    beforeEach(() => {
      component.datosActuales.set([
        { goles: 20, asistencias: 15 },
        { goles: 15, asistencias: 10 },
        { goles: 10, asistencias: 5 }
      ]);
      component.tabActiva.set('goleadores');
    });

    it('should return 100 for first position', () => {
      const jugador = component.datosActuales()[0];
      expect(component.calcularPorcentaje(jugador, 0)).toBe(100);
    });

    it('should calculate correct percentage for second position', () => {
      const jugador = component.datosActuales()[1];
      expect(component.calcularPorcentaje(jugador, 1)).toBe(75); // 15/20 * 100
    });

    it('should calculate correct percentage for third position', () => {
      const jugador = component.datosActuales()[2];
      expect(component.calcularPorcentaje(jugador, 2)).toBe(50); // 10/20 * 100
    });

    it('should return 0 when max value is 0', () => {
      component.datosActuales.set([
        { goles: 0 },
        { goles: 0 }
      ]);
      const jugador = component.datosActuales()[1];
      expect(component.calcularPorcentaje(jugador, 1)).toBe(0);
    });
  });

  describe('onTorneoChange', () => {
    it('should reload data when torneo changes', () => {
      const cargarDatosSpy = vi.spyOn(component as any, 'cargarDatos');
      component.onTorneoChange();
      expect(cargarDatosSpy).toHaveBeenCalled();
    });
  });
});
