import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import {Comanda, Taula} from '../../interficies/interficies';
import {environment} from '../../../environments/environment';
type CampTeclat = 'importMinim' | 'importMaxim';



@Component({
  selector: 'app-historic-comandes',
  standalone: false,
  templateUrl: './historic-comandes.component.html',
  styleUrl: './historic-comandes.component.scss'
})
export class HistoricComandesComponent implements OnInit {

  idTaula!: number;
  dataFinal!: string;
  dataInici!: string;
  taulaInfo: Taula | null = null;


  textFiltrar: string = '';
  estat: string = '';
  formaPagament: string = '';
  importMinim: number | null = null;
  importMaxim: number | null = null;
  taulaSeleccionada: number | null = null;

  taulesDisponibles: Taula[] = [];

  page = 1;
  pageSize = 10;
  total = 0;
  comandes: Comanda[] = [];

  mostraTeclat = false;
  teclatTitle = 'Introdueix quantitat';
  campActiu: CampTeclat | null = null;
  valorTeclatInicial: number | null = null;

  private readonly api = environment.apiBaseUrl;


  constructor(private route: ActivatedRoute, private location: Location, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const avui = new Date();
    const faUnAny = new Date();
    faUnAny.setFullYear(avui.getFullYear() - 1);

    this.dataInici = this.formatDate(faUnAny);
    this.dataFinal = this.formatDate(avui);

    this.carregarTaulesFiltre();

    this.route.paramMap.subscribe(pm => {
      const idParam = pm.get('id');
      this.idTaula = idParam ? +idParam : 0;

      this.taulaInfo = null;

      if (this.idTaula !== 0) {
        this.http.get<Taula>(`${this.api}/Taula/GetTaulaByID?idTaula=${this.idTaula}`, {}).subscribe({
          next: t => (this.taulaInfo = t),
          error: err => console.error(err)
        });
      }

      this.taulaSeleccionada = this.idTaula === 0 ? null : this.idTaula;

      this.page = 1;
      this.carregarTotal();
      this.carregarComandes();
    });
  }

  get comandesFiltrades(): Comanda[] {
    return this.comandes;
  }

  get totalPages(): number {
    return this.pageSize > 0 ? Math.ceil(this.total / this.pageSize) : 0;
  }

  get pagesToShow(): number[] {
    const total = this.totalPages;
    if (total === 0) return [];

    const maxButtons = 3;
    let start = Math.max(1, this.page - 1);
    let end = Math.min(total, start + maxButtons - 1);

    const pages: number[] = [];
    for (let p = start; p <= end; p++) {
      pages.push(p);
    }
    return pages;
  }

  get idTaulaPerBack(): number {
    if (this.idTaula === 0) {
      return this.taulaSeleccionada ?? 0;
    }

    return this.idTaula;
  }


  tornarEnrere(): void {
    this.location.back();
  }

  veureProductes(c: Comanda): void {
    this.router.navigate(['/comandaFinal', c.idComanda]);
  }


  private formatDate(d: Date): string {
    const any = d.getFullYear();
    const mes = ('0' + (d.getMonth() + 1)).slice(-2);
    const dia = ('0' + d.getDate()).slice(-2);
    return `${any}-${mes}-${dia}`;
  }

  netejarFiltres(): void {
    const avui = new Date();
    const faUnAny = new Date();
    faUnAny.setFullYear(avui.getFullYear() - 1);

    this.dataInici = this.formatDate(faUnAny);
    this.dataFinal = this.formatDate(avui);

    this.textFiltrar = '';
    this.estat = '';
    this.formaPagament = '';
    this.importMinim = null;
    this.importMaxim = null;

    if (this.idTaula === 0) {
      this.taulaSeleccionada = null;
    }

    this.page = 1;
    this.carregarTotal();
    this.carregarComandes();
  }

  onCanviDates(): void {
    this.page = 1;
    this.carregarTotal();
    this.carregarComandes();
  }

  onCanviFiltreGlobal(nouValor: string): void {
    this.textFiltrar = nouValor;
    this.page = 1;
    this.carregarTotal();
    this.carregarComandes();
  }

  onCanviEstat(nouEstat: string): void {
    this.estat = nouEstat;
    this.page = 1;
    this.carregarTotal();
    this.carregarComandes();
  }

