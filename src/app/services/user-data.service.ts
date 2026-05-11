import { Injectable, signal, Signal, WritableSignal } from '@angular/core';
import ExampleJson from '../../example-json';

const FAVORITE_PLANTS_STORAGE_KEY_PREFIX = 'aurelis.favorite_plants';
const FALLBACK_USER_ID = 'mock-user';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  private readonly favoritePlantIds: WritableSignal<number[]> = signal<number[]>([]);
  private readonly userId = this.readUserIdFromExampleJson();

  public readonly browserStorageNamespace: string = this.userId;

  public readonly favoriteIds: Signal<number[]> = this.favoritePlantIds.asReadonly();

  public constructor() {
    this.loadFromStorageOrSeed();
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

  private loadFromStorageOrSeed(): void {
    const stored = this.readFavoritePlantsFromStorage();
    if (stored !== null) {
      this.favoritePlantIds.set(stored);
      return;
    }

    const seed = this.readFavoritePlantsSeedFromExampleJson();
    this.favoritePlantIds.set(seed);
    this.persistFavoritePlants(seed);
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
    return `${FAVORITE_PLANTS_STORAGE_KEY_PREFIX}.${this.userId}`;
  }

  private readUserIdFromExampleJson(): string {
    const data = ExampleJson as unknown as { user_id?: unknown };
    return typeof data?.user_id === 'string' && data.user_id.trim()
      ? data.user_id.trim()
      : FALLBACK_USER_ID;
  }

  private readFavoritePlantsSeedFromExampleJson(): number[] {
    const data = ExampleJson as unknown as { favorite_plants?: unknown };
    const seed = data?.favorite_plants;
    if (!Array.isArray(seed)) {
      return [];
    }
    return seed.filter((id): id is number => typeof id === 'number' && Number.isFinite(id));
  }
}
