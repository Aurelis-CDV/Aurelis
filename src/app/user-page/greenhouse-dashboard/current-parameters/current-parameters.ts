import { Component, inject } from '@angular/core';
import { Temperature } from '../../../common/icons/temperature/temperature';
import { WaterDrop } from '../../../common/icons/water-drop/water-drop';
import { Sun } from '../../../common/icons/sun/sun';
import { DashboardSignalsService } from '../../../services/dashboard-signals.service';

@Component({
  selector: 'aurelis-current-parameters',
  imports: [Temperature, WaterDrop, Sun],
  templateUrl: './current-parameters.html',
  styleUrl: './current-parameters.scss',
})
export class CurrentParameters {
  private readonly dashboardSignalsService = inject(DashboardSignalsService);

  public readonly greenhouseData = this.dashboardSignalsService.getDashboardGreenhouseData();

  constructor() {}

  public getValue(type: string): number {
    return this.greenhouseData()?.params.find((param) => param.name === type)?.current || 0;
  }
}
