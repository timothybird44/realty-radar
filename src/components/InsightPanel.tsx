import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSuburbStats, getTrend } from './data/api';
import { money, moneyShort, pct, shortDate, signedMoneyShort } from './data/format';
import type { Estimate, SubjectProperty } from './data/types';
import { CompScatter, RangeBar, TrendChart } from './Charts';
import { ChevronRight, InfoIcon, RadarLogo } from './Icons';
import './styles/Insights.css';

interface Props {
  subject: SubjectProperty;
  estimate: Estimate;
  advertised?: number;          // numeric advertised price, if the listing has one
  soldPrice?: number;
  title?: string;
}

const CONF_TEXT: Record<Estimate['confidence'], string> = {
  High: 'Plenty of close matches that agree with each other.',
  Medium: 'Good matches, but they vary more or the search had to widen.',
  Low: 'Few close matches — treat this as a rough guide.',
};

export default function InsightPanel({ subject, estimate, advertised, soldPrice, title = 'RealtyRadar estimate' }: Props) {
  const rent = estimate.kind === 'rent';
  const fmt = (n: number) => (rent ? `$${Math.round(n)}` : moneyShort(n));
  const fmtFull = (n: number) => (rent ? `$${Math.round(n)} pw` : money(n));
  const [open, setOpen] = useState<string | undefined>(estimate.comparables[0]?.property.id);
  const [hover, setHover] = useState<string>();
  const stats = getSuburbStats(subject.suburb, subject.type);
  const trend = getTrend(subject.suburb, subject.type);
  const sizeLabel = subject.type === 'Apartment' ? 'Floor area' : 'Land size';
  const subjectSize = subject.type === 'Apartment' ? subject.floor : subject.land ?? subject.floor;
  const gap = advertised !== undefined ? (advertised - estimate.estimate) / estimate.estimate : undefined;

  return (
    <section className="insights" aria-labelledby="insights-title">
      {/* ---------- Headline estimate ---------- */}
      <div className="insights__hero">
        <div className="insights__brand"><RadarLogo /> <span id="insights-title">{title}</span></div>
        <div className="insights__headline">
          <div>
            <div className="insights__value">{fmtFull(estimate.estimate)}</div>
            <div className="insights__range">Likely range {fmt(estimate.low)} – {fmt(estimate.high)}{rent ? ' per week' : ''}</div>
          </div>
          <div className={`conf conf--${estimate.confidence.toLowerCase()}`}>
            <span className="conf__bars" aria-hidden="true"><i /><i /><i /></span>
            <div><strong>{estimate.confidence} confidence</strong><small>{CONF_TEXT[estimate.confidence]}</small></div>
          </div>
        </div>
        <RangeBar low={estimate.low} high={estimate.high} estimate={estimate.estimate} asking={advertised ?? soldPrice} rent={rent} />
        {gap !== undefined && (
          <p className="insights__verdict">
            {Math.abs(gap) < 0.02
              ? <>The advertised price is <strong>in line with</strong> our estimate.</>
              : gap < 0
                ? <>The advertised price is <strong className="good">{pct(-gap, 0)} below</strong> our estimate — potentially good value.</>
                : <>The advertised price is <strong className="warn">{pct(gap, 0)} above</strong> our estimate.</>}
          </p>
        )}
        {soldPrice !== undefined && (
          <p className="insights__verdict">Sold for <strong>{money(soldPrice)}</strong>. Adjusted for market movement since then, we estimate it's worth about <strong>{moneyShort(estimate.estimate)}</strong> today.</p>
        )}
      </div>

      {/* ---------- Method ---------- */}
      <div className="insights__method">
        <InfoIcon />
        <div>
          <strong>How this estimate was built</strong>
          <p>
            We looked for {rent ? 'rentals' : 'recent sales'} of {subject.type.toLowerCase()}s with <b>{subject.beds} bed</b>, <b>{subject.baths} bath</b> and <b>{subject.cars} car</b> in {subject.suburb}.
            {' '}{estimate.searchNote} Each comparable is adjusted for its differences — {rent ? 'bedrooms, bathrooms and car spaces' : `market movement since it sold, ${sizeLabel.toLowerCase()}, bedrooms, bathrooms and car spaces`} —
            then weighted by how closely it matches. <Link to="/how-it-works">Learn more</Link>
          </p>
        </div>
      </div>

      {/* ---------- Comparables ---------- */}
      <div className="insights__block">
        <h3>{estimate.comparables.length} comparable {rent ? 'rentals' : 'sales'}</h3>
        <p className="insights__sub">Click a property to see how its price was adjusted to match this one.</p>
        <div className="comps">
          <div className="comps__head">
            <span>Property</span><span>{rent ? 'Rent' : 'Sold'}</span><span>Adjusted</span><span>Weight</span>
          </div>
          {estimate.comparables.map(c => {
            const isOpen = open === c.property.id;
            const total = c.adjustedPrice - c.basePrice;
            return (
              <Fragment key={c.property.id}>
                <button className={`comps__row${isOpen ? ' is-open' : ''}${hover === c.property.id ? ' is-hover' : ''}`}
                  onClick={() => setOpen(isOpen ? undefined : c.property.id)}
                  onMouseEnter={() => setHover(c.property.id)} onMouseLeave={() => setHover(undefined)} aria-expanded={isOpen}>
                  <span className="comps__prop">
                    <ChevronRight className="comps__chev" />
                    <span>
                      <strong>{c.property.address}, {c.property.suburb}</strong>
                      <small>{c.property.beds} bed · {c.property.baths} bath · {c.property.cars} car · {c.property.type === 'Apartment' ? `${c.property.floor}m² floor` : `${c.property.land}m² land`}
                        {!rent && c.property.soldDate && <> · sold {shortDate(c.property.soldDate)}</>}</small>
                      <small className="comps__match">{c.matchLevel}</small>
                    </span>
                  </span>
                  <span className="comps__num">{fmt(c.basePrice)}</span>
                  <span className="comps__num comps__adj">{fmt(c.adjustedPrice)}<small className={total >= 0 ? 'up' : 'down'}>{rent ? `${total >= 0 ? '+' : '−'}$${Math.abs(Math.round(total))}` : signedMoneyShort(total)}</small></span>
                  <span className="comps__weight"><i style={{ width: `${Math.round(c.weight * 100)}%` }} /><small>{Math.round(c.weight * 100)}%</small></span>
                </button>
                {isOpen && (
                  <div className="comps__detail">
                    <ul>
                      <li><span>{rent ? 'Advertised rent' : 'Sold price'}</span><span>{fmtFull(c.basePrice)}</span></li>
                      {c.adjustments.length === 0 && <li className="muted"><span>No adjustments needed — identical features</span><span /></li>}
                      {c.adjustments.map(a => (
                        <li key={a.label}><span>{a.label}</span><span className={a.amount >= 0 ? 'up' : 'down'}>{a.amount >= 0 ? '+' : '−'}{rent ? `$${Math.abs(Math.round(a.amount))}` : money(Math.abs(a.amount))}</span></li>
                      ))}
                      <li className="total"><span>Adjusted to this property</span><span>{fmtFull(c.adjustedPrice)}</span></li>
                    </ul>
                    <Link to={`/property/${c.property.id}`}>View this {rent ? 'rental' : 'sale'} <ChevronRight /></Link>
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>

      {estimate.comparables.length > 0 && (
        <div className="insights__block">
          <h3>Where this property sits</h3>
          <p className="insights__sub">
            Grey dots are the original {rent ? 'rents' : 'sale prices'}; blue dots are after adjustment (bigger = closer match).
            The orange diamond is this property with its estimated range.
          </p>
          <CompScatter comps={estimate.comparables} subjectSize={subjectSize} estimate={estimate.estimate} low={estimate.low} high={estimate.high}
            sizeLabel={sizeLabel} rent={rent} highlight={hover} onHover={setHover} />
        </div>
      )}

      {/* ---------- Suburb ---------- */}
      <div className="insights__block">
        <h3>{subject.suburb} market · {subject.type.toLowerCase()}s</h3>
        <div className="stat-grid">
          <div className="stat"><span>Median price</span><strong>{moneyShort(stats.medianPrice)}</strong></div>
          <div className="stat"><span>12-month growth</span><strong className="good">+{pct(stats.growth)}</strong></div>
          <div className="stat"><span>Median rent</span><strong>${Math.round(stats.medianRent)} pw</strong></div>
          <div className="stat"><span>Gross rental yield</span><strong>{pct(stats.grossYield)}</strong></div>
          <div className="stat"><span>Days on market</span><strong>{stats.medianDaysOnMarket}</strong></div>
          <div className="stat"><span>Sales (12 months)</span><strong>{stats.salesLast12}</strong></div>
        </div>
        <h4 className="insights__charttitle">Median {subject.type.toLowerCase()} price, last 24 months</h4>
        <TrendChart data={trend} />
      </div>
    </section>
  );
}
