import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {Taula, TipusProducte} from '../../../interficies/interficies';
import {HttpClient} from '@angular/common/http';
import {NotificacioService} from '../../../shared/notificacio.service';
import {environment} from '../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';

type CampTeclat = 'preuVenda' | 'preuCompra' | 'estoc' | 'minimEstoc';

@Component({
  selector: 'app-crear-producte',
  standalone: false,
  templateUrl: './crear-producte.component.html',
  styleUrl: './crear-producte.component.scss'
})


export class CrearProducteComponent implements OnInit{


  constructor(private location: Location, private http: HttpClient, private notif: NotificacioService, private route: ActivatedRoute) { }

  tipusProductes: TipusProducte[] = [];

  tipusSeleccionat: TipusProducte | null = null;

  preuVenda: number | null = null;
  preuCompra: number | null = null;
  estoc: number | null = null;
  minimEstoc: number | null = null;
  nomProducte: string | null = null;
  selectedImatge: File | null = null;
  nomImatge = '';
  imatgeUrl: string | null = null;

  mostraTeclat = false;
  teclatTitle = 'Introdueix quantitat';
  campActiu: CampTeclat | null = null;
  valorTeclatInicial: number | null = null;

  idTipusRuta: number | null = null;
  tipusBloquejat = false;

  private readonly api = environment.apiBaseUrl;



  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('idTipus');
    this.idTipusRuta = id ? Number(id) : null;
    this.tipusBloquejat = this.idTipusRuta !== null && !Number.isNaN(this.idTipusRuta);


    this.http.get<TipusProducte[]>(`${this.api}/TipusProducte/GetNomTipus`).subscribe({
      next: data => {
        this.tipusProductes = data;

        if (this.tipusBloquejat && this.idTipusRuta !== null) {
          const trobat = this.tipusProductes.find(t => t.idTipus === this.idTipusRuta);
          if (trobat) {
            this.tipusSeleccionat = trobat;
          } else {
            this.tipusBloquejat = false;
          }
        }

      },
      error: err => console.error(err)
    });
  }

  obrirTeclat(camp: CampTeclat) {
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


  tancarTeclat() {
    this.mostraTeclat = false;
    this.campActiu = null;
  }

  onTeclatOk(valor: number) {
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

  tornarEnrere() {
    this.location.back();
  }

  netejarProducte(){
    this.preuVenda = null;
    this.preuCompra = null;
    this.estoc = null;
    this.minimEstoc = null;
    this.tipusSeleccionat = null;
    this.campActiu = null;
    this.nomProducte = null;
    this.nomImatge = 'Tria una imatge pel producte';
    this.selectedImatge = null;

    if (this.imatgeUrl && this.imatgeUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.imatgeUrl);
    }
    this.imatgeUrl = null;

  }

  onImatgeSeleccionada(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.selectedImatge = null;
      this.nomImatge = '';
      if (this.imatgeUrl && this.imatgeUrl.startsWith('blob:')) {
        URL.revokeObjectURL(this.imatgeUrl);
      }
      this.imatgeUrl = null;
      return;
    }

    const file = input.files[0];

    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!ext || !validExtensions.includes(ext)) {
      this.notif.error('El fitxer seleccionat no és una imatge vàlida');
      this.selectedImatge = null;
      this.nomImatge = '';
      input.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.notif.error('El fitxer seleccionat no és una imatge');
      this.selectedImatge = null;
      this.nomImatge = '';
      input.value = '';
      return;
    }

    const MAX_SIZE_MB = 2;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      this.notif.error(`La imatge no pot superar ${MAX_SIZE_MB} MB`);
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

  guardarProducte(){

    if (
      !this.nomProducte ||
      !this.tipusSeleccionat
    ) {
      console.warn("Falten camps per omplir");
      this.notif.error('falten camps per omplir')
      return;
    }

    const formData = new FormData();
    formData.append('NomProducte', this.nomProducte);
    formData.append('IdTipus', this.tipusSeleccionat.idTipus.toString());
    formData.append('PreuVenta', (this.preuVenda ?? 0).toString().replace('.', ','));
    formData.append('PreuCompra', (this.preuCompra ?? 0).toString().replace('.', ','));
    formData.append('Estoc', (this.estoc ?? 0).toString());
    formData.append('MinimEstoc', (this.minimEstoc ?? 0).toString());

    if (this.selectedImatge) {
      formData.append('Imatge', this.selectedImatge);
    }

      this.http.post(`${this.api}/Producte/PostProducte`,formData).subscribe({
      next: res => {
        this.notif.success('Producte creat');
        this.netejarProducte();
      },
      error: err => console.error(err)
    });
  }

}
