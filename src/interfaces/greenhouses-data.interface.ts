import { PlantData } from './plant-data.interface';

export type GreenhousesData = Array<GreenhouseData>;

export interface GreenhouseData {
  name: string;
  id: string;
  preview_url: string;
  location: string;
  params: Array<GreenhouseParam>;
  plants: Array<PlantData>;
}

export interface GreenhouseParam {
  name: 'humidity' | 'temperature' | 'light';
  current: number;
  history: {
    date: string; //TODO: should be unix - number
    value: number;
  };
}
