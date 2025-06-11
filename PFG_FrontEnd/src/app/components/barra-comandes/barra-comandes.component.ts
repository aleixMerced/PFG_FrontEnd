import {
  Component,
  Input,
  SimpleChanges,
  OnChanges,
  ViewChild,
  ViewContainerRef,
  ComponentRef,
  ComponentFactoryResolver
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ComandaComponent } from '../comanda/comanda.component';

interface Comanda {
  idComanda: number;
  nomClient: string;
  dataComanda: Date;
  estatComanda?: string;
  idTaula: number;
  preuComanda: number;
  tipusPagament?: string;
  dataPagament?: Date;
  expanded?: boolean;
}

@Component({
  selector: 'app-barra-comandes',
  standalone: false,
  templateUrl: './barra-comandes.component.html',
  styleUrl: './barra-comandes.component.scss'
})
export class BarraComandesComponent implements OnChanges {
  @Input() refreshTrigger!: boolean;
  comandes: Comanda[] = [];
  sidebarOpen = false;
  comandesCargades = false;

  @ViewChild('comandaModal', { read: ViewContainerRef }) modalContainer!: ViewContainerRef;
  modalRef: ComponentRef<ComandaComponent> | null = null;

  constructor(
    private http: HttpClient,
    private cfr: ComponentFactoryResolver
  ) {}

  ngOnInit(): void {
    this.fetchComandes();
  }

  ngOnChanges(changes: SimpleChanges): void {

    console.log("HOLAAAA");
    if (this.refreshTrigger) {
      this.fetchComandes();
    }
  }

  fetchComandes(): void {
    this.http.get<Comanda[]>('https://localhost:7265/api/Comanda/GetComandes')
      .subscribe({
        next: (dades) => {
          this.comandes = dades.filter(x => x.estatComanda === 'PENDENT');
        },
        error: (error) => {
          console.error('Error:', error);
        }
      });
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleComanda(comanda: Comanda) {
    comanda.expanded = !comanda.expanded;
  }

  //METODE PER MOSTRAR EL COMPONENT DE LA COMANDA AL MIG DELA PANTALLA
  modificarComanda(comanda: Comanda) {
    if (this.modalRef) {
      this.modalRef.destroy();
    }

    const factory = this.cfr.resolveComponentFactory(ComandaComponent);
    this.modalRef = this.modalContainer.createComponent(factory);
    document.body.style.overflow = 'hidden';
    this.modalRef.instance.titol = 'Modifica comanda';
    this.modalRef.instance.idComanda = comanda.idComanda;
    this.modalRef.instance.idTaula = comanda.idTaula;
    this.modalRef.instance.modificarComanda = true;

    this.modalRef.instance.tancar.subscribe(() => {
      this.modalRef?.destroy();
      this.modalRef = null;
      document.body.style.overflow = '';
    });

    this.modalRef.instance.actualitzar.subscribe(() => {
      this.actualitzarComanda();
    });
  }

  pagarComanda(comanda: Comanda) {
    // implementar pago
  }

  actualitzarComanda() {

    this.fetchComandes();
  }
}
