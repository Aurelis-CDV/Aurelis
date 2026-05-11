import { Component, inject } from '@angular/core';
import { Refresh } from '../../../common/icons/refresh/refresh';
import { Settings } from '../../../common/icons/settings/settings';
import { DashboardSignalsService } from '../../../services/dashboard-signals.service';

@Component({
  selector: 'aurelis-dashboard-top-bar',
  imports: [Refresh, Settings],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss',
})
export class TopBar {
  private readonly dashboardSignalsService = inject(DashboardSignalsService);

  public readonly greenhouseData = this.dashboardSignalsService.getDashboardGreenhouseData();
}
