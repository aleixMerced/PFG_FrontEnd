import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { filter, Subscription, interval, of } from 'rxjs';
import { environment } from '../environments/environment';
import {NotificacioService} from './shared/notificacio.service';
import {ResumCaixa} from './interficies/interficies';

type PopupMode = 'mati' | 'tarda' | null;

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {

  private readonly MORNING_START_HOUR = 5;
  private readonly MORNING_END_HOUR = 17
  private readonly FER_CAIXA_GRACE_MINUTES = 5;

  // Barra inferior
  seccioActual = '';
  ara = new Date();
  tornActual = '';
  online = false;

  // Estat de caixa
  haFetCaixaMati = true;
  haTancatDia = true;

  // Popup resum (serveix per matí i per dia)
  showPopup = false;
  popupMode: PopupMode = null;
  resumCaixa: ResumCaixa | null = null;
  observacions = '';

  private readonly api = environment.apiBaseUrl;

  private subs = new Subscription();

  constructor(private router: Router, private http: HttpClient, private notify: NotificacioService) { }


  ngOnInit(): void {
    // Actualitzar hora + torn cada 30s
    const timeSub = interval(30_000).subscribe(() => {
      this.ara = new Date();
      this.actualitzarTorn();
    });
    this.subs.add(timeSub);
    this.actualitzarTorn();

    // Detectar secció actual segons ruta
    const routeSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        const url = e.urlAfterRedirects as string;
        this.seccioActual = this.getSeccioFromUrl(url);
      });
    this.subs.add(routeSub);
    this.seccioActual = this.getSeccioFromUrl(this.router.url);

    // Ping al backend cada 5s
    const pingSub = interval(5_000).subscribe(() => {
      this.checkBackendStatus();
    });
    this.subs.add(pingSub);
    this.checkBackendStatus(); // primer ping immediat

    this.http.get<boolean>(`${this.api}/CaixaDiaria/EstatCaixaDiaria`).subscribe({
      next: (data: any) => {

        this.haFetCaixaMati = !!data;
      },
      error: (error) => {
        console.log('no ha fet caixa mati')
        this.haFetCaixaMati = false;
      }
    });

    this.http.get<boolean>(`${this.api}/CaixaDiaria/EstatCaixaFinal`).subscribe({
      next: (data: any) => {
        console.log('ha fet caixa tarda' + data)
        this.haTancatDia = !!data;
      },
      error: (error) => {
        console.log('no ha fet caixa mati')
        this.haTancatDia = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // ──────────────────────────────────────────────
  // Barra inferior: torn, secció, health
  // ──────────────────────────────────────────────

  private minutsDelDia(d: Date): number {
    return d.getHours() * 60 + d.getMinutes();
  }

  private actualitzarTorn(): void {
    const hour = this.ara.getHours();
    if (hour >= this.MORNING_START_HOUR && hour < this.MORNING_END_HOUR) {
      this.tornActual = 'Torn matí';
    } else {
      this.tornActual = 'Torn tarda / nit';
    }
  }

  private getSeccioFromUrl(url: string): string {
    if (url.startsWith('/barra')) return 'Restaurant';
    if (url.startsWith('/terrassa')) return 'Caixa';
    if (url.startsWith('/comandaFinal')) return 'Comanda';
    if (url.startsWith('/menu-configuracio')) return 'Configuració';
    if (url.startsWith('/estadistiques')) return 'Estadístiques';
    if (url.startsWith('/historic-comandes')) return 'Històric';
    if (url.startsWith('/dividir-compte')) return 'Comanda';
    if (url.startsWith('/config')) return 'Configuració';
    return '';
  }

  private checkBackendStatus(): void {
    this.http.get(`${this.api}/health`, { responseType: 'text' }).subscribe({
      next: (data: any) => {
        this.online = data !== 'ERROR';
      },
      error: (error) => {
        console.error(error);
        this.online = false;

        this.notify.error('No tens connexio!');
      }
      });
  }


  get mostrarFerCaixaObligatori(): boolean {
    if (this.haFetCaixaMati) return false;

    const araMin = this.minutsDelDia(this.ara);
    const fiMatiMin = this.MORNING_END_HOUR * 60;
    const limitMin = fiMatiMin + this.FER_CAIXA_GRACE_MINUTES;

    return araMin >= limitMin;
  }

  get mostrarBannerFerCaixa(): boolean {
    return this.mostrarFerCaixaObligatori;
  }


  get popupTitle(): string {
    if (this.popupMode === 'mati') return 'Caixa del matí';
    if (this.popupMode === 'tarda') return 'Tancar dia';
    return '';
  }

  get popupConfirmText(): string {
    if (this.popupMode === 'mati') return 'Confirmar caixa matí';
    if (this.popupMode === 'tarda') return 'Confirmar tancament';
    return 'Confirmar';
  }

  onObrirPopupFerCaixaMati(): void {
    if (!this.online || this.haFetCaixaMati) return;

    // Demanem un resum del matí al backend (suma de pagaments de matí)
    this.http.get<ResumCaixa>(`${this.api}/CaixaDiaria/ResumMati`).subscribe({
      next: (data) => {
        console.log(data);
        this.resumCaixa = data;
        this.popupMode = 'mati';
        this.showPopup = true;
      },
      error: (error) => {
        this.notify.error('Error al obtenir la ciaxa');
        console.error(error)
      }
    });
  }

  // ──────────────────────────────────────────────
  // Flux: Tancar dia
  // ──────────────────────────────────────────────

  onObrirPopupTancarDia(): void {
    if (!this.online || this.haTancatDia || !this.haFetCaixaMati) return;

    this.http.get<ResumCaixa>(`${this.api}/CaixaDiaria/ResumTarda`).subscribe({
      next: (data) => {
        console.log(data);
        this.resumCaixa = data;
        console.log(this.resumCaixa)
        this.popupMode = 'tarda';
        this.showPopup = true;
        this.observacions = ' ';
      },
      error: (error) => {
        this.notify.error('Error al obtenir la ciaxa');
        console.error(error)
      }

    });
  }

  // ──────────────────────────────────────────────
  // Confirmar / Cancel·lar popup
  // ──────────────────────────────────────────────

  cancelarPopup(): void {
    this.showPopup = false;
    this.popupMode = null;
    this.resumCaixa = null;
    this.observacions = '';
  }

  confirmarPopup(): void {
    if (!this.popupMode || !this.resumCaixa) return;


    if(this.resumCaixa){
      this.resumCaixa.observacions = this.observacions;
    }
    console.log(this.resumCaixa);
    if (this.popupMode === 'mati') {
      // Confirmar caixa matí
      if (!confirm('Tancaras la caixa del matí i no podras fer canvis, estàs segur?')) return;
      this.http.post(`${this.api}/CaixaDiaria/PostCaixaMati`, this.resumCaixa).subscribe({
        next: (data) => {
          this.haFetCaixaMati = true;
          this.cancelarPopup();
          this.notify.success('Caixa matí feta!');
          this.obrirCalaix()

        },
        error: (error) => {
          console.error('Error fent caixa matí:', error);
          this.notify.error('No s’ha pogut fer la caixa del matí.');
        }
      });
    } else if (this.popupMode === 'tarda') {
      // Confirmar tancament del dia
      if (!confirm('Tancaras la caixa diaria i no podras fer canvis, estàs segur?')) return;

      this.http.put(`${this.api}/CaixaDiaria/PostCaixaTotal`, this.resumCaixa).subscribe({
        next: (data) => {
          this.haTancatDia = true;
          this.cancelarPopup();
          this.notify.success('Caixa diaria feta!');
          this.obrirCalaix()
        },
        error: (error) => {
          console.error('Error fent caixa diaria:', error);
          this.notify.error('No s’ha pogut fer la caixa final.');
        }
      });
    }
  }

  private obrirCalaix(): void {
    this.http.post(`${this.api}/Drawer/open`, {}).subscribe({
      next: () => console.log('Calaix obert'),
      error: err => console.error('Error obrint el calaix', err)
    });
  }
}
