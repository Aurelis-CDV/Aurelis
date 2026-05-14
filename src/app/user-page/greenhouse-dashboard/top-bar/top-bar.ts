import { Component, inject } from '@angular/core';
import { Refresh } from '../../../common/icons/refresh/refresh';
import { Settings } from '../../../common/icons/settings/settings';
import { DashboardSignalsService } from '../../../services/dashboard-signals.service';
import { GreenhousesDataService } from '../../../services/data.service';

@Component({
  selector: 'aurelis-dashboard-top-bar',
  imports: [Refresh, Settings],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss',
})
export class TopBar {
  private readonly dashboardSignalsService = inject(DashboardSignalsService);
  private readonly greenhousesDataService = inject(GreenhousesDataService);

  public readonly greenhouseData = this.dashboardSignalsService.getDashboardGreenhouseData();
  protected readonly isReloadingGreenhouseData = this.greenhousesDataService.isLoading;

  public openGreenhouseSettings(): void {
    this.dashboardSignalsService.openGreenhouseFormWindow('edit');
  }

  protected reloadGreenhouseData(): void {
    if (this.isReloadingGreenhouseData()) {
      return;
    }
    this.greenhousesDataService.fetchGreenhousesData();
  }
}
