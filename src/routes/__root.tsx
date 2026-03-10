import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Link } from '@tanstack/react-router'
import styles from './__root.module.css'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link to="/" className={styles.headerLink}>
          🌤️ WeatherDate
        </Link>
        <span className={styles.headerTagline}>
          Check the forecast for your event
        </span>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </div>
  )
}
