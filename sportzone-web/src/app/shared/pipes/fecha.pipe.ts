import { Pipe, PipeTransform } from '@angular/core';

/**
 * FechaPipe - Transforma fechas a formato español personalizado
 * 
 * @example
 * {{ fecha | fecha:'short' }} => "12 ene 2025"
 * {{ fecha | fecha:'medium' }} => "12 enero 2025"
 * {{ fecha | fecha:'long' }} => "12 de enero de 2025"
 * {{ fecha | fecha:'full' }} => "Lunes, 12 de enero de 2025"
 * {{ fecha | fecha:'time' }} => "14:30"
 * {{ fecha | fecha:'datetime' }} => "12 ene 2025, 14:30"
 */
@Pipe({
  name: 'fecha',
  standalone: true,
  pure: true
})
export class FechaPipe implements PipeTransform {
  
  private readonly mesesCortos = [
    'ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
  ];

  private readonly mesesLargos = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  private readonly diasSemana = [
    'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
  ];

  /**
   * Transforma una fecha a formato español
   * 
   * @param value - Date object, ISO string, o timestamp
   * @param format - Formato deseado: 'short' | 'medium' | 'long' | 'full' | 'time' | 'datetime'
   * @returns String formateado en español
   */
  transform(
    value: Date | string | number | null | undefined,
    format: 'short' | 'medium' | 'long' | 'full' | 'time' | 'datetime' = 'short'
  ): string {
    // Manejar casos edge: null, undefined
    if (value == null) {
      return '';
    }

    // Convertir a Date object
    let date: Date;
    
    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string') {
      date = new Date(value);
    } else if (typeof value === 'number') {
      date = new Date(value);
    } else {
      return '';
    }

    // Validar fecha
    if (isNaN(date.getTime())) {
      return '';
    }

    // Formatear según el tipo solicitado
    switch (format) {
      case 'short':
        return this.formatShort(date);
      
      case 'medium':
        return this.formatMedium(date);
      
      case 'long':
        return this.formatLong(date);
      
      case 'full':
        return this.formatFull(date);
      
      case 'time':
        return this.formatTime(date);
      
      case 'datetime':
        return this.formatDateTime(date);
      
      default:
        return this.formatShort(date);
    }
  }

  /**
   * Formato corto: "12 ene 2025"
   */
  private formatShort(date: Date): string {
    const dia = date.getDate();
    const mes = this.mesesCortos[date.getMonth()];
    const anio = date.getFullYear();
    
    return `${dia} ${mes} ${anio}`;
  }

  /**
   * Formato medio: "12 enero 2025"
   */
  private formatMedium(date: Date): string {
    const dia = date.getDate();
    const mes = this.mesesLargos[date.getMonth()];
    const anio = date.getFullYear();
    
    return `${dia} ${mes} ${anio}`;
  }

  /**
   * Formato largo: "12 de enero de 2025"
   */
  private formatLong(date: Date): string {
    const dia = date.getDate();
    const mes = this.mesesLargos[date.getMonth()];
    const anio = date.getFullYear();
    
    return `${dia} de ${mes} de ${anio}`;
  }

  /**
   * Formato completo: "Lunes, 12 de enero de 2025"
   */
  private formatFull(date: Date): string {
    const diaSemana = this.diasSemana[date.getDay()];
    const dia = date.getDate();
    const mes = this.mesesLargos[date.getMonth()];
    const anio = date.getFullYear();
    
    return `${diaSemana}, ${dia} de ${mes} de ${anio}`;
  }

  /**
   * Formato hora: "14:30"
   */
  private formatTime(date: Date): string {
    const horas = date.getHours().toString().padStart(2, '0');
    const minutos = date.getMinutes().toString().padStart(2, '0');
    
    return `${horas}:${minutos}`;
  }

  /**
   * Formato fecha y hora: "12 ene 2025, 14:30"
   */
  private formatDateTime(date: Date): string {
    const fechaCorta = this.formatShort(date);
    const hora = this.formatTime(date);
    
    return `${fechaCorta}, ${hora}`;
  }
}
