import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { PerenualPlantPreview } from '../../interfaces/perenual.interface';
import { TopBar } from '../common/top-bar/top-bar';
import { PerenualPlantsService } from '../services/perenual-plants.service';
import { GuidesPagination } from './guides-pagination/guides-pagination';

@Component({
  selector: 'aurelis-guides-page',
  imports: [CommonModule, FormsModule, TopBar, GuidesPagination],
  templateUrl: './guides-page.html',
  styleUrl: './guides-page.scss',
})
export class GuidesPage implements OnInit {
  private readonly perenualPlantsService = inject(PerenualPlantsService);

  public searchQuery = '';

  public plants: WritableSignal<PerenualPlantPreview[]> = signal<PerenualPlantPreview[]>([]);
  public isLoading: WritableSignal<boolean> = signal<boolean>(false);
  public errorMessage: WritableSignal<string | null> = signal<string | null>(null);
  public currentPage: WritableSignal<number> = signal(1);
  public lastPage: WritableSignal<number> = signal(1);

  public ngOnInit(): void {
    this.loadPage(1);
  }

  private loadPage(page: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const query = this.searchQuery.trim();
    const request$ = query
      ? this.perenualPlantsService.searchPlants(query, page)
      : this.perenualPlantsService.getPlantsList(page);

    request$.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: (response) => {
        this.plants.set(response.data);
        this.currentPage.set(response.current_page);
        this.lastPage.set(Math.max(1, response.last_page));
      },
      error: () => {
        this.errorMessage.set('Could not load plant guides. Please check your Perenual API key.');
      },
    });
  }

  public searchPlants(): void {
    this.loadPage(1);
  }

  public onPageChange(page: number): void {
    this.loadPage(page);
  }

  public openPlantDetailsWindow(plantId: number): void {
    window.open(`/guides/${plantId}`, '_blank', 'noopener,noreferrer');
  }
}
