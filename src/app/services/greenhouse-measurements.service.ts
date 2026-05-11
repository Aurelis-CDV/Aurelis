import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/** Row from `GET /api/greenhouses/{id}/measurements` (API uses PascalCase). */
export interface GreenhouseMeasurementDto {
  SensorCode?: string;
  SensorType?: string;
  Value?: number;
  TimestampUnix?: number;
}

export type PlantSoilChartPoint = { date: string; value: number };

/** Map app `plant.id` to API `SensorCode` (e.g. `1` → `soil_moisture_1`). Returns `null` if no sensor can be inferred. */
export function soilMoistureSensorCodeForPlantId(plantId: string): string | null {
  const t = plantId.trim();
  if (/^\d+$/.test(t)) {
    return `soil_moisture_${t}`;
  }
  const suffix = t.match(/(?:^|_)soil_moisture[_]?(\d+)$/i);
  if (suffix) {
    return `soil_moisture_${suffix[1]}`;
  }
  const trailing = t.match(/(\d+)$/);
  if (trailing) {
    return `soil_moisture_${trailing[1]}`;
  }
  return null;
}

@Injectable({
  providedIn: 'root',
})
export class GreenhouseMeasurementsService {
  private readonly http = inject(HttpClient);

  /**
   * Soil moisture time series for one plant slot. Uses `from` / `to` as **Unix seconds** (API contract).
   * Filters `sensor_type=soil_moisture` then keeps rows whose `SensorCode` matches the plant’s sensor.
   */
  public fetchPlantSoilMoistureSeries(
    greenhouseId: string,
    plantId: string,
    fromUnixSec: number,
    toUnixSec: number,
  ): Observable<PlantSoilChartPoint[]> {
    const sensor = soilMoistureSensorCodeForPlantId(plantId);
    if (!sensor) {
      return of([]);
    }

    const from = Math.floor(Math.min(fromUnixSec, toUnixSec));
    const to = Math.floor(Math.max(fromUnixSec, toUnixSec));

    const params = new HttpParams()
      .set('from', String(from))
      .set('to', String(to))
      .set('sensor_type', 'soil_moisture');

    const url = `${environment.greenhouseApiBaseUrl}/api/greenhouses/${encodeURIComponent(greenhouseId)}/measurements`;

    return this.http.get<GreenhouseMeasurementDto[]>(url, { params }).pipe(
      map((rows) => {
        if (!Array.isArray(rows)) {
          return [];
        }
        const filtered = rows.filter((r) => r.SensorCode === sensor && typeof r.TimestampUnix === 'number');
        filtered.sort((a, b) => (a.TimestampUnix ?? 0) - (b.TimestampUnix ?? 0));
        return filtered.map((r) => ({
          date: formatUnixSecForChartAxis(r.TimestampUnix ?? 0, to - from),
          value: typeof r.Value === 'number' && Number.isFinite(r.Value) ? r.Value : 0,
        }));
      }),
    );
  }
}

function formatUnixSecForChartAxis(tsSec: number, rangeSpanSec: number): string {
  const d = new Date(tsSec * 1000);
  if (rangeSpanSec <= 3600) {
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  if (rangeSpanSec <= 86400 * 2) {
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
}
