import { useState } from 'react'
import LocationBar from './components/LocationBar'
import FoodMap from './components/FoodMap'
import Deals from './components/Deals'
import FastFood from './components/FastFood'
import { api } from './lib/api'
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
  const [access, setAccess] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [warnings, setWarnings] = useState([])

  async function handleLocation(loc) {
    setLocation(loc)
    setLoading(true)
    setError('')
    setWarnings([])
    const [placesRes, accessRes] = await Promise.allSettled([api.places(loc), api.foodAccess(loc)])
    if (placesRes.status === 'fulfilled') {
      setPlaces(placesRes.value.places)
      setWarnings(placesRes.value.warnings || [])
    } else {
      setPlaces([])
      setError(placesRes.reason.message)
    }
    setAccess(accessRes.status === 'fulfilled' ? accessRes.value.access : null)
    setLoading(false)
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
      {warnings.map((w) => (
        <p key={w} className="status warn">Some results may be missing — {w}</p>
      ))}

      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>

      <main>
        {tab === 'map' && <FoodMap location={location} places={places} access={access} loading={loading} />}
        {tab === 'deals' && <Deals zip={location?.zip} />}
        {tab === 'fastfood' && <FastFood location={location} places={places} />}
      </main>

      <footer className="footer">
        Data: USDA SNAP Retailer Locator, USDA ERS Food Access Research Atlas, © OpenStreetMap contributors, Kroger.
        Listings may be incomplete.
      </footer>
    </div>
  )
}
