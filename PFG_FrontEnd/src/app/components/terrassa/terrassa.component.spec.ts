import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerrassaComponent } from './terrassa.component';

describe('TerrassaComponent', () => {
  let component: TerrassaComponent;
  let fixture: ComponentFixture<TerrassaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TerrassaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TerrassaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
