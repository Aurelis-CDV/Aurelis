import { GreenhouseData } from '../../interfaces/greenhouses-data.interface';
import { PlantCondition } from '../../interfaces/plant-condition.type';
import { PlantData } from '../../interfaces/plant-data.interface';

export type PlantParameterHealth = 'ideal' | 'acceptable' | 'bad' | 'unknown';

function isFiniteNumber(v: number | null | undefined): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function isTemperatureCritical(temp: number): boolean {
  return temp < 10 || temp > 35;
}

function isSoilCritical(soil: number): boolean {
  return soil < 25 || soil > 95;
}

function isAirCritical(air: number): boolean {
  return air > 95;
}

function temperatureScore01(temp: number): 0 | 1 | 2 {
  if (temp >= 20 && temp <= 26) {
    return 2;
  }
  if ((temp >= 16 && temp < 20) || (temp > 26 && temp <= 30)) {
    return 1;
  }
  return 0;
}

function soilScore01(soil: number): 0 | 1 | 2 {
  if (soil >= 55 && soil <= 75) {
    return 2;
  }
  if ((soil >= 40 && soil < 55) || (soil > 75 && soil <= 85)) {
    return 1;
  }
  return 0;
}

function airScore01(air: number): 0 | 1 | 2 {
  if (air >= 50 && air <= 70) {
    return 2;
  }
  if ((air >= 35 && air < 50) || (air > 70 && air <= 85)) {
    return 1;
  }
  return 0;
}

export function temperatureParameterHealth(temp: number | null | undefined): PlantParameterHealth {
  if (!isFiniteNumber(temp)) {
    return 'unknown';
  }
  if (isTemperatureCritical(temp)) {
    return 'bad';
  }
  const s = temperatureScore01(temp);
  if (s === 2) {
    return 'ideal';
  }
  if (s === 1) {
    return 'acceptable';
  }
  return 'bad';
}

export function soilMoistureParameterHealth(soil: number | null | undefined): PlantParameterHealth {
  if (!isFiniteNumber(soil)) {
    return 'unknown';
  }
  if (isSoilCritical(soil)) {
    return 'bad';
  }
  const s = soilScore01(soil);
  if (s === 2) {
    return 'ideal';
  }
  if (s === 1) {
    return 'acceptable';
  }
  return 'bad';
}

export function airHumidityParameterHealth(air: number | null | undefined): PlantParameterHealth {
  if (!isFiniteNumber(air)) {
    return 'unknown';
  }
  if (isAirCritical(air)) {
    return 'bad';
  }
  const s = airScore01(air);
  if (s === 2) {
    return 'ideal';
  }
  if (s === 1) {
    return 'acceptable';
  }
  return 'bad';
}

export function derivePlantCondition(
  temperatureC: number,
  soilMoisturePercent: number,
  airHumidityPercent: number,
): PlantCondition {
  if (
    !isFiniteNumber(temperatureC) ||
    !isFiniteNumber(soilMoisturePercent) ||
    !isFiniteNumber(airHumidityPercent)
  ) {
    return 'unknown';
  }

  if (
    isTemperatureCritical(temperatureC) ||
    isSoilCritical(soilMoisturePercent) ||
    isAirCritical(airHumidityPercent)
  ) {
    return 'bad';
  }

  const total =
    temperatureScore01(temperatureC) +
    soilScore01(soilMoisturePercent) +
    airScore01(airHumidityPercent);

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
