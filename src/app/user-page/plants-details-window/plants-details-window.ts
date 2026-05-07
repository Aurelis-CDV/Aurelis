import { Component } from '@angular/core';
import { Close } from '../../common/icons/close/close';
import { Carousel } from '../../common/carousel/carousel';
import ExampleJson from '../../../example-json';
import { PlantDetails } from './plant-details/plant-details';
import { GreenhousesData } from '../../../interfaces/greenhouses-data.interface';
import { Refresh } from '../../common/icons/refresh/refresh';

@Component({
  selector: 'aurelis-plants-details-window',
  imports: [Close, Carousel, PlantDetails, Refresh],
  templateUrl: './plants-details-window.html',
  styleUrl: './plants-details-window.scss',
})
export class PlantsDetailsWindow {
  protected readonly exampleJson: GreenhousesData = ExampleJson as unknown as GreenhousesData;
}
