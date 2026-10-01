import { RENT, SOLD, TODAY, floorRate, landRate } from './generate';
import { SUBURB_BY_NAME } from './suburbs';
import type { Comparable, Estimate, Property, SubjectProperty } from './types';

/**
 * RealtyRadar estimate
 * --------------------
 * 1. Find comparable properties, starting with the tightest match (same suburb, same type,
 *    same beds/baths/cars) and only widening the search when there aren't enough results.
 * 2. Adjust each comparable's price for its differences from the subject property:
 *    market movement since it sold, land/floor size, beds, baths, cars and suburb.
 * 3. Weight each comparable by how similar it is, and take the weighted average.
 *    The range comes from the weighted spread of the adjusted prices.
 */

const MIN_COMPS = 6;
const MAX_COMPS = 8;

// Value of one extra bed/bath/car space as a share of the suburb median (sale / rent)
const FEATURE_VALUE = {
  sale: { beds: 0.11, baths: 0.06, cars: 0.035 },
  rent: { beds: 0.08, baths: 0.04, cars: 0.02 },
};

interface Tier {
  label: string;
  neighbour: boolean;
  test: (s: SubjectProperty, p: Property) => boolean;
}

const same = (a: number, b: number) => a === b;
const near = (a: number, b: number, d = 1) => Math.abs(a - b) <= d;

const TIERS: Tier[] = [
  { label: 'Same suburb · same beds, baths & cars', neighbour: false,
    test: (s, p) => same(s.beds, p.beds) && same(s.baths, p.baths) && same(s.cars, p.cars) },
  { label: 'Same suburb · same beds, similar baths & cars', neighbour: false,
    test: (s, p) => same(s.beds, p.beds) && near(s.baths, p.baths) && near(s.cars, p.cars) },
  { label: 'Same suburb · within 1 bedroom', neighbour: false,
    test: (s, p) => near(s.beds, p.beds) && near(s.baths, p.baths) && near(s.cars, p.cars, 2) },
  { label: 'Neighbouring suburbs · same beds, similar baths & cars', neighbour: true,
    test: (s, p) => same(s.beds, p.beds) && near(s.baths, p.baths) && near(s.cars, p.cars) },
  { label: 'Neighbouring suburbs · within 1 bedroom', neighbour: true,
    test: (s, p) => near(s.beds, p.beds) && near(s.baths, p.baths) && near(s.cars, p.cars, 2) },
];

function monthsBetween(iso: string | undefined): number {
  if (!iso) return 0;
  return Math.max(0, (TODAY.getTime() - new Date(iso).getTime()) / (86_400_000 * 30.4));
}

function sizeOf(p: { type: string; land?: number; floor: number }): number {
  return p.type === 'Apartment' ? p.floor : (p.land ?? p.floor);
}

function similarity(s: SubjectProperty, p: Property, neighbour: boolean, months: number): number {
  const sizeDiff = Math.abs(sizeOf(p) - sizeOf(s)) / Math.max(1, sizeOf(s));
  const score =
    Math.abs(s.beds - p.beds) * 1.0 +
    Math.abs(s.baths - p.baths) * 0.5 +
    Math.abs(s.cars - p.cars) * 0.3 +
    sizeDiff * 2 +
    (months / 24) * 0.5 +
    (neighbour ? 0.8 : 0);
  return 1 / Math.pow(1 + score, 2);
}

function describeMatch(s: SubjectProperty, p: Property, neighbour: boolean): string {
  const diffs: string[] = [];
  if (p.beds !== s.beds) diffs.push(`${p.beds > s.beds ? '+' : ''}${p.beds - s.beds} bed`);
  if (p.baths !== s.baths) diffs.push(`${p.baths > s.baths ? '+' : ''}${p.baths - s.baths} bath`);
  if (p.cars !== s.cars) diffs.push(`${p.cars > s.cars ? '+' : ''}${p.cars - s.cars} car`);
  const where = neighbour ? `Nearby (${p.suburb})` : 'Same suburb';
  return diffs.length ? `${where} · ${diffs.join(', ')}` : `${where} · exact bed/bath/car match`;
}

