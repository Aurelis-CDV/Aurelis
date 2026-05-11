import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  PerenualDiseaseDetails,
  PerenualDiseaseListResponse,
  PerenualPlantDetails,
  PerenualPlantListResponse,
} from '../../interfaces/perenual.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PerenualPlantsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.guidesApiBaseUrl;
  private readonly apiKey = environment.guidesApiKey;

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

  public getDiseasesList(page: number = 1): Observable<PerenualDiseaseListResponse> {
    return this.http.get<PerenualDiseaseListResponse>(`${this.baseUrl}pest-disease-list`, {
      params: {
        key: this.apiKey,
        page: String(page),
      },
    });
  }

  public searchDiseases(query: string, page: number = 1): Observable<PerenualDiseaseListResponse> {
    return this.http.get<PerenualDiseaseListResponse>(`${this.baseUrl}pest-disease-list`, {
      params: {
        key: this.apiKey,
        q: query,
        page: String(page),
      },
    });
  }

  public getDiseaseDetails(diseaseId: number): Observable<PerenualDiseaseDetails> {
    return this.http.get<PerenualDiseaseDetails>(
      `${this.baseUrl}pest-disease/details/${diseaseId}`,
      {
        params: {
          key: this.apiKey,
        },
      },
    );
  }
}
