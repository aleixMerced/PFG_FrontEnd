import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectorProductesComponent } from './selector-productes.component';

describe('SelectorProductesComponent', () => {
  let component: SelectorProductesComponent;
  let fixture: ComponentFixture<SelectorProductesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectorProductesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectorProductesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
