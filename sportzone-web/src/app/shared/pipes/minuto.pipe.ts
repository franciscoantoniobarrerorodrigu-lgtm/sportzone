import { Pipe, PipeTransform } from '@angular/core';

/**
 * MinutoPipe - Transforma segundos o minutos a formato MM:SS
 * 
 * @example
 * {{ 45 | minuto }} => "45:00" (input en minutos por defecto)
 * {{ 2730 | minuto:'seconds' }} => "45:30" (input en segundos)
 * {{ 90 | minuto }} => "90:00"
 */
@Pipe({
  name: 'minuto',
  standalone: true,
  pure: true
})
export class MinutoPipe implements PipeTransform {
  
  /**
   * Transforma un valor numérico a formato MM:SS
   * 
   * @param value - Número de minutos o segundos
   * @param unit - Unidad del valor de entrada: 'minutes' (default) o 'seconds'
   * @returns String en formato MM:SS
   */
  transform(value: number | null | undefined, unit: 'minutes' | 'seconds' = 'minutes'): string {
    // Manejar casos edge: null, undefined, NaN
    if (value == null || isNaN(value)) {
      return '00:00';
    }

    // Manejar números negativos
    if (value < 0) {
      return '00:00';
    }

    let totalSeconds: number;
    
    // Convertir a segundos si es necesario
    if (unit === 'minutes') {
      totalSeconds = Math.floor(value * 60);
    } else {
      totalSeconds = Math.floor(value);
    }

    // Calcular minutos y segundos
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    // Formatear con padding de ceros
    const minutesStr = minutes.toString().padStart(2, '0');
    const secondsStr = seconds.toString().padStart(2, '0');

    return `${minutesStr}:${secondsStr}`;
  }
}
