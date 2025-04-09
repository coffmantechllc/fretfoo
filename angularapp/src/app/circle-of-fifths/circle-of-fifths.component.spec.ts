import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircleOfFifthsComponent } from './circle-of-fifths.component';

describe('CircleOfFifthsComponent', () => {
  let component: CircleOfFifthsComponent;
  let fixture: ComponentFixture<CircleOfFifthsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CircleOfFifthsComponent]
    });
    fixture = TestBed.createComponent(CircleOfFifthsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
