import { AfterViewChecked, Component, ElementRef } from '@angular/core';
import exampleJson from '../../../../example-json';
import { Chart } from 'chart.js/auto';
import { Carousel } from '../../../common/carousel/carousel';

const humidityColor = '108, 171, 215';
const temperatureColor = '93, 93, 93';
const lightColor = '217, 186, 131';
const textColor = '#2a2a2a';

@Component({
  selector: 'aurelis-chart-carousel',
  imports: [Carousel],
  templateUrl: './chart-carousel.html',
  styleUrl: './chart-carousel.scss',
})
export class ChartCarousel implements AfterViewChecked {
  public greenhouseParams = exampleJson.greenhouses[0].params;
  public paramCharts: any = {};

  private chartsPrinted = false;

  constructor(private elementRef: ElementRef) {}

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
    this.greenhouseParams.forEach((param: any) => this.setParamLineChart(param));

    this.chartsPrinted = true;
  }

  private setParamLineChart(param: any) {
    if (!param) {
      return;
    }

    const plantCanvasEl = this.elementRef.nativeElement.querySelector(`#param-chart-${param.name}`);
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
}
