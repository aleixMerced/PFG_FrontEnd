import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PantallaInicialComponent } from './pantalla-inicial.component';

describe('PantallaInicialComponent', () => {
  let component: PantallaInicialComponent;
  let fixture: ComponentFixture<PantallaInicialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PantallaInicialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PantallaInicialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
