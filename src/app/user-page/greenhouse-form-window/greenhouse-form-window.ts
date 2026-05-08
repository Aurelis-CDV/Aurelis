import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Close } from '../../common/icons/close/close';
import { DashboardSignalsService } from '../../services/dashboard-signals.service';
import { GreenhousesDataService } from '../../services/data.service';
import { WeatherApiService, WeatherSearchItem } from '../../services/weather-api.service';
import { environment } from '../../../environments/environment';
import { GreenhouseData } from '../../../interfaces/greenhouses-data.interface';

@Component({
  selector: 'aurelis-greenhouse-form-window',
  imports: [CommonModule, FormsModule, Close],
  templateUrl: './greenhouse-form-window.html',
  styleUrl: './greenhouse-form-window.scss',
})
export class GreenhouseFormWindow {
  private readonly dashboardSignalsService = inject(DashboardSignalsService);
  private readonly greenhousesDataService = inject(GreenhousesDataService);
  private readonly weatherApi = inject(WeatherApiService);

  private readonly isWindowOpen = this.dashboardSignalsService.getIsGreenhouseFormWindowOpened();
  private readonly windowMode = this.dashboardSignalsService.getGreenhouseFormWindowMode();

  protected readonly isEditMode = computed(() => this.windowMode() === 'edit');

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

  private editBaseline: {
    name: string;
    previewUrl: string;
    locationName: string;
    lat: number;
    lon: number;
  } | null = null;

  /** ID of the greenhouse being edited (dashboard greenhouse when opening settings). */
  private editingGreenhouseId: string | null = null;

  protected readonly weatherConfigured = !!environment.weatherApiKey?.trim();

  public constructor() {
    let wasOpen = false;
    effect(() => {
      const open = this.isWindowOpen();
      if (open && !wasOpen) {
        if (this.windowMode() === 'edit') {
          const gh = this.dashboardSignalsService.getDashboardGreenhouseData()();
          if (gh) {
            this.prefillFromGreenhouse(gh);
          }
        } else {
          this.resetForm();
        }
      }
      wasOpen = open;
    });
  }

  protected submitForm(): void {
    if (this.isEditMode()) {
      this.updateGreenhouse();
    } else {
      this.addGreenhouse();
    }
  }

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
          this.dashboardSignalsService.setIsGreenhouseFormWindowOpened(false);
        },
      });
  }

  private updateGreenhouse(): void {
    this.clearFieldErrors();
    this.formError = '';

    const name = this.greenhouseName.trim();
    const preview_url = this.previewUrl.trim();
    const greenhouseId = this.editingGreenhouseId;

    if (!greenhouseId) {
      this.formError = 'No greenhouse is selected.';
      return;
    }

    if (!name) {
      this.nameError = 'Greenhouse name is required.';
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

    if (this.nameError || this.previewUrlError || this.locationError || this.formError) {
      return;
    }

    const picked = this.selectedLocation;
    if (!picked) {
      return;
    }

    const displayLocation = this.formatLocationLabel(picked);

    this.isSubmitting.set(true);
    this.greenhousesDataService
      .updateGreenhouse(greenhouseId, {
        name,
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
            if (result.reason === 'greenhouse_not_found') {
              this.formError = 'This greenhouse is no longer in your list.';
            } else if (result.reason === 'request_failed') {
              this.formError =
                'Could not update the greenhouse on the server. Check your connection and API.';
            }
            return;
          }

          this.resetForm();
          this.dashboardSignalsService.setIsGreenhouseFormWindowOpened(false);
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
    this.dashboardSignalsService.setIsGreenhouseFormWindowOpened(false);
  }

  private prefillFromGreenhouse(gh: GreenhouseData): void {
    this.clearFieldErrors();
    this.formError = '';
    this.editingGreenhouseId = gh.id;
    this.greenhouseName = gh.name;
    this.greenhouseId = gh.id;
    this.previewUrl = gh.preview_url;
    this.locationQuery = gh.location.name;
    this.selectedLocation = this.weatherItemFromStoredLocation(gh.location);
    this.locationSuggestions.set([]);
    this.editBaseline = {
      name: gh.name.trim(),
      previewUrl: gh.preview_url.trim(),
      locationName: gh.location.name.trim(),
      lat: gh.location.lat,
      lon: gh.location.lon,
    };
  }

  private weatherItemFromStoredLocation(loc: GreenhouseData['location']): WeatherSearchItem {
    const parts = loc.name.split(',').map((p) => p.trim());
    return {
      id: 0,
      name: parts[0] ?? loc.name,
      region: parts[1] ?? '',
      country: parts[2] ?? '',
      lat: loc.lat,
      lon: loc.lon,
      url: '',
    };
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
    this.editBaseline = null;
    this.editingGreenhouseId = null;
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
    if (this.isEditMode() && this.editBaseline) {
      const b = this.editBaseline;
      const picked = this.selectedLocation;
      const locChanged =
        !picked ||
        picked.lat !== b.lat ||
        picked.lon !== b.lon ||
        this.formatLocationLabel(picked).trim() !== b.locationName;
      return (
        this.greenhouseName.trim() !== b.name ||
        this.previewUrl.trim() !== b.previewUrl ||
        locChanged
      );
    }
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
