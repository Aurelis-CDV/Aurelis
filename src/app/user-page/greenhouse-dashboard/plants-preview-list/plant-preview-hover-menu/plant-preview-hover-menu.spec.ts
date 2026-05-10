import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantPreviewHoverMenu } from './plant-preview-hover-menu';

describe('PlantPreviewHoverMenu', () => {
  let component: PlantPreviewHoverMenu;
  let fixture: ComponentFixture<PlantPreviewHoverMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantPreviewHoverMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(PlantPreviewHoverMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
