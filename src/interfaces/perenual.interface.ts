export interface PerenualPlantPreview {
  id: number;
  common_name: string | null;
  scientific_name: string[];
  other_name: string[];
  cycle: string | null;
  watering: string | null;
  sunlight: string[];
  default_image: {
    thumbnail: string | null;
    regular_url: string | null;
    original_url: string | null;
  } | null;
}

export interface PerenualPlantListResponse {
  data: PerenualPlantPreview[];
  to: number;
  per_page: number;
  current_page: number;
  from: number;
  last_page: number;
  total: number;
}

export interface PerenualPlantDetails {
  id: number;
  common_name: string | null;
  scientific_name: string[];
  other_name: string[];
  family: string | null;
  origin: string[];
  type: string | null;
  dimension: string | null;
  cycle: string | null;
  watering: string | null;
  sunlight: string[];
  pruning_month: string[];
  care_level: string | null;
  description: string | null;
  default_image: {
    thumbnail: string | null;
    regular_url: string | null;
    original_url: string | null;
  } | null;
}
