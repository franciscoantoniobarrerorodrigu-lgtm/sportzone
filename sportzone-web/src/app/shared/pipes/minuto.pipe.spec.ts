import { MinutoPipe } from './minuto.pipe';

describe('MinutoPipe', () => {
  let pipe: MinutoPipe;

  beforeEach(() => {
    pipe = new MinutoPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('minutes input (default)', () => {
    it('should transform 45 minutes to "45:00"', () => {
      expect(pipe.transform(45)).toBe('45:00');
    });

    it('should transform 90 minutes to "90:00"', () => {
      expect(pipe.transform(90)).toBe('90:00');
    });

    it('should transform 0 minutes to "00:00"', () => {
      expect(pipe.transform(0)).toBe('00:00');
    });

    it('should transform 1 minute to "01:00"', () => {
      expect(pipe.transform(1)).toBe('01:00');
    });

    it('should transform 120 minutes to "120:00"', () => {
      expect(pipe.transform(120)).toBe('120:00');
    });
  });

  describe('seconds input', () => {
    it('should transform 2730 seconds to "45:30"', () => {
      expect(pipe.transform(2730, 'seconds')).toBe('45:30');
    });

    it('should transform 0 seconds to "00:00"', () => {
      expect(pipe.transform(0, 'seconds')).toBe('00:00');
    });

    it('should transform 60 seconds to "01:00"', () => {
      expect(pipe.transform(60, 'seconds')).toBe('01:00');
    });

    it('should transform 90 seconds to "01:30"', () => {
      expect(pipe.transform(90, 'seconds')).toBe('01:30');
    });

    it('should transform 3599 seconds to "59:59"', () => {
      expect(pipe.transform(3599, 'seconds')).toBe('59:59');
    });

    it('should transform 3600 seconds to "60:00"', () => {
      expect(pipe.transform(3600, 'seconds')).toBe('60:00');
    });
  });

  describe('edge cases', () => {
    it('should handle null and return "00:00"', () => {
      expect(pipe.transform(null)).toBe('00:00');
    });

    it('should handle undefined and return "00:00"', () => {
      expect(pipe.transform(undefined)).toBe('00:00');
    });

    it('should handle negative numbers and return "00:00"', () => {
      expect(pipe.transform(-10)).toBe('00:00');
    });

    it('should handle NaN and return "00:00"', () => {
      expect(pipe.transform(NaN)).toBe('00:00');
    });

    it('should handle decimal numbers by flooring', () => {
      // 45.7 minutes = 45 minutes + 0.7*60 = 45 minutes + 42 seconds
      expect(pipe.transform(45.7)).toBe('45:42');
      // 45.7 seconds floored = 45 seconds = 0 minutes + 45 seconds
      expect(pipe.transform(45.7, 'seconds')).toBe('00:45');
    });
  });

  describe('padding', () => {
    it('should pad single digit minutes with zero', () => {
      expect(pipe.transform(5)).toBe('05:00');
    });

    it('should pad single digit seconds with zero', () => {
      expect(pipe.transform(65, 'seconds')).toBe('01:05');
    });

    it('should not pad triple digit minutes', () => {
      expect(pipe.transform(125)).toBe('125:00');
    });
  });
});
