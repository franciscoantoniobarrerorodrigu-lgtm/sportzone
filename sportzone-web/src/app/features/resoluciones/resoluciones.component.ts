import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResolucionesService, Resolucion, CreateResolucionDto } from '../../core/services/resoluciones.service';

@Component({
  selector: 'app-resoluciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resoluciones.component.html',
  styleUrls: ['./resoluciones.component.scss']
})
export class ResolucionesComponent implements OnInit {
  resolucionesService = inject(ResolucionesService);

  resoluciones = this.resolucionesService.resoluciones;
  loading = this.resolucionesService.loading;
  totalResoluciones = this.resolucionesService.totalResoluciones;

  filtroTipo = signal<string>('');
  filtroEstado = signal<string>('');
  paginaActual = signal<number>(1);
  pageSize = 20;

  mostrarFormulario = signal<boolean>(false);
  guardando = signal<boolean>(false);

  nuevaResolucion: CreateResolucionDto = {
    tipo: '',
    asunto: '',
    motivo: '',
    sancionTipo: '',
    sancionValor: undefined,
    equipoId: undefined,
    jugadorId: undefined,
    partidoId: undefined,
    solicitudId: undefined
  };

  ngOnInit() {
    this.cargarResoluciones();
  }

  cargarResoluciones() {
    this.resolucionesService.getResoluciones(
      this.filtroTipo() || undefined,
      this.filtroEstado() || undefined,
      this.paginaActual(),
      this.pageSize
    ).subscribe();
  }

  aplicarFiltros() {
    this.paginaActual.set(1);
    this.cargarResoluciones();
  }

  cambiarPagina(pagina: number) {
    this.paginaActual.set(pagina);
    this.cargarResoluciones();
  }

  totalPages(): number {
    return Math.ceil(this.totalResoluciones() / this.pageSize);
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
    this.nuevaResolucion = {
      tipo: '',
      asunto: '',
      motivo: '',
      sancionTipo: '',
      sancionValor: undefined,
      equipoId: undefined,
      jugadorId: undefined,
      partidoId: undefined,
      solicitudId: undefined
    };
  }

  crearResolucion() {
    if (!this.nuevaResolucion.tipo || !this.nuevaResolucion.asunto) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    this.guardando.set(true);
    this.resolucionesService.createResolucion(this.nuevaResolucion).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarFormulario();
        this.cargarResoluciones();
        alert('Resolución creada exitosamente');
      },
      error: (err) => {
        this.guardando.set(false);
        console.error('Error al crear resolución:', err);
        alert('Error al crear la resolución');
      }
    });
  }

  aplicarResolucion(resolucion: Resolucion) {
    if (!confirm(`¿Está seguro de aplicar la resolución ${resolucion.numero}? Esta acción aplicará la sanción automáticamente.`)) {
      return;
    }

    this.resolucionesService.aplicarResolucion(resolucion.id).subscribe({
      next: () => {
        this.cargarResoluciones();
        alert('Resolución aplicada exitosamente');
      },
      error: (err) => {
        console.error('Error al aplicar resolución:', err);
        alert('Error al aplicar la resolución');
      }
    });
  }

  anularResolucion(resolucion: Resolucion) {
    if (!confirm(`¿Está seguro de anular la resolución ${resolucion.numero}? Esta acción revertirá todos los efectos de la sanción.`)) {
      return;
    }

    this.resolucionesService.anularResolucion(resolucion.id).subscribe({
      next: () => {
        this.cargarResoluciones();
        alert('Resolución anulada exitosamente');
      },
      error: (err) => {
        console.error('Error al anular resolución:', err);
        alert('Error al anular la resolución');
      }
    });
  }

  verDetalle(resolucion: Resolucion) {
    // TODO: Implementar modal de detalle
    console.log('Ver detalle:', resolucion);
  }

  getTipoLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'disciplinaria': 'Disciplinaria',
      'administrativa': 'Administrativa',
      'tecnica': 'Técnica'
    };
    return labels[tipo] || tipo;
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'borrador': 'Borrador',
      'emitida': 'Emitida',
      'apelada': 'Apelada',
      'resuelta': 'Resuelta',
      'anulada': 'Anulada'
    };
    return labels[estado] || estado;
  }

  getSancionTipoLabel(tipo?: string): string {
    if (!tipo) return '-';
    const labels: Record<string, string> = {
      'suspension': 'Suspensión',
      'descuento_puntos': 'Descuento de Puntos',
      'multa': 'Multa',
      'wo_tecnico': 'W.O. Técnico',
      'amonestacion': 'Amonestación'
    };
    return labels[tipo] || tipo;
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
