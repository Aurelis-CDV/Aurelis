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

  constructor() {}

  public getPlantConditionDescription(condition: string): string {
    if (condition === 'good') {
      return 'All good!';
    }

    if (condition === 'bad') {
      return "It's bad!";
    }

    if (condition === 'mid') {
      return 'Ok, but not perfect...';
    }

    return 'Some unknown condition...';
  }
}
