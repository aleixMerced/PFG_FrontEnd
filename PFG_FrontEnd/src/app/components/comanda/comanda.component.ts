import { Component, EventEmitter, Output, Input} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import {getXHRResponse} from 'rxjs/internal/ajax/getXHRResponse';

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

interface Comanda {
  idComanda: number;
  nomClient: string;
  estatComanda: string;
  tipusPagament: string;
  dataComanda: string;
  dataPagament: string;
  preuComanda: number;
  idTaula: number;
}



@Component({
  selector: 'app-comanda',
  standalone: false,
  templateUrl: './comanda.component.html',
  styleUrl: './comanda.component.scss',
  host: {
    '[class.maximitzada]': 'maximitzada',
    '[class.manual]': 'posicioManual'

  }
})
export class ComandaComponent {
  @Input() titol: string = 'Crear Comanda';
  @Input() idTaula!: number;
  @Input() modificarComanda!: boolean; //saber si creem comanda nova o la modifiquem
  @Input() idComanda!: number; // si creem la comanda de 0 idComanda = 0
  @Output() tancar = new EventEmitter<void>(); // tanquem
  @Output() actualitzar = new EventEmitter<void>(); //diu si actualitzar o no la camada



  maximitzada = false;
  posicioManual = false;
  nomComanda = ' ';
  esbarra = false;


  productesComanda: Producte[] = [];
  comandaOpen = true;

  preuComadna = 0;
  comanda?: Comanda;

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  ngOnInit() {

    if(this.idTaula === 99){
      this.esbarra = true;
    }



    if(this.modificarComanda){
      //CREAR UN GET DE LA COMANDA
      this.http.get<Producte[]>(`https://localhost:7265/api/Comanda/GetProducteComanda?idComanda=${this.idComanda}`)
        .subscribe({
          next: (response) => {
            this.productesComanda = response;
            console.log("productes ok");
          },
          error: (error) => {
            console.error(error);
          }
        })

      this.http.get<Comanda>(`https://localhost:7265/api/Comanda/GetComandaByID?idComanda=${this.idComanda}`)
        .subscribe({
          next: (response) => {
            this.comanda = response;
            console.log("Comanda ok" + this.idComanda);
            this.nomComanda = this.comanda.nomClient;
            this.preuComadna = this.comanda.preuComanda;
          },
          error: (error) => {
            console.error(error);
          }
        })

      //AGAFAR TAMBE LA COMANDA
    }
    else{
      this.getIdComanda();
    }


  }

  toggleMaximitzar() {
    this.maximitzada = !this.maximitzada;


    console.log(this.esbarra);
    if (this.maximitzada) {
      this.posicioManual = false;
    }
  }

  afegeixProducte(p: Producte) {
    const idx = this.productesComanda.findIndex(prod => prod.idProducte === p.idProducte);
    if( idx > -1){
      this.productesComanda.splice(idx, 1)
    }
    this.productesComanda.push(p);

  }

  eliminarProducte(p: Producte){
    const idx = this.productesComanda.findIndex(prod => prod.idProducte === p.idProducte);
    if( idx > -1){
      this.preuComadna -= (this.productesComanda[idx].preuVenta * this.productesComanda[idx].quantitat);
      this.productesComanda[idx].quantitat = 0;
      this.productesComanda.splice(idx, 1)
    }

    this.productesComanda = this.productesComanda.filter(x => x.idProducte !== p.idProducte);
  }

  toggleComanda() {
    this.comandaOpen = !this.comandaOpen;
  }

  modificarPreu(preu: number){
    this.preuComadna += preu;
  }

  enviarComanda() {
    const dataComanda = new Date();
    const estat = 'PENDENT';





  if(this.modificarComanda){

    const comanda = {
      idComanda: this.idComanda,
      nomClient: this.nomComanda,
      dataComanda: this.comanda?.dataComanda,
      estatComanda: this.comanda?.estatComanda,
      idTaula: this.comanda?.idTaula,
      preuComanda: this.preuComadna,
      tipusPagament: this.comanda?.tipusPagament,
      dataPagament: this.comanda?.dataPagament
    }

    this.http.put<Comanda>('https://localhost:7265/api/Comanda/PutComanda', comanda )
      .subscribe({
        next: (response) => {
          console.log("Comanda Actualitzada");
          this.afegirProductesComanda();
          this.actualitzar.emit();
        },
        error: (error) => {
          console.error(error);
          this.snackBar.open('❌ Error creant comanda', 'Tancar', { duration: 3000 })
        }
      })

  }
  else{
    const comanda ={
      idComanda: this.idComanda,
      nomClient: this.nomComanda,
      dataComanda: dataComanda,
      estatComanda: estat,
      idTaula: this.idTaula,
      preuComanda: this.preuComadna,
      tipusPagament: null,
      dataPagament: null
    }

    this.http.post<Comanda>('https://localhost:7265/api/Comanda/PostComanda', comanda)
      .subscribe({
        next: (response) => {
          if (this.modificarComanda) {
            console.log("Comanda actualitzada:", response);
          } else {
            console.log("Comanda creada:", response);
          }
            this.idComanda = response.idComanda;
          //AFEGIR ELS PRODUCTES AMB LA COMANDA A LA TAULA PRODUCTE-COMANDA
          this.afegirProductesComanda();
          this.actualitzar.emit();


        },
        error: (error) => {
          console.error('Error:', error);
        }
      });
  }


    setTimeout(() => this.tancar.emit(), 500);


  }

  getIdComanda(): void{
    this.http.get<number>('https://localhost:7265/api/Comanda/GetLastID')
      .subscribe({
        next: (response) => {
          console.log('NOU ID', response);
          this.idComanda = response;
        },
        error: (error) => {
          console.error('Error:', error);
        }
      })
  }

  afegirProductesComanda(): void {

    for (const p of this.productesComanda) {
      const payload = {
        idProducte: p.idProducte,
        quantitat: p.quantitat,
        idComanda: this.idComanda,
        preuMoment: p.preuMoment
      };

      this.http.post('https://localhost:7265/api/Comanda/PostProducteComanda', payload)
        .subscribe({
          next: (response) => {
            this.snackBar.open('✅ Comanda creada', 'Tancar', { duration: 3000 })

            console.log('HA SORTIT BE', response);
          },
          error: (error) => {
            this.snackBar.open('❌ Error creant comanda', 'Tancar', { duration: 3000 })
            console.error('Error:', error);
          }
        })

    }
  }
}
