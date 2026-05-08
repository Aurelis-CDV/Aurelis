import { CommonModule } from '@angular/common';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PerenualPlantDetails } from '../../../interfaces/perenual.interface';
import { TopBar } from '../../common/top-bar/top-bar';
import { PerenualPlantsService } from '../../services/perenual-plants.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'aurelis-plant-guide-details-window',
  imports: [CommonModule, TopBar],
  templateUrl: './plant-guide-details-window.html',
  styleUrl: './plant-guide-details-window.scss',
})
export class PlantGuideDetailsWindow {
  private readonly route = inject(ActivatedRoute);
  private readonly perenualPlantsService = inject(PerenualPlantsService);

  public plantDetails: WritableSignal<PerenualPlantDetails | null> =
    signal<PerenualPlantDetails | null>(null);
  public isLoading = false;
  public errorMessage: string | null = null;

  public ngOnInit(): void {
    const plantIdParam = this.route.snapshot.paramMap.get('id');
    const plantId = plantIdParam ? Number(plantIdParam) : NaN;

    if (Number.isNaN(plantId)) {
      this.errorMessage = 'Invalid plant id.';
      return;
    }

    this.loadPlantDetails(plantId);
  }

  private loadPlantDetails(plantId: number): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.perenualPlantsService
      .getPlantDetails(plantId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (details) => {
          this.plantDetails.set(details);
        },
        error: () => {
          this.errorMessage = 'Could not load plant details from Perenual API.';
        },
      });
  }
}
