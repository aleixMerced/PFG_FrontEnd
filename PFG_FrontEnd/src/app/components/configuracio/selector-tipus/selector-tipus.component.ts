import { Component } from '@angular/core';
import {Location} from '@angular/common';

@Component({
  selector: 'app-selector-tipus',
  standalone: false,
  templateUrl: './selector-tipus.component.html',
  styleUrl: './selector-tipus.component.scss'
})
export class SelectorTipusComponent {

  constructor(private location: Location) {}

  tornarEnrere() {
    this.location.back();
  }
}
