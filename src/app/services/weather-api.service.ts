import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

const SEARCH_URL = 'https://api.weatherapi.com/v1/search.json';
const CURRENT_URL = 'https://api.weatherapi.com/v1/current.json';

export interface WeatherSearchItem {
  id: number;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  url: string;
}

interface WeatherCurrentApiResponse {
  current: {
    temp_c: number;
    humidity: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class WeatherApiService {
  private readonly http = inject(HttpClient);

  public searchLocations(query: string): Observable<WeatherSearchItem[]> {
    const key = environment.weatherApiKey?.trim();
    const q = query.trim();
    if (!key || q.length < 2) {
      return of([]);
    }

    const params = new HttpParams().set('key', key).set('q', q);
    return this.http.get<WeatherSearchItem[]>(SEARCH_URL, { params }).pipe(
      catchError(() => of([])),
    );
  }

  public getCurrentConditions(lat: number, lon: number): Observable<{
    temperatureC: number;
    humidityPercent: number;
  }> {
    return this.getCurrentByQuery(`${lat},${lon}`);
  }

  /** Uses `current.json` with a free-text `q` (city/region name), e.g. when lat/lon are not stored. */
  public getCurrentByLocationQuery(query: string): Observable<{
    temperatureC: number;
    humidityPercent: number;
  }> {
    const trimmed = query.trim();
    if (!trimmed) {
      return throwError(() => new Error('Location query is empty'));
    }
    return this.getCurrentByQuery(trimmed);
  }

  private getCurrentByQuery(q: string): Observable<{
    temperatureC: number;
    humidityPercent: number;
  }> {
    const key = environment.weatherApiKey?.trim();
    if (!key) {
      return throwError(() => new Error('Weather API key is not configured'));
    }
    const params = new HttpParams().set('key', key).set('q', q);
    return this.http.get<WeatherCurrentApiResponse>(CURRENT_URL, { params }).pipe(
      map((res) => ({
        temperatureC: res.current.temp_c,
        humidityPercent: res.current.humidity,
      })),
    );
  }
}
