// USDA SNAP Retailer Locator (ArcGIS Feature Service). Free, no key.
// Hub: https://usda-snap-retailers-usda-fns.hub.arcgis.com/
import { fetchJson, distanceMiles } from '../lib/http.js'
import { cached } from '../lib/cache.js'

const SNAP_LAYER =
  process.env.SNAP_LAYER_URL ||
  'https://services1.arcgis.com/RLQu0rK7h4kbsBq5/arcgis/rest/services/snap_retailer_location_data/FeatureServer/0'

// USDA store types -> Smartfood categories. Convenience stores, specialty stores, restaurants, etc.
// are left off the healthy map. Matching is case-insensitive.
const TYPE_MAP = {
  'supermarket': 'grocery',
  'super store': 'grocery',
  'grocery store': 'grocery',
  'farmers and markets': 'market',
}

export function categorizeSnap(storeType) {
  return TYPE_MAP[(storeType || '').trim().toLowerCase()] || null
}

export function parseSnap(data, lat, lon) {
  return (data.features || [])
    .map(({ attributes: a }) => {
      if (!a || a.Latitude == null || a.Longitude == null) return null
      const category = categorizeSnap(a.Store_Type)
      if (!category) return null
      return {
        id: `snap:${a.Record_ID ?? a.ObjectId}`,
        source: 'usda-snap',
        name: a.Store_Name,
        brand: '',
        category,
        storeType: a.Store_Type,
        acceptsSnap: true,
        incentiveProgram: a.Incentive_Program || null,
        lat: a.Latitude,
        lon: a.Longitude,
        address: [a.Store_Street_Address, a.City, a.State, a.Zip_Code].filter(Boolean).join(', '),
        miles: distanceMiles(lat, lon, a.Latitude, a.Longitude),
      }
    })
    .filter(Boolean)
}

export async function findSnapRetailers(lat, lon, miles) {
  const key = `snap:${lat.toFixed(3)},${lon.toFixed(3)},${miles}`
  return cached(key, 24 * 60 * 60 * 1000, async () => {
    const params = new URLSearchParams({
      where: '1=1',
      geometry: `${lon},${lat}`,
      geometryType: 'esriGeometryPoint',
      inSR: '4326',
      spatialRel: 'esriSpatialRelIntersects',
      distance: String(miles),
      units: 'esriSRUnit_StatuteMile',
      outFields: 'Record_ID,ObjectId,Store_Name,Store_Street_Address,City,State,Zip_Code,Store_Type,Latitude,Longitude,Incentive_Program',
      returnGeometry: 'false',
      resultRecordCount: '1000',
      f: 'json',
    })
    const data = await fetchJson('USDA SNAP retailers', `${SNAP_LAYER}/query?${params}`)
    return parseSnap(data, lat, lon)
  })
}
