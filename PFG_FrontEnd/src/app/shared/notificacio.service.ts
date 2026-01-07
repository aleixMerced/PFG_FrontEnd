import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export type NotiTipus = 'success' | 'warning' | 'error' | 'info';

@Injectable({ providedIn: 'root' })
export class NotificacioService {

  constructor(private snackBar: MatSnackBar) {}

  mostrar(missatge: string, tipus: NotiTipus = 'info') {
    this.snackBar.open(missatge, 'Tancar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [`snackbar-${tipus}`]
    });
  }

  success(missatge: string) {
    this.mostrar(missatge, 'success');
  }

  warning(missatge: string) {
    this.mostrar(missatge, 'warning');
  }

  error(missatge: string) {
    this.mostrar(missatge, 'error');
  }

  info(missatge: string) {
    this.mostrar(missatge, 'info');
  }
}
