import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { PopupWindow } from '../../common/popup-window/popup-window';
import { DashboardSignalsService } from '../../services/dashboard-signals.service';
import { GreenhousesDataService } from '../../services/data.service';
import { PlantData } from '../../../interfaces/plant-data.interface';

@Component({
  selector: 'aurelis-plant-form-window',
  imports: [CommonModule, FormsModule, PopupWindow],
  templateUrl: './plant-form-window.html',
  styleUrl: './plant-form-window.scss',
})
export class PlantFormWindow {
  private readonly dashboardSignalsService = inject(DashboardSignalsService);
  private readonly greenhousesDataService = inject(GreenhousesDataService);

  private readonly isWindowOpen = this.dashboardSignalsService.getIsPlantFormWindowOpened();
  private readonly windowMode = this.dashboardSignalsService.getPlantFormWindowMode();
  private readonly editPlantId = this.dashboardSignalsService.getPlantFormEditPlantId();

  protected readonly isEditMode = computed(() => this.windowMode() === 'edit');

  protected plantName = '';
  protected plantId = '';
  protected previewUrl = '';

  protected nameError = '';
  protected idError = '';
  protected previewUrlError = '';
  protected formError = '';

  protected readonly isSubmitting = signal(false);

  private editBaseline: { name: string; previewUrl: string } | null = null;

  private editingPlantId: string | null = null;

  public constructor() {
    let wasOpen = false;
    effect(() => {
      const open = this.isWindowOpen();
      if (open && !wasOpen) {
        if (this.windowMode() === 'edit') {
          const pid = this.editPlantId();
          const ghId = this.dashboardSignalsService.getDashboardGreenhouseId()();
          if (pid && ghId) {
            const gh = this.greenhousesDataService
              .greenhousesData()
              .find((g) => g.id === ghId);
            const plant = gh?.plants.find((p) => p.id === pid);
            if (plant) {
              this.prefillFromPlant(plant);
            }
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
      this.updatePlant();
    } else {
      this.addPlant();
    }
  }

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
        next: (result) => {
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
          this.dashboardSignalsService.setIsPlantFormWindowOpened(false);
        },
      });
  }

  private updatePlant(): void {
    this.clearFieldErrors();
    this.formError = '';

    const name = this.plantName.trim();
    const preview_url = this.previewUrl.trim();
    const plantRowId = this.editingPlantId;

    if (!plantRowId) {
      this.formError = 'No plant is selected.';
      return;
    }

    if (!name) {
      this.nameError = 'Plant name is required.';
    }
    if (!preview_url) {
      this.previewUrlError = 'Preview URL is required.';
    } else if (!this.isValidHttpOrHttpsUrl(preview_url)) {
      this.previewUrlError = 'Enter a valid URL that starts with http:// or https://';
    }

    if (this.nameError || this.previewUrlError || this.formError) {
      return;
    }

    const greenhouseId = this.dashboardSignalsService.getDashboardGreenhouseId()();

    this.isSubmitting.set(true);
    this.greenhousesDataService
      .updatePlantInGreenhouse(greenhouseId, plantRowId, {
        name,
        preview_url,
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (result) => {
          if (!result.ok) {
            if (result.reason === 'plant_not_found') {
              this.formError = 'This plant is no longer in the greenhouse.';
            } else if (result.reason === 'greenhouse_not_found') {
              this.formError =
                'Could not find the selected greenhouse. Try selecting a greenhouse again.';
            } else if (result.reason === 'request_failed') {
              this.formError =
                'Could not update the plant on the server. Check your connection and API.';
            }
            return;
          }

          this.resetForm();
          this.dashboardSignalsService.setIsPlantFormWindowOpened(false);
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

  protected confirmDeletePlant(): void {
    if (!this.isEditMode() || !this.editingPlantId) {
      return;
    }
    const displayName = this.plantName.trim() || this.editingPlantId;
    const confirmed = window.confirm(
      `Delete plant "${displayName}"? This cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }

    const plantId = this.editingPlantId;
    const greenhouseId = this.dashboardSignalsService.getDashboardGreenhouseId()();

    this.isSubmitting.set(true);
    this.greenhousesDataService
      .deletePlantFromGreenhouse(greenhouseId, plantId)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (result) => {
          if (!result.ok) {
            if (result.reason === 'plant_not_found') {
              this.formError = 'This plant is no longer in the greenhouse.';
            } else if (result.reason === 'greenhouse_not_found') {
              this.formError =
                'Could not find the selected greenhouse. Try selecting a greenhouse again.';
            } else {
              this.formError =
                'Could not delete the plant on the server. Check your connection and API.';
            }
            return;
          }

          this.dashboardSignalsService.notifyPlantRemovedFromGreenhouse();
          this.resetForm();
          this.dashboardSignalsService.setIsPlantFormWindowOpened(false);
        },
      });
  }

  private closeWithoutConfirm(): void {
    this.resetForm();
    this.dashboardSignalsService.setIsPlantFormWindowOpened(false);
  }

  private prefillFromPlant(plant: PlantData): void {
    this.clearFieldErrors();
    this.formError = '';
    this.editingPlantId = plant.id;
    this.plantName = plant.name;
    this.plantId = plant.id;
    this.previewUrl = plant.preview_url;
    this.editBaseline = {
      name: plant.name.trim(),
      previewUrl: plant.preview_url.trim(),
    };
  }

  private resetForm(): void {
    this.plantName = '';
    this.plantId = '';
    this.previewUrl = '';
    this.clearFieldErrors();
    this.formError = '';
    this.editBaseline = null;
    this.editingPlantId = null;
  }

  private clearFieldErrors(): void {
    this.nameError = '';
    this.idError = '';
    this.previewUrlError = '';
  }

  private isDirty(): boolean {
    if (this.isEditMode() && this.editBaseline) {
      const b = this.editBaseline;
      return (
        this.plantName.trim() !== b.name || this.previewUrl.trim() !== b.previewUrl
      );
    }
    return (
      this.plantName.trim() !== '' ||
      this.plantId.trim() !== '' ||
      this.previewUrl.trim() !== ''
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
