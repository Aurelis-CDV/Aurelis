import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { GreenhousesDataService } from './data.service';
import { GreenhouseData } from '../../interfaces/greenhouses-data.interface';

@Injectable({
  providedIn: 'root',
})
export class DashboardSignalsService {
  private isPlantDetailsWindowOpened: WritableSignal<boolean> = signal<boolean>(false);
  private isPlantFormWindowOpened: WritableSignal<boolean> = signal<boolean>(false);
  private plantFormWindowMode: WritableSignal<'add' | 'edit'> = signal<'add' | 'edit'>('add');
  private plantFormEditPlantId: WritableSignal<string | null> = signal<string | null>(null);

  private isGreenhouseFormWindowOpened: WritableSignal<boolean> = signal<boolean>(false);
  private greenhouseFormWindowMode: WritableSignal<'add' | 'edit'> = signal<'add' | 'edit'>('add');

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

  public getIsPlantFormWindowOpened(): Signal<boolean> {
    return this.isPlantFormWindowOpened.asReadonly();
  }

  public getPlantFormWindowMode(): Signal<'add' | 'edit'> {
    return this.plantFormWindowMode.asReadonly();
  }

  public getPlantFormEditPlantId(): Signal<string | null> {
    return this.plantFormEditPlantId.asReadonly();
  }

  public openPlantFormWindow(
    mode: 'add' | 'edit' = 'add',
    editPlantId: string | null = null,
  ): void {
    this.plantFormWindowMode.set(mode);
    this.plantFormEditPlantId.set(mode === 'edit' && editPlantId ? editPlantId : null);
    this.isPlantFormWindowOpened.set(true);
  }

  public setIsPlantFormWindowOpened(value: boolean): void {
    this.isPlantFormWindowOpened.set(value);
    if (!value) {
      this.plantFormWindowMode.set('add');
      this.plantFormEditPlantId.set(null);
    }
  }

  public getIsGreenhouseFormWindowOpened(): Signal<boolean> {
    return this.isGreenhouseFormWindowOpened.asReadonly();
  }

  public getGreenhouseFormWindowMode(): Signal<'add' | 'edit'> {
    return this.greenhouseFormWindowMode.asReadonly();
  }

  public openGreenhouseFormWindow(mode: 'add' | 'edit' = 'add'): void {
    this.greenhouseFormWindowMode.set(mode);
    this.isGreenhouseFormWindowOpened.set(true);
  }

  public setIsGreenhouseFormWindowOpened(value: boolean): void {
    this.isGreenhouseFormWindowOpened.set(value);
    if (!value) {
      this.greenhouseFormWindowMode.set('add');
    }
  }
}
