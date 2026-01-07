import { Component } from '@angular/core';
import {Location} from '@angular/common';

@Component({
  selector: 'app-selector-taula',
  standalone: false,
  templateUrl: './selector-taula.component.html',
  styleUrl: './selector-taula.component.scss'
})
export class SelectorTaulaComponent {

  constructor(private location: Location) {}

  tornarEnrere() {
    this.location.back();
  }
}
