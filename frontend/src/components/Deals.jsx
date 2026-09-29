import { useState } from 'react'
import { sampleDeals, programs } from '../data/deals'

export default function Deals() {
  const [snapOnly, setSnapOnly] = useState(false)
  const deals = snapOnly ? sampleDeals.filter((d) => d.snap) : sampleDeals

  return (
    <section>
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

      <h2>Healthy food deals</h2>
      <p className="note">Sample deals for now — real coupon data gets connected later.</p>
      <label className="toggle">
        <input type="checkbox" checked={snapOnly} onChange={(e) => setSnapOnly(e.target.checked)} /> SNAP-eligible only
      </label>
      <div className="cards">
        {deals.map((d) => (
          <div className="card deal" key={d.id}>
            <span className="tag">{d.category}</span>
            <h3>{d.item}</h3>
            <p className="deal-text">{d.deal}</p>
            <p className="muted">{d.store}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
