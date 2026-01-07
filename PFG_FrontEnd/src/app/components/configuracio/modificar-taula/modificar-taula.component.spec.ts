import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificarTaulaComponent } from './modificar-taula.component';

describe('ModificarTaulaComponent', () => {
  let component: ModificarTaulaComponent;
  let fixture: ComponentFixture<ModificarTaulaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModificarTaulaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModificarTaulaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
