// fetch wrapper: identifies the app (Nominatim requires a User-Agent), times out, and throws readable errors.
export const USER_AGENT = process.env.SMARTFOOD_USER_AGENT || 'Smartfood/0.1 (student project)'

export class UpstreamError extends Error {
  constructor(service, message, status = 502) {
    super(`${service}: ${message}`)
    this.service = service
    this.status = status
  }
}

export async function fetchJson(service, url, options = {}) {
  let res
  try {
    res = await fetch(url, {
      ...options,
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json', ...(options.headers || {}) },
      signal: AbortSignal.timeout(options.timeoutMs || 20000),
    })
  } catch (err) {
    throw new UpstreamError(service, `request failed (${err.name === 'TimeoutError' ? 'timed out' : err.message})`)
  }
  if (!res.ok) throw new UpstreamError(service, `responded ${res.status}`)
  const data = await res.json()
  // ArcGIS returns HTTP 200 with an error object on bad queries
  if (data && data.error) throw new UpstreamError(service, data.error.message || 'returned an error')
  return data
}

export function distanceMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}
