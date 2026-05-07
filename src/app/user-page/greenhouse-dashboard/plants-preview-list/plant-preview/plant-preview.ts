import { ChangeDetectorRef, Component, Input, signal } from '@angular/core';
import { PlantGeneralCondition } from '../../../../common/icons/plant-general-condition/plant-general-condition';
import { WaterDrop } from '../../../../common/icons/water-drop/water-drop';
import { PlantPreviewHoverMenu } from '../plant-preview-hover-menu/plant-preview-hover-menu';
import { PlantCurrentParams } from '../../../../common/plant-current-params/plant-current-params';

@Component({
  selector: 'aurelis-plant-preview',
  imports: [PlantPreviewHoverMenu, PlantCurrentParams],
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
}
