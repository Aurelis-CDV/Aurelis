import { Component, inject, Input, signal } from '@angular/core';
import { PlantPreviewHoverMenu } from '../plant-preview-hover-menu/plant-preview-hover-menu';
import { PlantCurrentParams } from '../../../../common/plant-current-params/plant-current-params';
import { PlantWateringNotePopup } from '../../../../common/plant-watering-note-popup/plant-watering-note-popup';
import { DashboardSignalsService } from '../../../../services/dashboard-signals.service';
import { PlantData } from '../../../../../interfaces/plant-data.interface';

@Component({
  selector: 'aurelis-plant-preview',
  imports: [PlantPreviewHoverMenu, PlantCurrentParams, PlantWateringNotePopup],
  templateUrl: './plant-preview.html',
  styleUrl: './plant-preview.scss',
})
export class PlantPreview {
  @Input() plant!: PlantData;

  public showHoverMenu = signal(false);
  protected readonly wateringNotePopupOpen = signal(false);

  private readonly dashboardSignalsService = inject(DashboardSignalsService);

  protected readonly dashboardGreenhouseId = this.dashboardSignalsService.getDashboardGreenhouseId();

  public toggleHoverMenu() {
    this.showHoverMenu.set(!this.showHoverMenu());
  }

  protected openWateringNotePopup(): void {
    this.wateringNotePopupOpen.set(true);
  }

  protected closeWateringNotePopup(): void {
    this.wateringNotePopupOpen.set(false);
  }
}
