import { Component, EventEmitter, inject, Output, WritableSignal } from '@angular/core';
import { GreenhousesDataService } from '../../services/data.service';
import { GreenhousesData } from '../../../interfaces/greenhouses-data.interface';

@Component({
  selector: 'aurelis-greenhouses-list',
  imports: [],
  templateUrl: './greenhouses-list.html',
  styleUrl: './greenhouses-list.scss',
})
export class GreenhousesList {
  @Output() public onGreenhousePreviewClicked: EventEmitter<string> = new EventEmitter();

  public showGreenhousesPreviewNames: boolean = false;

  private readonly greenhousesDataService = inject(GreenhousesDataService);
  protected readonly greenhouses: WritableSignal<GreenhousesData> =
    this.greenhousesDataService.greenhousesData;

  constructor() {}

  public greenhousePreviewClicked(greenhouseId: string): void {
    this.onGreenhousePreviewClicked.emit(greenhouseId);
  }

  public toggleGreenhousesPreviewNames(): void {
    this.showGreenhousesPreviewNames = !this.showGreenhousesPreviewNames;
  }
}
