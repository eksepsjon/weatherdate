import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { fetchWeather } from '../api/weather'
import { getWeatherDescription, getWeatherEmoji } from '../utils/weatherCodes'
import { saveBookmark, deleteBookmark, getBookmarks, generateBookmarkId } from '../utils/bookmarks'
import { useState } from 'react'
import styles from './weather.module.css'

const weatherSearchSchema = z.object({
  place: z.string(),
  lat: z.number(),
  lon: z.number(),
  time: z.string(),
  name: z.string().optional(),
})

export const Route = createFileRoute('/weather')({
  validateSearch: weatherSearchSchema,
  component: WeatherPage,
})

function WeatherPage() {
  const { place, lat, lon, time, name } = Route.useSearch()
  const navigate = useNavigate()
  const bookmarkId = generateBookmarkId(place, time)
  const [bookmarkIds, setBookmarkIds] = useState<Set<string>>(
    () => new Set(getBookmarks().map((b) => b.id))
  )
  const isBookmarked = bookmarkIds.has(bookmarkId)
  const [copied, setCopied] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['weather', lat, lon, time],
    queryFn: () => fetchWeather(lat, lon, time),
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
  })

  function handleBookmark() {
    if (isBookmarked) {
      deleteBookmark(bookmarkId)
      setBookmarkIds((prev) => {
        const next = new Set(prev)
        next.delete(bookmarkId)
        return next
      })
    } else {
      saveBookmark({
        id: bookmarkId,
        name: name ?? '',
        place,
        lat,
        lon,
        time,
        createdAt: new Date().toISOString(),
      })
      setBookmarkIds((prev) => new Set([...prev, bookmarkId]))
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const formattedTime = dayjs(time).format('dddd, D MMMM YYYY [at] HH:mm')
  const displayName = name || place

  return (
    <div className={styles.container}>
      <div className={styles.stack}>
        <div className={styles.headerSection}>
          <div className={styles.topBar}>
            <Link to="/" className={styles.backButton}>
              ← Back
            </Link>
            <div className={styles.topBarActions}>
              <button
                className={styles.copyButton}
                onClick={handleCopy}
                title={copied ? 'Copied!' : 'Copy link'}
              >
                {copied ? '✓ Copied' : '🔗 Copy link'}
              </button>
              <button
                className={`${styles.bookmarkButton} ${isBookmarked ? styles.bookmarkButtonActive : ''}`}
                onClick={handleBookmark}
                title={isBookmarked ? 'Remove bookmark' : 'Save bookmark'}
              >
                {isBookmarked ? '★' : '☆'}
              </button>
            </div>
          </div>

          <h2 className={styles.title}>{displayName}</h2>
          {name && name !== place && (
            <span className={styles.badge}>📍 {place}</span>
          )}
          <p className={styles.dimmedText}>{formattedTime}</p>
        </div>

        {isLoading && (
          <div className={styles.paper}>
            <div className={styles.loadingBox}>
              <div className={styles.loader} />
              <p className={styles.loadingText}>Fetching forecast...</p>
            </div>
          </div>
        )}

        {error && (
          <div className={styles.alert}>
            <p className={styles.alertTitle}>Failed to load weather</p>
            <div className={styles.alertStack}>
              <p className={styles.alertText}>
                {error instanceof Error ? error.message : 'An error occurred while fetching weather data.'}
              </p>
              <p className={styles.alertDimmed}>
                Note: met.no provides forecasts for up to 9 days ahead.
                Please check your date is within range.
              </p>
            </div>
          </div>
        )}

        {data && (
          <div className={styles.dataStack}>
            <div className={styles.paper}>
              <div className={styles.weatherHero}>
                <span className={styles.weatherEmoji}>
                  {getWeatherEmoji(data.weatherSymbol)}
                </span>
                <div className={styles.weatherDetails}>
                  <h1 className={styles.temperatureTitle}>
                    {data.temperature.toFixed(1)}{data.temperatureUnit}
                  </h1>
                  <p className={styles.feelsLike}>
                    Feels like {data.apparentTemperature.toFixed(1)}{data.temperatureUnit}
                  </p>
                  <span className={styles.weatherBadge}>
                    {getWeatherDescription(data.weatherSymbol)}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statEmoji}>💧</span>
                <h4 className={styles.statValue}>{data.precipitationAmount} mm</h4>
                <p className={styles.statLabel}>Precipitation</p>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statEmoji}>💨</span>
                <h4 className={styles.statValue}>
                  {data.windSpeed.toFixed(1)} {data.windSpeedUnit}
                </h4>
                <p className={styles.statLabel}>Wind speed</p>
              </div>
            </div>

            <hr className={styles.divider} />

            <div className={styles.metaBox}>
              <div className={styles.metaStack}>
                <div className={styles.metaRow}>
                  <p className={styles.metaLabel}>📍 Coordinates:</p>
                  <p className={styles.metaValue}>
                    {lat.toFixed(4)}, {lon.toFixed(4)}
                  </p>
                </div>
                <div className={styles.metaRow}>
                  <p className={styles.metaLabel}>🕐 Forecast time:</p>
                  <p className={styles.metaValue}>{dayjs(data.time).format('D MMM YYYY, HH:mm')}</p>
                </div>
                <p className={styles.metaAttribution}>
                  Data from{' '}
                  <a
                    href="https://www.met.no/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    met.no
                  </a>{' '}
                  · Norwegian Meteorological Institute
                </p>
              </div>
            </div>

            <button
              className={styles.secondaryButton}
              onClick={() =>
                navigate({
                  to: '/',
                })
              }
            >
              Check another date or place
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
