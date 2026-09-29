import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { programs } from '../data/programs'

function KrogerDeals({ zip }) {
  const [state, setState] = useState({ loading: false, data: null, error: null })
  const [snapOnly, setSnapOnly] = useState(false)

  useEffect(() => {
    if (!zip) return
    let cancelled = false
    setState({ loading: true, data: null, error: null })
    api
      .deals(zip)
      .then((data) => !cancelled && setState({ loading: false, data, error: null }))
      .catch((error) => !cancelled && setState({ loading: false, data: null, error }))
    return () => {
      cancelled = true
    }
  }, [zip])

  if (!zip) return <p className="muted">Search by zip code to see sales on healthy food at a nearby store.</p>
  if (state.loading) return <p className="muted">Checking prices…</p>
  if (state.error?.status === 503)
    return <p className="note">Deals aren't set up yet. Add your Kroger API keys to backend/.env (see backend/README.md).</p>
  if (state.error) return <p className="status error">{state.error.message}</p>
  if (!state.data?.store) return <p className="muted">No Kroger-family store within 10 miles of {zip}.</p>

  const { store, deals } = state.data
  const shown = snapOnly ? deals.filter((d) => d.snapEligible) : deals

  return (
    <>
      <p className="muted">
        Live sale prices at <strong>{store.name}</strong> — {store.address}
      </p>
      <label className="toggle">
        <input type="checkbox" checked={snapOnly} onChange={(e) => setSnapOnly(e.target.checked)} /> SNAP-eligible only
      </label>
      {shown.length === 0 ? (
        <p className="muted">No healthy staples on sale there right now.</p>
      ) : (
        <div className="cards">
          {shown.map((d) => (
            <div className="card deal" key={d.id}>
              {d.image && <img src={d.image} alt="" className="deal-img" />}
              <span className="tag">{d.percentOff}% off</span>
              <h3>{d.name}</h3>
              <p className="deal-text">
                ${d.promo.toFixed(2)} <s>${d.regular.toFixed(2)}</s>
              </p>
              <p className="muted">
                {d.size}
                {d.snapEligible && ' · SNAP eligible'}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default function Deals({ zip }) {
  return (
    <section>
      <h2>Healthy food on sale</h2>
      <KrogerDeals zip={zip} />

      <h2>Programs that stretch your food budget</h2>
      <div className="cards">
        {programs.map((p) => (
          <div className="card" key={p.name}>
            <h3>{p.name}</h3>
            <p>{p.about}</p>
            <a href={p.url} target="_blank" rel="noreferrer">
              Learn more →
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}
