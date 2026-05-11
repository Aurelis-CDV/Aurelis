import { Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlantData } from '../../../interfaces/plant-data.interface';
import { GreenhousesDataService } from '../../services/data.service';

const CALENDAR_MONTHS_EN: readonly { readonly label: string; readonly value: number }[] = [
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
  { label: 'March', value: 3 },
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12 },
] as const;

@Component({
  selector: 'aurelis-plant-watering-note-popup',
  imports: [FormsModule],
  templateUrl: './plant-watering-note-popup.html',
  styleUrl: './plant-watering-note-popup.scss',
})
export class PlantWateringNotePopup {
  public readonly plant = input.required<PlantData>();
  public readonly greenhouseId = input.required<string>();

  public readonly closed = output<void>();

  private readonly greenhousesDataService = inject(GreenhousesDataService);

  protected readonly nowSelected = signal(false);
  protected readonly daySelectedMode = signal(false);
  protected readonly pickedDay = signal('');

  protected readonly pickYear = signal(new Date().getFullYear());
  protected readonly pickMonth = signal(new Date().getMonth() + 1);
  protected readonly pickDay = signal(new Date().getDate());

  protected toggleNow(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.nowSelected.set(checked);
    if (checked) {
      this.daySelectedMode.set(false);
      this.pickedDay.set('');
    }
  }

  protected togglePickDay(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.daySelectedMode.set(checked);
    if (checked) {
      this.nowSelected.set(false);
      const n = new Date();
      this.pickYear.set(n.getFullYear());
      this.pickMonth.set(n.getMonth() + 1);
      this.pickDay.set(n.getDate());
      this.clampPickDayAndSync();
      return;
    }
    this.pickedDay.set('');
  }

  protected onNgModelPickYear(value: unknown): void {
    this.pickYear.set(Number(value));
    this.clampPickDayAndSync();
  }

  protected onNgModelPickMonth(value: unknown): void {
    this.pickMonth.set(Number(value));
    this.clampPickDayAndSync();
  }

  protected onNgModelPickDay(value: unknown): void {
    this.pickDay.set(Number(value));
    this.clampPickDayAndSync();
  }

  protected yearRange(): number[] {
    const cy = this.todayYmd().y;
    const out: number[] = [];
    for (let y = cy - 10; y <= cy; y += 1) {
      out.push(y);
    }
    return out;
  }

  protected selectableMonths(): readonly { readonly label: string; readonly value: number }[] {
    const y = this.pickYear();
    const t = this.todayYmd();
    if (y < t.y) {
      return CALENDAR_MONTHS_EN;
    }
    return CALENDAR_MONTHS_EN.filter((x) => x.value <= t.m);
  }

  protected pickDayRange(): number[] {
    const y = this.pickYear();
    const m = this.pickMonth();
    const max = this.maxSelectableDay(y, m);
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  private todayYmd(): { y: number; m: number; d: number } {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate() };
  }

  private todayIsoLocal(): string {
    const t = this.todayYmd();
    return `${t.y}-${String(t.m).padStart(2, '0')}-${String(t.d).padStart(2, '0')}`;
  }

  private maxSelectableDay(year: number, month: number): number {
    const dom = this.daysInMonth(year, month);
    const t = this.todayYmd();
    if (year === t.y && month === t.m) {
      return Math.min(dom, t.d);
    }
    return dom;
  }

  private daysInMonth(year: number, month1to12: number): number {
    return new Date(year, month1to12, 0).getDate();
  }

  private clampPickDayAndSync(): void {
    const maxDom = this.daysInMonth(this.pickYear(), this.pickMonth());
    if (this.pickDay() > maxDom) {
      this.pickDay.set(maxDom);
    }
    this.enforceNotFutureParts();
    this.syncPickedDayFromParts();
  }

  private enforceNotFutureParts(): void {
    const t = this.todayYmd();
    let y = this.pickYear();
    let m = this.pickMonth();
    let d = this.pickDay();

    if (y > t.y) {
      y = t.y;
      m = t.m;
      d = t.d;
    } else if (y === t.y && m > t.m) {
      m = t.m;
    }

    const capDay = Math.min(this.maxSelectableDay(y, m), this.daysInMonth(y, m));
    d = Math.min(d, capDay);

    this.pickYear.set(y);
    this.pickMonth.set(m);
    this.pickDay.set(Math.max(1, d));
  }

  private syncPickedDayFromParts(): void {
    const y = this.pickYear();
    const m = this.pickMonth();
    let d = this.pickDay();
    const max = this.daysInMonth(y, m);
    if (d > max) {
      d = max;
      this.pickDay.set(d);
    }

    const mm = String(m).padStart(2, '0');
    const dd = String(d).padStart(2, '0');

    this.pickedDay.set(`${y}-${mm}-${dd}`);
  }

  protected onBackdropMouseDown(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }

  protected cancel(): void {
    this.closed.emit();
  }

  protected accept(): void {
    const unix = this.resolveUnixSeconds();
    if (unix === null) {
      return;
    }

    this.greenhousesDataService.appendPlantWatering(this.greenhouseId(), this.plant().id, unix);
    this.closed.emit();
  }

  protected canAccept(): boolean {
    return this.resolveUnixSeconds() !== null;
  }

  private resolveUnixSeconds(): number | null {
    if (this.nowSelected()) {
      return Math.floor(Date.now() / 1000);
    }
    if (this.daySelectedMode()) {
      const raw = this.pickedDay();
      if (!raw) {
        return null;
      }
      if (raw > this.todayIsoLocal()) {
        return null;
      }
      const unix = this.dateStringToUnixStartOfLocalDay(raw);
      return Number.isFinite(unix) ? unix : null;
    }
    return null;
  }

  private dateStringToUnixStartOfLocalDay(yyyymmdd: string): number {
    const [y, m, d] = yyyymmdd.split('-').map((part) => Number(part));
    if (!y || !m || !d) {
      return NaN;
    }
    return Math.floor(new Date(y, m - 1, d).getTime() / 1000);
  }
}
