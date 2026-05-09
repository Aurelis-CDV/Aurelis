import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import {
  PerenualDiseasePreview,
  PerenualPlantPreview,
} from '../../interfaces/perenual.interface';
import { TopBar } from '../common/top-bar/top-bar';
import { PerenualPlantsService } from '../services/perenual-plants.service';
import { GuidesPagination } from './guides-pagination/guides-pagination';

export type GuidesTab = 'plants' | 'diseases';

@Component({
  selector: 'aurelis-guides-page',
  imports: [CommonModule, FormsModule, TopBar, GuidesPagination],
  templateUrl: './guides-page.html',
  styleUrl: './guides-page.scss',
})
export class GuidesPage implements OnInit {
  private readonly perenualPlantsService = inject(PerenualPlantsService);

  public activeTab: WritableSignal<GuidesTab> = signal<GuidesTab>('plants');
  public searchQuery = '';

  public plants: WritableSignal<PerenualPlantPreview[]> = signal<PerenualPlantPreview[]>([]);
  public diseases: WritableSignal<PerenualDiseasePreview[]> = signal<PerenualDiseasePreview[]>([]);
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

    if (this.activeTab() === 'plants') {
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
    } else {
      const request$ = query
        ? this.perenualPlantsService.searchDiseases(query, page)
        : this.perenualPlantsService.getDiseasesList(page);

      request$.pipe(finalize(() => this.isLoading.set(false))).subscribe({
        next: (response) => {
          this.diseases.set(response.data);
          this.currentPage.set(response.current_page);
          this.lastPage.set(Math.max(1, response.last_page));
        },
        error: () => {
          this.errorMessage.set(
            'Could not load disease guides. Please check your Perenual API key.',
          );
        },
      });
    }
  }

  public selectTab(tab: GuidesTab): void {
    if (this.activeTab() === tab) {
      return;
    }
    this.activeTab.set(tab);
    this.searchQuery = '';
    this.plants.set([]);
    this.diseases.set([]);
    this.loadPage(1);
  }

  public search(): void {
    this.loadPage(1);
  }

  public onPageChange(page: number): void {
    this.loadPage(page);
  }

  public openPlantDetailsWindow(plantId: number): void {
    window.open(`/guides/${plantId}`, '_blank', 'noopener,noreferrer');
  }

  public openDiseaseDetailsWindow(diseaseId: number): void {
    window.open(`/guides/diseases/${diseaseId}`, '_blank', 'noopener,noreferrer');
  }

  public getDiseaseThumbnail(disease: PerenualDiseasePreview): string {
    return (
      disease.images?.[0]?.thumbnail ||
      disease.images?.[0]?.small_url ||
      disease.images?.[0]?.regular_url ||
      'https://via.placeholder.com/250x160?text=No+Image'
    );
  }

  public getDiseaseShortDescription(disease: PerenualDiseasePreview): string {
    const text = disease.description?.[0]?.description ?? '';
    if (!text) {
      return 'No description available.';
    }
    return text.length > 110 ? `${text.slice(0, 110).trim()}...` : text;
  }
}
