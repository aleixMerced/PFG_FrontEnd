import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuConfiguracioComponent } from './menu-configuracio.component';

describe('MenuConfiguracioComponent', () => {
  let component: MenuConfiguracioComponent;
  let fixture: ComponentFixture<MenuConfiguracioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MenuConfiguracioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuConfiguracioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
