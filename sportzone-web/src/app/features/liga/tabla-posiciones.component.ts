import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LigaService } from '../../core/services/liga.service';

@Component({
  selector: 'app-tabla-posiciones',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tabla-wrapper">
      @if (ligaService.loading()) {
        <div class="loading">
          <div class="spinner"></div>
          <p>Cargando tabla de posiciones...</p>
        </div>
      } @else if (ligaService.tabla().length > 0) {
        <div class="tabla-container">
          <table class="tabla-posiciones">
            <thead>
              <tr>
                <th class="col-pos">POS</th>
                <th class="col-equipo">EQUIPO</th>
                <th class="col-stat">PJ</th>
                <th class="col-stat">PG</th>
                <th class="col-stat">PE</th>
                <th class="col-stat">PP</th>
                <th class="col-stat">GF</th>
                <th class="col-stat">GC</th>
                <th class="col-stat">DIF</th>
                <th class="col-pts">PTS</th>
              </tr>
            </thead>
            <tbody>
              @for (equipo of ligaService.tabla(); track equipo.id) {
                <tr 
                  class="fila-equipo"
                  [class.zona-clasificacion]="esZonaClasificacion(equipo.posicion)"
                  [class.zona-descenso]="esZonaDescenso(equipo.posicion)"
                >
                  <td class="col-pos">
                    <span class="posicion">{{ equipo.posicion }}</span>
                  </td>
                  <td class="col-equipo">
                    <div class="equipo-info">
                      @if (equipo.escudoUrl) {
                        <img [src]="equipo.escudoUrl" [alt]="equipo.equipoNombre" class="escudo">
                      }
                      <span class="nombre">{{ equipo.equipoNombre }}</span>
                      <span class="abreviatura">{{ equipo.abreviatura }}</span>
                    </div>
                  </td>
                  <td class="col-stat">{{ equipo.partidosJugados }}</td>
                  <td class="col-stat">{{ equipo.partidosGanados }}</td>
                  <td class="col-stat">{{ equipo.partidosEmpatados }}</td>
                  <td class="col-stat">{{ equipo.partidosPerdidos }}</td>
                  <td class="col-stat">{{ equipo.golesFavor }}</td>
                  <td class="col-stat">{{ equipo.golesContra }}</td>
                  <td class="col-stat" [class.positivo]="equipo.diferencia > 0" [class.negativo]="equipo.diferencia < 0">
                    {{ equipo.diferencia > 0 ? '+' : '' }}{{ equipo.diferencia }}
                  </td>
                  <td class="col-pts">
                    <span class="puntos">{{ equipo.puntos }}</span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Leyenda -->
        <div class="leyenda">
          <div class="leyenda-item">
            <span class="indicador zona-clasificacion"></span>
            <span>Zona de Clasificación</span>
          </div>
          <div class="leyenda-item">
            <span class="indicador zona-descenso"></span>
            <span>Zona de Descenso</span>
          </div>
        </div>
      } @else {
        <div class="empty-state">
          <p>No hay datos de posiciones disponibles</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .tabla-wrapper {
      animation: fadeIn 0.5s;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem;
      gap: 1rem;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(0, 212, 255, 0.2);
      border-top-color: #00D4FF;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading p {
      color: rgba(255, 255, 255, 0.6);
      margin: 0;
    }

    .tabla-container {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(0, 212, 255, 0.2);
      border-radius: 12px;
      overflow: hidden;
    }

    .tabla-posiciones {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background: rgba(0, 212, 255, 0.1);
    }

    th {
      padding: 1rem;
      text-align: left;
      font-family: 'Barlow', sans-serif;
      font-size: 0.85rem;
      font-weight: 700;
      color: #00D4FF;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 2px solid rgba(0, 212, 255, 0.3);
    }

    .col-pos {
      width: 60px;
      text-align: center !important;
    }

    .col-equipo {
      min-width: 250px;
    }

    .col-stat {
      width: 60px;
      text-align: center !important;
    }

    .col-pts {
      width: 80px;
      text-align: center !important;
    }

    .fila-equipo {
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      transition: all 0.3s;
    }

    .fila-equipo:hover {
      background: rgba(0, 212, 255, 0.05);
    }

    .fila-equipo.zona-clasificacion {
      border-left: 4px solid #00D4FF;
      background: rgba(0, 212, 255, 0.03);
    }

    .fila-equipo.zona-descenso {
      border-left: 4px solid #FF2D55;
      background: rgba(255, 45, 85, 0.03);
    }

    td {
      padding: 1rem;
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.95rem;
    }

    .posicion {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: rgba(0, 212, 255, 0.1);
      border-radius: 50%;
      font-weight: 700;
      color: #00D4FF;
    }

    .equipo-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .escudo {
      width: 32px;
      height: 32px;
      object-fit: contain;
    }

    .nombre {
      font-weight: 600;
      flex: 1;
    }

    .abreviatura {
      display: none;
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.85rem;
    }

    .positivo {
      color: #00D4FF;
      font-weight: 600;
    }

    .negativo {
      color: #FF2D55;
      font-weight: 600;
    }

    .puntos {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 40px;
      padding: 0.4rem 0.8rem;
      background: linear-gradient(135deg, #00D4FF, #0099CC);
      border-radius: 6px;
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.3rem;
      color: white;
      font-weight: 700;
    }

    .leyenda {
      display: flex;
      gap: 2rem;
      margin-top: 1.5rem;
      padding: 1rem;
      background: rgba(15, 23, 42, 0.4);
      border-radius: 8px;
    }

    .leyenda-item {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.9rem;
    }

    .indicador {
      width: 24px;
      height: 4px;
      border-radius: 2px;
    }

    .indicador.zona-clasificacion {
      background: #00D4FF;
    }

    .indicador.zona-descenso {
      background: #FF2D55;
    }

    .empty-state {
      background: rgba(15, 23, 42, 0.4);
      border: 1px dashed rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 3rem;
      text-align: center;
    }

    .empty-state p {
      color: rgba(255, 255, 255, 0.5);
      margin: 0;
    }

    @media (max-width: 1024px) {
      .tabla-container {
        overflow-x: auto;
      }

      .tabla-posiciones {
        min-width: 800px;
      }
    }

    @media (max-width: 768px) {
      th, td {
        padding: 0.8rem 0.5rem;
        font-size: 0.85rem;
      }

      .nombre {
        display: none;
      }

      .abreviatura {
        display: block;
      }

      .col-equipo {
        min-width: 120px;
      }

      .leyenda {
        flex-direction: column;
        gap: 0.8rem;
      }
    }
  `]
})
export class TablaPosicionesComponent {
  ligaService = inject(LigaService);

  // Zona de clasificación: top 4
  esZonaClasificacion(posicion: number): boolean {
    return posicion <= 4;
  }

  // Zona de descenso: últimos 3
  esZonaDescenso(posicion: number): boolean {
    const total = this.ligaService.tabla().length;
    return posicion > total - 3;
  }
}