  onCanviFormaPagament(novaForma: string): void {
    this.formaPagament = novaForma;
    this.page = 1;
    this.carregarTotal();
    this.carregarComandes();
  }
  onCanviTaulaGlobal(nouValor: number | null): void {
    this.taulaSeleccionada = nouValor;
    this.page = 1;
    this.carregarTotal();
    this.carregarComandes();
  }



  obrirTeclat(camp: CampTeclat): void {
    this.campActiu = camp;

    switch (camp) {
      case 'importMinim':
        this.teclatTitle = 'Import més gran que (€)';
        this.valorTeclatInicial = this.importMinim;
        break;
      case 'importMaxim':
        this.teclatTitle = 'Import més petit que (€)';
        this.valorTeclatInicial = this.importMaxim;
        break;
    }

    this.mostraTeclat = true;
  }

  tancarTeclat(): void {
    this.mostraTeclat = false;
    this.campActiu = null;
  }

  onTeclatOk(valor: number): void {
    if (!this.campActiu) return;

    switch (this.campActiu) {
      case 'importMinim':
        this.importMinim = valor;
        break;
      case 'importMaxim':
        this.importMaxim = valor;
        break;
    }

    this.page = 1;
    this.carregarTotal();
    this.carregarComandes();
    this.tancarTeclat();
  }

  /* ---------- CRIDES A BACKEND ---------- */

  private carregarTotal(): void {
    const idTaulaParam = this.idTaulaPerBack;

    let params = new HttpParams()
      .set('idTaula', String(idTaulaParam))
      .set('dataInici', this.dataInici)
      .set('dataFinal', this.dataFinal)
      .set('filtreGlobal', this.textFiltrar || '')
      .set('estat', this.estat || '')
      .set('formaPagament', this.formaPagament || '')
      .set('importMinim', this.importMinim != null ? String(this.importMinim) : '')
      .set('importMaxim', this.importMaxim != null ? String(this.importMaxim) : '');

    this.http.get<number>(`${this.api}/Comanda/GetCountComandaByTaula`, { params }).subscribe({
      next: data => {
        this.total = data;
      },
      error: err => {
        console.error(err);
      }
    });
  }

  private carregarComandes(): void {
    const idTaulaParam = this.idTaulaPerBack;

    let params = new HttpParams()
      .set('idTaula', String(idTaulaParam))
      .set('page', this.page)
      .set('pageSize', this.pageSize)
      .set('dataInici', this.dataInici)
      .set('dataFinal', this.dataFinal)
      .set('filtreGlobal', this.textFiltrar || '')
      .set('estat', this.estat || '')
      .set('formaPagament', this.formaPagament || '')
      .set('importMinim', this.importMinim != null ? String(this.importMinim) : '')
      .set('importMaxim', this.importMaxim != null ? String(this.importMaxim) : '');

    this.http.get<Comanda[]>(`${this.api}/Comanda/GetComandaByTaulaPaginada`, { params }).subscribe({
      next: data => {
        this.comandes = data.map(c => ({
          ...c,
          Productes: undefined
        }));
      },
      error: err => {
        console.error(err);
      }
    });
  }

  private carregarTaulesFiltre(): void {
    this.http.get<Taula[]>(`${this.api}/Taula/GetAllTaules`).subscribe({
        next: data => {
          this.taulesDisponibles = data ?? [];
        },
        error: err => {
          console.error('Error carregant taules per filtre', err);
        }
      });
  }


  get taulaLabelHistoric(): string {
    if (!this.taulaInfo) return `Taula ${this.idTaula}`;
    const ubic = this.taulaInfo.interiorexterior === 'I' ? 'Interior' : 'Terrassa';
    return `Taula ${this.taulaInfo.numTaula} (${ubic})`;
  }

  /* ---------- PAGINACIÓ ---------- */

  canviarPagina(novaPagina: number): void {
    if (novaPagina < 1 || novaPagina > this.totalPages || novaPagina === this.page) {
      return;
    }
    this.page = novaPagina;
    this.carregarComandes();
  }

  canviarFilesPerPagina(nouTamany: string | number): void {
    this.pageSize = +nouTamany;
    this.page = 1;
    this.carregarComandes();
  }
}
