import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  Container,
  Title,
  Text,
  Paper,
  TextInput,
  Button,
  Stack,
  Group,
  Card,
  ActionIcon,
  Autocomplete,
  Loader,
  Badge,
  Tooltip,
} from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import dayjs from 'dayjs'
import { searchPlaces } from '../api/geocoding'
import type { GeocodingResult } from '../types/weather'
import type { Bookmark } from '../types/weather'
import { getBookmarks, deleteBookmark } from '../utils/bookmarks'
import '@mantine/dates/styles.css'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const navigate = useNavigate()
  const [placeQuery, setPlaceQuery] = useState('')
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([])
  const [selectedPlace, setSelectedPlace] = useState<GeocodingResult | null>(null)
  const [eventTime, setEventTime] = useState<string | null>(
    dayjs().add(7, 'day').hour(18).minute(0).format('YYYY-MM-DDTHH:mm')
  )
  const [eventName, setEventName] = useState('')
  const [loading, setLoading] = useState(false)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

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
      } finally {
        setLoading(false)
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [placeQuery])

  const autocompleteData = suggestions.map((s) => ({
    value: s.name + (s.admin1 ? `, ${s.admin1}` : '') + `, ${s.country}`,
    label: s.name + (s.admin1 ? `, ${s.admin1}` : '') + `, ${s.country}`,
  }))

  function handlePlaceSelect(value: string) {
    const found = suggestions.find(
      (s) => s.name + (s.admin1 ? `, ${s.admin1}` : '') + `, ${s.country}` === value
    )
    if (found) {
      setSelectedPlace(found)
      setPlaceQuery(value)
    } else {
      setSelectedPlace(null)
      setPlaceQuery(value)
    }
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

  const canSubmit = selectedPlace !== null && eventTime !== null

  return (
    <Container size="sm" mt="xl">
      <Stack gap="xl">
        <Stack gap="xs" ta="center">
          <Title order={1}>🌦️ WeatherDate</Title>
          <Text c="dimmed" size="lg">
            Get the weather forecast for your event or occasion. Bookmark it and check back anytime!
          </Text>
        </Stack>

        <Paper shadow="sm" p="xl" radius="md" withBorder>
          <Stack gap="md">
            <Autocomplete
              label="Place"
              placeholder="Search for a city..."
              value={placeQuery}
              onChange={(val) => {
                setPlaceQuery(val)
                if (val !== placeQuery) setSelectedPlace(null)
              }}
              onOptionSubmit={handlePlaceSelect}
              data={autocompleteData}
              rightSection={loading ? <Loader size="xs" /> : null}
              description={
                selectedPlace
                  ? `📍 ${selectedPlace.latitude.toFixed(4)}, ${selectedPlace.longitude.toFixed(4)}`
                  : 'Type to search for a location'
              }
            />

            <DateTimePicker
              label="Date & Time"
              placeholder="Pick a date and time"
              value={eventTime}
              onChange={setEventTime}
              minDate={new Date()}
              maxDate={dayjs().add(16, 'day').toDate()}
              description="Open-Meteo provides forecasts up to 16 days ahead"
            />

            <TextInput
              label="Event name (optional)"
              placeholder="e.g. Birthday party, Garden wedding..."
              value={eventName}
              onChange={(e) => setEventName(e.currentTarget.value)}
            />

            <Button
              size="md"
              onClick={handleSubmit}
              disabled={!canSubmit}
              fullWidth
            >
              Check Weather
            </Button>
          </Stack>
        </Paper>

        {bookmarks.length > 0 && (
          <Stack gap="sm">
            <Title order={3}>📌 Saved bookmarks</Title>
            <Stack gap="xs">
              {bookmarks.map((bookmark) => (
                <Card
                  key={bookmark.id}
                  withBorder
                  padding="sm"
                  radius="md"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleBookmarkClick(bookmark)}
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Stack gap={2}>
                      <Group gap="xs">
                        <Text fw={600}>{bookmark.name || bookmark.place}</Text>
                        {bookmark.name && (
                          <Badge size="sm" variant="light">
                            {bookmark.place}
                          </Badge>
                        )}
                      </Group>
                      <Text size="sm" c="dimmed">
                        {dayjs(bookmark.time).format('ddd, D MMM YYYY [at] HH:mm')}
                      </Text>
                    </Stack>
                    <Tooltip label="Delete bookmark">
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteBookmark(bookmark.id)
                        }}
                      >
                        🗑️
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Stack>
        )}
      </Stack>
    </Container>
  )
}
