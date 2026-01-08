import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { NotificacioService } from '../../../shared/notificacio.service';
import { Taula } from '../../../interficies/interficies';

@Component({
  selector: 'app-modificar-taula',
  standalone: false,
  templateUrl: './modificar-taula.component.html',
  styleUrl: './modificar-taula.component.scss'
})
export class ModificarTaulaComponent implements OnInit {

  taules: Taula[] = [];
  taulaSeleccionada: Taula | null = null;

  numTaula: number | null = null;
  ubicacio: 'INTERIOR' | 'TERRASSA' | null = null;
  teSubtaules = false;
  actiu = true;
  mostraConfirmacioEliminar = false;
  mostrarDetall = false;

  mostrarTeclat = false;
  teclatTitle = 'Número de taula';
  valorTeclatInicial: number | null = null;

  private readonly api = environment.apiBaseUrl;

  constructor(private location: Location, private http: HttpClient, private notif: NotificacioService) {}

  ngOnInit(): void {
    this.carregarTaules();
  }

  carregarTaules(): void {
    this.http.get<Taula[]>(`${this.api}/Taula/GetTaulesPare`).subscribe({
      next: data => {
        this.taules = data;
      },
      error: err => {
        console.error(err);
        this.notif.error('No s’han pogut carregar les taules');
      }
    });
  }

  onCanviTaula(taula: Taula | null): void {
    this.taulaSeleccionada = taula;

    if (!taula) {
      this.mostrarDetall = false;
      this.numTaula = null;
      this.ubicacio = null;
      this.teSubtaules = false;
      this.actiu = true;
      return;
    }

    this.numTaula = taula.numTaula ?? null;
    this.ubicacio = taula.interiorexterior === 'I' ? 'INTERIOR' : 'TERRASSA';
    console.log(taula);
    this.teSubtaules = taula.teSubTaules === 1;
    this.actiu = taula.actiu === 1;
    this.mostrarDetall = true;
  }

  tornarEnrere(): void {
    this.location.back();
  }

  canviarTaula(): void {
    this.taulaSeleccionada = null;
    this.mostrarDetall = false;
    this.numTaula = null;
    this.ubicacio = null;
    this.teSubtaules = false;
    this.actiu = true;
  }

  cancelLar(): void {
    if (this.taulaSeleccionada) {
      this.onCanviTaula(this.taulaSeleccionada);
    } else {
      this.canviarTaula();
    }
  }

  obrirTeclat(): void {
    this.teclatTitle = 'Número de taula';
    this.valorTeclatInicial = this.numTaula;
    this.mostrarTeclat = true;
  }

  onTeclatOk(valor: string | number): void {
    const num = Number(valor);

    if (!Number.isInteger(num) || num <= 0) {
      this.notif.error('El número de taula ha de ser un enter positiu');
      return;
    }

    if (num > 99) {
      this.notif.error('El número de taula ha de ser de dues xifres (1 a 99)');
      return;
    }

    this.numTaula = num;
    this.mostrarTeclat = false;
  }

  tancarTeclat(): void {
    this.mostrarTeclat = false;
  }

  guardarCanvis(): void {
    if (!this.taulaSeleccionada) {
      this.notif.error('Has de seleccionar una taula');
      return;
    }

    if (this.numTaula === null) {
      this.notif.error('Has d’informar el número de la taula');
      return;
    }

    if (!this.ubicacio) {
      this.notif.error('Has d’indicar si la taula és interior o terrassa');
      return;
    }
    const formData = new FormData();
    formData.append('idTaula', this.taulaSeleccionada.idTaula.toString());
    formData.append('NumTaula', this.numTaula.toString());
    formData.append('Ubicacio', this.ubicacio);
    formData.append('TeSubTaules', this.teSubtaules ? 'true' : 'false');
    formData.append('Actiu', this.actiu ? '1' : '0');

    this.http.put(`${this.api}/Taula/PutTaula`, formData).subscribe({
      next: () => {
        this.notif.success('Taula modificada correctament');
        this.canviarTaula();
        this.carregarTaules();
      },
      error: err => {
        console.error(err);
        this.notif.error('Error en modificar la taula');
      }
    });
  }

  eliminarTaula(): void {
    if (!this.taulaSeleccionada) {
      this.notif.error('Cap taula seleccionada');
      return;
    }

    const id = this.taulaSeleccionada.idTaula;

    this.http.delete(`${this.api}/Taula/DeleteTaula?id=${id}`).subscribe({
      next: () => {
        this.notif.success('Taula esborrada correctament');
        this.mostraConfirmacioEliminar = false;
        this.canviarTaula();
        this.carregarTaules();
      },
      error: err => {
        console.error(err);
        this.notif.error('Error en esborrar la taula');
      }
    });
  }
}
