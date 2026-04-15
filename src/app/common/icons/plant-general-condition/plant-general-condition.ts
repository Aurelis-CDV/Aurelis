import { Component, Input } from '@angular/core';

@Component({
  selector: 'aurelis-plant-general-condition',
  imports: [],
  templateUrl: './plant-general-condition.html',
  styleUrl: './plant-general-condition.scss',
})
export class PlantGeneralCondition {
  @Input() condition: 'good' | 'bad' | 'mid' | 'unknown' = 'unknown';
}
