import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, output, signal, WritableSignal } from '@angular/core';
import { finalize } from 'rxjs';
import { PerenualDiseaseDetails } from '../../../interfaces/perenual.interface';
import { PopupWindow } from '../../common/popup-window/popup-window';
import { PerenualPlantsService } from '../../services/perenual-plants.service';

@Component({
  selector: 'aurelis-disease-guide-details-window',
  imports: [CommonModule, PopupWindow],
  templateUrl: './disease-guide-details-window.html',
  styleUrl: './disease-guide-details-window.scss',
})
export class DiseaseGuideDetailsWindow {
  private readonly perenualPlantsService = inject(PerenualPlantsService);

  public readonly diseaseId = input.required<number>();
  public readonly closeWindow = output<void>();

  public diseaseDetails: WritableSignal<PerenualDiseaseDetails | null> =
    signal<PerenualDiseaseDetails | null>(null);
  public isLoading = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);

  public constructor() {
    effect(() => {
      const id = this.diseaseId();
      if (Number.isFinite(id)) {
        this.loadDiseaseDetails(id);
      }
    });
  }

  protected onClose(): void {
    this.closeWindow.emit();
  }

  private loadDiseaseDetails(diseaseId: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.diseaseDetails.set(null);

    this.perenualPlantsService
      .getDiseaseDetails(diseaseId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (details) => {
          this.diseaseDetails.set(details);
        },
        error: () => {
          this.errorMessage.set('Could not load disease details from Perenual API.');
        },
      });
  }

  public getMainImage(): string {
    const details = this.diseaseDetails();
    return (
      details?.images?.[0]?.regular_url ||
      details?.images?.[0]?.original_url ||
      details?.images?.[0]?.medium_url ||
      'https://via.placeholder.com/600x320?text=No+Image'
    );
  }
}
