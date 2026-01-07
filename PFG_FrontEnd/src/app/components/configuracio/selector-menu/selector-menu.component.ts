import { Component } from '@angular/core';
import {Location} from '@angular/common';

@Component({
  selector: 'app-selector-menu',
  standalone: false,
  templateUrl: './selector-menu.component.html',
  styleUrl: './selector-menu.component.scss'
})
export class SelectorMenuComponent {
  constructor(private location: Location) {}

  tornarEnrere() {
    this.location.back();
  }

}
