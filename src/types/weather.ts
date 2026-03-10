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

export interface WeatherHourly {
  time: string[];
  temperature_2m: number[];
  precipitation_probability: number[];
  weathercode: number[];
  windspeed_10m: number[];
  apparent_temperature: number[];
}

export interface WeatherResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  hourly: WeatherHourly;
  hourly_units: {
    temperature_2m: string;
    windspeed_10m: string;
  };
}

export interface WeatherSnapshot {
  time: string;
  temperature: number;
  apparentTemperature: number;
  precipitationProbability: number;
  weatherCode: number;
  windspeed: number;
  temperatureUnit: string;
  windspeedUnit: string;
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
