import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantDetails } from './plant-details';
import { PlantData } from '../../../../interfaces/plant-data.interface';

describe('PlantDetails', () => {
  let component: PlantDetails;
  let fixture: ComponentFixture<PlantDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(PlantDetails);
    component = fixture.componentInstance;
    const plant: PlantData = {
      name: 'Plant 1',
      id: '123456789',
      preview_url: 'onion.png',
      soil_moisture: 50,
      condition: 'good',
      soil_moisture_history: [{ date: '16.12.2026', value: 43 }],
      watering_history: [],
    };
    fixture.componentRef.setInput('plant', plant);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
