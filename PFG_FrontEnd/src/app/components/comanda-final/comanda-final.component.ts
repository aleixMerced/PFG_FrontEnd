import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  ProducteComanda, Producte, Comanda, TipusProducte,
  LiniaComanda, Taula, NouEstoc
} from '../../interficies/interficies';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, forkJoin, Observable, of } from 'rxjs';
import { NotificacioService } from '../../shared/notificacio.service';
import { NavProtectionService } from '../../guards/nav-protection.service';
import { environment } from '../../../environments/environment';
import { Location } from '@angular/common';
import { MenuSelection } from '../menu-selector/menu-selector.component';

@Component({
  selector: 'app-comanda-final',
  standalone: false,
  templateUrl: './comanda-final.component.html',
  styleUrl: './comanda-final.component.scss'
})
export class ComandaFinalComponent implements OnInit, OnDestroy {

  tipusProducte: TipusProducte[] = [];
  productePerTipusEspecific: Producte[] = [];
  productesPertipus: Map<string, Producte[]> = new Map();

  isPressedUd = false;
  isPressedPr = false;
  nouValor: string = '';

  idComanda: number = 0;
  numComensals: number = 1;

  calculadoraEnable: boolean = false;

  producteSeleccionat: ProducteComanda | null = null;
  producteAux: ProducteComanda | null = null;

  producteComanda: ProducteComanda[] = [];

  productesPendents: ProducteComanda[] = [];
  productesPagats: ProducteComanda[] = [];

  guardar_cobrar: string = 'COBRAR';

  taulaSeleccionada: Taula | null = null;
  numTaula: string | undefined = undefined;
  taules: Taula[] = [];

  nomClient: string = '';
  nomClientAux: string = '';

  /* POPUPS */
  mostrarTaules: boolean = false;
  afegirNomComandaMSG: boolean = false;
  novaComandaMSG = false;
  eliminarComandaMSG: boolean = false;


  preuFinal: number = 0;
  readOnly = false;
  comandaGuardada: boolean = false;

  menuSelectorObert = false;
  menuDiariObert = false;
  menuProducteSeleccionat: Producte | null = null;

  esMigMenu: boolean = false;

