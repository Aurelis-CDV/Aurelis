import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Close } from '../../common/icons/close/close';
import { DashboardSignalsService } from '../../services/dashboard-signals.service';
import { GreenhousesDataService } from '../../services/data.service';
@Component({
  selector: 'aurelis-add-plant-window',
  imports: [CommonModule, FormsModule, Close],
  templateUrl: './add-plant-window.html',
  styleUrl: './add-plant-window.scss',
})
export class AddPlantWindow {
  private readonly dashboardSignalsService = inject(DashboardSignalsService);
  private readonly greenhousesDataService = inject(GreenhousesDataService);

  protected plantName = '';
  protected plantId = '';
  protected previewUrl = '';

  protected nameError = '';
  protected idError = '';
  protected previewUrlError = '';
  protected formError = '';

  protected readonly isSubmitting = signal(false);

  protected addPlant(): void {
    this.clearFieldErrors();
    this.formError = '';

    const name = this.plantName.trim();
    const id = this.plantId.trim();
    const preview_url = this.previewUrl.trim();

    if (!name) {
      this.nameError = 'Plant name is required.';
    }
    if (!id) {
      this.idError = 'Plant ID is required.';
    }
    if (!preview_url) {
      this.previewUrlError = 'Preview URL is required.';
    } else if (!this.isValidHttpOrHttpsUrl(preview_url)) {
      this.previewUrlError = 'Enter a valid URL that starts with http:// or https://';
    }

    if (this.nameError || this.idError || this.previewUrlError) {
      return;
    }

    const greenhouseId = this.dashboardSignalsService.getDashboardGreenhouseId()();
    this.isSubmitting.set(true);
    this.greenhousesDataService
      .addPlantToGreenhouse(greenhouseId, {
        name,
        id,
        preview_url,
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (result: any) => {
          if (!result.ok) {
            if (result.reason === 'duplicate_plant_id') {
              this.formError = 'A plant with this ID already exists in this greenhouse.';
            } else if (result.reason === 'greenhouse_full') {
              this.formError = 'This greenhouse already has the maximum number of plants.';
            } else if (result.reason === 'request_failed') {
              this.formError =
                'Could not save the plant on the server. Check your connection and API.';
            } else {
              this.formError =
                'Could not find the selected greenhouse. Try selecting a greenhouse again.';
            }
            return;
          }
          this.resetForm();
          this.dashboardSignalsService.setIsAddPlantWindowOpened(false);
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
    this.dashboardSignalsService.setIsAddPlantWindowOpened(false);
  }

  private resetForm(): void {
    this.plantName = '';
    this.plantId = '';
    this.previewUrl = '';
    this.clearFieldErrors();
    this.formError = '';
  }

  private clearFieldErrors(): void {
    this.nameError = '';
    this.idError = '';
    this.previewUrlError = '';
  }

  private isDirty(): boolean {
    return (
      this.plantName.trim() !== '' || this.plantId.trim() !== '' || this.previewUrl.trim() !== ''
    );
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
