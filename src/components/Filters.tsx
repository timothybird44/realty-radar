import { useEffect, useState } from 'react';
import { searchProperties } from './data/api';
import { PROPERTY_TYPES, type PropertyType, type SearchFilters } from './data/types';
import { moneyShort } from './data/format';
import { CloseIcon } from './Icons';
import './styles/Filters.css';

const SALE_PRICES = [250_000, 400_000, 500_000, 600_000, 700_000, 800_000, 900_000, 1_000_000, 1_200_000, 1_500_000, 1_750_000, 2_000_000, 2_500_000, 3_000_000];
const RENT_PRICES = [300, 400, 500, 600, 700, 800, 900, 1000, 1200, 1500];
const LAND = [200, 300, 400, 500, 600, 800, 1000, 1500];

interface Props {
  filters: SearchFilters;
  onApply: (f: SearchFilters) => void;
  onClose: () => void;
}

export default function Filters({ filters, onApply, onClose }: Props) {
  const [draft, setDraft] = useState<SearchFilters>(filters);
  const set = (patch: Partial<SearchFilters>) => setDraft(d => ({ ...d, ...patch }));
  const prices = draft.mode === 'rent' ? RENT_PRICES : SALE_PRICES;
  const fmtPrice = (n: number) => (draft.mode === 'rent' ? `$${n} pw` : moneyShort(n));
  const count = searchProperties(draft).length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  const toggleType = (t: PropertyType) =>
    set({ types: draft.types.includes(t) ? draft.types.filter(x => x !== t) : [...draft.types, t] });

  const Counter = ({ label, value, options, onChange }: { label: string; value?: number; options: number[]; onChange: (v?: number) => void }) => (
    <fieldset className="filters__group">
      <legend>{label}</legend>
      <div className="seg">
        <button className={value === undefined ? 'active' : ''} onClick={() => onChange(undefined)}>Any</button>
        {options.map(o => <button key={o} className={value === o ? 'active' : ''} onClick={() => onChange(o)}>{o}+</button>)}
      </div>
    </fieldset>
  );

  return (
    <div className="filters__backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="filters" role="dialog" aria-modal="true" aria-labelledby="filters-title">
        <div className="filters__head">
          <h2 id="filters-title">Filters</h2>
          <button className="filters__close" aria-label="Close filters" onClick={onClose}><CloseIcon /></button>
        </div>

        <div className="filters__body">
          <fieldset className="filters__group">
            <legend>Property type</legend>
            <div className="type-grid">
              <label className={`type-opt${draft.types.length === 0 ? ' active' : ''}`}>
                <input type="checkbox" checked={draft.types.length === 0} onChange={() => set({ types: [] })} /> All types
              </label>
              {PROPERTY_TYPES.map(t => (
                <label key={t} className={`type-opt${draft.types.includes(t) ? ' active' : ''}`}>
                  <input type="checkbox" checked={draft.types.includes(t)} onChange={() => toggleType(t)} /> {t}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="filters__group">
            <legend>{draft.mode === 'rent' ? 'Rent per week' : draft.mode === 'sold' ? 'Sold price' : 'Price'}</legend>
            <div className="price-row">
              <select aria-label="Minimum price" value={draft.priceMin ?? ''} onChange={e => set({ priceMin: e.target.value ? Number(e.target.value) : undefined })}>
                <option value="">Any min</option>
                {prices.filter(p => draft.priceMax === undefined || p < draft.priceMax).map(p => <option key={p} value={p}>{fmtPrice(p)}</option>)}
              </select>
              <span>to</span>
              <select aria-label="Maximum price" value={draft.priceMax ?? ''} onChange={e => set({ priceMax: e.target.value ? Number(e.target.value) : undefined })}>
                <option value="">Any max</option>
                {prices.filter(p => draft.priceMin === undefined || p > draft.priceMin).map(p => <option key={p} value={p}>{fmtPrice(p)}</option>)}
              </select>
            </div>
          </fieldset>

          <Counter label="Bedrooms" value={draft.bedsMin} options={[1, 2, 3, 4, 5]} onChange={v => set({ bedsMin: v })} />
          <Counter label="Bathrooms" value={draft.bathsMin} options={[1, 2, 3]} onChange={v => set({ bathsMin: v })} />
          <Counter label="Car spaces" value={draft.carsMin} options={[1, 2, 3]} onChange={v => set({ carsMin: v })} />

          <fieldset className="filters__group">
            <legend>Land size</legend>
            <select aria-label="Minimum land size" value={draft.landMin ?? ''} onChange={e => set({ landMin: e.target.value ? Number(e.target.value) : undefined })}>
              <option value="">Any size</option>
              {LAND.map(l => <option key={l} value={l}>{l}m²+</option>)}
            </select>
            <p className="filters__hint">Apartments don’t have a land size, so they’re hidden when this is set.</p>
          </fieldset>
        </div>

        <div className="filters__foot">
          <button className="btn btn--ghost" onClick={() => setDraft({ ...draft, types: [], priceMin: undefined, priceMax: undefined, bedsMin: undefined, bathsMin: undefined, carsMin: undefined, landMin: undefined })}>
            Clear filters
          </button>
          <button className="btn btn--primary" onClick={() => onApply(draft)} disabled={count === 0}>
            {count === 0 ? 'No matching properties' : `Show ${count} ${count === 1 ? 'property' : 'properties'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
