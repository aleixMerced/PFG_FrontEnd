import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { BarraComponent } from './components/barra/barra.component';
import { PantallaInicialComponent } from './components/pantalla-inicial/pantalla-inicial.component';
import { CambrerComponent } from './components/cambrer/cambrer.component';
import { BarraComandesComponent} from './components/barra-comandes/barra-comandes.component';
import { ComandaComponent } from './components/comanda/comanda.component';
import { ProductesSelectorComponent } from './components/productes-selector/productes-selector.component';
import { ComandaExpressComponent } from './components/comanda-express/comanda-express.component';
import { A11yModule } from '@angular/cdk/a11y';

const routes: Routes = [
  { path: '', component: PantallaInicialComponent },
  { path: 'barra', component: BarraComponent },
  { path: 'cambrer', component: CambrerComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    BarraComponent,
    PantallaInicialComponent,
    CambrerComponent,
    BarraComandesComponent,
    ComandaComponent,
    ProductesSelectorComponent,
    ComandaExpressComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(routes),
    A11yModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
