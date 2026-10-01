import { SUBURBS, type Suburb } from './suburbs';
import type { Agent, ListingMode, Property, PropertyType } from './types';

/**
 * Deterministic demo data. Every visitor sees the same fictional listings because the
 * random number generator is seeded. (The original project scraped agency websites into SQLite.)
 */

export const TODAY = new Date('2026-10-01T00:00:00');
const DAY = 86_400_000;

// ---------- Seeded random helpers ----------
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261001);
const between = (a: number, b: number) => a + rand() * (b - a);
const int = (a: number, b: number) => Math.floor(between(a, b + 1));
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
function weighted<T>(entries: [T, number][]): T {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [v, w] of entries) { if ((r -= w) <= 0) return v; }
  return entries[entries.length - 1][0];
}
function gauss(): number {
  let u = 0, v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
const roundTo = (n: number, step: number) => Math.round(n / step) * step;

// ---------- Fictional agents ----------
const AGENCIES: { name: string; color: string }[] = [
  { name: 'Bluewater Realty', color: '#0f3d91' },
  { name: 'Northside Property Co.', color: '#0e7490' },
  { name: 'Parkline Estate Agents', color: '#1e293b' },
  { name: 'Summit Residential', color: '#3730a3' },
  { name: 'Harbour & Oak', color: '#155e75' },
];
const FIRST = ['Olivia', 'Jack', 'Mia', 'Liam', 'Chloe', 'Noah', 'Grace', 'Ethan', 'Zara', 'Lucas', 'Ruby', 'Henry', 'Isla', 'Oscar', 'Ava'];
const LAST = ['Mitchell', 'Nguyen', 'Harper', 'Collins', 'Patel', 'Reid', 'Sullivan', 'Chen', 'Walsh', 'Kennedy', 'Morgan', 'Fraser'];
const AGENTS: Agent[] = AGENCIES.flatMap(a =>
  [0, 1, 2].map(() => {
    const name = `${pick(FIRST)} ${pick(LAST)}`;
    return { name, agency: a.name, agencyColor: a.color, initials: name.split(' ').map(w => w[0]).join('') };
  })
);

// ---------- Addresses ----------
const STREETS = ['Wattle', 'Banksia', 'Jacaranda', 'Grevillea', 'Kookaburra', 'Bottlebrush', 'Poinciana', 'Ironbark', 'Silky Oak',
  'Lilly Pilly', 'Paperbark', 'Frangipani', 'Brolga', 'Lorikeet', 'Waratah', 'Casuarina', 'Tallowwood', 'Blackbutt', 'Sandpiper', 'Magpie'];
const STREET_TYPES = ['Street', 'Street', 'Avenue', 'Road', 'Crescent', 'Court', 'Place', 'Terrace', 'Drive', 'Close'];

// ---------- Typical property per type (value model reference point) ----------
const TYPICAL: Record<PropertyType, { beds: number; baths: number; cars: number; floor: number; land?: number }> = {
  House: { beds: 4, baths: 2, cars: 2, floor: 220 },
  Townhouse: { beds: 3, baths: 2, cars: 1, floor: 150, land: 200 },
  Apartment: { beds: 2, baths: 1, cars: 1, floor: 85 },
};

export function typicalLand(suburb: Suburb, type: PropertyType): number | undefined {
  if (type === 'Apartment') return undefined;
  if (type === 'Townhouse') return TYPICAL.Townhouse.land;
  return Math.round((suburb.lotSize[0] + suburb.lotSize[1]) / 2);
}

/** $ per m² of land used by both the generator and the estimate adjustments. */
export function landRate(suburb: Suburb, type: PropertyType): number {
  const land = typicalLand(suburb, type);
  if (!land) return 0;
  return (suburb.median[type] * (type === 'House' ? 0.35 : 0.2)) / land;
}
/** $ per m² of internal floor area (apartments). */
export function floorRate(suburb: Suburb): number {
  return (suburb.median.Apartment * 0.6) / TYPICAL.Apartment.floor;
}

const FEATURE_POOL: Record<PropertyType, string[]> = {
  House: ['Air conditioning', 'Pool', 'Solar panels', 'Outdoor entertaining', 'Study', 'Ensuite', 'Built-in wardrobes',
    'Dishwasher', 'Fully fenced', 'Shed', 'Covered deck', 'Rainwater tank', 'Ducted air conditioning', 'Stone benchtops', 'Media room'],
  Townhouse: ['Air conditioning', 'Courtyard', 'Ensuite', 'Built-in wardrobes', 'Dishwasher', 'Secure parking',
    'Complex pool', 'Pet friendly', 'Stone benchtops', 'Low maintenance'],
  Apartment: ['Air conditioning', 'Balcony', 'Secure parking', 'Lift', 'Building gym', 'Rooftop terrace', 'Dishwasher',
    'Built-in wardrobes', 'Ensuite', 'Intercom', 'City views', 'Study nook'],
};

function makePhysical(suburb: Suburb, type: PropertyType) {
  let beds: number, baths: number, cars: number, land: number | undefined, floor: number, year: number;
  if (type === 'House') {
    beds = weighted([[2, 0.05], [3, 0.35], [4, 0.4], [5, 0.17], [6, 0.03]]);
    baths = Math.max(1, Math.min(4, beds - weighted([[1, 0.3], [2, 0.6], [3, 0.1]]) + (rand() < 0.2 ? 1 : 0)));
    cars = weighted([[1, 0.25], [2, 0.6], [3, 0.1], [4, 0.05]]);
    land = roundTo(between(suburb.lotSize[0], suburb.lotSize[1]) * (0.85 + beds * 0.05), 1);
    floor = roundTo(90 + beds * 35 + baths * 12 + gauss() * 15, 1);
    year = weighted([[int(1925, 1950), 0.25], [int(1955, 1985), 0.35], [int(1990, 2015), 0.3], [int(2016, 2025), 0.1]]);
  } else if (type === 'Townhouse') {
    beds = weighted([[2, 0.2], [3, 0.6], [4, 0.2]]);
    baths = beds >= 3 ? weighted([[2, 0.7], [3, 0.3]]) : weighted([[1, 0.4], [2, 0.6]]);
    cars = weighted([[1, 0.45], [2, 0.55]]);
    land = roundTo(between(140, 320), 1);
    floor = roundTo(70 + beds * 28 + baths * 8 + gauss() * 10, 1);
    year = int(1998, 2025);
  } else {
    beds = weighted([[1, 0.3], [2, 0.55], [3, 0.15]]);
    baths = beds === 1 ? 1 : weighted([[1, 0.35], [2, 0.65]]);
    cars = beds === 1 ? weighted([[0, 0.2], [1, 0.8]]) : weighted([[1, 0.65], [2, 0.35]]);
    land = undefined;
    floor = roundTo(35 + beds * 26 + baths * 6 + gauss() * 8, 1);
    year = int(1985, 2025);
  }
  const pool = FEATURE_POOL[type];
  const features = pool.filter(() => rand() < 0.38).slice(0, 8);
  if (!features.includes('Air conditioning') && rand() < 0.6) features.unshift('Air conditioning');
  return { beds, baths, cars, land, floor, year, features };
}

/** Today's "true" value for a property, used only to generate prices. */
function marketValue(suburb: Suburb, type: PropertyType, p: ReturnType<typeof makePhysical>, condition: number): number {
  const t = TYPICAL[type];
  let mult = 1 + 0.11 * (p.beds - t.beds) + 0.06 * (p.baths - t.baths) + 0.035 * (p.cars - t.cars);
  let value = suburb.median[type] * mult;
  if (type === 'Apartment') {
    value += (p.floor - t.floor) * floorRate(suburb) * 0.5;
  } else {
    value += ((p.land ?? 0) - (typicalLand(suburb, type) ?? 0)) * landRate(suburb, type);
  }
  if (p.features.includes('Pool')) value *= 1.03;
  if (p.year >= 2016) value *= 1.04;
  return Math.max(250_000, value * condition);
}

function rentFor(suburb: Suburb, type: PropertyType, p: ReturnType<typeof makePhysical>, condition: number): number {
  const t = TYPICAL[type];
  const mult = 1 + 0.08 * (p.beds - t.beds) + 0.04 * (p.baths - t.baths) + 0.02 * (p.cars - t.cars);
  return roundTo(suburb.rent[type] * mult * (0.6 + condition * 0.4), 10);
}

// ---------- Description ----------
function describe(suburb: Suburb, type: PropertyType, p: ReturnType<typeof makePhysical>, mode: ListingMode): string {
  const opener = pick([
    `Set in ${suburb.blurb}, this ${p.beds}-bedroom ${type.toLowerCase()} offers a relaxed lifestyle with everything you need close by.`,
    `Welcome to a light-filled ${type.toLowerCase()} in ${suburb.name}, a suburb known for ${suburb.blurb}.`,
    `Perfectly positioned in ${suburb.name}, this well-kept ${type.toLowerCase()} balances comfort, space and convenience.`,
  ]);
  const layout = type === 'Apartment'
    ? `The open-plan living and dining area flows to a ${p.features.includes('Balcony') ? 'private balcony' : 'bright living zone'}, with ${p.beds} bedroom${p.beds > 1 ? 's' : ''} and ${p.baths} bathroom${p.baths > 1 ? 's' : ''} across ${p.floor}m² of internal space.`
    : `Across ${p.floor}m² of living on a ${p.land}m² ${type === 'House' ? 'block' : 'lot'}, you’ll find ${p.beds} bedrooms, ${p.baths} bathroom${p.baths > 1 ? 's' : ''} and parking for ${p.cars}.`;
  const highlight = p.features.length
    ? `Highlights include ${p.features.slice(0, 3).map(f => f.toLowerCase()).join(', ')}.`
    : 'A blank canvas ready for your personal touch.';
  const closer = mode === 'rent'
    ? 'Book an inspection today — properties like this lease quickly.'
    : pick(['Inspections are sure to impress — don’t miss out.', 'Contact the agent today to arrange a private inspection.', 'An opportunity not to be missed in a tightly held pocket.']);
  return [opener, layout, highlight, closer].join(' ');
}

function formatShort(n: number): string {
  return n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 2).replace(/0$/, '')}m` : `$${Math.round(n / 1000)}k`;
}

// ---------- Generation ----------
let counter = 0;
function baseProperty(mode: ListingMode): { suburb: Suburb; type: PropertyType; p: ReturnType<typeof makePhysical>; condition: number; partial: Omit<Property, 'value' | 'displayPrice' | 'searchPrice' | 'daysOnMarket' | 'listedDate'> } {
  const suburb = pick(SUBURBS);
  const type = weighted(Object.entries(suburb.typeMix) as [PropertyType, number][]);
  const p = makePhysical(suburb, type);
  const condition = 1 + gauss() * 0.05;
  const num = type === 'Apartment' ? `${int(1, 24)}/${int(2, 90)}` : type === 'Townhouse' ? `${int(1, 18)}/${int(2, 120)}` : `${int(2, 160)}`;
  const street = `${pick(STREETS)} ${pick(STREET_TYPES)}`;
  counter += 1;
  return {
    suburb, type, p, condition,
    partial: {
      id: `${mode[0]}${String(counter).padStart(4, '0')}`,
      mode, type, suburb: suburb.name, postcode: suburb.postcode, street,
      address: `${num} ${street}`,
      beds: p.beds, baths: p.baths, cars: p.cars, land: p.land, floor: p.floor, yearBuilt: p.year,
      features: p.features, description: describe(suburb, type, p, mode),
      agent: pick(AGENTS), imageSeed: Math.floor(rand() * 1e9),
    },
  };
}

function makeBuy(): Property {
  const { suburb, type, p, condition, partial } = baseProperty('buy');
  const value = roundTo(marketValue(suburb, type, p, condition), 5000);
  const dom = int(1, 75);
  const method = weighted<[string, Property['saleMethod']]>([
    [['fixed', 'Private treaty'], 0.42], [['over', 'Private treaty'], 0.15], [['range', 'Private treaty'], 0.13],
    [['auction', 'Auction'], 0.18], [['contact', 'Private treaty'], 0.08], [['eoi', 'Expressions of interest'], 0.04],
  ]);
  const asking = value * (1 + 0.02 + gauss() * 0.045);
  let displayPrice: string;
  switch (method[0]) {
    case 'fixed': displayPrice = `$${(roundTo(asking, 10_000) - (rand() < 0.5 ? 1000 : 0)).toLocaleString('en-AU')}`; break;
    case 'over': displayPrice = `Offers over ${formatShort(roundTo(asking * 0.95, 25_000))}`; break;
    case 'range': { const lo = roundTo(asking * 0.96, 50_000); displayPrice = `${formatShort(lo)} – ${formatShort(lo + (lo >= 1_000_000 ? 100_000 : 50_000))}`; break; }
    case 'auction': displayPrice = `Auction ${['Sat', 'Sun'][int(0, 1)]} ${int(1, 28)} ${['Oct', 'Nov'][int(0, 1)]}`; break;
    case 'eoi': displayPrice = 'Expressions of interest'; break;
    default: displayPrice = 'Contact agent';
  }
  return {
    ...partial, value, displayPrice, saleMethod: method[1],
    searchPrice: roundTo(value * (1 + 0.02 + gauss() * 0.03), 1000),
    daysOnMarket: dom, listedDate: new Date(TODAY.getTime() - dom * DAY).toISOString(),
  };
}

function makeRent(): Property {
  const { suburb, type, p, condition, partial } = baseProperty('rent');
  const value = roundTo(marketValue(suburb, type, p, condition), 5000);
  const rent = rentFor(suburb, type, p, condition);
  const dom = int(1, 30);
  const features = rand() < 0.35 && !p.features.includes('Pet friendly') ? [...p.features, 'Pet friendly'] : p.features;
  return {
    ...partial, features, value, rentWeekly: rent,
    displayPrice: `$${rent} per week`, searchPrice: rent,
    daysOnMarket: dom, listedDate: new Date(TODAY.getTime() - dom * DAY).toISOString(),
    availableDate: new Date(TODAY.getTime() + int(0, 35) * DAY).toISOString(),
  };
}

function makeSold(): Property {
  const { suburb, type, p, condition, partial } = baseProperty('sold');
  const value = roundTo(marketValue(suburb, type, p, condition), 5000);
  const daysAgo = int(3, 720);
  const monthsAgo = daysAgo / 30.4;
  const soldPrice = roundTo((value / Math.pow(1 + suburb.growth, monthsAgo / 12)) * (1 + gauss() * 0.025), 1000);
  const soldDate = new Date(TODAY.getTime() - daysAgo * DAY);
  const dom = int(7, 90);
  return {
    ...partial, value, soldPrice, soldDate: soldDate.toISOString(),
    saleMethod: rand() < 0.25 ? 'Auction' : 'Private treaty',
    displayPrice: `$${soldPrice.toLocaleString('en-AU')}`, searchPrice: soldPrice,
    daysOnMarket: dom, listedDate: new Date(soldDate.getTime() - dom * DAY).toISOString(),
  };
}

export const BUY: Property[] = Array.from({ length: 260 }, makeBuy);
export const RENT: Property[] = Array.from({ length: 180 }, makeRent);
export const SOLD: Property[] = Array.from({ length: 1600 }, makeSold)
  .sort((a, b) => (b.soldDate! > a.soldDate! ? 1 : -1));

export const ALL: Property[] = [...BUY, ...RENT, ...SOLD];
export const BY_ID: Record<string, Property> = Object.fromEntries(ALL.map(p => [p.id, p]));
