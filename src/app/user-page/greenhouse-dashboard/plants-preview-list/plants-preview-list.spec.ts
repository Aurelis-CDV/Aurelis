import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantsPreviewList } from './plants-preview-list';

describe('PlantsPreviewList', () => {
  let component: PlantsPreviewList;
  let fixture: ComponentFixture<PlantsPreviewList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantsPreviewList],
    }).compileComponents();

    fixture = TestBed.createComponent(PlantsPreviewList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
