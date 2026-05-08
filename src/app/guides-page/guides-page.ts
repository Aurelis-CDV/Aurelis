import { CommonModule } from '@angular/common';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { PerenualPlantPreview } from '../../interfaces/perenual.interface';
import { TopBar } from '../common/top-bar/top-bar';
import { PerenualPlantsService } from '../services/perenual-plants.service';

@Component({
  selector: 'aurelis-guides-page',
  imports: [CommonModule, FormsModule, TopBar],
  templateUrl: './guides-page.html',
  styleUrl: './guides-page.scss',
})
export class GuidesPage {
  private readonly perenualPlantsService = inject(PerenualPlantsService);

  public searchQuery = '';
  public plants: WritableSignal<PerenualPlantPreview[]> = signal<PerenualPlantPreview[]>([]);
  public isLoading = false;
  public errorMessage: string | null = null;

  constructor() {}

  public ngOnInit(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.perenualPlantsService
      .getPlantsList()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          this.plants.set(response.data);
        },
        error: () => {
          this.errorMessage = 'Could not load plant guides. Please check your Perenual API key.';
        },
      });
  }

  public searchPlants(): void {
    this.perenualPlantsService
      .searchPlants(this.searchQuery.trim())
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          this.plants.set(response.data);
        },
        error: () => {
          this.errorMessage = 'Could not load plant guides. Please check your Perenual API key.';
        },
      });
  }

  public openPlantDetailsWindow(plantId: number): void {
    window.open(`/guides/${plantId}`, '_blank', 'noopener,noreferrer');
  }
}
