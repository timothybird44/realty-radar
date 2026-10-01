import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export const BedIcon = (p: P) => (<svg {...base} {...p}><path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 14h18M3 18v2M21 18v2M7 9V6h4v3" /></svg>);
export const BathIcon = (p: P) => (<svg {...base} {...p}><path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2zM6 12V5a2 2 0 0 1 3.4-1.4M7 19l-1 2M17 19l1 2" /></svg>);
export const CarIcon = (p: P) => (<svg {...base} {...p}><path d="M5 16V11l2-5h10l2 5v5M3 16h18v2H3zM7 11h10" /><circle cx="7.5" cy="13.5" r=".5" /><circle cx="16.5" cy="13.5" r=".5" /></svg>);
export const LandIcon = (p: P) => (<svg {...base} {...p}><path d="M4 4h16v16H4z" strokeDasharray="3 2" /><path d="M8 8h8v8H8z" /></svg>);
export const SearchIcon = (p: P) => (<svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>);
export const FilterIcon = (p: P) => (<svg {...base} {...p}><path d="M4 6h16M7 12h10M10 18h4" /></svg>);
export const CloseIcon = (p: P) => (<svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const HeartIcon = (p: P) => (<svg {...base} {...p}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>);
export const ChevronLeft = (p: P) => (<svg {...base} {...p}><path d="m15 18-6-6 6-6" /></svg>);
export const ChevronRight = (p: P) => (<svg {...base} {...p}><path d="m9 18 6-6-6-6" /></svg>);
export const MenuIcon = (p: P) => (<svg {...base} {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>);
export const CheckIcon = (p: P) => (<svg {...base} {...p}><path d="m5 12 5 5 9-10" /></svg>);
export const InfoIcon = (p: P) => (<svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>);
export const TrendIcon = (p: P) => (<svg {...base} {...p}><path d="m3 17 6-6 4 4 8-8M15 7h6v6" /></svg>);
export const PinIcon = (p: P) => (<svg {...base} {...p}><path d="M12 21s7-6.3 7-12a7 7 0 0 0-14 0c0 5.7 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>);
export const CalendarIcon = (p: P) => (<svg {...base} {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>);
export const PhotoIcon = (p: P) => (<svg {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-8 8" /></svg>);

/** RealtyRadar logo mark: radar sweep over a house roofline */
export const RadarLogo = (p: P) => (
  <svg viewBox="0 0 32 32" {...p}>
    <circle cx="16" cy="16" r="15" fill="#1a56db" />
    <circle cx="16" cy="16" r="10.5" fill="none" stroke="#9ec5ff" strokeWidth="1.2" opacity=".7" />
    <circle cx="16" cy="16" r="6" fill="none" stroke="#9ec5ff" strokeWidth="1.2" opacity=".7" />
    <path d="M16 16 L16 1 A15 15 0 0 1 29 8.5 Z" fill="#38bdf8" opacity=".55" />
    <path d="M9.5 18.5 16 13l6.5 5.5v5h-13z" fill="#fff" />
    <rect x="14.6" y="20" width="2.8" height="3.5" fill="#1a56db" />
  </svg>
);
