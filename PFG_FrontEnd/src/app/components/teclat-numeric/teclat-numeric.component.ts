import {Component, EventEmitter, HostListener, Input, Output, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-teclat-numeric',
  standalone: false,
  templateUrl: './teclat-numeric.component.html',
  styleUrl: './teclat-numeric.component.scss'
})
export class TeclatNumericComponent {
  @Input() title: string = 'Introdueix quantitat';
  @Output() ok = new EventEmitter<number>();
  @Output() close = new EventEmitter<void>(); // opcional: per tancar el pop-up si en tens
  @Input() initialValue: number | null = null;
  value = '';

  digits: string[] = ['1','2','3','4','5','6','7','8','9','C','0',',','OK'];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValue']) {
      const v = this.initialValue;
      // passem de número a string amb coma
      this.value = v != null ? v.toString().replace('.', ',') : '';
    }
  }
  // Suport tecles
  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (/^[0-9]$/.test(e.key)) {
      this.onDigit(e.key);
      return;
    }

    if (e.key === ',' || e.key === '.') {
      this.onDigit(',');
      return;
    }

    // backspace → esborra últim caràcter
    if (e.key === 'Backspace') {
      e.preventDefault();
      this.backspace();
      return;
    }

    if (e.key === 'Enter') this.confirm();
    if (e.key === 'Escape') this.close.emit();
  }


  onBtn(btn: string) {
    if (btn === 'C') return this.clear();
    if (btn === 'OK') return this.confirm();
    this.onDigit(btn);
  }

  onDigit(d: string) {

    if (d === ',') {
      if (this.value.includes(',')) return;

      if (this.value === '') {
        this.value = '0,';
      } else {
        this.value += ',';
      }
      return;
    }

    if (d === '0' && this.value === '') {
      this.value = '0';
      return;
    }

    if (this.value === '0') {
      this.value = '';
    }

    this.value += d;
  }

  backspace() {
    if (!this.value) return;
    this.value = this.value.slice(0, -1);
  }

  clear() { this.value = ''; }

  confirm() {
    if (this.value.trim() === '') return;

    const normalized = this.value.replace(',', '.');
    const n = Number(normalized);

    if (!Number.isFinite(n)) return;

    this.ok.emit(n);
  }
}
