import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';

import { environment } from '../../../../environments/environment';
import { Producte } from '../../../interficies/interficies';
import { NotificacioService } from '../../../shared/notificacio.service';

type ProducteCheck = { producte: Producte; checked: boolean };

@Component({
  selector: 'app-modificar-menu',
  standalone: false,
  templateUrl: './modificar-menu.component.html',
  styleUrl: './modificar-menu.component.scss'
})
export class ModificarMenuComponent implements OnInit {
  constructor(private location: Location, private http: HttpClient, private dialog: MatDialog, private notify: NotificacioService) {}

  filterPrimers = '';
  filterSegons = '';

  IdMenu: 10 | 11 = 11;

  diaSeleccionat: Date | null = null;
  DiaMenuEnviar = '';
  DiaMenuNormal = '';

  // Llistes
  PrimersPlats: ProducteCheck[] = [];
  SegonsPlats: ProducteCheck[] = [];
  private basePrimers: ProducteCheck[] = [];
  private baseSegons: ProducteCheck[] = [];

  carregant = false;
  menuCarregat = false;

  private readonly api = environment.apiBaseUrl;


  @ViewChild('confirmUpdateDialog') confirmUpdateDialogTpl!: TemplateRef<any>;
  @ViewChild('confirmDeleteDialog') confirmDeleteDialogTpl!: TemplateRef<any>;

  pendingUpdatePayload: any = null;
  pendingDeletePayload: any = null;

  tornarEnrere(): void {
    this.location.back();
  }

  setTipusMenu(id: 10 | 11) {
    this.IdMenu = id;
  }

  ngOnInit() {
    // Carrego tots els plats (com a crear)
    this.carregant = true;
    this.http.get<Producte[]>(`${this.api}/Producte/GetPlats`).subscribe({
      next: data => {
        this.basePrimers = data.map(p => ({ producte: p, checked: false }));
        this.baseSegons  = data.map(p => ({ producte: p, checked: false }));

        this.PrimersPlats = [...this.basePrimers];
        this.SegonsPlats  = [...this.baseSegons];

        this.carregant = false;
      },
      error: err => {
        console.error(err);
        this.carregant = false;
      }
    });
  }

  // ===== Seleccionar dia a modificar =====
  obrirSelectorDia(picker: MatDatepicker<Date>): void {
    picker.open();
  }

  onDiaChange(date: Date | null) {
    if (!date) return;

    this.diaSeleccionat = date;
    this.DiaMenuEnviar = this.toYMD(date);
    this.DiaMenuNormal = this.toDMY(date);

    this.carregarMenuDia(this.DiaMenuEnviar);
  }

  private carregarMenuDia(diaMenu: string) {
    this.carregant = true;
    this.menuCarregat = false;

    this.http
      .get<any[]>(`${this.api}/Menu/GetMenuDia?diaMenu=${diaMenu}`).subscribe({
        next: data => {

          const setP = new Set<number>();
          const setS = new Set<number>();


          const maybeIdMenu = data?.[0]?.idMenu ?? data?.[0]?.IdMenu;
          if (maybeIdMenu === 10 || maybeIdMenu === 11) this.IdMenu = maybeIdMenu;

          for (const item of data || []) {
            const cat = (item.categoria ?? item.Categoria ?? '').toUpperCase();
            const id = Number(item.idPlat ?? item.IdPlat);
            this.IdMenu = item.idMenu;
            if (cat === 'P') setP.add(id);
            if (cat === 'S') setS.add(id);
            console.log(item)
            console.log(this.IdMenu)

          }

          this.basePrimers = this.basePrimers.map(x => ({
            ...x,
            checked: setP.has(x.producte.idProducte)
          }));

          this.baseSegons = this.baseSegons.map(x => ({
            ...x,
            checked: setS.has(x.producte.idProducte)
          }));

          this.PrimersPlats = this.sortCheckedFirst(this.basePrimers);
          this.SegonsPlats  = this.sortCheckedFirst(this.baseSegons);

          this.menuCarregat = true;
          this.carregant = false;
        },
        error: err => {
          console.error(err);
          this.carregant = false;

          // Encara així mostro els grids (tot desmarcat) per si vol crear-lo “a mà”
          this.basePrimers = this.basePrimers.map(x => ({ ...x, checked: false }));
          this.baseSegons  = this.baseSegons.map(x => ({ ...x, checked: false }));
          this.PrimersPlats = [...this.basePrimers];
          this.SegonsPlats  = [...this.baseSegons];
          this.menuCarregat = true;

          this.notify.error('No s’ha pogut carregar el menú del dia seleccionat');
        }
      });
  }

