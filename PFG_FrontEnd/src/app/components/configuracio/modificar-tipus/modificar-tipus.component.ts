import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { NotificacioService } from '../../../shared/notificacio.service';
import { TipusProducte } from '../../../interficies/interficies';

@Component({
  selector: 'app-modificar-tipus',
  standalone: false,
  templateUrl: './modificar-tipus.component.html',
  styleUrl: './modificar-tipus.component.scss'
})
export class ModificarTipusComponent implements OnInit {

  tipusProductes: TipusProducte[] = [];
  tipusSeleccionat: TipusProducte | null = null;

  nomTipus: string = '';

  imatgeUrl: string | null = null;
  selectedImatge: File | null = null;
  nomImatge = '';

  mostraConfirmacioEliminar = false;
  mostrarDetall = false;

  private readonly api = environment.apiBaseUrl;


  constructor(private router: Router, private location: Location, private http: HttpClient, private notif: NotificacioService) {}

  ngOnInit(): void {
    this.carregarTipus();
  }

  carregarTipus(): void {
    this.http.get<TipusProducte[]>(`${this.api}/TipusProducte/GetNomTipus`).subscribe({
      next: data => {
        this.tipusProductes = data;
      },
      error: err => {
        console.error(err);
        this.notif.error('No s’han pogut carregar els tipus');
      }
    });
  }

  onCanviTipus(tipus: TipusProducte | null): void {
    this.tipusSeleccionat = tipus;

    if (!tipus) {
      this.mostrarDetall = false;
      this.nomTipus = '';
      this.imatgeUrl = null;
      this.selectedImatge = null;
      this.nomImatge = '';
      return;
    }

    this.nomTipus = tipus.nomTipus?.trim() ?? '';


    this.imatgeUrl = tipus.fotoTipus
      ? environment.apiBaseUrl + tipus.fotoTipus
      : null;

    this.selectedImatge = null;

    this.mostrarDetall = true;
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

  canviarTipus(): void {
    // torna a l'estat inicial: només selector
    this.tipusSeleccionat = null;
    this.mostrarDetall = false;
    this.nomTipus = '';
    this.imatgeUrl = null;
    this.selectedImatge = null;
    this.nomImatge = '';
  }

  cancelLar(): void {
    if (this.tipusSeleccionat) {
      // torna als valors del tipus seleccionat
      this.onCanviTipus(this.tipusSeleccionat);
    } else {
      this.canviarTipus();
    }
  }

  guardarCanvis(): void {
    if (!this.tipusSeleccionat) {
      this.notif.error('Has de seleccionar un tipus');
      return;
    }

    if (!this.nomTipus || !this.nomTipus.trim()) {
      this.notif.error('Has d’informar el nom del tipus');
      return;
    }

    const formData = new FormData();
    formData.append('IdTipus', this.tipusSeleccionat.idTipus.toString());
    formData.append('NomTipus', this.nomTipus.trim());

    if (this.selectedImatge) {
      formData.append('Imatge', this.selectedImatge);
    }

    this.http.put(`${this.api}/TipusProducte/PutTipusProducte`, formData).subscribe({
      next: () => {
        this.notif.success('Tipus modificat correctament');
        this.canviarTipus();
        this.carregarTipus();
      },
      error: err => {
        console.error(err);
        this.notif.error('Error en modificar el tipus');
      }
    });
  }

  eliminarTipus(): void {
    if (!this.tipusSeleccionat) {
      this.notif.error('Cap tipus seleccionat');
      return;
    }

    const id = this.tipusSeleccionat.idTipus;

    this.http.delete(`${this.api}/TipusProducte/DeleteTipusProducte?id=${id}`).subscribe({
      next: () => {
        this.notif.success('Tipus esborrat correctament');
        this.mostraConfirmacioEliminar = false;
        this.canviarTipus();
        this.carregarTipus();
      },
      error: err => {
        console.error(err);
        this.notif.error('Error en esborrar el tipus');
      }
    });
  }
}
