import { Component, inject } from '@angular/core';
import { Close } from '../../common/icons/close/close';
import { DashboardSignalsService } from '../../services/dashboard-signals.service';

@Component({
  selector: 'aurelis-add-plant-window',
  imports: [Close],
  templateUrl: './add-plant-window.html',
  styleUrl: './add-plant-window.scss',
})
export class AddPlantWindow {
  private readonly dashboardSignalsService = inject(DashboardSignalsService);

  protected close(): void {
    this.dashboardSignalsService.setIsAddPlantWindowOpened(false);
  }
}
