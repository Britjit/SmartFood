import { useEffect, useState } from 'react'
import { api, findChain } from '../lib/api'

function ChainCard({ chain, subtitle }) {
  return (
    <div className="card">
      <h3>{chain.name}</h3>
      {subtitle && <p className="muted">{subtitle}</p>}
      <h4>Better picks</h4>
      <ul>
        {chain.picks.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
      <h4>Easy swaps</h4>
      <ul>
        {chain.swaps.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </div>
  )
}

export default function FastFood({ location, places }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.fastfood().then(setData).catch((e) => setError(e.message))
  }, [])

  if (error) return <p className="status error">{error}</p>
  if (!data) return <p className="muted">Loading…</p>

  // Closest location of each chain we have tips for
  const seen = new Set()
  const nearby = []
  for (const p of places.filter((x) => x.category === 'fastfood')) {
    const chain = findChain(data.chains, p.brand || p.name)
    if (chain && !seen.has(chain.name)) {
      seen.add(chain.name)
      nearby.push({ chain, place: p })
    }
  }

  return (
    <section>
      <h2>Quick rules that work anywhere</h2>
      <ul className="tips">
        {data.generalTips.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>

      {location && (
        <>
          <h2>Near you</h2>
          {nearby.length ? (
            <div className="cards">
              {nearby.map(({ chain, place }) => (
                <ChainCard key={chain.name} chain={chain} subtitle={`${place.miles.toFixed(1)} mi away`} />
              ))}
            </div>
          ) : (
            <p className="muted">No chains we have tips for were found nearby.</p>
          )}
        </>
      )}

      <h2>All chains</h2>
      <p className="note">Menus change — check each chain's nutrition page for current items.</p>
      <div className="cards">
        {data.chains.map((c) => (
          <ChainCard key={c.name} chain={c} />
        ))}
      </div>
    </section>
  )
}
