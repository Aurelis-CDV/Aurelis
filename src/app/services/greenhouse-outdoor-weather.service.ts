import { inject, Injectable, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs';
import {
  GreenhouseData,
  GreenhouseLocationWeather,
} from '../../interfaces/greenhouses-data.interface';
import { WeatherApiService } from './weather-api.service';

@Injectable({
  providedIn: 'root',
})
export class GreenhouseOutdoorWeatherService {
  private readonly weatherApi = inject(WeatherApiService);

  private readonly weatherByGreenhouseId = signal<
    Readonly<Record<string, GreenhouseLocationWeather>>
  >({});

  private readonly loadingGreenhouseIds = signal<Readonly<Record<string, boolean>>>({});

  private activeRequest: Subscription | null = null;

  public readonly outdoorWeatherByGreenhouseId = this.weatherByGreenhouseId.asReadonly();
  public readonly outdoorWeatherLoadingByGreenhouseId = this.loadingGreenhouseIds.asReadonly();

  public loadOutdoorWeatherForDashboardGreenhouse(gh: GreenhouseData | undefined): void {
    this.activeRequest?.unsubscribe();
    this.activeRequest = null;

    if (!gh) {
      return;
    }

    const id = gh.id;
    const request$ = this.buildOutdoorWeatherRequest(gh);

    if (!request$) {
      return;
    }

    this.setLoading(id, true);

    this.activeRequest = request$
      .pipe(finalize(() => this.setLoading(id, false)))
      .subscribe({
        next: (weather) => {
          this.weatherByGreenhouseId.update((prev) => ({
            ...prev,
            [id]: weather,
          }));
        },
        error: () => {
          this.weatherByGreenhouseId.update((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        },
      });
  }

  private setLoading(id: string, loading: boolean): void {
    this.loadingGreenhouseIds.update((prev) => {
      const next = { ...prev };
      if (loading) {
        next[id] = true;
      } else {
        delete next[id];
      }
      return next;
    });
  }

  private buildOutdoorWeatherRequest(gh: GreenhouseData) {
    const { lat, lon, name } = gh.location;
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      return this.weatherApi.getCurrentConditions(lat, lon);
    }
    const placeName = name?.trim() ?? '';
    if (placeName.length > 0) {
      return this.weatherApi.getCurrentConditionsByLocationQuery(placeName);
    }
    return null;
  }
}
