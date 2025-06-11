import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComandaExpressComponent } from './comanda-express.component';

describe('ComandaExpressComponent', () => {
  let component: ComandaExpressComponent;
  let fixture: ComponentFixture<ComandaExpressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComandaExpressComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComandaExpressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
