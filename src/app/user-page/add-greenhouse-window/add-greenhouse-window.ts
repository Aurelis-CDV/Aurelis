import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Close } from '../../common/icons/close/close';
import { DashboardSignalsService } from '../../services/dashboard-signals.service';
import { GreenhousesDataService } from '../../services/data.service';
import { WeatherApiService, WeatherSearchItem } from '../../services/weather-api.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'aurelis-add-greenhouse-window',
  imports: [CommonModule, FormsModule, Close],
  templateUrl: './add-greenhouse-window.html',
  styleUrl: './add-greenhouse-window.scss',
})
export class AddGreenhouseWindow {
  private readonly dashboardSignalsService = inject(DashboardSignalsService);
  private readonly greenhousesDataService = inject(GreenhousesDataService);
  private readonly weatherApi = inject(WeatherApiService);

  protected greenhouseName = '';
  protected greenhouseId = '';
  protected previewUrl = '';

  protected locationQuery = '';
  protected selectedLocation: WeatherSearchItem | null = null;

  protected readonly locationSuggestions = signal<WeatherSearchItem[]>([]);
  protected readonly isSubmitting = signal(false);

  protected nameError = '';
  protected idError = '';
  protected previewUrlError = '';
  protected locationError = '';
  protected formError = '';

  private locationSearchTimer: ReturnType<typeof setTimeout> | undefined;

  protected readonly weatherConfigured = !!environment.weatherApiKey?.trim();

  protected addGreenhouse(): void {
    this.clearFieldErrors();
    this.formError = '';

    const name = this.greenhouseName.trim();
    const id = this.greenhouseId.trim();
    const preview_url = this.previewUrl.trim();

    if (!name) {
      this.nameError = 'Greenhouse name is required.';
    }
    if (!id) {
      this.idError = 'Greenhouse ID is required.';
    }
    if (!preview_url) {
      this.previewUrlError = 'Preview URL is required.';
    } else if (!this.isValidHttpOrHttpsUrl(preview_url)) {
      this.previewUrlError = 'Enter a valid URL that starts with http:// or https://';
    }

    if (!this.weatherConfigured) {
      this.formError =
        'Set `weatherApiKey` in `src/environments/environment.development.ts` (from weatherapi.com).';
    }

    if (this.weatherConfigured && !this.selectedLocation) {
      this.locationError = 'Pick a location from the WeatherAPI search results.';
    }

    if (
      this.nameError ||
      this.idError ||
      this.previewUrlError ||
      this.locationError ||
      this.formError
    ) {
      return;
    }

    const picked = this.selectedLocation;
    if (!picked) {
      return;
    }

    const displayLocation = this.formatLocationLabel(picked);

    this.isSubmitting.set(true);
    this.greenhousesDataService
      .addGreenhouse({
        name,
        id,
        preview_url,
        location: {
          name: displayLocation,
          lat: picked.lat,
          lon: picked.lon,
        },
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (result) => {
          if (!result.ok) {
            if (result.reason === 'duplicate_greenhouse_id') {
              this.formError = 'A greenhouse with this ID already exists.';
            } else if (result.reason === 'request_failed') {
              this.formError =
                'Could not save the greenhouse on the server. Check your connection and API.';
            } else {
              this.formError = 'The maximum number of greenhouses has been reached.';
            }
            return;
          }

          this.dashboardSignalsService.setDashboardGreenhouseId(id);
          this.resetForm();
          this.dashboardSignalsService.setIsAddGreenhouseWindowOpened(false);
        },
      });
  }

  protected onPreviewUrlInput(): void {
    const trimmed = this.previewUrl.trim();
    if (!trimmed) {
      this.previewUrlError = '';
      return;
    }
    this.previewUrlError = this.isValidHttpOrHttpsUrl(trimmed)
      ? ''
      : 'Enter a valid URL that starts with http:// or https://';
  }

  protected onPreviewUrlBlur(): void {
    this.onPreviewUrlInput();
  }

  protected onLocationQueryChange(): void {
    this.locationError = '';
    if (this.selectedLocation) {
      const label = this.formatLocationLabel(this.selectedLocation);
      if (this.locationQuery.trim() !== label) {
        this.selectedLocation = null;
      }
    }

    const q = this.locationQuery.trim();
    if (this.locationSearchTimer) {
      clearTimeout(this.locationSearchTimer);
    }

    if (!this.weatherConfigured || q.length < 2) {
      this.locationSuggestions.set([]);
      return;
    }

    this.locationSearchTimer = setTimeout(() => this.fetchLocationSuggestions(q), 350);
  }

  protected pickLocation(item: WeatherSearchItem): void {
    this.selectedLocation = item;
    this.locationQuery = this.formatLocationLabel(item);
    this.locationSuggestions.set([]);
    this.locationError = '';
  }

  protected cancel(): void {
    if (this.isDirty()) {
      const leave = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel and close this window?',
      );
      if (!leave) {
        return;
      }
    }
    this.closeWithoutConfirm();
  }

  protected close(): void {
    this.cancel();
  }

  private closeWithoutConfirm(): void {
    this.resetForm();
    this.dashboardSignalsService.setIsAddGreenhouseWindowOpened(false);
  }

  private resetForm(): void {
    this.greenhouseName = '';
    this.greenhouseId = '';
    this.previewUrl = '';
    this.locationQuery = '';
    this.selectedLocation = null;
    this.locationSuggestions.set([]);
    this.clearFieldErrors();
    this.formError = '';
    if (this.locationSearchTimer) {
      clearTimeout(this.locationSearchTimer);
    }
  }

  private clearFieldErrors(): void {
    this.nameError = '';
    this.idError = '';
    this.previewUrlError = '';
    this.locationError = '';
  }

  private isDirty(): boolean {
    return (
      this.greenhouseName.trim() !== '' ||
      this.greenhouseId.trim() !== '' ||
      this.previewUrl.trim() !== '' ||
      this.locationQuery.trim() !== ''
    );
  }

  private fetchLocationSuggestions(query: string): void {
    this.weatherApi.searchLocations(query).subscribe({
      next: (items) => this.locationSuggestions.set(items),
      error: () => this.locationSuggestions.set([]),
    });
  }

  private formatLocationLabel(item: WeatherSearchItem): string {
    return [item.name, item.region, item.country].filter(Boolean).join(', ');
  }

  private isValidHttpOrHttpsUrl(value: string): boolean {
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
