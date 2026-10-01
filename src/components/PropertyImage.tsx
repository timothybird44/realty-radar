import type { ReactElement } from 'react';
import type { Property } from './data/types';

/**
 * Illustrated property "photos" drawn as SVG and seeded per listing, so every demo listing
 * gets its own consistent look without relying on external stock images.
 */

export type View = 'front' | 'living' | 'kitchen' | 'bedroom' | 'outdoor';

export function viewsFor(p: Property): View[] {
  return p.type === 'Apartment' ? ['front', 'living', 'kitchen', 'bedroom'] : ['front', 'living', 'kitchen', 'bedroom', 'outdoor'];
}

export const VIEW_LABEL: Record<View, string> = {
  front: 'Exterior', living: 'Living', kitchen: 'Kitchen', bedroom: 'Main bedroom', outdoor: 'Outdoor',
};

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

const WALLS = ['#f4f1ea', '#e9e4d8', '#dfe5ea', '#c9ccd1', '#b86b52', '#8f5a45', '#f7f7f5', '#dcd3c3', '#394a5c', '#6d7f73'];
const ROOFS = ['#3b3f46', '#555b64', '#9aa3ad', '#8c3b2a', '#2f3a47', '#6b4f3a'];
const TRIMS = ['#ffffff', '#f5f0e6', '#2b3440', '#1f2937'];
const ACCENTS = ['#1a56db', '#0e7490', '#b45309', '#15803d', '#9d174d', '#4338ca', '#334155'];
const SKIES: [string, string][] = [['#8ec5ff', '#e6f2ff'], ['#7fb2f0', '#dcecff'], ['#a3c9f5', '#fdf2e0'], ['#6fa8e8', '#cfe4fb']];

