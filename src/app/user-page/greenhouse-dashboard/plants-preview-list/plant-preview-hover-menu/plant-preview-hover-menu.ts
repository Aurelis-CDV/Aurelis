import { Component, inject, Input, output, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { Trash } from '../../../../common/icons/trash/trash';
import { WaterDrop } from '../../../../common/icons/water-drop/water-drop';
import { Maximize } from '../../../../common/icons/maximize/maximize';
import { PlantData } from '../../../../../interfaces/plant-data.interface';
import { DashboardSignalsService } from '../../../../services/dashboard-signals.service';
import { GreenhousesDataService } from '../../../../services/data.service';

@Component({
  selector: 'aurelis-plant-preview-hover-menu',
  imports: [Trash, WaterDrop, Maximize],
  templateUrl: './plant-preview-hover-menu.html',
  styleUrl: './plant-preview-hover-menu.scss',
})
export class PlantPreviewHoverMenu {
  @Input() public plant!: PlantData;

  public readonly wateringNoteRequested = output<void>();

  protected readonly isDeleting = signal(false);

  private readonly dashboardSignalsService = inject(DashboardSignalsService);
  private readonly greenhousesDataService = inject(GreenhousesDataService);

  public confirmDeletePlant(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.isDeleting()) {
      return;
    }

    const displayName = this.plant.name.trim() || this.plant.id;
    if (!window.confirm(`Delete plant "${displayName}"? This cannot be undone.`)) {
      return;
    }

    const greenhouseId = this.dashboardSignalsService.getDashboardGreenhouseId()();
    this.isDeleting.set(true);
    this.greenhousesDataService
      .deletePlantFromGreenhouse(greenhouseId, this.plant.id)
      .pipe(finalize(() => this.isDeleting.set(false)))
      .subscribe({
        next: (result) => {
          if (result.ok) {
            this.dashboardSignalsService.notifyPlantRemovedFromGreenhouse();
            return;
          }
          const message =
            result.reason === 'plant_not_found'
              ? 'This plant was already removed.'
              : result.reason === 'greenhouse_not_found'
                ? 'Could not find this greenhouse.'
                : 'Could not delete the plant. Check your connection and API.';
          window.alert(message);
        },
      });
  }

  public openWateringNote(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.wateringNoteRequested.emit();
  }

  public showPlantDetailsWindow(): void {
    this.dashboardSignalsService.openPlantDetailsWindow(this.plant.id);
  }
}
