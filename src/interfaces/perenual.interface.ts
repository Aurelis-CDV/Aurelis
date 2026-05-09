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

export interface PerenualDiseaseImage {
  license?: number;
  license_name?: string;
  license_url?: string;
  original_url: string | null;
  regular_url: string | null;
  medium_url: string | null;
  small_url: string | null;
  thumbnail: string | null;
}

export interface PerenualDiseaseSection {
  subtitle: string | null;
  description: string | null;
}

export interface PerenualDiseasePreview {
  id: number;
  common_name: string | null;
  scientific_name: string | null;
  other_name: string[];
  family: string | null;
  description: PerenualDiseaseSection[];
  solution: PerenualDiseaseSection[];
  host: string[];
  images: PerenualDiseaseImage[];
}

export interface PerenualDiseaseListResponse {
  data: PerenualDiseasePreview[];
  to: number;
  per_page: number;
  current_page: number;
  from: number;
  last_page: number;
  total: number;
}

export type PerenualDiseaseDetails = PerenualDiseasePreview;
