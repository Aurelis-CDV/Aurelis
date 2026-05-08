import { Component, inject, Input, output } from '@angular/core';
import { Trash } from '../../../../common/icons/trash/trash';
import { WaterDrop } from '../../../../common/icons/water-drop/water-drop';
import { Maximize } from '../../../../common/icons/maximize/maximize';
import { PlantData } from '../../../../../interfaces/plant-data.interface';
import { DashboardSignalsService } from '../../../../services/dashboard-signals.service';

@Component({
  selector: 'aurelis-plant-preview-hover-menu',
  imports: [Trash, WaterDrop, Maximize],
  templateUrl: './plant-preview-hover-menu.html',
  styleUrl: './plant-preview-hover-menu.scss',
})
export class PlantPreviewHoverMenu {
  @Input() public plant!: PlantData;

  public readonly wateringNoteRequested = output<void>();

  private readonly dashboardSignalsService = inject(DashboardSignalsService);

  constructor() {}

  public openWateringNote(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.wateringNoteRequested.emit();
  }

  public showPlantDetailsWindow(): void {
    this.dashboardSignalsService.setIsPlantDetailsWindowOpened(true);
  }
}
