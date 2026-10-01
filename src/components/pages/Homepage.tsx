import { Link, useNavigate } from 'react-router-dom';
import { featured, getSuburbStats } from '../data/api';
import { estimateFor } from '../data/estimate';
import { moneyShort, pct } from '../data/format';
import { filtersToParams } from '../data/query';
import { SUBURBS } from '../data/suburbs';
import type { ListingMode } from '../data/types';
import { CheckIcon, PinIcon, RadarLogo, TrendIcon } from '../Icons';
import PropertyCard from '../PropertyCard';
import Searchbar from '../Searchbar';
import '../styles/Homepage.css';

export default function Homepage() {
  const navigate = useNavigate();
  const latest = featured('buy', 4);
  const showcase = latest.find(p => estimateFor(p).confidence === 'High') ?? latest[0];
  const showcaseEst = estimateFor(showcase);

  const search = (suburbs: string[], mode: ListingMode) =>
    navigate(`/search?${filtersToParams({ mode, suburbs, types: [], sort: 'featured' })}`);

  return (
    <main>
      {/* ---------- Hero ---------- */}
      <section className="home-hero">
        <div className="home-hero__rings" aria-hidden="true"><span /><span /><span /><i /></div>
        <div className="container home-hero__inner">
          <h1>Find the right home.<br /><span>Know what it’s really worth.</span></h1>
          <p>Search homes for sale, rent and recently sold across Brisbane’s north, with an in-depth estimate on every listing.</p>
          <Searchbar variant="hero" showTabs mode="buy" suburbs={[]} onSearch={search} />
          <div className="home-hero__popular">
            <span>Popular:</span>
            {['Kedron', 'Chermside', 'Bridgeman Downs', 'Nundah', 'Clayfield'].map(s => (
              <Link key={s} to={`/search?mode=buy&suburbs=${encodeURIComponent(s)}`}><PinIcon />{s}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Value props ---------- */}
      <section className="container home-props">
        {[
          { t: 'Estimates on every listing', d: 'Even when the agent says “Contact agent” or “Auction”, you’ll see what similar homes are selling for.' },
          { t: 'Like-for-like comparisons', d: 'Matched on suburb, property type, bedrooms, bathrooms and car spaces — then adjusted for size and timing.' },
          { t: 'Show your working', d: 'Every estimate lists the comparable sales behind it and exactly how each one was adjusted.' },
        ].map(x => (
          <div key={x.t} className="home-prop card">
            <span className="home-prop__icon"><CheckIcon /></span>
            <h3>{x.t}</h3>
            <p>{x.d}</p>
          </div>
        ))}
      </section>

      {/* ---------- Latest listings ---------- */}
      <section className="container home-section">
        <div className="home-section__head">
          <div>
            <h2 className="section-title">Fresh on the market</h2>
            <p className="section-sub">The latest homes for sale, each with a RealtyRadar estimate.</p>
          </div>
          <Link to="/search?mode=buy&sort=newest" className="btn btn--outline btn--sm">View all for sale</Link>
        </div>
        <div className="home-grid">
          {latest.map(p => <PropertyCard key={p.id} p={p} compact />)}
        </div>
      </section>

      {/* ---------- Estimate showcase ---------- */}
      <section className="home-showcase">
        <div className="container home-showcase__inner">
          <div>
            <p className="eyebrow"><RadarLogo /> The RealtyRadar difference</p>
            <h2>An estimate you can actually check</h2>
            <p>
              Most property sites give you a single number. RealtyRadar finds recent sales of properties that genuinely
              match (same suburb, same beds, baths and cars) and only widens the search when it has to. Each sale is adjusted
              for market movement since it sold and for differences in land size and features, then weighted by how close a match it is.
            </p>
            <div className="home-showcase__actions">
              <Link to="/estimate" className="btn btn--primary">Estimate my property</Link>
              <Link to="/how-it-works" className="btn btn--outline-light">How it works</Link>
            </div>
          </div>
          <Link to={`/property/${showcase.id}`} className="home-showcase__card">
            <span className="home-showcase__label">Example · {showcase.address}, {showcase.suburb}</span>
            <strong className="home-showcase__value">{moneyShort(showcaseEst.estimate)}</strong>
            <span className="home-showcase__range">Range {moneyShort(showcaseEst.low)} – {moneyShort(showcaseEst.high)} · {showcaseEst.confidence} confidence</span>
            <ul>
              {showcaseEst.comparables.slice(0, 4).map(c => (
                <li key={c.property.id}>
                  <span>{c.property.address}<small>{c.matchLevel}</small></span>
                  <span>{moneyShort(c.basePrice)} → <b>{moneyShort(c.adjustedPrice)}</b></span>
                </li>
              ))}
            </ul>
            <span className="home-showcase__more">+ {Math.max(0, showcaseEst.comparables.length - 4)} more comparables — see the full breakdown →</span>
          </Link>
        </div>
      </section>

      {/* ---------- Suburbs ---------- */}
      <section className="container home-section">
        <div className="home-section__head">
          <div>
            <h2 className="section-title">Suburb snapshot</h2>
            <p className="section-sub">Median house prices and growth over the past 12 months.</p>
          </div>
          <Link to="/suburbs" className="btn btn--outline btn--sm">All suburb insights</Link>
        </div>
        <div className="suburb-grid">
          {SUBURBS.slice(0, 8).map(s => {
            const st = getSuburbStats(s.name, 'House');
            return (
              <Link key={s.name} to={`/search?mode=buy&suburbs=${encodeURIComponent(s.name)}`} className="suburb-tile card">
                <strong>{s.name}</strong>
                <span className="suburb-tile__pc">QLD {s.postcode}</span>
                <span className="suburb-tile__median">{moneyShort(st.medianPrice)}</span>
                <span className="suburb-tile__growth"><TrendIcon />+{pct(st.growth)}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
