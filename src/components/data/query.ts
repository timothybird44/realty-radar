import { PROPERTY_TYPES, type ListingMode, type PropertyType, type SearchFilters, type SortOption } from './types';

const num = (v: string | null) => (v !== null && v !== '' && !isNaN(Number(v)) ? Number(v) : undefined);

export function filtersFromParams(params: URLSearchParams): SearchFilters {
  const mode = (['buy', 'rent', 'sold'].includes(params.get('mode') ?? '') ? params.get('mode') : 'buy') as ListingMode;
  return {
    mode,
    suburbs: (params.get('suburbs') ?? '').split(',').filter(Boolean),
    types: (params.get('types') ?? '').split(',').filter((t): t is PropertyType => PROPERTY_TYPES.includes(t as PropertyType)),
    priceMin: num(params.get('pmin')),
    priceMax: num(params.get('pmax')),
    bedsMin: num(params.get('beds')),
    bathsMin: num(params.get('baths')),
    carsMin: num(params.get('cars')),
    landMin: num(params.get('land')),
    sort: (params.get('sort') as SortOption) || 'featured',
  };
}

export function filtersToParams(f: SearchFilters): string {
  const p = new URLSearchParams();
  p.set('mode', f.mode);
  if (f.suburbs.length) p.set('suburbs', f.suburbs.join(','));
  if (f.types.length) p.set('types', f.types.join(','));
  if (f.priceMin !== undefined) p.set('pmin', String(f.priceMin));
  if (f.priceMax !== undefined) p.set('pmax', String(f.priceMax));
  if (f.bedsMin !== undefined) p.set('beds', String(f.bedsMin));
  if (f.bathsMin !== undefined) p.set('baths', String(f.bathsMin));
  if (f.carsMin !== undefined) p.set('cars', String(f.carsMin));
  if (f.landMin !== undefined) p.set('land', String(f.landMin));
  if (f.sort !== 'featured') p.set('sort', f.sort);
  return p.toString();
}

export function activeFilterCount(f: SearchFilters): number {
  return [f.types.length > 0, f.priceMin !== undefined || f.priceMax !== undefined, f.bedsMin !== undefined,
    f.bathsMin !== undefined, f.carsMin !== undefined, f.landMin !== undefined].filter(Boolean).length;
}

export const MODE_LABEL: Record<ListingMode, string> = { buy: 'Buy', rent: 'Rent', sold: 'Sold' };
