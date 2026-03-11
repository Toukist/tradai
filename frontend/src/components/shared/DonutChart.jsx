export default function DonutChart({ items = [], size = 110 }) {
  const total = items.reduce((sum, item) => sum + (Number(item.value) || 0), 0) || 1;
  let current = 0;
  const gradient = items
    .map((item) => {
      const value = Number(item.value) || 0;
      const start = (current / total) * 100;
      current += value;
      const end = (current / total) * 100;
      return `${item.color} ${start}% ${end}%`;
    })
    .join(', ');

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="grid place-items-center rounded-full border border-white/10"
        style={{
          width: size,
          height: size,
          background: `conic-gradient(${gradient || '#1E293B 0% 100%'})`,
        }}
      >
        <div
          className="grid place-items-center rounded-full bg-[#0D0F14] text-xs font-semibold text-white"
          style={{ width: size * 0.62, height: size * 0.62 }}
        >
          {total}
        </div>
      </div>
      <div className="space-y-1 text-xs text-[#7A7F89]">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
