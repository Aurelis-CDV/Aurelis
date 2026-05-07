import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface CustomSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'aurelis-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select.html',
  styleUrls: ['./select.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Select),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Select implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = 'Select an option';
  @Input() options: CustomSelectOption[] = [];
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<string | number | null>();

  isOpen = false;
  activeIndex = -1;
  value: string | number | null = null;

  private onChange: (value: string | number | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor(private readonly hostRef: ElementRef<HTMLElement>) {}

  get selectedOption(): CustomSelectOption | undefined {
    return this.options.find((option) => option.value === this.value);
  }

  get displayText(): string {
    return this.selectedOption?.label ?? this.placeholder;
  }

  toggle(): void {
    if (this.disabled) {
      return;
    }

    this.isOpen ? this.close() : this.open();
  }

  open(): void {
    if (this.disabled) {
      return;
    }

    this.isOpen = true;
    this.activeIndex = this.selectedIndex >= 0 ? this.selectedIndex : this.firstEnabledIndex;
  }

  close(markAsTouched = true): void {
    if (!this.isOpen) {
      return;
    }

    this.isOpen = false;
    this.activeIndex = -1;
    if (markAsTouched) {
      this.onTouched();
    }
  }

  selectOption(option: CustomSelectOption): void {
    if (option.disabled || this.disabled) {
      return;
    }

    this.value = option.value;
    this.onChange(this.value);
    this.onTouched();
    this.valueChange.emit(this.value);
    this.close(false);
  }

  writeValue(value: string | number | null): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string | number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.close(false);
    }
  }

  onButtonBlur(): void {
    this.onTouched();
  }

  trackByValue(_: number, option: CustomSelectOption): string | number {
    return option.value;
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    if (!this.isOpen) {
      return;
    }

    if (!this.hostRef.nativeElement.contains(event.target as Node)) {
      this.close(false);
    }
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this.disabled) {
      return;
    }

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!this.isOpen) {
          this.open();
          return;
        }
        this.selectActiveOption();
        break;
      case 'Escape':
        if (this.isOpen) {
          event.preventDefault();
          this.close();
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen) {
          this.open();
          return;
        }
        this.moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!this.isOpen) {
          this.open();
          return;
        }
        this.moveActive(-1);
        break;
      case 'Tab':
        this.close();
        break;
      default:
        break;
    }
  }

  isOptionActive(index: number): boolean {
    return this.activeIndex === index;
  }

  private get selectedIndex(): number {
    return this.options.findIndex((option) => option.value === this.value);
  }

  private get firstEnabledIndex(): number {
    return this.options.findIndex((option) => !option.disabled);
  }

  private moveActive(step: 1 | -1): void {
    if (!this.options.length) {
      return;
    }

    let nextIndex = this.activeIndex;
    const maxIterations = this.options.length;
    let iterations = 0;

    do {
      nextIndex += step;
      if (nextIndex >= this.options.length) {
        nextIndex = 0;
      }
      if (nextIndex < 0) {
        nextIndex = this.options.length - 1;
      }
      iterations += 1;
    } while (this.options[nextIndex]?.disabled && iterations <= maxIterations);

    if (!this.options[nextIndex]?.disabled) {
      this.activeIndex = nextIndex;
    }
  }

  private selectActiveOption(): void {
    if (this.activeIndex < 0 || this.activeIndex >= this.options.length) {
      return;
    }

    this.selectOption(this.options[this.activeIndex]);
  }
}
