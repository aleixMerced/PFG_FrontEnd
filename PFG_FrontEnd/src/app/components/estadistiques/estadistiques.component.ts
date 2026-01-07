import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

import { NotificacioService } from '../../shared/notificacio.service';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import {Estadistiques} from '../../interficies/interficies';

type TipusEstadistica = 'diaria' | 'setmanal' | 'mensual' | 'anual';
type CampTeclat = 'anySetmanal' | 'setmana' | 'anyMensual' | 'anyAnual';

// ✅ Format visual del datepicker: dd-MM-yyyy
export const DD_MM_YYYY_FORMATS = {
  parse: { dateInput: 'DD-MM-YYYY' },
  display: {
    dateInput: 'DD-MM-YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'DD-MM-YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};


@Component({
  selector: 'app-estadistiques',
  standalone: false,
  templateUrl: './estadistiques.component.html',
  styleUrls: ['./estadistiques.component.scss'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'ca-ES' },
    { provide: MAT_DATE_FORMATS, useValue: DD_MM_YYYY_FORMATS }
  ]
})
export class EstadistiquesComponent {

  tipusEstadistica: TipusEstadistica | null = null;
  mostrarDetall = false;

  // 📅 Datepicker
  dataDiaria: Date | null = null;

  anySetmanal: number | null = null;
  setmana: number | null = null;

  anyMensual: number | null = null;
  mesMensual: number | null = null;

  anyAnual: number | null = null;

  mesos = [
    { value: 1,  label: 'Gener' },
    { value: 2,  label: 'Febrer' },
    { value: 3,  label: 'Març' },
    { value: 4,  label: 'Abril' },
    { value: 5,  label: 'Maig' },
    { value: 6,  label: 'Juny' },
    { value: 7,  label: 'Juliol' },
    { value: 8,  label: 'Agost' },
    { value: 9,  label: 'Setembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Desembre' },
  ];

  resumCarregat = false;
  carregantResum = false;

  // 🔢 teclat numèric
  mostrarTeclat = false;
  teclatTitle = '';
  valorTeclatInicial: number | null = null;
  campTeclat: CampTeclat | null = null;

  resum: Estadistiques | null = null;

  private readonly api = environment.apiBaseUrl;

  private readonly ANY_MIN = 1900;
  private readonly ANY_MAX = 2999;

  constructor(
    private location: Location,
    private notify: NotificacioService,
    private http: HttpClient
  ) {}

  tornarEnrere(): void {
    this.location.back();
  }

  onCanviTipus(tipus: TipusEstadistica | null): void {
    this.tipusEstadistica = tipus;
    this.mostrarDetall = !!tipus;

    // Netejar filtres
    this.dataDiaria = null;
    this.anySetmanal = null;
    this.setmana = null;
    this.anyMensual = null;
    this.mesMensual = null;
    this.anyAnual = null;

    this.resetResum();
  }

  onCanviFiltre(): void {
    this.resetResum();

    // ✅ de moment NOMÉS backend quan és diari i hi ha data
    if (this.tipusEstadistica === 'diaria' && this.dataDiaria) {
      this.getResumDiari(this.dataDiaria);
    }

    if (this.tipusEstadistica === 'setmanal' && this.anySetmanal && this.setmana) {
      this.getResumSetmanal(this.anySetmanal, this.setmana);
      return;
    }

    if (this.tipusEstadistica === 'mensual' && this.anyMensual && this.mesMensual) {
      if (!this.validarMes(this.mesMensual)) return;
      this.getResumMensual(this.anyMensual, this.mesMensual);
      return;
    }

    if (this.tipusEstadistica === 'anual' && this.anyAnual) {
      this.getResumAnual(this.anyAnual);
      return;
    }
  }

  onCanviDataDiaria(value: Date | null): void {
    this.dataDiaria = value;
    this.onCanviFiltre();
  }

  private resetResum(): void {
    this.resumCarregat = false;
    this.carregantResum = false;
    this.resum = null;
  }

