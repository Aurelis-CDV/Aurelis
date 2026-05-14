import { Component, input } from '@angular/core';
import { PlantParameterHealth } from '../../../utils/derive-plant-condition';

@Component({
  selector: 'aurelis-parameter-health-icon',
  imports: [],
  templateUrl: './parameter-health-icon.html',
  styleUrl: './parameter-health-icon.scss',
})
export class ParameterHealthIcon {
  public readonly health = input.required<PlantParameterHealth>();

  protected ariaLabel(): string {
    switch (this.health()) {
      case 'ideal':
        return 'In ideal range';
      case 'acceptable':
        return 'Acceptable range';
      case 'bad':
        return 'Out of range or critical';
      default:
        return 'No data';
    }
  }
}
