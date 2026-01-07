import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectorTaulaComponent } from './selector-taula.component';

describe('SelectorTaulaComponent', () => {
  let component: SelectorTaulaComponent;
  let fixture: ComponentFixture<SelectorTaulaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectorTaulaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectorTaulaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
