import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { TopBar } from './top-bar';
import { DashboardSignalsService } from '../../../services/dashboard-signals.service';
import { GreenhousesDataService } from '../../../services/data.service';

describe('TopBar', () => {
  let component: TopBar;
  let fixture: ComponentFixture<TopBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopBar],
      providers: [
        {
          provide: DashboardSignalsService,
          useValue: {
            getDashboardGreenhouseData: () => signal(undefined),
            openGreenhouseFormWindow: (): void => undefined,
          },
        },
        {
          provide: GreenhousesDataService,
          useValue: {
            isLoading: signal(false),
            fetchGreenhousesData: (): void => undefined,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TopBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
