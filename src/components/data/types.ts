export type ListingMode = 'buy' | 'rent' | 'sold';
export type PropertyType = 'House' | 'Townhouse' | 'Apartment';

export const PROPERTY_TYPES: PropertyType[] = ['House', 'Townhouse', 'Apartment'];

export interface Agent {
  name: string;
  agency: string;
  agencyColor: string;
  initials: string;
}

export interface Property {
  id: string;
  mode: ListingMode;
  type: PropertyType;
  suburb: string;
  postcode: string;
  street: string;
  address: string;          // e.g. "12 Wattle Street"
  beds: number;
  baths: number;
  cars: number;
  land?: number;            // m² (houses & townhouses)
  floor: number;            // internal floor area m²
  yearBuilt: number;
  features: string[];
  description: string;
  agent: Agent;
  imageSeed: number;

  /** Underlying "true" market value today (hidden from UI — used to generate prices). */
  value: number;

  // buy listings
  displayPrice: string;     // what the agent advertises ("Offers over $1.2m", "Auction", ...)
  searchPrice: number;      // numeric price used for filtering/sorting (sale price, weekly rent, or sold price)
  saleMethod?: 'Private treaty' | 'Auction' | 'Expressions of interest';
  daysOnMarket: number;
  listedDate: string;       // ISO

  // sold records
  soldPrice?: number;
  soldDate?: string;        // ISO

  // rent listings
  rentWeekly?: number;
  availableDate?: string;
}

export interface SearchFilters {
  mode: ListingMode;
  suburbs: string[];
  types: PropertyType[];
  priceMin?: number;
  priceMax?: number;
  bedsMin?: number;
  bathsMin?: number;
  carsMin?: number;
  landMin?: number;
  sort: SortOption;
}

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'value';

export interface Comparable {
  property: Property;
  basePrice: number;        // sold price (or weekly rent)
  monthsAgo: number;
  adjustments: { label: string; amount: number }[];
  adjustedPrice: number;
  weight: number;           // normalised 0..1
  matchLevel: string;       // human readable explanation of how closely it matches
}

export interface Estimate {
  estimate: number;
  low: number;
  high: number;
  confidence: 'High' | 'Medium' | 'Low';
  comparables: Comparable[];
  searchNote: string;       // how far the comparable search had to widen
  kind: 'sale' | 'rent';
}

export interface SubjectProperty {
  id?: string;
  type: PropertyType;
  suburb: string;
  beds: number;
  baths: number;
  cars: number;
  land?: number;
  floor: number;
}
