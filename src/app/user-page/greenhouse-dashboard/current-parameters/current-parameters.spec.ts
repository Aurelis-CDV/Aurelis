import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentParameters } from './current-parameters';

describe('CurrentParameters', () => {
  let component: CurrentParameters;
  let fixture: ComponentFixture<CurrentParameters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentParameters],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrentParameters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
