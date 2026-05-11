import { Component } from '@angular/core';
import { Temperature } from '../../../common/icons/temperature/temperature';
import { WaterDrop } from '../../../common/icons/water-drop/water-drop';
import { Sun } from '../../../common/icons/sun/sun';
import ExampleJson from '../../../../example-json';

@Component({
  selector: 'aurelis-current-parameters',
  imports: [Temperature, WaterDrop, Sun],
  templateUrl: './current-parameters.html',
  styleUrl: './current-parameters.scss',
})
export class CurrentParameters {
  protected readonly exampleJson = ExampleJson;

  constructor() {}

  public getValue(type: string): number {
    return (
      this.exampleJson.greenhouses[0].params.find((param) => param.name === type)?.current || 0
    );
  }
}
