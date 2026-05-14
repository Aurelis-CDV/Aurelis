import { Component, computed, input } from '@angular/core';
import {
  plantConditionFromParameterHealth,
  PlantParameterHealth,
} from '../../../utils/derive-plant-condition';
import { PlantGeneralCondition } from '../plant-general-condition/plant-general-condition';

@Component({
  selector: 'aurelis-parameter-health-icon',
  imports: [PlantGeneralCondition],
  templateUrl: './parameter-health-icon.html',
  styleUrl: './parameter-health-icon.scss',
})
export class ParameterHealthIcon {
  public readonly health = input.required<PlantParameterHealth>();

  protected readonly condition = computed(() => plantConditionFromParameterHealth(this.health()));

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
