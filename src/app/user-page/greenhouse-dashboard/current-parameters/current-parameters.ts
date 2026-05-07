import { Component, inject } from '@angular/core';
import { Temperature } from '../../../common/icons/temperature/temperature';
import { WaterDrop } from '../../../common/icons/water-drop/water-drop';
import { Sun } from '../../../common/icons/sun/sun';
import { GreenhousesDataService } from '../../../services/greenhouses-data.service';

@Component({
  selector: 'aurelis-current-parameters',
  imports: [Temperature, WaterDrop, Sun],
  templateUrl: './current-parameters.html',
  styleUrl: './current-parameters.scss',
})
export class CurrentParameters {
  private readonly greenhousesDataService = inject(GreenhousesDataService);
  protected readonly greenhouses = this.greenhousesDataService.greenhouses;

  constructor() {}

  public getValue(type: string): number {
    const selectedGreenhouse = this.greenhouses()[0];

    if (!selectedGreenhouse) {
      return 0;
    }

    return selectedGreenhouse.params.find((param) => param.name === type)?.current || 0;
  }
}
