// Location + nearby places, using free OpenStreetMap services (no API key needed).
// Nominatim = turns a zip code into coordinates. Overpass = finds places near a point.

const NOMINATIM = 'https://nominatim.openstreetmap.org/search'
const OVERPASS = 'https://overpass-api.de/api/interpreter'

export async function geocodeZip(zip) {
  const url = `${NOMINATIM}?postalcode=${encodeURIComponent(zip)}&country=us&format=json&limit=1`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Could not look up that zip code.')
  const data = await res.json()
  if (!data.length) throw new Error('Zip code not found.')
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), label: data[0].display_name }
}

export function getBrowserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Location not supported in this browser.'))
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, label: 'Your location' }),
      () => reject(new Error('Location permission denied. Try a zip code instead.')),
    )
  })
}

// Which OSM tags map to which Smartfood category
function categorize(tags) {
  if (tags.amenity === 'fast_food') return 'fastfood'
  if (tags.amenity === 'food_bank' || tags.social_facility === 'food_bank') return 'foodbank'
  if (tags.amenity === 'marketplace' || tags.shop === 'farm') return 'market'
  if (tags.shop === 'greengrocer' || tags.shop === 'health_food') return 'produce'
  if (tags.shop === 'supermarket') return 'grocery'
  return null
}

export const CATEGORY_INFO = {
  grocery: { label: 'Grocery store', color: '#2e7d32' },
  produce: { label: 'Produce / health food', color: '#66bb6a' },
  market: { label: "Farmers market", color: '#f9a825' },
  foodbank: { label: 'Food bank', color: '#1565c0' },
  fastfood: { label: 'Fast food', color: '#d84315' },
}

export async function findNearbyPlaces({ lat, lon }, radiusMeters = 3000) {
  const around = `(around:${radiusMeters},${lat},${lon})`
  const query = `
    [out:json][timeout:25];
    (
      nwr["shop"~"^(supermarket|greengrocer|health_food|farm)$"]${around};
      nwr["amenity"~"^(marketplace|food_bank|fast_food)$"]${around};
      nwr["social_facility"="food_bank"]${around};
    );
    out center tags;`
  const res = await fetch(OVERPASS, { method: 'POST', body: 'data=' + encodeURIComponent(query) })
  if (!res.ok) throw new Error('Map data service is busy. Try again in a minute.')
  const data = await res.json()

  return data.elements
    .map((el) => {
      const tags = el.tags || {}
      const category = categorize(tags)
      const pLat = el.lat ?? el.center?.lat
      const pLon = el.lon ?? el.center?.lon
      if (!category || pLat == null) return null
      return {
        id: `${el.type}/${el.id}`,
        name: tags.name || tags.brand || CATEGORY_INFO[category].label,
        brand: tags.brand || tags.name || '',
        category,
        lat: pLat,
        lon: pLon,
        address: [tags['addr:housenumber'], tags['addr:street'], tags['addr:city']].filter(Boolean).join(' '),
        miles: distanceMiles(lat, lon, pLat, pLon),
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.miles - b.miles)
}

export function distanceMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}
