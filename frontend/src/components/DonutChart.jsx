const PALETTE = [
  '#C9A96E', '#6EC9A9', '#6EA9C9', '#C96E6E', '#A96EC9',
  '#C9C96E', '#6EC9C9', '#C96EA9', '#9EC96E', '#6E9EC9',
];

export default function DonutChart({ funds }) {
  const SIZE   = 180;
  const STROKE = 32;
  const R      = (SIZE - STROKE) / 2;
  const CIRC   = 2 * Math.PI * R;
  const cx     = SIZE / 2;
  const cy     = SIZE / 2;

  const validFunds = funds.filter((f) => parseFloat(f.pct) > 0);
  const total = validFunds.reduce((acc, f) => acc + parseFloat(f.pct || 0), 0);

  let offset = 0;
  const slices = validFunds.map((f, i) => {
    const pct   = parseFloat(f.pct) / 100;
    const dash  = CIRC * pct;
    const gap   = CIRC - dash;
    const startOffset = CIRC - offset;
    offset += dash;
    return { ...f, dash, gap, startOffset, color: PALETTE[i % PALETTE.length] };
  });

  const totalColor =
    total > 100 ? '#C96E6E' : total === 100 ? '#6EC9A9' : '#C9A96E';

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* Donut SVG */}
      <div className="relative flex-shrink-0">
        <svg width={SIZE} height={SIZE}>
          {/* Background circle */}
          <circle
            cx={cx} cy={cy} r={R}
            fill="none"
            stroke="#ffffff10"
            strokeWidth={STROKE}
          />
          {slices.map((slice, i) => (
            <circle
              key={i}
              cx={cx} cy={cy} r={R}
              fill="none"
              stroke={slice.color}
              strokeWidth={STROKE}
              strokeDasharray={`${slice.dash} ${slice.gap}`}
              strokeDashoffset={slice.startOffset}
              style={{ transition: 'stroke-dasharray 0.4s ease' }}
            />
          ))}
        </svg>
        {/* Center label */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        >
          <span className="text-2xl font-bold" style={{ color: totalColor }}>
            {Math.round(total)}%
          </span>
          <span className="text-xs text-gray-500">alloué</span>
        </div>
      </div>

      {/* Legend */}
      <ul className="flex flex-col gap-1.5 text-sm text-gray-300">
        {slices.map((slice, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: slice.color }} />
            <span className="truncate max-w-[160px]">{slice.name || `Fonds ${i + 1}`}</span>
            <span className="ml-auto pl-4 font-mono text-xs" style={{ color: slice.color }}>
              {slice.pct}%
            </span>
          </li>
        ))}
        {validFunds.length === 0 && (
          <li className="text-gray-600 italic">Aucun fonds saisi</li>
        )}
      </ul>
    </div>
  );
}
