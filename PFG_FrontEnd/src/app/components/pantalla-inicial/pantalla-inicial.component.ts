import { Component } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-pantalla-inicial',
  templateUrl: './pantalla-inicial.component.html',
  standalone: false,
  styleUrls: ['./pantalla-inicial.component.scss']
})
export class PantallaInicialComponent {

  constructor(private router: Router) {}

  anarInici() {

    const screenWidth = window.innerWidth;

    if (screenWidth < 768) {
      this.router.navigate(['/cambrer']); //Pestanya on hi haura els comanda
    } else {
      this.router.navigate(['/barra']); //Pestanya per cobrar etc...
    }
  }
}
