import { useMemo, useState } from 'react';
import { estimateValue } from '../data/estimate';
import { typicalLand } from '../data/generate';
import { SUBURBS, SUBURB_BY_NAME } from '../data/suburbs';
import { PROPERTY_TYPES, type PropertyType, type SubjectProperty } from '../data/types';
import InsightPanel from '../InsightPanel';
import '../styles/Pages.css';

function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="stepper">
      <span>{label}</span>
      <div>
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Fewer ${label.toLowerCase()}`}>−</button>
        <output aria-live="polite">{value}</output>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`More ${label.toLowerCase()}`}>+</button>
      </div>
    </div>
  );
}

const DEFAULTS: Record<PropertyType, Pick<SubjectProperty, 'beds' | 'baths' | 'cars' | 'floor'>> = {
  House: { beds: 4, baths: 2, cars: 2, floor: 230 },
  Townhouse: { beds: 3, baths: 2, cars: 1, floor: 150 },
  Apartment: { beds: 2, baths: 2, cars: 1, floor: 90 },
};

export default function Estimate() {
  const [kind, setKind] = useState<'sale' | 'rent'>('sale');
  const [subject, setSubject] = useState<SubjectProperty>({ suburb: 'Kedron', type: 'House', ...DEFAULTS.House, land: 607 });
  const set = (patch: Partial<SubjectProperty>) => setSubject(s => ({ ...s, ...patch }));

  const changeType = (type: PropertyType) =>
    set({ type, ...DEFAULTS[type], land: typicalLand(SUBURB_BY_NAME[subject.suburb], type) });

  const estimate = useMemo(() => estimateValue(subject, kind), [subject, kind]);

  return (
    <main className="container page">
      <header className="page-head">
        <h1>Estimate my property</h1>
        <p>Tell us about your property and we’ll find the most similar {kind === 'sale' ? 'recent sales' : 'rentals'} nearby, adjust them to match, and show you the working.</p>
      </header>

      <div className="estimate-layout">
        <form className="estimate-form card" onSubmit={e => e.preventDefault()}>
          <div className="seg seg--wide" role="radiogroup" aria-label="Estimate type">
            <button type="button" className={kind === 'sale' ? 'active' : ''} aria-pressed={kind === 'sale'} onClick={() => setKind('sale')}>Sale value</button>
            <button type="button" className={kind === 'rent' ? 'active' : ''} aria-pressed={kind === 'rent'} onClick={() => setKind('rent')}>Rental value</button>
          </div>

          <label className="field">
            <span>Suburb</span>
            <select value={subject.suburb} onChange={e => set({ suburb: e.target.value, land: subject.type === 'Apartment' ? undefined : subject.land })}>
              {SUBURBS.map(s => <option key={s.name} value={s.name}>{s.name}, QLD {s.postcode}</option>)}
            </select>
          </label>

          <div className="field">
            <span>Property type</span>
            <div className="seg seg--wide">
              {PROPERTY_TYPES.map(t => <button type="button" key={t} className={subject.type === t ? 'active' : ''} aria-pressed={subject.type === t} onClick={() => changeType(t)}>{t}</button>)}
            </div>
          </div>

          <div className="stepper-grid">
            <Stepper label="Bedrooms" value={subject.beds} min={1} max={6} onChange={beds => set({ beds })} />
            <Stepper label="Bathrooms" value={subject.baths} min={1} max={4} onChange={baths => set({ baths })} />
            <Stepper label="Car spaces" value={subject.cars} min={0} max={4} onChange={cars => set({ cars })} />
          </div>

          {subject.type !== 'Apartment' ? (
            <label className="field">
              <span>Land size (m²)</span>
              <input type="number" min={100} max={5000} step={1} value={subject.land ?? ''} onChange={e => set({ land: Number(e.target.value) || undefined })} />
            </label>
          ) : (
            <label className="field">
              <span>Internal floor area (m²)</span>
              <input type="number" min={30} max={400} step={1} value={subject.floor} onChange={e => set({ floor: Number(e.target.value) || 0 })} />
            </label>
          )}
          <p className="estimate-form__note">The estimate updates as you change the details.</p>
        </form>

        <div>
          <InsightPanel subject={subject} estimate={estimate} title={kind === 'sale' ? 'Estimated sale value' : 'Estimated weekly rent'} />
        </div>
      </div>
    </main>
  );
}
