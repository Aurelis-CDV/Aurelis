import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { UserDataService } from './user-data.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  GreenhouseData,
  GreenhouseGeoLocation,
  GreenhouseParam,
  GreenhousesData,
} from '../../interfaces/greenhouses-data.interface';
import { PlantData } from '../../interfaces/plant-data.interface';
import { derivePlantCondition, enrichGreenhouseWithDerivedPlantConditions } from '../utils/derive-plant-condition';

/** Raw JSON from `GET .../greenhouses/{id}/frontend` (field names may differ from app models). */
interface GreenhouseFrontendApiDto {
  name?: unknown;
  id?: unknown;
  preview_url?: unknown;
  localisation?: unknown;
  location?: unknown;
  params?: unknown;
  plants?: unknown;
}

interface GreenhouseParamApiDto {
  name?: unknown;
  current?: unknown;
  history?: unknown;
}

interface PlantApiDto {
  name?: unknown;
  id?: unknown;
  preview_url?: unknown;
  soil_moisture?: unknown;
  soil_moisture_history?: unknown;
  watering_history?: unknown;
}

function asFiniteNumber(v: unknown, fallback = 0): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

function asNonEmptyString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function normalizeParamHistory(
  history: unknown,
): Array<{ date: string; value: number }> {
  if (!Array.isArray(history)) {
    return [];
  }
  const out: Array<{ date: string; value: number }> = [];
  for (const row of history) {
    if (!row || typeof row !== 'object') {
      continue;
    }
    const r = row as { date?: unknown; value?: unknown };
    const date = typeof r.date === 'string' ? r.date : '';
    const value = asFiniteNumber(r.value, 0);
    out.push({ date, value });
  }
  return out;
}

function normalizeGreenhouseParamsFromApi(raw: unknown): GreenhouseParam[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: GreenhouseParam[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    const p = item as GreenhouseParamApiDto;
    const name = asNonEmptyString(p.name, 'unknown');
    out.push({
      name,
      current: asFiniteNumber(p.current, 0),
      history: normalizeParamHistory(p.history),
    });
  }
  return out;
}

function normalizePlantFromApi(
  raw: unknown,
  greenhouseAir: { temperatureC: number; airHumidityPercent: number },
): PlantData | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const p = raw as PlantApiDto;
  const id = p.id != null && String(p.id).trim() ? String(p.id).trim() : '';
  if (!id) {
    return null;
  }
  const soilHistory = normalizeParamHistory(p.soil_moisture_history);
  const wh = Array.isArray(p.watering_history)
    ? p.watering_history.filter((x): x is number => typeof x === 'number' && Number.isFinite(x))
    : [];

  const soil = asFiniteNumber(p.soil_moisture, 0);

  return {
    name: asNonEmptyString(p.name, '').trim() || 'Plant',
    id,
    preview_url: asNonEmptyString(p.preview_url, '').trim(),
    soil_moisture: soil,
    condition: derivePlantCondition(
      greenhouseAir.temperatureC,
      soil,
      greenhouseAir.airHumidityPercent,
    ),
    soil_moisture_history: soilHistory,
    watering_history: wh,
  };
}

function normalizePlantsFromApi(raw: unknown, params: GreenhouseParam[]): PlantData[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const temp = params.find((q) => q.name === 'temperature')?.current;
  const air = params.find((q) => q.name === 'humidity')?.current;
  const temperatureC = typeof temp === 'number' && Number.isFinite(temp) ? temp : NaN;
  const airHumidityPercent = typeof air === 'number' && Number.isFinite(air) ? air : NaN;
  const greenhouseAir = { temperatureC, airHumidityPercent };

  const out: PlantData[] = [];
  for (const item of raw) {
    const plant = normalizePlantFromApi(item, greenhouseAir);
    if (plant) {
      out.push(plant);
    }
  }
  return out;
}

