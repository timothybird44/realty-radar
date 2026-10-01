import { useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import Footer from './components/footer';
import Header from './components/Header';
import Estimate from './components/pages/Estimate';
import Homepage from './components/pages/Homepage';
import HowItWorks from './components/pages/HowItWorks';
import Property from './components/pages/Property';
import Search from './components/pages/Search';
import Suburbs from './components/pages/Suburbs';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <main className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
      <h1>Page not found</h1>
      <p><Link to="/">Back to RealtyRadar</Link></p>
    </main>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/search" element={<Search />} />
        <Route path="/property/:id" element={<Property />} />
        <Route path="/estimate" element={<Estimate />} />
        <Route path="/suburbs" element={<Suburbs />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}
