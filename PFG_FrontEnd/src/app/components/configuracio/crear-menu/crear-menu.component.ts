import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';

import { environment } from '../../../../environments/environment';
import { Producte } from '../../../interficies/interficies';
import { NotificacioService } from '../../../shared/notificacio.service';

import { Router } from '@angular/router';

type ProducteCheck = { producte: Producte; checked: boolean };

@Component({
  selector: 'app-crear-menu',
  standalone: false,
  templateUrl: './crear-menu.component.html',
  styleUrl: './crear-menu.component.scss'
})
export class CrearMenuComponent implements OnInit {
  constructor(private location: Location, private http: HttpClient, private dialog: MatDialog, private notify: NotificacioService, private router: Router) {}

  filterPrimers = '';
  filterSegons = '';

  IdMenu: 10 | 11 = 11;

  dataMenuImport: Date = new Date();

  PrimersPlats: ProducteCheck[] = [];
  SegonsPlats: ProducteCheck[] = [];

  private basePrimers: ProducteCheck[] = [];
  private baseSegons: ProducteCheck[] = [];

  @ViewChild('confirmDialog') confirmDialogTpl!: TemplateRef<any>;

  pendingPayload: any = null;
  DiaMenuNormal = '';
  DiaMenuEnviar = '';

  private readonly api = environment.apiBaseUrl;


  tornarEnrere(): void {
    this.location.back();
  }

  setTipusMenu(id: 10 | 11) {
    this.IdMenu = id;
  }

  ngOnInit() {
    this.http.get<Producte[]>(`${this.api}/Producte/GetPlats`).subscribe({
      next: data => {
        this.basePrimers = data.map(p => ({ producte: p, checked: false }));
        this.baseSegons  = data.map(p => ({ producte: p, checked: false }));

        this.PrimersPlats = [...this.basePrimers];
        this.SegonsPlats  = [...this.baseSegons];
      },
      error: err => console.error(err)
    });
  }

  // ===== Importar =====
  importarMenu(picker: MatDatepicker<Date>): void {
    picker.open();
  }

  onImportDateChange(date: Date | null) {
    if (!date) return;

    this.dataMenuImport = date;
    const diaMenu = this.toYMD(date);

    this.http
      .get<any[]>(`${this.api}/Menu/GetMenuDia`, { params: { diaMenu } })
      .subscribe({
        next: data => {
          const setP = new Set<number>();
          const setS = new Set<number>();

          for (const item of data) {
            const cat = (item.categoria ?? '').toUpperCase();
            const id = Number(item.idPlat);

            if (cat === 'P') setP.add(id);
            if (cat === 'S') setS.add(id);
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
        },
        error: err => console.error(err)
      });
  }

  anarACrearProducte(): void {
    this.router.navigate(['/config/crear-producte', environment.idTipusPlats]);
  }

  guardarMenu(savePicker: MatDatepicker<Date>): void {
    savePicker.open();
  }

  onSaveDateChange(date: Date | null) {
    if (!date) return;

    const primersIds = this.PrimersPlats.filter(x => x.checked).map(x => x.producte.idProducte);
    const segonsIds  = this.SegonsPlats.filter(x => x.checked).map(x => x.producte.idProducte);

    if (primersIds.length < 1 || segonsIds.length < 1) {
      this.notify.error("Ha d'haver-hi mínim 1 plat de cada categoria");
      return;
    }

    this.DiaMenuEnviar = this.toYMD(date);
    this.DiaMenuNormal = this.toDMY(date);

    this.pendingPayload = {
      DiaMenu: this.DiaMenuEnviar,
      Primers: primersIds,
      Segons: segonsIds,
      IdMenu: this.IdMenu
    };

    this.dialog.open(this.confirmDialogTpl, {
      width: '420px',
      disableClose: true
    });
  }

  confirmarGuardar(dialogRef: any) {
    if (!this.pendingPayload) return;

    this.http.post(`${this.api}/Menu/SaveMenuDia`, this.pendingPayload).subscribe({
      next: () => {
        dialogRef.close();
        this.pendingPayload = null;
        this.notify.success('Menu Creat')
        this.location.back();

      },
      error: err => {
        console.error(err);
        dialogRef.close();
        this.notify.error(err.message);
      }
    });
  }

  cancelarGuardar(dialogRef: any) {
    this.pendingPayload = null;
    dialogRef.close();
  }

  // ===== Filters =====
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
