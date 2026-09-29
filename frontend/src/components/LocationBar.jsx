import { useState } from 'react'
import { geocodeZip, getBrowserLocation } from '../lib/places'

export default function LocationBar({ onLocation, onError }) {
  const [zip, setZip] = useState('')

  async function submitZip(e) {
    e.preventDefault()
    if (!/^\d{5}$/.test(zip)) return onError('Enter a 5-digit zip code.')
    try {
      onLocation(await geocodeZip(zip))
    } catch (err) {
      onError(err.message)
    }
  }

  async function useMyLocation() {
    try {
      onLocation(await getBrowserLocation())
    } catch (err) {
      onError(err.message)
    }
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
      <button type="submit">Search</button>
      <button type="button" className="secondary" onClick={useMyLocation}>
        Use my location
      </button>
    </form>
  )
}
