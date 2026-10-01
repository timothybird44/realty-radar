# RealtyRadar

A property search site in the spirit of realestate.com.au (buy, rent and sold search with filters and
detailed listing pages), with one key difference: **every listing comes with a transparent estimate**
built from comparable properties.

> This is a demo rebuild. All listings, agents, prices and photos are fictional and generated in the
> browser from a fixed seed, so every visitor sees the same data.

## Features

- **Search:** buy, rent or sold, across multiple suburbs at once (suburb or postcode autocomplete with keyboard support).
- **Filters:** property type, price range, bedrooms, bathrooms, car spaces and land size, with a live result count.
  Active filters show as removable chips, and every search lives in the URL so it can be shared.
- **Sorting:** featured, newest, price, and **best value vs estimate**.
- **Listing pages:** gallery with lightbox, features, inspections, description, agent enquiry card and similar properties.
- **RealtyRadar estimate** on every listing, including ones advertised as "Auction" or "Contact agent":
  - a likely range and a confidence rating
  - how the advertised price compares with the estimate
  - the comparable properties used, each with a line-by-line breakdown of its adjustments
  - a scatter chart showing where the property sits among its comparables
  - suburb stats (median, growth, rent, yield, days on market) and a 24-month price trend
- **Estimate my property:** enter a suburb, type, beds, baths, cars and land size to get a live sale or rent estimate.
- **Suburb insights:** sortable table of all suburbs with trend charts.

## How the estimate works

`src/components/data/estimate.ts`

1. **Find comparables.** Start with the tightest match: same suburb, same property type and the same number of
   bedrooms, bathrooms and car spaces. Only if there are fewer than six matches does the search widen, one step at a time:
   similar baths and cars, then ±1 bedroom, then neighbouring suburbs.
2. **Adjust each comparable** to match the subject property:
   - market movement since the sale, using the suburb's growth rate
   - land size (or floor area for apartments), priced at the suburb's rate per m²
   - differences in bedrooms, bathrooms and car spaces
   - the difference in suburb medians, for comparables from a neighbouring suburb
3. **Weight by similarity.** Closer matches (fewer differences, similar size, recent sale, same suburb) count for more.
   The estimate is the weighted average, the range comes from the weighted spread, and confidence reflects how many
   close matches there were and how well they agree.

On the generated dataset, the estimate is within **4.2%** of each listing's hidden "true" value (median error),
and the true value falls inside the stated range about 82% of the time.

## Project structure

```
src/
  components/
    data/          generate.ts (seeded demo data), estimate.ts, api.tsx (query functions),
                   suburbs.ts, query.ts (URL <-> filters), format.ts, types.ts
    pages/         Homepage, Search, Property, Estimate, Suburbs, HowItWorks
    styles/        Variables.css (blue theme), Global.css and per-component styles
    Searchbar.tsx  Filters.tsx  PropertyCard.tsx  PropertyImage.tsx (SVG illustrations)
    InsightPanel.tsx  Charts.tsx (SVG charts)  Header.tsx  footer.tsx
```

The original version scraped agency listings into a SQLite database. This demo replaces that with a
deterministic generator (`generate.ts`) behind the same kind of `api.tsx` query layer.

## Running locally

```bash
npm install
npm run dev      # development server
npm run build    # production build to dist/
```

The build uses relative paths and `HashRouter`, so `dist/` can be served from any static host or subfolder
without server rewrites.

## Tech

React 18 · TypeScript · Vite · React Router · plain CSS · hand-rolled SVG charts and illustrations (no UI or chart libraries).

## How it was built: an AI-assisted implementation

This version of RealtyRadar was rebuilt with an AI coding assistant (Claude Code), after the original
project files were lost. I treated the assistant as an implementation partner, not an autocomplete:
I owned the requirements, scope decisions and sign-off, and the assistant planned, wrote, tested and
iterated on the code under that direction. The process followed the same stages I'd use on a client
implementation: discovery, design, build, test and refine.

### 1. Discovery: working from what survived

Only the original folder structure and file names were left: React components (`Searchbar`, `Filters`,
`footer`, `pages/Homepage`, `pages/Search`), a `data/api.tsx` layer, a SQLite database, per-component
CSS with a `Variables.css` theme, and a separate `webscraping/` project with a Ray White agency module.
Together with my brief, these became the requirements:

