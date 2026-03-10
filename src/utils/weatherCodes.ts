export function getWeatherDescription(symbol: string): string {
  const base = symbol.replace(/_day|_night|_polartwilight/g, '');
  const codes: Record<string, string> = {
    clearsky: 'Clear sky',
    fair: 'Fair',
    partlycloudy: 'Partly cloudy',
    cloudy: 'Cloudy',
    fog: 'Fog',
    lightrain: 'Light rain',
    rain: 'Rain',
    heavyrain: 'Heavy rain',
    lightrainshowers: 'Light rain showers',
    rainshowers: 'Rain showers',
    heavyrainshowers: 'Heavy rain showers',
    lightsleet: 'Light sleet',
    sleet: 'Sleet',
    heavysleet: 'Heavy sleet',
    lightsleetshowers: 'Light sleet showers',
    sleetshowers: 'Sleet showers',
    heavysleetshowers: 'Heavy sleet showers',
    lightsnow: 'Light snow',
    snow: 'Snow',
    heavysnow: 'Heavy snow',
    lightsnowshowers: 'Light snow showers',
    snowshowers: 'Snow showers',
    heavysnowshowers: 'Heavy snow showers',
    lightrainandthunder: 'Light rain and thunder',
    rainandthunder: 'Rain and thunder',
    heavyrainandthunder: 'Heavy rain and thunder',
    lightrainshowersandthunder: 'Light rain showers and thunder',
    rainshowersandthunder: 'Rain showers and thunder',
    heavyrainshowersandthunder: 'Heavy rain showers and thunder',
    lightsleetandthunder: 'Light sleet and thunder',
    sleetandthunder: 'Sleet and thunder',
    heavysleetandthunder: 'Heavy sleet and thunder',
    lightsleetshowersandthunder: 'Light sleet showers and thunder',
    sleetshowersandthunder: 'Sleet showers and thunder',
    heavysleetshowersandthunder: 'Heavy sleet showers and thunder',
    lightsnowandthunder: 'Light snow and thunder',
    snowandthunder: 'Snow and thunder',
    heavysnowandthunder: 'Heavy snow and thunder',
    lightsnowshowersandthunder: 'Light snow showers and thunder',
    snowshowersandthunder: 'Snow showers and thunder',
    heavysnowshowersandthunder: 'Heavy snow showers and thunder',
  };
  return codes[base] ?? 'Unknown';
}

export function getWeatherEmoji(symbol: string): string {
  const base = symbol.replace(/_day|_night|_polartwilight/g, '');
  if (base === 'clearsky') return '☀️';
  if (base === 'fair') return '🌤️';
  if (base === 'partlycloudy') return '⛅';
  if (base === 'cloudy') return '☁️';
  if (base === 'fog') return '🌫️';
  if (base.includes('thunder')) return '⛈️';
  if (base.includes('snow')) return '❄️';
  if (base.includes('sleet')) return '🌨️';
  if (base.includes('shower')) return '🌦️';
  if (base.includes('rain')) return '🌧️';
  return '☁️';
}
