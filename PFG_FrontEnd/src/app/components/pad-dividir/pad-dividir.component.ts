import { Component, Output, EventEmitter, HostListener, Input } from '@angular/core';
import {ProducteComanda} from "../../interficies/interficies";

@Component({
  selector: 'app-pad-dividir',
  standalone: false,
  templateUrl: './pad-dividir.component.html',
  styleUrls: ['./pad-dividir.component.scss']
})
export class PadDividirComponent {
  // Sense 0
  numbers: number[] = [1,2,3,4,5,6,7,8,9];

  selectedValue = '';
  selectedValueAux = '';



  @Input() producte!: ProducteComanda | null;

  @Input() allowFractions: boolean = false;


  @Output() close = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<string>();
  @HostListener('document:keydown.escape') onEsc() { this.closePad(); }
  @HostListener('document:keydown.enter') onEnter() { if (this.hasSelection()) this.confirmSelection(); }
  @HostListener('document:keydown.backspace') onKeyBackspace() { this.backspace(); }

  onNumberClick(n: number): void {
    // multi-dígit: concatenem
    this.selectedValueAux = `${this.selectedValue}${n}`
    if(this.producte){
      if(n > this.producte.unitats ||  Number(this.selectedValueAux ) > this.producte.unitats ){
        return;
      }
    }
    this.selectedValue = `${this.selectedValue}${n}`;

  }

  onFractionClick(frac: string): void {
    // substituïm per la fracció
    this.selectedValue = frac;
  }

  backspace(): void {
    if (!this.selectedValue) return;
    this.selectedValue = this.selectedValue.slice(0, -1);
  }

  clearSelection(): void { this.selectedValue = ''; }
  hasSelection(): boolean { return this.selectedValue !== ''; }

  closePad(): void { this.close.emit(); }

  confirmSelection(): void {
    console.log(this.selectedValue)
    this.confirmed.emit(this.selectedValue);
    this.closePad();
  }
}
