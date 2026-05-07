import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, of, tap } from 'rxjs';
import ExampleJson from '../../example-json';
import { GreenhousesData } from '../../interfaces/greenhouses-data.interface';

const GREENHOUSES_API_URL = '/api/greenhouses';

@Injectable({
  providedIn: 'root',
})
export class GreenhousesDataService {
  private readonly http = inject(HttpClient);

  public readonly greenhouses = signal<GreenhousesData>(
    ExampleJson as unknown as GreenhousesData,
  );
  public readonly isLoading = signal<boolean>(false);
  public readonly loadError = signal<string | null>(null);

  public constructor() {
    this.fetchGreenhousesData();
  }

  public fetchGreenhousesData(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.http
      .get<GreenhousesData>(GREENHOUSES_API_URL)
      .pipe(
        tap((data) => this.greenhouses.set(data)),
        catchError((error: unknown) => {
          this.loadError.set(
            error instanceof Error ? error.message : 'Failed to fetch greenhouse data',
          );

          return of(this.greenhouses());
        }),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe();
  }
}
