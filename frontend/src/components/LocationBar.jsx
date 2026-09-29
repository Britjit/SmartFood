import { useState } from 'react'
import { api, getBrowserLocation } from '../lib/api'

export default function LocationBar({ onLocation, onError }) {
  const [zip, setZip] = useState('')
  const [busy, setBusy] = useState(false)

  async function run(fn) {
    setBusy(true)
    onError('')
    try {
      onLocation(await fn())
    } catch (err) {
      onError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function submitZip(e) {
    e.preventDefault()
    if (!/^\d{5}$/.test(zip)) return onError('Enter a 5-digit zip code.')
    run(() => api.geocode(zip))
  }

  return (
    <form className="location-bar" onSubmit={submitZip}>
      <input
        value={zip}
        onChange={(e) => setZip(e.target.value.trim())}
        placeholder="Zip code (e.g. 33127)"
        inputMode="numeric"
        maxLength={5}
      />
      <button type="submit" disabled={busy}>Search</button>
      <button type="button" className="secondary" disabled={busy} onClick={() => run(getBrowserLocation)}>
        Use my location
      </button>
    </form>
  )
}
