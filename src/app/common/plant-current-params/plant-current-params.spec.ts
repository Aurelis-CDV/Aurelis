import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantCurrentParams } from './plant-current-params';

describe('PlantCurrentParams', () => {
  let component: PlantCurrentParams;
  let fixture: ComponentFixture<PlantCurrentParams>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantCurrentParams],
    }).compileComponents();

    fixture = TestBed.createComponent(PlantCurrentParams);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
