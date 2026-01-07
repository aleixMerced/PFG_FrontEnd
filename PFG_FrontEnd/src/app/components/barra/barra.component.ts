import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Taula } from '../../interficies/interficies';
import { NotificacioService } from '../../shared/notificacio.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-barra',
  standalone: false,
  templateUrl: './barra.component.html',
  styleUrl: './barra.component.scss'
})
export class BarraComponent implements OnInit {

  taules: Taula[] = [];
  selectedTaula: Taula | null = null;
  selectedTaulaPare: Taula | null = null;
  selectedSubIndex: number | null = null;
  selectedTaulaLabel: string | null = null;
  mostrarbotons: boolean = false;

  private readonly api = environment.apiBaseUrl;

  constructor(private router: Router, private http: HttpClient, private notif: NotificacioService) { }

  ngOnInit(): void {
    this.http.get<Taula[]>(`${this.api}/Taula/GetTaulesInterior`)
      .subscribe({
        next: data => {
          const pares = data
            .filter(t => t.taulaPare == null)
            .map(p => ({ ...p, subTaules: [] as Taula[] }));

          const fills = data.filter(t => t.taulaPare != null);

          const mapPare = new Map<number, Taula>();
          for (const p of pares) mapPare.set(p.idTaula, p);

          for (const f of fills) {
            const pare = mapPare.get(f.taulaPare!);
            if (pare?.subTaules) pare.subTaules.push(f);
          }

          for (const p of pares) {
            p.subTaules?.sort((a, b) => a.numTaula - b.numTaula);
          }

          this.taules = pares.sort((a, b) => a.numTaula - b.numTaula);
        },
        error: err => console.error(err)
      });
  }

  onClickTaula(taula: Taula): void {
    this.selectedTaula = taula;
    this.selectedTaulaPare = null;
    this.selectedSubIndex = null;
    this.selectedTaulaLabel = String(taula.numTaula);
    this.mostrarbotons = true;
    console.log('Taula seleccionada (pare):', taula.idTaula);
  }

  onClickSubTaula(pare: Taula, subTaula: Taula, index: number): void {
    this.selectedTaula = subTaula;
    this.selectedTaulaPare = pare;
    this.selectedSubIndex = index;
    this.selectedTaulaLabel = `${pare.numTaula}.${index + 1}`;
    this.mostrarbotons = true;
    console.log('Subtaula seleccionada:', subTaula.idTaula, 'pare:', pare.idTaula);
  }

  isTaulaSelected(taula: Taula): boolean {
    if (!this.selectedTaula) return false;
    if (this.selectedTaula === taula) return true;
    return !!(this.selectedTaulaPare && this.selectedTaulaPare.idTaula === taula.idTaula);
  }

  isSubTaulaSelected(subTaula: Taula): boolean {
    return this.selectedTaula === subTaula;
  }

  separaTaules(): void {
    if (!this.selectedTaula) return;

    if (this.selectedTaula.taulaPare != null) {
      const idPare = this.selectedTaula.taulaPare;
      const pareIndex = this.taules.findIndex(t => t.idTaula === idPare);
      if (pareIndex === -1) return;

      const pare = this.taules[pareIndex];

      const algunaOcupada = (pare.subTaules ?? []).some(st => st.ocupat === 1);
      if (algunaOcupada) {
        this.notif.warning('No pots juntar taules on una té una comanda activa!');
        return;
      }

      this.http.get<boolean>(`${this.api}/Taula/JuntarTaules?idTaulaPare=${idPare}`)
        .subscribe({
          next: ok => {
            if (!ok) {
              this.notif.error('No s’ha pogut juntar les taules.');
              return;
            }

            this.taules[pareIndex] = { ...this.taules[pareIndex], subTaules: undefined };

            this.selectedTaula = this.taules[pareIndex];
            this.selectedTaulaPare = null;
            this.selectedSubIndex = null;
            this.selectedTaulaLabel = String(this.selectedTaula.numTaula);

            this.notif.success('Taules juntades correctament.');
          },
          error: err => {
            console.error(err);
            this.notif.error('Error ajuntant taules.');
          }
        });

    } else {
      const idPare = this.selectedTaula.idTaula;

      this.http.get<Taula[]>(`${this.api}/Taula/GetSubTaules?idTaulaPare=${idPare}`)
        .subscribe({
          next: subtaules => {
            if (!subtaules || subtaules.length === 0) {
              this.notif.warning('Aquesta taula no té subtaules configurades.');
              return;
            }

            subtaules.sort((a, b) => a.numTaula - b.numTaula);

            const idx = this.taules.findIndex(t => t.idTaula === idPare);
            if (idx === -1) return;

            this.taules[idx] = { ...this.taules[idx], subTaules: subtaules };

            this.selectedTaula = this.taules[idx];
            this.selectedTaulaPare = null;
            this.selectedSubIndex = null;
            this.selectedTaulaLabel = String(this.selectedTaula.numTaula);
          },
          error: err => {
            console.error(err);
            this.notif.error('Error carregant subtaules.');
          }
        });
    }
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
              console.log("AKI3")
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
    }
  }

  private imatgePerTaula(t: Taula): string {
    return t.taulaPare != null
      ? 'uploads/img/taula2.png'
      : 'uploads/img/taula4.png';
  }

  // Ara apiBaseUrl ja inclou /api, així que això dona /api/uploads/img/...
  getTaulaImg(t: Taula): string {
    const path = t.imatge.startsWith('/') ? t.imatge : '/' + t.imatge;
    return this.api + path;
  }
}
