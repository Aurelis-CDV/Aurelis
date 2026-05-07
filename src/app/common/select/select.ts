import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'aurelis-select',
  templateUrl: './select.html',
  styleUrl: './select.scss',
})
export class Select {
  @Input()
  public options: SelectOption[] = [];

  @Input()
  public selectedValue = '';

  @Input()
  public id?: string;

  @Input()
  public disabled = false;

  @Output()
  public readonly selectedValueChange = new EventEmitter<string>();

  public onValueChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement | null;

    if (!selectElement) {
      return;
    }

    this.selectedValue = selectElement.value;
    this.selectedValueChange.emit(selectElement.value);
  }
}
