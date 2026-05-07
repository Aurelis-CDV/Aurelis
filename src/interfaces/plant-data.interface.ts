import { PlantCondition } from './plant-condition.type';

export interface PlantData {
  name: string;
  id: string;
  preview_url: string;
  soil_moisture: number;
  condition: PlantCondition;
  soil_moisture_history: Array<number>;
  watering_history: Array<number>;
}
