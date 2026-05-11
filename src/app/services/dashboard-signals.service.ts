import {
  computed,
  effect,
  inject,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
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

  private plantDetailsCarouselLayoutRevision: WritableSignal<number> = signal(0);
  private plantDetailsFocusPlantId: WritableSignal<string | null> = signal<string | null>(null);

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

  public constructor() {
    effect(() => {
      const list = this.greenhousesDataService.greenhousesData();
      const current = this.dashboardGreenhouseId();
      if (list.length === 0) {
        return;
      }
      const hasCurrent = list.some((gh) => gh.id === current);

      if (!hasCurrent) {
        this.dashboardGreenhouseId.set(list[0].id);
      }
    });
  }

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
    if (!value) {
      this.plantDetailsFocusPlantId.set(null);
    }
  }

  public getPlantDetailsFocusPlantId(): Signal<string | null> {
    return this.plantDetailsFocusPlantId.asReadonly();
  }

  public openPlantDetailsWindow(plantId: string): void {
    this.plantDetailsFocusPlantId.set(plantId);
    this.isPlantDetailsWindowOpened.set(true);
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

  public getPlantDetailsCarouselLayoutRevision(): Signal<number> {
    return this.plantDetailsCarouselLayoutRevision.asReadonly();
  }

  public notifyPlantRemovedFromGreenhouse(): void {
    this.plantDetailsCarouselLayoutRevision.update((n) => n + 1);
  }
}
