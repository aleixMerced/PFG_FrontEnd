import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Producte } from '../../interficies/interficies';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { NotificacioService } from '../../shared/notificacio.service';

interface PlatMenu {
  idPlat: number;
  categoria: 'P' | 'S';
  nomPlat: string;

  quantitat: number;
  observacions: string;
  mostrarObservacions: boolean;
}

export interface MenuSelection {
  menu: Producte;
  suplement: Producte;
  totalMenus: number;
  suplementCount: number;
}

@Component({
  selector: 'app-menu-selector',
  standalone: false,
  templateUrl: './menu-selector.component.html',
  styleUrl: './menu-selector.component.scss'
})
export class MenuSelectorComponent implements OnInit {

  @Input() menuProducte!: Producte;
  @Output() tancar = new EventEmitter<void>();
  @Output() llest = new EventEmitter<MenuSelection>();
  @Input() idTaula: string = 'Barra';
  @Input() mode: 'select' | 'view' = 'select';

  // mig: llista única i quantitats per plat
  @Input() migMenu: 'sencer' | 'mig' = 'sencer';

  carregant = false;
  errorCarrega = false;

  private totsPlatsOriginal: PlatMenu[] = [];

  // sencer
  primersEspecial: PlatMenu[] = [];
  segonsEspecial: PlatMenu[] = [];
  primers: PlatMenu[] = [];
  segons: PlatMenu[] = [];

  // mig
  platsMigMenu: PlatMenu[] = [];

  menuEspecial = false;

  primersOberts = true;
  segonsOberts = true;

  suplementCount = 0;
  suplementProducte!: Producte;

  private readonly api = environment.apiBaseUrl;

  constructor(private http: HttpClient, private notify: NotificacioService) {}

  ngOnInit(): void {
    this.carregarPlats();

    if (!this.esView) {
      this.http.get<Producte>(`${this.api}/Producte/GetProducteById?id=121`).subscribe({
        next: data => this.suplementProducte = data,
        error: error => console.error(error)
      });
    }
  }

  carregarPlats() {
    this.carregant = true;
    this.errorCarrega = false;

    const url = (this.esView || this.migMenu === 'mig')
      ? `${this.api}/Menu/GetPlatsMenu`
      : `${this.api}/Menu/GetPlatsMenu?idMenu=${this.menuProducte.idProducte}`;

    this.http.get<any[]>(url).subscribe({
      next: data => {
        this.totsPlatsOriginal = data.map(x => ({
          idPlat: x.idPlat,
          categoria: x.categoria,
          nomPlat: x.nomPlat,
          quantitat: 0,
          observacions: '',
          mostrarObservacions: false
        }));

        this.recalcularLlistes();
        this.carregant = false;
      },
      error: err => {
        console.error('Error carregant plats de menú', err);
        this.carregant = false;
        this.errorCarrega = true;
      }
    });
  }

  private recalcularLlistes() {
    const basePrimers = this.totsPlatsOriginal.filter(p => p.categoria === 'P');
    const baseSegons  = this.totsPlatsOriginal.filter(p => p.categoria === 'S');

    // sencer
    this.primers = basePrimers.map(p => ({ ...p }));
    this.segons  = baseSegons.map(p => ({ ...p }));

    this.primersEspecial = this.totsPlatsOriginal.map(p => ({
      ...p,
      quantitat: 0,
      observacions: '',
      mostrarObservacions: false
    }));

    this.segonsEspecial = this.totsPlatsOriginal.map(p => ({
      ...p,
      quantitat: 0,
      observacions: '',
      mostrarObservacions: false
    }));

    this.platsMigMenu = this.totsPlatsOriginal.map(p => ({ ...p }));
  }

  // ---------- UI normal (sencer) ----------
  togglePrimers() { this.primersOberts = !this.primersOberts; }
  toggleSegons()  { this.segonsOberts = !this.segonsOberts; }

  canviarQuantitat(plat: PlatMenu, delta: number) {
    if (this.esView || this.migMenu === 'mig') return;
    const nova = (plat.quantitat ?? 0) + delta;
    plat.quantitat = nova < 0 ? 0 : nova;
  }

  canviarQuantitatMig(plat: PlatMenu, delta: number) {
    if (this.esView) return;
    const nova = (plat.quantitat ?? 0) + delta;
    plat.quantitat = nova < 0 ? 0 : nova;
  }

