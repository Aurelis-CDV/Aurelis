import { Component, inject, Input } from '@angular/core';
import { DashboardSignalsService } from '../../../services/dashboard-signals.service';
import {
  GreenhousesDataService,
  MAX_GREENHOUSES_IN_DASHBOARD,
} from '../../../services/data.service';

@Component({
  selector: 'aurelis-greenhouse-preview-add-slot',
  imports: [],
  templateUrl: './greenhouse-preview-add-slot.html',
  styleUrl: './greenhouse-preview-add-slot.scss',
})
export class GreenhousePreviewAddSlot {
  @Input({ required: true }) public showLabel!: boolean;

  private readonly dashboardSignals = inject(DashboardSignalsService);
  private readonly greenhousesData = inject(GreenhousesDataService);

  protected openGreenhouseFormWindow(): void {
    if (this.greenhousesData.greenhousesData().length >= MAX_GREENHOUSES_IN_DASHBOARD) {
      return;
    }
    this.dashboardSignals.openGreenhouseFormWindow('add');
  }
}