- a blue-themed site with a layout and functionality close to realestate.com.au, including search and filters
- the differentiating feature: deeper insight into each property and a more accurate estimate, built from
  properties in the same area with the same size, beds, baths and car spaces
- a self-contained demo with dummy properties and data

### 2. Planning and challenging the design

Before writing any UI, the assistant drafted a plan and we worked through the open design questions, each
with a recorded decision:

| Question | Decision |
|---|---|
| Recreate the original stack exactly? | Keep the original **file layout and component names**, but move from Create React App (no longer maintained) to **Vite + TypeScript**. |
| Rebuild the agency scraper? | **No.** Its behaviour couldn't be recovered from file names, and a public demo shouldn't scrape a real agency. A **seeded data generator** replaces the scraper and database behind the same `api.tsx` query layer. |
| How should demo data behave? | **Deterministic** (fixed seed), so every visitor and every test sees the same listings, and realistic: suburb medians, growth rates, rents, mixes of property types and lot sizes, and varied advertising styles ("Offers over", ranges, "Auction", "Contact agent"). |
| How do we stop the estimate from being a black box? | Use **comparable sales, explicit adjustments and similarity weighting**, and show every comparable and every adjustment in the UI. |
| What happens when exact matches are scarce? | **Widen in stages** (similar baths and cars → ±1 bedroom → neighbouring suburbs) and tell the user how far the search had to go. |
| Property photos? | Seeded **SVG illustrations**, rather than hotlinked stock photos that could break or raise licensing questions. |
| Hosting on a static subdomain? | `HashRouter` and relative asset paths, so deep links work without server rewrites. |

### 3. Build: data and logic first, interface second

The build order was chosen so the core logic could be verified before any UI existed:

1. **Types and suburb profiles** (17 Brisbane suburbs with medians, rents, growth and neighbours)
2. **Seeded generator:** 260 sale listings, 180 rentals and 1,600 historical sales. Each property has a hidden
   "true" value, so the estimator can be scored objectively.
3. **Estimate engine:** tiered comparable search, adjustments, weighting, range and confidence
4. **Query layer:** search, filters, sorting, suburb stats and trends
5. **Interface:** search bar, filters, property cards, insight panel, SVG charts, then the pages
   (home, search, property, estimator, suburb insights, how it works)

### 4. Testing and evidence-based tuning

Each stage was checked with something measurable rather than by eye:

- **Accuracy harness.** A script ran the estimator over every listing and compared it with the hidden true values.
  The first run showed a **4.2% median error** (rentals 1.6%), but only **74%** of true values fell inside the
  stated range, and too many estimates were labelled "High confidence". The range floor was widened and the
  "High" criteria tightened, which lifted coverage to **82%** with the same accuracy. The confidence label now
  means what it says.
- **Static checks.** Strict TypeScript type-checking and a clean production build at every step.
- **Visual review.** Headless-browser screenshots at desktop and mobile widths for every key page.
- **Interaction tests.** A scripted browser session covered postcode autocomplete, applying filters (checking
  the live count against the results), removable filter chips, "best value" sorting, opening a listing, and the
  gallery's keyboard navigation, while watching for console errors (none).

### 5. Iterating on the details

The screenshot reviews drove a round of fixes:

- **Spacing:** global styles loaded after page styles and were overriding section spacing, so the stylesheet import order was fixed.
- **Logo:** the logo text rendered as "Realty Radar" instead of one word.
- **Mobile cards:** text on the estimate strip overflowed on narrow screens, so it now wraps.
- **Forms:** text areas didn't inherit the site font.
- **Card layout:** the property-type label wrapped awkwardly on compact cards.

Each fix was rebuilt and re-screenshotted to confirm it.

### What the AI did, and what I did

- **Me:** product direction and requirements, the original design and domain knowledge, scope calls (including dropping
  the scraper), reviewing results, and deciding what gets published.
- **The assistant:** turning the brief into a plan, surfacing the design questions above, writing the code and tests,
  measuring the estimator, and fixing what the reviews found.

The result is code I can explain line by line. The estimation logic, its trade-offs and its measured accuracy are documented above.
