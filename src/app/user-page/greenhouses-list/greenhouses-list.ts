import { Component } from '@angular/core';
import ExampleJson from '../../../example-json';

@Component({
  selector: 'aurelis-greenhouses-list',
  imports: [],
  templateUrl: './greenhouses-list.html',
  styleUrl: './greenhouses-list.scss',
})
export class GreenhousesList {
  protected readonly exampleJson = ExampleJson;

  public showGreenhousesPreviewNames: boolean = false;

  constructor() {}

  public toggleGreenhousesPreviewNames(): void {
    this.showGreenhousesPreviewNames = !this.showGreenhousesPreviewNames;
  }
}
