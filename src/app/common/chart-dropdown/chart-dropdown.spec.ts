import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChartDropdown } from './chart-dropdown';

describe('ChartDropdown', () => {
  let component: ChartDropdown;
  let fixture: ComponentFixture<ChartDropdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartDropdown],
    }).compileComponents();

    fixture = TestBed.createComponent(ChartDropdown);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit selected value change', () => {
    fixture.componentRef.setInput('options', [
      { label: 'Last 1 hour', value: '1h' },
      { label: 'Last 24 hours', value: '24h' },
    ]);
    fixture.componentRef.setInput('selectedValue', '1h');
    fixture.detectChanges();

    const selectedValues: string[] = [];
    component.selectedValueChange.subscribe((selectedValue) => {
      selectedValues.push(selectedValue);
    });

    const dropdownElement = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    dropdownElement.value = '24h';
    dropdownElement.dispatchEvent(new Event('change'));

    expect(selectedValues).toEqual(['24h']);
  });
});
