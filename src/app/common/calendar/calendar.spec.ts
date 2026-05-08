import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Calendar } from './calendar';

describe('Calendar', () => {
  let component: Calendar;
  let fixture: ComponentFixture<Calendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Calendar],
    }).compileComponents();

    fixture = TestBed.createComponent(Calendar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should highlight day passed as unix timestamp in seconds', () => {
    const highlightedDate = new Date(new Date().getFullYear(), new Date().getMonth(), 15);
    fixture.componentRef.setInput('highlightedDays', [
      Math.floor(highlightedDate.getTime() / 1_000),
    ]);
    fixture.detectChanges();

    const highlightedCells = fixture.nativeElement.querySelectorAll('.day-cell.highlighted');
    expect(highlightedCells.length).toBe(1);
    expect(highlightedCells[0].textContent.trim()).toBe('15');
  });

  it('should emit when a watered (highlighted) day cell is clicked', () => {
    const emitted: Date[] = [];
    fixture.componentInstance.wateringHighlightedDaySelected.subscribe((d) => emitted.push(d));

    const highlightedDate = new Date(2026, 4, 8);
    fixture.componentRef.setInput('highlightedDays', [Math.floor(highlightedDate.getTime() / 1_000)]);
    fixture.detectChanges();

    const cell = fixture.nativeElement.querySelector('.day-cell.highlighted') as HTMLElement;
    expect(cell).toBeTruthy();
    cell.click();

    expect(emitted.length).toBe(1);
    expect(emitted[0].getFullYear()).toBe(2026);
    expect(emitted[0].getMonth()).toBe(4);
    expect(emitted[0].getDate()).toBe(8);
  });

  it('should not emit when a non-highlighted day cell is clicked', () => {
    const emitted: Date[] = [];
    fixture.componentInstance.wateringHighlightedDaySelected.subscribe((d) => emitted.push(d));

    fixture.componentRef.setInput('highlightedDays', []);
    fixture.detectChanges();

    const cells = fixture.nativeElement.querySelectorAll(
      '.day-cell:not(.highlighted)',
    ) as NodeListOf<HTMLElement>;

    cells[cells.length > 15 ? 15 : 0].click();
    fixture.detectChanges();

    expect(emitted.length).toBe(0);
  });
});
