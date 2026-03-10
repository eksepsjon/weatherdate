import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import dayjs from 'dayjs'
import { searchPlaces } from '../api/geocoding'
import type { GeocodingResult } from '../types/weather'
import type { Bookmark } from '../types/weather'
import { getBookmarks, deleteBookmark } from '../utils/bookmarks'
import styles from './index.module.css'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const navigate = useNavigate()
  const [placeQuery, setPlaceQuery] = useState('')
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([])
  const [selectedPlace, setSelectedPlace] = useState<GeocodingResult | null>(null)
  const [eventTime, setEventTime] = useState<string>(
    dayjs().add(7, 'day').hour(18).minute(0).format('YYYY-MM-DDTHH:mm')
  )
  const [eventName, setEventName] = useState('')
  const [loading, setLoading] = useState(false)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setBookmarks(getBookmarks())
  }, [])

  useEffect(() => {
    if (placeQuery.length < 2) {
      setSuggestions([])
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const results = await searchPlaces(placeQuery)
        setSuggestions(results)
        setShowDropdown(results.length > 0)
      } finally {
        setLoading(false)
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [placeQuery])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function formatPlaceDisplay(place: GeocodingResult): string {
    return place.name + (place.admin1 ? `, ${place.admin1}` : '') + `, ${place.country}`
  }

  function handlePlaceSelect(place: GeocodingResult) {
    setSelectedPlace(place)
    setPlaceQuery(formatPlaceDisplay(place))
    setShowDropdown(false)
  }

  function handleSubmit() {
    if (!selectedPlace || !eventTime) return
    navigate({
      to: '/weather',
      search: {
        place: selectedPlace.name,
        lat: selectedPlace.latitude,
        lon: selectedPlace.longitude,
        time: dayjs(eventTime).format('YYYY-MM-DDTHH:00'),
        name: eventName || undefined,
      },
    })
  }

  function handleBookmarkClick(bookmark: Bookmark) {
    navigate({
      to: '/weather',
      search: {
        place: bookmark.place,
        lat: bookmark.lat,
        lon: bookmark.lon,
        time: bookmark.time,
        name: bookmark.name || undefined,
      },
    })
  }

  function handleDeleteBookmark(id: string) {
    deleteBookmark(id)
    setBookmarks(getBookmarks())
  }

  const canSubmit = selectedPlace !== null && eventTime !== ''
  const minDate = dayjs().format('YYYY-MM-DDTHH:mm')
  const maxDate = dayjs().add(9, 'day').format('YYYY-MM-DDTHH:mm')

  return (
    <div className={styles.container}>
      <div className={styles.stack}>
        <div className={styles.heroSection}>
          <h1 className={styles.heroTitle}>🌦️ WeatherDate</h1>
          <p className={styles.heroSubtitle}>
            Get the weather forecast for your event or occasion. Bookmark it and check back anytime!
          </p>
        </div>

        <div className={styles.paper}>
          <div className={styles.formStack}>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="place-input">Place</label>
              <div className={styles.autocompleteWrapper} ref={dropdownRef}>
                <div className={styles.inputWithLoader}>
                  <input
                    id="place-input"
                    type="text"
                    className={styles.input}
                    placeholder="Search for a city..."
                    value={placeQuery}
                    onChange={(e) => {
                      const val = e.target.value
                      setPlaceQuery(val)
                      const matchesCurrent =
                        selectedPlace && val === formatPlaceDisplay(selectedPlace)
                      if (!matchesCurrent) setSelectedPlace(null)
                      if (val.length >= 2) setShowDropdown(true)
                    }}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowDropdown(true)
                    }}
                  />
                  {loading && <span className={styles.loader} />}
                </div>
                {showDropdown && suggestions.length > 0 && (
                  <div className={styles.dropdown}>
                    {suggestions.map((s) => (
                      <div
                        key={s.id}
                        className={styles.dropdownOption}
                        onMouseDown={() => handlePlaceSelect(s)}
                      >
                        {formatPlaceDisplay(s)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className={styles.description}>
                {selectedPlace
                  ? `📍 ${selectedPlace.latitude.toFixed(4)}, ${selectedPlace.longitude.toFixed(4)}`
                  : 'Type to search for a location'}
              </p>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="datetime-input">Date &amp; Time</label>
              <input
                id="datetime-input"
                type="datetime-local"
                className={styles.input}
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                min={minDate}
                max={maxDate}
              />
              <p className={styles.description}>
                met.no provides forecasts up to 9 days ahead
              </p>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="event-name-input">Event name (optional)</label>
              <input
                id="event-name-input"
                type="text"
                className={styles.input}
                placeholder="e.g. Birthday party, Garden wedding..."
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
            </div>

            <button
              className={styles.button}
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              Check Weather
            </button>
          </div>
        </div>

        {bookmarks.length > 0 && (
          <div className={styles.bookmarksSection}>
            <h3 className={styles.bookmarksTitle}>📌 Saved bookmarks</h3>
            <div className={styles.bookmarksList}>
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className={styles.bookmarkCard}
                  onClick={() => handleBookmarkClick(bookmark)}
                >
                  <div className={styles.bookmarkRow}>
                    <div className={styles.bookmarkInfo}>
                      <div className={styles.bookmarkNameRow}>
                        <p className={styles.bookmarkName}>
                          {bookmark.name || bookmark.place}
                        </p>
                        {bookmark.name && (
                          <span className={styles.badge}>{bookmark.place}</span>
                        )}
                      </div>
                      <p className={styles.bookmarkDate}>
                        {dayjs(bookmark.time).format('ddd, D MMM YYYY [at] HH:mm')}
                      </p>
                    </div>
                    <button
                      className={styles.deleteButton}
                      title="Delete bookmark"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteBookmark(bookmark.id)
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
