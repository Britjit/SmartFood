import { useState } from 'react'
import LocationBar from './components/LocationBar'
import FoodMap from './components/FoodMap'
import Deals from './components/Deals'
import FastFood from './components/FastFood'
import { findNearbyPlaces } from './lib/places'
import './App.css'

const TABS = [
  { id: 'map', label: 'Find healthy food' },
  { id: 'deals', label: 'Deals & programs' },
  { id: 'fastfood', label: 'Fast food, smarter' },
]

export default function App() {
  const [tab, setTab] = useState('map')
  const [location, setLocation] = useState(null)
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLocation(loc) {
    setLocation(loc)
    setLoading(true)
    setError('')
    try {
      setPlaces(await findNearbyPlaces(loc))
    } catch (e) {
      setError(e.message)
      setPlaces([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🥦 Smartfood</h1>
        <p>Find healthy food near you — even when options are limited.</p>
      </header>

      <LocationBar onLocation={handleLocation} onError={setError} />
      {loading && <p className="status">Searching nearby…</p>}
      {error && <p className="status error">{error}</p>}

      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>

      <main>
        {tab === 'map' && <FoodMap location={location} places={places} />}
        {tab === 'deals' && <Deals />}
        {tab === 'fastfood' && <FastFood location={location} places={places} />}
      </main>

      <footer className="footer">
        Map data © OpenStreetMap contributors. Store listings may be incomplete.
      </footer>
    </div>
  )
}
