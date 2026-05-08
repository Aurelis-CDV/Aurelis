import { Component, inject } from '@angular/core';
import { DashboardSignalsService } from '../../../../services/dashboard-signals.service';

@Component({
  selector: 'aurelis-plant-preview-add-slot',
  templateUrl: './plant-preview-add-slot.html',
  styleUrl: './plant-preview-add-slot.scss',
})
export class PlantPreviewAddSlot {
  private readonly dashboardSignals = inject(DashboardSignalsService);

  protected readonly greenhouse = this.dashboardSignals.getDashboardGreenhouseData();

  protected openPlantFormWindow(): void {
    const gh = this.greenhouse();
    if (!gh || gh.plants.length >= 6) {
      return;
    }
    this.dashboardSignals.openPlantFormWindow('add');
  }
}
