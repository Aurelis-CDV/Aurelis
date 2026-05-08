import { Component, computed, EventEmitter, inject, Output, WritableSignal } from '@angular/core';
import { GreenhousesDataService } from '../../services/data.service';
import { GreenhousesData } from '../../../interfaces/greenhouses-data.interface';
import { DashboardSignalsService } from '../../services/dashboard-signals.service';
import {
  GreenhousePreviewAddSlot,
  MAX_GREENHOUSES_IN_DASHBOARD,
} from './greenhouse-preview-add-slot/greenhouse-preview-add-slot';

@Component({
  selector: 'aurelis-greenhouses-list',
  imports: [GreenhousePreviewAddSlot],
  templateUrl: './greenhouses-list.html',
  styleUrl: './greenhouses-list.scss',
})
export class GreenhousesList {
  @Output() public onGreenhousePreviewClicked: EventEmitter<string> = new EventEmitter();

  public showGreenhousesPreviewNames: boolean = false;

  private readonly greenhousesDataService = inject(GreenhousesDataService);
  private readonly dashboardSignalsService = inject(DashboardSignalsService);

  protected readonly activeGreenhouseId = this.dashboardSignalsService.getDashboardGreenhouseId();
  protected readonly greenhouses: WritableSignal<GreenhousesData> =
    this.greenhousesDataService.greenhousesData;

  protected readonly showAddGreenhouseSlot = computed(
    () => this.greenhouses().length < MAX_GREENHOUSES_IN_DASHBOARD,
  );

  constructor() {}

  public greenhousePreviewClicked(greenhouseId: string): void {
    this.onGreenhousePreviewClicked.emit(greenhouseId);
  }

  public toggleGreenhousesPreviewNames(): void {
    this.showGreenhousesPreviewNames = !this.showGreenhousesPreviewNames;
  }
}
