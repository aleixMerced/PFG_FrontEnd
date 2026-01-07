import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DividirCompteComponent } from './dividir-compte.component';

describe('DividirCompteComponent', () => {
  let component: DividirCompteComponent;
  let fixture: ComponentFixture<DividirCompteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DividirCompteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DividirCompteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
