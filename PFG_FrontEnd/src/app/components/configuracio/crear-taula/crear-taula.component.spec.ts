import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearTaulaComponent } from './crear-taula.component';

describe('CrearTaulaComponent', () => {
  let component: CrearTaulaComponent;
  let fixture: ComponentFixture<CrearTaulaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrearTaulaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearTaulaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
