import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import ExampleJson from '../../example-json';
import {
  GreenhouseData,
  GreenhouseGeoLocation,
  GreenhouseParam,
  GreenhousesData,
} from '../../interfaces/greenhouses-data.interface';
import { PlantData } from '../../interfaces/plant-data.interface';

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

export interface CreatePlantRequestBody {
  name: string;
  id: string;
  preview_url: string;
}

export interface UpdatePlantRequestBody {
  name: string;
  preview_url: string;
}

export interface CreateGreenhouseRequestBody {
  name: string;
  id: string;
  preview_url: string;
  location: GreenhouseGeoLocation;
}

export interface UpdateGreenhouseRequestBody {
  name: string;
  preview_url: string;
  location: GreenhouseGeoLocation;
}

export const MAX_GREENHOUSES_IN_DASHBOARD = 6;

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

    //____________________________________________________________________
    this.applyPlantLocally(greenhouseId, { name, id, preview_url });
    return new BehaviorSubject<AddPlantResult>({ ok: true }).asObservable();
    //____________________________________________________________________

    //TODO: If API accepts adding new plant to greenhouse
    // const body: CreatePlantRequestBody = { name, id, preview_url };
    // const url = this.greenhouseUrl(`greenhouses/${encodeURIComponent(greenhouseId)}/plants`);
    // return this.http.post(url, body).pipe(
    //   map(() => {
    //     this.applyPlantLocally(greenhouseId, { name, id, preview_url });
    //     return { ok: true } as AddPlantResult;
    //   }),
    //   catchError(() => of({ ok: false, reason: 'request_failed' } as const)),
    // );
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

    //____________________________________________________________________
    this.applyPlantUpdateLocally(greenhouseId, plantId, { name, preview_url });
    return new BehaviorSubject<UpdatePlantResult>({ ok: true }).asObservable();
    //____________________________________________________________________

    //TODO: When API accepts plant updates
    // const body: UpdatePlantRequestBody = { name, preview_url };
    // const url = this.greenhouseUrl(
    //   `greenhouses/${encodeURIComponent(greenhouseId)}/plants/${encodeURIComponent(plantId)}`,
    // );
    //
    // return this.http.put(url, body).pipe(
    //   map(() => {
    //     this.applyPlantUpdateLocally(greenhouseId, plantId, { name, preview_url });
    //     return { ok: true } as UpdatePlantResult;
    //   }),
    //   catchError(() => of({ ok: false, reason: 'request_failed' } as const)),
    // );
  }

  public deletePlantFromGreenhouse(
    greenhouseId: string,
    plantId: string,
  ): Observable<DeletePlantResult> {
    const validation = this.validateDeletePlant(greenhouseId, plantId);
    if (validation) {
      return of(validation);
    }

    //____________________________________________________________________
    this.applyPlantDeleteLocally(greenhouseId, plantId);
    return new BehaviorSubject<DeletePlantResult>({ ok: true }).asObservable();
    //____________________________________________________________________

    //TODO: When API accepts plant deletion
    // const url = this.greenhouseUrl(
    //   `greenhouses/${encodeURIComponent(greenhouseId)}/plants/${encodeURIComponent(plantId)}`,
    // );
    //
    // return this.http.delete(url).pipe(
    //   map(() => {
    //     this.applyPlantDeleteLocally(greenhouseId, plantId);
    //     return { ok: true } as DeletePlantResult;
    //   }),
    //   catchError(() => of({ ok: false, reason: 'request_failed' } as const)),
    // );
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

    //____________________________________________________________________
    this.applyGreenhouseLocally({
      name,
      id,
      preview_url,
      location,
    });
    return new BehaviorSubject<AddGreenhouseResult>({ ok: true }).asObservable();
    //____________________________________________________________________

    //TODO: If API accepts adding new plant to greenhouse
    // const body: CreateGreenhouseRequestBody = {
    //   name,
    //   id,
    //   preview_url,
    //   location,
    // };
    //
    // const url = this.greenhouseUrl('greenhouses');
    //
    // return this.http.post(url, body).pipe(
    //   map(() => {
    //     this.applyGreenhouseLocally({
    //       name,
    //       id,
    //       preview_url,
    //       location,
    //     });
    //     return { ok: true } as AddGreenhouseResult;
    //   }),
    //   catchError(() => of({ ok: false, reason: 'request_failed' } as const)),
    // );
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

    //____________________________________________________________________
    this.applyGreenhouseUpdateLocally(greenhouseId, { name, preview_url, location });
    return new BehaviorSubject<UpdateGreenhouseResult>({ ok: true }).asObservable();
    //____________________________________________________________________

    //TODO: When API accepts greenhouse updates
    // const body: UpdateGreenhouseRequestBody = { name, preview_url, location };
    // const url = this.greenhouseUrl(`greenhouses/${encodeURIComponent(greenhouseId)}`);
    //
    // return this.http.put(url, body).pipe(
    //   map(() => {
    //     this.applyGreenhouseUpdateLocally(greenhouseId, { name, preview_url, location });
    //     return { ok: true } as UpdateGreenhouseResult;
    //   }),
    //   catchError(() => of({ ok: false, reason: 'request_failed' } as const)),
    // );
  }

  public deleteGreenhouse(greenhouseId: string): Observable<DeleteGreenhouseResult> {
    const validation = this.validateDeleteGreenhouse(greenhouseId);
    if (validation) {
      return of(validation);
    }

    //____________________________________________________________________
    this.applyGreenhouseDeleteLocally(greenhouseId);
    return new BehaviorSubject<DeleteGreenhouseResult>({ ok: true }).asObservable();
    //____________________________________________________________________

    //TODO: When API accepts greenhouse deletion
    // const url = this.greenhouseUrl(`greenhouses/${encodeURIComponent(greenhouseId)}`);
    //
    // return this.http.delete(url).pipe(
    //   map(() => {
    //     this.applyGreenhouseDeleteLocally(greenhouseId);
    //     return { ok: true } as DeleteGreenhouseResult;
    //   }),
    //   catchError(() => of({ ok: false, reason: 'request_failed' } as const)),
    // );
  }

  public fetchGreenhousesData(): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    const api =
      'https://greenhouse-api-python-zuzanna-bycnfkakf2emg8dt.canadacentral-01.azurewebsites.net/api/greenhouses/2/measurements/latest';
    this.greenhousesData.set(ExampleJson as unknown as GreenhousesData);

    //TODO: If API ready to fetch data
    // this.http
    //   .get<GreenhousesData>(api)
    //   .pipe(
    //     tap((data) => {
    //       console.log(data);
    //       this.greenhousesData.set(data);
    //     }),
    //     catchError((error: unknown) => {
    //       this.loadError.set(
    //         error instanceof Error ? error.message : 'Failed to fetch greenhouse data',
    //       );
    //
    //       return of(this.greenhousesData());
    //     }),
    //     finalize(() => this.isLoading.set(false)),
    //   )
    //   .subscribe();
  }

  public mapData(data: {
    MeasurementId: number;
    GreenhouseId: number;
    GreenhouseName: string;
    SensorId: 1;
    SensorCode: 'air_temperature_1';
    SensorName: 'Air temperature sensor 1';
    SensorLocation: 'sensor_1';
    SensorTypeId: 1;
    SensorType: 'air_temperature';
    Value: 25.1;
    Unit: 'C';
    TimestampUnix: 1778245214;
  }): any {}

  //TODO: watering API sync — restore `environment` import, `HttpErrorResponse`, `catchError`,
  // `tap` from `rxjs/operators`, optional `wateringApiError` + `wateringRequestErrorMessage()`, and
  // subscribe blocks in `appendPlantWatering` / `removePlantWateringsOnLocalCalendarDay`.
  // private greenhouseUrl(path: string): string {
  //   const base = environment.greenhouseApiBaseUrl.replace(/\/+$/, '');
  //   const suffix = path.replace(/^\/+/, '');
  //   return `${base}/${suffix}`;
  // }
  //
  // private postPlantWateringAppend(
  //   greenhouseId: string,
  //   plantId: string,
  //   timestampUnix: number,
  // ): Observable<unknown> {
  //   const url = this.greenhouseUrl(
  //     `greenhouses/${encodeURIComponent(greenhouseId)}/plants/${encodeURIComponent(
  //       plantId,
  //     )}/watering`,
  //   );
  //   return this.http.post(url, { timestamp_unix: timestampUnix });
  // }
  //
  // private postPlantWateringRemoveDay(
  //   greenhouseId: string,
  //   plantId: string,
  //   localCalendarDate: string,
  // ): Observable<unknown> {
  //   const url = this.greenhouseUrl(
  //     `greenhouses/${encodeURIComponent(greenhouseId)}/plants/${encodeURIComponent(
  //       plantId,
  //     )}/watering/remove-day`,
  //   );
  //   return this.http.post(url, { local_calendar_date: localCalendarDate });
  // }

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
    this.greenhousesData.update((greenhouses) =>
      greenhouses.map((gh): GreenhouseData => {
        if (gh.id !== greenhouseId) {
          return gh;
        }
        return { ...gh, plants: gh.plants.filter((p) => p.id !== plantId) };
      }),
    );
  }

  private applyPlantLocally(
    greenhouseId: string,
    fields: { name: string; id: string; preview_url: string },
  ): void {
    const { name, id, preview_url } = fields;
    const newPlant = {
      name,
      id,
      preview_url,
      soil_moisture: 0,
      condition: 'unknown',
      soil_moisture_history: [],
      watering_history: [],
    } as PlantData;

    this.greenhousesData.update((greenhouses) => {
      const index = greenhouses.findIndex((gh) => gh.id === greenhouseId);

      if (index < 0) {
        return greenhouses;
      }
      const greenhouse = greenhouses[index];
      const next = [...greenhouses];
      next[index] = { ...greenhouse, plants: [...greenhouse.plants, newPlant] };

      return next;
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

    // this.wateringApiError.set(null);
    // this.postPlantWateringAppend(greenhouseId, plantId, unixSeconds)
    //   .pipe(
    //     tap(() => this.applyAppendPlantWateringLocally(greenhouseId, plantId, unixSeconds)),
    //     catchError((err: unknown) => {
    //       this.wateringApiError.set(this.wateringRequestErrorMessage(err));
    //       return of(null);
    //     }),
    //   )
    //   .subscribe();
  }

  public removePlantWateringsOnLocalCalendarDay(
    greenhouseId: string,
    plantId: string,
    calendarDay: Date,
  ): void {
    const targetKey = this.toLocalCalendarDateKey(calendarDay);

    this.applyRemovePlantWateringsForLocalDateKeyLocally(greenhouseId, plantId, targetKey);

    // this.wateringApiError.set(null);
    // this.postPlantWateringRemoveDay(greenhouseId, plantId, targetKey)
    //   .pipe(
    //     tap(() =>
    //       this.applyRemovePlantWateringsForLocalDateKeyLocally(greenhouseId, plantId, targetKey),
    //     ),
    //     catchError((err: unknown) => {
    //       this.wateringApiError.set(this.wateringRequestErrorMessage(err));
    //       return of(null);
    //     }),
    //   )
    //   .subscribe();
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

    this.greenhousesData.update((greenhouses) => [...greenhouses, newGh]);
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
    this.greenhousesData.update((greenhouses) => greenhouses.filter((gh) => gh.id !== greenhouseId));
  }
}
