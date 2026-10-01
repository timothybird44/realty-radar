import { BUY, BY_ID, RENT, SOLD, TODAY } from './generate';
import { estimateFor } from './estimate';
import { SUBURBS, SUBURB_BY_NAME, type Suburb } from './suburbs';
import type { ListingMode, Property, PropertyType, SearchFilters } from './types';

/**
 * Demo "API". The original RealtyRadar read scraped listings from a SQLite database;
 * this demo serves generated data from memory with the same kind of query functions.
 */

const LISTINGS: Record<ListingMode, Property[]> = { buy: BUY, rent: RENT, sold: SOLD };

export function getProperty(id: string): Property | undefined {
  return BY_ID[id];
}

export function suggestSuburbs(query: string, exclude: string[] = []): Suburb[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SUBURBS
    .filter(s => !exclude.includes(s.name))
    .filter(s => s.name.toLowerCase().includes(q) || s.postcode.startsWith(q))
    .sort((a, b) => Number(b.name.toLowerCase().startsWith(q)) - Number(a.name.toLowerCase().startsWith(q)))
    .slice(0, 6);
}

/** Numeric advertised price if the agent published one ("$1,249,000", "Offers over $1.2m", "$1.1m – $1.2m"). */
export function advertisedPrice(p: Property): number | undefined {
  if (p.mode === 'rent') return p.rentWeekly;
  if (p.mode === 'sold') return p.soldPrice;
  const nums = [...p.displayPrice.matchAll(/\$([\d,.]+)(m|k)?/gi)].map(m => {
    const n = parseFloat(m[1].replace(/,/g, ''));
    return m[2]?.toLowerCase() === 'm' ? n * 1_000_000 : m[2]?.toLowerCase() === 'k' ? n * 1000 : n;
  });
  if (!nums.length) return undefined;
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}

/** How the advertised price compares with the RealtyRadar estimate (negative = priced below estimate). */
export function priceVsEstimate(p: Property): number | undefined {
  const adv = advertisedPrice(p);
  if (adv === undefined || p.mode === 'sold') return undefined;
  const est = estimateFor(p).estimate;
  return (adv - est) / est;
}

export function searchProperties(f: SearchFilters): Property[] {
  let results = LISTINGS[f.mode].filter(p =>
    (f.suburbs.length === 0 || f.suburbs.includes(p.suburb)) &&
    (f.types.length === 0 || f.types.includes(p.type)) &&
    (f.priceMin === undefined || p.searchPrice >= f.priceMin) &&
    (f.priceMax === undefined || p.searchPrice <= f.priceMax) &&
    (f.bedsMin === undefined || p.beds >= f.bedsMin) &&
    (f.bathsMin === undefined || p.baths >= f.bathsMin) &&
    (f.carsMin === undefined || p.cars >= f.carsMin) &&
    (f.landMin === undefined || (p.land ?? 0) >= f.landMin)
  );

  const byDate = (p: Property) => (p.mode === 'sold' ? p.soldDate! : p.listedDate);
  switch (f.sort) {
    case 'price-asc': results = [...results].sort((a, b) => a.searchPrice - b.searchPrice); break;
    case 'price-desc': results = [...results].sort((a, b) => b.searchPrice - a.searchPrice); break;
    case 'newest': results = [...results].sort((a, b) => (byDate(b) > byDate(a) ? 1 : -1)); break;
    case 'value': results = [...results].sort((a, b) => valueScore(a) - valueScore(b)); break;
    default: results = [...results].sort((a, b) => featuredScore(a) - featuredScore(b));
  }
  return results;
}

function valueScore(p: Property): number {
  const gap = priceVsEstimate(p);
  if (gap !== undefined) return gap;
  return (p.searchPrice - estimateFor(p).estimate) / estimateFor(p).estimate + 0.05; // hidden prices rank after comparable ones
}
function featuredScore(p: Property): number {
  // Newer listings first, with a stable pseudo-random shuffle so it doesn't look like a plain date sort
  const days = p.mode === 'sold' ? (TODAY.getTime() - new Date(p.soldDate!).getTime()) / 86_400_000 : p.daysOnMarket;
  return days + (p.imageSeed % 9);
}

export function featured(mode: ListingMode, count: number): Property[] {
  return searchProperties({ mode, suburbs: [], types: [], sort: 'featured' }).slice(0, count);
}

// ---------- Suburb insights ----------
function median(values: number[]): number {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export interface SuburbStats {
  suburb: Suburb;
  type: PropertyType;
  medianPrice: number;
  growth: number;
  salesLast12: number;
  medianDaysOnMarket: number;
  medianRent: number;
  grossYield: number;
  forSale: number;
  forRent: number;
}

export function getSuburbStats(name: string, type: PropertyType): SuburbStats {
  const suburb = SUBURB_BY_NAME[name];
  const yearAgo = new Date(TODAY.getTime() - 365 * 86_400_000).toISOString();
  const sold = SOLD.filter(p => p.suburb === name && p.type === type && p.soldDate! >= yearAgo);
  const rents = RENT.filter(p => p.suburb === name && p.type === type).map(p => p.rentWeekly!);
  const medianPrice = sold.length >= 3 ? median(sold.map(p => p.soldPrice!)) : suburb.median[type];
  const medianRent = rents.length >= 2 ? median(rents) : suburb.rent[type];
  return {
    suburb, type, medianPrice, growth: suburb.growth,
    salesLast12: sold.length,
    medianDaysOnMarket: Math.round(median(sold.map(p => p.daysOnMarket)) || 28),
    medianRent, grossYield: (medianRent * 52) / medianPrice,
    forSale: BUY.filter(p => p.suburb === name && p.type === type).length,
    forRent: RENT.filter(p => p.suburb === name && p.type === type).length,
  };
}

/** 24-month median price trend for a suburb and property type. */
export function getTrend(name: string, type: PropertyType): { month: string; value: number }[] {
  const s = SUBURB_BY_NAME[name];
  const out: { month: string; value: number }[] = [];
  for (let m = 24; m >= 0; m--) {
    const d = new Date(TODAY.getFullYear(), TODAY.getMonth() - m, 1);
    const wobble = 1 + 0.012 * Math.sin((m + s.name.length) * 1.3) + 0.006 * Math.cos(m * 2.1);
    out.push({
      month: d.toLocaleDateString('en-AU', { month: 'short', year: '2-digit' }),
      value: (s.median[type] / Math.pow(1 + s.growth, m / 12)) * wobble,
    });
  }
  return out;
}

export function suburbSummaries() {
  return SUBURBS.map(s => ({ suburb: s, forSale: BUY.filter(p => p.suburb === s.name).length }));
}
