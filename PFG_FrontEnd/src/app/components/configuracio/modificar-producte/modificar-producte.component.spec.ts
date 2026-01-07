import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificarProducteComponent } from './modificar-producte.component';

describe('ModificarProducteComponent', () => {
  let component: ModificarProducteComponent;
  let fixture: ComponentFixture<ModificarProducteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModificarProducteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModificarProducteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
