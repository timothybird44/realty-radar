import type { Comparable } from './data/types';
import { moneyShort } from './data/format';

/* Lightweight SVG charts (no chart library). */

const fmtMoney = (rent: boolean) => (n: number) => (rent ? `$${Math.round(n)}` : moneyShort(n));

function niceTicks(min: number, max: number, count = 4): number[] {
  const span = max - min || 1;
  const step0 = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= step0) ?? step0;
  const start = Math.ceil(min / step) * step;
  const out: number[] = [];
  for (let v = start; v <= max + 1e-9; v += step) out.push(v);
  return out;
}

// ---------- Range bar: estimate range with asking price marker ----------
export function RangeBar({ low, high, estimate, asking, rent = false }: { low: number; high: number; estimate: number; asking?: number; rent?: boolean }) {
  const fmt = fmtMoney(rent);
  const lo = Math.min(low, asking ?? low) * 0.97;
  const hi = Math.max(high, asking ?? high) * 1.03;
  const x = (v: number) => ((v - lo) / (hi - lo)) * 100;
  return (
    <div className="rangebar">
      <div className="rangebar__track">
        <div className="rangebar__band" style={{ left: `${x(low)}%`, width: `${x(high) - x(low)}%` }} />
        <div className="rangebar__est" style={{ left: `${x(estimate)}%` }} title={`Estimate ${fmt(estimate)}`} />
        {asking !== undefined && (
          <div className="rangebar__ask" style={{ left: `${x(asking)}%` }} title={`Advertised ${fmt(asking)}`}>
            <span>{rent ? 'Asking' : 'Advertised'} {fmt(asking)}</span>
          </div>
        )}
      </div>
      <div className="rangebar__labels">
        <span style={{ left: `${x(low)}%` }}>{fmt(low)}</span>
        <span style={{ left: `${x(high)}%` }}>{fmt(high)}</span>
      </div>
    </div>
  );
}

// ---------- Scatter: comparables (size vs adjusted price) ----------
export function CompScatter({ comps, subjectSize, estimate, low, high, sizeLabel, rent = false, highlight, onHover }: {
  comps: Comparable[]; subjectSize: number; estimate: number; low: number; high: number; sizeLabel: string; rent?: boolean;
  highlight?: string; onHover?: (id?: string) => void;
}) {
  const fmt = fmtMoney(rent);
  const W = 560, H = 280, L = 64, R = 16, T = 16, B = 40;
  const sizes = [...comps.map(c => (c.property.type === 'Apartment' ? c.property.floor : c.property.land ?? c.property.floor)), subjectSize];
  const prices = [...comps.flatMap(c => [c.adjustedPrice, c.basePrice]), low, high];
  const xMin = Math.min(...sizes) * 0.9, xMax = Math.max(...sizes) * 1.1;
  const yMin = Math.min(...prices) * 0.95, yMax = Math.max(...prices) * 1.05;
  const x = (v: number) => L + ((v - xMin) / (xMax - xMin)) * (W - L - R);
  const y = (v: number) => T + (1 - (v - yMin) / (yMax - yMin)) * (H - T - B);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Comparable properties plotted by size and adjusted price">
      {niceTicks(yMin, yMax).map(t => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#e6ebf3" />
          <text x={L - 8} y={y(t) + 4} textAnchor="end" className="chart__tick">{fmt(t)}</text>
        </g>
      ))}
      {niceTicks(xMin, xMax, 5).map(t => (
        <text key={t} x={x(t)} y={H - B + 18} textAnchor="middle" className="chart__tick">{Math.round(t)}</text>
      ))}
      <text x={(L + W - R) / 2} y={H - 4} textAnchor="middle" className="chart__axis">{sizeLabel} (m²)</text>

      {/* estimate band */}
      <rect x={L} width={W - L - R} y={y(high)} height={y(low) - y(high)} fill="#1a56db" opacity=".07" />
      <line x1={L} x2={W - R} y1={y(estimate)} y2={y(estimate)} stroke="#1a56db" strokeDasharray="4 4" opacity=".5" />

      {comps.map(c => {
        const s = c.property.type === 'Apartment' ? c.property.floor : c.property.land ?? c.property.floor;
        const hl = highlight === c.property.id;
        return (
          <g key={c.property.id} onMouseEnter={() => onHover?.(c.property.id)} onMouseLeave={() => onHover?.(undefined)} style={{ cursor: 'default' }}>
            <line x1={x(s)} x2={x(s)} y1={y(c.basePrice)} y2={y(c.adjustedPrice)} stroke="#94a3b8" strokeDasharray="2 3" />
            <circle cx={x(s)} cy={y(c.basePrice)} r={3.5} fill="#cbd5e1" />
            <circle cx={x(s)} cy={y(c.adjustedPrice)} r={5 + c.weight * 14} fill="#1a56db" opacity={hl ? 0.95 : 0.55} stroke={hl ? '#0f2350' : '#fff'} strokeWidth={2} />
            <title>{`${c.property.address}, ${c.property.suburb}\n${rent ? 'Rent' : 'Sold'} ${fmt(c.basePrice)} → adjusted ${fmt(c.adjustedPrice)}`}</title>
          </g>
        );
      })}

      {/* subject */}
      <line x1={x(subjectSize)} x2={x(subjectSize)} y1={y(high)} y2={y(low)} stroke="#f59e0b" strokeWidth={3} strokeLinecap="round" />
      <rect x={x(subjectSize) - 7} y={y(estimate) - 7} width={14} height={14} fill="#f59e0b" stroke="#fff" strokeWidth={2} transform={`rotate(45 ${x(subjectSize)} ${y(estimate)})`} />
    </svg>
  );
}

// ---------- Trend line ----------
export function TrendChart({ data, rent = false }: { data: { month: string; value: number }[]; rent?: boolean }) {
  const fmt = fmtMoney(rent);
  const W = 560, H = 220, L = 60, R = 16, T = 16, B = 30;
  const vals = data.map(d => d.value);
  const yMin = Math.min(...vals) * 0.97, yMax = Math.max(...vals) * 1.02;
  const x = (i: number) => L + (i / (data.length - 1)) * (W - L - R);
  const y = (v: number) => T + (1 - (v - yMin) / (yMax - yMin)) * (H - T - B);
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ');
  const area = `${line} L${x(data.length - 1)},${H - B} L${x(0)},${H - B} Z`;
  const last = data[data.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Median price over the last 24 months">
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a56db" stopOpacity=".22" /><stop offset="1" stopColor="#1a56db" stopOpacity="0" /></linearGradient>
      </defs>
      {niceTicks(yMin, yMax, 3).map(t => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#e6ebf3" />
          <text x={L - 8} y={y(t) + 4} textAnchor="end" className="chart__tick">{fmt(t)}</text>
        </g>
      ))}
      {data.map((d, i) => (i % 6 === 0 || i === data.length - 1) && (
        <text key={d.month} x={x(i)} y={H - 8} textAnchor={i === data.length - 1 ? 'end' : 'middle'} className="chart__tick">{d.month}</text>
      ))}
      <path d={area} fill="url(#trendFill)" />
      <path d={line} fill="none" stroke="#1a56db" strokeWidth={2.5} strokeLinejoin="round" />
      <circle cx={x(data.length - 1)} cy={y(last.value)} r={5} fill="#1a56db" stroke="#fff" strokeWidth={2} />
    </svg>
  );
}
