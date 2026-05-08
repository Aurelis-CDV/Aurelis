import { Component, inject } from '@angular/core';
import { TopBar } from '../common/top-bar/top-bar';
import { GreenhousesList } from './greenhouses-list/greenhouses-list';
import { GreenhouseDashboard } from './greenhouse-dashboard/greenhouse-dashboard';
import { GreenhousesDataService } from '../services/data.service';
import { DashboardSignalsService } from '../services/dashboard-signals.service';

@Component({
  selector: 'aurelis-user-page',
  imports: [TopBar, GreenhousesList, GreenhouseDashboard],
  templateUrl: './user-page.html',
  styleUrl: './user-page.scss',
})
export class UserPage {
  private readonly greenhousesDataService = inject(GreenhousesDataService);
  private readonly dashboardSignalsService = inject(DashboardSignalsService);

  constructor() {
    this.greenhousesDataService.fetchGreenhousesData();
  }

  public setDashboardGreenhouseId(greenhouseId: string): void {
    this.dashboardSignalsService.setDashboardGreenhouseId(greenhouseId);
  }
}