  get totalMigMenus(): number {
    return this.platsMigMenu.reduce((acc, p) => acc + (p.quantitat ?? 0), 0);
  }

  toggleObservacions(plat: PlatMenu) {
    if (this.esView) return;
    plat.mostrarObservacions = !plat.mostrarObservacions;
  }

  canviarSuplement(delta: number) {
    if (this.esView) return;
    const nova = this.suplementCount + delta;
    this.suplementCount = nova < 0 ? 0 : nova;
  }

  private enviarCuina(body: any) {
    this.http.post(`${this.api}/Drawer/ticketCuina`, body).subscribe({
      next: () => this.notify.success('Enviat a cuina'),
      error: (err) => {
        console.error(err);
        this.notify.error('Error enviant a cuina');
      }
    });
  }

  private buildBodyCuinaSencer() {
    const primersSel = [
      ...this.primers.filter(p => p.quantitat > 0),
      ...this.primersEspecial.filter(p => p.quantitat > 0)
    ];

    const segonsSel = [
      ...this.segons.filter(p => p.quantitat > 0),
      ...this.segonsEspecial.filter(p => p.quantitat > 0)
    ];

    return {
      idTaula: this.idTaula ?? 'Barra',
      primersPlats: primersSel.map(p => ({
        nomPlat: (p.nomPlat ?? '').trim(),
        quantitat: p.quantitat ?? 0,
        observacions: (p.observacions ?? '').trim()
      })),
      segonsPlats: segonsSel.map(p => ({
        nomPlat: (p.nomPlat ?? '').trim(),
        quantitat: p.quantitat ?? 0,
        observacions: (p.observacions ?? '').trim()
      }))
    };
  }

  private buildBodyCuinaMig() {
    const sel = this.platsMigMenu.filter(p => (p.quantitat ?? 0) > 0);

    const primers = sel.filter(p => p.categoria === 'P');
    const segons  = sel.filter(p => p.categoria === 'S');

    return {
      idTaula: this.idTaula ?? 'Barra',
      primersPlats: primers.map(p => ({
        nomPlat: (p.nomPlat ?? '').trim(),
        quantitat: p.quantitat ?? 0,
        observacions: (p.observacions ?? '').trim()
      })),
      segonsPlats: segons.map(p => ({
        nomPlat: (p.nomPlat ?? '').trim(),
        quantitat: p.quantitat ?? 0,
        observacions: (p.observacions ?? '').trim()
      }))
    };
  }

  onTancar() {
    this.tancar.emit();
  }

  onAcceptar() {
    if (this.esView) {
      this.onTancar();
      return;
    }

    // MIG MENU
    if (this.migMenu === 'mig') {
      const total = this.totalMigMenus;

      if (total <= 0) {
        this.notify.warning('Has de seleccionar almenys un plat');
        return;
      }

      // imprimeix tots els plats seleccionats
      this.enviarCuina(this.buildBodyCuinaMig());

      // afegeix tants "mig menus" com suma de quantitats
      this.llest.emit({
        menu: this.menuProducte,
        suplement: this.suplementProducte,
        totalMenus: total,
        suplementCount: 0
      });

      return;
    }

    // SENCER
    const totsPrimers = [
      ...this.primers.filter(p => p.quantitat > 0),
      ...this.primersEspecial.filter(p => p.quantitat > 0)
    ];

    const totsSegons = [
      ...this.segons.filter(p => p.quantitat > 0),
      ...this.segonsEspecial.filter(p => p.quantitat > 0)
    ];

    const totalPrimers = totsPrimers.reduce((sum, p) => sum + p.quantitat, 0);
    const totalSegons  = totsSegons.reduce((sum, p) => sum + p.quantitat, 0);

    const totalMenus = Math.max(totalPrimers, totalSegons);

    if (totalMenus === 0) {
      this.notify.warning('Has de seleccionar almenys un plat');
      return;
    }

    if (totalPrimers !== totalSegons) {
      this.notify.warning('No poden haver-hi mes primers que segons, revisa-ho abans');
      return;
    }

    if (!this.suplementProducte) {
      this.notify.error('No tens el producte suplement, demana ajuda a administració');
      return;
    }

    const suplementCount = this.suplementCount;

    this.enviarCuina(this.buildBodyCuinaSencer());

    this.llest.emit({
      menu: this.menuProducte,
      suplement: this.suplementProducte,
      totalMenus,
      suplementCount
    });
  }

  get esView(): boolean {
    return this.mode === 'view';
  }
}
