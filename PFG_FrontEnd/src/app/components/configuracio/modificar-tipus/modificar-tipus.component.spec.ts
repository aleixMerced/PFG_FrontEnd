import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificarTipusComponent } from './modificar-tipus.component';

describe('ModificarTipusComponent', () => {
  let component: ModificarTipusComponent;
  let fixture: ComponentFixture<ModificarTipusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModificarTipusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModificarTipusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
