import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PlantData } from '../../../../interfaces/plant-data.interface';
import { DashboardSignalsService } from '../../../services/dashboard-signals.service';
import { GreenhouseMeasurementsService } from '../../../services/greenhouse-measurements.service';
import { PlantDetails } from './plant-details';

const plantFixture: PlantData = {
  name: 'Test plant',
  id: '1',
  preview_url: '',
  soil_moisture: 0,
  condition: 'unknown',
  soil_moisture_history: [],
  watering_history: [],
};

describe('PlantDetails', () => {
  let component: PlantDetails;
  let fixture: ComponentFixture<PlantDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantDetails],
      providers: [
        {
          provide: DashboardSignalsService,
          useValue: {
            getDashboardGreenhouseId: () => signal('2'),
            openPlantFormWindow: (): void => undefined,
          },
        },
        {
          provide: GreenhouseMeasurementsService,
          useValue: {
            fetchPlantSoilMoistureSeries: () => of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PlantDetails);
    component = fixture.componentInstance;
    component.plant = plantFixture;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
