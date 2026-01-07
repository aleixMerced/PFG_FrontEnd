import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Taula } from '../../interficies/interficies';
import { NotificacioService } from '../../shared/notificacio.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-terrassa',
  standalone: false,
  templateUrl: './terrassa.component.html',
  styleUrl: '../barra/barra.component.scss'
})
export class TerrassaComponent implements OnInit {

  taules: Taula[] = [];
  selectedTaula: Taula | null = null;
  selectedTaulaLabel: string | null = null;
  mostrarbotons = false;

  private readonly api = environment.apiBaseUrl;


  constructor(private router: Router, private http: HttpClient, private notif: NotificacioService) {}

  ngOnInit(): void {
    this.http.get<Taula[]>(`${this.api}/Taula/GetTaulesExterior`)
      .subscribe({
        next: data => {
          this.taules = (data ?? []).sort((a, b) => a.numTaula - b.numTaula);
        },
        error: err => console.error(err)
      });
  }

  onClickTaula(taula: Taula): void {
    this.selectedTaula = taula;
    this.selectedTaulaLabel = String(taula.numTaula);
    this.mostrarbotons = true;
  }

  isTaulaSelected(taula: Taula): boolean {
    return this.selectedTaula?.idTaula === taula.idTaula;
  }

  buscarHistoric(): void {
    if (!this.selectedTaula) return;
    this.router.navigate(['/historic-comandes', this.selectedTaula.idTaula]);
  }

  afegirDesocuparTaula(): void {
    if (!this.selectedTaula) return;

    if (this.selectedTaula.ocupat) {
      this.http.get<number>(`${this.api}/Taula/GetCountTaules?idTaula=${this.selectedTaula.idTaula}`)
        .subscribe({
          next: (data) => {
            if (data === 0) {
              console.log("AQUI2")
              this.http.put<boolean>(`${this.api}/Taula/CanviarEstatTaula?id=${this.selectedTaula!.idTaula}`, {})
                .subscribe({
                  next: () => {
                    this.notif.success('Taula desocupada correctament.');

                    this.selectedTaula!.ocupat = 0;
                    this.selectedTaula!.imatge = this.imatgePerTaula(this.selectedTaula!);

                    const idx = this.taules.findIndex(t => t.idTaula === this.selectedTaula!.idTaula);
                    if (idx !== -1) {
                      this.taules[idx].ocupat = 0;
                      this.taules[idx].imatge = this.imatgePerTaula(this.taules[idx]);
                    }
                  },
                  error: err => {
                    this.notif.error('No s’ha pogut desocupar la taula.');
                    console.error(err);
                  }
                });

            } else if (data === -1) {
              this.notif.warning('Aquesta taula té més d\'una comanda oberta.');
              this.buscarHistoric();
            } else {
              this.router.navigate(['/comandaFinal', data]);
            }
          },
          error: err => console.error(err)
        });

    } else {
      this.router.navigate(['/comandaFinal/taula', this.selectedTaula.idTaula]);
      console.log("AQUI1")
      this.http.put<boolean>(`${this.api}/Taula/CanviarEstatTaula?id=${this.selectedTaula!.idTaula}`, {})
        .subscribe({
          next: () => {
            this.notif.success('Taula ocupada correctament.');

            this.selectedTaula!.ocupat = 1;
            this.selectedTaula!.imatge = this.imatgePerTaula(this.selectedTaula!);

            const idx = this.taules.findIndex(t => t.idTaula === this.selectedTaula!.idTaula);
            if (idx !== -1) {
              this.taules[idx].ocupat = 1;
              this.taules[idx].imatge = this.imatgePerTaula(this.taules[idx]);
            }
          },
          error: err => {
            this.notif.error('No s’ha pogut ocupar la taula.');
            console.error(err);
          }
        });
    }
  }

  private imatgePerTaula(_t: Taula): string {
    // ✅ a terrassa sempre taula "normal"
    return 'uploads/img/taula4.png';
  }

  getTaulaImg(t: Taula): string {
    const path = t.imatge.startsWith('/') ? t.imatge : '/' + t.imatge;
    return environment.apiBaseUrl + path;
  }
}
