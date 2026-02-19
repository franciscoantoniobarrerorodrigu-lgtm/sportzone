import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  Renderer2
} from '@angular/core';

/**
 * Directiva para carga diferida (lazy loading) de imágenes usando Intersection Observer API
 * 
 * @example
 * ```html
 * <!-- Uso básico -->
 * <img appLazyLoad [src]="equipo.escudo_url" alt="Escudo">
 * 
 * <!-- Con placeholder -->
 * <img appLazyLoad 
 *      [src]="jugador.foto_url" 
 *      [placeholder]="'/assets/placeholder.png'"
 *      alt="Foto jugador">
 * 
 * <!-- Con threshold personalizado -->
 * <img appLazyLoad 
 *      [src]="imagen.url" 
 *      [threshold]="0.5"
 *      alt="Imagen">
 * ```
 */
@Directive({
  selector: '[appLazyLoad]',
  standalone: true
})
export class LazyLoadDirective implements OnInit, OnDestroy {
  /**
   * URL de la imagen real a cargar
   */
  @Input() src: string = '';

  /**
   * URL de la imagen placeholder (opcional)
   * Si no se proporciona, se muestra un fondo gris
   */
  @Input() placeholder: string = '';

  /**
   * Umbral de intersección (0.0 a 1.0)
   * 0.1 = cargar cuando el 10% de la imagen es visible
   * 1.0 = cargar solo cuando el 100% de la imagen es visible
   */
  @Input() threshold: number = 0.1;

  private observer: IntersectionObserver | null = null;
  private imageElement: HTMLImageElement;

  constructor(
    private el: ElementRef<HTMLImageElement>,
    private renderer: Renderer2
  ) {
    this.imageElement = this.el.nativeElement;
  }

  ngOnInit(): void {
    // Validar que el elemento sea una imagen
    if (this.imageElement.tagName !== 'IMG') {
      console.error('LazyLoadDirective solo puede usarse en elementos <img>');
      return;
    }

    // Validar que se haya proporcionado una URL
    if (!this.src) {
      console.warn('LazyLoadDirective: No se proporcionó URL de imagen');
      return;
    }

    // Aplicar clase de loading inicial
    this.renderer.addClass(this.imageElement, 'lazy-loading');

    // Configurar placeholder si existe
    if (this.placeholder) {
      this.renderer.setAttribute(this.imageElement, 'src', this.placeholder);
    } else {
      // Aplicar estilo de placeholder por defecto
      this.renderer.setStyle(this.imageElement, 'background-color', '#1a1a1a');
      this.renderer.setStyle(this.imageElement, 'min-height', '100px');
    }

    // Crear y configurar Intersection Observer
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void {
    // Limpiar observer al destruir el componente
    this.disconnectObserver();
  }

  /**
   * Configura el Intersection Observer para detectar cuando la imagen entra en el viewport
   */
  private setupIntersectionObserver(): void {
    // Verificar soporte del navegador
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver no soportado, cargando imagen inmediatamente');
      this.loadImage();
      return;
    }

    // Configurar opciones del observer
    const options: IntersectionObserverInit = {
      root: null, // viewport
      rootMargin: '50px', // Cargar 50px antes de que sea visible
      threshold: this.threshold
    };

    // Crear observer
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // La imagen está visible, cargarla
          this.loadImage();
          // Dejar de observar después de cargar
          this.disconnectObserver();
        }
      });
    }, options);

    // Comenzar a observar el elemento
    this.observer.observe(this.imageElement);
  }

  /**
   * Carga la imagen real y maneja los estados de carga
   */
  private loadImage(): void {
    // Crear una nueva imagen para precargar
    const img = new Image();

    // Manejar carga exitosa
    img.onload = () => {
      // Actualizar src de la imagen
      this.renderer.setAttribute(this.imageElement, 'src', this.src);
      
      // Remover clase de loading y agregar clase de loaded
      this.renderer.removeClass(this.imageElement, 'lazy-loading');
      this.renderer.addClass(this.imageElement, 'lazy-loaded');
      
      // Limpiar estilos de placeholder
      this.renderer.removeStyle(this.imageElement, 'background-color');
      this.renderer.removeStyle(this.imageElement, 'min-height');
    };

    // Manejar error de carga
    img.onerror = () => {
      console.error(`Error al cargar imagen: ${this.src}`);
      
      // Remover clase de loading y agregar clase de error
      this.renderer.removeClass(this.imageElement, 'lazy-loading');
      this.renderer.addClass(this.imageElement, 'lazy-error');
      
      // Aplicar imagen de error o mantener placeholder
      if (!this.placeholder) {
        this.renderer.setStyle(this.imageElement, 'background-color', '#2a2a2a');
        this.renderer.setStyle(this.imageElement, 'border', '2px solid #ff2d55');
      }
    };

    // Iniciar la carga de la imagen
    img.src = this.src;
  }

  /**
   * Desconecta y limpia el Intersection Observer
   */
  private disconnectObserver(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}
