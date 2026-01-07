import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearTipusComponent } from './crear-tipus.component';

describe('CrearTipusComponent', () => {
  let component: CrearTipusComponent;
  let fixture: ComponentFixture<CrearTipusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrearTipusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearTipusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
