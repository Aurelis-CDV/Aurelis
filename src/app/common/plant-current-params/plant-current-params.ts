import { Component, Input } from '@angular/core';
import { PlantData } from '../../../interfaces/plant-data.interface';
import {
  airHumidityParameterHealth,
  PlantParameterHealth,
  soilMoistureParameterHealth,
  temperatureParameterHealth,
} from '../../utils/derive-plant-condition';
import { ParameterHealthIcon } from '../icons/parameter-health-icon/parameter-health-icon';
import { PlantGeneralCondition } from '../icons/plant-general-condition/plant-general-condition';
import { Temperature } from '../icons/temperature/temperature';
import { WaterDrop } from '../icons/water-drop/water-drop';

@Component({
  selector: 'aurelis-plant-current-params',
  imports: [PlantGeneralCondition, WaterDrop, Temperature, ParameterHealthIcon],
  templateUrl: './plant-current-params.html',
  styleUrl: './plant-current-params.scss',
})
export class PlantCurrentParams {
  @Input() plant!: PlantData;
  /** Indoor air temperature (°C) for this greenhouse; omit when unknown. */
  @Input() public greenhouseTemperatureC: number | undefined = undefined;
  /** Indoor air humidity (%); omit when unknown. */
  @Input() public greenhouseAirHumidityPercent: number | undefined = undefined;

  public getPlantConditionDescription(condition: string): string {
    if (condition === 'good') {
      return 'All good!';
    }

    if (condition === 'good_but_could_be_better') {
      return 'Ok, but not perfect...';
    }

    if (condition === 'bad') {
      return "It's bad!";
    }

    return 'Some unknown condition...';
  }

  protected temperatureDisplay(): string {
    if (this.greenhouseTemperatureC === undefined || !Number.isFinite(this.greenhouseTemperatureC)) {
      return '—';
    }
    return `${Math.round(this.greenhouseTemperatureC)}°C`;
  }

  protected humidityDisplay(): string {
    if (this.greenhouseAirHumidityPercent === undefined || !Number.isFinite(this.greenhouseAirHumidityPercent)) {
      return '—';
    }
    return `${Math.round(this.greenhouseAirHumidityPercent)}%`;
  }

  protected soilDisplay(): string {
    const v = this.plant.soil_moisture;
    if (!Number.isFinite(v)) {
      return '—';
    }
    return `${Math.round(v * 10) / 10}%`;
  }

  protected temperatureHealth(): PlantParameterHealth {
    return temperatureParameterHealth(this.greenhouseTemperatureC);
  }

  protected airHumidityHealth(): PlantParameterHealth {
    return airHumidityParameterHealth(this.greenhouseAirHumidityPercent);
  }

  protected soilMoistureHealth(): PlantParameterHealth {
    return soilMoistureParameterHealth(this.plant.soil_moisture);
  }
}
