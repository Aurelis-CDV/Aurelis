import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, output, signal, WritableSignal } from '@angular/core';
import { finalize } from 'rxjs';
import { PerenualPlantDetails } from '../../../interfaces/perenual.interface';
import { PopupWindow } from '../../common/popup-window/popup-window';
import { PerenualPlantsService } from '../../services/perenual-plants.service';

@Component({
  selector: 'aurelis-plant-guide-details-window',
  imports: [CommonModule, PopupWindow],
  templateUrl: './plant-guide-details-window.html',
  styleUrl: './plant-guide-details-window.scss',
})
export class PlantGuideDetailsWindow {
  private readonly perenualPlantsService = inject(PerenualPlantsService);

  public readonly plantId = input.required<number>();
  public readonly closeWindow = output<void>();

  public plantDetails: WritableSignal<PerenualPlantDetails | null> =
    signal<PerenualPlantDetails | null>(null);
  public isLoading = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);

  public constructor() {
    effect(() => {
      const id = this.plantId();
      if (Number.isFinite(id)) {
        this.loadPlantDetails(id);
      }
    });
  }

  protected onClose(): void {
    this.closeWindow.emit();
  }

  private loadPlantDetails(plantId: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.plantDetails.set(null);

    this.perenualPlantsService
      .getPlantDetails(plantId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (details) => {
          this.plantDetails.set(details);
        },
        error: () => {
          this.errorMessage.set('Could not load plant details from Perenual API.');
        },
      });
  }
}
