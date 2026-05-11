import { Component, Input } from '@angular/core';
import { PlantCondition } from '../../../../interfaces/plant-condition.type';

@Component({
  selector: 'aurelis-plant-general-condition',
  imports: [],
  templateUrl: './plant-general-condition.html',
  styleUrl: './plant-general-condition.scss',
})
export class PlantGeneralCondition {
  @Input() condition: PlantCondition = 'unknown';
}
