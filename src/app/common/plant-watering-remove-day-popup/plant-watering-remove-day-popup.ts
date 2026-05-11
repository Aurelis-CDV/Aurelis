import { Component, computed, inject, input, output } from '@angular/core';
import { PlantData } from '../../../interfaces/plant-data.interface';
import { GreenhousesDataService } from '../../services/data.service';

@Component({
  selector: 'aurelis-plant-watering-remove-day-popup',
  imports: [],
  templateUrl: './plant-watering-remove-day-popup.html',
  styleUrl: './plant-watering-remove-day-popup.scss',
})
export class PlantWateringRemoveDayPopup {
  public readonly plant = input.required<PlantData>();
  public readonly greenhouseId = input.required<string>();
  public readonly calendarDay = input.required<Date>();

  public readonly closed = output<void>();

  private readonly greenhousesDataService = inject(GreenhousesDataService);

  protected readonly formattedDay = computed(() => {
    const d = this.calendarDay();
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });

  protected onBackdropMouseDown(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }

  protected cancel(): void {
    this.closed.emit();
  }

  protected removeEntriesForDay(): void {
    this.greenhousesDataService.removePlantWateringsOnLocalCalendarDay(
      this.greenhouseId(),
      this.plant().id,
      this.calendarDay(),
    );
    this.closed.emit();
  }
}
