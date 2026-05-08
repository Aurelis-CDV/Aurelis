import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  PerenualPlantDetails,
  PerenualPlantListResponse,
} from '../../interfaces/perenual.interface';

const PERENUAL_API_BASE_URL = `https://perenual.com/api/`;
const PERENUAL_API_KEY = 'sk-Ez2n69fdbc69cd10417097';
@Injectable({
  providedIn: 'root',
})
export class PerenualPlantsService {
  private readonly http = inject(HttpClient);
  private readonly apiKey = PERENUAL_API_KEY;

  public getPlantsList(page: number = 1): Observable<PerenualPlantListResponse> {
    return this.http.get<PerenualPlantListResponse>(`${PERENUAL_API_BASE_URL}v2/species-list`, {
      params: {
        key: this.apiKey,
        page: String(page),
      },
    });
  }

  public searchPlants(query: string, page: number = 1): Observable<PerenualPlantListResponse> {
    return this.http.get<PerenualPlantListResponse>(`${PERENUAL_API_BASE_URL}v2/species-list`, {
      params: {
        key: this.apiKey,
        q: query,
        page: String(page),
      },
    });
  }

  public getPlantDetails(plantId: number): Observable<PerenualPlantDetails> {
    console.log(`${PERENUAL_API_BASE_URL}v2/species/details/${plantId}?key=${this.apiKey}`);
    return this.http.get<PerenualPlantDetails>(
      `${PERENUAL_API_BASE_URL}v2/species/details/${plantId}?key=${this.apiKey}`,
      {
        params: {
          key: this.apiKey,
        },
      },
    );
  }
}
