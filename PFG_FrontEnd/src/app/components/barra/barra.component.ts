import {Component} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-barra',
  standalone: false,
  templateUrl: './barra.component.html',
  styleUrls: ['./barra.component.scss']
})
export class BarraComponent {

  constructor(private router: Router) {}


  comandesCargades = false;

  crearComanda: boolean = false;

  mostrarPantalla: boolean = false;
  quantitatTotal: number = 0;


  taules = [
    { id: 1, src: 'assets/img/pene.jpg', text: 'Taula1' },
    { id: 2, src: 'assets/img/pene.jpg', text: 'Taula2' },
    { id: 3, src: 'assets/img/pene.jpg', text: 'Taula3' },
    { id: 4, src: 'assets/img/pene.jpg', text: 'Taula4' },
    { id: 5, src: 'assets/img/pene.jpg', text: 'Taula5' },
    { id: 6, src: 'assets/img/pene.jpg', text: 'Taula6' },
    { id: 7, src: 'assets/img/pene.jpg', text: 'Taula7' }
  ];

  actualitzarComanda() {
    this.comandesCargades = !this.comandesCargades;
  }

  rebreQuantitatTotal(valor: number) {
    this.quantitatTotal = valor;
  }









}
