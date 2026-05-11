import { effect, inject, Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '@auth0/auth0-angular';
import { distinctUntilChanged, map } from 'rxjs/operators';

const FAVORITE_PLANTS_STORAGE_KEY_PREFIX = 'aurelis.favorite_plants';
/** Namespace for keys when Auth0 has not yet emitted a user (or user is logged out). */
const UNAUTHENTICATED_STORAGE_NS = 'unauthenticated';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  private readonly auth = inject(AuthService);

  private readonly auth0Sub = toSignal(
    this.auth.user$.pipe(
      map((u) => (typeof u?.sub === 'string' && u.sub.trim() ? u.sub.trim() : null)),
      distinctUntilChanged(),
    ),
    { initialValue: null },
  );

  private readonly favoritePlantIds: WritableSignal<number[]> = signal<number[]>([]);

  public get browserStorageNamespace(): string {
    return this.auth0Sub() ?? UNAUTHENTICATED_STORAGE_NS;
  }

  public readonly favoriteIds: Signal<number[]> = this.favoritePlantIds.asReadonly();

  public constructor() {
    effect(() => {
      this.auth0Sub();
      this.loadFavoritePlantsForCurrentUser();
    });
  }

  private loadFavoritePlantsForCurrentUser(): void {
    const stored = this.readFavoritePlantsFromStorage();
    if (stored !== null) {
      this.favoritePlantIds.set(stored);
      return;
    }
    this.favoritePlantIds.set([]);
  }

  public isFavorite(plantId: number): boolean {
    return this.favoritePlantIds().includes(plantId);
  }

  public toggleFavorite(plantId: number): void {
    const current = this.favoritePlantIds();
    if (current.includes(plantId)) {
      this.removeFavorite(plantId);
    } else {
      this.addFavorite(plantId);
    }
  }

  public addFavorite(plantId: number): void {
    if (this.favoritePlantIds().includes(plantId)) {
      return;
    }
    const next = [...this.favoritePlantIds(), plantId];
    this.favoritePlantIds.set(next);
    this.persistFavoritePlants(next);
  }

  public removeFavorite(plantId: number): void {
    if (!this.favoritePlantIds().includes(plantId)) {
      return;
    }
    const next = this.favoritePlantIds().filter((id) => id !== plantId);
    this.favoritePlantIds.set(next);
    this.persistFavoritePlants(next);
  }

  private readFavoritePlantsFromStorage(): number[] | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    try {
      const raw = window.localStorage.getItem(this.favoritePlantsStorageKey);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return null;
      }
      return parsed.filter((id): id is number => typeof id === 'number' && Number.isFinite(id));
    } catch {
      return null;
    }
  }

  private persistFavoritePlants(ids: number[]): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    try {
      window.localStorage.setItem(this.favoritePlantsStorageKey, JSON.stringify(ids));
    } catch {}
  }

  private get favoritePlantsStorageKey(): string {
    return `${FAVORITE_PLANTS_STORAGE_KEY_PREFIX}.${this.browserStorageNamespace}`;
  }
}
