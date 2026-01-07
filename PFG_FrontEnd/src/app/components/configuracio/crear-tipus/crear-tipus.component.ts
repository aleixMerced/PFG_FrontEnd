import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NotificacioService } from '../../../shared/notificacio.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-crear-tipus',
  standalone: false,
  templateUrl: './crear-tipus.component.html',
  styleUrl: './crear-tipus.component.scss'
})
export class CrearTipusComponent {

  nomTipus: string | null = null;

  selectedImatge: File | null = null;
  nomImatge = '';
  imatgeUrl: string | null = null;

  private readonly api = environment.apiBaseUrl;

  constructor(private location: Location, private http: HttpClient, private notif: NotificacioService) {}

  tornarEnrere() {
    this.location.back();
  }

  netejarTipus() {
    this.nomTipus = null;
    this.selectedImatge = null;
    this.nomImatge = '';

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

    // previsualització
    if (this.imatgeUrl && this.imatgeUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.imatgeUrl);
    }
    this.imatgeUrl = URL.createObjectURL(file);
  }

  guardarTipus() {
    if (!this.nomTipus || !this.nomTipus.trim()) {
      this.notif.error('Has d\'informar el nom del tipus');
      return;
    }

    const formData = new FormData();
    formData.append('NomTipus', this.nomTipus.trim());

    if (this.selectedImatge) {
      formData.append('Imatge', this.selectedImatge);
    }

    this.http.post(`${this.api}/TipusProducte/PostTipusProducte`, formData).subscribe({
      next: () => {
        this.notif.success('Tipus creat');
        this.netejarTipus();
      },
      error: err => {
        console.error(err);
        this.notif.error('Error en crear el tipus');
      }
    });
  }
}
