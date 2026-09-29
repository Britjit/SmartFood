// Combines USDA SNAP retailers + OpenStreetMap into one list of nearby places.
import { findOsmPlaces } from './osm.js'
import { findSnapRetailers } from './snap.js'
import { distanceMiles } from '../lib/http.js'

const SAME_PLACE_MILES = 0.06 // ~100 m

export function mergePlaces(snap, osm) {
  const merged = [...snap]
  for (const p of osm) {
    // If OSM and USDA list the same store, keep the USDA one (it has SNAP info) and fill in a missing name
    const dup = snap.find(
      (s) => s.category !== 'fastfood' && p.category !== 'fastfood' && distanceMiles(s.lat, s.lon, p.lat, p.lon) < SAME_PLACE_MILES,
    )
    if (dup) continue
    merged.push({ ...p, acceptsSnap: null })
  }
  return merged.sort((a, b) => a.miles - b.miles)
}

export async function findNearbyPlaces(lat, lon, miles = 2) {
  const [snapResult, osmResult] = await Promise.allSettled([
    findSnapRetailers(lat, lon, miles),
    findOsmPlaces(lat, lon, Math.round(miles * 1609.34)),
  ])
  const warnings = []
  if (snapResult.status === 'rejected') warnings.push(snapResult.reason.message)
  if (osmResult.status === 'rejected') warnings.push(osmResult.reason.message)
  if (warnings.length === 2) {
    const err = new Error('Could not load places: ' + warnings.join('; '))
    err.status = 502
    throw err
  }
  const places = mergePlaces(
    snapResult.status === 'fulfilled' ? snapResult.value : [],
    osmResult.status === 'fulfilled' ? osmResult.value : [],
  )
  return { places, warnings }
}
