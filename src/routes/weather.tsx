import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import {
  Container,
  Title,
  Text,
  Paper,
  Stack,
  Group,
  Button,
  Badge,
  Loader,
  Alert,
  Divider,
  SimpleGrid,
  Card,
  ActionIcon,
  Tooltip,
  CopyButton,
} from '@mantine/core'
import dayjs from 'dayjs'
import { fetchWeather } from '../api/weather'
import { getWeatherDescription, getWeatherEmoji } from '../utils/weatherCodes'
import { saveBookmark, deleteBookmark, getBookmarks, generateBookmarkId } from '../utils/bookmarks'
import { useState } from 'react'

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

  const pageUrl = window.location.href
  const formattedTime = dayjs(time).format('dddd, D MMMM YYYY [at] HH:mm')
  const displayName = name || place

  return (
    <Container size="sm" mt="xl">
      <Stack gap="xl">
        <Stack gap="xs">
          <Group justify="space-between" wrap="wrap">
            <Button
              variant="subtle"
              size="sm"
              component={Link}
              to="/"
            >
              ← Back
            </Button>
            <Group gap="xs">
              <CopyButton value={pageUrl}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? 'Copied!' : 'Copy link'}>
                    <Button variant="light" size="sm" onClick={copy}>
                      {copied ? '✓ Copied' : '🔗 Copy link'}
                    </Button>
                  </Tooltip>
                )}
              </CopyButton>
              <Tooltip label={isBookmarked ? 'Remove bookmark' : 'Save bookmark'}>
                <ActionIcon
                  size="lg"
                  variant={isBookmarked ? 'filled' : 'light'}
                  color="yellow"
                  onClick={handleBookmark}
                >
                  {isBookmarked ? '★' : '☆'}
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>

          <Title order={2}>{displayName}</Title>
          {name && name !== place && (
            <Badge variant="light" size="lg">
              📍 {place}
            </Badge>
          )}
          <Text c="dimmed">{formattedTime}</Text>
        </Stack>

        {isLoading && (
          <Paper p="xl" withBorder radius="md">
            <Stack align="center" gap="md">
              <Loader size="lg" />
              <Text>Fetching forecast...</Text>
            </Stack>
          </Paper>
        )}

        {error && (
          <Alert color="red" title="Failed to load weather">
            <Stack gap="sm">
              <Text size="sm">
                {error instanceof Error ? error.message : 'An error occurred while fetching weather data.'}
              </Text>
              <Text size="sm" c="dimmed">
                Note: Open-Meteo only provides forecasts for the next 16 days and historical data is limited.
                Please check your date is within range.
              </Text>
            </Stack>
          </Alert>
        )}

        {data && (
          <Stack gap="md">
            <Paper shadow="sm" p="xl" radius="md" withBorder>
              <Stack gap="md" align="center">
                <Text fz={72} lh={1}>
                  {getWeatherEmoji(data.weatherCode)}
                </Text>
                <Stack gap={4} align="center">
                  <Title order={1}>
                    {data.temperature.toFixed(1)}{data.temperatureUnit}
                  </Title>
                  <Text size="xl" c="dimmed">
                    Feels like {data.apparentTemperature.toFixed(1)}{data.temperatureUnit}
                  </Text>
                  <Badge size="xl" variant="light" mt="xs">
                    {getWeatherDescription(data.weatherCode)}
                  </Badge>
                </Stack>
              </Stack>
            </Paper>

            <SimpleGrid cols={2} spacing="md">
              <Card withBorder radius="md" padding="md">
                <Stack gap={4} align="center">
                  <Text fz={32}>💧</Text>
                  <Title order={4}>{data.precipitationProbability}%</Title>
                  <Text size="sm" c="dimmed">
                    Rain probability
                  </Text>
                </Stack>
              </Card>
              <Card withBorder radius="md" padding="md">
                <Stack gap={4} align="center">
                  <Text fz={32}>💨</Text>
                  <Title order={4}>
                    {data.windspeed.toFixed(0)} {data.windspeedUnit}
                  </Title>
                  <Text size="sm" c="dimmed">
                    Wind speed
                  </Text>
                </Stack>
              </Card>
            </SimpleGrid>

            <Divider />

            <Paper p="md" radius="md" bg="gray.0">
              <Stack gap={4}>
                <Group gap="xs">
                  <Text size="sm" c="dimmed">
                    📍 Coordinates:
                  </Text>
                  <Text size="sm">
                    {lat.toFixed(4)}, {lon.toFixed(4)}
                  </Text>
                </Group>
                <Group gap="xs">
                  <Text size="sm" c="dimmed">
                    🕐 Forecast time:
                  </Text>
                  <Text size="sm">{dayjs(data.time).format('D MMM YYYY, HH:mm')}</Text>
                </Group>
                <Text size="xs" c="dimmed" mt="xs">
                  Data from{' '}
                  <a
                    href="https://open-meteo.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open-Meteo
                  </a>{' '}
                  · Updated every 15 minutes
                </Text>
              </Stack>
            </Paper>

            <Button
              variant="light"
              onClick={() =>
                navigate({
                  to: '/',
                })
              }
              fullWidth
            >
              Check another date or place
            </Button>
          </Stack>
        )}
      </Stack>
    </Container>
  )
}