  private formatYYYYMMDD(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private getResumDiari(dia: Date): void {
    const diaResum = this.formatYYYYMMDD(dia);

    this.carregantResum = true;

    this.http.get<Estadistiques>(`${this.api}/Estadistiques/getResumDiari?diaResum=${diaResum}`).subscribe({
      next: (res) => {
        console.log(res)
        this.resum = res;
        console.log(this.resum)
        this.resumCarregat = true;
        this.carregantResum = false;
      },
      error: (err) => {
        console.error(err);
        this.carregantResum = false;
        this.resumCarregat = false;
        this.resum = null;
        this.notify.error('No s’ha pogut carregar el resum diari.');
      }
    });
  }

  private getResumSetmanal(any: number, setmana: number): void {
    this.carregantResum = true;

    this.http.get<Estadistiques>(
      `${this.api}/Estadistiques/getResumSetmanal?any=${any}&setmana=${setmana}`
    ).subscribe({
      next: (res) => {
        this.resum = res;
        this.resumCarregat = true;
        this.carregantResum = false;
      },
      error: (err) => {
        console.error(err);
        this.carregantResum = false;
        this.resumCarregat = false;
        this.resum = null;
        this.notify.error('No s’ha pogut carregar el resum setmanal.');
      }
    });
  }

  private getResumMensual(any: number, mes: number): void {
    this.carregantResum = true;

    this.http.get<Estadistiques>(
      `${this.api}/Estadistiques/getResumMensual?any=${any}&mes=${mes}`
    ).subscribe({
      next: (res) => {
        this.resum = res;
        this.resumCarregat = true;
        this.carregantResum = false;
      },
      error: (err) => {
        console.error(err);
        this.carregantResum = false;
        this.resumCarregat = false;
        this.resum = null;
        this.notify.error('No s’ha pogut carregar el resum mensual.');
      }
    });
  }

  private getResumAnual(any: number): void {
    this.carregantResum = true;

    this.http.get<Estadistiques>(
      `${this.api}/Estadistiques/getResumAnual?any=${any}`
    ).subscribe({
      next: (res) => {
        this.resum = res;
        this.resumCarregat = true;
        this.carregantResum = false;
      },
      error: (err) => {
        console.error(err);
        this.carregantResum = false;
        this.resumCarregat = false;
        this.resum = null;
        this.notify.error('No s’ha pogut carregar el resum anual.');
      }
    });
  }


  private validarAny(any: number): boolean {
    if (any < this.ANY_MIN || any > this.ANY_MAX) {
      this.notify.error(`L'any ha d'estar entre ${this.ANY_MIN} i ${this.ANY_MAX}.`);
      return false;
    }
    return true;
  }

  private validarSetmana(setmana: number): boolean {
    if (setmana < 1 || setmana > 53) {
      this.notify.error('La setmana ha d’estar entre 1 i 53.');
      return false;
    }
    return true;
  }

  private validarMes(mes: number): boolean {
    if (mes < 1 || mes > 12) {
      this.notify.error('El mes ha d’estar entre 1 i 12.');
      return false;
    }
    return true;
  }

  obrirTeclat(camp: CampTeclat): void {
    this.campTeclat = camp;

    switch (camp) {
      case 'anySetmanal':
        this.teclatTitle = "Any de l'estadística setmanal";
        this.valorTeclatInicial = this.anySetmanal ?? null;
        break;
      case 'setmana':
        this.teclatTitle = 'Número de setmana';
        this.valorTeclatInicial = this.setmana ?? null;
        break;
      case 'anyMensual':
        this.teclatTitle = "Any de l'estadística mensual";
        this.valorTeclatInicial = this.anyMensual ?? null;
        break;
      case 'anyAnual':
        this.teclatTitle = "Any de l'estadística anual";
        this.valorTeclatInicial = this.anyAnual ?? null;
        break;
    }

    this.mostrarTeclat = true;
  }

  onTeclatOk(valor: string | number): void {
    const num = Number(valor);

    if (!Number.isFinite(num) || !Number.isInteger(num) || num <= 0) {
      this.notify.error('El valor introduït no és vàlid.');
      return;
    }

    if (this.campTeclat === 'setmana') {
      if (!this.validarSetmana(num)) return;
      this.setmana = num;

    } else if (this.campTeclat === 'anySetmanal') {
      if (!this.validarAny(num)) return;
      this.anySetmanal = num;

    } else if (this.campTeclat === 'anyMensual') {
      if (!this.validarAny(num)) return;
      this.anyMensual = num;

    } else if (this.campTeclat === 'anyAnual') {
      if (!this.validarAny(num)) return;
      this.anyAnual = num;
    }

    this.mostrarTeclat = false;
    this.campTeclat = null;

    this.onCanviFiltre();
  }

  tancarTeclat(): void {
    this.mostrarTeclat = false;
    this.campTeclat = null;
  }

  exportarPdf(): void {
    if (!this.resumCarregat) {
      this.notify.error('Primer has de carregar l’estadística abans d’exportar.');
      return;
    }
    console.log('Exportar PDF');
  }

  exportarExcel(): void {
    if (!this.resumCarregat) {
      this.notify.error('Primer has de carregar l’estadística abans d’exportar.');
      return;
    }
    console.log('Exportar Excel');
  }
}
