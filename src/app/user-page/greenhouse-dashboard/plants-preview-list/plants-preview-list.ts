import { AfterViewChecked, Component, ElementRef } from '@angular/core';
import ExampleJson from '../../../../example-json';
import { WaterDrop } from '../../../common/icons/water-drop/water-drop';
import { PlantGeneralCondition } from '../../../common/icons/plant-general-condition/plant-general-condition';
import { Chart } from 'chart.js/auto';

const chartColor = '#6cabd7';

@Component({
  selector: 'aurelis-plants-preview-list',
  imports: [WaterDrop, PlantGeneralCondition],
  templateUrl: './plants-preview-list.html',
  styleUrl: './plants-preview-list.scss',
})
export class PlantsPreviewList implements AfterViewChecked {
  protected readonly plants = ExampleJson.greenhouses[0].plants as any;

  public plantPreviewChartsByPlantId: { [plantId: string]: Chart } = {};
  private chartsPrinted = false;

  constructor(private elementRef: ElementRef) {}

  public ngAfterViewChecked(): void {
    if (this.chartsPrinted) {
      return;
    }

    this.printPreviewLineCharts();
  }

  public getPlantConditionDescription(condition: string): string {
    if (condition === 'good') {
      return 'All good!';
    }

    if (condition === 'bad') {
      return "It's bad!";
    }

    if (condition === 'mid') {
      return 'Ok, but not perfect...';
    }

    return 'Some unknown condition...';
  }

  private printPreviewLineCharts() {
    const minMax = this.getPlantsDataMinMax(this.plants);
    this.plants.forEach((plant: any) => this.setPlantPreviewLineChart(plant, minMax));

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
        responsive: true,
        resizeDelay: 100,
        maintainAspectRatio: false,
        plugins: {
          legend: false,
        },
        parsing: {
          xAxisKey: 'date',
          yAxisKey: 'soil_moisture',
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
          Math.min(...plant.soil_moisture_history.map((history: any) => history.soil_moisture)),
        ),
      ),
      max: Math.max(
        ...plants.map((plant: any) =>
          Math.max(...plant.soil_moisture_history.map((history: any) => history.soil_moisture)),
        ),
      ),
    };
  }
}
