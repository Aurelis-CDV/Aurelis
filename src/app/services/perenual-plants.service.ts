import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PerenualPlantDetails, PerenualPlantListResponse } from '../../interfaces/perenual.interface';

@Injectable({
  providedIn: 'root',
})
export class PerenualPlantsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = process.env['GUIDES_BASE_API_URL'] || '';
  private readonly apiKey = process.env['GUIDES_API_KEY'] || '';

  public getPlantsList(page: number = 1): Observable<PerenualPlantListResponse> {
    return this.http.get<PerenualPlantListResponse>(`${this.baseUrl}v2/species-list`, {
      params: {
        key: this.apiKey,
        page: String(page),
      },
    });
  }

  public searchPlants(query: string, page: number = 1): Observable<PerenualPlantListResponse> {
    return this.http.get<PerenualPlantListResponse>(`${this.baseUrl}v2/species-list`, {
      params: {
        key: this.apiKey,
        q: query,
        page: String(page),
      },
    });
  }

  public getPlantDetails(plantId: number): Observable<PerenualPlantDetails> {
    console.log(`${this.baseUrl}v2/species/details/${plantId}?key=${this.apiKey}`);
    return this.http.get<PerenualPlantDetails>(
      `${this.baseUrl}v2/species/details/${plantId}?key=${this.apiKey}`,
      {
        params: {
          key: this.apiKey,
        },
      },
    );
  }
}
