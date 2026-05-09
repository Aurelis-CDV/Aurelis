import {
  AfterViewChecked,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
} from '@angular/core';
import { Chart } from 'chart.js/auto';
import { PlantPreview } from './plant-preview/plant-preview';
import { PlantPreviewAddSlot } from './plant-preview-add-slot/plant-preview-add-slot';
import { DashboardSignalsService } from '../../../services/dashboard-signals.service';

const chartColor = '#6cabd7';

@Component({
  selector: 'aurelis-plants-preview-list',
  imports: [PlantPreview, PlantPreviewAddSlot],
  templateUrl: './plants-preview-list.html',
  styleUrl: './plants-preview-list.scss',
})
export class PlantsPreviewList implements AfterViewChecked {
  public plantPreviewChartsByPlantId: { [plantId: string]: Chart } = {};

  private chartsPrinted: boolean = false;

  private previousPlantFingerprint = '';

  private readonly dashboardSignalsService = inject(DashboardSignalsService);
  private readonly destroyRef = inject(DestroyRef);
  public readonly greenhouseData = this.dashboardSignalsService.getDashboardGreenhouseData();

  protected readonly showAddPlantSlot = computed(
    () => (this.greenhouseData()?.plants?.length ?? 0) < 6,
  );

  private resizeObserver?: ResizeObserver;

  constructor(private elementRef: ElementRef) {
    queueMicrotask(() => {
      const el = this.elementRef.nativeElement as HTMLElement;
      const notify = (): void =>
        queueMicrotask(() => {
          Object.values(this.plantPreviewChartsByPlantId).forEach((chart) => chart.resize?.());
        });

      notify();
      this.resizeObserver = new ResizeObserver(notify);
      this.resizeObserver.observe(el);
      this.destroyRef.onDestroy(() => {
        this.resizeObserver?.disconnect();
        this.resizeObserver = undefined;
      });
    });
  }

  public ngAfterViewChecked(): void {
    const plants = this.greenhouseData()?.plants ?? [];
    const fingerprint = plants.map((plant: { id: string }) => plant.id).join('|');

    if (fingerprint !== this.previousPlantFingerprint) {
      if (this.previousPlantFingerprint !== '') {
        for (const chart of Object.values(this.plantPreviewChartsByPlantId)) {
          chart.destroy();
        }
        this.plantPreviewChartsByPlantId = {};
        this.chartsPrinted = false;
      }
      this.previousPlantFingerprint = fingerprint;
    }

    if (this.chartsPrinted) {
      return;
    }

    this.printPreviewLineCharts();
  }

  private printPreviewLineCharts() {
    const { plants } = this.greenhouseData() || {};

    if (!plants?.length) {
      return;
    }

    const minMax = this.getPlantsDataMinMax(plants);
    plants.forEach((plant: any) => this.setPlantPreviewLineChart(plant, minMax));

    this.chartsPrinted = true;
    queueMicrotask(() =>
      Object.values(this.plantPreviewChartsByPlantId).forEach((chart) => chart.resize?.()),
    );
  }

  private setPlantPreviewLineChart(plant: any, minMax: any) {
    if (!plant) {
      return;
    }

    const plantCanvasEl = this.elementRef.nativeElement.querySelector(
      `#plant-preview-chart-${plant.id}`,
    );

    if (!(plantCanvasEl instanceof HTMLCanvasElement)) {
      return;
    }

    const config = {
      type: 'line',
      data: {
        datasets: [
          {
            data: plant.soil_moisture_history,
            pointStyle: false,
            borderColor: chartColor,
            fill: true,
            tension: 0.5,
            backgroundColor: (context: any) => {
              const gradientBg = context.chart.ctx.createLinearGradient(0, 0, 0, 200);

              gradientBg.addColorStop(0, 'rgba(108, 171, 215, 0.3)');
              gradientBg.addColorStop(0.5, 'rgba(108, 171, 215, 0.15)');
              gradientBg.addColorStop(1, 'rgba(108, 171, 215, 0)');

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
            display: false,
          },
          y: {
            display: false,
            min: minMax.min,
            max: minMax.max,
          },
        },
      },
    } as any;

    this.plantPreviewChartsByPlantId[plant.id] = new Chart(plantCanvasEl, config);
    queueMicrotask(() => this.plantPreviewChartsByPlantId[plant.id]?.resize?.());
  }

  private getPlantsDataMinMax(plants: any[]) {
    return {
      min: Math.min(
        ...plants.map((plant: any) =>
          Math.min(...plant.soil_moisture_history.map((history: any) => history.value)),
        ),
      ),
      max: Math.max(
        ...plants.map((plant: any) =>
          Math.max(...plant.soil_moisture_history.map((history: any) => history.value)),
        ),
      ),
    };
  }
}
