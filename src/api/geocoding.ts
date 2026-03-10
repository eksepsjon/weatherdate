import axios from 'axios';
import type { GeocodingResponse, GeocodingResult } from '../types/weather';

const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';

export async function searchPlaces(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) return [];

  const response = await axios.get<GeocodingResponse>(GEOCODING_API, {
    params: {
      name: query,
      count: 10,
      language: 'en',
      format: 'json',
    },
  });

  return response.data.results ?? [];
}
