import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantDetails } from './plant-details';

describe('PlantDetails', () => {
  let component: PlantDetails;
  let fixture: ComponentFixture<PlantDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(PlantDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
