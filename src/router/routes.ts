import { useEffect, useState } from 'react'

export type AppRoute = 'game' | 'compass'

export function parseRoute(pathname: string): AppRoute {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/compass') return 'compass'
  return 'game'
}

export function routePath(route: AppRoute): string {
  return route === 'compass' ? '/compass' : '/'
}

export function navigateTo(route: AppRoute, keepSearch = false) {
  const search = keepSearch ? window.location.search : ''
  const path = routePath(route)
  window.history.pushState({}, '', `${path}${search}`)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function useAppRoute(): AppRoute {
  const [route, setRoute] = useState(() => parseRoute(window.location.pathname))

  useEffect(() => {
    function sync() {
      setRoute(parseRoute(window.location.pathname))
    }
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  return route
}
