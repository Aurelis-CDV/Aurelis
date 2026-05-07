import { Component } from '@angular/core';
import ExampleJson from '../../../example-json';
import { GreenhousesData } from '../../../interfaces/greenhouses-data.interface';

@Component({
  selector: 'aurelis-greenhouses-list',
  imports: [],
  templateUrl: './greenhouses-list.html',
  styleUrl: './greenhouses-list.scss',
})
export class GreenhousesList {
  protected readonly exampleJson: GreenhousesData = ExampleJson as unknown as GreenhousesData;

  public showGreenhousesPreviewNames: boolean = false;

  constructor() {}

  public toggleGreenhousesPreviewNames(): void {
    this.showGreenhousesPreviewNames = !this.showGreenhousesPreviewNames;
  }
}
