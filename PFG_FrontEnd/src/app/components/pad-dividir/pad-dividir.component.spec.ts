import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PadDividirComponent } from './pad-dividir.component';

describe('PadDividirComponent', () => {
  let component: PadDividirComponent;
  let fixture: ComponentFixture<PadDividirComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PadDividirComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PadDividirComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
