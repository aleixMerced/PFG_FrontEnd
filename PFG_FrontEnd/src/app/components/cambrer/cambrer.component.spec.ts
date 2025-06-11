import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CambrerComponent } from './cambrer.component';

describe('CambrerComponent', () => {
  let component: CambrerComponent;
  let fixture: ComponentFixture<CambrerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CambrerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CambrerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
