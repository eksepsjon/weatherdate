import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import type { MetNoResponse, WeatherSnapshot } from '../types/weather';

dayjs.extend(utc);

const WEATHER_API = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';

/**
 * Calculate wind chill using Environment Canada's formula.
 * Applies when air temperature ≤ 10°C and wind speed > 4.8 km/h.
 * @param tempC - Air temperature in degrees Celsius
 * @param windSpeedMs - Wind speed in meters per second
 * @returns Perceived temperature in degrees Celsius
 */
function calculateWindChill(tempC: number, windSpeedMs: number): number {
  const windKmh = windSpeedMs * 3.6;
  if (tempC <= 10 && windKmh > 4.8) {
    return (
      13.12 +
      0.6215 * tempC -
      11.37 * Math.pow(windKmh, 0.16) +
      0.3965 * tempC * Math.pow(windKmh, 0.16)
    );
  }
  return tempC;
}

export async function fetchWeather(
  lat: number,
  lon: number,
  isoTime: string
): Promise<WeatherSnapshot> {
  const response = await axios.get<MetNoResponse>(WEATHER_API, {
    params: {
      lat: lat.toFixed(4),
      lon: lon.toFixed(4),
    },
    headers: {
      'User-Agent': 'weatherdate/1.0 github.com/eksepsjon/weatherdate',
    },
  });

  const timeseries = response.data.properties.timeseries;
  const targetHour = dayjs(isoTime).utc().format('YYYY-MM-DDTHH:00:00Z');

  const entry = timeseries.find((t) => t.time === targetHour);
  if (!entry) {
    throw new Error(
      `No forecast data found for ${dayjs(isoTime).format('YYYY-MM-DD HH:00')}. The requested time may be outside the forecast range (up to 9 days ahead).`
    );
  }

  const details = entry.data.instant.details;
  const period = entry.data.next_1_hours ?? entry.data.next_6_hours ?? entry.data.next_12_hours;
  const symbolCode = period?.summary.symbol_code ?? 'cloudy';
  const precipitationAmount = period?.details.precipitation_amount ?? 0;

  return {
    time: entry.time,
    temperature: details.air_temperature,
    apparentTemperature: calculateWindChill(details.air_temperature, details.wind_speed),
    precipitationAmount,
    weatherSymbol: symbolCode,
    windSpeed: details.wind_speed,
    temperatureUnit: '°C',
    windSpeedUnit: 'm/s',
  };
}
