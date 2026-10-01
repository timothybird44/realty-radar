import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getSuburbStats, searchProperties } from '../data/api';
import { moneyShort, pct } from '../data/format';
import { activeFilterCount, filtersFromParams, filtersToParams, MODE_LABEL } from '../data/query';
import { suburbLabel } from '../data/suburbs';
import { PROPERTY_TYPES, type ListingMode, type SearchFilters, type SortOption } from '../data/types';
import Filters from '../Filters';
import { ChevronLeft, ChevronRight, CloseIcon, FilterIcon, RadarLogo } from '../Icons';
import PropertyCard from '../PropertyCard';
import Searchbar from '../Searchbar';
import '../styles/Search.css';

const PAGE_SIZE = 10;

const SORTS: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price (low to high)' },
  { value: 'price-desc', label: 'Price (high to low)' },
  { value: 'value', label: 'Best value vs estimate' },
];

export default function Search() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const filters = useMemo(() => filtersFromParams(params), [params]);
  const [showFilters, setShowFilters] = useState(false);
  const page = Math.max(1, Number(params.get('page')) || 1);

  const results = useMemo(() => searchProperties(filters), [filters]);
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const shown = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { window.scrollTo(0, 0); }, [params]);

  const update = (next: SearchFilters, nextPage = 1) => {
    const q = filtersToParams(next);
    navigate(`/search?${q}${nextPage > 1 ? `&page=${nextPage}` : ''}`);
  };

  const where = filters.suburbs.length === 0 ? 'Brisbane North'
    : filters.suburbs.length === 1 ? suburbLabel(filters.suburbs[0])
    : `${filters.suburbs.slice(0, -1).join(', ')} & ${filters.suburbs[filters.suburbs.length - 1]}`;
  const heading = filters.mode === 'buy' ? `Real estate & property for sale in ${where}`
    : filters.mode === 'rent' ? `Properties for rent in ${where}` : `Sold properties in ${where}`;

  const fmtPrice = (n: number) => (filters.mode === 'rent' ? `$${n} pw` : moneyShort(n));
  const chips: { label: string; clear: Partial<SearchFilters> }[] = [];
  if (filters.priceMin !== undefined || filters.priceMax !== undefined)
    chips.push({ label: `${filters.priceMin !== undefined ? fmtPrice(filters.priceMin) : 'Any'} – ${filters.priceMax !== undefined ? fmtPrice(filters.priceMax) : 'Any'}`, clear: { priceMin: undefined, priceMax: undefined } });
  if (filters.bedsMin !== undefined) chips.push({ label: `${filters.bedsMin}+ beds`, clear: { bedsMin: undefined } });
  if (filters.bathsMin !== undefined) chips.push({ label: `${filters.bathsMin}+ baths`, clear: { bathsMin: undefined } });
  if (filters.carsMin !== undefined) chips.push({ label: `${filters.carsMin}+ cars`, clear: { carsMin: undefined } });
  if (filters.landMin !== undefined) chips.push({ label: `${filters.landMin}m²+ land`, clear: { landMin: undefined } });

  const count = activeFilterCount(filters);
  const singleSuburb = filters.suburbs.length === 1 ? filters.suburbs[0] : undefined;

  return (
    <main className="search-page">
      <div className="search-top">
        <div className="container">
          <div className="mode-tabs" role="tablist">
            {(Object.keys(MODE_LABEL) as ListingMode[]).map(m => (
              <button key={m} role="tab" aria-selected={filters.mode === m} className={filters.mode === m ? 'active' : ''}
                onClick={() => update({ ...filters, mode: m, priceMin: undefined, priceMax: undefined, sort: filters.sort === 'value' && m === 'sold' ? 'featured' : filters.sort })}>
                {MODE_LABEL[m]}
              </button>
            ))}
          </div>
          <Searchbar key={`${filters.mode}|${filters.suburbs.join(',')}`} mode={filters.mode} suburbs={filters.suburbs}
            onSearch={(suburbs, mode) => update({ ...filters, suburbs, mode })}>
            <button className="btn btn--outline filters-btn" onClick={() => setShowFilters(true)}>
              <FilterIcon /><span>Filters</span>{count > 0 && <span className="filters-btn__count">{count}</span>}
            </button>
          </Searchbar>
          <div className="quick-filters">
            {PROPERTY_TYPES.map(t => {
              const on = filters.types.includes(t);
              return (
                <button key={t} className={`qchip${on ? ' active' : ''}`} aria-pressed={on}
                  onClick={() => update({ ...filters, types: on ? filters.types.filter(x => x !== t) : [...filters.types, t] })}>{t}</button>
              );
            })}
            {chips.map(c => (
              <button key={c.label} className="qchip active removable" onClick={() => update({ ...filters, ...c.clear })}>
                {c.label}<CloseIcon />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container search-layout">
        <section className="results">
          <div className="results__head">
            <div>
              <h1>{heading}</h1>
              <p>{results.length === 0 ? 'No properties match your search' : `${results.length} ${results.length === 1 ? 'property' : 'properties'}`}{results.length > PAGE_SIZE && ` · showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, results.length)}`}</p>
            </div>
            <label className="sort">
              <span>Sort</span>
              <select value={filters.sort} onChange={e => update({ ...filters, sort: e.target.value as SortOption })}>
                {SORTS.filter(s => !(filters.mode === 'sold' && s.value === 'value')).map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </label>
          </div>

          {results.length === 0 ? (
            <div className="empty card">
              <h2>No matches</h2>
              <p>Try removing a filter or adding a neighbouring suburb.</p>
              <button className="btn btn--primary" onClick={() => update({ mode: filters.mode, suburbs: filters.suburbs, types: [], sort: filters.sort })}>Clear filters</button>
            </div>
          ) : (
            <div className="results__list">
              {shown.map(p => <PropertyCard key={p.id} p={p} />)}
            </div>
          )}

          {pages > 1 && (
            <nav className="pager" aria-label="Pagination">
              <button disabled={page === 1} onClick={() => update(filters, page - 1)} aria-label="Previous page"><ChevronLeft /></button>
              {Array.from({ length: pages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === pages || Math.abs(n - page) <= 1)
                .map((n, i, arr) => (
                  <span key={n} className="pager__group">
                    {i > 0 && n - arr[i - 1] > 1 && <span className="pager__gap">…</span>}
                    <button className={n === page ? 'active' : ''} aria-current={n === page ? 'page' : undefined} onClick={() => update(filters, n)}>{n}</button>
                  </span>
                ))}
              <button disabled={page === pages} onClick={() => update(filters, page + 1)} aria-label="Next page"><ChevronRight /></button>
            </nav>
          )}
        </section>

        <aside className="search-aside">
          {singleSuburb && (() => {
            const st = getSuburbStats(singleSuburb, filters.types.length === 1 ? filters.types[0] : 'House');
            return (
              <div className="aside-card card">
                <h3>{singleSuburb} market</h3>
                <p className="aside-card__sub">{st.type}s · last 12 months</p>
                <dl>
                  <div><dt>Median price</dt><dd>{moneyShort(st.medianPrice)}</dd></div>
                  <div><dt>Annual growth</dt><dd className="good">+{pct(st.growth)}</dd></div>
                  <div><dt>Median rent</dt><dd>${Math.round(st.medianRent)} pw</dd></div>
                  <div><dt>Rental yield</dt><dd>{pct(st.grossYield)}</dd></div>
                  <div><dt>Days on market</dt><dd>{st.medianDaysOnMarket}</dd></div>
                </dl>
                <Link to={`/suburbs#${encodeURIComponent(singleSuburb)}`}>More suburb insights →</Link>
              </div>
            );
          })()}
          <div className="aside-card aside-card--blue">
            <RadarLogo className="aside-card__logo" />
            <h3>Every listing has an estimate</h3>
            <p>We compare each property with recent {filters.mode === 'rent' ? 'rentals' : 'sales'} that have the same beds, baths and car spaces in the same suburb, and show you exactly how we got there.</p>
            <Link to="/estimate" className="btn btn--primary btn--sm">Estimate my property</Link>
          </div>
        </aside>
      </div>

      {showFilters && <Filters filters={filters} onClose={() => setShowFilters(false)} onApply={f => { setShowFilters(false); update(f); }} />}
    </main>
  );
}
