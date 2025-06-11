import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarraComandesComponent } from './barra-comandes.component';

describe('BarraComandesComponent', () => {
  let component: BarraComandesComponent;
  let fixture: ComponentFixture<BarraComandesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarraComandesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarraComandesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
