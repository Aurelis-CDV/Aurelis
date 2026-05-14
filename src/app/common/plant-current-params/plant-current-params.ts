import { Component, Input } from '@angular/core';
import { PlantData } from '../../../interfaces/plant-data.interface';
import { PlantGeneralCondition } from '../icons/plant-general-condition/plant-general-condition';
import { WaterDrop } from '../icons/water-drop/water-drop';

@Component({
  selector: 'aurelis-plant-current-params',
  imports: [PlantGeneralCondition, WaterDrop],
  templateUrl: './plant-current-params.html',
  styleUrl: './plant-current-params.scss',
})
export class PlantCurrentParams {
  @Input() plant!: PlantData;

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

  protected soilDisplay(): string {
    const v = this.plant.soil_moisture;
    if (!Number.isFinite(v)) {
      return '—';
    }
    return `${Math.round(v * 10) / 10}%`;
  }
}
