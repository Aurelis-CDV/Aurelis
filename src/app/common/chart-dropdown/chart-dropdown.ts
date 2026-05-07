import { Component, EventEmitter, Input, Output } from '@angular/core';

export type ChartDropdownOption = {
  label: string;
  value: string;
};

@Component({
  selector: 'aurelis-chart-dropdown',
  templateUrl: './chart-dropdown.html',
  styleUrl: './chart-dropdown.scss',
})
export class ChartDropdown {
  private static nextId = 0;

  @Input() public options: ChartDropdownOption[] = [];
  @Input() public selectedValue = '';
  @Input() public ariaLabel = 'Chart filter';
  @Output() public selectedValueChange = new EventEmitter<string>();

  protected readonly selectId = `chart-dropdown-${ChartDropdown.nextId++}`;

  public onSelectionChange(event: Event): void {
    const nextValue = (event.target as HTMLSelectElement | null)?.value ?? '';
    this.selectedValueChange.emit(nextValue);
  }
}
