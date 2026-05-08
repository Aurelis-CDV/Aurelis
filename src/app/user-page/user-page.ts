import { Component, inject, Signal } from '@angular/core';
import { TopBar } from '../common/top-bar/top-bar';
import { GreenhousesList } from './greenhouses-list/greenhouses-list';
import { GreenhouseDashboard } from './greenhouse-dashboard/greenhouse-dashboard';
import { GreenhousesDataService } from '../services/data.service';
import { DashboardSignalsService } from '../services/dashboard-signals.service';
import { PlantsDetailsWindow } from './plants-details-window/plants-details-window';
import { PlantFormWindow } from './plant-form-window/plant-form-window';
import { GreenhouseFormWindow } from './greenhouse-form-window/greenhouse-form-window';

@Component({
  selector: 'aurelis-user-page',
  imports: [
    TopBar,
    GreenhousesList,
    GreenhouseDashboard,
    PlantsDetailsWindow,
    PlantFormWindow,
    GreenhouseFormWindow,
  ],
  templateUrl: './user-page.html',
  styleUrl: './user-page.scss',
})
export class UserPage {
  private readonly greenhousesDataService = inject(GreenhousesDataService);
  private readonly dashboardSignalsService = inject(DashboardSignalsService);

  public showPlantDetailsWindow: Signal<boolean> =
    this.dashboardSignalsService.getIsPlantDetailsWindowOpened();

  public showPlantFormWindow: Signal<boolean> =
    this.dashboardSignalsService.getIsPlantFormWindowOpened();

  public showGreenhouseFormWindow: Signal<boolean> =
    this.dashboardSignalsService.getIsGreenhouseFormWindowOpened();

  constructor() {
    this.greenhousesDataService.fetchGreenhousesData();
  }

  public setDashboardGreenhouseId(greenhouseId: string): void {
    this.dashboardSignalsService.setDashboardGreenhouseId(greenhouseId);
  }
}
