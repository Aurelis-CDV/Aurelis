import { PlantData } from './plant-data.interface';

export type GreenhousesData = Array<GreenhouseData>;

/** Outdoor conditions for the location (e.g. from WeatherAPI), shown under "Location parameters". */
export interface GreenhouseLocationWeather {
  temperatureC: number;
  humidityPercent: number;
}

/** Geographic label and coordinates for the greenhouse site. */
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
  name: 'humidity' | 'temperature' | 'light';
  current: number;
  history: Array<{
    date: string; //TODO: should be unix - number
    value: number;
  }>;
}