function parseLocationFromApi(dto: GreenhouseFrontendApiDto): GreenhouseGeoLocation {
  const loc = dto.location;
  if (loc && typeof loc === 'object') {
    const o = loc as Record<string, unknown>;
    const name = typeof o['name'] === 'string' ? o['name'].trim() : '';
    const lat = o['lat'];
    const lon = o['lon'];
    if (
      typeof lat === 'number' &&
      Number.isFinite(lat) &&
      typeof lon === 'number' &&
      Number.isFinite(lon)
    ) {
      return { name: name || 'Unknown', lat, lon };
    }
  }

  const label =
    (typeof dto.localisation === 'string' && dto.localisation.trim()) ||
    (loc &&
    typeof loc === 'object' &&
    typeof (loc as { name?: unknown }).name === 'string' &&
    String((loc as { name: string }).name).trim()) ||
    'Unknown';

  return {
    name: typeof label === 'string' ? label : 'Unknown',
    lat: 0,
    lon: 0,
  };
}

function normalizeGreenhouseFromFrontendApi(dto: GreenhouseFrontendApiDto): GreenhouseData {
  const name = asNonEmptyString(dto.name, '').trim() || 'Greenhouse';
  const idRaw = dto.id;
  const id = idRaw != null && String(idRaw).trim() ? String(idRaw).trim() : '0';
  const params = normalizeGreenhouseParamsFromApi(dto.params);

  return {
    name,
    id,
    preview_url: asNonEmptyString(dto.preview_url, '').trim(),
    location: parseLocationFromApi(dto),
    params,
    plants: normalizePlantsFromApi(dto.plants, params),
  };
}

export type AddPlantResult =
  | { ok: true }
  | {
      ok: false;
      reason: 'greenhouse_not_found' | 'greenhouse_full' | 'duplicate_plant_id' | 'request_failed';
    };

export type UpdatePlantResult =
  | { ok: true }
  | { ok: false; reason: 'greenhouse_not_found' | 'plant_not_found' | 'request_failed' };

export type DeletePlantResult =
  | { ok: true }
  | { ok: false; reason: 'greenhouse_not_found' | 'plant_not_found' | 'request_failed' };

export type AddGreenhouseResult =
  | { ok: true }
  | {
      ok: false;
      reason: 'duplicate_greenhouse_id' | 'dashboard_full' | 'request_failed';
    };

export type UpdateGreenhouseResult =
  | { ok: true }
  | { ok: false; reason: 'greenhouse_not_found' | 'request_failed' };

export type DeleteGreenhouseResult =
  | { ok: true }
  | { ok: false; reason: 'greenhouse_not_found' | 'request_failed' };

export const MAX_GREENHOUSES_IN_DASHBOARD = 6;

const PLANT_WATERING_HISTORY_STORAGE_PREFIX = 'aurelis.plant_watering_history';
const PLANT_WATERING_KEY_SEP = '\x1e';

function wateringHistoryCompoundKey(greenhouseId: string, plantId: string): string {
  return `${greenhouseId}${PLANT_WATERING_KEY_SEP}${plantId}`;
}

type PersistedPlantWateringMap = Record<string, number[]>;

function defaultGreenhouseParams(): GreenhouseParam[] {
  return [
    { name: 'humidity', current: 0, history: [] },
    { name: 'temperature', current: 0, history: [] },
    { name: 'light', current: 0, history: [] },
  ];
}

@Injectable({
  providedIn: 'root',
})
export class GreenhousesDataService {
  private readonly http = inject(HttpClient);
  private readonly userDataService = inject(UserDataService);

  public readonly greenhousesData: WritableSignal<GreenhousesData> = signal<GreenhousesData>([]);
  public readonly isLoading: WritableSignal<boolean> = signal<boolean>(false);
  public readonly loadError = signal<string | null>(null);

  public constructor() {
    this.fetchGreenhousesData();
  }

  public addPlantToGreenhouse(
    greenhouseId: string,
    input: { name: string; id: string; preview_url: string },
  ): Observable<AddPlantResult> {
    const name = input.name.trim();
    const id = input.id.trim();
    const preview_url = input.preview_url.trim();

    const validation = this.validateAddPlant(greenhouseId, { name, id, preview_url });
    if (validation) {
      return of(validation);
    }

    this.applyPlantLocally(greenhouseId, { name, id, preview_url });
    return new BehaviorSubject<AddPlantResult>({ ok: true }).asObservable();
  }

