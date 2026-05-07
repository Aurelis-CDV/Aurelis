import { Component, inject } from '@angular/core';
import { GreenhousesDataService } from '../../services/greenhouses-data.service';

@Component({
  selector: 'aurelis-greenhouses-list',
  imports: [],
  templateUrl: './greenhouses-list.html',
  styleUrl: './greenhouses-list.scss',
})
export class GreenhousesList {
  private readonly greenhousesDataService = inject(GreenhousesDataService);
  protected readonly greenhouses = this.greenhousesDataService.greenhouses;

  public showGreenhousesPreviewNames: boolean = false;

  constructor() {}

  public toggleGreenhousesPreviewNames(): void {
    this.showGreenhousesPreviewNames = !this.showGreenhousesPreviewNames;
  }
}
