import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParameterHealthIcon } from './parameter-health-icon';

describe('ParameterHealthIcon', () => {
  let fixture: ComponentFixture<ParameterHealthIcon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParameterHealthIcon],
    }).compileComponents();

    fixture = TestBed.createComponent(ParameterHealthIcon);
    await fixture.whenStable();
  });

  it('should create', () => {
    fixture.componentRef.setInput('health', 'ideal');
    expect(fixture.componentInstance).toBeTruthy();
  });
});