  public updatePlantInGreenhouse(
    greenhouseId: string,
    plantId: string,
    input: { name: string; preview_url: string },
  ): Observable<UpdatePlantResult> {
    const name = input.name.trim();
    const preview_url = input.preview_url.trim();

    const validation = this.validateUpdatePlant(greenhouseId, plantId, { name, preview_url });
    if (validation) {
      return of(validation);
    }

    this.applyPlantUpdateLocally(greenhouseId, plantId, { name, preview_url });
    return new BehaviorSubject<UpdatePlantResult>({ ok: true }).asObservable();
  }

  public deletePlantFromGreenhouse(
    greenhouseId: string,
    plantId: string,
  ): Observable<DeletePlantResult> {
    const validation = this.validateDeletePlant(greenhouseId, plantId);
    if (validation) {
      return of(validation);
    }

    this.applyPlantDeleteLocally(greenhouseId, plantId);
    return new BehaviorSubject<DeletePlantResult>({ ok: true }).asObservable();
  }

  public addGreenhouse(input: {
    name: string;
    id: string;
    preview_url: string;
    location: GreenhouseGeoLocation;
  }): Observable<AddGreenhouseResult> {
    const name = input.name.trim();
    const id = input.id.trim();
    const preview_url = input.preview_url.trim();
    const location: GreenhouseGeoLocation = {
      name: input.location.name.trim(),
      lat: input.location.lat,
      lon: input.location.lon,
    };

    const validation = this.validateAddGreenhouse({ name, id, preview_url, location });

    if (validation) {
      return of(validation);
    }

    this.applyGreenhouseLocally({
      name,
      id,
      preview_url,
      location,
    });
    return new BehaviorSubject<AddGreenhouseResult>({ ok: true }).asObservable();
  }

  public updateGreenhouse(
    greenhouseId: string,
    input: {
      name: string;
      preview_url: string;
      location: GreenhouseGeoLocation;
    },
  ): Observable<UpdateGreenhouseResult> {
    const name = input.name.trim();
    const preview_url = input.preview_url.trim();
    const location: GreenhouseGeoLocation = {
      name: input.location.name.trim(),
      lat: input.location.lat,
      lon: input.location.lon,
    };

    const validation = this.validateUpdateGreenhouse(greenhouseId, { name, preview_url, location });
    if (validation) {
      return of(validation);
    }

    this.applyGreenhouseUpdateLocally(greenhouseId, { name, preview_url, location });
    return new BehaviorSubject<UpdateGreenhouseResult>({ ok: true }).asObservable();
  }

  public deleteGreenhouse(greenhouseId: string): Observable<DeleteGreenhouseResult> {
    const validation = this.validateDeleteGreenhouse(greenhouseId);
    if (validation) {
      return of(validation);
    }

    this.applyGreenhouseDeleteLocally(greenhouseId);
    return new BehaviorSubject<DeleteGreenhouseResult>({ ok: true }).asObservable();
  }

