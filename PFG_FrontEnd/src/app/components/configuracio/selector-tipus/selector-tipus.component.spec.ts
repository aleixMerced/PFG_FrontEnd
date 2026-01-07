import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectorTipusComponent } from './selector-tipus.component';

describe('SelectorTipusComponent', () => {
  let component: SelectorTipusComponent;
  let fixture: ComponentFixture<SelectorTipusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectorTipusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectorTipusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
