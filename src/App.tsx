import { PulseGame } from './components/PulseGame'
import { CompassApp } from './pages/CompassApp'
import { useAppRoute } from './router/routes'

export default function App() {
  const route = useAppRoute()
  if (route === 'compass') return <CompassApp />
  return <PulseGame />
}
