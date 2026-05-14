import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  Signal,
  signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '@auth0/auth0-angular';
import { finalize, forkJoin, of } from 'rxjs';
import { PerenualPlantDetails, PerenualPlantPreview } from '../../interfaces/perenual.interface';
import { Heart } from '../common/icons/heart/heart';
import { TopBar } from '../common/top-bar/top-bar';
import { PerenualPlantsService } from '../services/perenual-plants.service';
import { UserDataService } from '../services/user-data.service';
import { GuidesPagination } from './guides-pagination/guides-pagination';
import { PlantGuideDetailsWindow } from './plant-guide-details-window/plant-guide-details-window';

export type GuidesTab = 'favorites' | 'plants';

@Component({
  selector: 'aurelis-guides-page',
  imports: [
    CommonModule,
    FormsModule,
    TopBar,
    Heart,
    GuidesPagination,
    PlantGuideDetailsWindow,
  ],
  templateUrl: './guides-page.html',
  styleUrl: './guides-page.scss',
})
export class GuidesPage {
  private readonly perenualPlantsService = inject(PerenualPlantsService);
  private readonly userDataService = inject(UserDataService);
  private readonly auth = inject(AuthService);
  private readonly authLoading = toSignal(this.auth.isLoading$, { initialValue: true });

  public readonly isSignedIn = this.userDataService.isSignedIn;

  public activeTab: WritableSignal<GuidesTab> = signal<GuidesTab>('favorites');
  public searchQuery = '';

  public plants: WritableSignal<PerenualPlantPreview[]> = signal<PerenualPlantPreview[]>([]);
  public favoritePlants: WritableSignal<PerenualPlantDetails[]> = signal<PerenualPlantDetails[]>(
    [],
  );

  public isLoading: WritableSignal<boolean> = signal<boolean>(false);
  public errorMessage: WritableSignal<string | null> = signal<string | null>(null);
  public currentPage: WritableSignal<number> = signal(1);
  public lastPage: WritableSignal<number> = signal(1);

  public selectedPlantId: WritableSignal<number | null> = signal<number | null>(null);

  public readonly favoriteIds: Signal<number[]> = this.userDataService.favoriteIds;

  public readonly filteredFavoritePlants = computed(() => {
    const all = this.favoritePlants();
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      return all;
    }
    return all.filter((plant) => {
      const common = (plant.common_name ?? '').toLowerCase();
      const scientific = (plant.scientific_name?.[0] ?? '').toLowerCase();
      return common.includes(query) || scientific.includes(query);
    });
  });

  public constructor() {
    effect(() => {
      if (!this.authLoading() && !this.isSignedIn() && this.activeTab() === 'favorites') {
        untracked(() => this.selectTab('plants'));
        return;
      }

      const ids = this.favoriteIds();
      const tab = this.activeTab();

      if (tab === 'favorites') {
        untracked(() => this.syncFavoritesList(ids));
      }
    });
  }

  public isPlantFavorite(plantId: number): boolean {
    return this.userDataService.isFavorite(plantId);
  }

  public toggleFavorite(plantId: number, event?: MouseEvent): void {
    event?.stopPropagation();
    event?.preventDefault();
    this.userDataService.toggleFavorite(plantId);
  }

  private loadPage(page: number): void {
    if (this.activeTab() !== 'plants') {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const query = this.searchQuery.trim();
    const request$ = query
      ? this.perenualPlantsService.searchPlants(query, page)
      : this.perenualPlantsService.getPlantsList(page);

    request$.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: (response) => {
        // eslint-disable-next-line no-console -- debug: inspect Perenual list/search in DevTools
        console.log('[Aurelis] Perenual species-list response', response);
        this.plants.set(response.data);
        this.currentPage.set(response.current_page);
        this.lastPage.set(Math.max(1, response.last_page));
      },
      error: (err) => {
        // eslint-disable-next-line no-console -- debug
        console.error('[Aurelis] Perenual species-list fetch failed', err);
        this.errorMessage.set('Could not load plant guides. Please check your Perenual API key.');
      },
    });
  }

  private syncFavoritesList(ids: number[]): void {
    if (!ids.length) {
      this.favoritePlants.set([]);
      return;
    }

    const cachedById = new Map(this.favoritePlants().map((plant) => [plant.id, plant]));
    const requests = ids.map((id) => {
      const cached = cachedById.get(id);
      return cached ? of(cached) : this.perenualPlantsService.getPlantDetails(id);
    });

    this.isLoading.set(true);
    forkJoin(requests)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (details) => {
          // eslint-disable-next-line no-console -- debug: inspect Perenual detail payloads in DevTools
          console.log('[Aurelis] Perenual favourite plant details', details);
          this.favoritePlants.set(details);
        },
        error: (err) => {
          // eslint-disable-next-line no-console -- debug
          console.error('[Aurelis] Perenual favourite plants fetch failed', err);
          this.errorMessage.set(
            'Could not load favourite plants. Please check your Perenual API key.',
          );
        },
      });
  }

  public selectTab(tab: GuidesTab): void {
    if (tab === 'favorites' && !this.isSignedIn()) {
      return;
    }
    if (this.activeTab() === tab) {
      return;
    }
    this.activeTab.set(tab);
    this.searchQuery = '';
    this.plants.set([]);
    this.currentPage.set(1);
    this.lastPage.set(1);
    this.errorMessage.set(null);

    if (tab !== 'favorites') {
      this.loadPage(1);
    }
  }

  public search(): void {
    if (this.activeTab() === 'favorites') {
      return;
    }
    this.loadPage(1);
  }

  public onPageChange(page: number): void {
    this.loadPage(page);
  }

  public openPlantDetailsWindow(plantId: number): void {
    this.selectedPlantId.set(plantId);
  }

  public closePlantDetailsWindow(): void {
    this.selectedPlantId.set(null);
  }
}
