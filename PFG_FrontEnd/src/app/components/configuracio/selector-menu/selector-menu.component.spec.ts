import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectorMenuComponent } from './selector-menu.component';

describe('SelectorMenuComponent', () => {
  let component: SelectorMenuComponent;
  let fixture: ComponentFixture<SelectorMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectorMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectorMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
