// Runs the API with fake upstream responses, so tests work offline and don't hit real services.
import { test, beforeEach, after } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../src/app.js'
import { clearCache } from '../src/lib/cache.js'
import { parseDeals } from '../src/services/kroger.js'

const realFetch = globalThis.fetch
const LAT = 25.8, LON = -80.2

const fakes = {
  'nominatim.openstreetmap.org': () => [{ lat: '25.8', lon: '-80.2', display_name: 'Miami, FL 33127' }],
  'overpass-api.de': () => ({
    elements: [
      { type: 'node', id: 1, lat: 25.801, lon: -80.2, tags: { shop: 'supermarket', name: 'Same Store (OSM)' } },
      { type: 'way', id: 2, center: { lat: 25.81, lon: -80.2 }, tags: { amenity: 'food_bank', name: 'Community Pantry' } },
      { type: 'node', id: 3, lat: 25.802, lon: -80.201, tags: { amenity: 'fast_food', brand: "McDonald's" } },
      { type: 'node', id: 4, lat: 25.8, lon: -80.2, tags: { shop: 'clothes' } },
    ],
  }),
  'snap_retailer_location_data': () => ({
    features: [
      { attributes: { Record_ID: 10, Store_Name: 'Fresh Mart', Store_Type: 'Supermarket', Latitude: 25.8012, Longitude: -80.2, Store_Street_Address: '1 Main St', City: 'Miami', State: 'FL', Zip_Code: '33127' } },
      { attributes: { Record_ID: 11, Store_Name: 'Quick Stop', Store_Type: 'Convenience Store', Latitude: 25.8, Longitude: -80.21 } },
      { attributes: { Record_ID: 12, Store_Name: 'Sunday Market', Store_Type: 'Farmers and Markets', Latitude: 25.82, Longitude: -80.2, Incentive_Program: 'Fresh Access Bucks' } },
    ],
  }),
  'gisportal.ers.usda.gov': () => ({
    features: [{ attributes: { GEOID10: '12086001900', St_Name: 'Florida', Cnty_Name: 'Miami-Dade County', Urban: 1, POP2010: 4000, LILATracts_1And10: 1, LowIncomeTracts: 1, PovertyRate: 38.2, MedianFamilyIncome: 25000, LATracts_half: 1, LATracts1: 1, LATracts10: 0, HUNVFlag: 1 } }],
  }),
}

let server, base
beforeEach(async () => {
  clearCache()
  globalThis.fetch = async (url, opts) => {
    const u = String(url)
    if (u.startsWith(base)) return realFetch(url, opts)
    const key = Object.keys(fakes).find((k) => u.includes(k))
    if (!key) throw new Error('unexpected fetch ' + u)
    return new Response(JSON.stringify(fakes[key](u)), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }
  if (!server) {
    server = createApp().listen(0)
    base = `http://127.0.0.1:${server.address().port}`
  }
})
after(() => { server?.close(); globalThis.fetch = realFetch })

const get = async (path) => {
  const res = await realFetch(base + path)
  return { status: res.status, body: await res.json() }
}

test('geocode validates and returns coordinates', async () => {
  assert.equal((await get('/api/geocode?zip=abc')).status, 400)
  const { status, body } = await get('/api/geocode?zip=33127')
  assert.equal(status, 200)
  assert.equal(body.lat, 25.8)
})

test('places merges USDA + OSM, drops duplicates and non-food shops', async () => {
  const { status, body } = await get(`/api/places?lat=${LAT}&lon=${LON}`)
  assert.equal(status, 200)
  const names = body.places.map((p) => p.name)
  assert.ok(names.includes('Fresh Mart'))
  assert.ok(!names.includes('Same Store (OSM)'), 'OSM duplicate of USDA store removed')
  assert.ok(!names.includes('Quick Stop'), 'convenience store excluded')
  assert.ok(names.includes('Community Pantry'))
  assert.ok(body.places.some((p) => p.category === 'fastfood'))
  assert.equal(body.places.find((p) => p.name === 'Sunday Market').category, 'market')
  assert.equal(body.places.find((p) => p.name === 'Fresh Mart').acceptsSnap, true)
  // sorted by distance
  const miles = body.places.map((p) => p.miles)
  assert.deepEqual(miles, [...miles].sort((a, b) => a - b))
})

test('places still works when one source is down', async () => {
  const orig = fakes['overpass-api.de']
  fakes['overpass-api.de'] = () => { throw new Error('down') }
  const { status, body } = await get(`/api/places?lat=${LAT}&lon=${LON}`)
  fakes['overpass-api.de'] = orig
  assert.equal(status, 200)
  assert.equal(body.warnings.length, 1)
  assert.ok(body.places.length > 0)
})

test('food access returns USDA tract flags', async () => {
  const { body } = await get(`/api/food-access?lat=${LAT}&lon=${LON}`)
  assert.equal(body.access.foodDesert, true)
  assert.equal(body.access.lowAccess, true)
  assert.equal(body.access.urban, true)
  assert.equal(body.access.povertyRate, 38.2)
})

test('deals returns 503 with setup hint when Kroger keys are missing', async () => {
  delete process.env.KROGER_CLIENT_ID
  const { status, body } = await get('/api/deals?zip=33127')
  assert.equal(status, 503)
  assert.match(body.error, /KROGER_CLIENT_ID/)
})

test('parseDeals keeps only real sales', () => {
  const deals = parseDeals([
    { productId: 'a', description: 'Bananas', items: [{ itemId: '1', price: { regular: 1.0, promo: 0.5 } }] },
    { productId: 'b', description: 'Apples', items: [{ itemId: '1', price: { regular: 3.0, promo: 0 } }] },
    { productId: 'c', description: 'Oats', items: [{ itemId: '1', price: { regular: 2.0, promo: 2.0 } }] },
  ], 'fruit')
  assert.equal(deals.length, 1)
  assert.equal(deals[0].percentOff, 50)
})

test('fastfood endpoint and bad input', async () => {
  const ff = await get('/api/fastfood')
  assert.ok(ff.body.chains.length >= 5)
  assert.equal((await get('/api/places?lat=x&lon=1')).status, 400)
  assert.equal((await get('/api/nope')).status, 404)
})

test('deals with Kroger keys: token -> nearest store -> sale items', async () => {
  process.env.KROGER_CLIENT_ID = 'id'
  process.env.KROGER_CLIENT_SECRET = 'secret'
  fakes['api.kroger.com'] = (u) => {
    if (u.includes('/oauth2/token')) return { access_token: 'tok', expires_in: 1800 }
    if (u.includes('/v1/locations')) return { data: [{ locationId: '0100', name: 'Kroger Test', chain: 'KROGER', address: { addressLine1: '1 A St', city: 'X', state: 'OH', zipCode: '45202' }, geolocation: { latitude: 1, longitude: 2 } }] }
    if (u.includes('/v1/products')) {
      const term = new URL(u).searchParams.get('filter.term')
      return { data: term === 'bananas' ? [{ productId: 'p1', description: 'Kroger Bananas', snapEligible: true, items: [{ itemId: 'i', size: '1 lb', price: { regular: 0.69, promo: 0.49 } }] }] : [] }
    }
    throw new Error('unexpected kroger url ' + u)
  }
  const { status, body } = await get('/api/deals?zip=45202')
  delete process.env.KROGER_CLIENT_ID
  assert.equal(status, 200)
  assert.equal(body.store.locationId, '0100')
  assert.equal(body.deals.length, 1)
  assert.equal(body.deals[0].promo, 0.49)
})
