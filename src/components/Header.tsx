import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { MenuIcon, RadarLogo } from './Icons';

export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location]);

  const modeLink = (mode: string, label: string) => {
    const active = location.pathname === '/search' && new URLSearchParams(location.search).get('mode') === mode;
    return <Link to={`/search?mode=${mode}`} className={active ? 'active' : ''}>{label}</Link>;
  };

  return (
    <>
      <div className="rr-demo-banner"><strong>Demo site</strong> — every listing, agent and price here is fictional and generated for demonstration.</div>
      <header className={`rr-header${open ? ' is-open' : ''}`}>
        <div className="container rr-header__inner">
          <Link to="/" className="rr-logo"><RadarLogo /><span className="rr-logo__text">Realty<span>Radar</span></span></Link>
          <nav className="rr-nav">
            {modeLink('buy', 'Buy')}
            {modeLink('rent', 'Rent')}
            {modeLink('sold', 'Sold')}
            <NavLink to="/estimate">Estimate my property</NavLink>
            <NavLink to="/suburbs">Suburb insights</NavLink>
          </nav>
          <div className="rr-header__actions">
            <Link to="/estimate" className="btn btn--primary btn--sm">Get an estimate</Link>
          </div>
          <button className="rr-menu-btn" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(o => !o)}><MenuIcon /></button>
        </div>
      </header>
    </>
  );
}
