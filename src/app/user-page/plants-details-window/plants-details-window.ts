import { Component } from '@angular/core';
import { Close } from '../../common/icons/close/close';
import { Carousel } from '../../common/carousel/carousel';
import ExampleJson from '../../../example-json';
import { PlantDetails } from './plant-details/plant-details';
import { GreenhousesData } from '../../../interfaces/greenhouses-data.interface';

@Component({
  selector: 'aurelis-plants-details-window',
  imports: [Close, Carousel, PlantDetails],
  templateUrl: './plants-details-window.html',
  styleUrl: './plants-details-window.scss',
})
export class PlantsDetailsWindow {
  protected readonly exampleJson: GreenhousesData = ExampleJson as unknown as GreenhousesData;
}
