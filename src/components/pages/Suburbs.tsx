import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getSuburbStats, getTrend } from '../data/api';
import { moneyShort, pct } from '../data/format';
import { SUBURBS } from '../data/suburbs';
import { PROPERTY_TYPES, type PropertyType } from '../data/types';
import { TrendChart } from '../Charts';
import '../styles/Pages.css';

export default function Suburbs() {
  const [type, setType] = useState<PropertyType>('House');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'growth' | 'yield'>('name');
  const location = useLocation();
  const [selected, setSelected] = useState<string>(() => decodeURIComponent(location.hash.replace('#', '')) || 'Kedron');

  useEffect(() => {
    const h = decodeURIComponent(location.hash.replace('#', ''));
    if (h && SUBURBS.some(s => s.name === h)) setSelected(h);
  }, [location.hash]);

  const rows = SUBURBS.map(s => getSuburbStats(s.name, type)).sort((a, b) =>
    sortBy === 'price' ? b.medianPrice - a.medianPrice :
    sortBy === 'growth' ? b.growth - a.growth :
    sortBy === 'yield' ? b.grossYield - a.grossYield : a.suburb.name.localeCompare(b.suburb.name));
  const sel = getSuburbStats(selected, type);

  return (
    <main className="container page">
      <header className="page-head">
        <h1>Suburb insights</h1>
        <p>Median prices, growth, rents and yields for each suburb, calculated from the sales and rentals behind every RealtyRadar estimate.</p>
      </header>

      <div className="seg seg--inline" role="radiogroup" aria-label="Property type">
        {PROPERTY_TYPES.map(t => <button key={t} className={type === t ? 'active' : ''} aria-pressed={type === t} onClick={() => setType(t)}>{t}s</button>)}
      </div>

      <div className="suburbs-layout">
        <div className="card table-card">
          <table className="suburb-table">
            <thead>
              <tr>
                <th><button onClick={() => setSortBy('name')} className={sortBy === 'name' ? 'active' : ''}>Suburb</button></th>
                <th><button onClick={() => setSortBy('price')} className={sortBy === 'price' ? 'active' : ''}>Median</button></th>
                <th><button onClick={() => setSortBy('growth')} className={sortBy === 'growth' ? 'active' : ''}>Growth</button></th>
                <th className="hide-sm">Rent</th>
                <th><button onClick={() => setSortBy('yield')} className={sortBy === 'yield' ? 'active' : ''}>Yield</button></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.suburb.name} className={r.suburb.name === selected ? 'selected' : ''} onClick={() => setSelected(r.suburb.name)}>
                  <td><strong>{r.suburb.name}</strong><small>{r.suburb.postcode}</small></td>
                  <td>{moneyShort(r.medianPrice)}</td>
                  <td className="good">+{pct(r.growth)}</td>
                  <td className="hide-sm">${Math.round(r.medianRent)}</td>
                  <td>{pct(r.grossYield)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="card suburb-detail" id={selected}>
          <h2>{selected}</h2>
          <p className="suburb-detail__blurb">Known for {sel.suburb.blurb}.</p>
          <div className="stat-grid">
            <div className="stat"><span>Median {type.toLowerCase()}</span><strong>{moneyShort(sel.medianPrice)}</strong></div>
            <div className="stat"><span>12-month growth</span><strong className="good">+{pct(sel.growth)}</strong></div>
            <div className="stat"><span>Days on market</span><strong>{sel.medianDaysOnMarket}</strong></div>
          </div>
          <h4 className="insights__charttitle">Median {type.toLowerCase()} price, last 24 months</h4>
          <TrendChart data={getTrend(selected, type)} />
          <div className="suburb-detail__links">
            <Link className="btn btn--primary btn--sm" to={`/search?mode=buy&suburbs=${encodeURIComponent(selected)}&types=${type}`}>{sel.forSale} for sale</Link>
            <Link className="btn btn--outline btn--sm" to={`/search?mode=rent&suburbs=${encodeURIComponent(selected)}&types=${type}`}>{sel.forRent} for rent</Link>
            <Link className="btn btn--outline btn--sm" to={`/search?mode=sold&suburbs=${encodeURIComponent(selected)}&types=${type}`}>Recently sold</Link>
          </div>
          <p className="suburb-detail__nb">Neighbouring suburbs used when there aren’t enough local comparables: {sel.suburb.neighbours.join(', ')}.</p>
        </aside>
      </div>
    </main>
  );
}
