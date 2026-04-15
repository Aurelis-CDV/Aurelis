import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantGeneralCondition } from './plant-general-condition';

describe('PlantGeneralCondition', () => {
  let component: PlantGeneralCondition;
  let fixture: ComponentFixture<PlantGeneralCondition>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantGeneralCondition],
    }).compileComponents();

    fixture = TestBed.createComponent(PlantGeneralCondition);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
