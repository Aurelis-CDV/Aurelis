export interface PlantData {
  name: string;
  id: string;
  preview_url: string;
  soil_moisture: number;
  condition: string;
  soil_moisture_history: Array<{
    date: string;
    value: number;
  }>;
  watering_history: Array<number>;
}
