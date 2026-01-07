import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeclatNumericComponent } from './teclat-numeric.component';

describe('TeclatNumericComponent', () => {
  let component: TeclatNumericComponent;
  let fixture: ComponentFixture<TeclatNumericComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeclatNumericComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeclatNumericComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
