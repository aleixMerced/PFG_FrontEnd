import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricComandesComponent } from './historic-comandes.component';

describe('HistoricComandesComponent', () => {
  let component: HistoricComandesComponent;
  let fixture: ComponentFixture<HistoricComandesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HistoricComandesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoricComandesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
