import {Component, EventEmitter, input, Input, Output} from '@angular/core';
import { HttpClient } from '@angular/common/http';


interface Producte{
  idProducte: number;
  nomProducte: string;
  imatgeProducte: string;
  preuVenta: number;
  nomTipus: string;
  estoc: number;
  minimEstoc: number;
  quantitat: number;
  preuMoment: number;
  preuCompra: number;
}

@Component({
  selector: 'app-productes-selector',
  standalone: false,
  templateUrl: './productes-selector.component.html',
  styleUrl: './productes-selector.component.scss'
})
export class ProductesSelectorComponent {

  @Input() titol: string = 'Productes';
  @Input() comandaInput: Producte[] = [];

  @Output() afegirComanda = new EventEmitter<Producte>();
  @Output() eliminarComanda  = new EventEmitter<Producte>();
  @Output() augmentarDisminuirComanda = new EventEmitter<number>();



  desplegat = false;

  obrirQuantitat = false;
  quantitatAux = 0; // Per saber si s'augmenta o es disminueixen el numero de productes
  quantitat = 0;
  producteSeleccionat: Producte | null = null;


  filtreNom: string = '';
  tipusDesplegats: { [tipus: string]: boolean } = {};

  productesReals: Producte[] = [];

  tipusProducte: string[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {

    this.getProductes();

    this.getTipusProducte();

  }

  toggledesplegat() {
    this.desplegat = !this.desplegat;
  }

  /* ---- CREAR COMANDA SELECCIONANT PRODUCTES ---- */


  /* --- FILTRAR PRODUCTES PER TIPUS --- */
  productesPerTipus(tipus: string): Producte[] {

    return this.productesReals.filter(p =>
      p.nomTipus === tipus
    );
  }

  productesFiltrat(): Producte[] {
    return this.productesReals.filter(p =>
      p.nomProducte.toLowerCase().includes(this.filtreNom.toLowerCase())  || p.nomTipus.toLowerCase().includes(this.filtreNom.toLowerCase())
    );
  }


  /* --- PLEGAR I DESPLEGAR ELS TIPUS --- */
  toggleTipus(tipus: string) {
    this.tipusDesplegats[tipus] = !this.tipusDesplegats[tipus];
  }

  esDesplegat(tipus: string): boolean {
    return this.tipusDesplegats[tipus];
  }

  seleccionarProducte(producte: Producte) {

    if(producte.idProducte == 9) {return}//CANVIAR QUAN FAGI VERSIO FINAL

    const trobat = this.comandaInput.find(p => p.idProducte === producte.idProducte);
    if(!trobat) {
      this.quantitat = producte.quantitat ?? 0;
    }
    else{
      this.quantitat = trobat.quantitat ?? 0;
    }
    this.producteSeleccionat = producte;
    this.obrirQuantitat = true

  }

  /* POPUP QUANTITAT */
  confirmarQuantitat() {

    if (this.producteSeleccionat) {

      const prod = this.producteSeleccionat;

      const trobat = this.comandaInput.find(p => p.idProducte === prod.idProducte);

      if(trobat){

        this.quantitatAux = trobat.quantitat;

        trobat.quantitat = this.quantitat;
        trobat.preuMoment = prod.preuVenta * trobat.quantitat;

        if(this.quantitatAux > this.quantitat){ //Quantitat aux per saber si es disminueix o s'augmenta
          const preu = trobat.preuVenta * (this.quantitatAux - this.quantitat);

          this.augmentarDisminuirComanda.emit(-preu);
        }

        else{
          const preu = trobat.preuVenta * (this.quantitat - this.quantitatAux);
          this.augmentarDisminuirComanda.emit(preu);
        }
      }
      else{
        this.quantitatAux = prod.quantitat;
        prod.quantitat = this.quantitat;
        prod.preuMoment = prod.preuVenta * prod.quantitat;

        if(this.quantitatAux > this.quantitat){ //Quantitat aux per saber si es disminueix o s'augmenta
          const preu = this.producteSeleccionat.preuVenta * (this.quantitatAux - this.quantitat);

          this.augmentarDisminuirComanda.emit(-preu);
        }

        else{
          const preu = this.producteSeleccionat.preuVenta * (this.quantitat - this.quantitatAux);
          this.augmentarDisminuirComanda.emit(preu);
        }
      }





      //MIRAR SI JA ESTA A LA LLISTA
      if(!this.comandaInput.some(p => p.idProducte === prod.idProducte)){
        this.afegirComanda.emit(prod);
      }
      else{
      }

      if(this.quantitat == 0){
        this.eliminarComanda.emit(prod);
      }

    }


    this.obrirQuantitat = false;
  }

  cancelarQuantitat() {
    this.obrirQuantitat = false;
  }

  eliminarQuantitat(){

    if(this.producteSeleccionat){
      const prod = this.producteSeleccionat;

      const preu = this.producteSeleccionat.preuVenta * this.quantitat;
      prod.preuMoment = 0;
      prod.quantitat = 0;
      this.quantitat = 0;
      this.eliminarComanda.emit(prod);
      this.augmentarDisminuirComanda.emit(-preu);

    }
    this.obrirQuantitat = false;
  }

  modificarQuantitat(accio: string){

    if(this.producteSeleccionat){
      if (accio === 'POSITIU') {
        this.quantitat = (this.quantitat||0) + 1

      } else if (accio === 'NEGATIU') {
        this.quantitat = (this.quantitat||0) - 1
      }
    }
  }

  getProductes(): void{
    this.http.get<Producte[]>('https://localhost:7265/api/Producte/GetProductes')
      .subscribe({
        next: (dades) =>{
          this.productesReals = dades.map(producte => ({
            ...producte,
            quantitat: 0
          }));
          console.log(this.productesReals);
        },
        error: (error) => {
          console.error('Error:', error);
        }
      });
  }

  getTipusProducte(): void{
    this.http.get<string[]>('https://localhost:7265/api/TipusProducte/GetNomTipus')
    .subscribe({
      next: (dades) =>{
        this.tipusProducte = dades;
      },
      error: (error) => {
        console.error('Error:', error);
      }
    })
  }
}
