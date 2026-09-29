// Talks to the Smartfood backend (see ../backend). In dev, Vite proxies /api to localhost:3001.
async function get(path) {
  let res
  try {
    res = await fetch(path)
  } catch {
    throw new Error('Could not reach the Smartfood server. Is the backend running?')
  }
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(body.error || `Request failed (${res.status})`)
    err.status = res.status
    throw err
  }
  return body
}

export const api = {
  geocode: (zip) => get(`/api/geocode?zip=${zip}`),
  places: ({ lat, lon }, miles = 2) => get(`/api/places?lat=${lat}&lon=${lon}&miles=${miles}`),
  foodAccess: ({ lat, lon }) => get(`/api/food-access?lat=${lat}&lon=${lon}`),
  deals: (zip) => get(`/api/deals?zip=${zip}`),
  fastfood: () => get('/api/fastfood'),
}

export function getBrowserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Location not supported in this browser.'))
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, label: 'Your location', zip: null }),
      () => reject(new Error('Location permission denied. Try a zip code instead.')),
    )
  })
}

export const CATEGORY_INFO = {
  grocery: { label: 'Grocery store', color: '#43a047' },
  produce: { label: 'Produce / health food', color: '#c0ca33' },
  market: { label: 'Farmers market', color: '#f9a825' },
  foodbank: { label: 'Food bank', color: '#1565c0' },
  fastfood: { label: 'Fast food', color: '#d84315' },
}

export function findChain(chains, nameOrBrand) {
  const n = (nameOrBrand || '').toLowerCase()
  return chains.find((c) => c.match.some((m) => n.includes(m)))
}
