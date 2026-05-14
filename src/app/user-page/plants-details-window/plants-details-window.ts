import { Component, computed, inject } from '@angular/core';
import { Carousel } from '../../common/carousel/carousel';
import { PopupWindow } from '../../common/popup-window/popup-window';
import { DashboardSignalsService } from '../../services/dashboard-signals.service';
import { GreenhousesDataService } from '../../services/data.service';
import { PlantDetails } from './plant-details/plant-details';

@Component({
  selector: 'aurelis-plants-details-window',
  imports: [Carousel, PlantDetails, PopupWindow],
  templateUrl: './plants-details-window.html',
  styleUrl: './plants-details-window.scss',
})
export class PlantsDetailsWindow {
  private readonly dashboardSignalsService = inject(DashboardSignalsService);
  protected readonly greenhousesDataService = inject(GreenhousesDataService);

  public readonly greenhouseData = this.dashboardSignalsService.getDashboardGreenhouseData();

  private readonly plantDetailsFocusPlantId =
    this.dashboardSignalsService.getPlantDetailsFocusPlantId();

  public readonly plantDetailsCarouselLayoutRevision =
    this.dashboardSignalsService.getPlantDetailsCarouselLayoutRevision();

  public readonly plantDetailsCarouselInitialIndex = computed(() => {
    const plants = this.greenhouseData()?.plants ?? [];
    const focusId = this.plantDetailsFocusPlantId();
    if (!focusId || plants.length === 0) {
      return 0;
    }
    const idx = plants.findIndex((p) => p.id === focusId);
    return idx >= 0 ? idx : 0;
  });

  public hidePlantDetailsWindow(): void {
    this.dashboardSignalsService.setIsPlantDetailsWindowOpened(false);
  }

  protected reloadGreenhouseDataFromDetails(): void {
    if (this.greenhousesDataService.isLoading()) {
      return;
    }
    this.greenhousesDataService.fetchGreenhousesData();
  }
}
