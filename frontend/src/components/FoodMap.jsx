import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import { CATEGORY_INFO } from '../lib/api'

function Recenter({ location }) {
  const map = useMap()
  useEffect(() => {
    if (location) map.setView([location.lat, location.lon], 14)
  }, [location, map])
  return null
}

function AccessSummary({ access, nearestGrocery }) {
  return (
    <div className="summary">
      {access && (
        <p>
          {access.foodDesert ? (
            <strong className="flag">⚠️ USDA lists this area as a food desert</strong>
          ) : access.lowAccess ? (
            <strong className="flag">USDA lists this area as low access to grocery stores</strong>
          ) : (
            <strong>USDA does not list this area as a food desert</strong>
          )}
          <span className="small">
            {' '}
            · {access.urban ? 'Urban' : 'Rural'} census tract in {access.county}
            {access.povertyRate != null && ` · ${Math.round(access.povertyRate)}% poverty rate`}
            {access.lowVehicleAccess && ' · many households without a car'}
          </span>
        </p>
      )}
      {nearestGrocery ? (
        <p>
          Nearest grocery store: <strong>{nearestGrocery.name}</strong> ({nearestGrocery.miles.toFixed(1)} mi)
        </p>
      ) : (
        <p className="flag">No grocery stores found within 2 miles.</p>
      )}
      {access && <p className="small">Source: {access.source}</p>}
    </div>
  )
}

export default function FoodMap({ location, places, access, loading }) {
  const healthy = places.filter((p) => p.category !== 'fastfood')
  const nearestGrocery = healthy.find((p) => p.category === 'grocery')

  return (
    <section>
      {location && !loading && <AccessSummary access={access} nearestGrocery={nearestGrocery} />}

      <div className="legend">
        {Object.entries(CATEGORY_INFO)
          .filter(([key]) => key !== 'fastfood')
          .map(([key, info]) => (
            <span key={key}>
              <i style={{ background: info.color }} /> {info.label}
            </span>
          ))}
      </div>

      <MapContainer center={[39.8283, -98.5795]} zoom={4} className="map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter location={location} />
        {location && (
          <CircleMarker center={[location.lat, location.lon]} radius={8} pathOptions={{ color: '#000', fillOpacity: 0.8 }}>
            <Popup>{location.label}</Popup>
          </CircleMarker>
        )}
        {healthy.map((p) => (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lon]}
            radius={7}
            pathOptions={{ color: '#fff', weight: 2, fillColor: CATEGORY_INFO[p.category].color, fillOpacity: 0.95 }}
          >
            <Popup>
              <strong>{p.name || CATEGORY_INFO[p.category].label}</strong>
              <br />
              {CATEGORY_INFO[p.category].label} · {p.miles.toFixed(1)} mi
              {p.acceptsSnap && <><br />✅ Accepts SNAP/EBT</>}
              {p.incentiveProgram && <><br />💵 {p.incentiveProgram}</>}
              {p.address && <><br />{p.address}</>}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {!location && <p className="hint">Enter a zip code or use your location to see healthy food nearby.</p>}

      {healthy.length > 0 && (
        <ul className="place-list">
          {healthy.slice(0, 25).map((p) => (
            <li key={p.id}>
              <i style={{ background: CATEGORY_INFO[p.category].color }} />
              <div>
                <strong>
                  {p.name || CATEGORY_INFO[p.category].label}
                  {p.acceptsSnap && <span className="badge">SNAP</span>}
                  {p.incentiveProgram && <span className="badge gold">SNAP match</span>}
                </strong>
                <span>
                  {CATEGORY_INFO[p.category].label} · {p.miles.toFixed(1)} mi {p.address && `· ${p.address}`}
                </span>
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}`}
                target="_blank"
                rel="noreferrer"
              >
                Directions
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
