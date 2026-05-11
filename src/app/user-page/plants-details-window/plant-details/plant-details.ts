import {
  AfterViewChecked,
  Component,
  ElementRef,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
  signal,
} from '@angular/core';
import { Chart } from 'chart.js/auto';
import { Calendar } from '../../../common/calendar/calendar';
import { Settings } from '../../../common/icons/settings/settings';
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
    Settings,
  ],
  templateUrl: './plant-details.html',
  styleUrl: './plant-details.scss',
})
export class PlantDetails implements AfterViewChecked, OnChanges {
  @Input()
  public plant!: PlantData;

  public chart: Chart | undefined;

  private chartBoundPlantId: string | null = null;
  private lastChartFingerprint = '';

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

  protected openPlantSettings(): void {
    this.dashboardSignalsService.openPlantFormWindow('edit', this.plant.id);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (!changes['plant'] || changes['plant'].firstChange) {
      return;
    }
    this.destroyChart();
  }

  public ngAfterViewChecked(): void {
    this.syncChart();
  }

  private destroyChart(): void {
    this.chart?.destroy();
    this.chart = undefined;
    this.chartBoundPlantId = null;
    this.lastChartFingerprint = '';
  }

  private syncChart(): void {
    if (!this.plant?.id) {
      return;
    }

    const plantCanvasEl = this.elementRef.nativeElement.querySelector(
      `#plant-soil-moisture-${this.plant.id}`,
    );

    if (!(plantCanvasEl instanceof HTMLCanvasElement)) {
      return;
    }

    const history = this.plant.soil_moisture_history ?? [];
    const last = history[history.length - 1];
    const fingerprint = `${this.plant.id}:${history.length}:${last?.value ?? ''}`;

    if (
      this.chart &&
      this.chartBoundPlantId === this.plant.id &&
      fingerprint === this.lastChartFingerprint
    ) {
      return;
    }

    this.destroyChart();

    try {
      const config = {
        type: 'line',
        data: {
          datasets: [
            {
              data: [{ date: '', value: 0 }, ...history],
              pointStyle: false,
              borderColor: `rgb(${soilMoistureColor})`,
              fill: true,
              tension: 0.5,
              backgroundColor: (context: any) => {
                const chart = context.chart;
                const h =
                  typeof chart.height === 'number' && chart.height > 1 ? chart.height : 220;
                const gradientBg = context.chart.ctx.createLinearGradient(0, 0, 0, h);

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
          layout: {
            autoPadding: true,
            padding: { left: 2, right: 4, top: 6, bottom: 36 },
          },
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
              border: {
                display: false,
              },
              ticks: {
                color: textColor,
                maxRotation: 0,
                padding: 8,
                autoSkip: true,
                font: {
                  size: 11,
                  family: `'Manrope', sans-serif`,
                },
              },
            },
            y: {
              grid: {
                display: false,
              },
              border: {
                display: false,
              },
              ticks: {
                color: textColor,
                padding: 2,
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
      this.chartBoundPlantId = this.plant.id;
      this.lastChartFingerprint = fingerprint;

      queueMicrotask(() => {
        this.chart?.resize();
        requestAnimationFrame(() => {
          this.chart?.resize();
          window.setTimeout(() => this.chart?.resize(), 140);
        });
      });
    } catch {
      this.destroyChart();
    }
  }
}