  actualitzarMenu() {
    if (!this.diaSeleccionat) {
      this.notify.error('Selecciona un dia primer');
      return;
    }

    const primersIds = this.PrimersPlats.filter(x => x.checked).map(x => x.producte.idProducte);
    const segonsIds  = this.SegonsPlats.filter(x => x.checked).map(x => x.producte.idProducte);

    if (primersIds.length < 1 || segonsIds.length < 1) {
      this.notify.error("Ha d'haver-hi mínim 1 plat de cada categoria");
      return;
    }

    this.pendingUpdatePayload = {
      DiaMenu: this.DiaMenuEnviar,
      Primers: primersIds,
      Segons: segonsIds,
      IdMenu: this.IdMenu
    };

    this.dialog.open(this.confirmUpdateDialogTpl, {
      width: '420px',
      disableClose: true
    });
  }

  confirmarActualitzar(dialogRef: any) {
    if (!this.pendingUpdatePayload) return;

    this.http.post(`${this.api}/Menu/SaveMenuDia`, this.pendingUpdatePayload).subscribe({
      next: () => {
        dialogRef.close();
        this.pendingUpdatePayload = null;
        this.notify.success('Menú actualitzat');
        this.location.back();
      },
      error: err => {
        console.error(err);
        dialogRef.close();
        this.notify.error(err?.message ?? 'Error actualitzant el menú');
      }
    });
  }

  cancelarActualitzar(dialogRef: any) {
    this.pendingUpdatePayload = null;
    dialogRef.close();
  }

  eliminarMenu() {
    if (!this.diaSeleccionat) {
      this.notify.error('Selecciona un dia primer');
      return;
    }

    this.pendingDeletePayload = {
      diaMenu: this.DiaMenuEnviar,
      idMenu: this.IdMenu
    };

    this.dialog.open(this.confirmDeleteDialogTpl, {
      width: '420px',
      disableClose: true
    });
  }

  confirmarEliminar(dialogRef: any) {
    if (!this.pendingDeletePayload) return;

    this.http.delete(`${this.api}/Menu/DeleteMenuDia?diaMenu=${this.DiaMenuEnviar}&idMenu=${this.IdMenu}`).subscribe({
        next: () => {
          dialogRef.close();
          this.pendingDeletePayload = null;
          this.notify.success('Menú eliminat');
          this.location.back();
        },
        error: err => {
          console.error(err);
          dialogRef.close();
          this.notify.error(err?.message ?? 'Error eliminant el menú');
        }
      });
  }

  cancelarEliminar(dialogRef: any) {
    this.pendingDeletePayload = null;
    dialogRef.close();
  }

  get primersFiltrats(): ProducteCheck[] {
    const f = this.filterPrimers.trim().toLowerCase();
    if (!f) return this.PrimersPlats;
    return this.PrimersPlats.filter(x =>
      (x.producte.nomProducte ?? '').toLowerCase().includes(f)
    );
  }

  get segonsFiltrats(): ProducteCheck[] {
    const f = this.filterSegons.trim().toLowerCase();
    if (!f) return this.SegonsPlats;
    return this.SegonsPlats.filter(x =>
      (x.producte.nomProducte ?? '').toLowerCase().includes(f)
    );
  }

  // ===== Helpers =====
  private toYMD(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private toDMY(date: Date): string {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  private sortCheckedFirst(list: ProducteCheck[]): ProducteCheck[] {
    return [...list].sort((a, b) => {
      if (a.checked !== b.checked) return a.checked ? -1 : 1;
      return (a.producte.nomProducte ?? '').localeCompare(b.producte.nomProducte ?? '');
    });
  }
}
