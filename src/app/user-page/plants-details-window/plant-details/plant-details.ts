import { AfterViewChecked, Component, ElementRef, Input } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { Calendar } from '../../../common/calendar/calendar';
import { PlantData } from '../../../../interfaces/plant-data.interface';
import { PlantCurrentParams } from '../../../common/plant-current-params/plant-current-params';

const soilMoistureColor = '108, 171, 215';
const textColor = '#2a2a2a';

@Component({
  selector: 'aurelis-plant-details',
  imports: [Calendar, PlantCurrentParams],
  templateUrl: './plant-details.html',
  styleUrl: './plant-details.scss',
})
export class PlantDetails implements AfterViewChecked {
  @Input()
  public plant!: PlantData;

  public chart: any;

  private chartsPrinted = false;

  constructor(private elementRef: ElementRef) {}

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
