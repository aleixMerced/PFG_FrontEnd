// guards/nav-protection.service.ts
import { Injectable, NgZone } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NavProtectionService {
  private enabled = false;
  private canLeave: () => boolean = () => true;
  confirmMsg = "Si marxes de la pantalla es perdran els canvis fets i la comanda sera esborrada, guardala abans de sortir?";

  constructor(ngZone: NgZone) {
    // Listeners globals
    ngZone.runOutsideAngular(() => {
      window.addEventListener('beforeunload', this.onBeforeUnload);
      window.addEventListener('popstate', this.onPopState); // opcional
    });
  }

  enable(predicate: () => boolean) {
    this.enabled = true;
    this.canLeave = predicate;
  }

  disable() {
    this.enabled = false;
    this.canLeave = () => true;
  }

  confirmOrBlock(): boolean {
    if (!this.enabled) return true;
    if (this.canLeave()) return true;
    return window.confirm(this.confirmMsg);
  }

  private onBeforeUnload = (e: BeforeUnloadEvent) => {
    if (!this.enabled) return;
    if (!this.canLeave()) {
      e.preventDefault();
      e.returnValue = ''; // Mostra el diàleg nadiu (sense text custom)
    }
  };

  private onPopState = (_: PopStateEvent) => {
    if (!this.enabled) return;
    if (!this.canLeave()) {
      history.pushState(null, '', window.location.href);
    }
  };
}
