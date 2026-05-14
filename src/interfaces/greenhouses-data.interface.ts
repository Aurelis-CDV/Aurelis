import { PlantData } from './plant-data.interface';

export type GreenhousesData = Array<GreenhouseData>;

export interface GreenhouseLocationWeather {
  temperatureC: number;
  humidityPercent: number;
}

export interface GreenhouseGeoLocation {
  name: string;
  lat: number;
  lon: number;
}

export interface GreenhouseData {
  name: string;
  id: string;
  preview_url: string;
  location: GreenhouseGeoLocation;
  params: Array<GreenhouseParam>;
  plants: Array<PlantData>;
}

export interface GreenhouseParam {
  name: string;
  current: number;
  history: Array<{
    date: string;
    value: number;
  }>;
}
