import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

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
    const key = process.env['WEATHER_API_KEY'] || '';
    const q = query.trim();
    if (!key || q.length < 2) {
      return of([]);
    }

    const params = new HttpParams().set('key', key).set('q', q);
    return this.http
      .get<WeatherSearchItem[]>(SEARCH_URL, { params })
      .pipe(catchError(() => of([])));
  }

  public getCurrentConditions(
    lat: number,
    lon: number,
  ): Observable<{
    temperatureC: number;
    humidityPercent: number;
  }> {
    return this.getCurrentByQuery(`${lat},${lon}`);
  }

  public getCurrentConditionsByLocationQuery(query: string): Observable<{
    temperatureC: number;
    humidityPercent: number;
  }> {
    const q = query.trim();
    if (!q) {
      return throwError(() => new Error('Weather location query is empty'));
    }
    return this.getCurrentByQuery(q);
  }

  private getCurrentByQuery(q: string): Observable<{
    temperatureC: number;
    humidityPercent: number;
  }> {
    const key = process.env['WEATHER_API_KEY'] || '';
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
