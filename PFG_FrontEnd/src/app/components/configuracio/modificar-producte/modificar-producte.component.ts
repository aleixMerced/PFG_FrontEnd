import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { NotificacioService } from '../../../shared/notificacio.service';
import { Producte, TipusProducte } from '../../../interficies/interficies';

type CampTeclat = 'preuVenda' | 'preuCompra' | 'estoc' | 'minimEstoc';

@Component({
  selector: 'app-modificar-producte',
  standalone: false,
  templateUrl: './modificar-producte.component.html',
  styleUrl: './modificar-producte.component.scss'
})
export class ModificarProducteComponent implements OnInit {

  // dades del producte
  producteSeleccionat: Producte | null = null;
  tipusProductes: TipusProducte[] = [];

  // camps formulari
  nomProducte: string | null = null;
  tipusSeleccionat: TipusProducte | null = null;
  preuVenda: number | null = null;
  preuCompra: number | null = null;
  estoc: number | null = null;
  minimEstoc: number | null = null;

  // imatge
  imatgeUrl: string | null = null;
  selectedImatge: File | null = null;
  nomImatge = '';

  // teclat numèric
  mostraTeclat = false;
  teclatTitle = 'Introdueix quantitat';
  campActiu: CampTeclat | null = null;
  valorTeclatInicial: number | null = null;

  mostraConfirmacioEliminar = false;

  private readonly api = environment.apiBaseUrl;

  constructor(private route: ActivatedRoute, private router: Router, private location: Location, private http: HttpClient, private notif: NotificacioService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.notif.error('Producte no vàlid');
      this.router.navigate(['/config/seleccionar-producte']);
      return;
    }

