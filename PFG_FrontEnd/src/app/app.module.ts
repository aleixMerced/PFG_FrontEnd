import { BrowserModule }            from '@angular/platform-browser';
import { BrowserAnimationsModule }  from '@angular/platform-browser/animations';
import { NgModule }                 from '@angular/core';
import { RouterModule, Routes }     from '@angular/router';
import { HttpClientModule }         from '@angular/common/http';
import { FormsModule }              from '@angular/forms';

/* APP root */
import { AppComponent } from './app.component';

/* Pantalles */
import { BarraComponent }            from './components/barra/barra.component';
import { TerrassaComponent }         from './components/terrassa/terrassa.component';
import {DividirCompteComponent} from "./components/dividir-compte/dividir-compte.component"
import {PadDividirComponent} from "./components/pad-dividir/pad-dividir.component"
import {TeclatNumericComponent} from './components/teclat-numeric/teclat-numeric.component';
import {HistoricComandesComponent} from './components/historic-comandes/historic-comandes.component';
import { MenuConfiguracioComponent } from './components/menu-configuracio/menu-configuracio.component';
import { SelectorProductesComponent } from './components/configuracio/selector-productes/selector-productes.component';
import { ModificarProducteComponent } from './components/configuracio/modificar-producte/modificar-producte.component';
import { CrearProducteComponent } from './components/configuracio/crear-producte/crear-producte.component';
import { SeleccionarProducteComponent } from './components/configuracio/seleccionar-producte/seleccionar-producte.component';
import { SelectorTipusComponent } from './components/configuracio/selector-tipus/selector-tipus.component';
import { CrearTipusComponent } from './components/configuracio/crear-tipus/crear-tipus.component';
import { ModificarTipusComponent } from './components/configuracio/modificar-tipus/modificar-tipus.component';
import { CrearTaulaComponent } from './components/configuracio/crear-taula/crear-taula.component';
import { ModificarTaulaComponent } from './components/configuracio/modificar-taula/modificar-taula.component';
import { SelectorTaulaComponent } from './components/configuracio/selector-taula/selector-taula.component';
import { EstadistiquesComponent } from './components/estadistiques/estadistiques.component';
import { MenuSelectorComponent } from './components/menu-selector/menu-selector.component';


/* Angular Material ⬇ */
import { MatSidenavModule }  from '@angular/material/sidenav';
import { MatToolbarModule }  from '@angular/material/toolbar';
import { MatListModule }     from '@angular/material/list';
import { MatIconModule }     from '@angular/material/icon';
import { MatButtonModule }   from '@angular/material/button';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatSelectModule }    from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';


import { A11yModule }        from '@angular/cdk/a11y';
import { ComandaFinalComponent } from './components/comanda-final/comanda-final.component';
import {MatGridListModule} from '@angular/material/grid-list';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { ConfirmExitGuard } from './guards/confirm-exit.guard';
import { SelectorMenuComponent } from './components/configuracio/selector-menu/selector-menu.component';
import { ModificarMenuComponent } from './components/configuracio/modificar-menu/modificar-menu.component';
import { CrearMenuComponent } from './components/configuracio/crear-menu/crear-menu.component';
import {MatCheckbox} from '@angular/material/checkbox';


/* RUTES */
const routes: Routes = [
  { path: '', redirectTo: 'barra', pathMatch: 'full' },
  { path: 'barra',    component: BarraComponent },
  { path: 'terrassa', component: TerrassaComponent },
  { path: 'comandaFinal', component: ComandaFinalComponent, canDeactivate: [ConfirmExitGuard] },
  { path: 'comandaFinal/taula/:idTaula', component: ComandaFinalComponent, canDeactivate: [ConfirmExitGuard] },
  { path: 'comandaFinal/:idComanda', component: ComandaFinalComponent, canDeactivate: [ConfirmExitGuard] },
  { path: 'dividir-compte/:id', component: DividirCompteComponent },
  { path: 'historic-comandes/:id', component: HistoricComandesComponent },
  { path: 'menu-configuracio', component: MenuConfiguracioComponent },
  { path: 'estadistiques', component: EstadistiquesComponent },
  { path: 'historic-comandes', component: HistoricComandesComponent},
  {
    path: 'config',
    children: [
      { path: '', component: MenuConfiguracioComponent },
      { path: 'selector-productes', component: SelectorProductesComponent },
      { path: 'crear-producte', component: CrearProducteComponent },
        { path: 'crear-producte/:idTipus', component: CrearProducteComponent },
      { path: 'modificar-producte/:id', component: ModificarProducteComponent },
      { path: 'seleccionar-producte', component: SeleccionarProducteComponent },

      { path: 'selector-tipus', component: SelectorTipusComponent },
      { path: 'crear-tipus', component: CrearTipusComponent },
      { path: 'modificar-tipus', component: ModificarTipusComponent },

      { path: 'selector-taula', component: SelectorTaulaComponent },
      { path: 'crear-taula', component: CrearTaulaComponent },
      { path: 'modificar-taula', component: ModificarTaulaComponent },

      { path: 'selector-menu', component: SelectorMenuComponent },
      { path: 'crear-menu', component: CrearMenuComponent },
      { path: 'modificar-menu', component: ModificarMenuComponent },
    ]
  },
];

@NgModule({
  declarations: [
    AppComponent,
    BarraComponent,
    TerrassaComponent,
    ComandaFinalComponent,
    DividirCompteComponent,
    PadDividirComponent,
    TeclatNumericComponent,
    HistoricComandesComponent,
    MenuConfiguracioComponent,
    SelectorProductesComponent,
    ModificarProducteComponent,
    CrearProducteComponent,
    SeleccionarProducteComponent,
    SelectorTipusComponent,
    CrearTipusComponent,
    ModificarTipusComponent,
    CrearTaulaComponent,
    ModificarTaulaComponent,
    SelectorTaulaComponent,
    EstadistiquesComponent,
    MenuSelectorComponent,
    SelectorMenuComponent,
    ModificarMenuComponent,
    CrearMenuComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,        // ← obligatori per Material
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(routes),
    MatSnackBarModule,

    /* Material */
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatGridListModule,
    MatButtonModule,

    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,

    A11yModule,

    NgScrollbarModule,
    MatCheckbox
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
