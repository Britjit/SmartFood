import express from 'express'
import cors from 'cors'
import { geocodeZip } from './services/osm.js'
import { findNearbyPlaces } from './services/places.js'
import { getFoodAccess } from './services/foodAccess.js'
import { getHealthyDeals, krogerConfigured } from './services/kroger.js'
import { chains, generalTips } from './services/fastfood.js'

function parseLatLon(q) {
  const lat = parseFloat(q.lat)
  const lon = parseFloat(q.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    const err = new Error('lat and lon query params are required')
    err.status = 400
    throw err
  }
  return { lat, lon }
}

function parseZip(q) {
  if (!/^\d{5}$/.test(q.zip || '')) {
    const err = new Error('zip must be a 5-digit zip code')
    err.status = 400
    throw err
  }
  return q.zip
}

export function createApp() {
  const app = express()
  app.use(cors())

  app.get('/api/health', (req, res) => {
    res.json({ ok: true, kroger: krogerConfigured() })
  })

  app.get('/api/geocode', async (req, res) => {
    res.json(await geocodeZip(parseZip(req.query)))
  })

  app.get('/api/places', async (req, res) => {
    const { lat, lon } = parseLatLon(req.query)
    const miles = Math.min(Math.max(parseFloat(req.query.miles) || 2, 0.5), 10)
    res.json(await findNearbyPlaces(lat, lon, miles))
  })

  app.get('/api/food-access', async (req, res) => {
    const { lat, lon } = parseLatLon(req.query)
    res.json({ access: await getFoodAccess(lat, lon) })
  })

  app.get('/api/deals', async (req, res) => {
    res.json(await getHealthyDeals(parseZip(req.query)))
  })

  app.get('/api/fastfood', (req, res) => {
    res.json({ chains, generalTips })
  })

  app.use((req, res) => res.status(404).json({ error: 'Not found' }))

  // Express 5 forwards async errors here
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    const status = err.status || 500
    if (status >= 500) console.error(err.message)
    res.status(status).json({ error: err.message })
  })

  return app
}
