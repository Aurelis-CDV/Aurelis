import { GreenhouseData } from '../../interfaces/greenhouses-data.interface';
import { PlantCondition } from '../../interfaces/plant-condition.type';
import { PlantData } from '../../interfaces/plant-data.interface';

export function derivePlantCondition(
  temperatureC: number,
  soilMoisturePercent: number,
  airHumidityPercent: number,
): PlantCondition {
  if (
    !Number.isFinite(temperatureC) ||
    !Number.isFinite(soilMoisturePercent) ||
    !Number.isFinite(airHumidityPercent)
  ) {
    return 'unknown';
  }

  if (
    temperatureC < 10 ||
    temperatureC > 35 ||
    soilMoisturePercent < 25 ||
    soilMoisturePercent > 95 ||
    airHumidityPercent > 95
  ) {
    return 'bad';
  }

  const temperatureScore =
    temperatureC >= 20 && temperatureC <= 26
      ? 2
      : (temperatureC >= 16 && temperatureC < 20) || (temperatureC > 26 && temperatureC <= 30)
        ? 1
        : 0;

  const soilScore =
    soilMoisturePercent >= 55 && soilMoisturePercent <= 75
      ? 2
      : (soilMoisturePercent >= 40 && soilMoisturePercent < 55) ||
          (soilMoisturePercent > 75 && soilMoisturePercent <= 85)
        ? 1
        : 0;

  const airScore =
    airHumidityPercent >= 50 && airHumidityPercent <= 70
      ? 2
      : (airHumidityPercent >= 35 && airHumidityPercent < 50) ||
          (airHumidityPercent > 70 && airHumidityPercent <= 85)
        ? 1
        : 0;

  const total = temperatureScore + soilScore + airScore;

  if (total >= 5) {
    return 'good';
  }
  if (total >= 3) {
    return 'good_but_could_be_better';
  }
  return 'bad';
}

export function enrichGreenhouseWithDerivedPlantConditions(
  greenhouse: GreenhouseData,
): GreenhouseData {
  const temp = greenhouse.params.find((p) => p.name === 'temperature')?.current;
  const humidity = greenhouse.params.find((p) => p.name === 'humidity')?.current;
  const plants: PlantData[] = greenhouse.plants.map((plant) => ({
    ...plant,
    condition: derivePlantCondition(
      typeof temp === 'number' && Number.isFinite(temp) ? temp : NaN,
      plant.soil_moisture,
      typeof humidity === 'number' && Number.isFinite(humidity) ? humidity : NaN,
    ),
  }));
  return { ...greenhouse, plants };
}
