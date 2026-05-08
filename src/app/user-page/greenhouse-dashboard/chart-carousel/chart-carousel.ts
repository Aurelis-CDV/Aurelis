import { AfterViewChecked, Component, effect, ElementRef, inject } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { Carousel } from '../../../common/carousel/carousel';
import { DashboardSignalsService } from '../../../services/dashboard-signals.service';
import { GreenhouseParam } from '../../../../interfaces/greenhouses-data.interface';

const humidityColor = '108, 171, 215';
const temperatureColor = '93, 93, 93';
const lightColor = '255, 199, 37';
const textColor = '#2a2a2a';

@Component({
  selector: 'aurelis-chart-carousel',
  imports: [Carousel],
  templateUrl: './chart-carousel.html',
  styleUrl: './chart-carousel.scss',
})
export class ChartCarousel implements AfterViewChecked {
  private readonly dashboardSignalsService = inject(DashboardSignalsService);

  public readonly greenhouseData = this.dashboardSignalsService.getDashboardGreenhouseData();

  public paramCharts: { [key: string]: Chart } = {};

  private chartsPrinted = false;

  constructor(private elementRef: ElementRef) {
    effect(() => {
      this.printPreviewLineCharts();
    });
  }

  public ngAfterViewChecked(): void {
    if (this.chartsPrinted) {
      return;
    }

    this.printPreviewLineCharts();
  }

  public getParamName(paramName: string): string {
    return paramName.charAt(0).toUpperCase() + paramName.slice(1);
  }

  private printPreviewLineCharts() {
    if (this.chartsPrinted) {
      this.destroyParamCharts();
    }

    this.greenhouseData()?.params.forEach((param: any) => this.setParamLineChart(param));

    this.chartsPrinted = true;
  }

  private setParamLineChart(param: GreenhouseParam) {
    const plantCanvasEl = this.elementRef.nativeElement.querySelector(`#param-chart-${param.name}`);

    if (!param || !plantCanvasEl) {
      return;
    }

    const paramColor =
      param.name === 'humidity'
        ? humidityColor
        : param.name === 'temperature'
          ? temperatureColor
          : lightColor;

    const config = {
      type: 'line',
      data: {
        datasets: [
          {
            data: [{ date: '', value: 0 }, ...param.history],
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
}
