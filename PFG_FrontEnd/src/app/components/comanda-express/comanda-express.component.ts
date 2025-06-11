import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-comanda-express',
  standalone: false,
  templateUrl: './comanda-express.component.html',
  styleUrl: './comanda-express.component.scss'
})
export class ComandaExpressComponent {
  @Output() mostrarConfirmacio = new EventEmitter<Boolean>();
  @Output() quantitatTotalOutput = new EventEmitter<number>();

  quantitatActual: string = '';
  quantitatTotal: number = 0;
  quantitatVisor: string = '';

  numeroAnterior: string = '';
  numeroActual: string = '';

  sumaActiva: boolean = false;
  preuTotal: boolean = false;

  clickTimer: any = null;
  textRest: string = 'RESET';


  onNumberClick(numero: any){
    this.numeroActual = numero;

    if(this.sumaActiva || this.preuTotal){
      this.quantitatActual = '';
      this.sumaActiva = false;
      this.preuTotal = false;
    }

    if (this.quantitatActual.length > 9) return;

    if(numero == '00'){
      if(this.quantitatActual.length > 0){
        this.quantitatActual += numero;
      }

    }
    else if(numero == ','){

      if(this.quantitatActual === ''){
        this.quantitatActual += '0.'
      }
      if(!this.quantitatActual.includes('.')){
        this.quantitatActual += '.';
      }

    }
    else{//Es un numero
      this.quantitatActual += numero;

      if(this.quantitatActual.includes(numero)){

      }
    }

  }

  cobrarComanda(){
    this.mostrarConfirmacio.emit(true);
    this.quantitatTotalOutput.emit(this.quantitatTotal);
  }

  sumarNumero(){

    if(this.numeroAnterior !== this.numeroActual){
      this.quantitatVisor = '0'
    }

    this.quantitatVisor = (parseInt(this.quantitatVisor) +1).toString();

    this.sumaActiva = true;

    this.quantitatTotal += parseFloat(this.quantitatActual);

    this.numeroAnterior = this.numeroActual;

    console.log(this.quantitatTotal +  " --- " + this.quantitatVisor);

  }

  esborrarNumero(){
    this.quantitatActual = '';
  }

  esborrarComandaSencera(){
    this.quantitatTotal = 0;
    this.quantitatActual = '';
    this.quantitatVisor = ' ';
  }

  esborrarUnNumero(){
    if(this.preuTotal){ return}

    this.quantitatActual = this.quantitatActual.slice(0, -1);

  }


  onClickReset() { //METODE PER MIRAR SI FA DOS CLICKS O UN AL BOTO DE RESET
    this.textRest = 'RESET TOTAL';
    if (this.clickTimer) {
      clearTimeout(this.clickTimer);
      this.clickTimer = null;
      this.esborrarComandaSencera(); // si arriba ràpid, és doble clic
      this.textRest = 'RESET';
    } else {
      this.clickTimer = setTimeout(() => {
        this.clickTimer = null;
        this.textRest = 'RESET';
        this.esborrarNumero(); // si no arriba doble clic, és un clic
      }, 250); // 250ms límit per considerar doble clic
    }

  }

  mostrarSubTotal() {
    this.preuTotal = true;
    const arrodonit = this.quantitatTotal.toFixed(2); //no surti 6,9999994 sino 6,90
    this.quantitatActual = arrodonit;
  }

}
