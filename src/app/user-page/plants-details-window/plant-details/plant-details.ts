import { AfterViewChecked, Component, ElementRef, inject, Input, signal } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { Calendar } from '../../../common/calendar/calendar';
import { PlantData } from '../../../../interfaces/plant-data.interface';
import { PlantCurrentParams } from '../../../common/plant-current-params/plant-current-params';
import { Select } from '../../../common/select/select';
import { PlantWateringNotePopup } from '../../../common/plant-watering-note-popup/plant-watering-note-popup';
import { PlantWateringRemoveDayPopup } from '../../../common/plant-watering-remove-day-popup/plant-watering-remove-day-popup';
import { DashboardSignalsService } from '../../../services/dashboard-signals.service';

const soilMoistureColor = '108, 171, 215';
const textColor = '#2a2a2a';

@Component({
  selector: 'aurelis-plant-details',
  imports: [
    Calendar,
    PlantCurrentParams,
    Select,
    PlantWateringNotePopup,
    PlantWateringRemoveDayPopup,
  ],
  templateUrl: './plant-details.html',
  styleUrl: './plant-details.scss',
})
export class PlantDetails implements AfterViewChecked {
  @Input()
  public plant!: PlantData;

  public chart: any;

  private chartsPrinted = false;

  protected readonly wateringNotePopupOpen = signal(false);
  protected readonly removeWateringDayPopupDay = signal<Date | null>(null);

  private readonly elementRef = inject(ElementRef);
  private readonly dashboardSignalsService = inject(DashboardSignalsService);

  protected readonly dashboardGreenhouseId = this.dashboardSignalsService.getDashboardGreenhouseId();

  protected openWateringNotePopup(): void {
    this.wateringNotePopupOpen.set(true);
  }

  protected closeWateringNotePopup(): void {
    this.wateringNotePopupOpen.set(false);
  }

  protected openRemoveWateringDayPopup(day: Date): void {
    this.removeWateringDayPopupDay.set(day);
  }

  protected closeRemoveWateringDayPopup(): void {
    this.removeWateringDayPopupDay.set(null);
  }

  public ngAfterViewChecked(): void {
    if (this.chartsPrinted) {
      return;
    }

    this.printChart();
  }

  private printChart() {
    const plantCanvasEl = this.elementRef.nativeElement.querySelector(
      `#plant-soil-moisture-${this.plant.id}`,
    );

    const config = {
      type: 'line',
      data: {
        datasets: [
          {
            data: [{ date: '', value: 0 }, ...this.plant.soil_moisture_history],
            pointStyle: false,
            borderColor: `rgb(${soilMoistureColor})`,
            fill: true,
            tension: 0.5,
            backgroundColor: (context: any) => {
              const gradientBg = context.chart.ctx.createLinearGradient(0, 0, 0, 200);

              gradientBg.addColorStop(0, `rgba(${soilMoistureColor}, 0.3)`);
              gradientBg.addColorStop(0.5, `rgba(${soilMoistureColor}, 0.15)`);
              gradientBg.addColorStop(1, `rgba(${soilMoistureColor}, 0)`);

              return gradientBg;
            },
          },
        ],
      },
      options: {
        clip: false,
        responsive: true,
        resizeDelay: 100,
        maintainAspectRatio: false,
        plugins: {
          legend: false,
        },
        parsing: {
          xAxisKey: 'date',
          yAxisKey: 'value',
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: textColor,
              font: {
                size: 12,
                family: `'Manrope', sans-serif`,
              },
            },
          },
          y: {
            grid: {
              display: false,
            },
            ticks: {
              color: textColor,
              font: {
                size: 12,
                family: `'Manrope', sans-serif`,
              },
            },
          },
        },
      },
    } as any;

    this.chart = new Chart(plantCanvasEl, config);

    this.chartsPrinted = true;
  }
}
