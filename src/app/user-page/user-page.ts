import { Component, inject, Signal } from '@angular/core';
import { TopBar } from '../common/top-bar/top-bar';
import { GreenhousesList } from './greenhouses-list/greenhouses-list';
import { GreenhouseDashboard } from './greenhouse-dashboard/greenhouse-dashboard';
import { GreenhousesDataService } from '../services/data.service';
import { DashboardSignalsService } from '../services/dashboard-signals.service';
import { PlantsDetailsWindow } from './plants-details-window/plants-details-window';
import { AddPlantWindow } from './add-plant-window/add-plant-window';
import { AddGreenhouseWindow } from './add-greenhouse-window/add-greenhouse-window';

@Component({
  selector: 'aurelis-user-page',
  imports: [
    TopBar,
    GreenhousesList,
    GreenhouseDashboard,
    PlantsDetailsWindow,
    AddPlantWindow,
    AddGreenhouseWindow,
  ],
  templateUrl: './user-page.html',
  styleUrl: './user-page.scss',
})
export class UserPage {
  private readonly greenhousesDataService = inject(GreenhousesDataService);
  private readonly dashboardSignalsService = inject(DashboardSignalsService);

  public showPlantDetailsWindow: Signal<boolean> =
    this.dashboardSignalsService.getIsPlantDetailsWindowOpened();

  public showAddPlantWindow: Signal<boolean> =
    this.dashboardSignalsService.getIsAddPlantWindowOpened();

  public showAddGreenhouseWindow: Signal<boolean> =
    this.dashboardSignalsService.getIsAddGreenhouseWindowOpened();

  constructor() {
    this.greenhousesDataService.fetchGreenhousesData();
  }

  public setDashboardGreenhouseId(greenhouseId: string): void {
    this.dashboardSignalsService.setDashboardGreenhouseId(greenhouseId);
  }
}
