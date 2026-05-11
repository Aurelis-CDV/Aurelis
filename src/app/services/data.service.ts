import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, of, tap } from 'rxjs';
import ExampleJson from '../../example-json';
import { GreenhousesData } from '../../interfaces/greenhouses-data.interface';

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

  public fetchGreenhousesData(): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    const api =
      'https://greenhouse-api-python-zuzanna-bycnfkakf2emg8dt.canadacentral-01.azurewebsites.net/api/greenhouses/2/measurements/latest';
    this.greenhousesData.set(ExampleJson as unknown as GreenhousesData);
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
}