export default function PropertyImage({ property, view = 'front', className }: { property: Property; view?: View; className?: string }) {
  const r = seeded(property.imageSeed + view.length * 7919);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const wall = pick(WALLS), roof = pick(ROOFS), trim = pick(TRIMS), accent = pick(ACCENTS);
  const [skyTop, skyBottom] = pick(SKIES);
  const id = `g${property.id}${view}`;
  const hasPool = property.features.includes('Pool');

  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className={className} role="img"
      aria-label={`${VIEW_LABEL[view]} of ${property.address}, ${property.suburb} (illustration)`}>
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={skyTop} /><stop offset="1" stopColor={skyBottom} /></linearGradient>
        <linearGradient id={`${id}glass`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#bfe0ff" /><stop offset="1" stopColor="#6b9fd6" /></linearGradient>
        <linearGradient id={`${id}floor`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c8a27a" /><stop offset="1" stopColor="#a47d57" /></linearGradient>
      </defs>
      {view === 'front' && <Front />}
      {view === 'outdoor' && <Outdoor />}
      {(view === 'living' || view === 'kitchen' || view === 'bedroom') && <Interior />}
    </svg>
  );

  function Tree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
    const g = pick(['#3f8f4f', '#4c9a5b', '#2f7a44', '#5aa36a']);
    return (<g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-4" y="0" width="8" height="40" fill="#7a5a3c" />
      <circle cx="0" cy="-8" r="26" fill={g} /><circle cx="-18" cy="6" r="18" fill={g} /><circle cx="18" cy="4" r="20" fill={g} opacity=".9" />
    </g>);
  }

  function Front() {
    const ground = 232;
    const els: ReactElement[] = [];
    if (property.type === 'Apartment') {
      const floors = 5 + Math.floor(r() * 5);
      const fh = 24, w = 170, x = 115, top = ground - floors * fh;
      els.push(<rect key="b" x={x} y={top} width={w} height={floors * fh} fill={wall} />);
      els.push(<rect key="c" x={x - 4} y={top - 8} width={w + 8} height={10} fill={roof} />);
      for (let f = 0; f < floors; f++) {
        const y = top + f * fh;
        for (let c = 0; c < 4; c++) {
          els.push(<rect key={`w${f}${c}`} x={x + 10 + c * 40} y={y + 5} width={30} height={14} fill={`url(#${id}glass)`} />);
        }
        els.push(<rect key={`bal${f}`} x={x - 6} y={y + 17} width={w + 12} height={3} fill={trim} opacity=".9" />);
      }
      els.push(<rect key="lobby" x={x + 65} y={ground - 26} width={40} height={26} fill={`url(#${id}glass)`} stroke={trim} strokeWidth="2" />);
      els.push(<rect key="n1" x={40} y={ground - 90} width={60} height={90} fill="#d7dde6" />);
      els.push(<rect key="n2" x={300} y={ground - 120} width={70} height={120} fill="#cfd6e0" />);
    } else if (property.type === 'Townhouse') {
      const units = 3, uw = 90, x0 = 65, h = 110;
      for (let u = 0; u < units; u++) {
        const x = x0 + u * uw;
        const shade = u === 1 ? wall : u === 0 ? '#e8e3d8' : '#d9dde3';
        els.push(<rect key={`u${u}`} x={x} y={ground - h} width={uw} height={h} fill={shade} stroke="#00000010" />);
        els.push(<polygon key={`r${u}`} points={`${x - 3},${ground - h} ${x + uw + 3},${ground - h} ${x + uw + 3},${ground - h - 16} ${x - 3},${ground - h - 6}`} fill={roof} />);
        els.push(<rect key={`wa${u}`} x={x + 14} y={ground - h + 16} width={62} height={30} fill={`url(#${id}glass)`} stroke={trim} strokeWidth="3" />);
        els.push(<rect key={`g${u}`} x={x + 10} y={ground - 46} width={44} height={46} fill={trim === '#ffffff' ? '#e5e7eb' : '#cbd5e1'} />);
        els.push(<rect key={`d${u}`} x={x + 62} y={ground - 42} width={18} height={42} fill={u === 1 ? accent : '#475569'} />);
      }
    } else {
      const twoStorey = property.beds >= 4 && r() < 0.55;
      const w = 200 + Math.floor(r() * 40), x = 200 - w / 2 - 20, h = twoStorey ? 120 : 72;
      const roofStyle = pick(['gable', 'hip', 'skillion']);
      const top = ground - h;
      // body
      els.push(<rect key="body" x={x} y={top} width={w} height={h} fill={wall} />);
      if (property.yearBuilt < 1950) { // Queenslander: raised with verandah
        els.push(<rect key="ver" x={x} y={top + h - 30} width={w} height={6} fill={trim} />);
        for (let i = 0; i < 8; i++) els.push(<rect key={`post${i}`} x={x + 6 + i * (w - 12) / 7} y={top + h - 30} width={3} height={30} fill={trim} />);
      }
      // roof
      if (roofStyle === 'gable') els.push(<polygon key="roof" points={`${x - 12},${top} ${x + w / 2},${top - 52} ${x + w + 12},${top}`} fill={roof} />);
      else if (roofStyle === 'hip') els.push(<polygon key="roof" points={`${x - 12},${top} ${x + 40},${top - 40} ${x + w - 40},${top - 40} ${x + w + 12},${top}`} fill={roof} />);
      else els.push(<polygon key="roof" points={`${x - 12},${top} ${x + w + 12},${top - 26} ${x + w + 12},${top - 16} ${x - 12},${top + 8}`} fill={roof} />);
      // windows
      const rows = twoStorey ? 2 : 1;
      for (let row = 0; row < rows; row++) {
        const wy = top + 14 + row * 56;
        for (let c = 0; c < 3; c++) {
          if (row === rows - 1 && c === 1) continue;
          els.push(<rect key={`win${row}${c}`} x={x + 18 + c * (w - 60) / 2} y={wy} width={34} height={26} fill={`url(#${id}glass)`} stroke={trim} strokeWidth="3" />);
        }
      }
      els.push(<rect key="door" x={x + w / 2 - 12} y={ground - 40} width={24} height={40} fill={accent} />);
      els.push(<circle key="knob" cx={x + w / 2 + 7} cy={ground - 20} r="1.8" fill="#f8d77a" />);
      if (property.cars >= 2) {
        els.push(<rect key="garage" x={x + w} y={ground - 50} width={58} height={50} fill={wall} />);
        els.push(<polygon key="groof" points={`${x + w},${ground - 50} ${x + w + 64},${ground - 50} ${x + w + 58},${ground - 58} ${x + w},${ground - 58}`} fill={roof} />);
        els.push(<rect key="gdoor" x={x + w + 6} y={ground - 40} width={46} height={40} fill="#d1d5db" />);
        for (let i = 1; i < 5; i++) els.push(<line key={`gl${i}`} x1={x + w + 6} x2={x + w + 52} y1={ground - 40 + i * 8} y2={ground - 40 + i * 8} stroke="#9ca3af" />);
      }
    }
    return (
      <g>
        <rect width="400" height="300" fill={`url(#${id}sky)`} />
        <circle cx={60 + r() * 280} cy={40 + r() * 20} r="22" fill="#fff6cf" opacity=".8" />
        <ellipse cx={80 + r() * 100} cy="60" rx="40" ry="10" fill="#fff" opacity=".7" />
        <ellipse cx={250 + r() * 100} cy="45" rx="50" ry="12" fill="#fff" opacity=".6" />
        <rect y={ground} width="400" height={300 - ground} fill="#79b86b" />
        <rect y={ground} width="400" height="6" fill="#6aa65d" />
        {property.type !== 'Apartment' && <polygon points={`185,${ground} 215,${ground} 250,300 150,300`} fill="#c9c3b6" />}
        {r() < 0.7 && <Tree x={30 + r() * 20} y={ground - 40} s={0.9 + r() * 0.4} />}
        {els}
        {r() < 0.6 && <Tree x={350 + r() * 30} y={ground - 36} s={0.8 + r() * 0.4} />}
        {property.type === 'House' && <g>{Array.from({ length: 20 }, (_, i) => <rect key={i} x={i * 20 + 2} y={ground + 20} width="4" height="22" fill={trim === '#2b3440' ? '#e5e7eb' : '#fff'} opacity=".85" />)}<rect y={ground + 24} width="400" height="3" fill="#fff" opacity=".85" /></g>}
      </g>
    );
  }

  function Interior() {
    const wallTone = pick(['#f3efe8', '#eef1f4', '#f6f3ee', '#e9eef2']);
    const fabric = pick(['#4b5d73', '#8a9a7b', '#c5b39a', '#3f4d63', '#a3786a', '#6b7f99']);
    return (
      <g>
        <rect width="400" height="300" fill={wallTone} />
        <polygon points="0,215 400,215 400,300 0,300" fill={`url(#${id}floor)`} />
        {Array.from({ length: 10 }, (_, i) => <line key={i} x1={i * 44} y1="215" x2={i * 44 - 40} y2="300" stroke="#8d6a48" strokeWidth=".8" opacity=".5" />)}
        {/* window */}
        <rect x="235" y="45" width="130" height="120" fill={`url(#${id}sky)`} stroke="#fff" strokeWidth="6" />
        <line x1="300" y1="45" x2="300" y2="165" stroke="#fff" strokeWidth="4" />
        <Tree x={265} y={130} s={0.6} />
        {view === 'living' && <g>
          <rect x="60" y="178" width="170" height="42" rx="10" fill={fabric} />
          <rect x="60" y="150" width="170" height="36" rx="10" fill={fabric} opacity=".85" />
          <rect x="52" y="160" width="18" height="60" rx="8" fill={fabric} /><rect x="220" y="160" width="18" height="60" rx="8" fill={fabric} />
          <rect x="85" y="165" width="30" height="20" rx="6" fill="#fff" opacity=".7" /><rect x="170" y="165" width="30" height="20" rx="6" fill={accent} opacity=".6" />
          <ellipse cx="150" cy="255" rx="110" ry="18" fill="#e7e1d6" />
          <rect x="120" y="232" width="70" height="8" rx="3" fill="#6b4f3a" />
          <rect x="70" y="60" width="90" height="60" fill={accent} opacity=".25" stroke="#fff" strokeWidth="4" />
          <rect x="340" y="175" width="22" height="40" fill="#fff" /><circle cx="351" cy="160" r="20" fill="#4c9a5b" />
        </g>}
        {view === 'kitchen' && <g>
          <rect x="0" y="120" width="220" height="50" fill={pick(['#ffffff', '#e5e7eb', '#1f2937', '#9fb1c4'])} />
          <rect x="0" y="100" width="220" height="20" fill="#dfe3e8" />
          {[0, 1, 2, 3].map(i => <rect key={i} x={10 + i * 52} y="30" width="46" height="60" fill="#fff" stroke="#d1d5db" />)}
          <rect x="60" y="195" width="220" height="16" fill="#f2f2f0" />
          <rect x="66" y="211" width="208" height="50" fill={pick(['#2f3a47', '#ffffff', '#c7b299', '#415a4c'])} />
          {[0, 1, 2].map(i => <g key={i}><line x1={110 + i * 60} y1="0" x2={110 + i * 60} y2="120" stroke="#374151" /><path d={`M${98 + i * 60} 120 h24 l-4 -12 h-16z`} fill={accent} /></g>)}
          {[0, 1, 2].map(i => <rect key={i} x={95 + i * 55} y="262" width="6" height="30" fill="#374151" />)}
        </g>}
        {view === 'bedroom' && <g>
          <rect x="70" y="120" width="170" height="60" rx="6" fill="#6b4f3a" />
          <rect x="60" y="175" width="190" height="55" rx="8" fill="#fff" />
          <rect x="60" y="195" width="190" height="40" rx="6" fill={fabric} />
          <rect x="80" y="160" width="60" height="22" rx="8" fill="#f3f4f6" /><rect x="170" y="160" width="60" height="22" rx="8" fill="#f3f4f6" />
          <rect x="20" y="180" width="32" height="40" fill="#d6c7b2" /><rect x="258" y="180" width="32" height="40" fill="#d6c7b2" />
          <circle cx="36" cy="168" r="10" fill="#fde68a" /><circle cx="274" cy="168" r="10" fill="#fde68a" />
          <rect x="105" y="55" width="100" height="50" fill={accent} opacity=".3" stroke="#fff" strokeWidth="4" />
        </g>}
      </g>
    );
  }

  function Outdoor() {
    return (
      <g>
        <rect width="400" height="300" fill={`url(#${id}sky)`} />
        <rect y="150" width="400" height="150" fill="#7fbf6f" />
        <Tree x={60} y={110} s={1.2} /><Tree x={330} y={115} s={1} />
        <rect x="0" y="120" width="400" height="30" fill="#e5dccb" />
        {Array.from({ length: 26 }, (_, i) => <rect key={i} x={i * 16} y="112" width="12" height="40" fill="#c4a782" />)}
        <polygon points="0,300 0,215 220,215 260,300" fill="#b08968" />
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1="0" x2="240" y1={222 + i * 9} y2={222 + i * 9} stroke="#8d6a48" />)}
        <rect x="40" y="200" width="70" height="8" fill="#5b4636" /><rect x="50" y="208" width="4" height="22" fill="#5b4636" /><rect x="96" y="208" width="4" height="22" fill="#5b4636" />
        <rect x="130" y="190" width="34" height="30" fill="#374151" /><rect x="128" y="186" width="38" height="6" fill="#1f2937" />
        {hasPool
          ? <g><rect x="250" y="190" width="140" height="70" rx="6" fill="#e5e7eb" /><rect x="258" y="197" width="124" height="56" rx="4" fill="#38bdf8" /><path d="M265 215 q10 -6 20 0 t20 0 t20 0 t20 0 t20 0" stroke="#e0f2fe" fill="none" strokeWidth="2" /></g>
          : <g><ellipse cx="320" cy="230" rx="60" ry="14" fill="#6aa65d" /><rect x="296" y="200" width="6" height="30" fill="#7a5a3c" /><circle cx="299" cy="195" r="16" fill="#f472b6" opacity=".7" /></g>}
      </g>
    );
  }
}
