import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NotificacioService } from '../../../shared/notificacio.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-crear-taula',
  standalone: false,
  templateUrl: './crear-taula.component.html',
  styleUrl: './crear-taula.component.scss'
})
export class CrearTaulaComponent {

  numTaula: number | null = null;
  ubicacio: 'INTERIOR' | 'TERRASSA' | null = null;

  teSubtaules = false;
  subTaula1: string | null = null;
  subTaula2: string | null = null;

  mostrarTeclat = false;
  teclatTitle = 'Número de taula';
  valorTeclatInicial: number | null = null;

  private readonly api = environment.apiBaseUrl;

  constructor(private location: Location, private http: HttpClient, private notif: NotificacioService) {}

  tornarEnrere() {
    this.location.back();
  }

  netejarTaula() {
    this.numTaula = null;
    this.ubicacio = null;
    this.teSubtaules = false;
    this.subTaula1 = null;
    this.subTaula2 = null;
  }

  obrirTeclat() {
    this.teclatTitle = 'Número de taula';
    this.valorTeclatInicial = this.numTaula;
    this.mostrarTeclat = true;
  }

  onTeclatOk(valor: string | number) {
    const num = Number(valor);

    if (num > 99) {
      this.notif.warning('El número de taula ha de ser de dues xifres (1 a 98)');
      return;
    }

    this.numTaula = num;
    this.mostrarTeclat = false;
  }

  tancarTeclat() {
    this.mostrarTeclat = false;
  }

  guardarTaula() {

    if (this.numTaula === null) {
      this.notif.error('Has d’informar el número de la taula');
      return;
    }

    if (!this.ubicacio) {
      this.notif.error('Has d\'indicar si la taula és interior o terrassa');
      return;
    }

    const formData = new FormData();
    formData.append('NumTaula', this.numTaula.toString());
    formData.append('Ubicacio', this.ubicacio);
    formData.append('TeSubTaules', this.teSubtaules ? 'true' : 'false');

    this.http.post(`${this.api}/Taula/PostTaula`, formData).subscribe({
      next: () => {
        this.notif.success('Taula creada');
        this.netejarTaula();
      },
      error: err => {
        console.error(err);
        this.notif.error('Error en crear la taula');
      }
    });
  }
}
