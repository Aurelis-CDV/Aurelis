import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { GreenhousesDataService } from './data.service';
import { GreenhouseData } from '../../interfaces/greenhouses-data.interface';

@Injectable({
  providedIn: 'root',
})
export class DashboardSignalsService {
  private isPlantDetailsWindowOpened: WritableSignal<boolean> = signal<boolean>(false);

  private readonly greenhousesDataService: GreenhousesDataService = inject(GreenhousesDataService);

  private readonly dashboardGreenhouseId: WritableSignal<string> = signal<string>(
    this.greenhousesDataService.greenhousesData()[0]?.id,
  );
  private readonly dashboardGreenhouseData: Signal<GreenhouseData | undefined> = computed(
    (): GreenhouseData | undefined =>
      this.greenhousesDataService
        .greenhousesData()
        .find(
          (greenhouse: GreenhouseData): boolean => greenhouse.id === this.dashboardGreenhouseId(),
        ),
  );

  public constructor() {}

  public getDashboardGreenhouseId(): Signal<string> {
    return this.dashboardGreenhouseId.asReadonly();
  }

  public setDashboardGreenhouseId(greenhouseId: string): void {
    this.dashboardGreenhouseId.set(greenhouseId);
  }

  public getDashboardGreenhouseData(): Signal<GreenhouseData | undefined> {
    return this.dashboardGreenhouseData;
  }

  public getIsPlantDetailsWindowOpened(): Signal<boolean> {
    return this.isPlantDetailsWindowOpened.asReadonly();
  }

  public setIsPlantDetailsWindowOpened(value: boolean): void {
    this.isPlantDetailsWindowOpened.set(value);
  }
}
