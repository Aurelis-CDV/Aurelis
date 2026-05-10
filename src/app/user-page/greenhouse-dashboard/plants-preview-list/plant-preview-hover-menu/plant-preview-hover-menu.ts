import { Component, Input } from '@angular/core';
import { Trash } from '../../../../common/icons/trash/trash';
import { WaterDrop } from '../../../../common/icons/water-drop/water-drop';
import { Maximize } from '../../../../common/icons/maximize/maximize';

@Component({
  selector: 'aurelis-plant-preview-hover-menu',
  imports: [Trash, WaterDrop, Maximize],
  templateUrl: './plant-preview-hover-menu.html',
  styleUrl: './plant-preview-hover-menu.scss',
})
export class PlantPreviewHoverMenu {
  @Input() plant!: any;
}
