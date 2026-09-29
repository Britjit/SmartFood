// Kroger Public API — real prices + promo (sale) prices at Kroger-family stores
// (Kroger, Ralphs, Fry's, King Soopers, Harris Teeter, Smith's, Fred Meyer, etc.).
// Free: sign up at https://developer.kroger.com, create an app, put the keys in backend/.env
import { fetchJson, UpstreamError } from '../lib/http.js'
import { cached } from '../lib/cache.js'

const BASE = process.env.KROGER_API_BASE || 'https://api.kroger.com'
const HOUR = 60 * 60 * 1000

// Healthy staples we search for sales on
export const HEALTHY_TERMS = [
  'bananas', 'apples', 'fresh spinach', 'carrots', 'broccoli',
  'frozen vegetables', 'brown rice', 'oats', 'dry beans', 'eggs',
]

let token = null

export function krogerConfigured() {
  return Boolean(process.env.KROGER_CLIENT_ID && process.env.KROGER_CLIENT_SECRET)
}

async function getToken() {
  if (token && token.expires > Date.now() + 60_000) return token.value
  const basic = Buffer.from(`${process.env.KROGER_CLIENT_ID}:${process.env.KROGER_CLIENT_SECRET}`).toString('base64')
  const data = await fetchJson('Kroger auth', `${BASE}/v1/connect/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials&scope=product.compact',
  })
  token = { value: data.access_token, expires: Date.now() + (data.expires_in || 1800) * 1000 }
  return token.value
}

async function krogerGet(path, params) {
  const t = await getToken()
  return fetchJson('Kroger', `${BASE}${path}?${new URLSearchParams(params)}`, {
    headers: { Authorization: `Bearer ${t}` },
  })
}

export function parseLocation(loc) {
  return {
    locationId: loc.locationId,
    name: loc.name,
    chain: loc.chain,
    address: [loc.address?.addressLine1, loc.address?.city, loc.address?.state, loc.address?.zipCode].filter(Boolean).join(', '),
    lat: loc.geolocation?.latitude,
    lon: loc.geolocation?.longitude,
  }
}

// Only keep products that are actually on sale (promo > 0 and below regular price)
export function parseDeals(products, term) {
  const deals = []
  for (const p of products || []) {
    for (const item of p.items || []) {
      const regular = item.price?.regular
      const promo = item.price?.promo
      if (!regular || !promo || promo <= 0 || promo >= regular) continue
      const image = p.images?.find((i) => i.featured)?.sizes?.find((s) => s.size === 'medium')?.url
        || p.images?.[0]?.sizes?.[0]?.url || null
      deals.push({
        id: `${p.productId}:${item.itemId || ''}`,
        term,
        name: p.description,
        brand: p.brand || '',
        size: item.size || '',
        regular,
        promo,
        savings: Math.round((regular - promo) * 100) / 100,
        percentOff: Math.round(((regular - promo) / regular) * 100),
        snapEligible: p.snapEligible ?? null,
        image,
      })
    }
  }
  return deals
}

export async function nearestKrogerStore(zip) {
  return cached(`kroger-loc:${zip}`, 24 * HOUR, async () => {
    const data = await krogerGet('/v1/locations', { 'filter.zipCode.near': zip, 'filter.radiusInMiles': '10', 'filter.limit': '1' })
    const loc = data.data?.[0]
    return loc ? parseLocation(loc) : null
  })
}

export async function getHealthyDeals(zip) {
  if (!krogerConfigured()) {
    throw new UpstreamError('Kroger', 'not configured — add KROGER_CLIENT_ID and KROGER_CLIENT_SECRET to backend/.env', 503)
  }
  return cached(`kroger-deals:${zip}`, 3 * HOUR, async () => {
    const store = await nearestKrogerStore(zip)
    if (!store) return { store: null, deals: [] }
    const results = await Promise.all(
      HEALTHY_TERMS.map((term) =>
        krogerGet('/v1/products', { 'filter.term': term, 'filter.locationId': store.locationId, 'filter.limit': '20' })
          .then((d) => parseDeals(d.data, term))
          .catch(() => []), // one failed search shouldn't kill the whole list
      ),
    )
    const seen = new Set()
    const deals = results.flat().filter((d) => !seen.has(d.id) && seen.add(d.id))
    deals.sort((a, b) => b.percentOff - a.percentOff)
    return { store, deals }
  })
}
