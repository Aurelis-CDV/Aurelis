import { AfterViewChecked, Component, ElementRef, Input } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { Calendar } from '../../../common/calendar/calendar';
import { ChartDropdown, ChartDropdownOption } from '../../../common/chart-dropdown/chart-dropdown';
import { PlantData } from '../../../../interfaces/plant-data.interface';

const soilMoistureColor = '108, 171, 215';
const textColor = '#2a2a2a';
const chartFilterRanges = {
  '1h': 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
} as const;

type ChartFilterRange = keyof typeof chartFilterRanges;
type SoilMoistureHistoryPoint = {
  date: string;
  value: number;
};

function isChartFilterRange(value: string): value is ChartFilterRange {
  return value in chartFilterRanges;
}

@Component({
  selector: 'aurelis-plant-details',
  imports: [Calendar, ChartDropdown],
  templateUrl: './plant-details.html',
  styleUrl: './plant-details.scss',
})
export class PlantDetails implements AfterViewChecked {
  @Input()
  public plant!: PlantData;

  public chart: any;
  public selectedFilterRange: ChartFilterRange = '1h';
  public readonly filterOptions: ChartDropdownOption[] = [
    { label: 'Last 1 hour', value: '1h' },
    { label: 'Last 24 hours', value: '24h' },
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 1 month', value: '30d' },
  ];

  private chartsPrinted = false;

  constructor(private elementRef: ElementRef) {}

  public ngAfterViewChecked(): void {
    if (this.chartsPrinted) {
      return;
    }

    this.printChart();
  }

  public onFilterChange(nextFilterRange: string): void {
    if (!isChartFilterRange(nextFilterRange) || this.selectedFilterRange === nextFilterRange) {
      return;
    }

    this.selectedFilterRange = nextFilterRange;
    this.updateChartData();
  }

  private printChart() {
    const plantCanvasEl = this.elementRef.nativeElement.querySelector<HTMLCanvasElement>(
      `#plant-soil-moisture-${this.plant.id}`,
    );
    if (!plantCanvasEl) {
      return;
    }

    const config = {
      type: 'line',
      data: {
        datasets: [
          {
            data: [{ date: '', value: 0 }, ...this.getFilteredHistory()],
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

  private updateChartData() {
    if (!this.chart?.data?.datasets?.length) {
      return;
    }

    this.chart.data.datasets[0].data = [{ date: '', value: 0 }, ...this.getFilteredHistory()];
    this.chart.update();
  }

  private getFilteredHistory(): SoilMoistureHistoryPoint[] {
    const history = this.plant.soil_moisture_history as SoilMoistureHistoryPoint[];
    if (!history.length) {
      return [];
    }

    const latestDate = this.parseDate(history[history.length - 1].date);
    if (!latestDate) {
      return history;
    }

    const rangeInMs = chartFilterRanges[this.selectedFilterRange];
    const timestampThreshold = latestDate.getTime() - rangeInMs;
    const filtered = history.filter((entry) => {
      const historyDate = this.parseDate(entry.date);
      return historyDate ? historyDate.getTime() >= timestampThreshold : true;
    });

    return filtered.length ? filtered : [history[history.length - 1]];
  }

  private parseDate(dateValue: string): Date | null {
    const [day, month, year] = dateValue.split('.').map(Number);
    if (!day || !month || !year) {
      return null;
    }

    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
  }
}
