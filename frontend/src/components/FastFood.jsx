import { chains, generalTips, findChain } from '../data/fastfood'

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
  // Nearby fast food spots that match a chain we have tips for (closest one per chain)
  const seen = new Set()
  const nearby = []
  for (const p of places.filter((x) => x.category === 'fastfood')) {
    const chain = findChain(p.brand || p.name)
    if (chain && !seen.has(chain.name)) {
      seen.add(chain.name)
      nearby.push({ chain, place: p })
    }
  }

  return (
    <section>
      <h2>Quick rules that work anywhere</h2>
      <ul className="tips">
        {generalTips.map((t) => (
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
        {chains.map((c) => (
          <ChainCard key={c.name} chain={c} />
        ))}
      </div>
    </section>
  )
}
