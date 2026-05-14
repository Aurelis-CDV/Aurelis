import { Component, Input } from '@angular/core';
import { PlantCondition } from '../../../interfaces/plant-condition.type';
import { PlantData } from '../../../interfaces/plant-data.interface';
import {
  PlantParameterHealth,
  soilMoistureParameterHealth,
  temperatureParameterHealth,
} from '../../utils/derive-plant-condition';
import { PlantGeneralCondition } from '../icons/plant-general-condition/plant-general-condition';
import { Temperature } from '../icons/temperature/temperature';
import { WaterDrop } from '../icons/water-drop/water-drop';

@Component({
  selector: 'aurelis-plant-current-params',
  imports: [PlantGeneralCondition, WaterDrop, Temperature],
  templateUrl: './plant-current-params.html',
  styleUrl: './plant-current-params.scss',
})
export class PlantCurrentParams {
  @Input() plant!: PlantData;
  @Input() public greenhouseTemperatureC: number | undefined = undefined;

  protected conditionFromParameterHealth(health: PlantParameterHealth): PlantCondition {
    switch (health) {
      case 'ideal':
        return 'good';
      case 'acceptable':
        return 'good_but_could_be_better';
      case 'bad':
        return 'bad';
      default:
        return 'unknown';
    }
  }

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
    if (
      this.greenhouseTemperatureC === undefined ||
      !Number.isFinite(this.greenhouseTemperatureC)
    ) {
      return '—';
    }
    return `${Math.round(this.greenhouseTemperatureC)}°C`;
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

  protected soilMoistureHealth(): PlantParameterHealth {
    return soilMoistureParameterHealth(this.plant.soil_moisture);
  }
}
