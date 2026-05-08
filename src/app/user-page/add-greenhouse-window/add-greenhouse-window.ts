import { Component, inject } from '@angular/core';
import { Close } from '../../common/icons/close/close';
import { DashboardSignalsService } from '../../services/dashboard-signals.service';

@Component({
  selector: 'aurelis-add-greenhouse-window',
  imports: [Close],
  templateUrl: './add-greenhouse-window.html',
  styleUrl: './add-greenhouse-window.scss',
})
export class AddGreenhouseWindow {
  private readonly dashboardSignalsService = inject(DashboardSignalsService);

  protected close(): void {
    this.dashboardSignalsService.setIsAddGreenhouseWindowOpened(false);
  }
}
