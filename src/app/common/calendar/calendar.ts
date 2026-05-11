import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, output, SimpleChanges } from '@angular/core';

type CalendarDay = {
  dayNumber: number;
  date: Date;
  inCurrentMonth: boolean;
  isHighlighted: boolean;
  isToday: boolean;
};

@Component({
  selector: 'aurelis-calendar',
  imports: [CommonModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class Calendar implements OnChanges {
  @Input() public highlightedDays: number[] = [];

  public readonly wateringHighlightedDaySelected = output<Date>();

  protected readonly weekdays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  protected visibleMonth: Date = this.getFirstDayOfMonth(new Date());
  protected calendarDays: CalendarDay[] = [];

  constructor() {
    this.buildCalendar();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['highlightedDays']) {
      this.buildCalendar();
    }
  }

  public previousMonth(): void {
    this.visibleMonth = this.getFirstDayOfMonth(
      new Date(this.visibleMonth.getFullYear(), this.visibleMonth.getMonth() - 1, 1),
    );
    this.buildCalendar();
  }

  public nextMonth(): void {
    this.visibleMonth = this.getFirstDayOfMonth(
      new Date(this.visibleMonth.getFullYear(), this.visibleMonth.getMonth() + 1, 1),
    );
    this.buildCalendar();
  }

  protected get monthLabel(): string {
    return this.visibleMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  protected onDayCellClick(day: CalendarDay): void {
    if (!day.isHighlighted) {
      return;
    }

    this.wateringHighlightedDaySelected.emit(
      new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate()),
    );
  }

  private buildCalendar(): void {
    const year = this.visibleMonth.getFullYear();
    const month = this.visibleMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const firstWeekday = firstDayOfMonth.getDay();
    const currentMonthDays = this.getDaysInMonth(year, month);
    const previousMonthDays = this.getDaysInMonth(year, month - 1);
    const highlightedDateKeys = new Set(
      this.highlightedDays.map((timestamp) => this.getDateKey(timestamp)),
    );
    const todayKey = this.getDateKey(Date.now());

    const days: CalendarDay[] = [];

    for (let day = previousMonthDays - firstWeekday + 1; day <= previousMonthDays; day++) {
      const date = new Date(year, month - 1, day);
      const dateKey = this.toDateKey(date);
      days.push({
        dayNumber: day,
        date,
        inCurrentMonth: false,
        isHighlighted: highlightedDateKeys.has(dateKey),
        isToday: todayKey === dateKey,
      });
    }

    for (let day = 1; day <= currentMonthDays; day++) {
      const date = new Date(year, month, day);
      const dateKey = this.toDateKey(date);
      days.push({
        dayNumber: day,
        date,
        inCurrentMonth: true,
        isHighlighted: highlightedDateKeys.has(dateKey),
        isToday: todayKey === dateKey,
      });
    }

    const trailingDays = (7 - (days.length % 7)) % 7;
    for (let day = 1; day <= trailingDays; day++) {
      const date = new Date(year, month + 1, day);
      const dateKey = this.toDateKey(date);
      days.push({
        dayNumber: day,
        date,
        inCurrentMonth: false,
        isHighlighted: highlightedDateKeys.has(dateKey),
        isToday: todayKey === dateKey,
      });
    }

    this.calendarDays = days;
  }

  private getFirstDayOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  private getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  private getDateKey(unixTimestamp: number): string {
    const timestampInMilliseconds =
      Math.abs(unixTimestamp) < 1_000_000_000_000 ? unixTimestamp * 1_000 : unixTimestamp;
    return this.toDateKey(new Date(timestampInMilliseconds));
  }

  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
