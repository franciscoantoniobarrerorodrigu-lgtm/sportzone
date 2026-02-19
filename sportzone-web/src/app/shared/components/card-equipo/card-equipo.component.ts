import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Equipo {
  nombre: string;
  escudo_url: string;
  color_primario: string;
  abreviatura: string;
}

@Component({
  selector: 'app-card-equipo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-equipo.component.html',
  styleUrls: ['./card-equipo.component.scss']
})
export class CardEquipoComponent {
  @Input({ required: true }) equipo!: Equipo;
  @Input() clickable: boolean = false;
  @Output() equipoClick = new EventEmitter<Equipo>();

  onCardClick() {
    if (this.clickable) {
      this.equipoClick.emit(this.equipo);
    }
  }
}