export function estimateValue(subject: SubjectProperty, kind: 'sale' | 'rent'): Estimate {
  const suburb = SUBURB_BY_NAME[subject.suburb];
  const pool = (kind === 'sale' ? SOLD : RENT).filter(p => p.type === subject.type && p.id !== subject.id);
  const inSuburb = pool.filter(p => p.suburb === subject.suburb);
  const inNeighbours = pool.filter(p => suburb.neighbours.includes(p.suburb));

  // 1. Widen the search tier by tier until there are enough comparables
  const chosen = new Map<string, { p: Property; neighbour: boolean }>();
  let tierUsed = TIERS[0];
  for (const tier of TIERS) {
    for (const p of tier.neighbour ? inNeighbours : inSuburb) {
      if (!chosen.has(p.id) && tier.test(subject, p)) chosen.set(p.id, { p, neighbour: tier.neighbour });
    }
    tierUsed = tier;
    if (chosen.size >= MIN_COMPS) break;
  }

  const fv = FEATURE_VALUE[kind];
  const medianHere = kind === 'sale' ? suburb.median[subject.type] : suburb.rent[subject.type];

  // 2. Adjust each comparable to the subject property
  const comps: Comparable[] = [...chosen.values()].map(({ p, neighbour }) => {
    const compSuburb = SUBURB_BY_NAME[p.suburb];
    const base = kind === 'sale' ? p.soldPrice! : p.rentWeekly!;
    const months = kind === 'sale' ? monthsBetween(p.soldDate) : 0;
    const adjustments: { label: string; amount: number }[] = [];

    if (kind === 'sale' && months > 0.5) {
      const moved = base * (Math.pow(1 + compSuburb.growth, months / 12) - 1);
      adjustments.push({ label: `Market movement (${Math.round(months)} mo)`, amount: moved });
    }
    if (neighbour) {
      const ratio = kind === 'sale'
        ? suburb.median[subject.type] / compSuburb.median[subject.type]
        : suburb.rent[subject.type] / compSuburb.rent[subject.type];
      const running = base + adjustments.reduce((s, a) => s + a.amount, 0);
      adjustments.push({ label: `Suburb difference (${p.suburb})`, amount: running * (ratio - 1) });
    }
    if (p.beds !== subject.beds) adjustments.push({ label: 'Bedrooms', amount: (subject.beds - p.beds) * fv.beds * medianHere });
    if (p.baths !== subject.baths) adjustments.push({ label: 'Bathrooms', amount: (subject.baths - p.baths) * fv.baths * medianHere });
    if (p.cars !== subject.cars) adjustments.push({ label: 'Car spaces', amount: (subject.cars - p.cars) * fv.cars * medianHere });
    if (kind === 'sale') {
      if (subject.type === 'Apartment') {
        const d = subject.floor - p.floor;
        if (d !== 0) adjustments.push({ label: `Floor area (${d > 0 ? '+' : ''}${d}m²)`, amount: d * floorRate(suburb) * 0.5 });
      } else if (subject.land && p.land) {
        const d = subject.land - p.land;
        if (d !== 0) adjustments.push({ label: `Land size (${d > 0 ? '+' : ''}${d}m²)`, amount: d * landRate(suburb, subject.type) });
      }
    }

    const adjustedPrice = base + adjustments.reduce((s, a) => s + a.amount, 0);
    return {
      property: p, basePrice: base, monthsAgo: months, adjustments, adjustedPrice,
      weight: similarity(subject, p, neighbour, months),
      matchLevel: describeMatch(subject, p, neighbour),
    };
  });

  // 3. Keep the most similar comparables and take the weighted average
  comps.sort((a, b) => b.weight - a.weight);
  const top = comps.slice(0, MAX_COMPS);
  const totalW = top.reduce((s, c) => s + c.weight, 0) || 1;
  top.forEach(c => (c.weight = c.weight / totalW));

  const step = kind === 'sale' ? 5000 : 5;
  if (top.length === 0) {
    return { estimate: medianHere, low: medianHere * 0.85, high: medianHere * 1.15, confidence: 'Low', comparables: [], kind,
      searchNote: 'No comparable properties found — showing the suburb median.' };
  }
  const est = top.reduce((s, c) => s + c.adjustedPrice * c.weight, 0);
  const variance = top.reduce((s, c) => s + c.weight * Math.pow(c.adjustedPrice - est, 2), 0);
  const sd = Math.sqrt(variance);
  // Individual properties vary in condition and finish in ways comparables can't capture,
  // so the range never gets narrower than ±5.5%
  const spread = Math.max(sd * 1.4, est * 0.055);
  const cv = sd / est;

  const tierIndex = TIERS.indexOf(tierUsed);
  const confidence: Estimate['confidence'] =
    top.length >= 6 && tierIndex <= 1 && cv < 0.05 ? 'High' :
    top.length >= 4 && cv < 0.1 ? 'Medium' : 'Low';

  const round = (n: number) => Math.round(n / step) * step;
  return {
    estimate: round(est), low: round(est - spread), high: round(est + spread), confidence, comparables: top, kind,
    searchNote: tierIndex === 0
      ? `Found enough exact matches in ${subject.suburb} (same beds, baths and car spaces).`
      : `Search widened to “${tierUsed.label}” to find ${top.length} good comparables.`,
  };
}

// Cache estimates for listings so result cards don't recompute
const cache = new Map<string, Estimate>();
export function estimateFor(p: Property): Estimate {
  const key = p.id;
  let e = cache.get(key);
  if (!e) {
    e = estimateValue(p, p.mode === 'rent' ? 'rent' : 'sale');
    cache.set(key, e);
  }
  return e;
}
