export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  admin1?: string;
  admin2?: string;
}

export interface GeocodingResponse {
  results?: GeocodingResult[];
}

export interface MetNoInstantDetails {
  air_temperature: number;
  wind_speed: number;
  wind_from_direction: number;
  relative_humidity: number;
  air_pressure_at_sea_level: number;
  cloud_area_fraction: number;
}

export interface MetNoTimePeriod {
  summary: {
    symbol_code: string;
  };
  details: {
    precipitation_amount: number;
  };
}

export interface MetNoTimeseries {
  time: string;
  data: {
    instant: {
      details: MetNoInstantDetails;
    };
    next_1_hours?: MetNoTimePeriod;
    next_6_hours?: MetNoTimePeriod;
    next_12_hours?: MetNoTimePeriod;
  };
}

export interface MetNoResponse {
  type: string;
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: {
    meta: {
      updated_at: string;
      units: Record<string, string>;
    };
    timeseries: MetNoTimeseries[];
  };
}

export interface WeatherSnapshot {
  time: string;
  temperature: number;
  apparentTemperature: number;
  precipitationAmount: number;
  weatherSymbol: string;
  windSpeed: number;
  temperatureUnit: string;
  windSpeedUnit: string;
}

export interface Bookmark {
  id: string;
  name: string;
  place: string;
  lat: number;
  lon: number;
  time: string;
  createdAt: string;
}
