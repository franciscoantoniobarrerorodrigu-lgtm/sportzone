import { FechaPipe } from './fecha.pipe';

describe('FechaPipe', () => {
  let pipe: FechaPipe;
  let testDate: Date;

  beforeEach(() => {
    pipe = new FechaPipe();
    // Lunes, 12 de enero de 2025, 14:30:00
    testDate = new Date(2025, 0, 12, 14, 30, 0);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('format: short', () => {
    it('should format date as "12 ene 2025"', () => {
      expect(pipe.transform(testDate, 'short')).toBe('12 ene 2025');
    });

    it('should use short format by default', () => {
      expect(pipe.transform(testDate)).toBe('12 ene 2025');
    });
  });

  describe('format: medium', () => {
    it('should format date as "12 enero 2025"', () => {
      expect(pipe.transform(testDate, 'medium')).toBe('12 enero 2025');
    });
  });

  describe('format: long', () => {
    it('should format date as "12 de enero de 2025"', () => {
      expect(pipe.transform(testDate, 'long')).toBe('12 de enero de 2025');
    });
  });

  describe('format: full', () => {
    it('should format date as "Domingo, 12 de enero de 2025"', () => {
      // Note: January 12, 2025 is actually a Sunday
      const sunday = new Date(2025, 0, 12, 14, 30, 0);
      expect(pipe.transform(sunday, 'full')).toBe('Domingo, 12 de enero de 2025');
    });

    it('should format Monday correctly', () => {
      const monday = new Date(2025, 0, 13, 14, 30, 0);
      expect(pipe.transform(monday, 'full')).toBe('Lunes, 13 de enero de 2025');
    });
  });

  describe('format: time', () => {
    it('should format time as "14:30"', () => {
      expect(pipe.transform(testDate, 'time')).toBe('14:30');
    });

    it('should pad single digit hours', () => {
      const morning = new Date(2025, 0, 12, 9, 5, 0);
      expect(pipe.transform(morning, 'time')).toBe('09:05');
    });

    it('should format midnight correctly', () => {
      const midnight = new Date(2025, 0, 12, 0, 0, 0);
      expect(pipe.transform(midnight, 'time')).toBe('00:00');
    });
  });

  describe('format: datetime', () => {
    it('should format datetime as "12 ene 2025, 14:30"', () => {
      expect(pipe.transform(testDate, 'datetime')).toBe('12 ene 2025, 14:30');
    });
  });

  describe('input types', () => {
    it('should accept Date object', () => {
      expect(pipe.transform(testDate, 'short')).toBe('12 ene 2025');
    });

    it('should accept ISO string', () => {
      const isoString = testDate.toISOString();
      const result = pipe.transform(isoString, 'short');
      expect(result).toContain('ene 2025');
    });

    it('should accept timestamp number', () => {
      const timestamp = testDate.getTime();
      expect(pipe.transform(timestamp, 'short')).toBe('12 ene 2025');
    });
  });

  describe('edge cases', () => {
    it('should handle null and return empty string', () => {
      expect(pipe.transform(null)).toBe('');
    });

    it('should handle undefined and return empty string', () => {
      expect(pipe.transform(undefined)).toBe('');
    });

    it('should handle invalid date string and return empty string', () => {
      expect(pipe.transform('invalid-date')).toBe('');
    });

    it('should handle invalid date object and return empty string', () => {
      const invalidDate = new Date('invalid');
      expect(pipe.transform(invalidDate)).toBe('');
    });
  });

  describe('all months', () => {
    it('should format all months correctly in short format', () => {
      const months = [
        'ene', 'feb', 'mar', 'abr', 'may', 'jun',
        'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
      ];

      months.forEach((month, index) => {
        const date = new Date(2025, index, 15);
        const result = pipe.transform(date, 'short');
        expect(result).toContain(month);
      });
    });

    it('should format all months correctly in medium format', () => {
      const months = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];

      months.forEach((month, index) => {
        const date = new Date(2025, index, 15);
        const result = pipe.transform(date, 'medium');
        expect(result).toContain(month);
      });
    });
  });

  describe('all days of week', () => {
    it('should format all days of week correctly', () => {
      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      
      // Week starting January 12, 2025 (Sunday)
      days.forEach((day, index) => {
        const date = new Date(2025, 0, 12 + index);
        const result = pipe.transform(date, 'full');
        expect(result).toContain(day);
      });
    });
  });
});
