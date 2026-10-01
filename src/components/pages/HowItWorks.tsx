import { Link } from 'react-router-dom';
import { BUY, RENT, SOLD } from '../data/generate';
import { SUBURBS } from '../data/suburbs';
import '../styles/Pages.css';

const STEPS = [
  {
    t: 'Start with true like-for-like matches',
    d: 'We look for recent sales (or rentals) of the same property type in the same suburb with exactly the same number of bedrooms, bathrooms and car spaces.',
  },
  {
    t: 'Widen the search only when needed',
    d: 'If there aren’t at least six good matches, the search widens step by step: similar bathrooms and car spaces, then ±1 bedroom, then neighbouring suburbs. The estimate tells you how far it had to go.',
  },
  {
    t: 'Adjust every comparable to match',
    d: 'Each sale is brought up to today’s market using the suburb’s growth rate, then adjusted for differences in land size (or floor area for apartments), bedrooms, bathrooms and car spaces. Neighbouring-suburb sales are also scaled by the difference in suburb medians.',
  },
  {
    t: 'Weight by similarity',
    d: 'Closer matches count for more. A sale in the same suburb with identical features and a similar block, sold recently, carries far more weight than one that needed big adjustments.',
  },
  {
    t: 'Show the range and the confidence',
    d: 'The estimate is the weighted average of the adjusted prices. The range reflects how much the comparables disagree, and confidence depends on how many close matches there were and how tightly they agree.',
  },
];

export default function HowItWorks() {
  return (
    <main className="container page page--narrow">
      <header className="page-head">
        <h1>How RealtyRadar estimates work</h1>
        <p>
          Automated valuations are often a black box. RealtyRadar’s are built from comparable properties you can inspect,
          with every adjustment shown on the listing.
        </p>
      </header>
      <ol className="how-steps">
        {STEPS.map(s => <li key={s.t}><h2>{s.t}</h2><p>{s.d}</p></li>)}
      </ol>
      <div className="how-note card">
        <h2>About this demo</h2>
        <p>
          The original RealtyRadar scraped real listings from agency websites into a SQLite database. This demo rebuilds the
          site with fictional, generated data: {BUY.length} homes for sale, {RENT.length} rentals and {SOLD.length.toLocaleString('en-AU')} past sales across {SUBURBS.length} Brisbane suburbs.
          The same estimate logic runs in your browser.
        </p>
        <div className="how-note__links">
          <Link className="btn btn--primary" to="/estimate">Try the estimator</Link>
          <Link className="btn btn--outline" to="/search?mode=buy&sort=value">See best-value listings</Link>
        </div>
      </div>
    </main>
  );
}
