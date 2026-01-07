import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-selector-productes',
  standalone: false,
  templateUrl: './selector-productes.component.html',
  styleUrl: './selector-productes.component.scss'
})
export class SelectorProductesComponent {

  constructor(private location: Location) {}

  tornarEnrere() {
    this.location.back();
  }
}
