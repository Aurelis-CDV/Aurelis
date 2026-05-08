import { Component, inject } from '@angular/core';
import { Close } from '../../common/icons/close/close';
import { Carousel } from '../../common/carousel/carousel';
import { PlantDetails } from './plant-details/plant-details';
import { Refresh } from '../../common/icons/refresh/refresh';
import { DashboardSignalsService } from '../../services/dashboard-signals.service';

@Component({
  selector: 'aurelis-plants-details-window',
  imports: [Close, Carousel, PlantDetails, Refresh],
  templateUrl: './plants-details-window.html',
  styleUrl: './plants-details-window.scss',
})
export class PlantsDetailsWindow {
  private readonly dashboardSignalsService = inject(DashboardSignalsService);

  public readonly greenhouseData = this.dashboardSignalsService.getDashboardGreenhouseData();
}
