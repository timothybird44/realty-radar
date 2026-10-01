import { Link } from 'react-router-dom';
import { RadarLogo } from './Icons';
import { SUBURBS } from './data/suburbs';

export default function Footer() {
  return (
    <footer className="rr-footer">
      <div className="container">
        <div className="rr-footer__grid">
          <div>
            <Link to="/" className="rr-logo"><RadarLogo /><span className="rr-logo__text">Realty<span>Radar</span></span></Link>
            <p style={{ maxWidth: 320, margin: 0 }}>
              Property search with deeper insight. Every listing comes with an estimate built from comparable
              properties with the same beds, baths and car spaces in the same area.
            </p>
          </div>
          <div>
            <h4>Search</h4>
            <ul>
              <li><Link to="/search?mode=buy">Buy</Link></li>
              <li><Link to="/search?mode=rent">Rent</Link></li>
              <li><Link to="/search?mode=sold">Sold</Link></li>
            </ul>
          </div>
          <div>
            <h4>Insights</h4>
            <ul>
              <li><Link to="/estimate">Estimate my property</Link></li>
              <li><Link to="/suburbs">Suburb insights</Link></li>
              <li><Link to="/how-it-works">How estimates work</Link></li>
            </ul>
          </div>
          <div>
            <h4>Popular suburbs</h4>
            <ul>
              {SUBURBS.slice(0, 5).map(s => <li key={s.name}><Link to={`/search?mode=buy&suburbs=${encodeURIComponent(s.name)}`}>{s.name}</Link></li>)}
            </ul>
          </div>
        </div>
        <div className="rr-footer__bottom">
          <span>© {new Date().getFullYear()} RealtyRadar · A portfolio demo by Timothy Bird</span>
          <span>All data is fictional. Estimates are illustrative and not financial advice.</span>
        </div>
      </div>
    </footer>
  );
}
