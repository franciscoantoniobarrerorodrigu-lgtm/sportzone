import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminPartidosService, ApiResponse } from '../../core/services/admin-partidos.service';
import { LigaService, Torneo } from '../../core/services/liga.service';
import { 
  PartidoAdmin, 
  CreatePartidoRequest, 
  UpdatePartidoRequest,
  EstadoPartido,
  PartidoFilters
} from '../../core/models/partido-admin.model';

/**
 * Interfaz para equipos
 */
interface Equipo {
  id: string;
  nombre: string;
  abreviatura?: string;
}

/**
 * Componente de administración de partidos
 * Permite crear, editar, listar y eliminar partidos
 */
@Component({
  selector: 'app-admin-partidos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-partidos.component.html',
  styleUrls: ['./admin-partidos.component.scss']
})
export class AdminPartidosComponent implements OnInit {
  private adminPartidosService = inject(AdminPartidosService);
  private ligaService = inject(LigaService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // Signals para estado reactivo
  partidos = signal<PartidoAdmin[]>([]);
  torneos = signal<Torneo[]>([]);
  equipos = signal<Equipo[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  showModal = signal(false);
  showDeleteModal = signal(false);
  editMode = signal(false);
  successMessage = signal<string | null>(null);

  // Paginación
  currentPage = signal(1);
  pageSize = signal(20);
  totalPages = signal(1);
  totalCount = signal(0);

  // Filtros
  filtroTorneoId = signal<string>('');
  filtroEstado = signal<string>('');

  // Partido seleccionado para editar/eliminar
  partidoSeleccionado = signal<PartidoAdmin | null>(null);

  // FormGroup reactivo
  partidoForm!: FormGroup;

  // Estados disponibles
  estadosDisponibles: EstadoPartido[] = ['programado', 'en_curso', 'medio_tiempo', 'finalizado', 'suspendido', 'cancelado'];

  ngOnInit(): void {
    this.initForm();
    this.loadTorneosYEquipos();
    this.loadPartidos();
  }

  /**
   * Inicializa el formulario reactivo con validaciones
   */
  private initForm(): void {
    this.partidoForm = this.fb.group({
      torneoId: ['', Validators.required],
      jornada: [1, [Validators.required, Validators.min(1)]],
      equipoLocalId: ['', Validators.required],
      equipoVisitaId: ['', Validators.required],
      fechaHora: ['', Validators.required],
      estadio: [''],
      estado: ['programado', Validators.required]
    }, {
      validators: this.equiposDiferentesValidator
    });
  }

  /**
   * Validador custom para asegurar que los equipos sean diferentes
   */
  private equiposDiferentesValidator(control: AbstractControl): ValidationErrors | null {
    const equipoLocalId = control.get('equipoLocalId')?.value;
    const equipoVisitaId = control.get('equipoVisitaId')?.value;

    if (equipoLocalId && equipoVisitaId && equipoLocalId === equipoVisitaId) {
      return { equiposIguales: true };
    }

    return null;
  }

  /**
   * Carga la lista de partidos con filtros aplicados
   */
  loadPartidos(): void {
    this.loading.set(true);
    this.error.set(null);

    const filters: PartidoFilters = {
      page: this.currentPage(),
      pageSize: this.pageSize()
    };

    if (this.filtroTorneoId()) {
      filters.torneoId = this.filtroTorneoId();
    }

    if (this.filtroEstado()) {
      filters.estado = this.filtroEstado() as EstadoPartido;
    }

    this.adminPartidosService.getAllPartidos(filters).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success && response.data) {
          this.partidos.set(response.data.items || []);
          this.totalCount.set(response.data.totalCount || 0);
          this.totalPages.set(response.data.totalPages || 1);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar partidos. Intente nuevamente.');
        console.error('Error loading partidos:', err);
        this.loading.set(false);
      }
    });
  }

  /**
   * Carga torneos y equipos para los selectores
   */
  loadTorneosYEquipos(): void {
    // Cargar torneos
    this.ligaService.getTorneos().subscribe({
      next: (torneos: Torneo[]) => {
        this.torneos.set(torneos);
      },
      error: (err) => {
        console.error('Error loading torneos:', err);
      }
    });

    // Cargar equipos desde la tabla de posiciones del primer torneo
    // O desde un endpoint específico si existe
    this.ligaService.getTorneos().subscribe({
      next: (torneos: Torneo[]) => {
        if (torneos.length > 0) {
          this.ligaService.getTablaPosiciones(torneos[0].id).subscribe({
            next: (posiciones: any) => {
              const equiposData = posiciones.map((pos: any) => ({
                id: pos.id,
                nombre: pos.equipoNombre,
                abreviatura: pos.abreviatura
              }));
              this.equipos.set(equiposData);
            },
            error: (err) => {
              console.error('Error loading equipos:', err);
            }
          });
        }
      }
    });
  }

  /**
   * Abre el modal para crear un nuevo partido
   */
  openCreateModal(): void {
    this.editMode.set(false);
    this.partidoSeleccionado.set(null);
    this.partidoForm.reset({
      torneoId: '',
      jornada: 1,
      equipoLocalId: '',
      equipoVisitaId: '',
      fechaHora: '',
      estadio: '',
      estado: 'programado'
    });
    this.showModal.set(true);
  }

  /**
   * Abre el modal para editar un partido existente
   */
  openEditModal(partido: PartidoAdmin): void {
    this.editMode.set(true);
    this.partidoSeleccionado.set(partido);

    // Convertir fecha a formato datetime-local
    const fechaLocal = new Date(partido.fechaHora);
    const fechaStr = fechaLocal.toISOString().slice(0, 16);

    this.partidoForm.patchValue({
      torneoId: partido.torneoId,
      jornada: partido.jornada,
      equipoLocalId: partido.equipoLocalId,
      equipoVisitaId: partido.equipoVisitaId,
      fechaHora: fechaStr,
      estadio: partido.estadio || '',
      estado: partido.estado
    });

    this.showModal.set(true);

    // Mostrar warning si el partido ya finalizó
    if (partido.estado === 'finalizado') {
      this.error.set('Este partido ya finalizó. ¿Está seguro de editarlo?');
    }
  }

  /**
   * Maneja el envío del formulario (crear o editar)
   */
  onSubmit(): void {
    if (this.partidoForm.invalid) {
      this.partidoForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.partidoForm.value;
    
    // Convertir fecha a ISO 8601
    const fechaISO = new Date(formValue.fechaHora).toISOString();

    if (this.editMode()) {
      // Modo edición
      const updateData: UpdatePartidoRequest = {
        torneoId: formValue.torneoId,
        jornada: formValue.jornada,
        equipoLocalId: formValue.equipoLocalId,
        equipoVisitaId: formValue.equipoVisitaId,
        fechaHora: fechaISO,
        estadio: formValue.estadio || undefined,
        estado: formValue.estado
      };

      const partidoId = this.partidoSeleccionado()?.id;
      if (!partidoId) return;

      this.adminPartidosService.updatePartido(partidoId, updateData).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage.set('Partido actualizado exitosamente');
            this.closeModal();
            this.loadPartidos();
            setTimeout(() => this.successMessage.set(null), 3000);
          }
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al actualizar el partido. Intente nuevamente.');
          this.loading.set(false);
        }
      });
    } else {
      // Modo creación
      const createData: CreatePartidoRequest = {
        torneoId: formValue.torneoId,
        jornada: formValue.jornada,
        equipoLocalId: formValue.equipoLocalId,
        equipoVisitaId: formValue.equipoVisitaId,
        fechaHora: fechaISO,
        estadio: formValue.estadio || undefined,
        estado: formValue.estado
      };

      this.adminPartidosService.createPartido(createData).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage.set('Partido creado exitosamente');
            this.closeModal();
            this.loadPartidos();
            setTimeout(() => this.successMessage.set(null), 3000);
          }
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al crear el partido. Intente nuevamente.');
          this.loading.set(false);
        }
      });
    }
  }

  /**
   * Abre el modal de confirmación de eliminación
   */
  confirmDelete(partido: PartidoAdmin): void {
    this.partidoSeleccionado.set(partido);
    this.showDeleteModal.set(true);
  }

  /**
   * Elimina el partido seleccionado
   */
  onDelete(): void {
    const partido = this.partidoSeleccionado();
    if (!partido) return;

    this.loading.set(true);
    this.error.set(null);

    this.adminPartidosService.deletePartido(partido.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage.set('Partido eliminado exitosamente');
          this.closeDeleteModal();
          this.loadPartidos();
          setTimeout(() => this.successMessage.set(null), 3000);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al eliminar el partido. Intente nuevamente.');
        this.loading.set(false);
        this.closeDeleteModal();
      }
    });
  }

  /**
   * Aplica los filtros y recarga la lista
   */
  applyFilters(): void {
    this.currentPage.set(1);
    this.loadPartidos();
  }

  /**
   * Navega a la página siguiente
   */
  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
      this.loadPartidos();
    }
  }

  /**
   * Navega a la página anterior
   */
  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
      this.loadPartidos();
    }
  }

  /**
   * Cierra el modal de formulario
   */
  closeModal(): void {
    this.showModal.set(false);
    this.error.set(null);
    this.partidoForm.reset();
  }

  /**
   * Cierra el modal de confirmación de eliminación
   */
  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.partidoSeleccionado.set(null);
  }

  /**
   * Obtiene el mensaje de error para un campo del formulario
   */
  getFieldError(fieldName: string): string | null {
    const field = this.partidoForm.get(fieldName);
    
    if (!field || !field.touched || !field.errors) {
      return null;
    }

    if (field.errors['required']) {
      const labels: Record<string, string> = {
        torneoId: 'Torneo',
        jornada: 'Jornada',
        equipoLocalId: 'Equipo Local',
        equipoVisitaId: 'Equipo Visitante',
        fechaHora: 'Fecha y Hora',
        estado: 'Estado'
      };
      return `${labels[fieldName]} es requerido`;
    }

    if (field.errors['min']) {
      return 'Jornada debe ser mayor a 0';
    }

    return null;
  }

  /**
   * Verifica si el formulario tiene el error de equipos iguales
   */
  get hasEquiposIgualesError(): boolean {
    return this.partidoForm.errors?.['equiposIguales'] && 
           this.partidoForm.get('equipoLocalId')?.touched &&
           this.partidoForm.get('equipoVisitaId')?.touched;
  }

  /**
   * Formatea la fecha para display
   */
  formatFecha(fecha: Date): string {
    return new Date(fecha).toLocaleString('es-EC', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Obtiene la clase CSS para el estado del partido
   */
  getEstadoClass(estado: string): string {
    const classes: Record<string, string> = {
      'programado': 'estado-programado',
      'en_vivo': 'estado-en-vivo',
      'finalizado': 'estado-finalizado',
      'suspendido': 'estado-suspendido'
    };
    return classes[estado] || '';
  }

  /**
   * Obtiene el texto display para el estado
   */
  getEstadoText(estado: string): string {
    const texts: Record<string, string> = {
      'programado': 'Programado',
      'en_vivo': 'En Vivo',
      'finalizado': 'Finalizado',
      'suspendido': 'Suspendido'
    };
    return texts[estado] || estado;
  }
}
