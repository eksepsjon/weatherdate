import axios from 'axios';
import dayjs from 'dayjs';
import type { WeatherResponse, WeatherSnapshot } from '../types/weather';

const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

export async function fetchWeather(
  lat: number,
  lon: number,
  isoTime: string
): Promise<WeatherSnapshot> {
  const date = dayjs(isoTime).format('YYYY-MM-DD');

  const response = await axios.get<WeatherResponse>(WEATHER_API, {
    params: {
      latitude: lat,
      longitude: lon,
      hourly:
        'temperature_2m,apparent_temperature,precipitation_probability,weathercode,windspeed_10m',
      timezone: 'auto',
      start_date: date,
      end_date: date,
      temperature_unit: 'celsius',
      windspeed_unit: 'kmh',
    },
  });

  const data = response.data;
  const targetHour = dayjs(isoTime).format('YYYY-MM-DDTHH:00');

  const idx = data.hourly.time.findIndex((t) => t === targetHour);
  if (idx < 0) {
    throw new Error(
      `No hourly data found for ${targetHour}. The requested time may be outside the forecast range.`
    );
  }

  return {
    time: data.hourly.time[idx],
    temperature: data.hourly.temperature_2m[idx],
    apparentTemperature: data.hourly.apparent_temperature[idx],
    precipitationProbability: data.hourly.precipitation_probability[idx],
    weatherCode: data.hourly.weathercode[idx],
    windspeed: data.hourly.windspeed_10m[idx],
    temperatureUnit: data.hourly_units.temperature_2m,
    windspeedUnit: data.hourly_units.windspeed_10m,
  };
}
