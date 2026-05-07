import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantsDetailsWindow } from './plants-details-window';

describe('PlantDetailsWindow', () => {
  let component: PlantsDetailsWindow;
  let fixture: ComponentFixture<PlantsDetailsWindow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantsDetailsWindow],
    }).compileComponents();

    fixture = TestBed.createComponent(PlantsDetailsWindow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
