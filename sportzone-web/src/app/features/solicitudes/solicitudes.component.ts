import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitudesService, Solicitud, CreateSolicitudDto } from '../../core/services/solicitudes.service';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitudes.component.html',
  styleUrls: ['./solicitudes.component.scss']
})
export class SolicitudesComponent implements OnInit {
  solicitudesService = inject(SolicitudesService);

  solicitudes = this.solicitudesService.solicitudes;
  loading = this.solicitudesService.loading;
  totalSolicitudes = this.solicitudesService.totalSolicitudes;

  filtroEstado = signal<string>('');
  filtroTipo = signal<string>('');
  paginaActual = signal<number>(1);
  pageSize = 20;

  mostrarFormulario = signal<boolean>(false);
  guardando = signal<boolean>(false);

  nuevaSolicitud: CreateSolicitudDto = {
    tipo: '',
    titulo: '',
    descripcion: '',
    solicitante: '',
    equipoId: undefined,
    monto: undefined,
    prioridad: 'media'
  };

  ngOnInit() {
    this.cargarSolicitudes();
  }

  cargarSolicitudes() {
    this.solicitudesService.getSolicitudes(
      this.filtroEstado() || undefined,
      this.filtroTipo() || undefined,
      this.paginaActual(),
      this.pageSize
    ).subscribe();
  }

  aplicarFiltros() {
    this.paginaActual.set(1);
    this.cargarSolicitudes();
  }

  cambiarPagina(pagina: number) {
    this.paginaActual.set(pagina);
    this.cargarSolicitudes();
  }

  totalPages(): number {
    return Math.ceil(this.totalSolicitudes() / this.pageSize);
  }

  abrirFormularioCrear() {
    this.mostrarFormulario.set(true);
    this.resetFormulario();
  }

  cerrarFormulario() {
    this.mostrarFormulario.set(false);
    this.resetFormulario();
  }

  resetFormulario() {
    this.nuevaSolicitud = {
      tipo: '',
      titulo: '',
      descripcion: '',
      solicitante: '',
      equipoId: undefined,
      monto: undefined,
      prioridad: 'media'
    };
  }

  crearSolicitud() {
    if (!this.nuevaSolicitud.tipo || !this.nuevaSolicitud.titulo) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    this.guardando.set(true);
    this.solicitudesService.createSolicitud(this.nuevaSolicitud).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarFormulario();
        this.cargarSolicitudes();
        alert('Solicitud creada exitosamente');
      },
      error: (err) => {
        this.guardando.set(false);
        console.error('Error al crear solicitud:', err);
        alert('Error al crear la solicitud');
      }
    });
  }

  aprobarSolicitud(solicitud: Solicitud) {
    if (!confirm('¿Está seguro de aprobar la solicitud "' + solicitud.titulo + '"?')) {
      return;
    }

    this.solicitudesService.updateEstado(solicitud.id, { estado: 'aprobado' }).subscribe({
      next: () => {
        this.cargarSolicitudes();
        alert('Solicitud aprobada exitosamente');
      },
      error: (err) => {
        console.error('Error al aprobar solicitud:', err);
        alert('Error al aprobar la solicitud');
      }
    });
  }

  rechazarSolicitud(solicitud: Solicitud) {
    if (!confirm('¿Está seguro de rechazar la solicitud "' + solicitud.titulo + '"?')) {
      return;
    }

    this.solicitudesService.updateEstado(solicitud.id, { estado: 'rechazado' }).subscribe({
      next: () => {
        this.cargarSolicitudes();
        alert('Solicitud rechazada');
      },
      error: (err) => {
        console.error('Error al rechazar solicitud:', err);
        alert('Error al rechazar la solicitud');
      }
    });
  }

  verDetalle(solicitud: Solicitud) {
    console.log('Ver detalle:', solicitud);
  }

  getTipoLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'marketing': 'Marketing',
      'traspaso': 'Traspaso',
      'patrocinio': 'Patrocinio',
      'medios': 'Medios',
      'disciplina': 'Disciplina',
      'administrativa': 'Administrativa',
      'tecnica': 'Técnica'
    };
    return labels[tipo] || tipo;
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'pendiente': 'Pendiente',
      'en_revision': 'En Revisión',
      'aprobado': 'Aprobado',
      'rechazado': 'Rechazado',
      'cancelado': 'Cancelado'
    };
    return labels[estado] || estado;
  }

  getPrioridadLabel(prioridad: string): string {
    const labels: Record<string, string> = {
      'baja': 'Baja',
      'media': 'Media',
      'alta': 'Alta',
      'urgente': 'Urgente'
    };
    return labels[prioridad] || prioridad;
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}
