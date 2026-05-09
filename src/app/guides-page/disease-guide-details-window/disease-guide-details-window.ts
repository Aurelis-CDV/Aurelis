import { CommonModule } from '@angular/common';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { PerenualDiseaseDetails } from '../../../interfaces/perenual.interface';
import { TopBar } from '../../common/top-bar/top-bar';
import { PerenualPlantsService } from '../../services/perenual-plants.service';

@Component({
  selector: 'aurelis-disease-guide-details-window',
  imports: [CommonModule, TopBar],
  templateUrl: './disease-guide-details-window.html',
  styleUrl: './disease-guide-details-window.scss',
})
export class DiseaseGuideDetailsWindow {
  private readonly route = inject(ActivatedRoute);
  private readonly perenualPlantsService = inject(PerenualPlantsService);

  public diseaseDetails: WritableSignal<PerenualDiseaseDetails | null> =
    signal<PerenualDiseaseDetails | null>(null);
  public isLoading = false;
  public errorMessage: string | null = null;

  public ngOnInit(): void {
    const diseaseIdParam = this.route.snapshot.paramMap.get('id');
    const diseaseId = diseaseIdParam ? Number(diseaseIdParam) : NaN;

    if (Number.isNaN(diseaseId)) {
      this.errorMessage = 'Invalid disease id.';
      return;
    }

    this.loadDiseaseDetails(diseaseId);
  }

  private loadDiseaseDetails(diseaseId: number): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.perenualPlantsService
      .getDiseaseDetails(diseaseId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (details) => {
          this.diseaseDetails.set(details);
        },
        error: () => {
          this.errorMessage = 'Could not load disease details from Perenual API.';
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
