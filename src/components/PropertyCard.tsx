import { useState } from 'react';
import { Link } from 'react-router-dom';
import { priceVsEstimate } from './data/api';
import { estimateFor } from './data/estimate';
import { moneyShort, shortDate } from './data/format';
import type { Property } from './data/types';
import { BathIcon, BedIcon, CarIcon, HeartIcon, LandIcon, PhotoIcon, RadarLogo } from './Icons';
import PropertyImage, { viewsFor } from './PropertyImage';
import './styles/PropertyCard.css';

export function FeaturesRow({ p }: { p: Property }) {
  return (
    <div className="features-row">
      <span title="Bedrooms"><BedIcon />{p.beds}</span>
      <span title="Bathrooms"><BathIcon />{p.baths}</span>
      <span title="Car spaces"><CarIcon />{p.cars}</span>
      {p.land ? <span title="Land size"><LandIcon />{p.land}m²</span> : <span title="Floor area"><LandIcon />{p.floor}m²</span>}
      <span className="features-row__type">{p.type}</span>
    </div>
  );
}

export function ValuePill({ p }: { p: Property }) {
  const gap = priceVsEstimate(p);
  if (gap === undefined) return null;
  const abs = Math.abs(gap * 100);
  if (abs < 2) return <span className="pill pill--blue">In line with estimate</span>;
  if (gap < 0) return <span className="pill pill--good">{abs.toFixed(0)}% below estimate</span>;
  return <span className={`pill ${abs > 6 ? 'pill--bad' : 'pill--warn'}`}>{abs.toFixed(0)}% above estimate</span>;
}

export default function PropertyCard({ p, compact = false }: { p: Property; compact?: boolean }) {
  const [saved, setSaved] = useState(false);
  const est = estimateFor(p);
  const rent = est.kind === 'rent';
  const fmt = (n: number) => (rent ? `$${n}` : moneyShort(n));

  return (
    <article className={`pcard${compact ? ' pcard--compact' : ''}`}>
      <div className="pcard__brand" style={{ background: p.agent.agencyColor }}>
        <span>{p.agent.agency}</span>
        <span className="pcard__agent"><span className="avatar">{p.agent.initials}</span>{!compact && p.agent.name}</span>
      </div>
      <Link to={`/property/${p.id}`} className="pcard__media" aria-label={`View ${p.address}, ${p.suburb}`}>
        <PropertyImage property={p} />
        <span className="pcard__count"><PhotoIcon />{viewsFor(p).length}</span>
        {p.mode === 'buy' && p.daysOnMarket <= 7 && <span className="pcard__tag">New</span>}
        {p.mode === 'sold' && <span className="pcard__tag pcard__tag--sold">Sold {shortDate(p.soldDate!)}</span>}
      </Link>
      <button className={`pcard__save${saved ? ' is-saved' : ''}`} aria-label={saved ? 'Unsave property' : 'Save property'} onClick={() => setSaved(s => !s)}>
        <HeartIcon />
      </button>

      <div className="pcard__body">
        <div className="pcard__price">{p.displayPrice}</div>
        <Link to={`/property/${p.id}`} className="pcard__address">{p.address}, {p.suburb}</Link>
        <FeaturesRow p={p} />
      </div>

      <Link to={`/property/${p.id}`} className="pcard__estimate">
        <RadarLogo className="pcard__radar" />
        <div>
          <span className="pcard__estimate-label">{p.mode === 'sold' ? 'RR value today' : rent ? 'RR rent estimate' : 'RR estimate'}</span>
          <strong>{fmt(est.low)} – {fmt(est.high)}{rent ? ' pw' : ''}</strong>
        </div>
        <div className="pcard__estimate-right">
          <ValuePill p={p} />
          <span className="pcard__conf">{compact ? `${est.comparables.length} comps · ${est.confidence}` : `${est.comparables.length} comparables · ${est.confidence} confidence`}</span>
        </div>
      </Link>
    </article>
  );
}
