import { Component, effect, inject } from '@angular/core';
import { TopBar } from './top-bar/top-bar';
import { PlantsPreviewList } from './plants-preview-list/plants-preview-list';
import { ChartCarousel } from './chart-carousel/chart-carousel';
import { CurrentParameters } from './current-parameters/current-parameters';
import { DashboardSignalsService } from '../../services/dashboard-signals.service';
import { GreenhouseOutdoorWeatherService } from '../../services/greenhouse-outdoor-weather.service';

@Component({
  selector: 'aurelis-greenhouse-dashboard',
  imports: [TopBar, PlantsPreviewList, ChartCarousel, CurrentParameters],
  templateUrl: './greenhouse-dashboard.html',
  styleUrl: './greenhouse-dashboard.scss',
})
export class GreenhouseDashboard {
  private readonly dashboardSignals = inject(DashboardSignalsService);
  private readonly outdoorWeather = inject(GreenhouseOutdoorWeatherService);

  constructor() {
    effect(() => {
      const gh = this.dashboardSignals.getDashboardGreenhouseData()();
      this.outdoorWeather.loadOutdoorWeatherForDashboardGreenhouse(gh);
    });
  }
}
