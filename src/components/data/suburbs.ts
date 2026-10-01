import type { PropertyType } from './types';

/**
 * Suburb profiles used to generate the demo data.
 * Figures are illustrative only and are not real market data.
 */
export interface Suburb {
  name: string;
  postcode: string;
  region: string;
  median: Record<PropertyType, number>;       // median sale price today
  rent: Record<PropertyType, number>;         // median weekly rent
  growth: number;                             // annual growth rate (e.g. 0.07 = 7%)
  typeMix: Record<PropertyType, number>;      // share of listings by type
  lotSize: [number, number];                  // typical house land range (m²)
  neighbours: string[];
  blurb: string;
}

export const SUBURBS: Suburb[] = [
  { name: 'Bridgeman Downs', postcode: '4035', region: 'North', growth: 0.068,
    median: { House: 1_380_000, Townhouse: 860_000, Apartment: 620_000 },
    rent: { House: 880, Townhouse: 690, Apartment: 560 },
    typeMix: { House: 0.8, Townhouse: 0.15, Apartment: 0.05 }, lotSize: [600, 2000],
    neighbours: ['Carseldine', 'McDowall', 'Aspley', 'Albany Creek'],
    blurb: 'leafy, family-friendly streets on larger blocks' },
  { name: 'Carseldine', postcode: '4034', region: 'North', growth: 0.071,
    median: { House: 1_050_000, Townhouse: 760_000, Apartment: 560_000 },
    rent: { House: 760, Townhouse: 640, Apartment: 520 },
    typeMix: { House: 0.65, Townhouse: 0.25, Apartment: 0.1 }, lotSize: [450, 800],
    neighbours: ['Bridgeman Downs', 'Aspley', 'Zillmere', 'Geebung'],
    blurb: 'a quiet pocket close to the train line and Carseldine Village' },
  { name: 'Aspley', postcode: '4034', region: 'North', growth: 0.066,
    median: { House: 1_080_000, Townhouse: 740_000, Apartment: 540_000 },
    rent: { House: 770, Townhouse: 630, Apartment: 510 },
    typeMix: { House: 0.65, Townhouse: 0.2, Apartment: 0.15 }, lotSize: [500, 850],
    neighbours: ['Carseldine', 'Chermside', 'Geebung', 'Bridgeman Downs', 'McDowall'],
    blurb: 'an established suburb with easy access to Aspley Hypermarket and Gympie Road' },
  { name: 'McDowall', postcode: '4053', region: 'North', growth: 0.064,
    median: { House: 1_320_000, Townhouse: 880_000, Apartment: 600_000 },
    rent: { House: 860, Townhouse: 700, Apartment: 540 },
    typeMix: { House: 0.85, Townhouse: 0.12, Apartment: 0.03 }, lotSize: [550, 1100],
    neighbours: ['Bridgeman Downs', 'Everton Park', 'Stafford Heights', 'Aspley', 'Chermside'],
    blurb: 'elevated streets with bushland reserves and top-rated schools' },
  { name: 'Chermside', postcode: '4032', region: 'North', growth: 0.072,
    median: { House: 1_020_000, Townhouse: 780_000, Apartment: 590_000 },
    rent: { House: 760, Townhouse: 660, Apartment: 580 },
    typeMix: { House: 0.4, Townhouse: 0.2, Apartment: 0.4 }, lotSize: [405, 700],
    neighbours: ['Kedron', 'Aspley', 'Geebung', 'Stafford Heights', 'Wavell Heights'],
    blurb: 'a vibrant hub anchored by Westfield Chermside and the Prince Charles Hospital precinct' },
  { name: 'Kedron', postcode: '4031', region: 'Inner North', growth: 0.075,
    median: { House: 1_280_000, Townhouse: 880_000, Apartment: 640_000 },
    rent: { House: 850, Townhouse: 720, Apartment: 590 },
    typeMix: { House: 0.55, Townhouse: 0.2, Apartment: 0.25 }, lotSize: [405, 810],
    neighbours: ['Chermside', 'Wavell Heights', 'Stafford', 'Wooloowin', 'Nundah'],
    blurb: 'character homes, Kedron Brook parklands and quick access to the city' },
  { name: 'Wavell Heights', postcode: '4012', region: 'Inner North', growth: 0.07,
    median: { House: 1_230_000, Townhouse: 850_000, Apartment: 610_000 },
    rent: { House: 820, Townhouse: 690, Apartment: 560 },
    typeMix: { House: 0.8, Townhouse: 0.12, Apartment: 0.08 }, lotSize: [450, 810],
    neighbours: ['Kedron', 'Nundah', 'Chermside', 'Geebung'],
    blurb: 'post-war homes on generous blocks with city glimpses from the ridgeline' },
  { name: 'Geebung', postcode: '4034', region: 'North', growth: 0.078,
    median: { House: 960_000, Townhouse: 720_000, Apartment: 520_000 },
    rent: { House: 730, Townhouse: 620, Apartment: 500 },
    typeMix: { House: 0.7, Townhouse: 0.2, Apartment: 0.1 }, lotSize: [405, 700],
    neighbours: ['Chermside', 'Aspley', 'Zillmere', 'Wavell Heights', 'Carseldine'],
    blurb: 'an affordable, well-connected suburb on the Shorncliffe train line' },
  { name: 'Zillmere', postcode: '4034', region: 'North', growth: 0.082,
    median: { House: 820_000, Townhouse: 640_000, Apartment: 470_000 },
    rent: { House: 680, Townhouse: 590, Apartment: 470 },
    typeMix: { House: 0.6, Townhouse: 0.25, Apartment: 0.15 }, lotSize: [405, 700],
    neighbours: ['Geebung', 'Carseldine', 'Aspley'],
    blurb: 'one of the northside’s best-value suburbs with strong recent growth' },
  { name: 'Stafford', postcode: '4053', region: 'Inner North', growth: 0.069,
    median: { House: 1_120_000, Townhouse: 800_000, Apartment: 580_000 },
    rent: { House: 800, Townhouse: 680, Apartment: 550 },
    typeMix: { House: 0.55, Townhouse: 0.25, Apartment: 0.2 }, lotSize: [405, 750],
    neighbours: ['Kedron', 'Everton Park', 'Stafford Heights', 'Wooloowin'],
    blurb: 'a convenient inner-north suburb with Stafford City and easy Kedron Brook access' },
  { name: 'Stafford Heights', postcode: '4053', region: 'North', growth: 0.067,
    median: { House: 1_090_000, Townhouse: 790_000, Apartment: 560_000 },
    rent: { House: 780, Townhouse: 660, Apartment: 530 },
    typeMix: { House: 0.8, Townhouse: 0.15, Apartment: 0.05 }, lotSize: [500, 810],
    neighbours: ['Stafford', 'Chermside', 'McDowall', 'Everton Park'],
    blurb: 'quiet hillside streets with views across the northern suburbs' },
  { name: 'Everton Park', postcode: '4053', region: 'North', growth: 0.065,
    median: { House: 1_060_000, Townhouse: 780_000, Apartment: 560_000 },
    rent: { House: 780, Townhouse: 660, Apartment: 530 },
    typeMix: { House: 0.6, Townhouse: 0.25, Apartment: 0.15 }, lotSize: [450, 800],
    neighbours: ['Stafford', 'McDowall', 'Stafford Heights'],
    blurb: 'a family favourite with parks, cafés and Brookside Shopping Centre nearby' },
  { name: 'Nundah', postcode: '4012', region: 'Inner North', growth: 0.071,
    median: { House: 1_300_000, Townhouse: 900_000, Apartment: 620_000 },
    rent: { House: 860, Townhouse: 730, Apartment: 600 },
    typeMix: { House: 0.45, Townhouse: 0.2, Apartment: 0.35 }, lotSize: [405, 700],
    neighbours: ['Wavell Heights', 'Kedron', 'Clayfield', 'Wooloowin'],
    blurb: 'a lively village with its own high street, train station and dining strip' },
  { name: 'Wooloowin', postcode: '4030', region: 'Inner North', growth: 0.073,
    median: { House: 1_350_000, Townhouse: 910_000, Apartment: 600_000 },
    rent: { House: 860, Townhouse: 720, Apartment: 580 },
    typeMix: { House: 0.6, Townhouse: 0.15, Apartment: 0.25 }, lotSize: [405, 700],
    neighbours: ['Kedron', 'Stafford', 'Nundah', 'Clayfield'],
    blurb: 'tree-lined streets of Queenslanders a short train ride from the CBD' },
  { name: 'Clayfield', postcode: '4011', region: 'Inner North', growth: 0.062,
    median: { House: 2_050_000, Townhouse: 1_150_000, Apartment: 720_000 },
    rent: { House: 1_050, Townhouse: 820, Apartment: 620 },
    typeMix: { House: 0.55, Townhouse: 0.15, Apartment: 0.3 }, lotSize: [500, 1000],
    neighbours: ['Ascot', 'Nundah', 'Wooloowin', 'Hamilton'],
    blurb: 'grand character homes and prestigious schools' },
  { name: 'Ascot', postcode: '4007', region: 'Inner North', growth: 0.058,
    median: { House: 2_400_000, Townhouse: 1_300_000, Apartment: 780_000 },
    rent: { House: 1_150, Townhouse: 880, Apartment: 650 },
    typeMix: { House: 0.55, Townhouse: 0.1, Apartment: 0.35 }, lotSize: [500, 1100],
    neighbours: ['Clayfield', 'Hamilton'],
    blurb: 'Brisbane’s blue-chip racecourse suburb with Racecourse Road dining' },
  { name: 'Hamilton', postcode: '4007', region: 'Inner North', growth: 0.057,
    median: { House: 2_600_000, Townhouse: 1_400_000, Apartment: 850_000 },
    rent: { House: 1_250, Townhouse: 950, Apartment: 700 },
    typeMix: { House: 0.35, Townhouse: 0.1, Apartment: 0.55 }, lotSize: [450, 1000],
    neighbours: ['Ascot', 'Clayfield'],
    blurb: 'riverside living close to Portside Wharf and the Northshore precinct' },
];

export const SUBURB_BY_NAME: Record<string, Suburb> = Object.fromEntries(SUBURBS.map(s => [s.name, s]));

export function suburbLabel(name: string): string {
  const s = SUBURB_BY_NAME[name];
  return s ? `${s.name}, QLD ${s.postcode}` : name;
}
