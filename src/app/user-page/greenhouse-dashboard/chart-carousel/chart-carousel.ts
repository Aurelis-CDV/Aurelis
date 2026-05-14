import {
  AfterViewChecked,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
} from '@angular/core';
import { Chart } from 'chart.js/auto';
import { Carousel } from '../../../common/carousel/carousel';
import { DashboardSignalsService } from '../../../services/dashboard-signals.service';
import { GreenhouseParam } from '../../../../interfaces/greenhouses-data.interface';

const humidityColor = '108, 171, 215';
const temperatureColor = '93, 93, 93';
const textColor = '#2a2a2a';

const GREENHOUSE_CAROUSEL_PARAM_ORDER: ReadonlyArray<'temperature' | 'humidity'> = [
  'temperature',
  'humidity',
];

@Component({
  selector: 'aurelis-chart-carousel',
  imports: [Carousel],
  templateUrl: './chart-carousel.html',
  styleUrl: './chart-carousel.scss',
})
export class ChartCarousel implements AfterViewChecked {
  private readonly dashboardSignalsService = inject(DashboardSignalsService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly greenhouseData = this.dashboardSignalsService.getDashboardGreenhouseData();

  protected readonly chartParams = computed(() => {
    const params = this.greenhouseData()?.params ?? [];
    return GREENHOUSE_CAROUSEL_PARAM_ORDER.map((name) =>
      params.find((p) => p.name === name),
    ).filter((p): p is GreenhouseParam => p != null);
  });

  public paramCharts: { [key: string]: Chart } = {};

  private chartSyncFingerprint = '';

  private resizeObserver?: ResizeObserver;

  constructor(private elementRef: ElementRef) {
    queueMicrotask(() => this.observeHostResize());
  }

  public ngAfterViewChecked(): void {
    this.syncParamChartsWithDomAndData();
  }

  public getParamName(paramName: string): string {
    return paramName.charAt(0).toUpperCase() + paramName.slice(1);
  }

  private syncParamChartsWithDomAndData(): void {
    const params = this.chartParams();

    if (params.length === 0) {
      if (Object.keys(this.paramCharts).length > 0) {
        this.destroyParamCharts();
      }
      this.chartSyncFingerprint = '';
      return;
    }

    const root = this.elementRef.nativeElement as HTMLElement;
    if (!params.every((p) => root.querySelector(`#param-chart-${p.name}`))) {
      return;
    }

    const ghId = this.dashboardSignalsService.getDashboardGreenhouseId()();
    const fingerprint = `${ghId}:${params.map((p) => `${p.name}:${(p.history ?? []).length}:${this.historyTail(p.history)}`).join('|')}`;

    if (
      fingerprint === this.chartSyncFingerprint &&
      Object.keys(this.paramCharts).length === params.length &&
      params.every((p) => this.paramCharts[p.name])
    ) {
      return;
    }

    this.destroyParamCharts();
    params.forEach((param) => this.setParamLineChart(param));

    if (Object.keys(this.paramCharts).length === params.length) {
      this.chartSyncFingerprint = fingerprint;
      queueMicrotask(() => Object.values(this.paramCharts).forEach((c) => c.resize?.()));
    }
  }

  private historyTail(history: GreenhouseParam['history'] | undefined): string {
    const h = history ?? [];
    const last = h[h.length - 1] as { value?: number } | undefined;
    return last ? String(last.value ?? '') : '';
  }

  private setParamLineChart(param: GreenhouseParam) {
    const plantCanvasEl = this.elementRef.nativeElement.querySelector(`#param-chart-${param.name}`);

    if (!param || !(plantCanvasEl instanceof HTMLCanvasElement)) {
      return;
    }

    const history = param.history ?? [];

    const paramColor = param.name === 'humidity' ? humidityColor : temperatureColor;

    const config = {
      type: 'line',
      data: {
        datasets: [
          {
            data: [{ date: '', value: 0 }, ...history],
            pointStyle: false,
            borderColor: `rgb(${paramColor})`,
            fill: true,
            tension: 0.5,
            backgroundColor: (context: any) => {
              const gradientBg = context.chart.ctx.createLinearGradient(0, 0, 0, 200);

              gradientBg.addColorStop(0, `rgba(${paramColor}, 0.3)`);
              gradientBg.addColorStop(0.5, `rgba(${paramColor}, 0.15)`);
              gradientBg.addColorStop(1, `rgba(${paramColor}, 0)`);

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

    this.paramCharts[param.name] = new Chart(plantCanvasEl, config);
  }

  private destroyParamCharts(): void {
    Object.values(this.paramCharts).forEach((paramChart) => {
      paramChart.destroy();
    });

    this.paramCharts = {};
  }

  private observeHostResize(): void {
    const el = this.elementRef.nativeElement as HTMLElement;

    const notify = (): void =>
      queueMicrotask(() => {
        Object.values(this.paramCharts).forEach((c) => c.resize?.());
      });

    notify();
    this.resizeObserver = new ResizeObserver(notify);
    this.resizeObserver.observe(el);
    this.destroyRef.onDestroy(() => {
      this.resizeObserver?.disconnect();
      this.resizeObserver = undefined;
    });
  }
}