  public fetchGreenhousesData(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    const base = environment.greenhouseApiBaseUrl.replace(/\/$/, '');
    const id = environment.greenhouseServerId;
    const frontendUrl = `${base}/api/greenhouses/${id}/frontend?from=0&to=9999999999`;

    this.http
      .get<GreenhouseFrontendApiDto>(frontendUrl)
      .pipe(
        tap((dto) => {
          const gh = normalizeGreenhouseFromFrontendApi(dto);
          const list: GreenhousesData = [{ ...gh, id: String(id) }];
          this.greenhousesData.set(this.mergeWateringHistoryFromStorage(list));
          this.loadError.set(null);
        }),
        catchError(() => {
          this.loadError.set('Could not load greenhouse data from the server.');
          this.greenhousesData.set([]);
          return of(undefined);
        }),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe();
  }

  private validateAddPlant(
    greenhouseId: string,
    fields: { name: string; id: string; preview_url: string },
  ): AddPlantResult | null {
    const { id } = fields;
    const greenhouses = this.greenhousesData();
    const index = greenhouses.findIndex((gh) => gh.id === greenhouseId);
    if (index < 0) {
      return { ok: false, reason: 'greenhouse_not_found' };
    }

    const greenhouse = greenhouses[index];
    if (greenhouse.plants.length >= 6) {
      return { ok: false, reason: 'greenhouse_full' };
    }

    if (greenhouse.plants.some((plant) => plant.id === id)) {
      return { ok: false, reason: 'duplicate_plant_id' };
    }

    return null;
  }

  private validateUpdatePlant(
    greenhouseId: string,
    plantId: string,
    _fields: { name: string; preview_url: string },
  ): UpdatePlantResult | null {
    const greenhouses = this.greenhousesData();
    const ghIndex = greenhouses.findIndex((gh) => gh.id === greenhouseId);
    if (ghIndex < 0) {
      return { ok: false, reason: 'greenhouse_not_found' };
    }
    const plantExists = greenhouses[ghIndex].plants.some((p) => p.id === plantId);
    if (!plantExists) {
      return { ok: false, reason: 'plant_not_found' };
    }
    return null;
  }

  private applyPlantUpdateLocally(
    greenhouseId: string,
    plantId: string,
    fields: { name: string; preview_url: string },
  ): void {
    this.greenhousesData.update((greenhouses) =>
      this.withDerivedPlantConditions(
        greenhouses.map((gh): GreenhouseData => {
          if (gh.id !== greenhouseId) {
            return gh;
          }
          const plants = gh.plants.map((plant): PlantData => {
            if (plant.id !== plantId) {
              return plant;
            }
            return { ...plant, name: fields.name, preview_url: fields.preview_url };
          });
          return { ...gh, plants };
        }),
      ),
    );
  }

  private validateDeletePlant(greenhouseId: string, plantId: string): DeletePlantResult | null {
    const greenhouses = this.greenhousesData();
    const ghIndex = greenhouses.findIndex((gh) => gh.id === greenhouseId);
    if (ghIndex < 0) {
      return { ok: false, reason: 'greenhouse_not_found' };
    }
    const plantExists = greenhouses[ghIndex].plants.some((p) => p.id === plantId);
    if (!plantExists) {
      return { ok: false, reason: 'plant_not_found' };
    }
    return null;
  }

  private applyPlantDeleteLocally(greenhouseId: string, plantId: string): void {
    this.removePersistedWateringForPlantKeys(greenhouseId, plantId);

    this.greenhousesData.update((greenhouses) =>
      this.withDerivedPlantConditions(
        greenhouses.map((gh): GreenhouseData => {
          if (gh.id !== greenhouseId) {
            return gh;
          }
          return { ...gh, plants: gh.plants.filter((p) => p.id !== plantId) };
        }),
      ),
    );
  }

  private applyPlantLocally(
    greenhouseId: string,
    fields: { name: string; id: string; preview_url: string },
  ): void {
    const { name, id, preview_url } = fields;

    this.greenhousesData.update((greenhouses) => {
      const index = greenhouses.findIndex((gh) => gh.id === greenhouseId);

      if (index < 0) {
        return greenhouses;
      }
      const greenhouse = greenhouses[index];
      const temp = greenhouse.params.find((p) => p.name === 'temperature')?.current;
      const hum = greenhouse.params.find((p) => p.name === 'humidity')?.current;
      const temperatureC = typeof temp === 'number' && Number.isFinite(temp) ? temp : NaN;
      const airHumidityPercent = typeof hum === 'number' && Number.isFinite(hum) ? hum : NaN;

      const newPlant: PlantData = {
        name,
        id,
        preview_url,
        soil_moisture: 0,
        condition: derivePlantCondition(temperatureC, 0, airHumidityPercent),
        soil_moisture_history: [],
        watering_history: [],
      };

      const next = [...greenhouses];
      next[index] = { ...greenhouse, plants: [...greenhouse.plants, newPlant] };

      return this.withDerivedPlantConditions(next);
    });
  }

  private validateAddGreenhouse(fields: {
    name: string;
    id: string;
    preview_url: string;
    location: GreenhouseGeoLocation;
  }): AddGreenhouseResult | null {
    const { id } = fields;
    const greenhouses = this.greenhousesData();

    if (greenhouses.length >= MAX_GREENHOUSES_IN_DASHBOARD) {
      return { ok: false, reason: 'dashboard_full' };
    }

    if (greenhouses.some((gh) => gh.id === id)) {
      return { ok: false, reason: 'duplicate_greenhouse_id' };
    }

    return null;
  }

  public appendPlantWatering(greenhouseId: string, plantId: string, unixSeconds: number): void {
    if (!Number.isFinite(unixSeconds)) {
      return;
    }

    this.applyAppendPlantWateringLocally(greenhouseId, plantId, unixSeconds);
  }

  public removePlantWateringsOnLocalCalendarDay(
    greenhouseId: string,
    plantId: string,
    calendarDay: Date,
  ): void {
    const targetKey = this.toLocalCalendarDateKey(calendarDay);

    this.applyRemovePlantWateringsForLocalDateKeyLocally(greenhouseId, plantId, targetKey);
  }

  private applyAppendPlantWateringLocally(
    greenhouseId: string,
    plantId: string,
    unixSeconds: number,
  ): void {
    this.greenhousesData.update((greenhouses) =>
      greenhouses.map((greenhouse): GreenhouseData => {
        if (greenhouse.id !== greenhouseId) {
          return greenhouse;
        }

        const plants = greenhouse.plants.map((plant): PlantData => {
          if (plant.id !== plantId) {
            return plant;
          }

          const nextHistory = [...plant.watering_history, unixSeconds];

          return { ...plant, watering_history: nextHistory };
        });

        return { ...greenhouse, plants };
      }),
    );
    this.persistCurrentWateringForPlant(greenhouseId, plantId);
  }

  private applyRemovePlantWateringsForLocalDateKeyLocally(
    greenhouseId: string,
    plantId: string,
    localCalendarDateKey: string,
  ): void {
    this.greenhousesData.update((greenhouses) =>
      greenhouses.map((greenhouse): GreenhouseData => {
        if (greenhouse.id !== greenhouseId) {
          return greenhouse;
        }

        const plants = greenhouse.plants.map((plant): PlantData => {
          if (plant.id !== plantId) {
            return plant;
          }

          const nextHistory = plant.watering_history.filter(
            (unixSeconds) =>
              this.toLocalCalendarDateKeyFromUnix(unixSeconds) !== localCalendarDateKey,
          );

          return { ...plant, watering_history: nextHistory };
        });

        return { ...greenhouse, plants };
      }),
    );
    this.persistCurrentWateringForPlant(greenhouseId, plantId);
  }

  private toLocalCalendarDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private toLocalCalendarDateKeyFromUnix(unixSeconds: number): string {
    const timestampMs =
      Math.abs(unixSeconds) < 1_000_000_000_000 ? unixSeconds * 1000 : unixSeconds;

    return this.toLocalCalendarDateKey(new Date(timestampMs));
  }

  private applyGreenhouseLocally(input: {
    name: string;
    id: string;
    preview_url: string;
    location: GreenhouseGeoLocation;
  }): void {
    const newGh: GreenhouseData = {
      name: input.name,
      id: input.id,
      preview_url: input.preview_url,
      location: input.location,
      params: defaultGreenhouseParams(),
      plants: [],
    };

    this.greenhousesData.update((greenhouses) =>
      this.withDerivedPlantConditions([...greenhouses, newGh]),
    );
  }

  private validateUpdateGreenhouse(
    greenhouseId: string,
    _fields: { name: string; preview_url: string; location: GreenhouseGeoLocation },
  ): UpdateGreenhouseResult | null {
    const exists = this.greenhousesData().some((gh) => gh.id === greenhouseId);
    if (!exists) {
      return { ok: false, reason: 'greenhouse_not_found' };
    }
    return null;
  }

  private applyGreenhouseUpdateLocally(
    greenhouseId: string,
    fields: { name: string; preview_url: string; location: GreenhouseGeoLocation },
  ): void {
    this.greenhousesData.update((greenhouses) =>
      greenhouses.map((gh) =>
        gh.id === greenhouseId
          ? { ...gh, name: fields.name, preview_url: fields.preview_url, location: fields.location }
          : gh,
      ),
    );
  }

  private validateDeleteGreenhouse(greenhouseId: string): DeleteGreenhouseResult | null {
    const exists = this.greenhousesData().some((gh) => gh.id === greenhouseId);
    if (!exists) {
      return { ok: false, reason: 'greenhouse_not_found' };
    }
    return null;
  }

  private applyGreenhouseDeleteLocally(greenhouseId: string): void {
    this.removePersistedWateringForGreenhousePrefix(greenhouseId);
    this.greenhousesData.update((greenhouses) =>
      greenhouses.filter((gh) => gh.id !== greenhouseId),
    );
  }

  private withDerivedPlantConditions(greenhouses: GreenhousesData): GreenhousesData {
    return greenhouses.map((gh) => enrichGreenhouseWithDerivedPlantConditions(gh));
  }

  private get plantWateringStorageKey(): string {
    return `${PLANT_WATERING_HISTORY_STORAGE_PREFIX}.${this.userDataService.browserStorageNamespace}`;
  }

  private readWateringHistoryMapFromStorage(): PersistedPlantWateringMap | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    try {
      const raw = window.localStorage.getItem(this.plantWateringStorageKey);
      if (!raw) {
        return null;
      }
      const parsed: unknown = JSON.parse(raw);
      if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return null;
      }
      return parsed as PersistedPlantWateringMap;
    } catch {
      return null;
    }
  }

  private writeWateringHistoryMapToStorage(map: PersistedPlantWateringMap): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    try {
      window.localStorage.setItem(this.plantWateringStorageKey, JSON.stringify(map));
    } catch {}
  }

  /** Clears locally persisted watering history for the current Auth0 user (this device only). */
  public clearPersistedWateringHistory(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    try {
      window.localStorage.removeItem(this.plantWateringStorageKey);
    } catch {}
  }

  private normalizeWateringHistory(value: unknown): number[] | null {
    if (!Array.isArray(value)) {
      return null;
    }
    return value.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  }

  private mergeWateringHistoryFromStorage(seed: GreenhousesData): GreenhousesData {
    const persisted = this.readWateringHistoryMapFromStorage();
    if (!persisted) {
      return seed;
    }

    return seed.map(
      (gh): GreenhouseData => ({
        ...gh,
        plants: gh.plants.map((plant): PlantData => {
          const compoundKey = wateringHistoryCompoundKey(gh.id, plant.id);
          if (!Object.prototype.hasOwnProperty.call(persisted, compoundKey)) {
            return plant;
          }
          const normalized = this.normalizeWateringHistory(persisted[compoundKey]);
          if (normalized === null) {
            return plant;
          }
          return { ...plant, watering_history: [...normalized].sort((a, b) => a - b) };
        }),
      }),
    );
  }

  private persistCurrentWateringForPlant(greenhouseId: string, plantId: string): void {
    const greenhouses = this.greenhousesData();
    const greenhouse = greenhouses.find((gh) => gh.id === greenhouseId);
    const plant = greenhouse?.plants.find((p) => p.id === plantId);

    if (!plant) {
      return;
    }

    const key = wateringHistoryCompoundKey(greenhouseId, plantId);
    const stored = this.readWateringHistoryMapFromStorage() ?? {};
    stored[key] = [...plant.watering_history];
    this.writeWateringHistoryMapToStorage(stored);
  }

  private removePersistedWateringForPlantKeys(greenhouseId: string, plantId: string): void {
    const map = this.readWateringHistoryMapFromStorage();

    if (!map) {
      return;
    }

    delete map[wateringHistoryCompoundKey(greenhouseId, plantId)];
    this.writeWateringHistoryMapToStorage(map);
  }

  private removePersistedWateringForGreenhousePrefix(greenhouseId: string): void {
    const map = this.readWateringHistoryMapFromStorage();

    if (!map) {
      return;
    }

    const prefix = `${greenhouseId}${PLANT_WATERING_KEY_SEP}`;

    for (const k of Object.keys(map)) {
      if (k.startsWith(prefix)) {
        delete map[k];
      }
    }

    this.writeWateringHistoryMapToStorage(map);
  }
}
