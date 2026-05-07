import { Component, inject } from '@angular/core';
import { Close } from '../../common/icons/close/close';
import { Carousel } from '../../common/carousel/carousel';
import { PlantDetails } from './plant-details/plant-details';
import { Refresh } from '../../common/icons/refresh/refresh';
import { GreenhousesDataService } from '../../services/greenhouses-data.service';

@Component({
  selector: 'aurelis-plants-details-window',
  imports: [Close, Carousel, PlantDetails, Refresh],
  templateUrl: './plants-details-window.html',
  styleUrl: './plants-details-window.scss',
})
export class PlantsDetailsWindow {
  private readonly greenhousesDataService = inject(GreenhousesDataService);
  protected readonly greenhouses = this.greenhousesDataService.greenhouses;
}
