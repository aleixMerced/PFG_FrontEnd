import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { NotificacioService } from '../../../shared/notificacio.service';
import { Producte, TipusProducte } from '../../../interficies/interficies';

@Component({
  selector: 'app-seleccionar-producte',
  standalone: false,
  templateUrl: './seleccionar-producte.component.html',
  styleUrl: './seleccionar-producte.component.scss'
})
export class SeleccionarProducteComponent implements OnInit {

  productes: Producte[] = [];
  tipusProducte: TipusProducte[] = [];

  tipusSeleccionat: TipusProducte | null = null;
  productesFiltrats: Producte[] = [];

  producteSeleccionat: Producte | null = null;

  private readonly api = environment.apiBaseUrl;

  constructor(private location: Location, private router: Router, private http: HttpClient, private notif: NotificacioService) {}

  ngOnInit(): void {
    this.carregarTipus();
    this.carregarProductes();
  }

  tornarEnrere(): void {
    this.location.back();
  }

  carregarTipus(): void {
    this.http.get<any[]>(`${this.api}/TipusProducte/GetNomTipus`).subscribe({
      next: data => {
        this.tipusProducte = (data ?? []).map(x => ({
          idTipus: x.idTipus,
          nomTipus: (x.nomTipus ?? '').trim(),
          fotoTipus: x.fotoTipus
        }));
      },
      error: err => {
        console.error(err);
        this.notif.error('No s’han pogut carregar els tipus');
      }
    });
  }

  carregarProductes(): void {
    this.http.get<Producte[]>(`${this.api}/Producte/GetProductes`).subscribe({
      next: data => {
        this.productes = data ?? [];
        this.aplicarFiltreTipus();
      },
      error: err => {
        console.error(err);
        this.notif.error('No s’han pogut carregar els productes');
      }
    });
  }

  get imatgeProducteSeleccionat(): string | null {
    const p = this.producteSeleccionat;
    if (!p || !p.imatgeProducte) return null;

    if (p.imatgeProducte.startsWith('http://') || p.imatgeProducte.startsWith('https://')) {
      return p.imatgeProducte;
    }

    return environment.apiBaseUrl + (p.imatgeProducte.startsWith('/') ? p.imatgeProducte : '/' + p.imatgeProducte);
  }

  onTipusChange(): void {
    this.producteSeleccionat = null;
    this.aplicarFiltreTipus();
  }

  private aplicarFiltreTipus(): void {
    if (!this.tipusSeleccionat) {
      this.productesFiltrats = [...this.productes];
      return;
    }

    const nom = this.tipusSeleccionat.nomTipus;
    this.productesFiltrats = this.productes.filter(p => (p.nomTipus ?? '') === nom);
  }

  continuar(): void {
    if (!this.producteSeleccionat) {
      this.notif.error('Has de seleccionar un producte');
      return;
    }

    this.router.navigate(['/config/modificar-producte', this.producteSeleccionat.idProducte]);
  }

  cancelLar(): void {
    this.producteSeleccionat = null;
  }
}
