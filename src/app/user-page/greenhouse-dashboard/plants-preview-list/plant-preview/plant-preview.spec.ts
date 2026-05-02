import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantPreview } from './plant-preview';

describe('PlantPreview', () => {
  let component: PlantPreview;
  let fixture: ComponentFixture<PlantPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantPreview],
    }).compileComponents();

    fixture = TestBed.createComponent(PlantPreview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
