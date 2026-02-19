import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface EventoPartido {
  tipo: 'gol' | 'tarjeta_amarilla' | 'tarjeta_roja' | 'sustitucion' | 'penal' | 'autogol' | 'inicio_partido' | 'medio_tiempo' | 'fin_partido';
  minuto: number;
  jugador?: string;
  equipo: string;
  descripcion?: string;
  asistente?: string;
}

@Component({
  selector: 'app-timeline-evento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline-evento.component.html',
  styleUrls: ['./timeline-evento.component.scss']
})
export class TimelineEventoComponent {
  @Input({ required: true }) evento!: EventoPartido;
  @Input() isLast: boolean = false;

  get eventoIcon(): string {
    const icons: Record<string, string> = {
      'gol': '⚽',
      'tarjeta_amarilla': '🟨',
      'tarjeta_roja': '🟥',
      'sustitucion': '🔄',
      'penal': '⚽',
      'autogol': '⚽',
      'inicio_partido': '🏁',
      'medio_tiempo': '⏸️',
      'fin_partido': '🏁'
    };
    return icons[this.evento.tipo] || '•';
  }

  get eventoClass(): string {
    const classes: Record<string, string> = {
      'gol': 'evento-gol',
      'tarjeta_amarilla': 'evento-amarilla',
      'tarjeta_roja': 'evento-roja',
      'sustitucion': 'evento-sustitucion',
      'penal': 'evento-gol',
      'autogol': 'evento-autogol',
      'inicio_partido': 'evento-inicio',
      'medio_tiempo': 'evento-medio',
      'fin_partido': 'evento-fin'
    };
    return classes[this.evento.tipo] || 'evento-default';
  }

  get eventoLabel(): string {
    const labels: Record<string, string> = {
      'gol': 'GOL',
      'tarjeta_amarilla': 'TARJETA AMARILLA',
      'tarjeta_roja': 'TARJETA ROJA',
      'sustitucion': 'SUSTITUCIÓN',
      'penal': 'PENAL',
      'autogol': 'AUTOGOL',
      'inicio_partido': 'INICIO',
      'medio_tiempo': 'MEDIO TIEMPO',
      'fin_partido': 'FINAL'
    };
    return labels[this.evento.tipo] || this.evento.tipo.toUpperCase();
  }
}
