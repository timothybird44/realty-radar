import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { advertisedPrice, getProperty, searchProperties } from '../data/api';
import { estimateFor } from '../data/estimate';
import { shortDate } from '../data/format';
import { TODAY } from '../data/generate';
import { suburbLabel } from '../data/suburbs';
import { BathIcon, BedIcon, CalendarIcon, CarIcon, CheckIcon, ChevronLeft, ChevronRight, CloseIcon, HeartIcon, LandIcon, PhotoIcon } from '../Icons';
import InsightPanel from '../InsightPanel';
import PropertyCard, { ValuePill } from '../PropertyCard';
import PropertyImage, { VIEW_LABEL, viewsFor } from '../PropertyImage';
import '../styles/Property.css';

export default function Property() {
  const { id = '' } = useParams();
  const p = getProperty(id);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<string>();

  useEffect(() => { window.scrollTo(0, 0); setLightbox(null); }, [id]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(undefined), 3200); return () => clearTimeout(t); } }, [toast]);

  if (!p) {
    return (
      <main className="container" style={{ padding: '64px 20px', textAlign: 'center' }}>
        <h1>Property not found</h1>
        <p>This listing may have been removed. <Link to="/search?mode=buy">Search properties</Link></p>
      </main>
    );
  }

  const est = estimateFor(p);
  const views = viewsFor(p);
  const modeLabel = p.mode === 'buy' ? 'Buy' : p.mode === 'rent' ? 'Rent' : 'Sold';
  const similar = searchProperties({ mode: p.mode, suburbs: [p.suburb], types: [p.type], sort: 'featured' }).filter(x => x.id !== p.id).slice(0, 3);
  const inspections = p.mode === 'sold' ? [] : [`Sat ${[4, 11][p.imageSeed % 2]} Oct · 10:00am – 10:30am`, `Wed ${[8, 15][p.imageSeed % 2]} Oct · 5:30pm – 6:00pm`];

  const onEnquire = (e: React.FormEvent) => { e.preventDefault(); setToast('Demo only — enquiries aren’t sent anywhere.'); };

  return (
    <main className="prop">
      <div className="container">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to={`/search?mode=${p.mode}`}>{modeLabel}</Link><ChevronRight />
          <Link to={`/search?mode=${p.mode}&suburbs=${encodeURIComponent(p.suburb)}`}>{p.suburb}</Link><ChevronRight />
          <span>{p.address}</span>
        </nav>

        {/* ---------- Gallery ---------- */}
        <div className="gallery">
          <button className="gallery__main" onClick={() => setLightbox(0)} aria-label="Open photo gallery">
            <PropertyImage property={p} view="front" />
          </button>
          <div className="gallery__side">
            {views.slice(1, 3).map((v, i) => (
              <button key={v} onClick={() => setLightbox(i + 1)} aria-label={`Open ${VIEW_LABEL[v]} photo`}><PropertyImage property={p} view={v} /></button>
            ))}
          </div>
          <button className="gallery__all btn btn--outline btn--sm" onClick={() => setLightbox(0)}><PhotoIcon />View all {views.length} photos</button>
          <p className="gallery__note">Illustrations — this is a demo listing.</p>
        </div>

        <div className="prop-layout">
          <div className="prop-main">
            {/* ---------- Summary ---------- */}
            <div className="prop-summary">
              <div className="prop-summary__top">
                <div>
                  <div className="prop-price">{p.displayPrice}</div>
                  <h1 className="prop-address">{p.address}, {suburbLabel(p.suburb)}</h1>
                </div>
                <button className={`prop-save${saved ? ' is-saved' : ''}`} onClick={() => setSaved(s => !s)} aria-pressed={saved}><HeartIcon />{saved ? 'Saved' : 'Save'}</button>
              </div>
              <div className="prop-features">
                <span><BedIcon />{p.beds} <small>Beds</small></span>
                <span><BathIcon />{p.baths} <small>Baths</small></span>
                <span><CarIcon />{p.cars} <small>Cars</small></span>
                {p.land && <span><LandIcon />{p.land}m² <small>Land</small></span>}
                <span><LandIcon />{p.floor}m² <small>Floor</small></span>
              </div>
              <div className="prop-meta">
                <span className="pill pill--neutral">{p.type}</span>
                <span className="pill pill--neutral">Built {p.yearBuilt}</span>
                {p.saleMethod && <span className="pill pill--neutral">{p.saleMethod}</span>}
                {p.mode === 'buy' && <span className="pill pill--neutral">Listed {p.daysOnMarket} days ago</span>}
                {p.mode === 'rent' && p.availableDate && <span className="pill pill--neutral">Available {new Date(p.availableDate) <= TODAY ? 'now' : shortDate(p.availableDate)}</span>}
                {p.mode === 'sold' && <span className="pill pill--neutral">Sold {shortDate(p.soldDate!)} · {p.daysOnMarket} days on market</span>}
                <ValuePill p={p} />
              </div>
            </div>

            {inspections.length > 0 && (
              <section className="prop-section">
                <h2>Inspections</h2>
                <ul className="inspections">
                  {inspections.map(i => <li key={i}><CalendarIcon />{i}<button className="btn btn--ghost btn--sm" onClick={() => setToast('Demo only — added to your planner.')}>Add to planner</button></li>)}
                </ul>
              </section>
            )}

            <section className="prop-section">
              <h2>Property description</h2>
              <p className="prop-desc">{p.description}</p>
            </section>

            {p.features.length > 0 && (
              <section className="prop-section">
                <h2>Property features</h2>
                <ul className="feature-list">{p.features.map(f => <li key={f}><CheckIcon />{f}</li>)}</ul>
              </section>
            )}

            <section className="prop-section prop-section--insights">
              <InsightPanel
                subject={p}
                estimate={est}
                advertised={p.mode === 'sold' ? undefined : advertisedPrice(p)}
                soldPrice={p.mode === 'sold' ? p.soldPrice : undefined}
                title={p.mode === 'rent' ? 'RealtyRadar rent estimate' : p.mode === 'sold' ? 'RealtyRadar value today' : 'RealtyRadar estimate'}
              />
            </section>
          </div>

          {/* ---------- Agent ---------- */}
          <aside className="prop-aside">
            <div className="agent-card card">
              <div className="agent-card__brand" style={{ background: p.agent.agencyColor }}>{p.agent.agency}</div>
              <div className="agent-card__body">
                <div className="agent-card__who">
                  <span className="agent-card__avatar" style={{ background: p.agent.agencyColor }}>{p.agent.initials}</span>
                  <div><strong>{p.agent.name}</strong><small>{p.agent.agency}</small></div>
                </div>
                {p.mode !== 'sold' ? (
                  <form className="enquiry" onSubmit={onEnquire}>
                    <label>Name<input required placeholder="Your name" /></label>
                    <label>Email<input required type="email" placeholder="you@example.com" /></label>
                    <label>Message<textarea rows={3} defaultValue={`Hi ${p.agent.name.split(' ')[0]}, I’m interested in ${p.address} and would like more information.`} /></label>
                    <button className="btn btn--primary" type="submit">Send enquiry</button>
                  </form>
                ) : (
                  <p className="agent-card__sold">This property has sold. Contact {p.agent.name.split(' ')[0]} for an appraisal of a similar home.</p>
                )}
              </div>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="prop-similar">
            <h2 className="section-title">Similar {p.type.toLowerCase()}s in {p.suburb}</h2>
            <div className="prop-similar__grid">{similar.map(s => <PropertyCard key={s.id} p={s} compact />)}</div>
          </section>
        )}
      </div>

      {/* ---------- Lightbox ---------- */}
      {lightbox !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo gallery" onKeyDown={e => {
          if (e.key === 'Escape') setLightbox(null);
          if (e.key === 'ArrowRight') setLightbox(i => ((i ?? 0) + 1) % views.length);
          if (e.key === 'ArrowLeft') setLightbox(i => ((i ?? 0) - 1 + views.length) % views.length);
        }} tabIndex={-1} ref={el => el?.focus()}>
          <button className="lightbox__close" onClick={() => setLightbox(null)} aria-label="Close gallery"><CloseIcon /></button>
          <button className="lightbox__nav prev" onClick={() => setLightbox((lightbox - 1 + views.length) % views.length)} aria-label="Previous photo"><ChevronLeft /></button>
          <figure>
            <PropertyImage property={p} view={views[lightbox]} />
            <figcaption>{VIEW_LABEL[views[lightbox]]} · {lightbox + 1} / {views.length}</figcaption>
          </figure>
          <button className="lightbox__nav next" onClick={() => setLightbox((lightbox + 1) % views.length)} aria-label="Next photo"><ChevronRight /></button>
        </div>
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
