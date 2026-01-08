import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { NavProtectionService } from './nav-protection.service';
import { ComandaFinalComponent } from '../components/comanda-final/comanda-final.component';

@Injectable({ providedIn: 'root' })
export class ConfirmExitGuard implements CanDeactivate<ComandaFinalComponent> {
  constructor(private nav: NavProtectionService) {}

  canDeactivate(component: ComandaFinalComponent): boolean | Observable<boolean> {
    const allow = this.nav.confirmOrBlock();
    if (!allow) return false;

    if (component.comandaGuardada) return true;
    if (component.readOnly) return true;
    if (!component.idComanda) return true;
    if (component.producteComanda.length === 0) return true;
    if (component.comandaGuardada) return true;

    return component.cancelarComandaEnSortir().pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}
