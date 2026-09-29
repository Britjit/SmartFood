// OpenStreetMap: Nominatim (zip -> coordinates) and Overpass (places near a point). Free, no key.
// Usage policies: https://operations.osmfoundation.org/policies/nominatim/ — max ~1 req/sec, identify your app.
import { fetchJson, distanceMiles, UpstreamError } from '../lib/http.js'
import { cached } from '../lib/cache.js'

const NOMINATIM = 'https://nominatim.openstreetmap.org/search'
const OVERPASS = process.env.OVERPASS_URL || 'https://overpass-api.de/api/interpreter'
const DAY = 24 * 60 * 60 * 1000

export async function geocodeZip(zip) {
  return cached(`zip:${zip}`, 30 * DAY, async () => {
    const url = `${NOMINATIM}?postalcode=${encodeURIComponent(zip)}&country=us&format=json&limit=1`
    const data = await fetchJson('OpenStreetMap geocoder', url)
    if (!data.length) throw new UpstreamError('OpenStreetMap geocoder', 'zip code not found', 404)
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), label: data[0].display_name, zip }
  })
}

export function categorizeOsm(tags = {}) {
  if (tags.amenity === 'fast_food') return 'fastfood'
  if (tags.amenity === 'food_bank' || tags.social_facility === 'food_bank') return 'foodbank'
  if (tags.amenity === 'marketplace' || tags.shop === 'farm') return 'market'
  if (tags.shop === 'greengrocer' || tags.shop === 'health_food') return 'produce'
  if (tags.shop === 'supermarket') return 'grocery'
  return null
}

export function parseOverpass(data, lat, lon) {
  return (data.elements || [])
    .map((el) => {
      const tags = el.tags || {}
      const category = categorizeOsm(tags)
      const pLat = el.lat ?? el.center?.lat
      const pLon = el.lon ?? el.center?.lon
      if (!category || pLat == null || pLon == null) return null
      return {
        id: `osm:${el.type}/${el.id}`,
        source: 'osm',
        name: tags.name || tags.brand || null,
        brand: tags.brand || '',
        category,
        lat: pLat,
        lon: pLon,
        address: [tags['addr:housenumber'], tags['addr:street'], tags['addr:city']].filter(Boolean).join(' '),
        miles: distanceMiles(lat, lon, pLat, pLon),
      }
    })
    .filter(Boolean)
}

export async function findOsmPlaces(lat, lon, radiusMeters) {
  const key = `osm:${lat.toFixed(3)},${lon.toFixed(3)},${radiusMeters}`
  return cached(key, DAY, async () => {
    const around = `(around:${radiusMeters},${lat},${lon})`
    const query = `[out:json][timeout:25];(
      nwr["shop"~"^(supermarket|greengrocer|health_food|farm)$"]${around};
      nwr["amenity"~"^(marketplace|food_bank|fast_food)$"]${around};
      nwr["social_facility"="food_bank"]${around};
    );out center tags;`
    const data = await fetchJson('OpenStreetMap places', OVERPASS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'data=' + encodeURIComponent(query),
      timeoutMs: 30000,
    })
    return parseOverpass(data, lat, lon)
  })
}