  private readonly api = environment.apiBaseUrl;
  private routerSub?: Subscription;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, private notif: NotificacioService, private nav: NavProtectionService, private location: Location) {}

  ngOnInit() {
    const idParamRaw = this.route.snapshot.paramMap.get('idComanda');
    const id = Number(idParamRaw);

    const idTaula = Number(this.route.snapshot.paramMap.get('idTaula'));
    if (idTaula) {
      this.http.get<Taula>(`${this.api}/Taula/GetTaulaByID?idTaula=${idTaula}`).subscribe({
        next: taula => {
          this.taulaSeleccionada = taula;
          this.numTaula = taula.nomMostrat;
        },
        error: err => console.error(err)
      });
    } else {
      this.numTaula = 'barra';
    }

    if (Number.isFinite(id) && id > 0) {
      this.http.get<Comanda>(`${this.api}/Comanda/GetComandaByID?idComanda=${id}`).subscribe({
        next: data => {
          this.idComanda = data.idComanda;
          this.nomClient = data.nomClient || '';

          const estat = (data.estatComanda || '').toUpperCase();
          this.readOnly = estat !== 'PENDENT';

          this.http
            .get<Taula>(`${this.api}/Taula/GetTaulaByID?idTaula=${data.idTaula}`)
            .subscribe({
              next: taula => {
                this.taulaSeleccionada = taula;
                this.numTaula = taula.nomMostrat;
              },
              error: err => console.error(err)
            });

          this.loadLiniesComanda(data.idComanda);
        },
        error: error => console.error(error)
      });
    } else {
      this.numeroComanda();
    }

    this.omplirTipusProducte();
    this.obtenirTaules();

    this.nav.enable(() => {
      if (this.comandaGuardada) return true;
      if (this.producteComanda.length === 0) return true;
      if (this.readOnly) return true;
      return false;
    });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    console.log('ComandaFinalComponent destruït');
  }

  private loadLiniesComanda(idComanda: number) {
    const paramsPagats = new HttpParams()
      .set('idComanda', String(idComanda))
      .set('pagades', 'true');

    const paramsPendents = new HttpParams()
      .set('idComanda', String(idComanda))
      .set('pagades', 'false');

    forkJoin({
      pagats: this.http.get<ProducteComanda[]>(`${this.api}/Comanda/GetLiniaComanda`, { params: paramsPagats }),
      pendents: this.http.get<ProducteComanda[]>(`${this.api}/Comanda/GetLiniaComanda`, { params: paramsPendents })
    }).subscribe({
      next: ({ pagats, pendents }) => {
        this.productesPagats = pagats.map(p => ({
          idProducte: p.idProducte,
          nomProducte: p.nomProducte,
          unitats: p.unitats,
          preuUnitari: p.preuUnitari,
          total: p.total,
          pagat: true,
          preuPagat: p.total,
          stockDisponible: p.stockDisponible
        }));

        this.productesPendents = pendents.map(p => ({
          idProducte: p.idProducte,
          nomProducte: p.nomProducte,
          unitats: p.unitats,
          preuUnitari: p.preuUnitari,
          total: p.total,
          pagat: false,
          preuPagat: 0,
          stockDisponible: p.stockDisponible
        }));

        this.rebuildProducteComanda();
      },
      error: err => console.error('Error carregant línies de comanda:', err)
    });
  }

  private rebuildProducteComanda() {
    this.producteComanda = [
      ...this.productesPendents.map(p => ({ ...p, pagat: false })),
      ...this.productesPagats.map(p => ({ ...p, pagat: true }))
    ];

    this.preuFinal = this.producteComanda.reduce((acc, p) => acc + p.total, 0);
  }

  omplirTipusProducte() {
    this.http.get<any[]>(`${this.api}/TipusProducte/GetNomTipus`)
      .subscribe({
        next: dades => {
          this.tipusProducte = dades.map((x): TipusProducte => ({
            idTipus: x.idTipus,
            nomTipus: x.nomTipus.trim(),
            fotoTipus: x.fotoTipus
          }));

          this.tipusProducte.forEach((tipus, index) => {
            this.http
              .get<Producte[]>(`${this.api}/Producte/GetProducteByTipus?tipus=${tipus.nomTipus}`)
              .subscribe({
                next: dadesTipus => {
                  this.productesPertipus.set(tipus.nomTipus, dadesTipus);
                  if (index === 0) this.productePerTipusEspecific = dadesTipus;
                },
                error: error => console.error(error)
              });
          });
        },
        error: err => console.error(err)
      });
  }

  mostrarProductesTipus(tipus: string) {
    const producte = this.productesPertipus.get(tipus);
    if (producte) this.productePerTipusEspecific = producte;
  }

  /**
   * Afegeix "quantitat" unitats del producte d'un cop:
   * - update stock una sola vegada (quantitat = -qty)
   * - si la línia ja existeix pendent: PUT una sola vegada amb quantitat final
   * - si no existeix: POST una sola vegada amb quantitat qty
   */
  private afegirProducteAmbQuantitat(producte: Producte, quantitat: number) {
    if (this.readOnly) return;
    if (!quantitat || quantitat <= 0) return;

    this.updateStock(producte.idProducte, -quantitat, (newStock) => {
      this.comandaGuardada = false;

      let prodPend = this.productesPendents.find(p => p.idProducte === producte.idProducte);

      if (prodPend) {
        prodPend.unitats += quantitat;
        prodPend.total = prodPend.unitats * prodPend.preuUnitari;
        prodPend.stockDisponible = newStock;

        const body: LiniaComanda = {
          idComanda: this.idComanda,
          idProducte: prodPend.idProducte,
          preuMoment: prodPend.total,
          quantitat: prodPend.unitats
        };

        this.http.put<boolean>(`${this.api}/Comanda/ActualitzarLiniaComanda?idComanda=${this.idComanda}&idProducte=${prodPend.idProducte}`, body).subscribe({
          next: () => console.log('Línia pendent actualitzada (bulk qty)'),
          error: err => console.error(err)
        });

      } else {
        const nou: ProducteComanda = {
          idProducte: producte.idProducte,
          nomProducte: producte.nomProducte,
          unitats: quantitat,
          preuUnitari: producte.preuVenta,
          total: producte.preuVenta * quantitat,
          pagat: false,
          preuPagat: 0,
          stockDisponible: newStock
        };

        this.productesPendents.push(nou);

        const body: LiniaComanda = {
          idComanda: this.idComanda,
          idProducte: producte.idProducte,
          preuMoment: nou.total,
          quantitat: quantitat
        };

        this.http.post<LiniaComanda>(`${this.api}/Comanda/PostProducteComanda`, body).subscribe({
          next: () => console.log('Línia pendent creada (bulk qty)'),
          error: err => console.error(err)
        });
      }

      this.rebuildProducteComanda();
    });
  }

  afegirProducte(producte: Producte) {
    this.afegirProducteAmbQuantitat(producte, 1);
  }

  onMenuLlest(seleccio: MenuSelection) {
    console.log('Selecció menú rebuda', seleccio);

    this.afegirProducteAmbQuantitat(seleccio.menu, seleccio.totalMenus);

    if (seleccio.suplementCount > 0) {
      this.afegirProducteAmbQuantitat(seleccio.suplement, seleccio.suplementCount);
    }

    this.menuSelectorObert = false;
    this.menuProducteSeleccionat = null;
  }

  onNumberClick(numero: string) {
    if (this.readOnly) return;
    if (!this.producteSeleccionat) return;
    if (this.producteSeleccionat.pagat) return;

    if (this.isPressedUd) {
      if (numero === ',') return;

      this.nouValor += numero;
      this.producteSeleccionat.unitats = Number(this.nouValor);
      this.producteSeleccionat.total =
        this.producteSeleccionat.unitats * this.producteSeleccionat.preuUnitari;
    }

    if (this.isPressedPr) {
      if (numero === ',') {
        if (this.nouValor.includes(',')) return;

        if (this.nouValor === '') this.nouValor = '0,';
        else this.nouValor += ',';
      } else {
        if (this.nouValor.includes(',')) {
          const decimals = this.nouValor.split(',')[1];
          if (decimals.length >= 2) return;
        }
        this.nouValor += numero;
      }

      const valorNum = parseFloat(this.nouValor.replace(',', '.'));
      this.producteSeleccionat.total = isNaN(valorNum) ? 0 : valorNum;
    }
  }

  borrar() {
    if (!this.isPressedPr && !this.isPressedUd) return;
    if (!this.producteSeleccionat) return;
    if (this.producteSeleccionat.pagat) return;

    if (this.isPressedUd) {
      let nou = this.producteSeleccionat.unitats.toString();
      nou = this.EliminarUltimCaracter(nou);
      this.producteSeleccionat.unitats = Number(nou || '0');
      this.nouValor = nou;
      this.producteSeleccionat.total =
        this.producteSeleccionat.unitats * this.producteSeleccionat.preuUnitari;
    }

    if (this.isPressedPr) {
      let nou = this.producteSeleccionat.total.toString();
      nou = this.EliminarUltimCaracter(nou);
      this.producteSeleccionat.total = Number(nou || '0');
      this.nouValor = nou;
    }
  }

  isPressed1(tipus: string) {
    if (tipus === 'UD') {
      if (!this.isPressedUd && !this.isPressedPr) this.isPressedUd = true;
      else if (!this.isPressedUd && this.isPressedPr) { this.isPressedPr = false; this.isPressedUd = true; }
      else if (this.isPressedUd) this.isPressedUd = false;
    } else {
      if (!this.isPressedPr && !this.isPressedUd) this.isPressedPr = true;
      else if (!this.isPressedPr && this.isPressedUd) { this.isPressedUd = false; this.isPressedPr = true; }
      else if (this.isPressedPr) this.isPressedPr = false;
    }
  }

  editar(producte: ProducteComanda) {
    if (this.readOnly) return;
    if (producte.pagat) return;

    this.producteSeleccionat = producte;
    this.producteAux = { ...producte };
    this.calculadoraEnable = true;
    this.guardar_cobrar = 'GUARDAR';
    this.nouValor = '';
    this.isPressedUd = false;
    this.isPressedPr = false;
  }

  CancelarProducte() {
    if (this.producteSeleccionat && this.producteAux) {
      Object.assign(this.producteSeleccionat, this.producteAux);
    }
    this.producteSeleccionat = null;
    this.calculadoraEnable = false;
    this.guardar_cobrar = 'COBRAR';
    this.isPressedPr = false;
    this.isPressedUd = false;
    this.preuFinal = this.producteComanda.reduce((acc, p) => acc + p.total, 0);
  }

  restarUds() {
    if (this.readOnly) return;
    if (!this.producteSeleccionat) return;
    if (this.producteSeleccionat.pagat) return;

    this.comandaGuardada = false;

    this.producteSeleccionat.unitats -= 1;
    this.producteSeleccionat.total -= this.producteSeleccionat.preuUnitari;

    if (this.producteSeleccionat.unitats <= 0) {
      this.GuardarCobrar();
    } else {
      this.preuFinal = this.producteComanda.reduce((acc, p) => acc + p.total, 0);
    }
  }

  GuardarCobrar() {
    if (this.guardar_cobrar === 'GUARDAR' && this.producteSeleccionat && this.producteAux) {
      const sel = this.producteSeleccionat;

      if (this.readOnly) return;
      if (sel.pagat) return;

      const oldUnits = this.producteAux.unitats;
      const newUnits = sel.unitats;
      const deltaUnits = newUnits - oldUnits;

      this.updateStockByDeltaUnits(sel.idProducte, deltaUnits,
        (newStock) => {
          if (!Number.isNaN(newStock)) sel.stockDisponible = newStock;
          this.guardarLiniaPendent(sel);
          this.tancarEdicio();
          this.rebuildProducteComanda();
        },
        () => {
          this.notif.error('No hi ha estoc suficient');
          Object.assign(sel, this.producteAux!);
          this.tancarEdicio();
          this.rebuildProducteComanda();
        }
      );

      return;
    }

    this.cobrarComanda();
  }

  private guardarLiniaPendent(sel: ProducteComanda) {
    const idxPend = this.productesPendents.findIndex(p => p.idProducte === sel.idProducte);

    if (sel.unitats <= 0) {
      if (idxPend !== -1) this.productesPendents.splice(idxPend, 1);
    } else {
      const liniaActualitzada: ProducteComanda = {
        idProducte: sel.idProducte,
        nomProducte: sel.nomProducte,
        unitats: sel.unitats,
        preuUnitari: sel.preuUnitari,
        total: sel.total,
        pagat: false,
        preuPagat: 0,
        stockDisponible: sel.stockDisponible
      };

      if (idxPend !== -1) this.productesPendents[idxPend] = liniaActualitzada;
      else this.productesPendents.push(liniaActualitzada);
    }

    const body: LiniaComanda = {
      idComanda: this.idComanda,
      idProducte: sel.idProducte,
      quantitat: sel.unitats,
      preuMoment: sel.total
    };

    this.http.put<boolean>(`${this.api}/Comanda/ActualitzarLiniaComanda?idComanda=${this.idComanda}&idProducte=${sel.idProducte}`, body).subscribe({
      next: () => console.log('Línia pendent actualitzada/eliminada des de GuardarCobrar'),
      error: err => console.error('Error actualitzant línia pendent', err)
    });
  }

  private tancarEdicio() {
    this.producteSeleccionat = null;
    this.producteAux = null;
    this.calculadoraEnable = false;
    this.guardar_cobrar = 'COBRAR';
    this.isPressedPr = false;
    this.isPressedUd = false;
    this.nouValor = '';
  }

  numeroComanda() {this.http.get<number>(`${this.api}/Comanda/GetLastID`).subscribe({
      next: response => {
        this.idComanda = response;

        const comanda: Comanda = {
          idComanda: response,
          nomClient: this.nomClient,
          estatComanda: 'PENDENT',
          dataComanda: new Date().toISOString(),
          tipusPagament: null,
          preuComanda: this.preuFinal,
          idTaula: this.taulaSeleccionada?.idTaula ?? 99,
          Productes: this.producteComanda
        };

        this.http.post<boolean>(`${this.api}/Comanda/PostComanda`, comanda).subscribe({
          next: () => {
            console.log('Comanda creada');

            if (this.taulaSeleccionada?.idTaula != 99) {
              console.log(this.taulaSeleccionada?.idTaula)
              console.log("AQUI5")
              this.http.put<void>(`${this.api}/Taula/CanviarEstatTaula?id=${this.taulaSeleccionada?.idTaula}`, null
              ).subscribe({
                next: () => console.log('Estat taula actualitzat'),
                error: err => console.error(err)
              });
            }
          },
          error: err => console.error(err)
        });
      },
      error: error => console.error(error)
    });
  }

  ficarNumTaula() {
    if (this.readOnly) return;
    this.mostrarTaules = true;
  }

  obtenirTaules() {this.http.get<Taula[]>(`${this.api}/Taula/GetTaulesActives`).subscribe({
      next: response => {
        this.taules = response.filter(t => t.idTaula < 99);
      },
      error: error => console.error(error)
    });
  }

  cobrarComanda() {
    this.comandaGuardada = true;
    const totalArrodonit = Math.round(this.preuFinal * 100) / 100;

    this.router.navigate(['/dividir-compte', this.idComanda], {
      queryParams: { total: totalArrodonit }
    });
  }

  afegirNom() {
    this.nomClient = this.nomClientAux;
    this.afegirNomComandaMSG = false;
  }

  novaComanda() {
    if (!this.idComanda) return;

    this.http.post<void>(`${this.api}/Comanda/CancelarComanda?idComanda=${this.idComanda}`, null).subscribe({
      next: () => {
        console.log('COMANDA ESBORRADA!');
        this.resetComanda();
        this.novaComandaMSG = false;
      },
      error: error => console.error(error)
    });
  }

  afegirComanda() {
    if (!this.idComanda || this.idComanda <= 0) {
      console.error('idComanda invàlid a afegirComanda');
      return;
    }
    this.comandaGuardada = true;

    this.http.get<Comanda | null>(`${this.api}/Comanda/GetComandaByID?idComanda=${this.idComanda}`).subscribe({
      next: (existeix) => {
        if (existeix && existeix.idComanda) {
          const bodyUpdate = {
            idComanda: existeix.idComanda,
            nomClient: this.nomClient || existeix.nomClient,
            estatComanda: existeix.estatComanda,
            dataComanda: existeix.dataComanda,
            dataPagament: existeix.dataPagament,
            tipusPagament: existeix.tipusPagament,
            preuComanda: this.preuFinal,
            idTaula: this.taulaSeleccionada?.idTaula ?? existeix.idTaula,
            Productes: this.productesPendents
          };

          this.http.put(`${this.api}/Comanda/PutComanda`, bodyUpdate).subscribe({
            next: () => console.log('Comanda actualitzada (guardada)'),
            error: err => {
              console.error('Error fent PUT de comanda', err);
              this.comandaGuardada = false;
              this.notif.error('Error guardant comanda');
            }
          });
        } else {
          const bodyNova = {
            idComanda: this.idComanda,
            nomClient: this.nomClient || (this.taulaSeleccionada ? `Taula ${this.taulaSeleccionada.idTaula}` : ''),
            estatComanda: 'PENDENT',
            dataComanda: new Date().toISOString(),
            dataPagament: null,
            tipusPagament: null,
            preuComanda: this.preuFinal,
            idTaula: this.taulaSeleccionada?.idTaula ?? 99
          };

          this.http.post(`${this.api}/Comanda/PostComanda`, bodyNova).subscribe({
            next: () => {
              console.log('Comanda creada (guardada)');
              this.comandaGuardada = true;
              this.notif.success('Comanda guardada correctament');
            },
            error: err => {
              console.error('Error fent POST de comanda', err);
              this.comandaGuardada = false;
              this.notif.error('Error guardant comanda');
            }
          });
        }
      },
      error: err => {
        if (err.status === 404) {
          const bodyNova = {
            idComanda: this.idComanda,
            nomClient: this.nomClient || (this.taulaSeleccionada ? `Taula ${this.taulaSeleccionada.idTaula}` : ''),
            estatComanda: 'PENDENT',
            dataComanda: new Date().toISOString(),
            dataPagament: null,
            tipusPagament: null,
            preuComanda: this.preuFinal,
            idTaula: this.taulaSeleccionada?.idTaula ?? 99
          };

          this.http.post(`${this.api}/Comanda/PostComanda`, bodyNova).subscribe({
            next: () => {
              console.log('Comanda creada després d’error al GET');
              this.comandaGuardada = true;
              this.notif.success('Comanda guardada correctament');
            },
            error: err2 => {
              console.error('Error fent POST de comanda', err2);
              this.comandaGuardada = false;
              this.notif.error('Error guardant comanda');
            }
          });
        } else {
          console.error('Error mirant si existeix la comanda', err);
          this.comandaGuardada = false;
          this.notif.error('Error validant comanda');
        }
      }
    });

    this.notif.success('Comanda guardada correctament');
    this.location.back();
  }

  public convidarComanda() {
    if (this.producteComanda.length > 0) {
      const comanda = {
        idComanda: this.idComanda,
        nomClient: this.nomClient || (this.taulaSeleccionada ? `Taula convidada ${this.taulaSeleccionada.idTaula}` : ''),
        estatComanda: 'CONVIDAT',
        dataComanda: new Date().toISOString(),
        dataPagament: new Date().toISOString(),
        tipusPagament: null,
        preuComanda: 0,
        idTaula: this.taulaSeleccionada ?? 99
      };

      this.http.put(`${this.api}/Comanda/PutComanda`, comanda).subscribe({
        next: () => {
          console.log('Comanda actualitzada (CONVIDAT)');
          this.comandaGuardada = true;
          this.notif.success('Comanda guardada correctament');
        },
        error: error => {
          console.error('PUT error:', error);
          this.comandaGuardada = false;
          this.notif.error('Error al guardar la comanda');
        }
      });

      this.resetComanda();
    }
  }

  public onTaulaSeleccionadaChange(t: Taula | null) {
    this.taulaSeleccionada = t;
    this.numTaula = t?.nomMostrat ?? undefined;
    this.mostrarTaules = false;
  }

  private resetComanda() {
    this.producteComanda = [];
    this.productesPendents = [];
    this.productesPagats = [];
    this.numeroComanda();
    this.nomClient = '';
    this.taulaSeleccionada = null as any;
    this.numComensals = 1;
    this.preuFinal = 0;
    this.mostrarTaules = false;
    this.afegirNomComandaMSG = false;
    this.calculadoraEnable = false;
  }

  obrirCalaix() {
    this.http.post(`${this.api}/Drawer/open`, {}).subscribe({
      next: () => console.log(' Calaix obert'),
      error: err => console.error(' Error obrint el calaix', err)
    });
  }

  imprimirTicketFinal() {
    this.http.post(`${this.api}/Drawer/ticketFinal`, this.idComanda).subscribe({
      next: () => console.log('Ticket imprès correctament'),
      error: (err) => console.error('Error imprimint ticket', err)
    });
  }

  EliminarUltimCaracter(car: string): string {
    return car.length ? car.slice(0, -1) : car;
  }

  onClickProducte(producte: Producte) {
    if (this.readOnly) return;

    const esMenu = producte.nomTipus === 'MENU' || producte.nomTipus === 'Menu';
    this.esMigMenu = producte.idProducte === 12 || producte.idProducte === 13;

    if (esMenu) {
      this.menuProducteSeleccionat = producte;
      this.menuSelectorObert = true;
    } else {
      this.afegirProducte(producte);
    }
  }

  tancarMenuSelector() {
    this.menuSelectorObert = false;
    this.menuProducteSeleccionat = null;
  }

  tancarMenuDiari(): void {
    this.menuDiariObert = false;
  }

  private buildImgUrl(path?: string | null): string {
    if (!path || !path.trim()) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    const cleanPath = path.startsWith('/') ? path : '/' + path;
    return environment.apiBaseUrl + cleanPath;
  }

  getTipusImg(tipus: TipusProducte): string {
    return this.buildImgUrl(tipus.fotoTipus);
  }

  getProducteImg(producte: Producte): string {
    return this.buildImgUrl(producte.imatgeProducte);
  }

  private updateStock(idProducte: number, deltaStock: number, onOk: (newStock: number) => void, onFail?: () => void) {
    const body = {
      idProducte: idProducte.toString(),
      quantitat: deltaStock.toString()
    };

    this.http.put<NouEstoc>(`${this.api}/Producte/UpdateStock`, body)
      .subscribe({
        next: (data) => {
          if (data.warning) this.notif.warning(data.message ?? 'Estoc per sota limits');
          onOk(data.newStock);
        },
        error: (err) => {
          if (err?.status === 409) {
            this.notif.error(err.error?.message ?? 'No hi ha estoc');
          } else {
            this.notif.error('Error actualitzant stock');
            console.error(err);
          }
          if (onFail) onFail();
        }
      });
  }

  obrirEliminarComanda() {
    if (this.readOnly) return;
    this.eliminarComandaMSG = true;
  }

  confirmarEliminarComanda() {
    if (!this.idComanda) return;
    this.comandaGuardada = true;
    const idTaula = this.taulaSeleccionada?.idTaula;

    this.http.post<void>(`${this.api}/Comanda/CancelarComanda?idComanda=${this.idComanda}`, null).subscribe({
      next: () => {
      this.eliminarComandaMSG = false;

        this.http.get<number>(`${this.api}/Taula/GetCountTaules?idTaula=${idTaula}`).subscribe({
          next: (data) => {
            if (data === 0) {
              this.http.put<boolean>(`${this.api}/Taula/CanviarEstatTaula?id=${idTaula}`, {})
                .subscribe({
                  next: () => {
                    this.notif.success('Comanda eliminada i taula desocupada');
                    this.eliminarComandaMSG = false;
                    this.router.navigate(['/barra']);
                  },
                  error: (err) => {
                    console.error(err);
                    this.notif.warning('Comanda eliminada, però no s’ha pogut desocupar la taula');
                    this.eliminarComandaMSG = false;
                    this.router.navigate(['/barra']);
                  }
                });
            } else {
              this.notif.success('Comanda eliminada');
              this.eliminarComandaMSG = false;
              this.router.navigate(['/barra']);
            }
          },
          error: (err) => {
            console.error(err);
            // Si no podem comprovar, no toquem la taula per seguretat
            this.notif.success('Comanda eliminada');
            this.eliminarComandaMSG = false;
            this.router.navigate(['/barra']);
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.notif.error('Error eliminant la comanda');
      }
    });
  }


  private updateStockByDeltaUnits(idProducte: number, deltaUnits: number, onOk: (newStock: number) => void, onFail?: () => void) {
    if (deltaUnits === 0) {
      onOk(NaN);
      return;
    }
    const deltaStock = -deltaUnits;
    this.updateStock(idProducte, deltaStock, onOk, onFail);
  }

  public cancelarComandaEnSortir(): Observable<void> {
    if (!this.idComanda) return of(void 0);
    return this.http.post<void>(`${this.api}/Comanda/CancelarComanda?idComanda=${this.idComanda}`, null);
  }
}
