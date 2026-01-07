import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadistiquesComponent } from './estadistiques.component';

describe('EstadistiquesComponent', () => {
  let component: EstadistiquesComponent;
  let fixture: ComponentFixture<EstadistiquesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EstadistiquesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadistiquesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
