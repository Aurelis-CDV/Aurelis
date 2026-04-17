import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartCarousel } from './chart-carousel';

describe('ChartCarousel', () => {
  let component: ChartCarousel;
  let fixture: ComponentFixture<ChartCarousel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartCarousel],
    }).compileComponents();

    fixture = TestBed.createComponent(ChartCarousel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
