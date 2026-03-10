import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { AppShell, Group, Title, Anchor, Text } from '@mantine/core'
import { Link } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <AppShell header={{ height: 56 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Anchor component={Link} to="/" underline="never">
            <Title order={3} c="blue">
              🌤️ WeatherDate
            </Title>
          </Anchor>
          <Text size="sm" c="dimmed">
            Check the forecast for your event
          </Text>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </AppShell>
  )
}
