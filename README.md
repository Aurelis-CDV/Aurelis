# Aurelis

## Custom Angular select component

A reusable select-like Angular component is available at:

`src/app/shared/components/custom-select/custom-select.component.ts`

### Quick usage (standalone)

```ts
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CustomSelectComponent, CustomSelectOption } from './shared/components/custom-select/custom-select.component';

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [ReactiveFormsModule, CustomSelectComponent],
  template: `
    <form [formGroup]="form">
      <app-custom-select
        formControlName="country"
        label="Country"
        placeholder="Choose country"
        [options]="countryOptions"
      />
    </form>
  `,
})
export class ProfileFormComponent {
  form = new FormGroup({
    country: new FormControl<string | number | null>(null),
  });

  countryOptions: CustomSelectOption[] = [
    { value: 'us', label: 'United States' },
    { value: 'de', label: 'Germany' },
    { value: 'jp', label: 'Japan' },
  ];
}
```

### Styling hooks

The component uses CSS variables so you can align it with your design system:

- `--primary-color`
- `--surface`
- `--surface-hover`
- `--text-primary`
- `--text-muted`
- `--border-color`