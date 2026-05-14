import {
  AfterViewChecked,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { skip } from 'rxjs/operators';
import { Calendar } from '../../../common/calendar/calendar';
import { Settings } from '../../../common/icons/settings/settings';
import { PlantData } from '../../../../interfaces/plant-data.interface';
import { PlantCurrentParams } from '../../../common/plant-current-params/plant-current-params';
import { CustomSelectOption, Select } from '../../../common/select/select';
import { PlantWateringNotePopup } from '../../../common/plant-watering-note-popup/plant-watering-note-popup';
import { PlantWateringRemoveDayPopup } from '../../../common/plant-watering-remove-day-popup/plant-watering-remove-day-popup';
import { DashboardSignalsService } from '../../../services/dashboard-signals.service';
import { GreenhouseMeasurementsService } from '../../../services/greenhouse-measurements.service';

const soilMoistureColor = '108, 171, 215';
const textColor = '#2a2a2a';

export type ChartRangePreset = 'last-1-hour' | 'last-24-hours' | 'last-7-days' | 'last-1-month';

const RANGE_SPAN_SEC: Record<ChartRangePreset, number> = {
  'last-1-hour': 3600,
  'last-24-hours': 86400,
  'last-7-days': 7 * 86400,
  'last-1-month': 30 * 86400,
};

function isChartRangePreset(v: string): v is ChartRangePreset {
  return (
    v === 'last-1-hour' ||
    v === 'last-24-hours' ||
    v === 'last-7-days' ||
    v === 'last-1-month'
  );
}

/** `from` / `to` as Unix **seconds** for the measurements API. */
function unixRangeForPreset(preset: ChartRangePreset): { from: number; to: number } {
  const to = Math.floor(Date.now() / 1000);
  const span = RANGE_SPAN_SEC[preset] ?? RANGE_SPAN_SEC['last-7-days'];
  return { from: to - span, to };
}

@Component({
  selector: 'aurelis-plant-details',
  imports: [
    Calendar,
    FormsModule,
    PlantCurrentParams,
    Select,
    PlantWateringNotePopup,
    PlantWateringRemoveDayPopup,
    Settings,
  ],
  templateUrl: './plant-details.html',
  styleUrl: './plant-details.scss',
})
export class PlantDetails implements AfterViewChecked, OnChanges, OnInit {
  @Input()
  public plant!: PlantData;

  public chart: Chart | undefined;

  private chartBoundPlantId: string | null = null;
  private lastChartFingerprint = '';
  private chartRequestSeq = 0;

  protected readonly chartRangeOptions: CustomSelectOption[] = [
    { label: 'Last 1 hour', value: 'last-1-hour' },
    { label: 'Last 24 hours', value: 'last-24-hours' },
    { label: 'Last 7 days', value: 'last-7-days' },
    { label: 'Last 1 month', value: 'last-1-month' },
  ];

  protected readonly chartRangeKey = signal<ChartRangePreset>('last-7-days');
  protected readonly chartSoilPoints = signal<{ date: string; value: number }[]>([]);
  protected readonly chartLoadError = signal<string | null>(null);

  protected readonly wateringNotePopupOpen = signal(false);
  protected readonly removeWateringDayPopupDay = signal<Date | null>(null);

  private readonly elementRef = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dashboardSignalsService = inject(DashboardSignalsService);
  private readonly measurements = inject(GreenhouseMeasurementsService);

  protected readonly dashboardGreenhouseId = this.dashboardSignalsService.getDashboardGreenhouseId();

  private readonly dashboardGreenhouse = this.dashboardSignalsService.getDashboardGreenhouseData();

  protected readonly greenhouseClimate = computed(() => {
    const gh = this.dashboardGreenhouse();
    const t = gh?.params.find((p) => p.name === 'temperature')?.current;
    const h = gh?.params.find((p) => p.name === 'humidity')?.current;
    return {
      temperatureC: typeof t === 'number' && Number.isFinite(t) ? t : undefined,
      airHumidityPercent: typeof h === 'number' && Number.isFinite(h) ? h : undefined,
    };
  });

  private readonly dashboardGreenhouseId$ = toObservable(this.dashboardGreenhouseId);

  public ngOnInit(): void {
    this.dashboardGreenhouseId$
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadChartFromApi());
  }

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

  protected onChartRangeKeyChange(value: string | number | null): void {
    if (value === null || value === undefined) {
      return;
    }
    const key = String(value);
    if (!isChartRangePreset(key)) {
      return;
    }
    this.chartRangeKey.set(key);
    this.loadChartFromApi();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (!changes['plant']) {
      return;
    }
    this.destroyChart();
    this.loadChartFromApi();
  }

  public ngAfterViewChecked(): void {
    this.syncChart();
  }

  private loadChartFromApi(): void {
    const gh = this.dashboardGreenhouseId();
    const plant = this.plant;
    if (!gh || !plant?.id) {
      this.chartSoilPoints.set([]);
      this.chartLoadError.set(null);
      return;
    }

    const seq = ++this.chartRequestSeq;
    const preset = this.chartRangeKey();
    const { from, to } = unixRangeForPreset(preset);
    this.chartLoadError.set(null);

    this.measurements
      .fetchPlantSoilMoistureSeries(gh, plant.id, from, to)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pts) => {
          if (seq !== this.chartRequestSeq) {
            return;
          }
          this.chartLoadError.set(null);
          this.chartSoilPoints.set(pts);
        },
        error: () => {
          if (seq !== this.chartRequestSeq) {
            return;
          }
          this.chartSoilPoints.set([]);
          this.chartLoadError.set('Could not load chart data.');
        },
      });
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

    const history = this.chartSoilPoints();
    const last = history[history.length - 1];
    const fingerprint = `${this.plant.id}:${this.chartRangeKey()}:${history.length}:${last?.value ?? ''}`;

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
