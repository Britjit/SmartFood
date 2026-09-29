import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import { CATEGORY_INFO } from '../lib/places'

function Recenter({ location }) {
  const map = useMap()
  useEffect(() => {
    if (location) map.setView([location.lat, location.lon], 14)
  }, [location, map])
  return null
}

export default function FoodMap({ location, places }) {
  const healthy = places.filter((p) => p.category !== 'fastfood')
  const nearestGrocery = places.find((p) => p.category === 'grocery')

  return (
    <section>
      {location && (
        <div className="summary">
          {nearestGrocery ? (
            <p>
              Nearest grocery store: <strong>{nearestGrocery.name}</strong> ({nearestGrocery.miles.toFixed(1)} mi)
              {nearestGrocery.miles > 1 && (
                <span className="flag"> — over 1 mile away, which the USDA uses as a low-access marker in urban areas.</span>
              )}
            </p>
          ) : (
            <p className="flag">No grocery stores found within about 2 miles. This area may be a food desert.</p>
          )}
        </div>
      )}

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
            pathOptions={{ color: CATEGORY_INFO[p.category].color, fillOpacity: 0.85 }}
          >
            <Popup>
              <strong>{p.name}</strong>
              <br />
              {CATEGORY_INFO[p.category].label} · {p.miles.toFixed(1)} mi
              {p.address && (
                <>
                  <br />
                  {p.address}
                </>
              )}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {!location && <p className="hint">Enter a zip code or use your location to see healthy food nearby.</p>}

      {healthy.length > 0 && (
        <ul className="place-list">
          {healthy.slice(0, 20).map((p) => (
            <li key={p.id}>
              <i style={{ background: CATEGORY_INFO[p.category].color }} />
              <div>
                <strong>{p.name}</strong>
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
