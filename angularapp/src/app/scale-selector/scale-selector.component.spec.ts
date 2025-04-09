import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScaleSelectorComponent } from './scale-selector.component';

describe('ScaleSelectorComponent', () => {
  let component: ScaleSelectorComponent;
  let fixture: ComponentFixture<ScaleSelectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ScaleSelectorComponent]
    });
    fixture = TestBed.createComponent(ScaleSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
