import { ChangeDetectorRef, Component, Input, signal } from '@angular/core';
import { PlantGeneralCondition } from '../../../../common/icons/plant-general-condition/plant-general-condition';
import { WaterDrop } from '../../../../common/icons/water-drop/water-drop';
import { PlantPreviewHoverMenu } from '../plant-preview-hover-menu/plant-preview-hover-menu';

@Component({
  selector: 'aurelis-plant-preview',
  imports: [PlantGeneralCondition, WaterDrop, PlantPreviewHoverMenu],
  templateUrl: './plant-preview.html',
  styleUrl: './plant-preview.scss',
})
export class PlantPreview {
  @Input() plant!: any;

  public showHoverMenu = signal(false);

  constructor(private cdr: ChangeDetectorRef) {}

  public toggleHoverMenu() {
    this.showHoverMenu.set(!this.showHoverMenu());
  }

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
