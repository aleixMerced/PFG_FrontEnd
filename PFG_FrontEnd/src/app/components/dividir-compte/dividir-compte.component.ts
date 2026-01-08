import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, firstValueFrom } from 'rxjs';

import { Comanda, ProducteComanda, LiniaComanda } from '../../interficies/interficies';
import { NavProtectionService } from '../../guards/nav-protection.service';
import { environment } from '../../../environments/environment';
import { NotificacioService } from '../../shared/notificacio.service';

type MetodePagament = 'efectiu' | 'targeta';

@Component({
  selector: 'app-dividir-compte',
  standalone: false,
  templateUrl: './dividir-compte.component.html',
  styleUrl: './dividir-compte.component.scss',
})
export class DividirCompteComponent implements OnInit, OnDestroy {

  comanda: Comanda | null = null;
  producteSeleccionat: ProducteComanda | null = null;
  comensales: number | null = null;

  ProductesPendentPagament: ProducteComanda[] = [];
  ProductesPagats: ProducteComanda[] = [];

  mostrarpad = false;
  mostrarPagament = false;
  showTeclat = false;

  metodePagament: MetodePagament = 'targeta';
  importACobrar = 0;
  efectiuPagat: number | null = null;

  // Fraccions / unitats
  UseFraccions = true;
  UdsPagar = 0;

  // Control de divisió de comanda
  divisionMode = false;
  partsLeft = 0;
  partIndex = 0;
  basePart = 0;
  lastPart = 0;

  totalComanda = 0;

  totPagat = false;
  allPaid = false;
  savedToBackend = false;
  seguirAfegint = false;

  private pagatsCom = new Set<MetodePagament>();

  private readonly api = environment.apiBaseUrl;


  constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient, private nav: NavProtectionService, private notif: NotificacioService) {}



  ngOnInit(): void {
    this.nav.enable(() => !this.teCanvisPendents());

    const idParam = this.route.snapshot.paramMap.get('id');
    const idComanda = Number(idParam);

    const totalParam = this.route.snapshot.queryParamMap.get('total');
    this.totalComanda = totalParam ? Number(totalParam) : 0;

    if (!idComanda || isNaN(idComanda)) {
      console.error('ID de comanda invàlid:', idParam);
      this.notif.error('ID de comanda invàlid');
      this.router.navigate(['/barra']);
      return;
    }

    this.http.get<Comanda>(`${this.api}/Comanda/GetComandaByID?idComanda=${idComanda}`).subscribe({
        next: (comanda) => {
          this.comanda = comanda;
          this.allPaid = false;
          this.savedToBackend = false;

          // Carregar línies pagades i pendents
          this.getLinies(this.comanda.idComanda, true).subscribe((d) => {
            this.ProductesPagats = d;
          });

          this.getLinies(this.comanda.idComanda, false).subscribe((d) => {
            this.ProductesPendentPagament = d;
          });
        },
        error: (err) => {
          console.error('Error carregant comanda:', err);
          this.notif.error('No s’ha pogut carregar la comanda');
          this.router.navigate(['/barra']);
        },
      });
  }

  ngOnDestroy(): void {
    this.nav.disable();
  }

  teCanvisPendents(): boolean {
    if (this.seguirAfegint) return false;
    const modalObert = this.mostrarPagament || this.divisionMode;
    const hiHaPendents = (this.ProductesPendentPagament?.length ?? 0) > 0;
    const noGuardat = !(this.allPaid && this.savedToBackend);

    return modalObert || hiHaPendents || noGuardat;
  }


  getLinies(idComanda: number, pagades: boolean): Observable<ProducteComanda[]> {
    const params = new HttpParams()
      .set('idComanda', String(idComanda))
      .set('pagades', String(pagades));

    return this.http.get<ProducteComanda[]>(`${this.api}/Comanda/GetLiniaComanda`, { params }
    );
  }


  get totalPendent(): number {
    return this.ProductesPendentPagament.reduce(
      (sum, p) => sum + p.total,
      0
    );
  }

  get totalPagat(): number {
    return this.ProductesPagats.reduce((sum, p) => sum + p.total, 0);
  }

  get porcentatgePagat(): number {
    if (!this.totalComanda) return 0;
    return (this.totalPagat / this.totalComanda) * 100;
  }



  pagarProducto(producte: ProducteComanda) {
    this.mostrarpad = true;
    this.producteSeleccionat = producte;
    this.UseFraccions = true;
  }

  seguirAfegintProducte() {
    this.seguirAfegint = true;
    if (!this.comanda) return;
    this.router.navigate(['/comandaFinal', this.comanda.idComanda]);
  }

  pagarTotaComanda() {
    this.totPagat = true;
    this.divisionMode = false;
    this.producteSeleccionat = null;

    this.importACobrar = this.totalPendent;
    this.metodePagament = 'targeta';
    this.efectiuPagat = null;
    this.mostrarPagament = true;
  }

  dividirComanda() {
    this.UseFraccions = false;
    this.mostrarpad = true;
    this.producteSeleccionat = null;
    this.totPagat = false;
  }

  cancelarPagament() {
    this.mostrarPagament = false;

    if (this.divisionMode) {
      this.divisionMode = false;
      this.partsLeft = 0;
      this.partIndex = 0;
      this.basePart = 0;
      this.lastPart = 0;
    }

    this.totPagat = false;
    this.importACobrar = 0;
    this.efectiuPagat = null;
    this.producteSeleccionat = null;
  }


  onPadConfirmed(value: string) {
    this.mostrarpad = false;

    // ── Mode fraccions de producte
    if (this.UseFraccions) {
      this.UdsPagar = Number(value);

      const parsed = value.includes('/')
        ? Number(value.split('/')[0]) / Number(value.split('/')[1])
        : Number(value);

      this.mostrarPagament = true;
      if (this.producteSeleccionat) {
        this.importACobrar = parsed * this.producteSeleccionat.preuUnitari;

      }
      return;
    }

    // ── Mode "Partir comanda": value = Nº de parts
// ── Mode "Partir comanda": value = Nº de parts
    const n = Number(value);
    const total = this.totalPendent ?? 0;
    if (!n || n < 1 || total <= 0) return;

// Treballem en cèntims
    const totalCents = Math.round(total * 100);

// part base en cèntims
    const baseCents = Math.floor(totalCents / n);

    const lastCents = totalCents - baseCents * (n - 1);

    this.divisionMode = true;
    this.partsLeft = n;
    this.partIndex = 1;

    this.basePart = baseCents / 100;
    this.lastPart = lastCents / 100;

    this.importACobrar = (this.partsLeft === 1)
      ? this.lastPart
      : this.basePart;

    this.metodePagament = 'targeta';
    this.efectiuPagat = null;
    this.mostrarPagament = true;

  }


  setQuick(val: number) {
    this.efectiuPagat = (this.efectiuPagat ?? 0) + val;
  }

  get canvi(): number {
    if (this.metodePagament !== 'efectiu' || this.efectiuPagat == null) return 0;
    return this.efectiuPagat - this.importACobrar;
  }

  get potConfirmarPagament(): boolean {
    if (this.divisionMode) {
      if (this.metodePagament === 'targeta') return true;
      return (this.efectiuPagat ?? 0) >= this.importACobrar;
    }

    if (this.totPagat) {
      if (this.metodePagament === 'targeta') return true;
      return (this.efectiuPagat ?? 0) >= this.importACobrar;
    }

    if (this.metodePagament === 'targeta') return true;
    if (!this.producteSeleccionat) return false;
    return (this.efectiuPagat ?? 0) >= this.importACobrar;
  }

  onTeclatOk(amount: number) {
    if (this.metodePagament === 'efectiu') {
      this.efectiuPagat = amount;
    }
    this.showTeclat = false;
  }


  private registrarPagamentBackend(importCobrat: number): Observable<any> {
    if (!this.comanda) {
      return of(null);
    }

    const tipusPagamentId = this.metodePagament === 'efectiu' ? 'E' : 'T';

    const body = {
      IdComanda: this.comanda.idComanda,
      TipusPagament: tipusPagamentId,
      Total: importCobrat,
    };

    return this.http.post(`${this.api}/Comanda/AfegirPagament`, body);
  }



  private async pagarTotesLiniesPendents(): Promise<void> {
    if (!this.comanda) return;

    for (const linia of this.ProductesPendentPagament) {

      const jaEsPagat = this.ProductesPagats.some(
        p => p.idProducte === linia.idProducte
      );

      const body: LiniaComanda = {
        idComanda: this.comanda.idComanda,
        idProducte: linia.idProducte,
        // total línia arrodonit cap amunt
        preuMoment: linia.preuUnitari * linia.unitats,
        quantitat: linia.unitats,
      };

      console.log(body);

      if (!jaEsPagat) {
        await firstValueFrom(
          this.http.post(`${this.api}/Comanda/AfegirLiniaComandaPagada`, body)
        );
      } else {
        await firstValueFrom(
          this.http.put(`${this.api}/Comanda/ActualitzarLiniaComandaPagada`, body)
        );
      }

      await firstValueFrom(
        this.http.delete<boolean>(`${this.api}/Comanda/DeleteLiniaComanda?idComanda=${this.comanda.idComanda}&idProducte=${linia.idProducte}&quantitat=${linia.unitats}`)
      );
    }

    const [pagats, pendents] = await Promise.all([
      firstValueFrom(this.getLinies(this.comanda.idComanda, true)),
      firstValueFrom(this.getLinies(this.comanda.idComanda, false)),
    ]);

    this.ProductesPagats = pagats;
    this.ProductesPendentPagament = pendents;
  }

  async confirmarPagament() {
    this.pagatsCom.add(this.metodePagament);

    let keepModalOpen = false;
    this.savedToBackend = false;

    try {
      // ───── Mode DIVISIÓ DE COMANDA ─────
      if (this.divisionMode) {
        await firstValueFrom(this.registrarPagamentBackend(this.importACobrar));

        await this.obrirCalaix();

        this.partsLeft--;

        if (this.partsLeft > 0) {
          keepModalOpen = true;
          this.partIndex++;

          this.importACobrar = (this.partsLeft === 1)
            ? this.lastPart
            : this.basePart;

          this.efectiuPagat = null;
          this.savedToBackend = true;
          return;
        }

        // Ja hem cobrat totes les parts
        this.divisionMode = false;

        // Passem totes les línies pendents a "pagades" a la BD
        await this.pagarTotesLiniesPendents();

        this.allPaid = true;
        this.savedToBackend = true;
        this.pagatsCom.clear();
        this.totPagat = false;

        return;
      }

      if (this.totPagat) {
        // 1) Registrar pagament total
        await firstValueFrom(
          this.registrarPagamentBackend(this.totalPendent)
        );

        // 2) Obrir calaix si és efectiu
        await this.obrirCalaix();

        // 3) Passar totes les línies pendents a pagades
        await this.pagarTotesLiniesPendents();

        this.allPaid = true;
        this.savedToBackend = true;
        this.pagatsCom.clear();
        this.totPagat = false;

        return;
      }

      if (!this.producteSeleccionat || !this.comanda) return;

      const jaEsPagat = this.ProductesPagats.some(
        (p) => p.idProducte === this.producteSeleccionat!.idProducte
      );

      const body: LiniaComanda = {
        idComanda: this.comanda.idComanda,
        idProducte: this.producteSeleccionat.idProducte,
        preuMoment: this.importACobrar,
        quantitat: this.UdsPagar,
      };

      if (!jaEsPagat) {
        await firstValueFrom(
          this.http.post(`${this.api}/Comanda/AfegirLiniaComandaPagada`, body)
        );
      } else {
        await firstValueFrom(
          this.http.put(`${this.api}/Comanda/ActualitzarLiniaComandaPagada`, body)
        );
      }

      await firstValueFrom(
        this.http.delete<boolean>(`${this.api}/Comanda/DeleteLiniaComanda?idComanda=${this.comanda.idComanda}&idProducte=${this.producteSeleccionat.idProducte}&quantitat=${this.UdsPagar}`)
      );

      const [pagats, pendents] = await Promise.all([
        firstValueFrom(this.getLinies(this.comanda.idComanda, true)),
        firstValueFrom(this.getLinies(this.comanda.idComanda, false)),
      ]);

      this.ProductesPagats = pagats;
      this.ProductesPendentPagament = pendents;

      // Registrar el pagament d'aquest producte
      await firstValueFrom(
        this.registrarPagamentBackend(this.importACobrar)
      );

      // Obrir calaix si és efectiu
      await this.obrirCalaix();

      if (this.ProductesPendentPagament.length === 0) {
        this.allPaid = true;
        this.savedToBackend = true;
        this.pagatsCom.clear();
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!keepModalOpen) {
        this.mostrarPagament = false;
        this.producteSeleccionat = null;
        this.importACobrar = 0;
        this.efectiuPagat = null;
        this.totPagat = false;
      }
    }
  }

  private async obrirCalaix(): Promise<void> {
    if (!this.metodePagament || this.metodePagament.toLowerCase() !== 'efectiu') {
      return;
    }

    try {
      await firstValueFrom(
        this.http.post(`${this.api}/Drawer/open`, {}
        )
      );
    } catch (error) {
      console.error('Error obrint el calaix:', error);
      this.notif.error('Error al obrir el calaix');
    }
  }


  finalitzarPagament(tipus: string) {
    const seguir = window.confirm('Estas apunt de tancar la comanda i no podra ser modificada. Vols seguir?'
    );

    if (!seguir || !this.comanda) return;

    console.log(this.metodePagament);
    const body = {
      idComanda: this.comanda.idComanda,
      tipusPagament: this.metodePagament,
      Total: this.totalComanda,
    };

    let correcte = false;

    this.http.put(`${this.api}/Comanda/FinalitzarPagament`, body).subscribe({
      next: async () => {
        this.comanda!.estatComanda = 'PAGADA' as any;
        this.comanda!.tipusPagament = tipus as any;
        this.comanda!.dataPagament = new Date().toISOString() as any;

        // Imprimir ticket (encara que després falli desocupar)
        await this.imprimirTicketFinal(this.comanda!.idComanda);

        // Comprovar taula i desocupar només si count === 0
        if (this.comanda!.idTaula !== 99) {
          this.http.get<number>(`${this.api}/Taula/GetCountTaules?idTaula=${this.comanda!.idTaula}`)
            .subscribe({
              next: (count) => {
                if (count === 0) {
                  this.http.put<boolean>(`${this.api}/Taula/CanviarEstatTaula?id=${this.comanda!.idTaula}`, {})
                    .subscribe({
                      next: () => {
                        this.notif.success('Comanda tancada, ticket imprès i taula desocupada.');
                        this.router.navigate(['/barra']);
                      },
                      error: (error) => {
                        this.notif.warning('Comanda tancada i ticket imprès, però error desocupant la taula.');
                        console.error(error);
                        this.router.navigate(['/barra']);
                      }
                    });
                } else {
                  this.notif.info('Comanda tancada i ticket imprès, però hi ha més comandes obertes a la taula.');
                  this.router.navigate(['/barra']);
                }
              },
              error: (error) => {
                this.notif.warning('Comanda tancada i ticket imprès, però error obtenint comandes de la taula.');
                console.error(error);
                this.router.navigate(['/barra']);
              }
            });

        } else {
          this.notif.success('Comanda tancada i ticket imprès.');
          this.router.navigate(['/barra']);
        }
      }

      });

  }

  private imprimirTicketFinal(idComanda: number): Promise<void> {
    return firstValueFrom(
      this.http.post(`${this.api}/Drawer/ticketFinal`, idComanda)
    ).then(() => {
      console.log('Ticket imprès correctament');
    }).catch((err) => {
      console.error('Error imprimint ticket', err);
      this.notif.warning('Comanda tancada, però error imprimint el ticket');
    });
  }

}
