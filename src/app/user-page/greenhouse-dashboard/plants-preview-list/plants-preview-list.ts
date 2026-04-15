import { Component } from '@angular/core';
import ExampleJson from '../../../../example-json';
import { WaterDrop } from '../../../common/icons/water-drop/water-drop';
import { PlantGeneralCondition } from '../../../common/icons/plant-general-condition/plant-general-condition';

@Component({
  selector: 'aurelis-plants-preview-list',
  imports: [WaterDrop, PlantGeneralCondition],
  templateUrl: './plants-preview-list.html',
  styleUrl: './plants-preview-list.scss',
})
export class PlantsPreviewList {
  protected readonly plants = ExampleJson.greenhouses[0].plants as any;

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
