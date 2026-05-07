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
    fixture.componentRef.setInput('highlightedDays', [Math.floor(highlightedDate.getTime() / 1_000)]);
    fixture.detectChanges();

    const highlightedCells = fixture.nativeElement.querySelectorAll('.day-cell.highlighted');
    expect(highlightedCells.length).toBe(1);
    expect(highlightedCells[0].textContent.trim()).toBe('15');
  });
});
