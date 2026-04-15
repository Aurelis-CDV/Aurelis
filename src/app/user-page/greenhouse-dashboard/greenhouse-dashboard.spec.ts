import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GreenhouseDashboard } from './greenhouse-dashboard';

describe('GreenhouseDashboard', () => {
  let component: GreenhouseDashboard;
  let fixture: ComponentFixture<GreenhouseDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GreenhouseDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(GreenhouseDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
