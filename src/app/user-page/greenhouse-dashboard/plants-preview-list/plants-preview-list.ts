import { AfterViewChecked, Component, ElementRef, inject } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { PlantPreview } from './plant-preview/plant-preview';
import { DashboardSignalsService } from '../../../services/dashboard-signals.service';

const chartColor = '#6cabd7';

@Component({
  selector: 'aurelis-plants-preview-list',
  imports: [PlantPreview],
  templateUrl: './plants-preview-list.html',
  styleUrl: './plants-preview-list.scss',
})
export class PlantsPreviewList implements AfterViewChecked {
  public plantPreviewChartsByPlantId: { [plantId: string]: Chart } = {};

  private chartsPrinted: boolean = false;

  private readonly dashboardSignalsService = inject(DashboardSignalsService);
  public readonly greenhouseData = this.dashboardSignalsService.getDashboardGreenhouseData();

  constructor(private elementRef: ElementRef) {}

  public ngAfterViewChecked(): void {
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
  }

  private setPlantPreviewLineChart(plant: any, minMax: any) {
    if (!plant) {
      return;
    }

    const plantCanvasEl = this.elementRef.nativeElement.querySelector(
      `#plant-preview-chart-${plant.id}`,
    );

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
