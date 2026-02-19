import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeTipo = 'solicitud' | 'resolucion' | 'partido' | 'suspension' | 'general';
export type BadgeSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-badge-estado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge-estado.component.html',
  styleUrls: ['./badge-estado.component.scss']
})
export class BadgeEstadoComponent {
  @Input({ required: true }) estado!: string;
  @Input() tipo: BadgeTipo = 'general';
  @Input() size: BadgeSize = 'medium';

  get badgeClass(): string {
    const estadoLower = this.estado.toLowerCase();
    
    // Color mapping based on tipo and estado
    switch (this.tipo) {
      case 'solicitud':
        return this.getSolicitudClass(estadoLower);
      case 'resolucion':
        return this.getResolucionClass(estadoLower);
      case 'partido':
        return this.getPartidoClass(estadoLower);
      case 'suspension':
        return this.getSuspensionClass(estadoLower);
      default:
        return this.getGeneralClass(estadoLower);
    }
  }

  private getSolicitudClass(estado: string): string {
    const mapping: Record<string, string> = {
      'pendiente': 'warning',
      'en_revision': 'info',
      'aprobado': 'success',
      'rechazado': 'danger',
      'cancelado': 'secondary'
    };
    return mapping[estado] || 'secondary';
  }

  private getResolucionClass(estado: string): string {
    const mapping: Record<string, string> = {
      'borrador': 'secondary',
      'emitida': 'success',
      'apelada': 'warning',
      'resuelta': 'info',
      'anulada': 'danger'
    };
    return mapping[estado] || 'secondary';
  }

  private getPartidoClass(estado: string): string {
    const mapping: Record<string, string> = {
      'programado': 'info',
      'en_curso': 'live',
      'medio_tiempo': 'warning',
      'finalizado': 'success',
      'suspendido': 'danger',
      'cancelado': 'secondary'
    };
    return mapping[estado] || 'secondary';
  }

  private getSuspensionClass(estado: string): string {
    const mapping: Record<string, string> = {
      'activa': 'danger',
      'cumplida': 'success',
      'anulada': 'secondary'
    };
    return mapping[estado] || 'secondary';
  }

  private getGeneralClass(estado: string): string {
    // Generic color mapping
    if (estado.includes('activ') || estado.includes('en_curso') || estado.includes('vivo')) {
      return 'live';
    }
    if (estado.includes('finaliz') || estado.includes('complet') || estado.includes('aprobad')) {
      return 'success';
    }
    if (estado.includes('pendiente') || estado.includes('revision')) {
      return 'warning';
    }
    if (estado.includes('rechaz') || estado.includes('cancel') || estado.includes('suspendid')) {
      return 'danger';
    }
    return 'info';
  }

  get displayText(): string {
    return this.estado.replace(/_/g, ' ').toUpperCase();
  }
}
