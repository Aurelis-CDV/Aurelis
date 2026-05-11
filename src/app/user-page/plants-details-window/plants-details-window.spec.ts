import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantDetailsWindow } from './plants-details-window';

describe('PlantDetailsWindow', () => {
  let component: PlantDetailsWindow;
  let fixture: ComponentFixture<PlantDetailsWindow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantDetailsWindow],
    }).compileComponents();

    fixture = TestBed.createComponent(PlantDetailsWindow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