    this.carregarTipus();
    this.carregarProducte(id);
  }


  carregarTipus(): void {
    this.http.get<TipusProducte[]>(`${this.api}/TipusProducte/GetNomTipus`)
      .subscribe({
        next: data => {
          this.tipusProductes = data;
          this.actualitzarTipusSeleccionat();
        },
        error: err => console.error(err)
      });
  }

  carregarProducte(id: number): void {
    this.http.get<Producte>(`${this.api}/Producte/GetProducteById?id=${id}`)
      .subscribe({
        next: p => {
          this.producteSeleccionat = p;
          this.carregarFormulariDesDeProducte(p);
        },
        error: err => {
          console.error(err);
          this.notif.error('No s’ha pogut carregar el producte');
          this.router.navigate(['/config/seleccionar-producte']);
        }
      });
  }

  carregarFormulariDesDeProducte(p: Producte): void {
    this.nomProducte = p.nomProducte?.trim() ?? '';
    this.preuVenda = p.preuVenta;
    this.preuCompra = p.preuCompra;
    this.estoc = p.estoc;
    this.minimEstoc = p.minimEstoc;

    this.actualitzarTipusSeleccionat(p);

    this.imatgeUrl = p.imatgeProducte
      ? environment.apiBaseUrl + p.imatgeProducte
      : null;

    this.selectedImatge = null;
    this.nomImatge = '';
  }

  actualitzarTipusSeleccionat(p: Producte | null = this.producteSeleccionat): void {
    if (!p || !this.tipusProductes?.length) {
      this.tipusSeleccionat = null;
      return;
    }
    this.tipusSeleccionat =
      this.tipusProductes.find(t => t.nomTipus.trim() === p.nomTipus.trim()) ?? null;

    console.log(this.tipusSeleccionat)
  }


  obrirTeclat(camp: CampTeclat): void {
    this.campActiu = camp;

    switch (camp) {
      case 'preuVenda':
        this.teclatTitle = 'Preu de venda (€)';
        this.valorTeclatInicial = this.preuVenda;
        break;
      case 'preuCompra':
        this.teclatTitle = 'Preu de compra (€)';
        this.valorTeclatInicial = this.preuCompra;
        break;
      case 'estoc':
        this.teclatTitle = 'Estoc';
        this.valorTeclatInicial = this.estoc;
        break;
      case 'minimEstoc':
        this.teclatTitle = 'Mínim d’estoc';
        this.valorTeclatInicial = this.minimEstoc;
        break;
    }

    this.mostraTeclat = true;
  }

  tancarTeclat(): void {
    this.mostraTeclat = false;
    this.campActiu = null;
    this.valorTeclatInicial = null;
  }

  onTeclatOk(valor: number): void {
    if (!this.campActiu) return;

    switch (this.campActiu) {
      case 'preuVenda':
        this.preuVenda = valor;
        break;
      case 'preuCompra':
        this.preuCompra = valor;
        break;
      case 'estoc':
        this.estoc = valor;
        break;
      case 'minimEstoc':
        this.minimEstoc = valor;
        break;
    }

    this.tancarTeclat();
  }


  onImatgeSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.selectedImatge = null;
      this.nomImatge = '';
      return;
    }

    const file = input.files[0];

    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !validExtensions.includes(ext) || !file.type.startsWith('image/')) {
      this.notif.error('El fitxer seleccionat no és una imatge vàlida');
      this.selectedImatge = null;
      this.nomImatge = '';
      input.value = '';
      return;
    }

    const MAX_MB = 2;
    if (file.size > MAX_MB * 1024 * 1024) {
      this.notif.error(`La imatge no pot superar ${MAX_MB} MB`);
      this.selectedImatge = null;
      this.nomImatge = '';
      input.value = '';
      return;
    }

    this.selectedImatge = file;
    this.nomImatge = file.name;

    if (this.imatgeUrl && this.imatgeUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.imatgeUrl);
    }

    this.imatgeUrl = URL.createObjectURL(file);
  }


  tornarEnrere(): void {
    this.location.back();
  }

  canviarProducte(): void {
    this.router.navigate(['/config/seleccionar-producte']);
  }

  cancelLar(): void {
    if (this.producteSeleccionat) {
      this.carregarFormulariDesDeProducte(this.producteSeleccionat);
    }
  }

  modificarProducte(): void {
    if (!this.producteSeleccionat) {
      this.notif.error('Cap producte carregat');
      return;
    }
    if (
      !this.nomProducte ||
      !this.tipusSeleccionat ||
      this.preuVenda === null ||
      this.preuCompra === null ||
      this.estoc === null ||
      this.minimEstoc === null
    ) {
      this.notif.error('Falten camps per omplir');
      return;
    }
    const formData = new FormData();
    formData.append('IdProducte', this.producteSeleccionat.idProducte.toString());
    formData.append('NomProducte', this.nomProducte);
    formData.append('IdTipus', this.tipusSeleccionat.idTipus.toString());
    formData.append('PreuVenta', this.preuVenda.toString().replace('.', ','));
    formData.append('PreuCompra', this.preuCompra.toString().replace('.', ','));
    formData.append('Estoc', this.estoc.toString());
    formData.append('MinimEstoc', this.minimEstoc.toString());

    if (this.selectedImatge) {
      formData.append('Imatge', this.selectedImatge);
    }

    this.http.put(`${this.api}/Producte/PutProducte`, formData).subscribe({
      next: data => {
        this.notif.success('Producte modificat correctament');
        this.router.navigate(['/config/seleccionar-producte']);

      },
      error: err => {
        console.error(err);
        this.notif.error('Error en modificar el producte');
      }
    });
  }

  eliminarProducte(): void {
    if (!this.producteSeleccionat) {
      this.notif.error('Cap producte carregat');
      return;
    }

    const id = this.producteSeleccionat.idProducte;

    this.http.delete(`${this.api}/Producte/DeleteProducte?id=${id}`)
      .subscribe({
        next: data => {
          this.notif.success('Producte eliminat correctament');
          this.router.navigate(['/config/seleccionar-producte']);
        },
        error: err => {
          console.error(err);
          this.notif.error('Error en eliminar el producte');
        }
      });
  }
}
