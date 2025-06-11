import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductesSelectorComponent } from './productes-selector.component';

describe('ProductesSelectorComponent', () => {
  let component: ProductesSelectorComponent;
  let fixture: ComponentFixture<ProductesSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductesSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductesSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
