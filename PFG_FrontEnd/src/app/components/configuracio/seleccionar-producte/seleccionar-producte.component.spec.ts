import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeleccionarProducteComponent } from './seleccionar-producte.component';

describe('SeleccionarProducteComponent', () => {
  let component: SeleccionarProducteComponent;
  let fixture: ComponentFixture<SeleccionarProducteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SeleccionarProducteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeleccionarProducteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
