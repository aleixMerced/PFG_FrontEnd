import { Component } from '@angular/core';
import {Location} from '@angular/common';

@Component({
  selector: 'app-menu-configuracio',
  standalone: false,
  templateUrl: './menu-configuracio.component.html',
  styleUrl: './menu-configuracio.component.scss'
})
export class MenuConfiguracioComponent {

  constructor(private location: Location) {}

  tornarEnrere() {
    this.location.back();
  }
}
