import { Component, computed, inject } from '@angular/core';
import { Temperature } from '../../../common/icons/temperature/temperature';
import { WaterDrop } from '../../../common/icons/water-drop/water-drop';
import { Sun } from '../../../common/icons/sun/sun';
import { DashboardSignalsService } from '../../../services/dashboard-signals.service';
import { GreenhouseOutdoorWeatherService } from '../../../services/greenhouse-outdoor-weather.service';

@Component({
  selector: 'aurelis-current-parameters',
  imports: [Temperature, WaterDrop, Sun],
  templateUrl: './current-parameters.html',
  styleUrl: './current-parameters.scss',
})
export class CurrentParameters {
  private readonly dashboardSignalsService = inject(DashboardSignalsService);
  private readonly outdoorWeather = inject(GreenhouseOutdoorWeatherService);

  public readonly greenhouseData = this.dashboardSignalsService.getDashboardGreenhouseData();

  private readonly activeGreenhouseId = computed(() => this.greenhouseData()?.id);

  protected readonly outdoorTemperatureDisplay = computed(() => {
    const id = this.activeGreenhouseId();
    if (!id) {
      return '—';
    }
    const w = this.outdoorWeather.outdoorWeatherByGreenhouseId()[id];
    return w ? `${Math.round(w.temperatureC)}°C` : '—';
  });

  protected readonly outdoorHumidityDisplay = computed(() => {
    const id = this.activeGreenhouseId();
    if (!id) {
      return '—';
    }
    const w = this.outdoorWeather.outdoorWeatherByGreenhouseId()[id];
    return w ? `${Math.round(w.humidityPercent)}%` : '—';
  });

  protected readonly locationWeatherLoading = computed(() => {
    const id = this.activeGreenhouseId();
    if (!id) {
      return false;
    }
    return !!this.outdoorWeather.outdoorWeatherLoadingByGreenhouseId()[id];
  });

  protected readonly indoorLightDisplay = computed(() => {
    const raw = this.greenhouseData()?.params.find((p) => p.name === 'light')?.current ?? 0;
    return raw >= 1 ? 'On' : 'Off';
  });

  public getValue(type: string): number {
    return this.greenhouseData()?.params.find((param) => param.name === type)?.current || 0;
  }
}
