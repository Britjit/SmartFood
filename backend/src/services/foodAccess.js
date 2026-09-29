// USDA ERS Food Access Research Atlas (2019 data), census-tract level. Free, no key.
// Docs: https://ers.usda.gov/developer/geospatial-apis
import { fetchJson } from '../lib/http.js'
import { cached } from '../lib/cache.js'

const FARA_LAYER =
  process.env.FARA_LAYER_URL || 'https://gisportal.ers.usda.gov/server/rest/services/FARA/FARA_2019/MapServer/30'

const FIELDS = [
  'GEOID10', 'St_Name', 'Cnty_Name', 'Urban', 'POP2010',
  'LILATracts_1And10', 'LILATracts_halfAnd10', 'LowIncomeTracts', 'PovertyRate', 'MedianFamilyIncome',
  'LATracts_half', 'LATracts1', 'LATracts10', 'HUNVFlag',
]

const flag = (v) => v === 1 || v === '1'

export function parseFoodAccess(data) {
  const a = data.features?.[0]?.attributes
  if (!a) return null
  const urban = flag(a.Urban)
  const lowIncome = flag(a.LowIncomeTracts)
  // USDA "low access": urban tracts use 1 mile, rural tracts use 10 miles
  const lowAccess = urban ? flag(a.LATracts1) : flag(a.LATracts10)
  return {
    tract: a.GEOID10,
    state: a.St_Name,
    county: a.Cnty_Name,
    urban,
    population: a.POP2010,
    lowIncome,
    lowAccess,
    lowAccessHalfMile: flag(a.LATracts_half),
    foodDesert: flag(a.LILATracts_1And10), // USDA's main "low income & low access" definition
    lowVehicleAccess: flag(a.HUNVFlag),
    povertyRate: a.PovertyRate,
    medianFamilyIncome: a.MedianFamilyIncome,
    source: 'USDA ERS Food Access Research Atlas (2019)',
  }
}

export async function getFoodAccess(lat, lon) {
  return cached(`fara:${lat.toFixed(4)},${lon.toFixed(4)}`, 7 * 24 * 60 * 60 * 1000, async () => {
    const params = new URLSearchParams({
      geometry: `${lon},${lat}`,
      geometryType: 'esriGeometryPoint',
      inSR: '4326',
      spatialRel: 'esriSpatialRelIntersects',
      outFields: FIELDS.join(','),
      returnGeometry: 'false',
      f: 'json',
    })
    const data = await fetchJson('USDA Food Access Atlas', `${FARA_LAYER}/query?${params}`)
    return parseFoodAccess(data)
  })
}
