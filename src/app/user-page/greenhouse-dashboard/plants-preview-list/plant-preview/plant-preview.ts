import { Component, computed, inject, Input, signal } from '@angular/core';
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

  private readonly dashboardGreenhouse = this.dashboardSignalsService.getDashboardGreenhouseData();

  protected readonly greenhouseClimate = computed(() => {
    const gh = this.dashboardGreenhouse();
    const t = gh?.params.find((p) => p.name === 'temperature')?.current;
    const h = gh?.params.find((p) => p.name === 'humidity')?.current;
    return {
      temperatureC: typeof t === 'number' && Number.isFinite(t) ? t : undefined,
      airHumidityPercent: typeof h === 'number' && Number.isFinite(h) ? h : undefined,
    };
  });

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
